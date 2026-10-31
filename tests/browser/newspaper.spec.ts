import { createInitialState } from '../fixtures/routine';
import { expect, test, type Page } from '@playwright/test';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';
import { classifiedPhone } from '../../src/core/newspaper';
import { DRAWER_NEWSPAPER_BATCH_SIZE } from '../../src/render/drawer';

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
  test(`first newspaper arrives on the second working day after saving and loading in ${locale}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
    await key(page, 'start');
    for (let i = 0; i < 4; i++) await key(page, 'intro-next');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await key(page, `language-${locale}`);
    await expect(page.locator('[id^="control-newspaper"]')).toHaveCount(0);
    await key(page, 'use-phone');
    await expect(page.locator('#announcement')).toContainText(translations[locale].feedback['phone-ready']);
    const first = await exportNewspaperState(page);
    expect(first.day).toBe(1);
    expect(first.newspaperCopies).toEqual([]);
    await load(page, first);
    await expect(page.locator('[id^="control-newspaper"]')).toHaveCount(0);
    for (const drawer of ['drawer', 'drawer-2']) {
      await key(page, drawer);
      await expect(page.locator('[id^="control-drawer-newspaper-"]')).toHaveCount(0);
      await page.keyboard.press('Escape');
    }
    await load(page, { ...first, money: 10000, clockMinutes: 840 });
    await key(page, 'end-day');
    for (let i = 0; i < 6 && await page.locator('#controls').getAttribute('data-screen') !== 'cabinet'; i++) await key(page, 'home-next');
    await expect(page.locator('#control-newspaper')).toBeVisible();
    await key(page, 'newspaper');
    await expect(page.locator('#screen-description')).toContainText(locale === 'pl' ? '04.11.1983' : '04/11/1983');
    const second = await exportNewspaperState(page);
    expect(second.newspaperCopies.map(copy => copy.day)).toEqual([2]);
    expect(second.newspaper).toEqual(first.newspaper);
    await load(page, second);
    await expect(page.locator('#control-newspaper')).toBeVisible();
  });

  test(`newspaper stack exposes dated edges, paginates and retrieves the chosen issue in ${locale}`, async ({ page }, info) => {
    let state = { ...morning(), money: 100000 };
    for (let index = 0; index < DRAWER_NEWSPAPER_BATCH_SIZE + 4; index++) {
      if (index) {
        state = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
        do { state = applyAction(state, 'next-day').state; } while (state.phase === 'home');
      }
      state = applyAction(state, { type: 'store-newspaper', day: state.day, drawer: index === 0 ? 'drawer' : 'drawer-2' }).state;
    }
    state = applyAction(state, { type: 'store-drawer-item', item: 'manual', drawer: 'drawer-2' }).state;
    state = applyAction(state, { type: 'store-drawer-item', item: 'clip', drawer: 'drawer-2' }).state;
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
    await key(page, 'start');
    for (let i = 0; i < 4; i++) await key(page, 'intro-next');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await key(page, `language-${locale}`);
    await load(page, state);
    await key(page, 'drawer-2');
    const copies = state.newspaperCopies.filter(copy => copy.location === 'drawer-2');
    const edges = page.locator('[id^="control-drawer-newspaper-"]');
    await expect(edges).toHaveCount(DRAWER_NEWSPAPER_BATCH_SIZE);
    await expect(page.locator('#control-drawer-newspaper-2')).toHaveCount(0);
    const selected = copies[3]!;
    const edge = page.locator(`#control-drawer-newspaper-${selected.day}`);
    await edge.hover();
    expect(await edge.evaluate(el => (el as HTMLElement).style.height)).toBe('17px');
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-stack-${locale}.png`) });
    // Pointer selects the exposed strip, without picking up the overlaid newer copy.
    await edge.click();
    await expect(page.locator(`#control-newspaper-${selected.day}`)).toHaveAttribute('data-held', 'true');
    await key(page, 'drawer-2');
    await key(page, 'drawer-2');
    expect(await edges.evaluateAll(elements => elements.map(el => el.id))).toEqual(copies.slice(0, DRAWER_NEWSPAPER_BATCH_SIZE).map(copy => `control-drawer-newspaper-${copy.day}`));
    await key(page, 'drawer-next');
    await expect(edges).toHaveCount(3);
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-stack-three-${locale}.png`) });
    const last = copies.at(-1)!;
    await page.locator(`#control-drawer-newspaper-${last.day}`).focus();
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-stack-focus-${locale}.png`) });
    await page.keyboard.press('Enter');
    await expect(page.locator('#control-newspaper')).toHaveAttribute('data-held', 'true');
    const stage = (await page.locator('#stage').boundingBox())!;
    await page.mouse.click(stage.x + 366 * stage.width / 570, stage.y + 212 * stage.height / 320);
    await expect(page.locator('#screen-description')).toContainText(translations[locale].newspaper.articles[last.articleIds[0]!].body);
    const saved = await exportNewspaperState(page);
    expect(saved.newspaperCopies).toEqual(state.newspaperCopies.map(copy => copy.day === last.day ? { ...copy, location: 'desk' } : copy));
    await load(page, saved);
    await key(page, 'drawer-2');
    await key(page, 'drawer-next');
    await expect(edges).toHaveCount(2);
    await expect(page.locator(`#control-drawer-newspaper-${last.day}`)).toHaveCount(0);
    await page.keyboard.press('Escape');
    await key(page, 'drawer');
    await expect(edges).toHaveCount(1);
    expect(await edges.first().evaluate(el => (el as HTMLElement).style.height)).toBe('56px');
  });
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
    const invalid = gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 35, savedAt: '2026-10-31T12:00:00.000Z',
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
    if (state.newspaper.classifiedIds.length) {
      await key(page, 'newspaper-next');
      await expect(page.locator('#screen-description')).toContainText(t.newspaper.classifiedTitle);
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
    let state = applyAction({ ...morning(), clockMinutes: 840 }, 'end-day').state;
    do { state = applyAction(state, 'next-day').state; } while (state.phase === 'home');
    await load(page, state);
    const stage = (await page.locator('#stage').boundingBox())!;
    const click = async (x: number, y: number) => page.mouse.click(stage.x + x * stage.width / 570, stage.y + y * stage.height / 320);
    const pickup = async (id: string) => { await page.locator(`#control-${id}`).focus(); await page.keyboard.press('Space'); };
    // Use the enlarged drop zone, outside the closed drawer's ordinary hotspot.
    await pickup('newspaper'); await click(400, 285);
    await expect(page.locator('#control-newspaper')).toHaveCount(0);
    await pickup('newspaper-2'); await key(page, 'drawer');
    await expect(page.locator('#control-newspaper-2')).toHaveCount(0);
    await key(page, 'drawer-2');
    await expect(page.locator('#control-drawer-newspaper-5')).toHaveAccessibleName(new RegExp(locale === 'pl' ? 'Kurier Obywatelski 07.11.1983' : 'Civic Courier 07/11/1983'));
    await expect(page.locator('#control-drawer-newspaper-2')).toHaveCount(0);
    await page.keyboard.press('Escape');
    const saved = await exportNewspaperState(page);
    expect(saved.newspaperCopies.map(copy => [copy.day, copy.location])).toEqual([[2, 'drawer'], [5, 'drawer-2']]);
    await load(page, saved);
    await key(page, 'drawer');
    await key(page, 'drawer-newspaper-2');
    await expect(page.locator('#control-newspaper-2')).toHaveAttribute('data-held', 'true');
    await click(366, 212);
    await expect(page.locator('#screen-description')).toContainText(locale === 'pl' ? '04.11.1983' : '04/11/1983');
    await expect(page.locator('#screen-description')).toContainText(translations[locale].newspaper.articles[saved.newspaperCopies[0]!.articleIds[0]!].body);
    await key(page, 'newspaper-2-next');
    await pickup('newspaper-2'); await key(page, 'drawer-2');
    await pickup('manual'); await key(page, 'drawer-2');
    await key(page, 'drawer-2');
    await expect(page.locator('[id^="control-drawer-newspaper-"]')).toHaveCount(2);
    await page.locator('#control-drawer-newspaper-2').hover();
    await page.locator('#stage').screenshot({ path: info.outputPath(`newspaper-drawer-${locale}.png`) });
    await key(page, 'drawer-newspaper-2');
    // Discarding uses the generous basket target and does not reroll the edition.
    await click(560, 290);
    await expect(page.locator('#announcement')).toContainText(translations[locale].feedback['newspaper-trashed']);
    await expect(page.locator('#control-newspaper-2')).toHaveCount(0);
    const discarded = await exportNewspaperState(page);
    expect(discarded.newspaperCopies.map(copy => copy.day)).toEqual([5]);
    expect(discarded.newspaper).toEqual(saved.newspaper);
    await load(page, { ...discarded, clockMinutes: 840 });
    await key(page, 'end-day');
    for (let i = 0; i < 6 && await page.locator('#controls').getAttribute('data-screen') !== 'cabinet'; i++) await key(page, 'home-next');
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
    await expect(page.locator('#control-newspaper')).toBeVisible();
    await expect(page.locator('#control-newspaper-2')).toHaveCount(0);
    await key(page, 'drawer-2');
    await expect(page.locator('#control-drawer-newspaper-5')).toBeVisible();
    await expect(page.locator('#control-drawer-newspaper-2')).toHaveCount(0);
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

for (const locale of ['pl', 'en'] as const) for (const firstIssue of [true, false]) {
  test(`classifieds have stable pages, clickable numbers and random answers on the ${firstIssue ? 'second' : 'later'} morning in ${locale}`, async ({ page }, info) => {
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
    let state = morning();
    if (firstIssue) {
      for (let seed = 0; seed < 256; seed++) {
        state = applyAction({ ...createInitialState(seed), money: 10000 }, 'skip-intro').state;
        state = applyAction(applyAction({ ...state, clockMinutes: 840 }, 'end-day').state, 'next-day').state;
        if (state.newspaper.classifiedIds.some(id => classifiedPhone(id))) break;
      }
      expect(state.day).toBe(2);
      expect(state.visit).toBeNull();
    } else {
      do {
        state = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
        do { state = applyAction(state, 'next-day').state; } while (state.phase === 'home');
      } while (state.day < 6 || !state.newspaper.classifiedIds.some(id => classifiedPhone(id)));
    }
    expect(state.newspaper.classifiedIds.some(id => classifiedPhone(id))).toBe(true);
    await load(page, state);
    const audible = firstIssue && locale === 'pl';
    if (audible) await key(page, 'sound');
    await key(page, 'use-phone');
    await expect(page.locator('#announcement')).toContainText(translations[locale].feedback['phone-ready']);
    const phoneSounds = () => page.evaluate(() => window.Howler._howls
      .filter(sound => /phone-(tone|dial)\.wav$/.test(String(sound._src)) && sound.playing())
      .map(sound => ({ src: String(sound._src).split('/').at(-1), muted: sound.mute(), state: sound.state() })));
    if (audible) await expect.poll(phoneSounds).toEqual([{ src: 'phone-tone.wav', muted: false, state: 'loaded' }]);
    await key(page, 'newspaper');
    for (let i = 0; i < state.newspaper.articleIds.length; i++) await key(page, 'newspaper-next');
    const t = translations[locale], ids = state.newspaper.classifiedIds;
    await expect(page.locator('#screen-description')).toContainText(t.newspaper.classifiedTitle);
    for (const id of ids) await expect(page.locator('#screen-description')).toContainText(t.newspaper.classifieds[id]);
    await expect(page.locator('#control-newspaper-next')).toHaveCount(0);
    await expect(page.locator('[id^="control-newspaper-call-"]')).toHaveCount(ids.filter(id => classifiedPhone(id)).length);
    const id = ids.find(id => classifiedPhone(id))!, control = `newspaper-call-${id}`;
    await expect(page.locator(`#control-${control}`)).toHaveAccessibleName(new RegExp(classifiedPhone(id)!));
    await page.locator('#stage').screenshot({ path: info.outputPath(`classifieds-${locale}.png`) });
    const action = { type: 'call-classified', day: state.day, classifiedId: id } as const;
    const expected = applyAction(state, action);
    await page.locator(`#control-${control}`).click();
    await expect(page.locator('#clinic-speech')).toHaveText(t.progression.dialogue.dialing);
    if (audible) await expect.poll(phoneSounds).toEqual([{ src: 'phone-dial.wav', muted: false, state: 'loaded' }]);
    await expect(page.locator('#control-newspaper')).not.toHaveAttribute('data-held', 'true');
    await page.clock.runFor(4100);
    await expect(page.locator('#clinic-speech')).toHaveText(t.feedback[expected.feedback]);
    await page.locator('#stage').screenshot({ path: info.outputPath(`classified-call-${locale}.png`) });
    const other = locale === 'pl' ? 'en' : 'pl';
    await key(page, `language-${other}`);
    await expect(page.locator('#clinic-speech')).toHaveText(translations[other].feedback[expected.feedback]);
    await key(page, `language-${locale}`);
    const called = await exportNewspaperState(page);
    expect(called.newspaper).toEqual(state.newspaper);
    expect(called.newspaperCopies).toEqual(state.newspaperCopies);
    expect(called.rngState).toBe(expected.state.rngState);
    expect(called.papers).toEqual(state.papers);
    expect(called.money).toBe(state.money);
    // A second keyboard attempt draws another result from the saved stream.
    await key(page, control);
    await page.clock.runFor(4100);
    await expect(page.locator('#clinic-speech')).toHaveText(t.feedback[applyAction(called, action).feedback]);
    await page.locator('#control-newspaper').focus(); await page.keyboard.press('Space');
    await expect(page.locator('[id^="control-newspaper-call-"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.locator(`#control-${control}`)).toBeVisible();
    // Invalid ads cannot replace the current issue or reset the selected page.
    await key(page, 'saves');
    const invalid = gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 35, savedAt: '2026-10-31T12:00:00.000Z',
      state: { ...called, newspaper: { ...called.newspaper, classifiedIds: ['invented', 'books', 'jars'] } } })));
    await page.locator('#save-input').setInputFiles({ name: 'broken.npsave', mimeType: 'application/gzip', buffer: Buffer.from(invalid) });
    await expect(page.locator('#announcement')).toContainText(t.errors['invalid-state']);
    await key(page, 'back');
    await expect(page.locator('#controls')).toHaveAttribute('data-newspaper-page', String(state.newspaper.articleIds.length));
    await expect(page.locator('#screen-description')).toContainText(t.newspaper.classifieds[id]);
    await load(page, called);
    await key(page, 'newspaper');
    for (let i = 0; i < state.newspaper.articleIds.length; i++) await key(page, 'newspaper-next');
    await expect(page.locator('#screen-description')).toContainText(t.newspaper.classifieds[id]);
    expect(errors).toEqual([]);
  });
}
