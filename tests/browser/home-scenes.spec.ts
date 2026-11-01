import { expect, test, type Page } from '@playwright/test';
import { encodeSave } from '../../src/core/save';
import { homePage } from '../../src/scenes/home';
import { arrivalIllustrations, BUDGET_ILLUSTRATIONS } from '../../src/scenes/home-art';
import { homeSceneState } from '../fixtures/home-scenes';

async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

for (const kind of ['arrival', 'budget'] as const) for (const scene of kind === 'arrival' ? arrivalIllustrations(1) : BUDGET_ILLUSTRATIONS) {
  test(`${kind} ${scene} preserves local art, readable PL/EN text and saved state`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ body: '' }));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const state = homeSceneState(scene, kind), buffer = Buffer.from(encodeSave(state));
    const index = kind === 'arrival' ? 0 : 1;
    await page.goto('/');
    await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
    await key(page, 'saves');
    await page.locator('#save-input').setInputFiles({ name: 'home.npsave', mimeType: 'application/gzip', buffer });
    await expect(page.getByRole('status')).toContainText('Zapis wczytany');
    await key(page, 'back');
    await key(page, 'start');
    if (index) await key(page, 'home-next');
    for (const locale of ['pl', 'en'] as const) {
      if (locale === 'en') await key(page, 'language-en');
      const content = homePage(state, locale, index);
      await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', kind);
      await expect(page.locator('#screen-description')).toHaveText(`${content.description} ${content.text}`);
      await page.locator('#control-home-next').focus();
      await expect(page.locator('#control-home-next')).toBeFocused();
      await expect(page.locator('#control-home-next')).toHaveAccessibleName(content.action);
      expect(await page.locator('#game').evaluate(async (canvas: HTMLCanvasElement, name) => {
        const art = new Image();
        art.src = `/assets/art/${name}.png`;
        await art.decode();
        const reference = document.createElement('canvas');
        reference.width = 570; reference.height = 320;
        reference.getContext('2d')!.drawImage(art, 0, 0);
        const expected = reference.getContext('2d')!.getImageData(365, 20, 205, 300).data;
        const actual = canvas.getContext('2d')!.getImageData(365, 20, 205, 300).data;
        return actual.every((channel, position) => channel === expected[position]);
      }, scene)).toBe(true);
      await page.locator('#game').screenshot({ path: info.outputPath(`${kind}-${scene}-${locale}.png`) });
    }
    await key(page, 'saves');
    await page.locator('#save-input').setInputFiles({ name: 'home.npsave', mimeType: 'application/gzip', buffer });
    await expect(page.getByRole('status')).toContainText('Save loaded');
    await key(page, 'back');
    if (index) await key(page, 'home-next');
    const content = homePage(state, 'en', index);
    await expect(page.locator('#screen-description')).toHaveText(`${content.description} ${content.text}`);
    if (!index) await key(page, 'home-next');
    await key(page, 'home-next');
    await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'work');
    expect(errors).toEqual([]);
  });
}
