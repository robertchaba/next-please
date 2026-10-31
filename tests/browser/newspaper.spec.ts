import { expect, test, type Page } from '@playwright/test';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, createInitialState, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';

const key = async (page: Page, id: string) => { await page.locator(`#control-${id}`).focus(); await page.keyboard.press('Enter'); };
function morning(): GameState {
  const first = applyAction({ ...createInitialState(120), money: 10000 }, 'skip-intro').state;
  return applyAction(applyAction({ ...first, clockMinutes: 840 }, 'end-day').state, 'next-day').state;
}
async function load(page: Page, state: GameState) {
  await key(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'morning.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
  await key(page, 'back');
}
for (const locale of ['pl', 'en'] as const) {
  test(`daily newspaper reads, moves, retains its issue and respects the early bell in ${locale}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
    await key(page, 'start');
    for (let i = 0; i < 4; i++) await key(page, 'intro-next');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await key(page, `language-${locale}`);
    const t = translations[locale], state = morning();
    await load(page, state);
    await key(page, 'call-patient');
    await expect(page.locator('#announcement')).toContainText(t.feedback['waiting-room-empty']);
    await expect(page.locator('#control-take-document')).toHaveCount(0);
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-folded-${locale}.png`) });
    // Placement on the right opens immediately, at the manual's reading size.
    await page.locator('#control-newspaper').click();
    const stage = (await page.locator('#stage').boundingBox())!;
    await page.mouse.click(stage.x + 366 * stage.width / 570, stage.y + 212 * stage.height / 320);
    expect(await page.locator('#control-newspaper').evaluate(el => (el as HTMLElement).style.width)).toBe('300px');
    const controls = page.locator('#controls');
    await expect(controls).toHaveAttribute('data-newspaper-open', 'true');
    await expect(page.locator('#screen-description')).toContainText(locale === 'pl' ? '04.11.1983' : '04/11/1983');
    await expect(page.locator('#screen-description')).toContainText(t.newspaper.articles[state.newspaper.articleIds[0]!].body);
    const paper = page.locator('#control-newspaper');
    const geometry = () => paper.evaluate(el => ['left', 'top', 'width', 'height'].map(key => parseFloat((el as HTMLElement).style[key as 'left'])));
    const placedGeometry = await geometry();
    expect(placedGeometry).toEqual([216, 134, 300, 180]);
    await expect(page.locator('#control-newspaper-prev')).toHaveCount(0);
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-spread-${locale}.png`) });
    await page.locator('#control-newspaper-next').click();
    await expect(controls).toHaveAttribute('data-newspaper-page', '1');
    await expect(page.locator('#screen-description')).toContainText(t.newspaper.articles[state.newspaper.articleIds[1]!].body);
    expect(await geometry()).toEqual(placedGeometry);
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-second-${locale}.png`) });
    const otherLocale = locale === 'pl' ? 'en' : 'pl';
    await key(page, `language-${otherLocale}`);
    await expect(page.locator('#screen-description')).toContainText(translations[otherLocale].newspaper.articles[state.newspaper.articleIds[1]!].body);
    expect(await geometry()).toEqual(placedGeometry);
    await key(page, `language-${locale}`);
    // Pickup collapses its artwork; cancelling restores the spread and its page.
    await paper.focus(); await page.keyboard.press('Space');
    await expect(paper).toHaveAttribute('data-held', 'true');
    expect(await paper.evaluate(el => (el as HTMLElement).style.width)).toBe('64px');
    await expect(page.locator('#control-newspaper-prev')).toHaveCount(0);
    await expect(page.locator('#control-newspaper-next')).toHaveCount(0);
    await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Escape');
    await expect(controls).toHaveAttribute('data-newspaper-open', 'true');
    await expect(controls).toHaveAttribute('data-newspaper-page', '1');
    expect(await geometry()).toEqual(placedGeometry);
    // Invalid press metadata leaves both the live state and open page intact.
    await key(page, 'saves');
    const invalid = gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 33, savedAt: '2026-10-31T12:00:00.000Z',
      state: { ...state, newspaper: { ...state.newspaper, articleIds: ['invented', 'bread', 'chess'] } } })));
    await page.locator('#save-input').setInputFiles({ name: 'broken.npsave', mimeType: 'application/gzip', buffer: Buffer.from(invalid) });
    await expect(page.locator('#announcement')).toContainText(t.errors['invalid-state']);
    await key(page, 'back');
    await expect(controls).toHaveAttribute('data-newspaper-open', 'true');
    await expect(controls).toHaveAttribute('data-newspaper-page', '1');
    // Every article is available in full; turning a sheet never changes bounds.
    for (let index = 2; index < state.newspaper.articleIds.length; index++) {
      await key(page, 'newspaper-next');
      await expect(page.locator('#screen-description')).toContainText(t.newspaper.articles[state.newspaper.articleIds[index]!].body);
      expect(await geometry()).toEqual(placedGeometry);
    }
    await expect(page.locator('#control-newspaper-next')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(controls).toHaveAttribute('data-screen', 'cabinet');
    await expect(controls).toHaveAttribute('data-newspaper-open', 'false');
    expect(await geometry()).toEqual([94, 188, 88, 56]);
    await key(page, 'newspaper');
    expect(await geometry()).toEqual([216, 134, 300, 180]);
    await expect(controls).toHaveAttribute('data-newspaper-page', '0');
    // A successful import restores the saved edition, with temporary geometry reset.
    await load(page, { ...state, clockMinutes: 474 });
    await key(page, 'call-patient');
    await expect(page.locator('#announcement')).toContainText(t.feedback['waiting-room-empty']);
    await page.clock.runFor(6000);
    await key(page, 'call-patient');
    await expect(page.locator('#control-take-document')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

for (const locale of ['pl', 'en'] as const) {
  test(`dated newspapers move between both drawers, survive saves and can be discarded in ${locale}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
    await key(page, 'start');
    for (let i = 0; i < 4; i++) await key(page, 'intro-next');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await key(page, `language-${locale}`);
    await load(page, morning());
    const stage = (await page.locator('#stage').boundingBox())!;
    const click = async (x: number, y: number) => page.mouse.click(stage.x + x * stage.width / 570, stage.y + y * stage.height / 320);
    const pickup = async (id: string) => { await page.locator(`#control-${id}`).focus(); await page.keyboard.press('Space'); };
    // Use the enlarged drop zone, outside the closed drawer's ordinary hotspot.
    await pickup('newspaper'); await click(400, 285);
    await expect(page.locator('#control-newspaper')).toHaveCount(0);
    await pickup('newspaper-1'); await key(page, 'drawer');
    await expect(page.locator('#control-newspaper-1')).toHaveCount(0);
    await key(page, 'drawer-2');
    await expect(page.locator('#control-drawer-newspaper-2')).toHaveAccessibleName(new RegExp(locale === 'pl' ? '04.11.1983' : '04/11/1983'));
    await expect(page.locator('#control-drawer-newspaper-1')).toHaveCount(0);
    await page.keyboard.press('Escape');
    const saved = await exportNewspaperState(page);
    expect(saved.newspaperCopies.map(copy => [copy.day, copy.location])).toEqual([[1, 'drawer'], [2, 'drawer-2']]);
    await load(page, saved);
    await key(page, 'drawer');
    await key(page, 'drawer-newspaper-1');
    await expect(page.locator('#control-newspaper-1')).toHaveAttribute('data-held', 'true');
    await click(366, 212);
    await expect(page.locator('#screen-description')).toContainText(locale === 'pl' ? '03.11.1983' : '03/11/1983');
    await expect(page.locator('#screen-description')).toContainText(translations[locale].newspaper.articles[saved.newspaperCopies[0]!.articleIds[0]!].body);
    await key(page, 'newspaper-1-next');
    await pickup('newspaper-1'); await key(page, 'drawer-2');
    await pickup('manual'); await key(page, 'drawer-2');
    await key(page, 'drawer-2');
    await expect(page.locator('[id^="control-drawer-newspaper-"]')).toHaveCount(2);
    await page.locator('#control-drawer-newspaper-1').hover();
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-drawer-${locale}.png`) });
    await key(page, 'drawer-newspaper-1');
    // Discarding uses the generous basket target and does not reroll the edition.
    await click(560, 290);
    await expect(page.locator('#announcement')).toContainText(translations[locale].feedback['newspaper-trashed']);
    await expect(page.locator('#control-newspaper-1')).toHaveCount(0);
    const discarded = await exportNewspaperState(page);
    expect(discarded.newspaperCopies.map(copy => copy.day)).toEqual([2]);
    expect(discarded.newspaper).toEqual(saved.newspaper);
    await load(page, { ...discarded, clockMinutes: 840 });
    await key(page, 'end-day');
    for (let i = 0; i < 6 && await page.locator('#controls').getAttribute('data-screen') !== 'cabinet'; i++) await key(page, 'home-next');
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
    await expect(page.locator('#control-newspaper')).toBeVisible();
    await expect(page.locator('#control-newspaper-1')).toHaveCount(0);
    await key(page, 'drawer-2');
    await expect(page.locator('#control-drawer-newspaper-2')).toBeVisible();
    await expect(page.locator('#control-drawer-newspaper-1')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

async function exportNewspaperState(page: Page): Promise<GameState> {
  await key(page, 'saves');
  const pending = page.waitForEvent('download');
  await key(page, 'export');
  const download = await pending;
  const { readFile } = await import('node:fs/promises');
  const { decodeSave } = await import('../../src/core/save');
  const state = decodeSave(await readFile((await download.path())!));
  await key(page, 'back');
  return state;
}
