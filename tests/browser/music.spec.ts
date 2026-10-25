import { test, expect, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';
import type { Howl } from 'howler';

const trackFiles = readdirSync(new URL('../../public/assets/audio/music/', import.meta.url))
  .filter(file => file.endsWith('.mp3') && !file.endsWith(' - EOD.mp3') && !file.endsWith(' - SUCCESS.mp3') && file !== 'Victory Fanfare.mp3').sort();

// Inspect the actual Howler/Web Audio playback in the built app; no test-only
// hooks or mocked audio are installed in production code.
declare global {
  interface Window {
    Howler: { ctx: AudioContext | null; _howls: (Howl & { _src: string })[] };
  }
}

const playing = (page: Page) => page.evaluate(() => window.Howler._howls.filter(sound => sound.playing() && typeof sound._src === 'string' && sound._src.endsWith('.mp3')).map(sound => ({
  src: decodeURIComponent(sound._src), seek: sound.seek() as number, muted: sound.mute(), state: window.Howler.ctx?.state,
})));

// Observe the rendered meter on the music control outside the game canvas.
const meterHeights = (page: Page) => page.locator('#control-sound .music-meter > i')
  .evaluateAll(bars => bars.map(bar => getComputedStyle(bar).height));

test('music decodes, plays continuously across screens, repeats, and respects persisted mute', async ({ page }) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().endsWith('.mp3')) requests.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'AUTORZY', exact: true }).click();
  await page.keyboard.press('Escape');
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  await expect.poll(() => playing(page)).toEqual([{ src: expect.stringContaining('Bureaucratic March 1.mp3'), seek: expect.any(Number), muted: false, state: 'running' }]);
  await expect.poll(async () => (await playing(page))[0]?.seek).toBeGreaterThan(0.2);
  const position = (await playing(page))[0].seek;
  await page.getByRole('button', { name: 'ROZPOCZNIJ DYŻUR' }).click();
  await expect(page.getByRole('heading', { name: 'INSTRUKTAŻ STANOWISKOWY' })).toBeAttached();
  expect((await playing(page))[0].seek).toBeGreaterThan(position);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'AUTORZY', exact: true }).click();
  expect((await playing(page))[0].seek).toBeGreaterThan(position);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  await expect.poll(async () => (await playing(page))[0]?.muted).toBe(true);
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  expect((await playing(page))[0].seek).toBeGreaterThan(position);

  const heard = [(await playing(page))[0].src.split('/').at(-1)!];
  for (let index = 0; index < trackFiles.length; index++) {
    const previous = (await playing(page))[0].src;
    await page.evaluate(() => {
      const sound = window.Howler._howls.find(sound => sound.playing() && typeof sound._src === 'string' && sound._src.endsWith('.mp3'))!;
      sound.seek(sound.duration() - 0.1);
    });
    await expect.poll(async () => {
      const sounds = await playing(page);
      return sounds.length === 1 && sounds[0].src !== previous;
    }).toBe(true);
    heard.push((await playing(page))[0].src.split('/').at(-1)!);
  }
  expect(heard.at(-1)).toBe(heard[0]);
  expect(heard.slice(0, -1).sort()).toEqual(trackFiles);

  await page.reload();
  await expect(page.getByRole('button', { name: 'Wycisz dźwięk' })).toBeVisible();
  expect(await playing(page)).toEqual([]);
  await page.keyboard.press('Tab');
  await expect.poll(async () => (await playing(page)).length).toBe(1);
  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Włącz dźwięk' })).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await playing(page)).toEqual([]);
  expect(errors).toEqual([]);
  expect(requests.every(url => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
});

test('previous/next wrap, support the keyboard in both languages, and preserve mute', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('.mp3')) requests.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Następny utwór' }).click();
  await expect(page.getByRole('button', { name: 'Włącz dźwięk' })).toBeVisible();
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  await expect.poll(async () => (await playing(page)).map(sound => sound.src)).toEqual([expect.stringContaining('Bureaucratic March 2.mp3')]);

  await page.getByRole('button', { name: 'Poprzedni utwór' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await playing(page)).map(sound => sound.src)).toEqual([expect.stringContaining('Bureaucratic March 1.mp3')]);
  await page.keyboard.press('Space');
  await expect.poll(async () => (await playing(page)).map(sound => sound.src)).toEqual([expect.stringContaining('Untitled.mp3')]);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Następny utwór' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await playing(page)).map(sound => sound.src)).toEqual([expect.stringContaining('Bureaucratic March 1.mp3')]);

  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  await page.getByRole('button', { name: 'Następny utwór' }).click();
  await expect.poll(async () => (await playing(page)).map(({ src, muted }) => ({ src, muted }))).toEqual([{ src: expect.stringContaining('Bureaucratic March 2.mp3'), muted: true }]);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Next track' })).toHaveAttribute('title', 'Next track');
  await page.getByRole('button', { name: 'Previous track' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await playing(page)).map(({ src, muted }) => ({ src, muted }))).toEqual([{ src: expect.stringContaining('Bureaucratic March 1.mp3'), muted: true }]);
  await expect(page.getByRole('button', { name: 'Enable audio' })).toBeVisible();
});

test('volume supports keyboard and pointer input, applies to playback, and persists independently of mute', async ({ page }) => {
  await page.goto('/');
  const volume = page.getByRole('slider', { name: 'Głośność muzyki' });
  await expect(volume).toHaveValue('40');
  await volume.focus();
  await page.keyboard.press('ArrowRight');
  await expect(volume).toHaveValue('41');
  await expect(page.getByRole('button', { name: 'Włącz dźwięk' })).toBeVisible();
  expect(await playing(page)).toEqual([]);
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  await expect.poll(async () => (await playing(page)).length).toBe(1);
  await expect.poll(() => page.evaluate(() => window.Howler._howls.find(sound => sound.playing())!.volume())).toBe(0.41);
  const bounds = (await volume.boundingBox())!;
  await page.mouse.click(bounds.x + bounds.width * 0.75, bounds.y + bounds.height / 2);
  const selectedVolume = Number(await volume.inputValue());
  expect(selectedVolume).toBeGreaterThan(70);
  expect(selectedVolume).toBeLessThan(80);
  await page.keyboard.press('Home');
  await expect(volume).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Wycisz dźwięk' })).toHaveAttribute('aria-description', 'Muzyka jest wyciszona.');
  await page.keyboard.press('End');
  await expect(volume).toHaveValue('100');
  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('slider', { name: 'Music volume' })).toHaveValue('100');
  await expect(page.getByRole('button', { name: 'Enable audio' })).toBeVisible();
  expect(await playing(page)).toEqual([]);
});

test('the small meter follows playback and becomes still when muted or reduced motion is requested', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  const sound = page.getByRole('button', { name: 'Wycisz dźwięk' });
  await expect(sound).toHaveAttribute('aria-description', 'Muzyka jest odtwarzana.');
  await page.getByRole('button', { name: 'ROZPOCZNIJ DYŻUR' }).focus();
  await page.mouse.move(0, 0);
  await expect(page.locator('#control-sound .music-meter > i')).toHaveCount(3);
  const initial = await meterHeights(page);
  await expect.poll(() => meterHeights(page)).not.toEqual(initial);
  await page.screenshot({ path: testInfo.outputPath('music-playing.png') });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Allow one update to apply the changed OS preference, then compare later bars.
  await page.waitForTimeout(150);
  const reduced = await meterHeights(page);
  await page.waitForTimeout(350);
  expect(await meterHeights(page)).toEqual(reduced);
  await expect(sound).toHaveAttribute('aria-description', 'Muzyka jest odtwarzana.');

  await sound.click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.getByRole('button', { name: 'Włącz dźwięk' })).toHaveAttribute('aria-description', 'Muzyka jest wyciszona.');
  const muted = await meterHeights(page);
  await page.waitForTimeout(350);
  expect(await meterHeights(page)).toEqual(muted);
});
