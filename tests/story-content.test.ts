import { describe, expect, it } from 'vitest';
import { translations } from '../src/i18n';
import { CLASSIFIEDS } from '../src/core/newspaper';
import { STORY_ACTORS, STORY_PATIENT_DEFINITIONS, storyPatientForEncounter } from '../src/core/story-patients';
import { createStory, calendarDayForWorkDay, completeStoryEncounter, finishStoryDay, deliverStoryWarning, dueStoryWarnings, resolveStory, type NarrativeState, type StoryDecision, type StoryEncounterId } from '../src/core/story';
import { STORY_ARTICLE_IDS, STORY_DOCUMENT_IDS, STORY_DOCUMENTS, STORY_CONTACTS, STORY_CONTACT_IDS, createStoryPaperData, encounterStoryDocuments, endingStoryDocuments, morningStoryDocuments, storyDocumentCopy, storyContactResponse, storyClassifiedCopy, validateStoryPaperData } from '../src/core/story-content';
import { measureDocumentText } from '../src/render/font';
import { storyPaperLayout } from '../src/render/story-paper';
import type { Paper } from '../src/core/game';

function decide(story: NarrativeState, id: StoryEncounterId, value: StoryDecision): NarrativeState {
  const days: Record<StoryEncounterId, number> = { A1:2,A2:5,B1:5,A3:8,C1:8,J1:10,A4:11,'E1-VISIT':12,A5:14,D1:15,G1:17,C2:18,H1:18,J2:19,A6:20,F1:21,I1:21,A7:24 };
  return completeStoryEncounter(story,id,value,calendarDayForWorkDay(days[id]));
}
function advance(story: NarrativeState, through: number, choices: Partial<Record<StoryEncounterId, StoryDecision>>) {
  for(let work=1;work<=through;work++) {
    const day=calendarDayForWorkDay(work);
    for(const warning of dueStoryWarnings(story,day)) story=deliverStoryWarning(story,warning,day,100+work);
    for(const patient of STORY_PATIENT_DEFINITIONS) if(choices[patient.encounterId]) {
      const result=decide(story,patient.encounterId,choices[patient.encounterId]!);
      // This helper only commits the appointments whose authored workday is now.
      if(result.decisions.length>story.decisions.length && result.decisions.at(-1)!.day===day) story=result;
    }
    story=finishStoryDay(story,day);
  }
  return story;
}

describe('authored chapter documents and localized clues',()=>{
  it('has complete PL/EN documents, stories, contacts and fixed actor labels',()=>{
    for(const locale of ['pl','en'] as const){
      const t=translations[locale].story;
      expect(Object.keys(t.articles).sort()).toEqual([...STORY_ARTICLE_IDS].sort());
      expect(Object.keys(t.documents).sort()).toEqual(Object.keys(translations.pl.story.documents).sort());
      for(const id of STORY_DOCUMENT_IDS){const copy=storyDocumentCopy(createStoryPaperData(id,createStory(),2),locale);expect(copy.title.length,id).toBeGreaterThan(3);expect(copy.body.length,id).toBeGreaterThan(20);}
      for(const patient of STORY_PATIENT_DEFINITIONS){
        expect(translations[locale].patientNames[patient.patient.id]).toBe(t.actors[patient.actorId]);
        expect(translations[locale].patientJobs[patient.patient.id]).not.toContain('undefined');
        const referral=translations[locale].patientReferrals[patient.patient.id]!;
        for(const value of Object.values(referral)) expect(value).not.toContain('undefined');
      }
    }
    expect(new Set(STORY_ACTORS.map(actor=>actor.actorId)).size).toBe(10);
  });
  it('preserves the two names and shared birth date without changing the referral identity',()=>{
    const documents=encounterStoryDocuments(createStory(),'I1',29);
    for(const locale of ['pl','en'] as const){
      const t=translations[locale].story,medical=storyDocumentCopy(documents[0]!,locale);
      expect(medical.subject).toBe(t.actors['alias-real']);
      expect(medical.body).toContain(locale==='pl'?'28.03.1942':'28/03/1942');
      const referral=storyDocumentCopy(createStoryPaperData('I-REF',createStory(),29),locale);
      expect(referral.subject).toBe(t.actors.alias);
      const explanation=storyDocumentCopy(documents[2]!,locale);
      expect(explanation.body).toContain(locale==='pl'?'Sikorę':'Finch');
      expect(explanation.body).toContain(locale==='pl'?'Lis':'Fox');
    }
  });
  it('prints the exact results used by the sergeant and proofreader medical profiles',()=>{
    for(const [id,encounter] of [['E-EYE','E1-VISIT'],['F-EYE','F1']] as const){
      const patient=storyPatientForEncounter(encounter).patient;
      const copy=storyDocumentCopy(createStoryPaperData(id,createStory(),29),'en');
      expect(copy.body).toContain(patient.visionValues.left.toFixed(2));
      expect(copy.body).toContain(patient.visionValues.right.toFixed(2));
    }
    expect(translations.pl.generalFindings[18]).toBe('nawracające zawroty głowy');
  });
  it('keeps historical certification read-only, with its original date and narrower duties',()=>{
    const data=createStoryPaperData('H-OLD-CERT',createStory(),26);
    expect(STORY_DOCUMENTS['H-OLD-CERT'].art).toBe('certificate');
    expect(storyDocumentCopy(data,'pl').issuedDate).toBe('19.11.1982');
    expect(storyDocumentCopy(data,'en').issuedDate).toBe('19/11/1982');
    expect(storyDocumentCopy(data,'pl').body).toContain('nie obejmuje obsługi wózka');
  });
  it('never fabricates a paper for a missed choice and retains distinct warning and complaint deliveries',()=>{
    let missed=finishStoryDay(createStory(),calendarDayForWorkDay(17));
    expect(morningStoryDocuments(missed,calendarDayForWorkDay(18)).some(data=>data.definitionId==='G-COMPLAINT')).toBe(false);
    let story=decide(createStory(),'C1','fit');story=decide(story,'J1','fit');story=decide(story,'C2','unfit');
    const morning=morningStoryDocuments(story,calendarDayForWorkDay(19));
    expect(morning.map(data=>data.definitionId)).toContain('SYS-CONSISTENCY');
    expect(morning.map(data=>data.definitionId)).toContain('C-PAUSE');
    expect(morning.map(data=>data.definitionId)).not.toContain('J-COMPLAINT-2');
  });
  it('keeps actual source certificates in the exposure and rejects substituted or future sources',()=>{
    let story=advance(createStory(),24,{A1:'fit',A2:'fit',A3:'fit',A4:'fit',A5:'fit',A6:'fit',A7:'fit'});
    story=resolveStory(story,36,'morning');
    expect(story.resolution?.endingId).toBe('exposed');
    const data=endingStoryDocuments(story).find(paper=>paper.definitionId==='A-EXPOSURE')!;
    expect(data.sourceDecisionEventIds).toEqual(['decision:A6','decision:A7']);
    expect(validateStoryPaperData(data,story,36)).toBe(true);
    expect(validateStoryPaperData({...data,sourceDecisionEventIds:['decision:A1','decision:A2']},story,36)).toBe(false);
    expect(validateStoryPaperData({...data,issuedDay:28},story,36)).toBe(false);
    const copy=storyDocumentCopy(data,'pl',story);
    expect(copy.body).toContain('30.11.1983');expect(copy.body).toContain('06.12.1983');
    expect(copy.body).toContain('Podpis lekarza gabinetu 04');
  });
  it('uses deterministic phone truth per source, not the mutable current patient',()=>{
    const story=createStory(),before=structuredClone(story);
    expect(storyContactResponse('CALL-CHAMBER','B-CHAMBER',story,7)).toBe('chamber-genuine');
    expect(storyContactResponse('CALL-CHAMBER','A-FAKE-4',story,15)).toBe('chamber-forged');
    expect(storyContactResponse('CALL-CHAMBER','I-NOTE',story,29)).toBeNull();
    expect(storyContactResponse('CALL-PRINT',null,story,7)).toBeNull();
    expect(storyContactResponse('CALL-PRINT',null,story,8)).toBe('print-open');
    expect(storyContactResponse('CALL-PRINT',null,decide(story,'C1','unfit'),13)).toBe('print-closed');
    expect(story).toEqual(before);
    const oldPhones=CLASSIFIEDS.map(ad=>ad.phone);
    for(const id of STORY_CONTACT_IDS) expect(oldPhones).not.toContain(STORY_CONTACTS[id].phone);
    expect(storyClassifiedCopy('C-AD','pl').phone).toBe('46-0101');
  });
  it('lays out every full document and Polish glyph in both languages without truncation',()=>{
    for(const locale of ['pl','en'] as const) for(const id of STORY_DOCUMENT_IDS){
      const paper:Extract<Paper,{kind:'story-document'}>={id:1,day:29,kind:'story-document',patientId:null,location:'desk',opened:true,data:createStoryPaperData(id,createStory(),29)};
      const first=storyPaperLayout(paper,locale);
      const all=Array.from({length:first.count},(_,index)=>storyPaperLayout(paper,locale,index).lines).flat();
      for(const line of all) {
        expect(line.x + measureDocumentText(line.text),`${id} ${locale} ${line.text}`).toBeLessThanOrEqual(188);
        expect(line.y + 7).toBeLessThanOrEqual(id === 'J-PARTY-CARD' ? 151 : 143);
      }
      const expected=storyDocumentCopy(paper.data,locale);
      const content = id === 'J-PARTY-CARD' ? all.filter(line=>line.y>=48) : all;
      expect(content.map(line=>line.text).join(' ').replace(/\s+/g,' ')).toContain(expected.paragraphs.join(' ').replace(/\s+/g,' '));
    }
  });
});
