import { loadKnownQueue, knownQueueState } from './fixtures';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { isDocumentClipped, PATIENTS, applyAction, type GameAction } from '../../src/core/game';
import { decodeSave, encodeSave } from '../../src/core/save';
import { CABINET_HOTSPOTS } from '../../src/core/desk';

async function activate(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
  if (['take-document', 'take-certificate', 'take-paper'].includes(id)) await placeCarried(page);
}
async function placeCarried(page: Page): Promise<void> {
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + 350 * stage.width / 570, stage.y + 220 * stage.height / 320);
}
async function movePaperRight(page: Page, id: number): Promise<void> {
  await page.locator(`#control-paper-${id}`).focus();
  await page.keyboard.press('Space');
  await placeCarried(page);
}
async function enter(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await activate(page, 'start');
  for (let n = 0; n < 4; n++) await activate(page, 'intro-next');
  await loadKnownQueue(page);
}
async function sendPaper(page: Page, id: number, destination: 'drawer' | 'trash'): Promise<void> {
  await page.locator(`#control-paper-${id}`).focus();
  await page.keyboard.press('Space');
  await activate(page, destination);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator(`#control-paper-${id}`)).toHaveCount(0);
}
async function exportState(page: Page, testInfo: TestInfo, name: string) {
  await activate(page, 'saves');
  const event = page.waitForEvent('download');
  await activate(page, 'export');
  const filename = testInfo.outputPath(name);
  await (await event).saveAs(filename);
  const buffer = await readFile(filename);
  await activate(page, 'back');
  return { state: decodeSave(buffer), buffer };
}

test('referrals, measurements and written notes remain separate from the certificate; clips and drawer survive saves', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await enter(page);
  await activate(page, 'call-patient');
  await activate(page, 'take-document');
  await expect(page.locator('#control-paper-1')).toHaveAccessibleName(/Irena Wolska/);
  await activate(page, 'paper-1');
  await expect(page.locator('#announcement')).toContainText('1942-04-18');
  for (const id of ['run-general', 'run-vision', 'run-pressure', 'run-measurements', 'take-paper']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Wiek: 41/);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Pozycja siedząca/);
  await expect(page.locator('#control-paper-2')).not.toHaveAccessibleName(/BRAK|NORMA|KONTROLA/);
  await expect(page.locator('#control-paper-action-2')).toHaveCount(0);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Pozycja siedząca/);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/164 cm/);
  await activate(page, 'take-clip');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  await activate(page, 'paper-2');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await sendPaper(page, 2, 'drawer');
  const saved = await exportState(page, testInfo, 'records.npsave');
  expect(saved.state.papers.find(paper => paper.id === 2)).toMatchObject({
    kind: 'note', location: 'drawer', additionalWritten: true, patientId: 0,
    examinationOrder: ['general', 'vision', 'pressure', 'measurements'],
    results: { vision: { left: 0, right: 0 }, pressure: { systolic: 108, diastolic: 62 }, weight: 62, height: 164 },
  });
  await activate(page, 'drawer');
  await activate(page, 'drawer-paper-2');
  await placeCarried(page);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await sendPaper(page, 2, 'trash');
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'records.npsave', mimeType: 'application/gzip', buffer: saved.buffer });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  await activate(page, 'drawer');
  await activate(page, 'drawer-paper-2');
  await placeCarried(page);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await activate(page, 'language-en');
  await expect(page.locator('#control-run-measurements')).toHaveAccessibleName(/height|scale/i);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Age: 41/);
  await activate(page, 'language-pl');
  await movePaperRight(page, 2);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('records-v05-pl.png') });
  for (const id of ['take-certificate', 'write-certificate', 'stamp-fit', 'apply-stamp', 'return-document']) await activate(page, id);
  const completed = await exportState(page, testInfo, 'complete.npsave');
  expect(completed.state).toMatchObject({ money: 0, shiftCompleted: 1, patientsProcessed: 1, settlement: null });
  expect(completed.state.papers.filter(paper => paper.kind === 'letter')).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('detected wrong decisions deliver the right sender and envelopes can be opened and discarded', async ({ page }, testInfo) => {
  await enter(page);
  // Two known detection rolls exercise both letters without relying on the
  // fresh game's entropy. Load through the same validated save UI as a player.
  let fixture = knownQueueState();
  for (let seed = 1; seed < 1000; seed++) {
    const candidate = { ...fixture, rngState: seed };
    let checked = candidate;
    for (const decision of ['stamp-unfit', 'stamp-fit'] as const) {
      for (const action of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', decision, 'return-document'] as GameAction[]) checked = applyAction(checked, action).state;
    }
    if (checked.daily.refusals === 1 && checked.daily.zusCases === 1) { fixture = candidate; break; }
  }
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({
    name: 'reported-cases.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(fixture)),
  });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit', 'apply-stamp', 'return-document']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/koperta/i);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/DZIAŁ KADR EWIDENCJA/);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Fioletowa pieczęć działu kadr/);
  await movePaperRight(page, 2);
  await page.locator('#control-paper-action-2').click();
  const first = await exportState(page, testInfo, 'employer.npsave');
  expect(first.state.papers.find(paper => paper.id === 2)).toMatchObject({ kind: 'letter', sender: 'employer', opened: true });
  expect(first.state).toMatchObject({ insuranceRate: 350, daily: { refusals: 1, insuranceIncrease: 50, zusCases: 0, fines: 0 } });
  await page.screenshot({ path: testInfo.outputPath('letter-employer-v05.png') });
  await sendPaper(page, 2, 'trash');
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'apply-stamp', 'return-document', 'paper-4']) await activate(page, id);
  const second = await exportState(page, testInfo, 'zus.npsave');
  expect(second.state.papers.find(paper => paper.id === 4)).toMatchObject({ kind: 'letter', sender: 'zus', opened: true });
  expect(second.state).toMatchObject({ insuranceRate: 350, daily: { refusals: 1, insuranceIncrease: 50, zusCases: 1, fines: 100 } });
  await expect(page.locator('#control-paper-4')).toHaveAccessibleName(/Podłużna niebieska pieczęć ZUS/);
  await movePaperRight(page, 4);
  // Mouse pickup and a click on the physical wastebasket use the same transition.
  await page.locator('#control-paper-4').click({ position: { x: 30, y: 30 } });
  const stage = (await page.locator('#stage').boundingBox())!;
  const trash = CABINET_HOTSPOTS.trash;
  await page.mouse.click(stage.x + (trash.x + trash.w / 2) * stage.width / 570, stage.y + (trash.y + trash.h / 2) * stage.height / 320);
  await expect(page.locator('#control-paper-4')).toHaveCount(0);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  // The supplies are reusable, including between appointments.
  await activate(page, 'take-paper');
  await activate(page, 'take-paper');
  await expect(page.locator('#control-paper-5')).toBeAttached();
  await expect(page.locator('#control-paper-6')).toBeAttached();
});

test('a keyboard-applied clip attaches to the focused sheet even under another sheet', async ({ page }, testInfo) => {
  await enter(page);
  await activate(page, 'take-paper');
  await activate(page, 'take-paper');
  await activate(page, 'take-clip');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  await activate(page, 'paper-1');
  const { state } = await exportState(page, testInfo, 'clip-target.npsave');
  expect(isDocumentClipped(state, 1)).toBe(true);
  expect(isDocumentClipped(state, 2)).toBe(false);
});

test('telephone exchange tone is local, unlocked by a gesture and respects mute', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().endsWith('/telephone.wav')) requests.push(request.url()); });
  await enter(page);
  await activate(page, 'use-phone');
  expect(requests).toEqual([]);
  await page.getByRole('button', { name: 'Włącz dźwięk', exact: true }).click();
  await activate(page, 'use-phone');
  await expect.poll(() => page.evaluate(() => window.Howler._howls.some(sound => String(sound._src).endsWith('/telephone.wav') && sound.state() === 'loaded'))).toBe(true);
  expect(requests).toHaveLength(1);
  await page.getByRole('button', { name: 'Wycisz dźwięk', exact: true }).click();
  expect(await page.evaluate(() => window.Howler._howls.filter(sound => String(sound._src).endsWith('/telephone.wav')).every(sound => sound.mute()))).toBe(true);
});

async function clickNative(page: Page, x: number, y: number): Promise<void> {
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + x * stage.width / 570, stage.y + y * stage.height / 320);
}
async function sheetBounds(page: Page, id: string) {
  return page.locator(`#control-${id}`).evaluate(element => ({
    x: parseInt(element.style.left), y: parseInt(element.style.top),
    w: parseInt(element.style.width), h: parseInt(element.style.height),
  }));
}

test('dropping onto the projecting clip creates a movable bundle, survives saves and separates on click', async ({ page }, testInfo) => {
  await enter(page);
  await activate(page, 'take-paper');
  await page.locator('#control-paper-1').focus();
  await page.keyboard.press('Space');
  await clickNative(page, 320, 145);
  await activate(page, 'take-clip');
  await activate(page, 'paper-1');
  await activate(page, 'take-paper');
  const clip = await sheetBounds(page, 'paper-clip-1');
  await page.locator('#control-paper-2').focus();
  await page.keyboard.press('Space');
  // This pixel is above the sheet itself, on the exposed end of the clip.
  await clickNative(page, clip.x + 5, clip.y + 1);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#control-paper-clip-2')).toBeAttached();
  await expect(page.locator('#control-paper-clip-1')).toHaveCount(0);
  const before = [await sheetBounds(page, 'paper-1'), await sheetBounds(page, 'paper-2')];
  await page.locator('#control-paper-2').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#control-paper-1')).toHaveAttribute('data-held', 'true');
  expect((await sheetBounds(page, 'paper-1')).w).toBe(48);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Escape');
  expect([await sheetBounds(page, 'paper-1'), await sheetBounds(page, 'paper-2')]).toEqual(before);
  await sendPaper(page, 2, 'drawer');
  await expect(page.locator('#control-paper-1')).toHaveCount(0);
  const saved = await exportState(page, testInfo, 'bundle.npsave');
  expect(saved.state.paperClips).toEqual([[1, 2]]);
  expect(saved.state.papers.every(paper => paper.location === 'drawer')).toBe(true);
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'bundle.npsave', mimeType: 'application/gzip', buffer: saved.buffer });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  await activate(page, 'drawer');
  // A bundle has one cover in filing order, identified by its first sheet.
  await expect(page.locator('[id^="control-drawer-paper-"]')).toHaveCount(1);
  await activate(page, 'drawer-paper-1');
  await expect(page.locator('#control-paper-1')).toHaveAttribute('data-held', 'true');
  await expect(page.locator('#control-paper-2')).toHaveAttribute('data-held', 'true');
  await placeCarried(page);
  await expect(page.locator('#control-paper-1')).toBeAttached();
  await page.locator('[id^="control-paper-clip-"]').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('[id^="control-paper-clip-"]')).toHaveCount(0);
  const first = await sheetBounds(page, 'paper-1');
  await movePaperRight(page, 2);
  expect(await sheetBounds(page, 'paper-1')).toEqual(first);
  const separated = await exportState(page, testInfo, 'separated.npsave');
  expect(separated.state.paperClips).toEqual([]);
});

test('keyboard joins a certificate bundle, drawer rejects it, and handoff detaches only the certificate', async ({ page }, testInfo) => {
  await enter(page);
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'apply-stamp', 'take-clip', 'apply-stamp']) await activate(page, id);
  await expect(page.locator('#control-certificate-clip')).toBeAttached();
  await page.locator('#control-paper-1').focus();
  await page.keyboard.press('Space');
  await activate(page, 'certificate-clip');
  await expect(page.locator('#control-paper-clip-1')).toBeAttached();
  const before = [await sheetBounds(page, 'paper-1'), await sheetBounds(page, 'apply-stamp')];
  await page.locator('#control-paper-1').focus();
  await page.keyboard.press('Space');
  await activate(page, 'drawer');
  await expect(page.locator('#announcement')).toContainText('odepnij orzeczenie');
  expect([await sheetBounds(page, 'paper-1'), await sheetBounds(page, 'apply-stamp')]).toEqual(before);
  await page.locator('#control-paper-1').focus();
  await page.keyboard.press('Space');
  await activate(page, 'return-document');
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  await expect(page.locator('#control-paper-1')).toBeAttached();
  expect((await sheetBounds(page, 'paper-1')).w).toBe(212);
  const { state } = await exportState(page, testInfo, 'bundle-handoff.npsave');
  expect(state.visit).toBeNull();
  expect(state.paperClips).toEqual([[1]]);
});

test('findings and history append automatically without a pen, including filed notes', async ({ page }, testInfo) => {
  await enter(page);
  for (const id of ['call-patient', 'take-document', 'take-paper']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName('Dokumentacja lekarska. Irena Wolska   Wiek: 41.');
  await expect(page.locator('#control-paper-action-2')).toHaveCount(0);
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('identity-only-pl.png') });
  const initial = await exportState(page, testInfo, 'identity-only.npsave');
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'identity-only.npsave', mimeType: 'application/gzip', buffer: initial.buffer });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  await movePaperRight(page, 2);
  await activate(page, 'language-en');
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName('Medical notes. Irena Wolska   Age: 41.');
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('identity-only-en.png') });
  await activate(page, 'paper-2');
  await expect(page.locator('#announcement')).toContainText('Medical notes. Irena Wolska');
  await expect(page.locator('#control-paper-action-2')).toHaveCount(0);
  await activate(page, 'language-pl');
  await activate(page, 'run-vision');
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Wzrok: OL: 0, OP: 0/);
  await expect(page.locator('#control-paper-2')).not.toHaveAccessibleName(/Pozycja siedząca/);
  await expect(page.locator('#control-paper-2')).not.toHaveAccessibleName(/BRAK|NORMA|KONTROLA/);
  await expect(page.locator('#control-paper-action-2')).toHaveCount(0);
  await activate(page, 'paper-2');
  await expect(page.locator('#announcement')).toContainText('Wzrok: OL: 0, OP: 0');
  await expect(page.locator('#control-paper-2')).not.toHaveAccessibleName(/Pozycja siedząca/);
  await activate(page, 'run-general');
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Pozycja siedząca/);
  await expect(page.locator('#control-paper-action-2')).toHaveCount(0);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Pozycja siedząca/);
  await sendPaper(page, 2, 'drawer');
  await activate(page, 'run-pressure');
  await activate(page, 'run-measurements');
  const { state } = await exportState(page, testInfo, 'auto-notes.npsave');
  expect(state.papers.find(paper => paper.id === 2)).toMatchObject({
    location: 'drawer', additionalWritten: true,
    results: { vision: { left: 0, right: 0 }, pressure: { systolic: 108, diastolic: 62 }, weight: 62, height: 164 },
  });
  await activate(page, 'run-pressure');
  await activate(page, 'drawer');
  await activate(page, 'drawer-paper-2');
  await placeCarried(page);
  const firstTwo = await exportState(page, testInfo, 'first-two-pressure.npsave');
  await activate(page, 'run-pressure');
  await activate(page, 'run-pressure');
  const repeated = await exportState(page, testInfo, 'repeated-pressure.npsave');
  const readings = repeated.state.visit!.pressureReadings;
  expect(readings).toHaveLength(2);
  expect(readings).toEqual(firstTwo.state.visit!.pressureReadings);
  expect(readings[0]).not.toEqual(readings[1]);
  const note = repeated.state.papers.find(paper => paper.id === 2)!;
  if (note.kind !== 'note') throw new Error('Expected note');
  expect(note.results.pressureReadings).toEqual(readings);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Wiek: 41/);
  for (const reading of readings) await expect(page.locator('#control-paper-2')).toHaveAccessibleName(new RegExp(`Ciśnienie: ${reading.systolic}/${reading.diastolic}`));
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'repeated-pressure.npsave', mimeType: 'application/gzip', buffer: repeated.buffer });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  for (const reading of readings) await expect(page.locator('#control-paper-2')).toHaveAccessibleName(new RegExp(`Ciśnienie: ${reading.systolic}/${reading.diastolic}`));
});

test('notes append completed tests in order and show very high numeric pressure in red in both languages', async ({ page }, testInfo) => {
  await enter(page);
  const fixture = knownQueueState();
  fixture.roster = [5, ...fixture.roster.filter(id => PATIENTS[id]!.characterId !== PATIENTS[5]!.characterId)];
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'pressure.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(fixture)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  for (const id of ['call-patient', 'take-document', 'take-paper']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Wiek:/);
  for (const id of ['run-measurements', 'run-general', 'run-pressure', 'run-vision']) await activate(page, id);
  const note = page.locator('#control-paper-2');
  await expect(note).toHaveAccessibleName(/Waga 55 kg.*Badanie ogólne: bez uwag.*Ciśnienie: 200\/120.*Wzrok: OL:/);
  const beforeRepeat = await note.getAttribute('aria-label');
  await activate(page, 'run-pressure');
  await expect(note).toHaveAccessibleName(/Waga 55 kg.*Badanie ogólne: bez uwag.*Ciśnienie: 200\/120.*Wzrok: OL:.*Ciśnienie:/);
  expect((await note.getAttribute('aria-label'))!.startsWith(beforeRepeat!.replace(/ Ciśnienie: bardzo wysokie\.$/, ''))).toBe(true);
  await expect(page.locator('#control-paper-action-2')).toHaveCount(0);
  await expect(note).toHaveAccessibleName(/bardzo wysokie/);
  await expect(note).not.toHaveAccessibleName(/BRAK|NORMA|KONTROLA/);
  const redPixels = await page.locator('#game').evaluate((element) => {
    const pixels = (element as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 570, 320).data;
    let matches = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) if (pixels[offset] === 163 && pixels[offset + 1] === 49 && pixels[offset + 2] === 40) matches++;
    return matches;
  });
  expect(redPixels).toBeGreaterThan(40);
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('numeric-pressure-pl.png') });
  await activate(page, 'language-en');
  await expect(note).toHaveAccessibleName(/Weight 55 kg.*General examination: no concerns.*Pressure: 200\/120.*Vision: LE:/);
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('numeric-pressure-en.png') });
  const { state } = await exportState(page, testInfo, 'numeric-notes.npsave');
  expect(state.papers.find(paper => paper.id === 2)).toMatchObject({ examinationOrder: ['measurements', 'general', 'pressure', 'vision'], noteOrder: ['measurements', 'general', 'history', 'pressure', 'vision', 'pressure-repeat'] });
});
