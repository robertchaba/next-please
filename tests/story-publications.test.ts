import { describe,expect,it } from 'vitest';
import { createStory,calendarDayForWorkDay,completeStoryEncounter,eligibleStoryEncounters,finishStoryDay,deliverStoryWarning,dueStoryWarnings,type StoryDecision,type StoryEncounterId,type NarrativeState } from '../src/core/story';
import { prepareStoryPublications,storyDailyArticleIds,validateStoryPublicationState,expectedStoryUnionArticleIds,type StoryPublicationIssue } from '../src/core/story-publications';
import { PRESS_ARTICLES,CLASSIFIEDS } from '../src/core/newspaper';
import { STORY_ARTICLE_IDS } from '../src/core/story-content';
import { translations } from '../src/i18n';
import { newspaperPages } from '../src/render/newspaper';
import { measureText,measureDocumentText } from '../src/render/font';

function campaign(choices:Partial<Record<StoryEncounterId,StoryDecision>>,through=29){
 let story=createStory();const issues:StoryPublicationIssue[]=[];const daily=new Map<number,string[]>();
 for(let work=1;work<=through;work++){
  const day=calendarDayForWorkDay(work);
  for(const warning of dueStoryWarnings(story,day))story=deliverStoryWarning(story,warning,day,100+work);
  const publication=prepareStoryPublications(story,day);story=publication.story;daily.set(work,publication.dailyArticleIds);
  if(publication.unionIssue)issues.push(publication.unionIssue);
  for(const encounter of eligibleStoryEncounters(story,day)){const decision=choices[encounter.id];if(decision)story=completeStoryEncounter(story,encounter.id,decision,day);}
  story=finishStoryDay(story,day);
 }
 return {story,issues,daily};
}
describe('two publications and decision-dependent editorial schedule',()=>{
 it('keeps all narrative texts out of the random background and replaces bounded daily slots',()=>{
  for(const article of PRESS_ARTICLES)expect(STORY_ARTICLE_IDS).not.toContain(article.id);
  expect(CLASSIFIEDS.some(ad=>String(ad.id)==='C-AD')).toBe(false);
  const {daily}=campaign({A1:'fit',A2:'fit',A3:'fit',A4:'fit',A5:'fit',A6:'fit'});
  for(const ids of daily.values())expect(ids.length).toBeLessThanOrEqual(4);
  expect(daily.get(12)).toEqual(['K-E-HERO','K-A4']);
  const w6=prepareStoryPublications(createStory(),calendarDayForWorkDay(6));
  expect(w6.guaranteedClassifiedIds).toEqual(['C-AD']);
  expect(prepareStoryPublications(w6.story,8).guaranteedClassifiedIds).toEqual([]);
 });
 it('does not turn missed visits into refusal or later promotions',()=>{
  const {daily}=campaign({});
  expect(daily.get(13)).toEqual(['K-E-PENDING']);
  expect(daily.get(16)).toContain('K-D-PENDING');
  expect(daily.get(15)).not.toContain('K-J-POOL');expect(daily.get(24)).not.toContain('K-J-CHIEF');
  expect(daily.get(23)).toEqual([]);
 });
 it('publishes early and late weekly starts and skips only W19 after refusal at the follow-up',()=>{
  const early=campaign({C1:'fit',C2:'fit'}),late=campaign({C1:'unfit'}),missed=campaign({}),pause=campaign({C1:'fit',C2:'unfit'});
  expect(early.issues.map(issue=>issue.day)).toEqual([13,20,27,34,41]);
  expect(late.issues.map(issue=>issue.day)).toEqual([20,27,34,41]);
  expect(missed.issues.map(issue=>issue.day)).toEqual(late.issues.map(issue=>issue.day));
  expect(pause.issues.map(issue=>issue.day)).toEqual([13,20,34,41]);
  expect(pause.issues.map(issue=>issue.issueNumber)).toEqual([1,2,3,4]);
  expect(early.issues[0]!.articleIds[0]).toBe('W-C-EARLY');expect(late.issues[0]!.articleIds[0]).toBe('W-C-LATE');
  for(const result of [early,late,missed,pause])expect(validateStoryPublicationState(result.story,41)).toBe(true);
 });
 it('defers same-morning news and prioritises queued comments without losing overflow',()=>{
  const choices={A1:'fit',A2:'fit',A3:'fit',A4:'unfit',B1:'fit',C1:'fit',C2:'unfit',D1:'unfit','E1-VISIT':'unfit',F1:'fit',G1:'unfit',H1:'fit'} as const;
  const {story,issues}=campaign(choices);
  const w24=issues.find(issue=>issue.day===34)!;
  expect(w24.articleIds).toEqual(['W-F-QUESTION','W-F-STAYS','W-H-STAYS','W-G-REFUSED']);
  expect(issues.find(issue=>issue.day===41)!.articleIds).toContain('W-D-STRIKE');
  expect(w24.articleIds).toEqual(expectedStoryUnionArticleIds(story,34));
  const uninterrupted=campaign({...choices,C2:'fit'});
  expect(uninterrupted.issues.find(issue=>issue.day===27)!.articleIds).not.toContain('W-F-QUESTION');
  expect(uninterrupted.issues.find(issue=>issue.day===34)!.articleIds).toContain('W-F-QUESTION');
  const early=structuredClone(issues[0]);
  expect(JSON.stringify(issues[0])).toBe(JSON.stringify(early));
  expect(issues.every(issue=>issue.articleIds.every(id=>!id.startsWith('W-I')))).toBe(true);
 });
 it('does not publish agent arrests or a regional promotion without the exact preceding approval',()=>{
  const result=campaign({A1:'fit',A2:'unfit',J1:'fit',J2:'unfit'});
  expect(result.daily.get(3)).toContain('K-A1');expect(result.daily.get(6)).not.toContain('K-A2');
  expect(result.daily.get(15)).toContain('K-J-POOL');expect(result.daily.get(24)).not.toContain('K-J-CHIEF');
  expect(result.issues.some(issue=>issue.articleIds.includes('W-A-STOP'))).toBe(true);
  expect(campaign({A1:'unfit'}).issues.some(issue=>issue.articleIds.includes('W-A-STOP'))).toBe(false);
 });
 it('rejects future, substituted, duplicated or reordered publications while preserving snapshots',()=>{
  const {story}=campaign({C1:'fit',C2:'unfit',F1:'fit'});
  expect(validateStoryPublicationState(story,41)).toBe(true);
  for(const publicationHistory of [
   [...story.publicationHistory,'K-A2@8'],[...story.publicationHistory,'K-F-SECOND@42'],
   story.publicationHistory.filter(item=>item!=='issue:kurier:27' && item!=='K-F-QUESTION@27'),
   story.publicationHistory.filter(item=>!item.endsWith('@41') && item!=='issue:glos:41'),
   story.publicationHistory.map(item=>item==='W-F-QUESTION@34'?'W-F-QUESTION@27':item),
   [...story.publicationHistory,story.publicationHistory[0]!],
   story.publicationHistory.map(item=>item==='W-F-STAYS@34'?'W-F-FIRED@34':item),
  ])expect(validateStoryPublicationState({...story,publicationHistory},41)).toBe(false);
  const pending=campaign({C1:'fit',C2:'unfit',D1:'fit',G1:'fit',H1:'fit'},18).story;
  expect(pending.pendingUnionArticleIds.length).toBeGreaterThan(0);
  expect(validateStoryPublicationState({...pending,pendingUnionArticleIds:[]},26)).toBe(false);
  const clone=structuredClone(story);expect(prepareStoryPublications(story,41).unionIssue).toBeNull();expect(story).toEqual(clone);
 });
 it('keeps complete articles and the question mark on readable native pages in both languages',()=>{
  for(const locale of ['pl','en'] as const)for(const id of STORY_ARTICLE_IDS){
   const article=translations[locale].story.articles[id];
   const pages=newspaperPages({articleIds:[],classifiedIds:[],storyArticleIds:[id]},locale);
   const body=pages.flatMap(page=>page.kind==='article'?page.body:[]).join(' ');
   expect(body,id).toBe(article.body);
   for(const page of pages)if(page.kind==='article'){
    for(const line of page.title)expect(measureText(line),line).toBeLessThanOrEqual(274);
    for(const line of page.body)expect(measureDocumentText(line),line).toBeLessThanOrEqual(130);
    expect(page.bodyY+Math.max(...page.columns.map(column=>column.length))*8).toBeLessThanOrEqual(158);
   }
  }
  expect(translations.pl.story.articles['K-F-QUESTION'].title.endsWith('?')).toBe(true);
  expect(translations.en.story.articles['K-F-QUESTION'].title.endsWith('?')).toBe(true);
 });
});
