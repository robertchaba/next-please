import { devices, expect, test, type Page } from '@playwright/test';

const { defaultBrowserType: _phoneBrowser, ...phone } = devices['iPhone 13'];
const { defaultBrowserType: _tabletBrowser, ...tablet } = devices['iPad Pro 11'];

const playingPhoneSounds = (page: Page) => page.evaluate(() => (window.Howler?._howls ?? [])
  .filter(sound => /\/phone-(?:tone|dial)\.wav$/.test(String(sound._src)) && sound.playing())
  .map(sound => ({ src: String(sound._src).split('/').at(-1), muted: sound.mute(), state: sound.state() })));

async function expectControlsFit(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => {
    const controls = [...document.querySelectorAll<HTMLElement>('#mobile-reception button')]
      .filter(button => button.getClientRects().length > 0 && getComputedStyle(button).visibility !== 'hidden');
    return document.documentElement.scrollWidth <= innerWidth
      && controls.every(button => {
        const box = button.getBoundingClientRect();
        return box.left >= -0.5 && box.top >= -0.5 && box.right <= innerWidth + 0.5 && box.bottom <= innerHeight + 0.5;
      });
  })).toBe(true);
}

async function expectOverlaysFit(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => {
    const visible = (element: HTMLElement) => element.getClientRects().length > 0;
    const overlays = [...document.querySelectorAll<HTMLElement>('.mobile-overlay')].filter(visible);
    const controls = [...document.querySelectorAll<HTMLElement>('#mobile-settings button, #mobile-next')]
      .filter(visible).map(element => element.getBoundingClientRect());
    return overlays.every(element => {
      const box = element.getBoundingClientRect();
      return box.left >= -0.5 && box.top >= -0.5 && box.right <= innerWidth + 0.5 && box.bottom <= innerHeight + 0.5
        && controls.every(control => box.right <= control.left || box.left >= control.right
          || box.bottom <= control.top || box.top >= control.bottom);
    });
  })).toBe(true);
}

async function expectLargePixelControls(page: Page): Promise<void> {
  for (const selector of ['#mobile-language-pl', '#mobile-language-en', '#mobile-sound', '#mobile-next']) {
    const control = page.locator(selector);
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(selector === '#mobile-next' ? 224 : 56);
    expect(box!.height).toBeGreaterThanOrEqual(selector === '#mobile-next' ? 72 : 56);
    if (selector !== '#mobile-sound') {
      await expect(control.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
      await expect(control.locator('canvas')).toHaveCSS('image-rendering', 'pixelated');
    }
  }
  await expect(page.locator('#mobile-sound img')).toBeVisible();
  await expect(page.locator('#mobile-sound')).toHaveText('');
}

test.describe('phone reception', () => {
  test.use(phone);

  test('screen taps wait one second between advances while Next and settings remain independent', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const reception = page.locator('#mobile-reception');
    await expect(reception).toHaveAttribute('data-step', 'tone');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    // Tap empty scene space, then repeat before the full second has elapsed.
    await page.touchscreen.tap(12, 180);
    await expect(reception).toHaveAttribute('data-step', 'dialing');
    await page.touchscreen.tap(12, 180);
    await page.clock.runFor(999);
    await page.touchscreen.tap(12, 180);
    await expect(reception).toHaveAttribute('data-step', 'dialing');
    await page.locator('#mobile-language-en').tap();
    await expect(reception).toHaveAttribute('data-step', 'dialing');
    await page.clock.runFor(1);
    await page.touchscreen.tap(12, 180);
    await expect(reception).toHaveAttribute('data-step', 'greeting');
    // The button ignores the scene cooldown and advances exactly once per tap.
    await page.locator('#mobile-next').tap();
    await expect(reception).toHaveAttribute('data-step', 'reply');
    await page.touchscreen.tap(12, 180);
    await expect(reception).toHaveAttribute('data-step', 'reply');
    await page.locator('#mobile-next').tap();
    await expect(reception).toHaveAttribute('data-step', 'note');
    await expect(page.locator('#mobile-note')).toBeFocused();
    await page.clock.runFor(1000);
    await page.touchscreen.tap(12, 180);
    await expect(reception).toHaveAttribute('data-step', 'note');
  });

  test('Polish conversation advances with four taps, survives rotation, and loads only the mobile interface', async ({ page }, testInfo) => {
    const requests: string[] = [], errors: string[] = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    const reception = page.locator('#mobile-reception');
    await expect(reception).toHaveAttribute('data-step', 'tone');
    await expect(page.locator('#game, #control-start')).toHaveCount(0);
    await expect(page.locator('#mobile-sound')).toHaveAccessibleName('Włącz dźwięk');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
    await expect(page.locator('#mobile-title, #mobile-creator')).toHaveCount(0);
    await expect(page.locator('#mobile-status')).toBeVisible();
    await expect(page.locator('#mobile-status')).toContainText('Sygnał centrali');
    await expectLargePixelControls(page);
    await expectControlsFit(page);
    await page.screenshot({ path: testInfo.outputPath('mobile-phone-pl.png') });

    // Touching the scene advances while respecting the saved mute preference.
    await page.locator('#mobile-receiver').tap();
    await expect(reception).toHaveAttribute('data-step', 'dialing');
    await expect(page.locator('#mobile-status')).toContainText('Wybieranie numeru');
    await page.locator('#mobile-next').tap();
    await expect(reception).toHaveAttribute('data-step', 'greeting');
    await expect(page.locator('#mobile-dialogue')).toBeVisible();
    await expect(page.locator('#mobile-dialogue')).toContainText('Przychodnia słucham!');
    await expect(page.locator('#mobile-status')).toBeHidden();
    await expectOverlaysFit(page);

    await page.setViewportSize({ width: 844, height: 390 });
    await expect(reception).toHaveAttribute('data-step', 'greeting');
    await expectControlsFit(page);
    await expectOverlaysFit(page);
    await page.locator('#mobile-next').tap();
    await expect(reception).toHaveAttribute('data-step', 'reply');
    await expect(page.locator('#mobile-dialogue')).toContainText('Praca zdalna? Doktor raczy żartować. Czekamy w placówce');
    await page.screenshot({ path: testInfo.outputPath('mobile-reply-pl-landscape.png') });
    await page.locator('#mobile-next').tap();
    await expect(reception).toHaveAttribute('data-step', 'note');
    await expect(page.locator('#mobile-next')).toBeHidden();
    await expect(page.locator('#mobile-note')).toBeVisible();
    await expect(page.locator('#mobile-note')).toContainText('Next, Please!');
    await expect(page.locator('#mobile-note')).toContainText('Gra działa tylko na prawdziwym desktopie.');
    await expect(page.locator('#mobile-note')).toContainText(/klawiatur/i);
    await expect(page.locator('#mobile-note')).toContainText(/mysz/i);
    await expectOverlaysFit(page);
    await page.setViewportSize({ width: 390, height: 664 });
    await expect(reception).toHaveAttribute('data-step', 'note');
    await expectControlsFit(page);
    await expectOverlaysFit(page);
    await page.screenshot({ path: testInfo.outputPath('mobile-note-pl.png') });
    expect(requests.filter(url => /\.(mp3|wav)(?:\?|$)/.test(url))).toEqual([]);
    expect(requests.filter(url => /\/assets\/art\/(title-clinic|cabinet-|intro-|sprites\/)/.test(url))).toEqual([]);
    expect(requests.every(url => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
    expect(errors).toEqual([]);
  });

  test('phone audio waits for a gesture, switches from tone to dialing, and stops on mute and dialogue', async ({ page }) => {
    const requestedAudio: string[] = [];
    page.on('request', request => {
      if (/\.(wav|mp3)(?:\?|$)/.test(request.url())) requestedAudio.push(request.url());
    });
    await page.goto('/');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'tone');
    expect(requestedAudio).toEqual([]);
    await page.locator('#mobile-sound').tap();
    await expect(page.locator('#mobile-sound')).toHaveAccessibleName('Wycisz dźwięk');
    await expect(page.locator('#mobile-status')).toBeHidden();
    await expect.poll(() => playingPhoneSounds(page)).toEqual([{ src: 'phone-tone.wav', muted: false, state: 'loaded' }]);
    await page.locator('#mobile-sound').tap();
    await expect(page.locator('#mobile-status')).toBeVisible();
    await expect(page.locator('#mobile-status')).toContainText('Sygnał centrali');
    await expect.poll(() => playingPhoneSounds(page)).toEqual([]);
    await page.locator('#mobile-sound').tap();
    await expect.poll(() => playingPhoneSounds(page)).toEqual([{ src: 'phone-tone.wav', muted: false, state: 'loaded' }]);

    // Drive the visibility signal deterministically: headless tabs do not always
    // become hidden when another page is brought to the front.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => playingPhoneSounds(page)).toEqual([]);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => playingPhoneSounds(page)).toEqual([{ src: 'phone-tone.wav', muted: false, state: 'loaded' }]);

    await page.locator('#mobile-next').tap();
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'dialing');
    await expect(page.locator('#mobile-status')).toBeHidden();
    await expect.poll(() => playingPhoneSounds(page)).toEqual([{ src: 'phone-dial.wav', muted: false, state: 'loaded' }]);
    await page.locator('#mobile-next').tap();
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'greeting');
    await expect.poll(() => playingPhoneSounds(page)).toEqual([]);
    expect(requestedAudio.some(url => url.endsWith('/phone-tone.wav'))).toBe(true);
    expect(requestedAudio.some(url => url.endsWith('/phone-dial.wav'))).toBe(true);
    expect(requestedAudio.some(url => url.endsWith('.mp3'))).toBe(false);

    // An unmuted preference still cannot autoplay after navigation.
    const requestCount = requestedAudio.length;
    await page.reload();
    await expect(page.locator('#mobile-sound')).toHaveAccessibleName('Wycisz dźwięk');
    expect(requestedAudio).toHaveLength(requestCount);
    expect(await playingPhoneSounds(page)).toEqual([]);
    await page.locator('#mobile-receiver').tap();
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'dialing');
    await expect.poll(() => playingPhoneSounds(page)).toEqual([{ src: 'phone-dial.wav', muted: false, state: 'loaded' }]);
  });

  test('small portrait and short landscape keep keyboard controls usable', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await expectLargePixelControls(page);
    await expectControlsFit(page);
    await page.locator('#mobile-language-en').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.locator('#mobile-next').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'dialing');
    await page.setViewportSize({ width: 667, height: 320 });
    await expectControlsFit(page);
    await page.locator('#mobile-next').focus();
    await page.keyboard.press('Space');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'greeting');
    await page.keyboard.press('Enter');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'reply');
    await expectControlsFit(page);
    await expectOverlaysFit(page);
    await page.screenshot({ path: testInfo.outputPath('mobile-short-landscape.png'), scale: 'css' });
    await page.keyboard.press('Enter');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'note');
    await expect(page.locator('#mobile-note')).toContainText(/desktop/i);
    await expectControlsFit(page);
    await expectOverlaysFit(page);
  });
});

test.describe('tablet reception', () => {
  test.use(tablet);

  test('English is available throughout the conversation and persists without persisting its step', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'tone');
    await page.locator('#mobile-language-en').tap();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#mobile-sound')).toHaveAccessibleName('Enable audio');
    await expect(page.locator('#mobile-next')).toHaveAccessibleName(/next/i);
    await expect(page.locator('#mobile-status')).toBeVisible();
    await expect(page.locator('#mobile-status')).toContainText('Dial tone');
    await expectLargePixelControls(page);
    for (const step of ['dialing', 'greeting', 'reply', 'note']) {
      await page.locator('#mobile-next').tap();
      await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', step);
      if (step === 'dialing') await expect(page.locator('#mobile-status')).toContainText('Dialing');
      if (step === 'greeting') {
        await expect(page.locator('#mobile-dialogue')).toContainText(/clinic/i);
        await expect(page.locator('#mobile-dialogue')).not.toContainText('Przychodnia');
      }
    }
    await expect(page.locator('#mobile-note')).toContainText('Next, Please!');
    await expect(page.locator('#mobile-note')).toContainText(/desktop/i);
    await expect(page.locator('#mobile-note')).toContainText(/keyboard/i);
    await expect(page.locator('#mobile-note')).toContainText(/mouse/i);
    await expectControlsFit(page);
    await expectOverlaysFit(page);
    await page.screenshot({ path: testInfo.outputPath('mobile-note-en-tablet.png') });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'tone');
    await expect(page.locator('#game, #control-start')).toHaveCount(0);
  });
});

test('a narrow portrait desktop window shows the telephone and widening it restores the desktop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#mobile-reception')).toBeVisible();
  await expect(page.locator('#control-start')).toHaveCount(0);
  await page.locator('#mobile-next').click();
  await page.locator('#mobile-next').click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#game')).toHaveAttribute('width', '570');
  await expect(page.locator('#game')).toHaveAttribute('height', '320');
  await expect(page.locator('#control-start')).toBeVisible();
  await expect(page.locator('#mobile-reception')).toBeHidden();
  await page.setViewportSize({ width: 834, height: 1194 });
  await expect(page.locator('#mobile-reception')).toBeVisible();
  await expect(page.locator('#mobile-reception')).toHaveAttribute('data-step', 'greeting');
  await expect(page.locator('#game')).toBeHidden();
});

test('resizing during a shift preserves the live desk and synchronizes preferences without hidden music or shortcuts', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  await page.locator('#control-call-patient').focus();
  await page.keyboard.press('Enter');
  await page.locator('#control-take-paper').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  const before = await page.locator('#controls').getAttribute('data-clock-display');
  const paperBefore = await page.locator('#control-paper-1').getAttribute('style');
  await page.locator('#control-sound').click();
  await expect.poll(() => page.evaluate(() => (window.Howler?._howls ?? []).some(sound => /\.mp3$/.test(String(sound._src)) && sound.playing()))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#mobile-reception')).toBeVisible();
  await expect(page.locator('#game')).toBeHidden();
  await expect.poll(() => page.evaluate(() => (window.Howler?._howls ?? []).some(sound => /\.mp3$/.test(String(sound._src)) && sound.playing()))).toBe(false);
  await page.locator('#mobile-language-en').click();
  await expect.poll(() => playingPhoneSounds(page)).toEqual([{ src: 'phone-tone.wav', muted: false, state: 'loaded' }]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('f');
  expect(await page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('#mobile-reception')).toBeHidden();
  await expect.poll(() => playingPhoneSounds(page)).toEqual([]);
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-display', before!);
  await expect(page.locator('#control-paper-1')).toHaveAttribute('style', paperBefore!);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#control-call-patient')).toHaveAccessibleName('NEXT, PLEASE!');
  expect(errors).toEqual([]);
});
