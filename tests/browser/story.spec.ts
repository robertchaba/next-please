import { readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { encodeSave, decodeSave } from '../../src/core/save';
import type { GameState } from '../../src/core/game';
import { storyPatientForId } from '../../src/core/story-patients';
import { storyPaperLayout } from '../../src/render/story-paper';
import { epilogueDocumentPages } from '../../src/scenes/epilogue';
import { newspaperPageCount } from '../../src/render/newspaper';
import { translations, type Locale } from '../../src/i18n';
import { act, storyMoment, playStoryRoute } from '../fixtures/story-route';

test.describe.configure({ mode:'parallel' });

const key = async (page: Page, id: string, value = 'Enter') => {
  await page.locator(`#control-${id}`).focus(); await page.keyboard.press(value);
};
async function boot(page: Page, locale: Locale) {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.clock.install(); await page.goto('/');
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready','true');
  await key(page,'start');
  for (let index=0;index<4;index++) await key(page,'intro-next');
  await page.clock.pauseAt(new Date(Date.now()+1000));
  await key(page,`language-${locale}`);
}
async function load(page: Page, state: GameState) {
  await key(page,'saves');
  await page.locator('#save-input').setInputFiles({ name:'story.npsave',mimeType:'application/gzip',buffer:Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
  await key(page,'back');
}
async function exported(page: Page, info: TestInfo): Promise<GameState> {
  await key(page,'saves');
  const pending = page.waitForEvent('download'); await key(page,'export');
  const download=await pending, filename=info.outputPath('story.npsave'); await download.saveAs(filename);
  const state=decodeSave(await readFile(filename)); await key(page,'back'); return state;
}
async function place(page: Page, id: string, x=350, y=210) {
  await key(page,id,'Space');
  const stage=(await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x+x*stage.width/570,stage.y+y*stage.height/320);
}

for (const locale of ['pl','en'] as const) {
  for (const route of ['exposed','audit','detained','party','union','independent']) {
    test(`${route} epilogue, complete documents and continuation in ${locale}`,async({page},info)=>{
      const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message));
      const state=playStoryRoute(route), resolution=state.story.resolution!, t=translations[locale];
      await boot(page,locale); await load(page,state);
      await expect(page.locator('#controls')).toHaveAttribute('data-screen','epilogue');
      await expect(page.locator('#screen-description')).toContainText(t.story.endings[resolution.endingId].body);
      await expect(page.locator('#control-epilogue-continue')).toHaveAccessibleName(resolution.terminal?t.story.ui.backToMenu:t.story.ui.continueWork);
      await page.locator('#stage').screenshot({path:info.outputPath(`${route}-${locale}.png`)});
      await key(page,'epilogue-document');
      const count=epilogueDocumentPages(state,locale).length;
      for(let index=1;index<count;index++) await key(page,'epilogue-next');
      await expect(page.locator('#control-epilogue-next')).toHaveCount(0);
      for(let index=1;index<count;index++) await key(page,'epilogue-previous');
      await page.locator('#stage').screenshot({path:info.outputPath(`${route}-document-${locale}.png`)});
      await key(page,'epilogue-close-document');
      expect(await exported(page,info)).toEqual(state);
      await key(page,'epilogue-continue');
      await expect(page.locator('#controls')).toHaveAttribute('data-screen',resolution.terminal?'break-room':'cabinet');
      if(!resolution.terminal) {
        const continued=await exported(page,info);
        expect(continued.day).toBe(37); expect(continued.money).toBe(state.money);
        expect(continued.story.resolution).toEqual({...resolution,presented:true});
      }
      expect(errors).toEqual([]);
    });
  }

  test(`forged exemption has readable pages and a persistent telephone conclusion in ${locale}`,async({page},info)=>{
    const state=act(storyMoment(state=>storyPatientForId(state.visit?.patientId??-1)?.encounterId==='A4'),'take-document','take-paper');
    const paper=state.papers.find(paper=>paper.kind==='story-document' && paper.data.definitionId==='A-FAKE-4')!;
    if(paper.kind!=='story-document') throw new Error('Missing exemption');
    await boot(page,locale); await load(page,state); await place(page,`paper-${paper.id}`);
    const count=storyPaperLayout(paper,locale,0,200,state.story).count;
    for(let index=1;index<count;index++) await key(page,`note-next-${paper.id}`);
    await expect(page.locator(`#control-paper-${paper.id}`)).toHaveAccessibleName(/46-0102/);
    const phone=page.locator(`#control-story-call-${paper.id}`);
    expect(await phone.evaluate(element=>{const r=element.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.id;})).toBe(`control-story-call-${paper.id}`);
    await phone.click();
    await expect(page.locator('#announcement')).toContainText(translations[locale].story.phones['chamber-forged']);
    await key(page,`story-call-${paper.id}`);
    const called=await exported(page,info);
    expect(called.story.decisions).toEqual(state.story.decisions);
    expect(called.visit!.noteOrder.filter(entry=>entry==='story-call:CALL-CHAMBER')).toHaveLength(1);
    expect(called.story.contacts).toContain('CALL-CHAMBER:A4');
    await page.locator('#stage').screenshot({path:info.outputPath(`exemption-${locale}.png`)});
  });

  test(`two newspaper titles remain independent and the printing ad replaces background slots in ${locale}`,async({page},info)=>{
    let state=storyMoment(state=>state.day===13 && state.visit===null && state.shiftCompleted===0);
    state=act(state,{type:'store-newspaper',day:13,publication:'kurier',drawer:'drawer'},{type:'store-newspaper',day:13,publication:'glos',drawer:'drawer-2'});
    await boot(page,locale); await load(page,state);
    await key(page,'drawer-2'); await key(page,'drawer-union-newspaper-13');
    const stage=(await page.locator('#stage').boundingBox())!;
    await page.mouse.click(stage.x+366*stage.width/570,stage.y+212*stage.height/320);
    await expect(page.locator('#screen-description')).toContainText(translations[locale].story.ui.unionTitle);
    await page.locator('#stage').screenshot({path:info.outputPath(`union-newspaper-${locale}.png`)});
    const restored=await exported(page,info);
    expect(restored.newspaperCopies.find(copy=>copy.id==='kurier:13')!.location).toBe('drawer');
    expect(restored.newspaperCopies.find(copy=>copy.id==='glos:13')!.location).toBe('desk');
    state=storyMoment(state=>state.day===8 && state.visit===null && state.shiftCompleted===0);
    await load(page,state); await key(page,'newspaper');
    const issue=state.newspaperCopies.find(copy=>copy.day===8)!;
    for(let index=1;index<newspaperPageCount(issue,locale);index++) await key(page,'newspaper-next');
    await key(page,'newspaper-call-story');
    await expect(page.locator('#announcement')).toContainText(translations[locale].story.phones['print-open']);
    await page.locator('#stage').screenshot({path:info.outputPath(`printing-classified-${locale}.png`)});
  });

  test(`identity clues, the full warehouse job and party-card photograph stay readable in ${locale}`,async({page},info)=>{
    await boot(page,locale);
    for(const encounter of ['I1','H1','J1','G1'] as const) {
      const state=act(storyMoment(state=>storyPatientForId(state.visit?.patientId??-1)?.encounterId===encounter),'take-document');
      await load(page,state);
      const referral=state.papers.find(paper=>paper.kind==='referral' && paper.patientId===state.visit!.patientId)!;
      await place(page,`paper-${referral.id}`);
      const label=await page.locator(`#control-paper-${referral.id}`).getAttribute('aria-label');
      expect(label).toContain(translations[locale].patientNames[state.visit!.patientId]);
      expect(label).toContain(translations[locale].patientJobs[state.visit!.patientId]);
      if(encounter==='H1') {
        await page.locator('#stage').screenshot({path:info.outputPath(`warehouse-referral-${locale}.png`)});
        await key(page,`call-employer-${referral.id}`);
        await expect(page.locator('#announcement')).toContainText(translations[locale].story.phones.warehouse);
      }
      if(encounter==='I1') {
        const report=state.papers.find(paper=>paper.kind==='story-document' && paper.data.definitionId==='I-EYE')!;
        await place(page,`paper-${report.id}`,410,200);
        await expect(page.locator(`#control-paper-${report.id}`)).toHaveAccessibleName(new RegExp(translations[locale].story.actors['alias-real']));
        await page.locator('#stage').screenshot({path:info.outputPath(`two-identities-${locale}.png`)});
      }
      if(encounter==='J1') {
        const card=state.papers.find(paper=>paper.kind==='story-document' && paper.data.definitionId==='J-PARTY-CARD')!;
        await place(page,`paper-${card.id}`);
        await page.locator('#stage').screenshot({path:info.outputPath(`party-card-${locale}.png`)});
        while(await page.locator(`#control-note-next-${card.id}`).count()) await key(page,`note-next-${card.id}`);
      }
      if(encounter==='G1') {
        const delegation=state.papers.find(paper=>paper.kind==='story-document' && paper.data.definitionId==='G-DELEGATION')!;
        await place(page,`paper-${delegation.id}`);
        await expect(page.locator(`#control-paper-${delegation.id}`)).toHaveAccessibleName(new RegExp(translations[locale].story.actors.volunteer));
        await page.locator('#stage').screenshot({path:info.outputPath(`forced-delegation-${locale}.png`)});
      }
    }
  });
}

test('an invalid epilogue import preserves live state and native-resolution controls',async({page},info)=>{
  const state=playStoryRoute('union'); await boot(page,'pl'); await load(page,state);
  await page.setViewportSize({width:700,height:500});
  await expect(page.locator('#stage')).toHaveCSS('width','570px');
  await page.locator('#stage').screenshot({path:info.outputPath('epilogue-native.png')});
  await key(page,'saves');
  await page.locator('#save-input').setInputFiles({name:'broken.npsave',mimeType:'application/gzip',buffer:Buffer.from('broken')});
  await expect(page.locator('#announcement')).not.toContainText('Zapis wczytany');
  await key(page,'back');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen','epilogue');
  expect(await exported(page,info)).toEqual(state);
});
