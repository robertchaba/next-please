import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { applyAction, createInitialState, type GameState } from '../../src/core/game';
import { decodeSave, encodeSave } from '../../src/core/save';
import { DRAWER_BATCH_SIZE } from '../../src/render/drawer';

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

test('empty drawer opens before and during a visit, closes at the bottom or with Escape, and traps focus without an action cost', async ({ page }) => {
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
  await expect(page.locator('#control-end-day')).toBeVisible();
  await expect(page.locator('#control-next-day')).toHaveCount(0);
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
  // The second cover's exposed label belongs to that sheet.
  await nativeClick(page, 52, 62);
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
  for (let id = 1; id <= 29; id++) {
    state = applyAction(state, 'take-paper').state;
    state = applyAction(state, { type: 'store-paper', paperId: id }).state;
  }
  await importState(page, state);
  await activate(page, 'drawer');
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(DRAWER_BATCH_SIZE);
  await page.locator('#control-drawer-paper-17').hover();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'drawer');
  await activate(page, 'drawer-next');
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(5);
  await expect(page.locator('#control-drawer-paper-25')).toBeAttached();
  await activate(page, 'drawer-previous');
  await page.keyboard.press('Escape');
  await expect(page.locator('[id^="control-paper-"]')).toHaveCount(0);
  await expect(page.locator('#control-drawer')).toHaveAccessibleName(/^Szuflada z dokumentacją: 29\./);
});

async function exportState(page: Page): Promise<GameState> {
  await activate(page, 'saves');
  const pending = page.waitForEvent('download');
  await activate(page, 'export');
  const download = await pending;
  const state = decodeSave(await readFile((await download.path())!));
  await activate(page, 'back');
  return state;
}

async function targetRect(page: Page, id: string): Promise<{ x: number; y: number; w: number; h: number }> {
  return page.locator('#control-' + id).evaluate(element => ({ x: parseFloat((element as HTMLElement).style.left), y: parseFloat((element as HTMLElement).style.top), w: parseFloat((element as HTMLElement).style.width), h: parseFloat((element as HTMLElement).style.height) }));
}

test('near-corner drops use large targets only while carrying, and saved storage differs from disposal', async ({ page }) => {
  await enter(page);
  expect(await targetRect(page, 'drawer')).toEqual({ x: 222, y: 299, w: 110, h: 18 });
  expect(await targetRect(page, 'trash')).toEqual({ x: 478, y: 297, w: 68, h: 23 });
  await nativeClick(page, 211, 279);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  for (const [x, y] of [[211, 279], [364, 319]]) {
    await activate(page, 'take-paper');
    expect(await targetRect(page, 'drawer')).toEqual({ x: 210, y: 278, w: 155, h: 42 });
    expect(await targetRect(page, 'trash')).toEqual({ x: 456, y: 282, w: 114, h: 38 });
    await nativeClick(page, x!, y!);
    await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
    expect(await targetRect(page, 'drawer')).toEqual({ x: 222, y: 299, w: 110, h: 18 });
  }
  for (const [x, y] of [[457, 283], [569, 319]]) {
    await activate(page, 'take-paper');
    await nativeClick(page, x!, y!);
    await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  }
  await expect(page.locator('[id^="control-paper-"]')).toHaveCount(0);
  const saved = await exportState(page);
  expect(saved.papers.map(paper => [paper.id, paper.location])).toEqual([[1, 'drawer'], [2, 'drawer']]);
  expect(saved.nextPaperId).toBe(5);
  await importState(page, saved);
  await activate(page, 'drawer');
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(2);
});

test('incoming referrals can go straight to drawer by keyboard or to trash at the enlarged edge', async ({ page }) => {
  await enter(page);
  await activate(page, 'call-patient');
  await page.locator('#control-take-document').focus();
  await page.keyboard.press('Space');
  await activate(page, 'drawer');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#control-take-document')).toHaveCount(0);
  const stored = await exportState(page);
  expect(stored.visit?.document).toBe('desk');
  expect(stored.visit?.decision).toBeNull();
  expect(stored.papers).toHaveLength(1);
  expect(stored.papers[0]).toMatchObject({ kind: 'referral', location: 'drawer' });
  const fresh = applyAction(applyAction(createInitialState(12), 'skip-intro').state, 'call-patient').state;
  await importState(page, fresh);
  await page.locator('#control-take-document').click();
  await nativeClick(page, 568, 319);
  const discarded = await exportState(page);
  expect(discarded.visit?.document).toBe('desk');
  expect(discarded.visit?.decision).toBeNull();
  expect(discarded.papers).toHaveLength(0);
  expect(discarded.shiftCompleted).toBe(0);
});

test('clipped sheets store together while certificate bundles and stamps retain their existing restrictions', async ({ page }) => {
  await enter(page);
  let bundled = applyAction(createInitialState(23), 'skip-intro').state;
  for (const action of ['take-paper', 'take-paper', { type: 'clip-document', documentId: 1 }, { type: 'join-documents', documentId: 2, targetId: 1 }] as const) bundled = applyAction(bundled, action).state;
  await importState(page, bundled);
  await page.locator('#control-paper-2').focus();
  await page.keyboard.press('Space');
  await nativeClick(page, 211, 279);
  const stored = await exportState(page);
  expect(stored.papers.every(paper => paper.location === 'drawer')).toBe(true);
  expect(stored.paperClips).toEqual([[1, 2]]);
  await activate(page, 'drawer');
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(1);
  await activate(page, 'drawer-paper-1');
  await expect(page.locator('#control-paper-1')).toHaveAttribute('data-held', 'true');
  await expect(page.locator('#control-paper-2')).toHaveAttribute('data-held', 'true');
  await page.keyboard.press('Escape');

  let certificate = applyAction(createInitialState(24), 'skip-intro').state;
  for (const action of ['call-patient', 'take-document', 'take-certificate', { type: 'clip-document', documentId: 'certificate' }, { type: 'join-documents', documentId: 1, targetId: 'certificate' }] as const) certificate = applyAction(certificate, action).state;
  await importState(page, certificate);
  await page.locator('#control-paper-1').focus();
  await page.keyboard.press('Space');
  expect(await targetRect(page, 'drawer')).toEqual({ x: 222, y: 299, w: 110, h: 18 });
  expect(await targetRect(page, 'trash')).toEqual({ x: 478, y: 297, w: 68, h: 23 });
  await nativeClick(page, 277, 308);
  const retained = await exportState(page);
  expect(retained.papers[0]?.location).toBe('desk');
  expect(retained.visit?.certificateTaken).toBe(true);
  expect(retained.visit?.decision).toBeNull();
  expect(retained.paperClips).toEqual(certificate.paperClips);
  await page.locator('#control-stamp-unfit').focus();
  await page.keyboard.press('Space');
  expect(await targetRect(page, 'trash')).toEqual({ x: 478, y: 297, w: 68, h: 23 });
  await activate(page, 'put-away-unfit');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  expect((await exportState(page)).visit?.decision).toBeNull();
});


test('names appear only on the folder label on hover or keyboard focus', async ({ page }, info) => {
  await page.clock.install();
  await enter(page);
  // Pixel comparisons need the generated folder as well as the drawer background.
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  let state = applyAction(createInitialState(37), 'skip-intro').state;
  for (const action of ['call-patient', 'take-document', { type: 'store-paper', paperId: 1 }] as const) state = applyAction(state, action).state;
  await importState(page, state);
  for (const locale of ['pl', 'en']) {
    await activate(page, `language-${locale}`);
    await activate(page, 'drawer');
    const pixels = (x: number, y: number, w: number, h: number) => page.locator('#game').evaluate((canvas, { x, y, w, h }) =>
      Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(x, y, w, h).data), { x, y, w, h });
    const labelPixels = () => pixels(39, 45, 96, 5);
    const rightPixels = () => pixels(280, 35, 260, 191);
    const blank = await labelPixels(), emptyRight = await rightPixels();
    await page.locator('#control-drawer-paper-1').hover();
    expect(await labelPixels()).not.toEqual(blank);
    expect(await rightPixels()).toEqual(emptyRight);
    await page.mouse.move(0, 0);
    expect(await labelPixels()).toEqual(blank);
    await page.locator('#control-drawer-paper-1').focus();
    expect(await labelPixels()).not.toEqual(blank);
    expect(await rightPixels()).toEqual(emptyRight);
    await page.locator('#stage').screenshot({ path: info.outputPath(`drawer-name-${locale}.png`) });
    await page.keyboard.press('Escape');
  }
});
