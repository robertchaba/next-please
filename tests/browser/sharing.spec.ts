import { expect, test, type Page } from '@playwright/test';

type NativeMode = 'shared' | 'pending' | 'cancelled' | 'failed' | 'missing';
interface ShareProbe {
  mode: NativeMode;
  canShare: boolean;
  clipboardDenied: boolean;
  calls: ShareData[];
  clipboardWrites: string[];
  prompts: { message: string; value: string }[];
  resolve?: () => void;
}

declare global {
  interface Window { __shareProbe: ShareProbe }
}

async function stubSharing(page: Page, mode: NativeMode, clipboardDenied = false): Promise<void> {
  await page.addInitScript(({ mode, clipboardDenied }) => {
    const probe: ShareProbe = window.__shareProbe = { mode, canShare: true, clipboardDenied, calls: [], clipboardWrites: [], prompts: [] };
    Object.defineProperties(navigator, {
      share: {
        configurable: true,
        value: mode === 'missing' ? undefined : async (data: ShareData) => {
          probe.calls.push({ ...data });
          if (probe.mode === 'cancelled') throw new DOMException('Dismissed', 'AbortError');
          if (probe.mode === 'failed') throw new DOMException('Unavailable', 'NotAllowedError');
          if (probe.mode === 'pending') await new Promise<void>(resolve => { probe.resolve = resolve; });
        },
      },
      canShare: { configurable: true, value: () => probe.canShare },
      clipboard: {
        configurable: true,
        value: { writeText: async (value: string) => {
          probe.clipboardWrites.push(value);
          if (probe.clipboardDenied) throw new DOMException('Denied', 'NotAllowedError');
        } },
      },
    });
    window.prompt = (message, value) => {
      probe.prompts.push({ message: message ?? '', value: value ?? '' });
      return null;
    };
  }, { mode, clipboardDenied });
}

async function currentUrl(page: Page, path: string): Promise<string> {
  return page.evaluate(path => {
    history.replaceState(null, '', path);
    return location.href;
  }, path);
}

test('native sharing uses the current full URL and localized invitation at each click', async ({ page }) => {
  await stubSharing(page, 'shared');
  await page.goto('/?initial=1#arrival');
  const share = page.locator('#control-share');
  await expect(share).toHaveAccessibleName('Udostępnij');
  const polishUrl = await currentUrl(page, '/przychodnia/gabinet?dyzur=3&kolejka=8#drzwi-04');
  await share.click();
  await expect(page.locator('#announcement')).toHaveText('Przekazano do udostępnienia. Następny, proszę!');
  await expect(share).toBeFocused();
  await page.locator('#control-language-en').click();
  await expect(share).toHaveAccessibleName('Share');
  const englishUrl = await currentUrl(page, '/clinic/office?shift=4&queue=9#door-04');
  await share.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#announcement')).toHaveText('Passed on for sharing. Next, please!');
  expect(await page.evaluate(() => window.__shareProbe.calls)).toEqual([
    { title: 'Next, Please!', text: 'Pieczątki są. Personelu brak. Zajmij miejsce w kolejce!', url: polishUrl },
    { title: 'Next, Please!', text: 'Stamps ready. Staff missing. Take your place in the queue!', url: englishUrl },
  ]);
  expect(await page.evaluate(() => window.__shareProbe.clipboardWrites)).toEqual([]);
  expect(await page.evaluate(() => window.__shareProbe.prompts)).toEqual([]);
  await expect(share).toBeFocused();
});

test('a pending native share ignores repeat activation and keeps keyboard focus when complete', async ({ page }) => {
  await stubSharing(page, 'pending');
  await page.goto('/');
  const share = page.locator('#control-share');
  await share.focus();
  await page.keyboard.press('Enter');
  await expect(share).toHaveAttribute('aria-busy', 'true');
  await expect(share).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.press('Enter');
  await share.dispatchEvent('click');
  expect(await page.evaluate(() => window.__shareProbe.calls)).toHaveLength(1);
  await expect(share).toBeFocused();
  await page.evaluate(() => window.__shareProbe.resolve!());
  await expect(page.locator('#announcement')).toHaveText('Przekazano do udostępnienia. Następny, proszę!');
  await expect(share).not.toHaveAttribute('aria-busy');
  await expect(share).not.toHaveAttribute('aria-disabled');
  await expect(share).toBeFocused();
});

test('cancelling the native sheet stays silent and leaves the clipboard untouched', async ({ page }) => {
  await stubSharing(page, 'cancelled');
  await page.goto('/');
  const announcement = await page.locator('#announcement').textContent();
  const share = page.locator('#control-share');
  await share.click();
  await expect(share).not.toHaveAttribute('aria-busy');
  expect(await page.evaluate(() => window.__shareProbe.calls)).toHaveLength(1);
  expect(await page.evaluate(() => window.__shareProbe.clipboardWrites)).toEqual([]);
  expect(await page.evaluate(() => window.__shareProbe.prompts)).toEqual([]);
  await expect(page.locator('#announcement')).toHaveText(announcement ?? '');
  await expect(share).toBeFocused();
});

test('browsers without native sharing copy the exact URL and announce it in either language', async ({ page }) => {
  await stubSharing(page, 'missing');
  await page.goto('/?dyzur=1#kolejka');
  const url = page.url();
  await page.locator('#control-share').click();
  await expect(page.locator('#announcement')).toHaveText('Link skopiowany. Wklej go w wiadomości do odbiorcy.');
  await page.locator('#control-language-en').click();
  await page.locator('#control-share').click();
  await expect(page.locator('#announcement')).toHaveText('Link copied. Paste it into a message to the recipient.');
  expect(await page.evaluate(() => window.__shareProbe.clipboardWrites)).toEqual([url, url]);
  expect(await page.evaluate(() => window.__shareProbe.calls)).toEqual([]);
  expect(await page.evaluate(() => window.__shareProbe.prompts)).toEqual([]);
});

test('unsupported share data and native failures fall back to copying the URL', async ({ page }) => {
  await stubSharing(page, 'failed');
  await page.goto('/?route=share#queue');
  const url = page.url();
  await page.evaluate(() => { window.__shareProbe.canShare = false; });
  await page.locator('#control-share').click();
  await expect(page.locator('#announcement')).toHaveText('Link skopiowany. Wklej go w wiadomości do odbiorcy.');
  expect(await page.evaluate(() => window.__shareProbe.calls)).toEqual([]);
  await page.evaluate(() => { window.__shareProbe.canShare = true; });
  await page.locator('#control-share').click();
  await expect.poll(() => page.evaluate(() => window.__shareProbe.clipboardWrites)).toEqual([url, url]);
  expect(await page.evaluate(() => window.__shareProbe.calls)).toHaveLength(1);
  expect(await page.evaluate(() => window.__shareProbe.prompts)).toEqual([]);
});

test('denied clipboard access opens a localized manual-copy prompt with the exact URL', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await stubSharing(page, 'missing', true);
  await page.goto('/');
  const polishUrl = await currentUrl(page, '/przychodnia?dyzur=5#kolejka');
  await page.locator('#control-share').click();
  await expect(page.locator('#control-share')).not.toHaveAttribute('aria-busy');
  await page.locator('#control-language-en').click();
  const englishUrl = await currentUrl(page, '/clinic?shift=6#queue');
  await page.locator('#control-share').click();
  await expect.poll(() => page.evaluate(() => window.__shareProbe.prompts)).toEqual([
    { message: 'Skopiuj adres i zaproś znajomych. Kolejka może rosnąć!', value: polishUrl },
    { message: 'Copy this address and invite friends. The queue can keep growing!', value: englishUrl },
  ]);
  expect(await page.evaluate(() => window.__shareProbe.clipboardWrites)).toEqual([polishUrl, englishUrl]);
  await expect(page.locator('#control-share')).toBeFocused();
  expect(errors).toEqual([]);
});
