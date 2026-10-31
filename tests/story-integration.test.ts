import { describe, expect, it } from 'vitest';
import { applyAction, GAME_LIMITS } from '../src/core/game';
import { decodeSave, encodeSave } from '../src/core/save';
import { storyScore } from '../src/core/story';
import { storyPatientForId } from '../src/core/story-patients';
import { paperDescription } from '../src/render/paperwork';
import { newspaperPageCount } from '../src/render/newspaper';
import { translations } from '../src/i18n';
import { playStoryRoute, act, completeAppointment, admitPatient } from './fixtures/story-route';

const expected = { party:['party-continue',14,-7,2,0,0,0], union:['union-continue',-9,18,10,0,0,0], independent:['independent-continue',7,2,4,0,0,0],
  detained:['detained',-18,30,16,5,0,3], audit:['clinic-closed',16,-8,5,6,0,2], exposed:['exposed',26,-23,0,4,0,0], chaos:['clinic-closed',6,-9,8,1,2,0] } as const;

describe('chapter one through real cabinet transitions', () => {
  it.each(Object.entries(expected))('%s route delivers decisions, frozen media, six reachable epilogues and portable saves', (route, result) => {
    const state = playStoryRoute(route, value => {
      try { return decodeSave(encodeSave(value)); } catch (error) { throw new Error(`Round-trip day=${value.day}, phase=${value.phase}, visit=${value.visit?.patientId}, completed=${value.shiftCompleted}: ${String(error)}`, { cause:error }); }
    });
    expect(state.ending).toBeNull(); expect(state.phase).toBe('epilogue');
    const score = storyScore(state.story);
    expect([state.story.resolution!.endingId,score.partyTrust,score.unionTrust,score.securitySuspicion,score.negligence,score.inconsistency,score.oppositionCases]).toEqual(result);
    expect(state.day).toBe(36);
    expect(state.settlement!.day).toBe(route === 'exposed' ? 35 : 36);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    if (state.story.resolution!.terminal) expect(applyAction(state,'continue-story').state).toBe(state);
    else {
      const continued = applyAction(state,'continue-story').state;
      expect(continued).toMatchObject({ day:37, phase:'cabinet', money:state.money, story:{ mode:'resolved', resolution:{presented:true} } });
      expect(continued.papers).toEqual(state.papers);
      expect(decodeSave(encodeSave(continued))).toEqual(continued);
      expect(applyAction(continued,'continue-story').state).toBe(continued);
    }
    for (const copy of state.newspaperCopies.filter(copy => copy.publication === 'kurier')) {
      expect(copy.articleIds.length + (copy.storyArticleIds?.length ?? 0)).toBeLessThanOrEqual(4);
      expect(copy.classifiedIds.length + (copy.storyClassifiedIds?.length ?? 0)).toBeLessThanOrEqual(4);
      // Authored copy may occupy the original slots but not an unbounded extra supplement.
      expect(Math.max(newspaperPageCount(copy,'pl'),newspaperPageCount(copy,'en'))).toBeLessThanOrEqual(5);
    }
  }, 20000);
});

import { storyMoment } from './fixtures/story-route';
import { epilogueDocumentPages, epilogueDescription, epilogueButtons } from '../src/scenes/epilogue';
import { measureText } from '../src/render/font';
import { newspaperItemId } from '../src/core/desk';

describe('story transaction and document boundaries', () => {
  it('retains an overnight clinical return after its story window closes without granting late political points', () => {
    let state = storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'C1');
    const patientId = state.visit!.patientId;
    state = act({ ...state, clockMinutes: 800 }, 'take-document', 'take-additional-referral');
    const referral = state.papers.find(paper=>paper.kind==='additional-referral' && paper.patientId===patientId)!;
    state = act(state,{type:'select-additional-test',paperId:referral.id,test:'chest-xray'},{type:'hand-additional-referral',paperId:referral.id});
    expect(state.pendingReferrals).toHaveLength(1);
    state = act({ ...state, clockMinutes:840 }, 'end-day', 'next-day');
    expect(state.roster).toContain(patientId);
    expect(state.story.encounterStatus.C1).toBe('missed');
    state = decodeSave(encodeSave(state));
    state = admitPatient({ ...state, clockMinutes:480 });
    expect(state.visit!.patientId).toBe(patientId);
    const history = state.story.decisions;
    state = completeAppointment(state,'fit');
    expect(state.story.decisions).toEqual(history);
    expect(state.pendingReferrals).toHaveLength(0);
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('scores only the handed certificate and rolls a closing-time handoff back', () => {
    const before = storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'B1');
    const stamped = act(before,'take-document','take-certificate','write-certificate','stamp-fit','stamp-unfit');
    expect(stamped.story).toBe(before.story);
    const handed = act(stamped,'return-document');
    expect(handed.story.decisions.filter(record => record.encounterId === 'B1')).toHaveLength(1);
    expect(act(handed,'return-document').story).toBe(handed.story);
    const interrupted = applyAction({ ...stamped,clockMinutes:1034 },'return-document');
    expect(interrupted.feedback).toBe('visit-interrupted');
    expect(interrupted.state.story.decisions).toEqual(before.story.decisions);
    expect(interrupted.state.story.encounterStatus.B1).toBe('missed');
  });
  it('keeps both printed titles independent in both drawers and in the wastebasket', () => {
    let state = storyMoment(state => state.day === 13 && state.visit === null && state.shiftCompleted === 0);
    const daily = state.newspaperCopies.find(copy => copy.day === 13 && copy.publication === 'kurier')!;
    const weekly = state.newspaperCopies.find(copy => copy.day === 13 && copy.publication === 'glos')!;
    expect(newspaperItemId(13,13,daily.publication)).not.toBe(newspaperItemId(13,13,weekly.publication));
    state = act(state,{type:'store-newspaper',day:13,publication:'kurier',drawer:'drawer'}, {type:'store-newspaper',day:13,publication:'glos',drawer:'drawer-2'});
    state = decodeSave(encodeSave(state));
    expect(state.newspaperCopies.find(copy => copy.id === daily.id)?.location).toBe('drawer');
    expect(state.newspaperCopies.find(copy => copy.id === weekly.id)?.location).toBe('drawer-2');
    state = act(state,{type:'retrieve-newspaper',day:13,publication:'glos',drawer:'drawer-2'},{type:'trash-newspaper',day:13,publication:'glos'});
    expect(state.newspaperCopies.some(copy => copy.id === daily.id)).toBe(true);
    expect(state.newspaperCopies.some(copy => copy.id === weekly.id)).toBe(false);
    expect(state.story.publicationHistory).toContain('issue:glos:13');
  });
  it('keeps the warning delivered after disposal and rejects a delivery that cannot allocate its paper', () => {
    const warningMorning = storyMoment(state => state.day === 29 && state.shiftCompleted === 0 && state.visit === null,'exposed');
    const paper = warningMorning.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'A-WARNING')!;
    const discarded = act(warningMorning,{type:'trash-paper',paperId:paper.id});
    expect(discarded.story.warnings).toEqual(warningMorning.story.warnings);
    expect(decodeSave(encodeSave(discarded))).toEqual(discarded);
    const prior = storyMoment(state => state.day === 28 && state.phase === 'home','exposed');
    const template = prior.papers.find(paper => paper.kind === 'note')!;
    const full = { ...prior, papers:Array.from({length:GAME_LIMITS.papers},(_,i)=>({...template,id:1000+i})), nextPaperId:1000+GAME_LIMITS.papers };
    const blocked = applyAction(full,'next-day');
    expect(blocked.feedback).toBe('limit-reached'); expect(blocked.state).toBe(full);
    expect(blocked.state.story.warnings.some(warning=>warning.warningId==='militant')).toBe(false);
  });
  it('retains the two Lis identities and exposes actual decision evidence in both languages', () => {
    const state = act(storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'I1','detained'),'take-document');
    for (const locale of ['pl','en'] as const) {
      const docs = state.papers.filter(paper => paper.kind === 'story-document' && paper.data.encounterId === 'I1');
      expect(docs).toHaveLength(3);
      const referral = state.papers.find(paper=>paper.kind==='referral' && paper.patientId===state.visit!.patientId)!;
      const text = [...docs,referral].map(paper=>paperDescription(paper,locale,false,state.story)).join(' ');
      expect(text).toContain(translations[locale].story.actors['alias-real']);
      expect(text).toContain(translations[locale].story.actors.alias);
    }
    const ending = playStoryRoute('exposed');
    for (const locale of ['pl','en'] as const) {
      const pages = epilogueDocumentPages(ending,locale);
      expect(pages.length).toBeGreaterThan(1);
      for (const page of [null,1]) for (const button of epilogueButtons(ending,locale,page,()=>{})) {
        expect(measureText(button.label)+4).toBeLessThanOrEqual(button.w);
      }
      const text = epilogueDescription(ending,locale,0);
      expect(text).toContain(locale==='pl'?'30.11.1983':'30/11/1983');
      expect(text).toContain(locale==='pl'?'06.12.1983':'06/12/1983');
    }
  });
});
