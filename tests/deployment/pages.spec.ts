import { devices, expect, test, type Page } from '@playwright/test';
import { GOOGLE_TAG_URL, stubGoogleTag } from '../fixtures/analytics';

test.beforeEach(async ({ page }) => { await stubGoogleTag(page); });

function observeDeployment(page: Page, baseURL: string) {
  const errors: string[] = [];
  const requests: string[] = [];
  const loaded = new Set<string>();
  const builtTypes = new Set<string>();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (response.ok()) {
      loaded.add(new URL(response.url()).pathname);
      const type = response.headers()['content-type'] ?? '';
      if (type.includes('javascript')) builtTypes.add('javascript');
      if (type.includes('text/css')) builtTypes.add('css');
    }
  });

  return {
    loaded,
    async verify() {
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
      expect(builtTypes).toEqual(new Set(['javascript', 'css']));
      expect(requests.length).toBeGreaterThan(0);
      expect(requests).toContain(GOOGLE_TAG_URL);
      const deployment = new URL(baseURL);
      for (const address of requests) {
        if (!address.startsWith('http')) continue;
        if (address === GOOGLE_TAG_URL) continue;
        const url = new URL(address);
        expect(url.origin, address).toBe(deployment.origin);
        expect(url.pathname, address).toMatch(/^\/next-please\//);
        expect(url.pathname, address).not.toContain('/src/');
        expect(url.pathname, address).not.toMatch(/\.ts$/);
      }
    },
  };
}

const playingAudio = (page: Page) => page.evaluate(() => (window.Howler?._howls ?? [])
  .filter(sound => sound.playing() && sound.state() === 'loaded')
  .map(sound => decodeURIComponent(String(sound._src)).split('/').at(-1)));

test('built desktop loads under the repository path with artwork, music and both locales', async ({ page, baseURL }) => {
  const deployment = observeDeployment(page, baseURL!);
  const response = await page.goto('./');
  expect(response?.ok()).toBe(true);
  expect(await response!.text()).not.toContain('/src/main.ts');
  await expect(page.locator('#control-start')).toBeVisible();
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#screen-description')).toContainText('VERSION 1.0.12 / QUEUE');
  await page.locator('#control-language-pl').click();
  await expect(page.locator('#screen-description')).toContainText('WERSJA 1.0.12 / KOLEJKA');
  await page.locator('#control-language-en').click();
  await expect(page.locator('#screen-description')).toContainText('VERSION 1.0.12 / QUEUE');
  await page.locator('#control-sound').click();
  await expect.poll(() => playingAudio(page)).toContain('Bureaucratic March - Opening the Office.mp3');
  await page.locator('#control-start').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'intro');
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#game')).toHaveAttribute('width', '570');
  await expect(page.locator('#game')).toHaveAttribute('height', '320');
  await deployment.verify();
  expect(deployment.loaded).toContain('/next-please/assets/art/title-clinic.png');
  expect(deployment.loaded).toContain('/next-please/assets/art/cabinet-workstation.png');
});

test.describe('mobile deployment', () => {
  const { defaultBrowserType: _browser, ...phone } = devices['iPhone 13'];
  test.use(phone);

  test('built reception loads local artwork and telephone effects under the repository path', async ({ page, baseURL }) => {
    const deployment = observeDeployment(page, baseURL!);
    await page.goto('./');
    const reception = page.locator('#mobile-reception');
    await expect(reception).toHaveAttribute('data-step', 'tone');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#game')).toHaveCount(0);
    await page.locator('#mobile-sound').tap();
    await expect.poll(() => playingAudio(page)).toContain('phone-tone.wav');
    await page.locator('#mobile-next').tap();
    await expect(reception).toHaveAttribute('data-step', 'dialing');
    await expect.poll(() => playingAudio(page)).toContain('phone-dial.wav');
    for (const step of ['greeting', 'reply', 'note']) {
      await page.locator('#mobile-next').tap();
      await expect(reception).toHaveAttribute('data-step', step);
    }
    await expect(page.locator('#mobile-note')).toContainText('Next, Please!');
    await expect(page.locator('#mobile-note')).toBeFocused();
    await deployment.verify();
    expect(deployment.loaded).toContain('/next-please/assets/art/mobile-handset.png');
    expect(deployment.loaded).toContain('/next-please/assets/art/mobile-note.png');
  });
});
