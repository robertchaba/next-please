import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createInitialState, decodeSave, encodeSave, type GameState } from '../../src/core/save';

async function activate(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

async function enterCabinet(page: Page): Promise<void> {
  await page.goto('/');
  await activate(page, 'start');
  for (let step = 0; step < 4; step++) await activate(page, 'intro-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
}

async function importState(page: Page, state: GameState, name = 'session.npsave'): Promise<void> {
  await page.locator('#save-input').setInputFiles({ name, mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
}

async function exportState(page: Page, testInfo: TestInfo): Promise<GameState> {
  const downloaded = page.waitForEvent('download');
  await activate(page, 'export');
  const file = testInfo.outputPath('session.npsave');
  await (await downloaded).saveAs(file);
  return decodeSave(await readFile(file));
}

test('MENU and Escape open the staff room, pausing and preserving the visit and moved paperwork', async ({ page }) => {
  await page.clock.install();
  await enterCabinet(page);
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await activate(page, 'call-patient');
  await page.clock.runFor(180);
  await activate(page, 'take-document');
  await page.locator('#control-apply-stamp').focus();
  await page.keyboard.press('Space');
  for (let step = 0; step < 6; step++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  const paperBounds = await page.locator('#control-apply-stamp').getAttribute('style');
  await activate(page, 'stamp-fit');
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('aria-pressed', 'true');
  const before = await page.locator('#controls').evaluate(element => ({
    clock: element.dataset.clockMinutes, display: element.dataset.clockDisplay,
    frame: element.dataset.patientFrame, motion: element.dataset.patientMotion,
  }));

  await page.getByRole('button', { name: 'MENU', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'POKÓJ SOCJALNY' })).toBeAttached();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'break-room');
  await expect(page.getByRole('button', { name: 'WRÓĆ DO DYŻURU' })).toBeFocused();
  await page.clock.runFor(5000);
  await activate(page, 'start');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#screen-description')).toContainText('Irena Wolska');
  await expect(page.locator('#control-apply-stamp')).toHaveAttribute('style', paperBounds!);
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('#controls').evaluate(element => ({
    clock: element.dataset.clockMinutes, display: element.dataset.clockDisplay,
    frame: element.dataset.patientFrame, motion: element.dataset.patientMotion,
  }))).toEqual(before);

  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'break-room');
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await page.clock.runFor(900);
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-moving', 'false');
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-minutes', before.clock!);
  await activate(page, 'apply-stamp');
  await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
});

test('restart can be canceled and resets progress only after confirmation, retaining preferences', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterCabinet(page);
  await activate(page, 'saves');
  await importState(page, { ...createInitialState(), phase: 'cabinet', introStep: 3, day: 8, money: 120, patientsProcessed: 9 });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  await activate(page, 'call-patient');
  await activate(page, 'lamp');
  await activate(page, 'language-en');
  await page.getByRole('button', { name: 'Enable audio', exact: true }).click();
  await page.getByRole('slider', { name: 'Music volume' }).focus();
  await page.keyboard.press('Home');
  for (let step = 0; step < 27; step++) await page.keyboard.press('ArrowRight');
  const preferences = await page.evaluate(() => localStorage.getItem('next-please.preferences'));

  await activate(page, 'menu');
  await activate(page, 'restart');
  await expect(page.getByRole('dialog')).toContainText('Your current progress will be lost.');
  await expect(page.getByRole('button', { name: 'KEEP MY SHIFT' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'START OVER' })).toBeFocused();
  await activate(page, 'start');
  await expect(page.locator('#screen-description')).toContainText('DAY: 8');
  await expect(page.locator('#screen-description')).toContainText('Irena Wolska');

  await activate(page, 'menu');
  await activate(page, 'restart');
  await page.getByRole('button', { name: 'KEEP MY SHIFT' }).click();
  await expect(page.getByRole('button', { name: 'START OVER' })).toBeFocused();
  await activate(page, 'restart');
  await page.getByRole('button', { name: 'BEGIN A NEW GAME' }).click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'intro');
  await expect(page.locator('#controls')).toHaveAttribute('data-intro-step', '0');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Mute audio', exact: true })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Music volume' })).toHaveValue('27');
  expect(await page.evaluate(() => localStorage.getItem('next-please.preferences'))).toBe(preferences);
  await page.keyboard.press('Escape');
  await activate(page, 'saves');
  expect(await exportState(page, testInfo)).toEqual(createInitialState());
});

for (const phase of ['intro', 'cabinet'] as const) {
  test(`save navigation returns to the staff room and resumes an imported ${phase}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enterCabinet(page);
    await activate(page, 'menu');
    await activate(page, 'saves');
    await expect(page.getByRole('dialog')).toContainText('Sekretarka');
    await activate(page, 'back');
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'break-room');
    await expect(page.getByRole('button', { name: 'TECZKA ZAPISÓW' })).toBeFocused();
    await activate(page, 'saves');
    const state = { ...createInitialState(), phase, introStep: phase === 'cabinet' ? 3 : 2, day: 7, money: 30, patientsProcessed: 4 };
    await importState(page, state);
    await expect(page.getByRole('status')).toContainText('Zapis wczytany');
    await expect(page.getByRole('dialog')).toContainText('DZIEŃ: 7');
    await activate(page, 'back');
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'break-room');
    await activate(page, 'start');
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', phase);
    await expect(page.locator('#controls')).toHaveAttribute('data-intro-step', String(state.introStep));
    if (phase === 'cabinet') await expect(page.locator('#screen-description')).toContainText('DZIEŃ: 7');
    else await expect(page.locator('#screen-description')).toHaveText('Albo długopisu.');
  });
}

test('a delayed import cannot overwrite a newly restarted game', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function (): Promise<ArrayBuffer> {
      const bytes = await original.call(this);
      if (this.name === 'delayed.npsave') {
        await new Promise<void>(resolve => {
          window.addEventListener('release-delayed-save', () => resolve(), { once: true });
          window.dispatchEvent(new Event('delayed-save-ready'));
        });
      }
      return bytes;
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterCabinet(page);
  await activate(page, 'menu');
  await activate(page, 'saves');
  const reading = page.evaluate(() => new Promise<void>(resolve => {
    window.addEventListener('delayed-save-ready', () => resolve(), { once: true });
  }));
  await importState(page, { ...createInitialState(), day: 42, introStep: 2, money: 999 }, 'delayed.npsave');
  await reading;
  await expect(page.getByRole('status')).toContainText('Odczytywanie akt');
  await activate(page, 'back');
  await activate(page, 'restart');
  await activate(page, 'restart-confirm');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'intro');
  await page.evaluate(() => new Promise<void>(resolve => {
    window.dispatchEvent(new Event('release-delayed-save'));
    setTimeout(resolve, 0);
  }));
  await expect(page.locator('#controls')).toHaveAttribute('data-intro-step', '0');
  await expect(page.getByRole('status')).not.toContainText('Zapis wczytany');
  await page.keyboard.press('Escape');
  await activate(page, 'saves');
  expect(await exportState(page, testInfo)).toEqual(createInitialState());
});
