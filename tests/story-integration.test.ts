import { describe, expect, it } from 'vitest';
import { applyAction, GAME_LIMITS } from '../src/core/game';
import { ADDITIONAL_TESTS } from '../src/core/additional-tests';
import { expectedVisitDecision } from '../src/core/progression';
import { decodeSave, encodeSave } from '../src/core/save';
import { storyScore } from '../src/core/story';
import { storyPatientForEncounter, storyPatientForId } from '../src/core/story-patients';
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
  it.each(ADDITIONAL_TESTS)('applies militia referral rules to the sergeant sent for %s', test => {
    let state = act(storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'E1-VISIT'),
      'take-document', 'run-general', 'run-vision', 'take-additional-referral');
    const patientId = state.visit!.patientId;
    const paperId = state.papers.at(-1)!.id;
    expect(expectedVisitDecision(state)).toBe('discretionary');
    state = act(state, { type: 'select-additional-test', paperId, test });
    const result = applyAction(state, { type: 'hand-additional-referral', paperId });
    const appropriate = test === 'psychiatry';
    expect(result.feedback).toBe(appropriate ? 'patient-referred' : 'referral-penalty');
    expect(result.state.daily.zusCases).toBe(state.daily.zusCases + Number(!appropriate));
    expect(result.state.daily.fines).toBe(state.daily.fines + (appropriate ? 0 : 100));
    expect(result.state.papers.filter(paper => paper.kind === 'letter' && paper.patientId === patientId && paper.sender === 'zus'))
      .toHaveLength(appropriate ? 0 : 1);
    expect(result.state.visit).toBeNull();
    expect(result.state.shiftCompleted).toBe(state.shiftCompleted);
    expect(result.state.story.decisions).toEqual(state.story.decisions);
    expect(result.state.pendingReferrals).toContainEqual(expect.objectContaining({ test, visit: expect.objectContaining({ patientId }) }));
    expect(decodeSave(encodeSave(result.state))).toEqual(result.state);
  });

  it('preserves the sergeant’s discretionary vision assessment after a psychiatric return and report handoff', () => {
    let state = storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'E1-VISIT');
    const patientId = state.visit!.patientId;
    state = act({ ...state, clockMinutes: 800 }, 'take-document', 'take-additional-referral');
    const paperId = state.papers.at(-1)!.id;
    state = act(state, { type: 'select-additional-test', paperId, test: 'psychiatry' }, { type: 'hand-additional-referral', paperId });
    const returnDay = state.pendingReferrals[0]!.returnDay;
    state = act({ ...state, clockMinutes: 840 }, 'end-day');
    while (state.day < returnDay) state = act(state, 'next-day');
    state = admitPatient({ ...state, clockMinutes: 480 });
    expect(state.visit).toMatchObject({ patientId, additionalResult: { test: 'psychiatry', fit: true } });
    expect(expectedVisitDecision(state)).toBe('discretionary');
    expect(decodeSave(encodeSave(state))).toEqual(state);
    const daily = state.daily;
    state = completeAppointment(state, 'fit');
    expect(state.visit).toBeNull();
    expect(state.daily).toEqual(daily);
    expect(state.papers.some(paper => paper.kind === 'additional-result' && paper.patientId === patientId)).toBe(false);
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

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

describe('returning patient identity cards', () => {
  const malec = () => storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'J1');
  it('returns Malec’s card from a clipped bundle without handing over other papers or finishing his visit', () => {
    let state = act(malec(), 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit');
    const card = state.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'J-PARTY-CARD')!;
    const referral = state.papers.find(paper => paper.kind === 'referral' && paper.patientId === state.visit!.patientId)!;
    state = act(state, { type: 'clip-document', documentId: referral.id }, { type: 'join-documents', documentId: card.id, targetId: referral.id },
      { type: 'join-documents', documentId: 'certificate', targetId: referral.id });
    state = decodeSave(encodeSave(state));
    const result = applyAction(state, { type: 'return-identity-card', paperId: card.id });
    expect(result.feedback).toBe('identity-card-returned');
    expect(result.state.papers).toEqual(state.papers.filter(paper => paper.id !== card.id));
    expect(result.state.paperClips).toContainEqual([referral.id, 'certificate']);
    expect(result.state.visit).toBe(state.visit);
    expect(result.state.story).toBe(state.story);
    expect(result.state.daily).toBe(state.daily);
    expect(result.state.money).toBe(state.money);
    expect(result.state.patientsProcessed).toBe(state.patientsProcessed);
    expect(result.state.clockMinutes).toBe(state.clockMinutes + 1);
    expect(decodeSave(encodeSave(result.state))).toEqual(result.state);
    expect(applyAction(result.state, { type: 'return-identity-card', paperId: card.id }).state).toBe(result.state);
  });
  it('accepts the retained card on Malec’s later visit, including after drawer retrieval and import', () => {
    let state = storyMoment(state => storyPatientForId(state.visit?.patientId ?? -1)?.encounterId === 'J2');
    const card = state.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'J-PARTY-CARD')!;
    state = act(state, { type: 'store-paper', paperId: card.id, drawer: 'drawer-2' });
    expect(applyAction(state, { type: 'return-identity-card', paperId: card.id }).state).toBe(state);
    state = act(decodeSave(encodeSave(state)), { type: 'retrieve-paper', paperId: card.id, drawer: 'drawer-2' });
    const result = applyAction(state, { type: 'return-identity-card', paperId: card.id });
    expect(result.feedback).toBe('identity-card-returned');
    expect(decodeSave(encodeSave(result.state))).toEqual(result.state);
  });
  it('rejects another owner and preserves the card when closing interrupts the handoff', () => {
    const state = malec();
    const card = state.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'J-PARTY-CARD')!;
    const other = { ...state, visit: { ...state.visit!, patientId: storyPatientForEncounter('B1').patient.id } };
    expect(applyAction(other, { type: 'return-identity-card', paperId: card.id })).toEqual({ state: other, feedback: 'identity-card-wrong-owner' });
    const noVisitor = { ...state, visit: null };
    expect(applyAction(noVisitor, { type: 'return-identity-card', paperId: card.id }).state).toBe(noVisitor);
    const closing = applyAction({ ...state, clockMinutes: 1034 }, { type: 'return-identity-card', paperId: card.id });
    expect(closing.feedback).toBe('visit-interrupted');
    expect(closing.state.papers).toContainEqual(card);
    expect(closing.state.story.decisions).toEqual(state.story.decisions);
  });
});
