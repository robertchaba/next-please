import { expect, test, type Page } from '@playwright/test';
import { applyAction, createInitialState, settleWeekend, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { homePage } from '../../src/scenes/home';
import { NEW_WEEKEND_ILLUSTRATIONS } from '../../src/scenes/weekend';

const scenes = [...NEW_WEEKEND_ILLUSTRATIONS, 'weekend-mountain-resort', 'weekend-seaside-resort'] as const;
type Scene = typeof scenes[number];
const dates: Record<Scene, number> = {
  'weekend-autumn-park': 2, 'weekend-rain-tram': 2,
  'weekend-winter-park': 30, 'weekend-winter-seaside': 30,
  'weekend-mountain-resort': 30, 'weekend-seaside-resort': 2,
  'weekend-spring-park': 156, 'weekend-summer-garden': 247,
  'weekend-reading': 2, 'weekend-radio': 2, 'weekend-soup': 2,
};
function fixture(scene: Scene): GameState {
  const money = scene === 'weekend-mountain-resort' || scene === 'weekend-seaside-resort' || scene === 'weekend-winter-seaside' ? 10000 : 2500;
  for (let seed = 1; seed <= 500; seed++) {
    const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
    const state = settleWeekend(applyAction({ ...cabinet, day: dates[scene], money, clockMinutes: 840 }, 'end-day').state);
    if (homePage(state, 'pl', 0).illustration === scene) return state;
  }
  throw new Error(`No valid saved weekend for ${scene}`);
}
async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

for (const scene of scenes) test(`${scene} renders its local art, PL/EN captions and keyboard sequence`, async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const state = fixture(scene), buffer = Buffer.from(encodeSave(state));
  await page.goto('/');
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'weekend.npsave', mimeType: 'application/gzip', buffer });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await key(page, 'back');
  await key(page, 'start');
  for (const locale of ['pl', 'en'] as const) {
    if (locale === 'en') await key(page, 'language-en');
    const content = homePage(state, locale, 0);
    await expect(page.locator('#screen-heading')).toHaveText('WEEKEND');
    await expect(page.locator('#screen-description')).toHaveText(`${content.description} ${content.text}`);
    await page.locator('#control-home-next').focus();
    await expect(page.locator('#control-home-next')).toBeFocused();
    await expect(page.locator('#control-home-next')).toHaveAccessibleName(content.action);
    // The unobstructed right side must contain the selected PNG, not a fallback.
    expect(await page.locator('#game').evaluate(async (canvas: HTMLCanvasElement, name) => {
      const art = new Image();
      art.src = `/assets/art/${name}.png`;
      await art.decode();
      const reference = document.createElement('canvas');
      reference.width = 570; reference.height = 320;
      reference.getContext('2d')!.drawImage(art, 0, 0);
      const expected = reference.getContext('2d')!.getImageData(365, 20, 205, 300).data;
      const actual = canvas.getContext('2d')!.getImageData(365, 20, 205, 300).data;
      return actual.every((channel, index) => channel === expected[index]);
    }, scene)).toBe(true);
    await page.locator('#game').screenshot({ path: info.outputPath(`${scene}-${locale}.png`) });
  }
  // Importing the same save in English restores the same image and caption.
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'weekend.npsave', mimeType: 'application/gzip', buffer });
  await expect(page.getByRole('status')).toContainText('Save loaded');
  await key(page, 'back');
  await expect(page.locator('#screen-description')).toHaveText(`${homePage(state, 'en', 0).description} ${homePage(state, 'en', 0).text}`);
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'budget');
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'work');
  expect(errors).toEqual([]);
});
