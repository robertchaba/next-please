import { readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { applyAction, createInitialState, type GameAction, type GameState, type Visit } from '../../src/core/game';
import { PATIENTS } from '../../src/core/patients';
import { expectedVisitDecision } from '../../src/core/progression';
import { decodeSave, encodeSave } from '../../src/core/save';

const actions = (state: GameState, ...items: GameAction[]): GameState => items.reduce((next, action) => applyAction(next, action).state, state);

/** Actual weekday transitions retain the letters and weekend accounting. */
function beginningOfDay(day: number, seed = 71): GameState {
  let state = actions(createInitialState(seed), 'skip-intro');
  while (state.day < day && state.ending === null) {
    if (state.phase === 'cabinet') state = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
    state = applyAction(state, 'next-day').state;
  }
  return state;
}

function completeVisit(state: GameState): GameState {
  return actions(state, 'take-document', 'take-certificate', 'write-certificate', expectedVisitDecision(state) === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
}

/** Find seeded, naturally generated paperwork without altering its hidden truth. */
function patientFixture(day: number, matches: (visit: Visit) => boolean): GameState {
  for (let seed = 1; seed <= 300; seed++) {
    let state = beginningOfDay(day, seed);
    if (state.day !== day || state.phase !== 'cabinet') continue;
    for (let index = 0; index < 14; index++) {
      state = actions(state, 'call-patient');
      if (state.visit && matches(state.visit)) return state;
      state = completeVisit(state);
    }
  }
  throw new Error('No seeded progression fixture matched');
}

async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

async function place(page: Page, x = 350, y = 208): Promise<void> {
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + x * stage.width / 570, stage.y + y * stage.height / 320);
}

async function movePaper(page: Page, id: number): Promise<void> {
  await page.locator(`#control-paper-${id}`).focus();
  await page.keyboard.press('Space');
  await place(page);
}

async function load(page: Page, state: GameState): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await key(page, 'start');
  for (let index = 0; index < 4; index++) await key(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'progression-v16.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await key(page, 'back');
}

async function exportState(page: Page, info: TestInfo): Promise<GameState> {
  await key(page, 'saves');
  const pending = page.waitForEvent('download');
  await key(page, 'export');
  const download = await pending;
  const filename = info.outputPath('progression.npsave');
  await download.saveAs(filename);
  const state = decodeSave(await readFile(filename));
  await key(page, 'back');
  return state;
}

for (const [day, rule, sender] of [[5, 'dates', 'ZUS'], [6, 'specialist', 'Izba Lekarska'], [7, 'authenticity', 'ZUS']] as const) {
  test(`workday ${day - 2} delivers and opens the ${rule} directive in both languages`, async ({ page }, info) => {
    const state = beginningOfDay(day);
    const directive = state.papers.find(paper => paper.kind === 'directive' && paper.day === day)!;
    await load(page, state);
    await expect(page.locator(`#control-paper-${directive.id}`)).toHaveAccessibleName(new RegExp(sender));
    await movePaper(page, directive.id);
    await key(page, `paper-action-${directive.id}`);
    const description = page.locator(`#control-paper-${directive.id}`);
    await expect(description).toHaveAccessibleName(rule === 'dates' ? /Starsze niż 3 dni/ : rule === 'specialist' ? /Inny zawód/ : /Brak pieczęci/);
    await page.locator('#stage').screenshot({ path: info.outputPath(`directive-${rule}-pl.png`) });
    await key(page, 'language-en');
    await expect(description).toHaveAccessibleName(rule === 'dates' ? /3 days/ : rule === 'specialist' ? /occupation|job|position/ : /seal|stamp/);
    await page.locator('#stage').screenshot({ path: info.outputPath(`directive-${rule}-en.png`) });
    const saved = await exportState(page, info);
    expect(saved.papers.find(paper => paper.id === directive.id)).toMatchObject({ kind: 'directive', rule, opened: true });
  });
}

for (const valid of [true, false]) {
  test(`specialist telephone verifies a ${valid ? 'matching' : 'different'} job and records the conclusion`, async ({ page }, info) => {
    let state = patientFixture(6, visit => visit.specialist !== null && (visit.specialist.jobId === PATIENTS[visit.patientId]!.jobId) === valid);
    state = actions(state, 'take-paper');
    const note = state.papers.filter(paper => paper.kind === 'note').at(-1)!;
    const specialistId = state.nextPaperId;
    await load(page, state);
    await key(page, 'take-specialist');
    await place(page);
    await expect(page.locator(`#control-call-specialist-${specialistId}`)).toHaveAccessibleName('Zadzwoń do specjalisty');
    if (valid) await key(page, 'sound');
    await key(page, 'use-phone');
    await expect(page.locator('#announcement')).toContainText('Sygnał centrali');
    const phoneSounds = () => page.evaluate(() => window.Howler._howls
      .filter(sound => /phone-(tone|dial)\.wav$/.test(String(sound._src)) && sound.playing())
      .map(sound => ({ src: String(sound._src).split('/').at(-1), muted: sound.mute(), state: sound.state() })));
    if (valid) await expect.poll(phoneSounds).toEqual([{ src: 'phone-tone.wav', muted: false, state: 'loaded' }]);
    await page.locator(`#control-call-specialist-${specialistId}`).click();
    await expect(page.locator('#clinic-speech')).toHaveText('Trrr… cyk-cyk-cyk…');
    await page.locator('#stage').screenshot({ path: info.outputPath('specialist-dialing-pl.png') });
    await key(page, 'language-en');
    await expect(page.locator('#clinic-speech')).toHaveText('Whirr… click-click…');
    await key(page, 'language-pl');
    if (valid) {
      await expect.poll(phoneSounds).toEqual([{ src: 'phone-dial.wav', muted: false, state: 'loaded' }]);
      await key(page, 'sound');
      expect(await page.evaluate(() => window.Howler._howls.find(sound => String(sound._src).endsWith('/phone-dial.wav'))!.mute())).toBe(true);
    }
    await page.clock.runFor(1800);
    await expect(page.locator('#clinic-speech')).toHaveText('Czy kolega potwierdza to zaświadczenie?');
    await page.locator('#stage').screenshot({ path: info.outputPath('specialist-question-pl.png') });
    await key(page, 'language-en');
    await expect(page.locator('#clinic-speech')).toHaveText('Doctor, can you confirm this certificate?');
    await page.locator('#stage').screenshot({ path: info.outputPath('specialist-question-en.png') });
    await key(page, 'language-pl');
    await page.clock.runFor(2400);
    await expect(page.locator('#clinic-speech')).toContainText(valid ? 'Tak. Leczenie trwa.' : 'To zaświadczenie dotyczy innej pracy.');
    await page.locator('#stage').screenshot({ path: info.outputPath(`specialist-call-${valid ? 'valid' : 'invalid'}-pl.png`) });
    await page.clock.runFor(3300);
    await expect(page.locator(`#control-paper-${note.id}`)).toHaveAccessibleName(valid ? /Specjalista: leczenie, praca bez zastrzeżeń/ : /Specjalista: inne stanowisko. Nieważne/);
    const saved = await exportState(page, info);
    expect(saved.visit?.calls.specialist).toBe(valid);
    expect(saved.papers.find(paper => paper.id === note.id)).toMatchObject({ kind: 'note', calls: { specialist: valid } });
    await movePaper(page, specialistId);
    await page.locator('#stage').screenshot({ path: info.outputPath(`specialist-${valid ? 'valid' : 'invalid'}-pl.png`) });
    await key(page, 'language-en');
    await expect(page.locator(`#control-call-specialist-${specialistId}`)).toHaveAccessibleName(/specialist/i);
  });
}

for (const authentic of [true, false]) {
  test(`HR resolves an unclear ${authentic ? 'authentic' : 'false'} referral and writes the answer`, async ({ page }, info) => {
    let state = patientFixture(7, visit => visit.referral.seal === 'unclear' && visit.referral.authentic === authentic);
    state = actions(state, 'take-document', 'take-paper');
    const referral = state.papers.filter(paper => paper.kind === 'referral').at(-1)!;
    const note = state.papers.filter(paper => paper.kind === 'note').at(-1)!;
    await load(page, state);
    await movePaper(page, referral.id);
    await expect(page.locator(`#control-paper-${referral.id}`)).toHaveAccessibleName(/Niewyraźna pieczęć pracodawcy/);
    await page.locator(`#control-call-employer-${referral.id}`).click();
    await page.clock.runFor(7500);
    await expect(page.locator(`#control-paper-${note.id}`)).toHaveAccessibleName(authentic ? /Kadry: skierowanie autentyczne/ : /Kadry: skierowanie nieautentyczne/);
    const saved = await exportState(page, info);
    expect(saved.visit?.calls.employer).toBe(authentic);
    expect(saved.papers.find(paper => paper.id === note.id)).toMatchObject({ kind: 'note', calls: { employer: authentic } });
    await page.locator('#stage').screenshot({ path: info.outputPath(`hr-${authentic ? 'valid' : 'invalid'}-pl.png`) });
  });
}

function secondPatientBribe(): GameState {
  let state = actions(beginningOfDay(8), 'call-patient');
  state = completeVisit(state);
  return actions(state, 'call-patient', 'take-document');
}

test('returning the second workday-six patient banknote then refusing retains the normal bonus', async ({ page }, info) => {
  const state = { ...actions(secondPatientBribe(), 'take-certificate', 'write-certificate'), clockMinutes: 839 };
  expect(state.visit?.bribe).toBe('offered');
  await load(page, state);
  await expect(page.locator('#control-banknote')).toHaveAccessibleName(/100 zł z Waryńskim/);
  await page.locator('#stage').screenshot({ path: info.outputPath('banknote-pl.png') });
  await page.locator('#control-banknote').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  await key(page, 'return-bribe');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#control-banknote')).toHaveCount(0);
  const saved = await exportState(page, info);
  expect(saved.visit?.bribe).toBe('returned');
  expect(saved.money).toBe(state.money);
  expect(saved.ending).toBeNull();
  for (const id of ['stamp-unfit', 'apply-stamp', 'return-document']) await key(page, id);
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'arrival');
  const finished = await exportState(page, info);
  expect(finished.ending).toBeNull();
  expect(finished.daily).toEqual(state.daily);
  expect(finished.settlement?.patientBonus).toBe(100);
});

test('Enter accepts the banknote and the drawer can return it before the decision', async ({ page }, info) => {
  const state = secondPatientBribe();
  await load(page, state);
  await key(page, 'banknote');
  await expect(page.locator('#control-banknote')).toHaveCount(0);
  expect((await exportState(page, info)).money).toBe(state.money);
  await key(page, 'drawer');
  await key(page, 'drawer-banknote');
  await key(page, 'return-bribe');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  const returned = await exportState(page, info);
  expect(returned.visit?.bribe).toBe('returned');
  expect(returned.money).toBe(state.money);
});

test('keeping the banknote in the drawer and refusing ends the game in hospital after work', async ({ page }, info) => {
  const state = { ...actions(secondPatientBribe(), 'take-certificate', 'write-certificate'), clockMinutes: 839 };
  await load(page, state);
  await page.locator('#control-banknote').focus();
  await page.keyboard.press('Space');
  await key(page, 'accept-bribe');
  await expect(page.locator('#control-banknote')).toHaveCount(0);
  const accepted = await exportState(page, info);
  expect(accepted.visit?.bribe).toBe('accepted');
  expect(accepted.money).toBe(state.money);
  for (const id of ['stamp-unfit', 'apply-stamp', 'return-document']) await key(page, id);
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'hospital');
  await expect(page.locator('#screen-description')).toContainText('Po leczeniu czekają cię badania medycyny pracy');
  await page.locator('#stage').screenshot({ path: info.outputPath('hospital-pl.png') });
  const finished = await exportState(page, info);
  expect(finished.ending).toBe('hospital');
  expect(finished.settlement?.patientBonus).toBe(100);
  await key(page, 'language-en');
  await expect(page.locator('#screen-description')).toContainText('occupational health exam');
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'break-room');
  expect(applyAction(finished, 'next-day').state).toEqual(finished);
});


test('kept cash survives the patient leaving on the desk and moves through the drawer', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await load(page, actions(secondPatientBribe(), 'take-certificate', 'write-certificate'));
  await page.locator('#control-banknote').click();
  await place(page, 430, 255);
  await expect(page.locator('#control-banknote-1')).toBeVisible();
  const before = await exportState(page, info);
  expect(before.banknotes).toMatchObject([{ location: 'desk', credited: false }]);
  for (const id of ['stamp-fit', 'apply-stamp', 'return-document']) await key(page, id);
  await expect(page.locator('#control-banknote-1')).toBeVisible();
  const completed = await exportState(page, info);
  expect(completed.visit).toBeNull();
  expect(completed.money).toBe(before.money);
  expect(completed.banknotes).toEqual(before.banknotes);
  await page.locator('#control-banknote-1').focus();
  await page.keyboard.press('Space');
  await key(page, 'drawer');
  await key(page, 'drawer');
  await expect(page.locator('#control-drawer-banknote')).toHaveAccessibleName(/100 zł/);
  await key(page, 'drawer-banknote');
  await expect(page.locator('#control-banknote-1')).toHaveAttribute('data-held', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-banknote-1')).toHaveAttribute('data-held', 'false');
  expect((await exportState(page, info)).banknotes[0]!.location).toBe('desk');
  await page.locator('#stage').screenshot({ path: info.outputPath('cash-after-visit.png') });
  expect(errors).toEqual([]);
});
