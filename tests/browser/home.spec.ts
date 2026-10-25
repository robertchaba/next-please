import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { applyAction, createInitialState, type GameState } from '../../src/core/game';
import { encodeSave, decodeSave } from '../../src/core/save';

async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}
async function load(page: Page, state: GameState): Promise<void> {
  await page.goto('/');
  await page.locator('#control-saves').click();
  await page.locator('#save-input').setInputFiles({ name: 'shift.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await page.locator('#control-back').click();
  await page.locator('#control-start').click();
}
async function exportState(page: Page, info: TestInfo): Promise<{ state: GameState; buffer: Buffer }> {
  await key(page, 'saves');
  const pending = page.waitForEvent('download');
  await key(page, 'export');
  const download = await pending;
  const file = info.outputPath('home.npsave');
  await download.saveAs(file);
  const buffer = await readFile(file);
  return { state: decodeSave(buffer), buffer };
}
function homeState(day = 1, money = 0, seed = 17): GameState {
  const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
  return applyAction({ ...cabinet, day, money, clockMinutes: 840 }, 'end-day').state;
}
function closingVisit(): GameState {
  let state = applyAction(createInitialState(17), 'skip-intro').state;
  state = { ...state, clockMinutes: 839 };
  for (const action of ['call-patient', 'take-document', 'take-certificate'] as const) state = applyAction(state, action).state;
  return state;
}

test('last patient leaves at closing; automatic home and six-row budget preserve settlement', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await load(page, closingVisit());
  await expect(page.locator('#control-call-patient')).toBeDisabled();
  await expect(page.locator('#control-end-day')).toHaveCount(0);
  for (const id of ['run-general', 'run-vision', 'run-pressure', 'run-measurements', 'write-certificate', 'stamp-fit', 'apply-stamp', 'return-document']) await key(page, id);
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'arrival');
  await expect(page.locator('#screen-description')).toContainText('Na dziś wystarczy pieczątek.');
  await page.screenshot({ path: info.outputPath('home-arrival-pl.png') });
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'budget');
  await expect(page.locator('#screen-description')).toContainText('Dochód podst.: 1000 zł');
  await expect(page.locator('#screen-description')).toContainText('Premia za pacjentów: 50 zł');
  await expect(page.locator('#screen-description')).toContainText('Z poprzedniego miesiąca: 0 zł');
  await expect(page.locator('#screen-description')).toContainText('Koszty życia:');
  await expect(page.locator('#screen-description')).not.toContainText('x 50');
  await page.screenshot({ path: info.outputPath('home-budget-pl.png') });
  const saved = await exportState(page, info);
  expect(saved.state.phase).toBe('home');
  expect(saved.state.settlement).toMatchObject({ income: 1050, patientBonus: 50, patients: 1 });
  expect(saved.state.settlement!.livingCost).toBeGreaterThanOrEqual(400);
  expect(saved.state.settlement!.livingCost).toBeLessThanOrEqual(800);
  expect(saved.state.money).toBe(saved.state.settlement!.closingBalance);
  await page.locator('#save-input').setInputFiles({ name: 'bad.npsave', mimeType: 'application/gzip', buffer: Buffer.from('bad') });
  await expect(page.getByRole('status')).toContainText('Nieprawidłowy');
  await key(page, 'back');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'budget');
  expect((await exportState(page, info)).state).toEqual(saved.state);
  await page.locator('#save-input').setInputFiles({ name: 'home.npsave', mimeType: 'application/gzip', buffer: saved.buffer });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await key(page, 'back');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'arrival');
  await key(page, 'language-en');
  await key(page, 'home-next');
  await expect(page.locator('#screen-description')).toContainText('Base income: 1,000 zł');
  await expect(page.locator('#screen-description')).toContainText('Living costs:');
  await page.screenshot({ path: info.outputPath('home-budget-en.png') });
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'work');
  await expect(page.locator('#screen-description')).toContainText('04/11/1983');
  await page.screenshot({ path: info.outputPath('home-work-en.png') });
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  const next = await exportState(page, info);
  expect(next.state).toMatchObject({ day: 2, money: saved.state.money, shiftCompleted: 0, clockMinutes: 477, settlement: null });
  expect(next.state.roster).toHaveLength(53);
  expect(errors).toEqual([]);
});

test('each home page types in, supports reveal and has full accessible text', async ({ page }, info) => {
  await load(page, homeState());
  await expect(page.locator('#control-home-next')).toHaveAccessibleName('Pokaż cały tekst');
  await expect(page.locator('#screen-description')).toContainText('Na dziś wystarczy pieczątek.');
  const first = await page.locator('#game').screenshot();
  await page.waitForTimeout(220);
  expect(await page.locator('#game').screenshot()).not.toEqual(first);
  for (const [kind, action] of [['arrival', 'SPRAWDŹ BUDŻET'], ['budget', 'RUSZAJ DO PRACY'], ['work', 'WEJDŹ DO PRZYCHODNI']]) {
    await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', kind);
    await expect(page.locator('#control-home-next')).toHaveAccessibleName('Pokaż cały tekst');
    await key(page, 'home-next');
    await expect(page.locator('#control-home-next')).toHaveAccessibleName(action);
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    // A single key advances only to the following page; its text remains revealable.
  }
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await page.screenshot({ path: info.outputPath('home-typewriter-completed.png') });
});

test('weekends stay at home, have optional resort events and lead into Monday', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let saturday: GameState | undefined;
  // Use a real seeded transition, so the event and accounting pass save validation.
  for (let seed = 1; seed < 200; seed++) {
    const state = applyAction(homeState(2, 10000, seed), 'next-day').state;
    if (state.settlement?.event?.kind === 'mountain-trip') { saturday = state; break; }
  }
  expect(saturday).toBeDefined();
  await load(page, saturday!);
  await expect(page.locator('#screen-heading')).toHaveText('WOLNY DZIEŃ');
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'event');
  await expect(page.locator('#screen-heading')).toHaveText('W GÓRACH');
  await expect(page.locator('#screen-description')).not.toContainText('zł');
  await page.screenshot({ path: info.outputPath('weekend-mountain-pl.png') });
  await key(page, 'home-next');
  await expect(page.locator('#screen-heading')).toHaveText('BUDŻET WEEKENDU');
  await expect(page.locator('#screen-description')).toContainText('Dochód podst.: 0 zł');
  await page.screenshot({ path: info.outputPath('weekend-budget-pl.png') });
  await key(page, 'home-next');
  await expect(page.locator('#screen-description')).toContainText('06.11.1983');
  for (let clicks = 0; clicks < 4 && await page.locator('#controls').getAttribute('data-home-kind') !== 'work'; clicks++) await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'work');
  await expect(page.locator('#screen-description')).toContainText('07.11.1983');
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  const monday = await exportState(page, info);
  expect(monday.state).toMatchObject({ day: 5, clockMinutes: 477, settlement: null });
});

test('EOD music is isolated from the workplace across mute, saves and departure', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await load(page, homeState());
  await key(page, 'sound');
  const playing = () => page.evaluate(() => window.Howler._howls.filter(sound => sound.playing()).map(sound => String(sound._src)));
  await expect.poll(playing).toContainEqual(expect.stringContaining('Wissenschaftlicher%20Optimismus%20-%20EOD.mp3'));
  await key(page, 'saves');
  await key(page, 'back');
  await key(page, 'home-next');
  await key(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'work');
  await key(page, 'home-next');
  await expect.poll(async () => (await playing()).filter(src => src.endsWith('.mp3')).length).toBe(1);
  expect((await playing()).some(src => src.includes('EOD') || src.includes('SUCCESS'))).toBe(false);
  await key(page, 'sound');
  expect((await playing()).some(src => src.includes('EOD'))).toBe(false);
});

test('enabling reduced motion immediately reveals the current page and all later pages', async ({ page }) => {
  await load(page, homeState());
  await expect(page.locator('#control-home-next')).toHaveAccessibleName('Pokaż cały tekst');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#control-home-next')).toHaveAccessibleName('SPRAWDŹ BUDŻET');
  await key(page, 'home-next');
  await expect(page.locator('#control-home-next')).toHaveAccessibleName('RUSZAJ DO PRACY');
  await key(page, 'home-next');
  await expect(page.locator('#control-home-next')).toHaveAccessibleName('WEJDŹ DO PRZYCHODNI');
});
