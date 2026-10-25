import { expect, test, type Page } from '@playwright/test';
import { applyAction, createInitialState, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';

async function activate(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}
async function nativeClick(page: Page, x: number, y: number): Promise<void> {
  const bounds = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(bounds.x + x * bounds.width / 570, bounds.y + y * bounds.height / 320);
}
async function enter(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await activate(page, 'start');
  for (let index = 0; index < 4; index++) await activate(page, 'intro-next');
}
async function store(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Space');
  await activate(page, 'drawer');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
}
async function importState(page: Page, state: GameState): Promise<void> {
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'drawer.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
}

test('empty drawer opens before and during a visit, closes at the bottom or with Escape, and traps focus without spending time', async ({ page }) => {
  await enter(page);
  const clock = await page.locator('#controls').getAttribute('data-clock-minutes');
  await activate(page, 'drawer');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'drawer');
  await expect(page.locator('#controls')).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#control-drawer-close')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#control-drawer-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-drawer')).toBeFocused();
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-minutes', clock!);
  await activate(page, 'call-patient');
  await activate(page, 'drawer');
  await nativeClick(page, 285, 310);
  await expect(page.locator('#control-take-document')).toBeVisible();
  const done: GameState = { ...applyAction(createInitialState(), 'skip-intro').state, shiftCompleted: 3, patientsProcessed: 3, clockMinutes: 840 };
  await importState(page, done);
  await activate(page, 'drawer');
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-next-day')).toBeVisible();
});

test('documents retain filing order, selecting a covered sheet carries it out, and refiling moves it to the end', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await enter(page);
  for (let id = 1; id <= 3; id++) {
    await activate(page, 'take-paper');
    await activate(page, 'drawer');
  }
  await activate(page, 'drawer');
  const paperIds = () => page.locator('[id^="control-drawer-paper-"]').evaluateAll(elements => elements.map(element => element.id));
  expect(await paperIds()).toEqual(['control-drawer-paper-1', 'control-drawer-paper-2', 'control-drawer-paper-3']);
  // The second sheet's narrow uncovered left edge belongs to that sheet.
  await nativeClick(page, 52, 70);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#control-paper-2')).toHaveAttribute('data-held', 'true');
  await activate(page, 'drawer');
  await activate(page, 'drawer');
  expect(await paperIds()).toEqual(['control-drawer-paper-1', 'control-drawer-paper-3', 'control-drawer-paper-2']);
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-paper-2')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('separate rulebook and clips persist through an import and can be retrieved independently', async ({ page }) => {
  await enter(page);
  await store(page, 'manual');
  await expect(page.locator('#control-manual')).toHaveCount(0);
  await activate(page, 'take-clip');
  await activate(page, 'drawer');
  await activate(page, 'drawer');
  await expect(page.locator('#control-drawer-manual')).toBeVisible();
  await expect(page.locator('#control-drawer-clip')).toBeVisible();
  await page.keyboard.press('Escape');
  const state = applyAction(applyAction(applyAction(createInitialState(), 'skip-intro').state,
    { type: 'store-drawer-item', item: 'manual' }).state, { type: 'store-drawer-item', item: 'clip' }).state;
  await importState(page, state);
  await expect(page.locator('#control-manual')).toHaveCount(0);
  await activate(page, 'drawer');
  await activate(page, 'drawer-manual');
  await expect(page.locator('#control-manual')).toHaveAttribute('data-held', 'true');
  await nativeClick(page, 125, 240);
  await activate(page, 'drawer');
  await expect(page.locator('#control-drawer-manual')).toHaveCount(0);
  await activate(page, 'drawer-clip');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  await nativeClick(page, 320, 230);
  await activate(page, 'drawer');
  await expect(page.locator('#control-drawer-clip')).toHaveCount(0);
});

test('large stacks can be browsed in filing order and closing leaves every sheet stored', async ({ page }) => {
  await enter(page);
  let state = applyAction(createInitialState(), 'skip-intro').state;
  for (let id = 1; id <= 15; id++) {
    state = applyAction(state, 'take-paper').state;
    state = applyAction(state, { type: 'store-paper', paperId: id }).state;
  }
  await importState(page, state);
  await activate(page, 'drawer');
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(12);
  await activate(page, 'drawer-next');
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(3);
  await expect(page.locator('#control-drawer-paper-13')).toBeAttached();
  await activate(page, 'drawer-previous');
  await page.keyboard.press('Escape');
  await expect(page.locator('[id^="control-paper-"]')).toHaveCount(0);
  await expect(page.locator('#control-drawer')).toHaveAccessibleName(/^Szuflada z dokumentacją: 15\./);
});
