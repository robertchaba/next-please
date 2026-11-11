import { expect, test } from '@playwright/test';
import { translations } from '../../src/i18n';
import { stubGoogleTag } from '../fixtures/analytics';

test.beforeEach(async ({ page }) => { await stubGoogleTag(page); });

for (const mobile of [false, true]) {
  for (const [browserLocale, expected] of [['en-US', 'en'], ['pl-PL', 'pl'], ['de-DE', 'en']] as const) {
    test.describe(`${mobile ? 'mobile' : 'desktop'} with ${browserLocale} browser preferences`, () => {
      test.use({ locale: browserLocale, viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } });

      test('selects the initial language and preserves a manual override after reload', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('lang', expected);
        await expect(page).toHaveTitle(translations[expected].documentTitle);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', translations[expected].description);
        const prefix = mobile ? '#mobile' : '#control';
        await expect(page.locator(`${prefix}-language-${expected}`)).toHaveAttribute('aria-pressed', 'true');
        if (mobile) await expect(page.locator('#mobile-reception')).toBeVisible();
        else await expect(page.locator('#control-start')).toHaveAccessibleName(translations[expected].start);

        const selected = expected === 'en' ? 'pl' : 'en';
        await page.locator(`${prefix}-language-${selected}`).click();
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('lang', selected);
        await expect(page).toHaveTitle(translations[selected].documentTitle);
        await expect(page.locator(`${prefix}-language-${selected}`)).toHaveAttribute('aria-pressed', 'true');
        expect(errors).toEqual([]);
      });
    });
  }
}
