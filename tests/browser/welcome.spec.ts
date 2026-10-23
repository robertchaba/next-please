import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { decodeSave, encodeSave } from '../../src/core/save';

test('Polish default, English persistence, credits and keyboard controls', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await expect(page.getByRole('button', { name: 'ROZPOCZNIJ DYŻUR' })).toBeVisible();
  await page.waitForFunction(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('title-clinic.png')));
  await page.screenshot({ path: testInfo.outputPath('welcome-pl.png') });
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.reload();
  await expect(page.getByRole('button', { name: 'BEGIN YOUR SHIFT' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('welcome-en.png') });
  await page.getByRole('button', { name: 'CREDITS', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Robert Chaba');
  await expect(page.getByRole('dialog')).not.toContainText('Papers, Please');
  await expect(page.getByRole('dialog')).toContainText('Officious March');
  await expect(page.getByRole('dialog')).toContainText('Generated with Suno');
  await expect(page.getByRole('link', { name: 'github.com/robertchaba' })).toHaveAttribute('href', 'https://github.com/robertchaba');
  await page.screenshot({ path: testInfo.outputPath('credits-en.png') });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'CREDITS', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'BEGIN YOUR SHIFT' }).click();
  await expect(page.getByRole('dialog')).toContainText('Gameplay is coming');
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
  expect(decodeSave(await readFile(filePath))).toEqual({ day: 1, money: 0, patientsProcessed: 0 });
  const state = { day: 8, money: 1200, patientsProcessed: 43 };
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
  await expect(page.locator('.surround-top')).toHaveCSS('font-size', '18px');
  await expect(page.locator('.surround-bottom')).toHaveCSS('font-size', '16px');
  expect(await page.locator('#game').boundingBox()).toMatchObject({ width: 1140, height: 640 });
  await page.getByRole('button', { name: 'Pełny ekran', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole('button', { name: 'Opuść pełny ekran' }).click();
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.getByRole('button', { name: 'AUTORZY', exact: true }).click();
  await page.getByRole('link').focus();
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect(page.getByRole('link')).toBeFocused();
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => (await page.locator('#game').boundingBox())!.width).toBeLessThanOrEqual(374);
  const bounds = await page.locator('#game').boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(374);
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.height / bounds!.width).toBeCloseTo(320 / 570, 3);
  await page.screenshot({ path: testInfo.outputPath('welcome-mobile.png') });
  await page.getByRole('button', { name: 'AUTORZY', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('larger surrounding labels fit in both languages at intermediate sizes', async ({ page }) => {
  await page.goto('/');
  for (const size of [{ width: 1200, height: 780 }, { width: 800, height: 500 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    for (const language of ['English', 'Polski']) {
      await page.getByRole('button', { name: language, exact: true }).click();
      await expect.poll(() => page.evaluate(() => {
        const elements = [...document.querySelectorAll<HTMLElement>('.surround-top, #viewport, .surround-bottom')];
        const bounds = elements.map(element => element.getBoundingClientRect());
        return bounds.every((box, index) => box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight
          && (index === 0 || bounds[index - 1].bottom <= box.top));
      })).toBe(true);
    }
  }
});
