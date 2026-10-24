import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createInitialState, decodeSave, encodeSave } from '../../src/core/save';

async function useKeyboard(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
  // These regression suites exercise later visit behavior. Put each newly
  // supplied form on the right desk before continuing through the controls.
  if (id === 'take-document' || id === 'take-certificate') {
    await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
    const fromRack = id === 'take-certificate';
    for (let step = 0; step < (fromRack ? 16 : 20); step++) await page.keyboard.press(fromRack ? 'Shift+ArrowLeft' : 'Shift+ArrowRight');
    for (let step = 0; step < (fromRack ? 4 : 3); step++) await page.keyboard.press(fromRack ? 'Shift+ArrowDown' : 'Shift+ArrowUp');
    await page.keyboard.press('Enter');
    await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  }
}

async function enterCabinet(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
}

async function exportFromArchive(page: Page, testInfo: TestInfo, filename: string): Promise<Buffer> {
  const event = page.waitForEvent('download');
  await page.locator('#control-export').click();
  const download = await event;
  const file = testInfo.outputPath(filename);
  await download.saveAs(file);
  return readFile(file);
}

test('four illustrated introduction cards lead directly to an empty cabinet using the keyboard', async ({ page }, testInfo) => {
  const errors: string[] = [];
  const audioRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (/\.(wav|mp3)(?:\?|$)/.test(request.url())) audioRequests.push(request.url());
  });
  await page.goto('/');
  await useKeyboard(page, 'start');
  await expect(page.getByRole('heading', { name: 'INSTRUKTAŻ STANOWISKOWY' })).toBeAttached();
  for (let step = 0; step < 4; step++) {
    await expect(page.locator('#controls')).toHaveAttribute('data-intro-step', String(step));
    await expect(page.locator('#control-intro-reveal, #control-intro-skip')).toHaveCount(0);
    await expect(page.locator('#controls button')).toHaveCount(1);
    await expect(page.locator('#session-controls button')).toHaveCount(0);
    if (step === 3) {
      await expect(page.locator('#screen-description')).toContainText('pieczątkę.');
      await expect(page.locator('#control-intro-next')).toHaveAccessibleName('DO GABINETU');
      // The screen-reader description stays complete while the short visual line types in.
      await page.waitForTimeout(1200);
      await page.screenshot({ path: testInfo.outputPath('intro-stamp-pl.png') });
    }
    await useKeyboard(page, 'intro-next');
  }
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.getByRole('heading', { name: 'GABINET NR 04' })).toBeAttached();
  await expect(page.locator('#screen-description')).toContainText('NA RAZIE CISZA.');
  await expect(page.locator('#control-call-patient')).toBeVisible();
  await expect(page.locator('#session-controls #control-saves')).toBeVisible();
  await expect(page.locator('#viewport #control-menu, #viewport #control-saves')).toHaveCount(0);
  await expect(page.locator('.surround-bottom')).not.toContainText('570');
  await page.screenshot({ path: testInfo.outputPath('cabinet-empty-pl.png') });
  expect(audioRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('typewriting uses the local effect after sound is enabled', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Włącz dźwięk' }).click();
  const effectResponse = page.waitForResponse(response => response.url().endsWith('/assets/audio/typewriter.wav'));
  await page.locator('#control-start').click();
  const response = await effectResponse;
  expect(response.ok()).toBe(true);
  expect((await response.body()).length).toBeGreaterThan(1000);
  await expect.poll(() => page.evaluate(() => window.Howler._howls
    .some(sound => typeof sound._src === 'string' && sound._src.endsWith('/typewriter.wav') && sound.state() === 'loaded'))).toBe(true);
  await page.getByRole('button', { name: 'Wycisz dźwięk' }).click();
  expect(await page.evaluate(() => window.Howler._howls
    .filter(sound => typeof sound._src === 'string' && sound._src.endsWith('/typewriter.wav')).every(sound => sound.mute()))).toBe(true);
});

test('examinations, two-step stamping and the rulebook support a complete keyboard shift', async ({ page }, testInfo) => {
  await enterCabinet(page);
  await useKeyboard(page, 'manual');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#screen-description')).toContainText('INSTRUKCJA OBSŁUGI DYŻURU');
  await expect(page.locator('#control-manual-prev')).toHaveAccessibleName('Zamknij regulamin');
  await useKeyboard(page, 'manual-next');
  await expect(page.locator('#screen-description')).toContainText('Choć jedna KONTROLA: wybierz NIEZDOLNY.');
  await page.screenshot({ path: testInfo.outputPath('rulebook-tests-pl.png') });
  for (let index = 2; index < 5; index++) {
    await useKeyboard(page, 'manual-next');
    await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', String(index));
  }
  await expect(page.locator('#control-manual-next')).toHaveCount(0);
  await expect(page.locator('#screen-description')).toContainText('Czynności zabierają czas.');
  await useKeyboard(page, 'manual-prev');
  await expect(page.locator('#screen-description')).toContainText('Kliknięcie spinacza rozpina dokumenty.');
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  await expect(page.locator('#control-manual')).toBeFocused();

  const patients = [
    { name: 'Irena Wolska', decision: 'fit', vision: 'NORMA', pressure: 'NORMA' },
    { name: 'Leon Burek', decision: 'unfit', vision: 'KONTROLA', pressure: 'NORMA' },
    { name: 'Marta Lis', decision: 'unfit', vision: 'NORMA', pressure: 'KONTROLA' },
  ];
  for (const [index, patient] of patients.entries()) {
    await useKeyboard(page, 'call-patient');
    await expect(page.locator('#screen-description')).toContainText(patient.name);
    await useKeyboard(page, 'take-document');
    await useKeyboard(page, 'take-certificate');
    await useKeyboard(page, 'write-certificate');
    if (index === 0) {
      await useKeyboard(page, 'stamp-fit');
      await useKeyboard(page, 'apply-stamp');
      await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
    }
    await useKeyboard(page, 'run-vision');
    await expect(page.locator('#screen-description')).toContainText(`Wzrok: ${patient.vision}.`);
    await useKeyboard(page, 'run-pressure');
    await expect(page.locator('#screen-description')).toContainText(`Ciśnienie: ${patient.pressure}.`);
    await useKeyboard(page, 'run-measurements');
    await useKeyboard(page, `stamp-${patient.decision}`);
    await expect(page.locator(`#control-stamp-${patient.decision}`)).toHaveAttribute('aria-pressed', 'true');
    await useKeyboard(page, 'apply-stamp');
    await expect(page.locator('#screen-description')).toContainText(`Podbito: ${patient.decision === 'fit' ? 'ZDOLNY' : 'NIEZDOLNY'}.`);
    if (index === 1) await page.screenshot({ path: testInfo.outputPath('cabinet-stamped-pl.png') });
    await useKeyboard(page, 'return-document');
    await expect(page.locator('#screen-description')).toContainText('Decyzja zgodna z regulaminem. +10 punktów.');
  }
  await expect(page.locator('#control-next-day')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('shift-complete-pl.png') });
  await useKeyboard(page, 'saves');
  const completed = decodeSave(await exportFromArchive(page, testInfo, 'completed-shift.npsave'));
  expect(completed).toMatchObject({ day: 1, money: 30, patientsProcessed: 3, shiftCompleted: 3, visit: null });
  expect(completed.clockMinutes).toBeGreaterThan(480);
  // Three handwritten names add three handling minutes to this short shift.
  expect(completed.clockMinutes).toBeLessThanOrEqual(540);
  await useKeyboard(page, 'back');
  await useKeyboard(page, 'next-day');
  await expect(page.locator('#screen-description')).toContainText('Nowy dyżur. Te same formularze.');
  await useKeyboard(page, 'saves');
  const state = decodeSave(await exportFromArchive(page, testInfo, 'next-shift.npsave'));
  expect(state).toMatchObject({ day: 2, money: 30, patientsProcessed: 3, shiftCompleted: 0, visit: null });
});

test('mid-visit saves retain examinations, stamped papers and cabinet decor; bad imports retain the live visit', async ({ page }, testInfo) => {
  await enterCabinet(page);
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-vision', 'run-pressure', 'run-measurements', 'stamp-fit', 'apply-stamp', 'lamp', 'decoration', 'saves']) {
    await useKeyboard(page, id);
  }
  const saved = await exportFromArchive(page, testInfo, 'mid-visit.npsave');
  const expected = decodeSave(saved);
  expect(expected).toMatchObject({
    phase: 'cabinet', lampOn: false, decoration: 'certificate',
    visit: { patientId: 0, document: 'desk', visionTested: true, pressureTested: true, decision: 'fit' },
  });
  await page.locator('#control-back').click();
  await expect(page.locator('#control-saves')).toBeFocused();
  await page.locator('#control-return-document').click();
  await page.locator('#control-saves').click();
  await page.locator('#save-input').setInputFiles({ name: 'mid-visit.npsave', mimeType: 'application/gzip', buffer: saved });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await page.locator('#control-back').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#screen-description')).toContainText('Irena Wolska');
  await expect(page.locator('#screen-description')).toContainText('ZDOLNY');

  await page.locator('#control-saves').click();
  await page.locator('#save-input').setInputFiles({ name: 'broken.npsave', mimeType: 'application/gzip', buffer: Buffer.from('not a save') });
  await expect(page.getByRole('status')).toContainText('Nieprawidłowy lub uszkodzony');
  expect(decodeSave(await exportFromArchive(page, testInfo, 'after-failed-import.npsave'))).toEqual(expected);
  await page.locator('#control-back').click();
  await page.locator('#control-return-document').click();
  await expect(page.locator('#screen-description')).toContainText('Decyzja zgodna z regulaminem. +10 punktów.');
  const storageKeys = await page.evaluate(() => Object.keys(localStorage));
  expect(storageKeys.every(key => key === 'next-please.preferences')).toBe(true);
});

test('a certificate stamped before examinations survives import and can be returned without a bonus', async ({ page }, testInfo) => {
  await enterCabinet(page);
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'stamp-fit', 'apply-stamp']) await useKeyboard(page, id);
  await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
  await useKeyboard(page, 'saves');
  const saved = await exportFromArchive(page, testInfo, 'unexamined-stamped.npsave');
  expect(decodeSave(saved)).toMatchObject({
    money: 0, patientsProcessed: 0, shiftCompleted: 0,
    visit: { patientId: 0, document: 'desk', visionTested: false, pressureTested: false, decision: 'fit' },
  });
  await useKeyboard(page, 'back');
  await useKeyboard(page, 'run-vision');
  await useKeyboard(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'unexamined-stamped.npsave', mimeType: 'application/gzip', buffer: saved });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  expect(decodeSave(await exportFromArchive(page, testInfo, 'unexamined-restored.npsave'))).toEqual(decodeSave(saved));
  await useKeyboard(page, 'back');
  await useKeyboard(page, 'write-certificate');
  await useKeyboard(page, 'return-document');
  await expect(page.locator('#screen-description')).toContainText('Bez premii.');
  await useKeyboard(page, 'saves');
  expect(decodeSave(await exportFromArchive(page, testInfo, 'unexamined-returned.npsave'))).toMatchObject({
    money: 0, patientsProcessed: 1, shiftCompleted: 1, visit: null,
  });
});

test('an imported introduction restores keyboard focus when the cabinet archive closes', async ({ page }) => {
  await enterCabinet(page);
  await page.locator('#control-saves').click();
  await page.locator('#save-input').setInputFiles({
    name: 'introduction.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(createInitialState())),
  });
  await expect(page.getByRole('status')).toContainText('Zapis wczytany');
  await useKeyboard(page, 'back');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'intro');
  await expect(page.locator('#control-intro-next')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#controls')).toHaveAttribute('data-intro-step', '1');
});

test('finishing an import after leaving the archive opens the restored scene', async ({ page }) => {
  await enterCabinet(page);
  await page.locator('#control-saves').click();
  await page.evaluate(() => {
    const read = File.prototype.arrayBuffer;
    let finish!: () => void;
    const gate = new Promise<void>(resolve => { finish = resolve; });
    File.prototype.arrayBuffer = async function () { await gate; return read.call(this); };
    (window as Window & { finishSaveImport?: () => void }).finishSaveImport = () => {
      File.prototype.arrayBuffer = read;
      finish();
    };
  });
  await page.locator('#save-input').setInputFiles({
    name: 'introduction.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(createInitialState())),
  });
  await expect(page.getByRole('status')).toContainText('Odczytywanie akt...');
  await page.locator('#control-back').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await page.evaluate(() => (window as Window & { finishSaveImport?: () => void }).finishSaveImport!());
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'intro');
  await expect(page.locator('#controls')).toHaveAttribute('data-intro-step', '0');
  await expect(page.getByRole('heading', { name: 'INSTRUKTAŻ STANOWISKOWY' })).toBeAttached();
  await expect(page.locator('#control-intro-next')).toBeVisible();
  await expect(page.locator('#control-intro-next')).toBeFocused();
  await expect(page.locator('#control-call-patient')).not.toBeAttached();
});

test('English introduction, cabinet and rulebook remain usable on a small screen', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await page.locator('#control-start').click();
  await expect(page.locator('#screen-description')).toContainText('Some use');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: testInfo.outputPath('intro-mobile-en.png') });
  for (let step = 0; step < 4; step++) await page.locator('#control-intro-next').click();
  await page.getByRole('button', { name: 'NEXT, PLEASE!', exact: true }).click();
  await useKeyboard(page, 'take-document');
  await useKeyboard(page, 'take-certificate');
  await page.getByRole('button', { name: 'EYE CHART', exact: true }).click();
  await expect(page.locator('#screen-description')).toContainText('Vision: NORMAL.');
  const canvas = (await page.locator('#game').boundingBox())!;
  expect(canvas.width).toBeLessThanOrEqual(374);
  expect(canvas.height / canvas.width).toBeCloseTo(320 / 570, 3);
  for (const id of ['manual', 'stamp-fit', 'stamp-unfit', 'lamp', 'decoration']) {
    const bounds = (await page.locator(`#control-${id}`).boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(canvas.x);
    expect(bounds.y).toBeGreaterThanOrEqual(canvas.y);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(canvas.y + canvas.height + 1);
  }
  await page.screenshot({ path: testInfo.outputPath('cabinet-mobile-en.png') });
  await useKeyboard(page, 'manual');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#screen-description')).toContainText('SHIFT OPERATING INSTRUCTIONS');
  await expect(page.locator('#control-manual-next')).toHaveAccessibleName('Next rulebook page');
  await page.locator('#control-manual-next').click();
  await expect(page.locator('#screen-description')).toContainText('Either one REVIEW: choose UNFIT.');
  await page.screenshot({ path: testInfo.outputPath('rulebook-mobile-en.png') });
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-manual')).toBeFocused();
});
