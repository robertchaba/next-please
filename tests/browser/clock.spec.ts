import { expect, test, type Page } from '@playwright/test';
import { applyAction, type GameAction, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { knownQueueState } from './fixtures';

const act = (page: Page, id: string) => page.locator(`#control-${id}`).evaluate(element => (element as HTMLElement).click());
const minutes = (page: Page) => page.locator('#controls').getAttribute('data-clock-minutes').then(Number);
async function load(page: Page, state = knownQueueState()): Promise<void> {
  const now = new Date('2026-10-26T12:00:00Z');
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await act(page, 'start');
  for (let i = 0; i < 4; i++) await act(page, 'intro-next');
  await act(page, 'saves');
  await importState(page, state);
  await act(page, 'back');
}
async function importState(page: Page, state: GameState): Promise<void> {
  await page.locator('#save-input').setInputFiles({ name: 'clock.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
}

test('30 real seconds add 5 minutes alone or 30 with a patient, alongside action costs', async ({ page }) => {
  await load(page);
  await page.clock.runFor(30_000);
  expect(await minutes(page)).toBe(482);
  await act(page, 'call-patient');
  expect(await minutes(page)).toBe(483);
  await page.locator('#control-run-general').focus();
  await page.clock.runFor(30_000);
  expect(await minutes(page)).toBe(513);
  await expect(page.locator('#control-run-general')).toBeFocused();
  await expect(page.locator('#screen-description')).toContainText('Zegar: 08:33');
  await act(page, 'run-pressure');
  expect(await minutes(page)).toBe(517);
});

test('reading the manual and browsing the drawer retain the rate for patient presence', async ({ page }) => {
  await load(page);
  await act(page, 'manual');
  const reading = await minutes(page);
  await page.clock.runFor(6000);
  expect(await minutes(page)).toBe(reading + 1);
  await act(page, 'drawer');
  await page.clock.runFor(6000);
  expect(await minutes(page)).toBe(reading + 2);
  await act(page, 'drawer-close');
  await act(page, 'call-patient');
  const active = await minutes(page);
  await page.clock.runFor(1000);
  expect(await minutes(page)).toBe(active + 1);
  await act(page, 'drawer');
  await page.clock.runFor(1000);
  expect(await minutes(page)).toBe(active + 2);
});

test('menu, archive, hidden tabs and mobile reception pause without losing the partial minute', async ({ page }) => {
  await load(page, applyAction(knownQueueState(), 'call-patient').state);
  await page.clock.runFor(400);
  await act(page, 'menu');
  await page.clock.fastForward(60_000);
  await act(page, 'saves');
  await page.clock.fastForward(60_000);
  await act(page, 'back');
  await act(page, 'start');
  expect(await minutes(page)).toBe(480);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(60_000);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.setViewportSize({ width: 430, height: 850 });
  await expect(page.locator('#app')).toBeHidden();
  await page.clock.fastForward(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#app')).toBeVisible();
  expect(await minutes(page)).toBe(480);
  await page.clock.runFor(600);
  expect(await minutes(page)).toBe(481);
});

test('admissions end and the cleaner closes a visit even without another action', async ({ page }) => {
  await load(page, { ...knownQueueState(), clockMinutes: 839 });
  await page.clock.runFor(6000);
  expect(await minutes(page)).toBe(840);
  await expect(page.locator('#control-end-day-home')).toBeVisible();
  await expect(page.locator('#control-call-patient')).toHaveCount(0);
  await expect(page.locator('#control-run-general')).toHaveCount(0);
  await act(page, 'saves');
  await importState(page, { ...applyAction(knownQueueState(), 'call-patient').state, clockMinutes: 1019 });
  await act(page, 'back');
  await page.clock.runFor(1000);
  await expect(page.locator('#clinic-speech')).toContainText('Zamykamy już!');
  expect(await minutes(page)).toBe(1020);
  await act(page, 'drawer');
  await page.clock.runFor(15_000);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'home');
  await expect(page.locator('#control-home-next')).toBeFocused();
  await act(page, 'home-next');
  await expect(page.locator('#screen-description')).toContainText('Premia za pacjentów: 0 zł');
});

test('successful import resets partial time; a failed import retains it', async ({ page }) => {
  const state = applyAction(knownQueueState(), 'call-patient').state;
  await load(page, state);
  await page.clock.runFor(900);
  await act(page, 'saves');
  await importState(page, state);
  await act(page, 'back');
  await page.clock.runFor(400);
  expect(await minutes(page)).toBe(480);
  await act(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'broken.npsave', mimeType: 'application/gzip', buffer: Buffer.from('broken') });
  await expect(page.locator('#announcement')).not.toContainText('Zapis wczytany');
  await act(page, 'back');
  await page.clock.runFor(600);
  expect(await minutes(page)).toBe(481);
});

test('handing back the certificate restores the empty-room rate', async ({ page }) => {
  const actions: GameAction[] = ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit'];
  await load(page, actions.reduce((state, action) => applyAction(state, action).state, knownQueueState()));
  await act(page, 'return-document');
  const departed = await minutes(page);
  await page.clock.runFor(6000);
  expect(await minutes(page)).toBe(departed + 1);
  await expect(page.locator('#control-call-patient')).toBeVisible();
});

for (const patient of [false, true]) test(`elapsed closing clears a carried stamp and settles once (patient: ${patient})`, async ({ page }) => {
  const state = patient ? applyAction(knownQueueState(), 'call-patient').state : knownQueueState();
  await load(page, { ...state, clockMinutes: 1033 });
  await page.locator('#control-stamp-fit').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  expect(await minutes(page)).toBe(1034);
  await page.clock.runFor(patient ? 1000 : 6000);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'home');
  await expect(page.locator('#control-home-next')).toBeFocused();
  await act(page, 'home-next');
  const budget = await page.locator('#screen-description').textContent();
  expect(budget).toContain('Premia za pacjentów: 0 zł');
  await page.clock.fastForward(60_000);
  await expect(page.locator('#screen-description')).toHaveText(budget!);
  expect(await minutes(page)).toBe(1035);
});
