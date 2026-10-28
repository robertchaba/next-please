import { PATIENTS } from '../../src/core/patients';
import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createInitialState, decodeSave, encodeSave } from '../../src/core/save';

async function expectSurroundFit(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => {
    const elements = [...document.querySelectorAll<HTMLElement>('#viewport, .surround-bottom')];
    const bounds = elements.map(element => element.getBoundingClientRect());
    const inWindow = (box: DOMRect) => box.left >= -0.5 && box.right <= innerWidth + 0.5
      && box.top >= -0.5 && box.bottom <= innerHeight + 0.5;
    const canvas = document.querySelector('#game')!.getBoundingClientRect();
    const controls = [...document.querySelectorAll<HTMLElement>('#utility-controls button, #utility-controls input, #session-controls button')]
      .filter(control => control.getClientRects().length > 0).map(control => control.getBoundingClientRect());
    return bounds.every((box, index) => inWindow(box) && (index === 0 || bounds[index - 1].bottom <= box.top + 0.5))
      && controls.every(box => inWindow(box) && (box.bottom <= canvas.top || box.top >= canvas.bottom
        || box.right <= canvas.left || box.left >= canvas.right));
  })).toBe(true);
}

async function expectExternalUtilities(page: Page): Promise<void> {
  for (const id of ['volume', 'previous-track', 'next-track', 'sound', 'language-pl', 'language-en', 'fullscreen']) {
    await expect(page.locator(`#utility-controls #control-${id}`)).toBeVisible();
    await expect(page.locator(`#viewport #control-${id}`)).toHaveCount(0);
  }
  await expectSurroundFit(page);
}

test('Polish default, English persistence, credits and keyboard controls', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.getByRole('button', { name: 'ROZPOCZNIJ DYŻUR' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Udostępnij', exact: true })).toBeVisible();
  await expect(page.locator('#screen-description')).toContainText('WERSJA 0.8.4 / TECZKA');
  await page.waitForFunction(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('title-clinic.png')));
  await page.screenshot({ path: testInfo.outputPath('welcome-pl.png') });
  await page.getByRole('button', { name: 'O AUTORZE', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('PRZY WSPARCIU NARZĘDZI AI: CODEX, MODELE OPENAI, SUNO');
  await page.screenshot({ path: testInfo.outputPath('credits-pl.png') });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.getByRole('button', { name: 'BEGIN YOUR SHIFT' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share', exact: true })).toBeVisible();
  await expect(page.locator('#screen-description')).toContainText('VERSION 0.8.4 / FOLDER');
  await page.screenshot({ path: testInfo.outputPath('welcome-en.png') });
  await page.getByRole('button', { name: 'CREDITS', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Robert Chaba');
  await expect(page.getByRole('dialog')).not.toContainText('Papers, Please');
  await expect(page.getByRole('dialog')).toContainText('WITH SUPPORT FROM AI TOOLS: CODEX, OPENAI MODELS, SUNO');
  await expect(page.getByRole('dialog')).not.toContainText('Officious March');
  await expect(page.getByRole('dialog')).not.toContainText('TITLE ART');
  await expect(page.getByRole('link', { name: 'github.com/robertchaba' })).toHaveAttribute('href', 'https://github.com/robertchaba');
  await page.screenshot({ path: testInfo.outputPath('credits-en.png') });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'CREDITS', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'BEGIN YOUR SHIFT' }).click();
  await expect(page.getByRole('heading', { name: 'STAFF INDUCTION' })).toBeAttached();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'intro');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Enable audio' }).click();
  await expect(page.getByRole('button', { name: 'Mute audio' })).toBeVisible();
  expect(errors).toEqual([]);
  expect(requests.every(url => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
});

test('save files round-trip and reject corrupt imports without replacing state', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'TECZKA ZAPISÓW' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'EKSPORTUJ' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('next-please-day-1.npsave');
  const filePath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(filePath);
  const initial = decodeSave(await readFile(filePath));
  expect(initial).toEqual({ ...createInitialState(), rngState: initial.rngState, roster: initial.roster });
  expect(initial.roster).toHaveLength(118);
  expect(new Set(initial.roster.map(id => PATIENTS[id]!.characterId)).size).toBe(118);
  const state = { ...createInitialState(), day: 8, money: 1200, patientsProcessed: 43 };
  await page.locator('#save-input').setInputFiles({ name: 'shift.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await expect(page.getByRole('dialog')).toContainText('DZIEŃ: 8');
  await page.screenshot({ path: testInfo.outputPath('saves-pl.png') });
  await page.locator('#save-input').setInputFiles({ name: 'broken.npsave', mimeType: 'application/gzip', buffer: Buffer.from('not a save') });
  await expect(page.getByRole('status')).toContainText('Nieprawidłowy lub uszkodzony');
  await expect(page.getByRole('dialog')).toContainText('DZIEŃ: 8');
});

test('native resolution, integer scaling, fullscreen and small-screen fit', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('#game')).toHaveAttribute('width', '570');
  await expect(page.locator('#game')).toHaveAttribute('height', '320');
  await expect(page.locator('#app')).toHaveAttribute('data-scale', '2');
  await expect(page.locator('.surround-top, #outer-label')).toHaveCount(0);
  await expect(page.locator('.surround-bottom')).toHaveCSS('font-size', '16px');
  await expect(page.locator('#control-language-pl')).toHaveCSS('font-size', '14px');
  await expect(page.locator('#control-language-en')).toHaveCSS('font-size', '14px');
  expect(await page.locator('#game').boundingBox()).toMatchObject({ width: 1140, height: 640 });
  await expectExternalUtilities(page);
  await page.getByRole('button', { name: 'Pełny ekran', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expectExternalUtilities(page);
  expect(await page.evaluate(() => document.fullscreenElement!.contains(document.querySelector('#utility-controls')))).toBe(true);
  await page.getByRole('button', { name: 'Opuść pełny ekran' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.getByRole('button', { name: 'O AUTORZE', exact: true }).click();
  await page.getByRole('link').focus();
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect(page.getByRole('link')).toBeFocused();
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 540, height: 480 });
  await expect.poll(async () => (await page.locator('#game').boundingBox())!.width).toBeLessThanOrEqual(524);
  const bounds = await page.locator('#game').boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(524);
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.height / bounds!.width).toBeCloseTo(320 / 570, 3);
  await expectExternalUtilities(page);
  await page.screenshot({ path: testInfo.outputPath('welcome-mobile.png') });
  await page.getByRole('button', { name: 'O AUTORZE', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('external controls fit both languages, including short landscape screens', async ({ page }) => {
  await page.goto('/');
  for (const size of [{ width: 1200, height: 720 }, { width: 800, height: 500 }, { width: 844, height: 390 }, { width: 540, height: 480 }, { width: 540, height: 400 }]) {
    await page.setViewportSize(size);
    for (const language of ['English', 'Polski']) {
      await page.getByRole('button', { name: language, exact: true }).click();
      await expectExternalUtilities(page);
    }
  }
});

test('intro and cabinet keep utility and session controls outside the full scene in fullscreen', async ({ page }) => {
  await page.goto('/');
  await page.locator('#control-start').click();
  await expectExternalUtilities(page);
  await expect(page.locator('#session-controls button')).toHaveCount(0);
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expectExternalUtilities(page);
  await expect(page.locator('#session-controls #control-menu')).toBeVisible();
  await expect(page.locator('#session-controls #control-saves')).toBeVisible();
  await expect(page.locator('#viewport #control-menu, #viewport #control-saves')).toHaveCount(0);
  await page.locator('#control-fullscreen').click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expectExternalUtilities(page);
  await page.locator('#control-language-en').click();
  await expect(page.locator('#session-controls #control-saves')).toHaveAccessibleName('SAVES');
  await expectExternalUtilities(page);
  await page.locator('#control-fullscreen').click();
  await page.setViewportSize({ width: 844, height: 390 });
  await expectExternalUtilities(page);
});
