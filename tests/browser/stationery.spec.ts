import { expect, test, type Page } from '@playwright/test';
import { applyAction, createInitialState, type GameAction, type GameState } from '../../src/core/game';
import { additionalResultFor } from '../../src/core/additional-tests';
import { PATIENTS } from '../../src/core/patients';
import { decodeSave, encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';
import { knownQueueState } from './fixtures';

const actions = (state: GameState, ...items: GameAction[]): GameState => items.reduce((next, action) => applyAction(next, action).state, state);

function seventhDay(job: number): GameState {
  let state = { ...actions(createInitialState(71), 'skip-intro'), money: 5000 };
  while (state.day < 9) {
    if (state.phase === 'cabinet') state = actions({ ...state, clockMinutes: 840 }, 'end-day');
    state = actions(state, 'next-day');
  }
  const patient = PATIENTS.find(patient => patient.jobId === job && patient.general === 'pass'
    && patient.vision === 'pass' && patient.pressure === 'pass' && additionalResultFor(patient, 'audiometry').fit)!;
  return { ...state, roster: [patient.id, ...state.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)] };
}

function resultState(): GameState {
  let state = actions(seventhDay(18), 'call-patient', 'take-document', 'take-paper', 'take-additional-referral');
  const id = state.papers.at(-1)!.id;
  state = actions({ ...state, rngState: 1 }, { type: 'select-additional-test', paperId: id, test: 'audiometry' }, { type: 'hand-additional-referral', paperId: id });
  const returnDay = state.pendingReferrals[0]!.returnDay;
  state = actions({ ...state, clockMinutes: 840 }, 'end-day');
  while (state.day < returnDay) state = actions(state, 'next-day');
  return actions(state, 'call-patient');
}

function envelopeState(): GameState {
  for (let seed = 1; seed < 100; seed++) {
    const state = actions({ ...knownQueueState(), rngState: seed }, 'call-patient', 'take-document',
      'take-certificate', 'write-certificate', 'stamp-unfit', 'return-document');
    if (state.papers.some(paper => paper.kind === 'letter')) return state;
  }
  throw new Error('No detected refusal in the deterministic fixture search');
}

async function key(page: Page, id: string, value = 'Enter'): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press(value);
}

async function load(page: Page, state: GameState, locale: 'pl' | 'en'): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  await key(page, 'start');
  for (let step = 0; step < 4; step++) await key(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await key(page, `language-${locale}`);
  const bytes = encodeSave(state);
  expect(decodeSave(bytes)).toEqual(state);
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'stationery.npsave', mimeType: 'application/gzip', buffer: Buffer.from(bytes) });
  await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
  await key(page, 'back');
}

async function place(page: Page, id: string): Promise<void> {
  await key(page, id, 'Space');
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + 350 * stage.width / 570, stage.y + 208 * stage.height / 320);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
}

for (const [job, variant, locale] of [[0, 'employer', 'pl'], [45, 'militia', 'pl'], [46, 'lot', 'en']] as const) {
  test(`institutional ${variant} referral retains legible identity and authentication in ${locale}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const called = actions(seventhDay(job), 'call-patient');
    const state = actions({ ...called, visit: { ...called.visit!,
      referral: { ...called.visit!.referral, ageDays: 0, seal: 'clear', authentic: true } } }, 'take-document');
    const paper = state.papers.find(paper => paper.kind === 'referral')!;
    await load(page, state, locale);
    await place(page, `paper-${paper.id}`);
    const issuer = variant === 'employer' ? translations[locale].patientReferrals[paper.patientId!]!.employer : translations[locale].paperwork.stationery[variant];
    await expect(page.locator(`#control-paper-${paper.id}`)).toHaveAccessibleName(new RegExp(issuer));
    await expect(page.locator(`#control-paper-${paper.id}`)).toHaveAccessibleName(new RegExp(translations[locale].patientNames[paper.patientId!]!));
    await expect(page.locator(`#control-paper-${paper.id}`)).toHaveAccessibleName(new RegExp(translations[locale].patientJobs[paper.patientId!]!));
    await page.locator(`#control-language-${locale}`).focus();
    await page.locator('#stage').screenshot({ path: info.outputPath(`paperwork-v083-${variant}-${locale}-screen.png`) });
    expect(errors).toEqual([]);
  });
}

test('signed certificate and returned examination report show distinct printed and written fields', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const certificate = actions(knownQueueState(), 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit');
  await load(page, certificate, 'pl');
  await place(page, 'apply-stamp');
  await expect(page.locator('#control-apply-stamp')).toHaveAccessibleName(/Irena Wolska/);
  await expect(page.locator('#control-apply-stamp')).toHaveAccessibleName(/ZDOLNY/);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: info.outputPath('paperwork-v083-certificate-pl-screen.png') });
  const certificateBounds = (await page.locator('#control-apply-stamp').boundingBox())!;

  const state = resultState();
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'report.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await key(page, 'back');
  const report = state.papers.find(paper => paper.kind === 'additional-result')!;
  await place(page, `paper-${report.id}`);
  await expect(page.locator(`#control-paper-${report.id}`)).toHaveAccessibleName(/Audiometria tonalna/);
  await expect(page.locator(`#control-paper-${report.id}`)).toHaveAccessibleName(/Słuch w normie/);
  const reportBounds = (await page.locator(`#control-paper-${report.id}`).boundingBox())!;
  expect(reportBounds.width).toBeCloseTo(certificateBounds.width);
  expect(reportBounds.height).toBeCloseTo(certificateBounds.height);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: info.outputPath('paperwork-v083-additional-result-pl-screen.png') });
  await key(page, 'language-en');
  await expect(page.locator(`#control-paper-${report.id}`)).toHaveAccessibleName(/Hearing is normal/);
  await page.locator('#stage').screenshot({ path: info.outputPath('paperwork-v084-additional-result-en-screen.png') });
  expect(errors).toEqual([]);
});

test('generated envelope keeps sender readable and opens by its keyboard corner control', async ({ page }, info) => {
  const errors: string[] = [], missing: string[] = [];
  const postage = page.waitForResponse(response => response.url().includes('/sprites/paper-envelope-postage.png') && response.status() === 200);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/assets/art/')) missing.push(response.url()); });
  const state = envelopeState();
  const letter = state.papers.find(paper => paper.kind === 'letter')!;
  await load(page, state, 'pl');
  await postage;
  await place(page, `paper-${letter.id}`);
  await expect(page.locator(`#control-paper-${letter.id}`)).toHaveAccessibleName(/Zamknięta koperta/);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: info.outputPath('paperwork-v083-envelope-pl-screen.png') });
  await key(page, 'language-en');
  await page.locator('#stage').screenshot({ path: info.outputPath('paperwork-v084-envelope-en-screen.png') });
  await key(page, 'language-pl');
  await key(page, `paper-action-${letter.id}`);
  await expect(page.locator(`#control-paper-${letter.id}`)).toHaveAccessibleName(/Pismo w sprawie orzeczenia/);
  await expect(page.locator(`#control-paper-${letter.id}`)).not.toHaveAccessibleName(/Zamknięta koperta/);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: info.outputPath('paperwork-revision-letter-pl-screen.png') });
  expect(errors).toEqual([]);
  expect(missing).toEqual([]);
});
