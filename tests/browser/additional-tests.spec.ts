import { readFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { applyAction, createInitialState, type GameAction, type GameState } from '../../src/core/game';
import { additionalResultFor } from '../../src/core/additional-tests';
import { PATIENTS } from '../../src/core/patients';
import { decodeSave, encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';

const actions = (state: GameState, ...items: GameAction[]): GameState => items.reduce((next, action) => applyAction(next, action).state, state);
function seventhDay(): GameState {
  let state = { ...actions(createInitialState(71), 'skip-intro'), money: 5000 };
  for (let steps = 0; state.day < 9 && steps < 12; steps++) {
    if (state.phase === 'cabinet') state = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
    state = applyAction(state, 'next-day').state;
  }
  expect(state.day).toBe(9);
  expect(state.ending).toBeNull();
  const patient = PATIENTS.find(patient => patient.jobId === 18 && patient.general === 'pass' && patient.vision === 'pass' && patient.pressure === 'pass' && additionalResultFor(patient, 'audiometry').fit)!;
  return { ...state, clockMinutes: 480, roster: [patient.id, ...state.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)] };
}
async function key(page: Page, id: string, value = 'Enter'): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press(value);
}
async function place(page: Page, x = 350, y = 208): Promise<void> {
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + x * stage.width / 570, stage.y + y * stage.height / 320);
}
async function importState(page: Page, state: GameState): Promise<void> {
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'additional-tests.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
  await key(page, 'back');
}
async function exportState(page: Page, info: TestInfo): Promise<GameState> {
  await key(page, 'saves');
  const pending = page.waitForEvent('download');
  await key(page, 'export');
  const download = await pending, filename = info.outputPath('additional-tests.npsave');
  await download.saveAs(filename);
  const state = decodeSave(await readFile(filename));
  await key(page, 'back');
  return state;
}

test('third-drawer referral circles exactly one test, keeps records and restores the visit with a result', async ({ page }, info) => {
  const errors: string[] = [], missing: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/assets/art/')) missing.push(response.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await key(page, 'start');
  for (let index = 0; index < 4; index++) await key(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const initial = seventhDay();
  await importState(page, initial);
  const directive = initial.papers.find(paper => paper.kind === 'directive' && paper.rule === 'additional-tests')!;
  await key(page, `paper-${directive.id}`, 'Space');
  await place(page);
  await key(page, `paper-action-${directive.id}`);
  await expect(page.locator(`#control-paper-${directive.id}`)).toHaveAccessibleName(/Badania dodatkowe/);
  await page.locator('#stage').screenshot({ path: info.outputPath('additional-directive-pl.png') });
  await key(page, `paper-${directive.id}`, 'Space');
  await place(page, 110, 210);
  await expect(page.locator('#control-take-additional-referral')).toBeEnabled();
  await expect(page.locator('#control-reserved-form-4')).toBeDisabled();
  await key(page, 'call-patient');
  await key(page, 'take-document');
  await place(page, 310, 200);
  await key(page, 'run-general');
  await key(page, 'take-paper');
  await place(page, 340, 210);
  const before = await exportState(page, info);
  const patientId = before.visit!.patientId;
  const referralId = before.nextPaperId;
  await key(page, 'take-additional-referral');
  await expect(page.locator(`#control-paper-${referralId}`)).toHaveAttribute('data-held', 'true');
  await place(page);
  await page.locator(`#control-select-additional-test-${referralId}-psychiatry`).click();
  await key(page, `select-additional-test-${referralId}-audiometry`);
  await expect(page.locator(`#control-select-additional-test-${referralId}-audiometry`)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`#control-select-additional-test-${referralId}-psychiatry`)).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator(`#control-paper-${referralId}`)).toHaveAccessibleName(/Zakreślono: Audiometria tonalna/);
  await page.locator('#stage').screenshot({ path: info.outputPath('additional-referral-pl.png') });
  await key(page, 'language-en');
  await expect(page.locator(`#control-paper-${referralId}`)).toHaveAccessibleName(/Circled: Pure-tone audiometry/);
  await key(page, 'language-pl');
  // Carry the note at the top of a bundle: only its selected referral leaves.
  const chosen = await exportState(page, info);
  const noteId = before.papers.find(paper => paper.kind === 'note' && paper.patientId === patientId)!.id;
  const bundled = actions(chosen, { type: 'clip-document', documentId: noteId }, { type: 'join-documents', documentId: referralId, targetId: noteId });
  await importState(page, bundled);
  await key(page, `paper-${noteId}`, 'Space');
  await key(page, 'hand-additional-referral');
  await expect(page.locator(`#control-paper-${referralId}`)).toHaveCount(0);
  const sent = await exportState(page, info);
  expect(sent.visit).toBeNull();
  expect(sent.pendingReferrals).toHaveLength(1);
  expect(sent.pendingReferrals[0]!.visit.generalTested).toBe(true);
  expect(sent.pendingReferrals[0]!.visit.patientId).toBe(patientId);
  expect(sent.papers.filter(paper => paper.patientId === patientId)).toEqual(before.papers.filter(paper => paper.patientId === patientId));
  expect(sent.daily.fines).toBe(before.daily.fines);
  expect(sent.paperClips).toContainEqual([noteId]);
  let later = applyAction({ ...sent, clockMinutes: 840 }, 'end-day').state;
  for (let steps = 0; later.phase === 'home' && steps < 4; steps++) later = applyAction(later, 'next-day').state;
  expect(later.phase).toBe('cabinet');
  await importState(page, { ...later, clockMinutes: 480 });
  await key(page, 'call-patient');
  await expect(page.locator('#announcement')).toContainText('Pacjent wrócił z wynikiem');
  const resultId = later.nextPaperId;
  await expect(page.locator(`#control-paper-${resultId}`)).toHaveAccessibleName(new RegExp(translations.pl.additionalTests.report.audiometry.fit));
  await expect(page.locator(`#control-paper-${noteId}`)).toHaveAccessibleName(/Audiometria tonalna: słuch w normie/);
  await key(page, `paper-${resultId}`, 'Space');
  await place(page);
  await page.locator('#stage').screenshot({ path: info.outputPath('additional-result-pl.png') });
  await key(page, 'language-en');
  await expect(page.locator(`#control-paper-${resultId}`)).toHaveAccessibleName(/Hearing is normal/);
  await expect(page.locator(`#control-paper-${noteId}`)).toHaveAccessibleName(/Pure-tone audiometry: normal hearing/);
  const returned = await exportState(page, info);
  expect(returned.visit).toMatchObject({ patientId, generalTested: true, startedDay: before.day, additionalResult: { test: 'audiometry', fit: true } });
  expect(returned.pendingReferrals).toHaveLength(0);
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});

for (const attached of [true, false]) test(`returning worker receives ${attached ? 'a clipped report without a reprimand' : 'a guaranteed reprimand for the missing attachment'}`, async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let state = actions(seventhDay(), 'call-patient');
  state = { ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, ageDays: 0, seal: 'clear', authentic: true }, bribe: 'none' } };
  state = actions(state, 'take-document', 'take-additional-referral');
  const referralId = state.papers.at(-1)!.id;
  state = actions({ ...state, rngState: 1 }, { type: 'select-additional-test', paperId: referralId, test: 'audiometry' }, { type: 'hand-additional-referral', paperId: referralId });
  const returnDay = state.pendingReferrals[0]!.returnDay;
  state = actions({ ...state, clockMinutes: 840 }, 'end-day');
  while (state.day < returnDay) state = actions(state, 'next-day');
  state = actions({ ...state, clockMinutes: 480 }, 'call-patient', 'take-certificate', 'write-certificate', 'stamp-fit');
  const report = state.papers.find(paper => paper.kind === 'additional-result')!;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await key(page, 'start');
  for (let index = 0; index < 4; index++) await key(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await importState(page, state);
  if (attached) {
    await key(page, 'take-clip');
    await key(page, 'apply-stamp');
    await key(page, `paper-${report.id}`, 'Space');
    await key(page, 'certificate-clip');
    await expect(page.locator(`#control-paper-clip-${report.id}`)).toBeAttached();
    await key(page, `paper-${report.id}`, 'Space');
  } else await key(page, 'apply-stamp', 'Space');
  await key(page, 'return-document');
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  if (attached) await expect(page.locator(`#control-paper-${report.id}`)).toHaveCount(0);
  else {
    await expect(page.locator(`#control-paper-${report.id}`)).toBeAttached();
    await expect(page.locator(`#control-paper-${state.nextPaperId}`)).toHaveCount(0);
  }
  await page.clock.runFor(2100);
  if (!attached) {
    const letter = `paper-${state.nextPaperId}`;
    await expect(page.locator(`#control-${letter}`)).toHaveAccessibleName(/koperta/i);
    await key(page, letter, 'Space');
    await place(page);
    await key(page, `paper-action-${state.nextPaperId}`);
    await expect(page.locator(`#control-${letter}`)).toHaveAccessibleName(/wynik.*badani/i);
    await page.locator('#stage').screenshot({ path: info.outputPath('missing-result-reprimand-pl.png') });
    await key(page, 'language-en');
    await expect(page.locator(`#control-${letter}`)).toHaveAccessibleName(/examination report/i);
  }
  const final = await exportState(page, info);
  expect(final.visit).toBeNull();
  expect(final.insuranceRate).toBe(state.insuranceRate + (attached ? 0 : state.insuranceRate === 300 ? 50 : 100));
  expect(final.papers.filter(paper => paper.kind === 'letter' && paper.reason === 'missing-result')).toHaveLength(attached ? 0 : 1);
  expect(errors).toEqual([]);
});
