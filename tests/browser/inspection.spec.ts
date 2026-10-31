import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { applyAction, createInitialState, advanceClinicTime, type GameAction, type GameState } from '../../src/core/game';
import { randomStep } from '../../src/core/patients';
import { encodeSave, decodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
function inspectionFixture(): GameState {
  let state = act({ ...createInitialState(17), money: 5000 }, 'skip-intro', 'call-patient', 'take-document', 'take-paper',
    'run-general', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
  for (const paper of state.papers) state = act(state, { type: 'store-paper', paperId: paper.id });
  state = act(advanceClinicTime(state, 1000).state, 'next-day');
  let seed = 1;
  while (randomStep(seed).value >= 1 / 25) seed++;
  return act({ ...state, clockMinutes: 480, rngState: seed }, 'call-patient');
}
async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}
async function nativeClick(page: Page, x: number, y: number): Promise<void> {
  const rect = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(rect.x + x * rect.width / 570, rect.y + y * rect.height / 320);
}
async function load(page: Page, state: GameState): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'inspection.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await key(page, 'back');
  await key(page, 'start');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}
async function exportState(page: Page): Promise<GameState> {
  await key(page, 'saves');
  const pending = page.waitForEvent('download');
  await key(page, 'export');
  const saved = decodeSave(await readFile((await (await pending).path())!));
  await key(page, 'back');
  return saved;
}
async function returnId(page: Page): Promise<void> {
  await key(page, 'take-inspection-id');
  await key(page, 'hand-inspection-paper');
  await expect(page.locator('#screen-description')).toContainText('Proszę o skierowanie i notatkę');
}
async function handFromDrawer(page: Page, id: number): Promise<void> {
  await key(page, 'drawer');
  await key(page, `drawer-paper-${id}`);
  await expect(page.locator(`#control-paper-${id}`)).toHaveAttribute('data-held', 'true');
  await key(page, 'hand-inspection-paper');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
}

test('identity, drawer names and sequential records work with mouse and keyboard across a save', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const initial = inspectionFixture();
  await load(page, initial);
  await expect(page.locator('#control-call-patient')).toBeDisabled();
  await expect(page.locator('#control-take-document')).toHaveCount(0);
  await page.locator('#control-take-inspection-id').click();
  await nativeClick(page, 362, 212);
  const card = (await exportState(page)).papers.find(paper => paper.kind === 'inspection-id')!;
  await expect(page.locator(`#control-paper-${card.id}`)).toHaveAccessibleName(/LEGITYMACJA SŁUŻBOWA/);
  await page.locator('#stage').screenshot({ path: info.outputPath('inspector-id-pl.png') });
  await page.locator(`#control-paper-${card.id}`).click();
  await nativeClick(page, 80, 70);
  await expect(page.locator('#control-talk-inspector')).toHaveAccessibleName(/Proszę o skierowanie i notatkę/);
  await expect(page.locator('#screen-description')).toContainText(translations.pl.patientNames[initial.inspection!.target.patientId]!);
  await key(page, 'drawer');
  const referral = initial.papers.find(paper => paper.kind === 'referral')!, note = initial.papers.find(paper => paper.kind === 'note')!;
  await page.locator(`#control-drawer-paper-${referral.id}`).hover();
  const first = await page.locator('#game').screenshot();
  await page.mouse.move(0, 0);
  await page.locator(`#control-drawer-paper-${note.id}`).focus();
  expect(await page.locator('#game').screenshot()).not.toEqual(first);
  await page.locator('#stage').screenshot({ path: info.outputPath('inspection-drawer-name.png') });
  await key(page, `drawer-paper-${note.id}`);
  await key(page, 'hand-inspection-paper');
  const partial = await exportState(page);
  expect(partial.inspection!.received).toEqual(['note']);
  await handFromDrawer(page, referral.id);
  await expect(page.locator('#patient-speech')).toHaveText(`${translations.pl.inspection.names[initial.inspection!.inspectorId]}: Dziękuję za współpracę. Do widzenia.`);
  await expect(page.locator('#screen-description')).toContainText(translations.pl.inspection.farewell);
  await page.locator('#stage').screenshot({ path: info.outputPath('inspection-farewell-pl.png') });
  const complete = await exportState(page);
  expect(complete.inspection).toBeNull();
  expect(complete.inspectionFines).toBe(0);
  expect(complete.patientsProcessed).toBe(initial.patientsProcessed);
  expect(complete.papers.filter(paper => paper.kind === 'referral' || paper.kind === 'note').every(paper => paper.location === 'desk')).toBe(true);
  await page.clock.runFor(1500);
  await key(page, 'menu');
  await page.clock.runFor(4000);
  await key(page, 'start');
  await expect(page.locator('#patient-speech')).toContainText(translations.pl.inspection.farewell);
  await key(page, 'language-en');
  await expect(page.locator('#patient-speech')).toContainText(translations.en.inspection.farewell);
  await page.locator('#stage').screenshot({ path: info.outputPath('inspection-farewell-en.png') });
  const portrait = () => page.locator('#game').evaluate(canvas => Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(38, 70, 70, 58).data));
  const beforeDeparture = await portrait();
  await page.clock.runFor(1560);
  await expect(page.locator('#patient-speech')).toBeEmpty();
  expect(await portrait()).not.toEqual(beforeDeparture);
  await expect(page.locator('#screen-description')).not.toContainText(translations.en.inspection.farewell);
  await expect(page.locator('#control-call-patient')).toBeEnabled();
  expect(errors).toEqual([]);
});

for (const partial of [false, true]) test(`confirmation and printed ${partial ? 50 : 200} zł fine are localized and charged once`, async ({ page }, info) => {
  const initial = inspectionFixture();
  await load(page, initial);
  await returnId(page);
  if (partial) await handFromDrawer(page, initial.papers.find(paper => paper.kind === 'referral')!.id);
  await key(page, 'talk-inspector');
  await expect(page.locator('#screen-description')).toContainText(partial ? 'brak drugiego dokumentu' : 'zaginięcie obu dokumentów');
  expect((await exportState(page)).inspectionFines).toBe(0);
  await key(page, 'drawer');
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-talk-inspector')).toHaveAccessibleName(/Potwierdź brak dokumentacji/);
  await key(page, 'talk-inspector');
  await expect(page.locator('#patient-speech')).toContainText(translations.pl.inspection.farewell);
  const saved = await exportState(page);
  expect(saved.inspectionFines).toBe(partial ? 50 : 200);
  const fine = saved.papers.find(paper => paper.kind === 'inspection-fine')!;
  expect(fine).toMatchObject({ amount: partial ? 50 : 200, targetDay: 1 });
  await expect(page.locator(`#control-paper-${fine.id}`)).toHaveAccessibleName(/MANDAT KARNY/);
  await page.locator('#stage').screenshot({ path: info.outputPath(`inspection-fine-${partial ? 50 : 200}-pl.png`) });
  await key(page, 'language-en');
  await expect(page.locator('#patient-speech')).toContainText(translations.en.inspection.farewell);
  await expect(page.locator(`#control-paper-${fine.id}`)).toHaveAccessibleName(/PENALTY NOTICE/);
  await page.locator('#stage').screenshot({ path: info.outputPath(`inspection-fine-${partial ? 50 : 200}-en.png`) });
});

for (const reducedMotion of ['reduce', 'no-preference'] as const) test(`inspection farewell precedes home and survives a menu pause (${reducedMotion})`, async ({ page }) => {
  const initial = inspectionFixture();
  initial.clockMinutes = 14 * 60;
  await load(page, initial);
  await page.emulateMedia({ reducedMotion });
  await returnId(page);
  await key(page, 'talk-inspector');
  await key(page, 'talk-inspector');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#patient-speech')).toContainText(translations.pl.inspection.farewell);
  const saved = await exportState(page);
  expect(saved.phase).toBe('home');
  expect(saved.inspection).toBeNull();
  expect(saved.inspectionFines).toBe(200);
  await page.clock.runFor(1500);
  await key(page, 'menu');
  await page.clock.runFor(4000);
  await key(page, 'start');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#patient-speech')).toContainText(translations.pl.inspection.farewell);
  await page.clock.runFor(1560);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'home');
  await expect(page.locator('#patient-speech')).toBeEmpty();
});

test('calling the next patient dismisses the inspector farewell', async ({ page }) => {
  await load(page, inspectionFixture());
  await returnId(page);
  await key(page, 'talk-inspector');
  await key(page, 'talk-inspector');
  await expect(page.locator('#patient-speech')).toContainText(translations.pl.inspection.farewell);
  await key(page, 'call-patient');
  await expect(page.locator('#control-take-document')).toBeVisible();
  await expect(page.locator('#patient-speech')).not.toContainText(translations.pl.inspection.farewell);
  await expect(page.locator('#screen-description')).not.toContainText(translations.pl.inspection.farewell);
});

for (const inspectorId of [0, 1, 2] as const) test(`inspector portrait ${inspectorId + 1} has the corresponding ID`, async ({ page }, info) => {
  const state = inspectionFixture();
  state.inspection = { ...state.inspection!, inspectorId };
  await load(page, state);
  await key(page, 'take-inspection-id');
  await nativeClick(page, 362, 212);
  await expect(page.locator('[id^="control-paper-"]')).toHaveAccessibleName(new RegExp(translations.pl.inspection.names[inspectorId]));
  await page.locator('#stage').screenshot({ path: info.outputPath(`inspector-${inspectorId + 1}.png`) });
});
