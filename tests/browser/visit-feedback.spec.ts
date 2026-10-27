import { expect, test, type Page } from '@playwright/test';
import { applyAction, type GameAction, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { knownQueueState } from './fixtures';

const act = (page: Page, id: string) => page.locator(`#control-${id}`).evaluate(element => (element as HTMLButtonElement).click());
const visit = (): GameState => (['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit'] as GameAction[])
  .reduce((state, action) => applyAction(state, action).state, knownQueueState());

async function load(page: Page, state: GameState): Promise<void> {
  await page.clock.install();
  await page.goto('/');
  await act(page, 'start');
  for (let step = 0; step < 4; step++) await act(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await act(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'visit.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await act(page, 'back');
}

test('a complaint waits two visible seconds and the patient departure; panels pause delivery', async ({ page }) => {
  const state = visit();
  const letterId = applyAction(state, 'return-document').state.papers.find(paper => paper.kind === 'letter')!.id;
  await load(page, state);
  await act(page, 'return-document');
  await expect(page.locator(`#control-paper-${letterId}`)).toHaveCount(0);
  await expect(page.locator('#screen-description')).not.toContainText('Korespondencja');
  await page.clock.runFor(720);
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await act(page, 'menu');
  await page.clock.runFor(3000);
  await act(page, 'start');
  await page.clock.runFor(1260);
  await expect(page.locator(`#control-paper-${letterId}`)).toHaveCount(0);
  await page.clock.runFor(60);
  await expect(page.locator(`#control-paper-${letterId}`)).toBeVisible();
});

test('every examination shows a short localized comment which expires and pauses in panels', async ({ page }) => {
  await load(page, visit());
  await act(page, 'run-general');
  await expect(page.locator('#clinic-speech')).toHaveText('Lekarz: W normie.');
  await page.locator('#game').screenshot({ path: '/tmp/next-please-doctor-comment-pl.png' });
  await act(page, 'language-en');
  await expect(page.locator('#clinic-speech')).toHaveText('Doctor: Normal.');
  await act(page, 'menu');
  await page.clock.runFor(2400);
  await act(page, 'start');
  await expect(page.locator('#clinic-speech')).toHaveText('Doctor: Normal.');
  await page.clock.runFor(1920);
  await expect(page.locator('#clinic-speech')).toBeEmpty();
  await act(page, 'run-vision');
  await expect(page.locator('#clinic-speech')).toHaveText('Doctor: All in order.');
  await act(page, 'run-pressure');
  await expect(page.locator('#clinic-speech')).toHaveText('Doctor: No problems found.');
  await act(page, 'language-pl');
  await expect(page.locator('#clinic-speech')).toHaveText('Lekarz: Nie stwierdzono problemów.');
  await page.locator('#game').screenshot({ path: '/tmp/next-please-doctor-long-comment-pl.png' });
  await act(page, 'language-en');
  await act(page, 'run-measurements');
  await expect(page.locator('#clinic-speech')).toContainText(/Doctor: \d+ kg \/ \d+ cm/);
});

test('the clock progresses after 14 and the cleaner calls once at 17 with mute respected', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().includes('cleaner-')) requests.push(request.url()); });
  await load(page, { ...visit(), clockMinutes: 1019 });
  await act(page, 'lamp');
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-minutes', '1020');
  await expect(page.locator('#clinic-speech')).toHaveText('Sprzątaczka z korytarza: Zamykamy już!');
  await page.clock.runFor(840);
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-display', '1020');
  expect(requests).toHaveLength(0);
  await page.clock.runFor(3000);
  await act(page, 'lamp');
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-minutes', '1024');
  await expect(page.locator('#clinic-speech')).toBeEmpty();
});

for (const action of ['run-pressure', 'lamp', 'pickup-stamp', 'drawer-retrieve']) test(`17:15 interrupts during ${action}, clears carrying and goes home without a bonus`, async ({ page }) => {
  let state = visit();
  if (action === 'drawer-retrieve') {
    state = applyAction(state, 'take-paper').state;
    state = applyAction(state, { type: 'store-paper', paperId: state.nextPaperId - 1 }).state;
  }
  await load(page, { ...state, clockMinutes: 1034 });
  if (action === 'pickup-stamp') await page.locator('#control-stamp-fit').click();
  else if (action === 'drawer-retrieve') {
    await act(page, 'drawer');
    await page.locator('[id^=control-drawer-paper-]').first().evaluate(element => (element as HTMLElement).click());
  } else await act(page, action);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#control-run-general')).toHaveCount(0);
  await page.clock.runFor(840);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'home');
  await expect(page.locator('#control-home-next')).toBeFocused();
  await act(page, 'home-next'); // reveal
  await act(page, 'home-next'); // budget
  await expect(page.locator('#screen-description')).toContainText('Premia za pacjentów: 0 zł');
});

for (const locale of ['pl', 'en'] as const) test(`the ${locale} cleaner voice decodes and plays locally after a gesture`, async ({ page }) => {
  await load(page, { ...visit(), clockMinutes: 1019 });
  await page.clock.resume();
  if (locale === 'en') await act(page, 'language-en');
  await page.locator('#control-sound').click();
  const playback = page.evaluate(language => new Promise<{ state: string; muted: boolean; duration: number }>(resolve => {
    const sound = window.Howler._howls.find(sound => String(sound._src).endsWith(`/cleaner-${language}.wav`))!;
    sound.once('play', () => resolve({ state: sound.state(), muted: sound.mute(), duration: sound.duration() }));
  }), locale);
  await act(page, 'lamp');
  const result = await playback;
  expect(result.state).toBe('loaded');
  expect(result.muted).toBe(false);
  expect(result.duration).toBeGreaterThan(1.5);
  expect(result.duration).toBeLessThan(2);
  await expect(page.locator('#clinic-speech')).toContainText(locale === 'pl' ? 'Zamykamy już!' : 'We are closing now!');
  await page.locator('#game').screenshot({ path: `/tmp/next-please-cleaner-${locale}.png` });
});

test('the doctor can examine before taking the referral and later notes keep those findings', async ({ page }) => {
  await load(page, applyAction(knownQueueState(), 'call-patient').state);
  for (const action of ['run-general', 'run-vision', 'run-pressure', 'run-measurements']) {
    await act(page, action);
    await expect(page.locator('#clinic-speech')).not.toBeEmpty();
    await expect(page.locator('#control-take-document')).toBeVisible();
  }
  await expect(page.locator('#screen-description')).toContainText('Badanie ogólne: bez uwag');
  await expect(page.locator('#screen-description')).not.toContainText('CIŚNIENIE: BRAK');
  await act(page, 'take-paper');
  await page.keyboard.press('Escape');
  const note = page.locator('#control-paper-1');
  await expect(note).toHaveAttribute('aria-label', /Wiek: 41/);
  await expect(note).toHaveAttribute('aria-label', /bez uwag/);
  await expect(note).toHaveAttribute('aria-label', /Ciśnienie: 108\/62/);
  await expect(note).toHaveAttribute('aria-label', /kg/);
  await expect(page.locator('#control-take-document')).toBeVisible();
  await act(page, 'take-document');
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-take-document')).toHaveCount(0);
  await expect(note).toHaveAttribute('aria-label', /Wiek: 41/);
});
