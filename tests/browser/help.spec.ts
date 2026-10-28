import { expect, test } from '@playwright/test';
import { translations, type Locale } from '../../src/i18n';

for (const locale of ['pl', 'en'] satisfies Locale[]) {
  test(`beginner guide scrolls and restores keyboard focus (${locale})`, async ({ page }, testInfo) => {
    const copy = translations[locale];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
    if (locale === 'en') await page.locator('#control-language-en').click();
    const link = page.getByRole('button', { name: copy.help.label, exact: true });
    await link.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: copy.help.title, exact: true });
    const content = page.getByRole('region', { name: copy.help.contentLabel });
    const back = dialog.getByRole('button', { name: copy.back, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(content).toBeFocused();
    await expect(content).toContainText(copy.help.intro);
    for (const section of copy.help.sections) {
      await expect(content.getByRole('heading', { name: section.title, exact: true })).toBeAttached();
      await expect(content).toContainText(section.body);
    }
    await expect(page.locator('#utility-controls')).toHaveAttribute('inert', '');
    const before = await page.locator('#game').screenshot();
    const backBounds = await back.boundingBox();
    await page.screenshot({ path: testInfo.outputPath(`help-${locale}.png`) });

    await content.hover();
    await page.mouse.wheel(0, 180);
    await expect.poll(() => content.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    expect(await page.locator('#game').screenshot()).not.toEqual(before);
    expect(await back.boundingBox()).toEqual(backBounds);
    await page.keyboard.press('End');
    await expect.poll(() => content.evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThan(1);
    await page.screenshot({ path: testInfo.outputPath(`help-${locale}-end.png`) });

    await page.keyboard.press('Home');
    await expect.poll(() => content.evaluate(element => element.scrollTop)).toBe(0);
    await page.keyboard.press('PageDown');
    await expect.poll(() => content.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await page.keyboard.press('Tab');
    await expect(back).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(content).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(back).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(link).toBeFocused();
    await expect(page.locator('#utility-controls')).not.toHaveAttribute('inert');
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'welcome');

    await link.click();
    await expect(content).toBeFocused();
    expect(await content.evaluate(element => element.scrollTop)).toBe(0);
    await back.click();
    await expect(link).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('help fits native and fractional viewports, including fullscreen', async ({ page }) => {
  await page.goto('/');
  await page.locator('#control-help').click();
  const content = page.locator('#control-help-content');
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(true);
  await expect(content).toBeFocused();
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => Boolean(document.fullscreenElement))).toBe(false);

  for (const size of [{ width: 800, height: 500 }, { width: 540, height: 400 }]) {
    await page.setViewportSize(size);
    const canvas = (await page.locator('#game').boundingBox())!;
    for (const element of [content, page.locator('#control-back')]) {
      const bounds = (await element.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(canvas.x);
      expect(bounds.y).toBeGreaterThanOrEqual(canvas.y);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(canvas.x + canvas.width);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(canvas.y + canvas.height);
    }
    await content.focus();
    await page.keyboard.press('End');
    await expect.poll(() => content.evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop)).toBeLessThan(1);
    await page.keyboard.press('Home');
    await expect.poll(() => content.evaluate(element => element.scrollTop)).toBe(0);
  }
});
