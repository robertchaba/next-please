import type { Page } from '@playwright/test';

export const GOOGLE_TAG_URL = 'https://www.googletagmanager.com/gtag/js?id=G-2MWJLWH08G';

export async function stubGoogleTag(page: Page): Promise<void> {
  // Keep UI checks deterministic and prevent test visits reaching Analytics.
  await page.route(GOOGLE_TAG_URL, route => route.fulfill({
    contentType: 'application/javascript',
    body: '',
  }));
}
