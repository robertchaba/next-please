import { expect, test, type Page } from '@playwright/test';

async function useKeyboard(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

test('mechanical stamping plays a decoded local effect after a gesture and stays silent while muted', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', request => {
    if (request.url().endsWith('/stamp.wav')) requested.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  for (const id of ['call-patient', 'take-document', 'stamp-fit', 'apply-stamp']) await useKeyboard(page, id);
  expect(requested).toEqual([]);

  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  await useKeyboard(page, 'stamp-unfit');
  // Listen to the real Howler instance, without adding production test hooks.
  const playback = page.evaluate(() => new Promise<{ state: string; muted: boolean; volume: number; duration: number; context: string | undefined }>(resolve => {
    const stamp = window.Howler._howls.find(sound => String(sound._src).endsWith('/stamp.wav'))!;
    stamp.once('play', () => resolve({
      state: stamp.state(), muted: stamp.mute(), volume: stamp.volume(), duration: stamp.duration(), context: window.Howler.ctx?.state,
    }));
  }));
  await useKeyboard(page, 'apply-stamp');
  expect(await playback).toEqual({ state: 'loaded', muted: false, volume: 0.7, duration: 0.26, context: 'running' });
  expect(requested).toHaveLength(1);
  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  expect(await page.evaluate(() => window.Howler._howls.find(sound => String(sound._src).endsWith('/stamp.wav'))!.mute())).toBe(true);
});

test('the desk bell loads on an unmuted patient call and uses the shared effect volume', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', request => {
    if (request.url().endsWith('/bell.wav')) requested.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  await page.locator('#control-call-patient').click();
  expect(requested).toEqual([]);
  for (const id of ['take-document', 'stamp-fit', 'apply-stamp', 'return-document']) await useKeyboard(page, id);

  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  expect(requested).toEqual([]);
  const playback = page.evaluate(() => new Promise<{ state: string; muted: boolean; volume: number; duration: number; context: string | undefined }>(resolve => {
    const bell = window.Howler._howls.find(sound => String(sound._src).endsWith('/bell.wav'))!;
    bell.once('play', () => resolve({
      state: bell.state(), muted: bell.mute(), volume: bell.volume(), duration: bell.duration(), context: window.Howler.ctx?.state,
    }));
  }));
  await useKeyboard(page, 'call-patient');
  expect(await playback).toEqual({ state: 'loaded', muted: false, volume: 0.7, duration: 0.68, context: 'running' });
  expect(requested).toHaveLength(1);
  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  expect(await page.evaluate(() => window.Howler._howls.find(sound => String(sound._src).endsWith('/bell.wav'))!.mute())).toBe(true);
});
