import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { isDocumentClipped } from '../../src/core/game';
import { decodeSave } from '../../src/core/save';
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
  await expect(page.locator('#announcement')).toContainText('1952-04-18');
  for (const id of ['run-vision', 'run-pressure', 'run-measurements', 'take-paper']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await expect(page.locator('#control-paper-2')).not.toHaveAccessibleName(/Pozycja siedząca/);
  await page.locator('#control-paper-action-2').click();
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
    results: { vision: 'pass', pressure: 'pass', weight: 62, height: 164 },
  });
  await activate(page, 'drawer');
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await sendPaper(page, 2, 'trash');
  await activate(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'records.npsave', mimeType: 'application/gzip', buffer: saved.buffer });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  await activate(page, 'drawer');
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/62 kg/);
  await activate(page, 'language-en');
  await expect(page.locator('#control-run-measurements')).toHaveAccessibleName(/height|scale/i);
  await activate(page, 'language-pl');
  await movePaperRight(page, 2);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('records-v05-pl.png') });
  for (const id of ['take-certificate', 'write-certificate', 'stamp-fit', 'apply-stamp', 'return-document']) await activate(page, id);
  const completed = await exportState(page, testInfo, 'complete.npsave');
  expect(completed.state.money).toBe(10);
  expect(completed.state.papers.filter(paper => paper.kind === 'letter')).toHaveLength(0);
  expect(errors).toEqual([]);
});

test('both wrong decisions deliver the right sender and envelopes can be opened and discarded', async ({ page }, testInfo) => {
  await enter(page);
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit', 'apply-stamp', 'return-document']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/koperta/i);
  await movePaperRight(page, 2);
  await page.locator('#control-paper-action-2').click();
  const first = await exportState(page, testInfo, 'employer.npsave');
  expect(first.state.papers.find(paper => paper.id === 2)).toMatchObject({ kind: 'letter', sender: 'employer', opened: true });
  await page.screenshot({ path: testInfo.outputPath('letter-employer-v05.png') });
  await sendPaper(page, 2, 'trash');
  for (const id of ['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'apply-stamp', 'return-document', 'paper-4']) await activate(page, id);
  const second = await exportState(page, testInfo, 'zus.npsave');
  expect(second.state.papers.find(paper => paper.id === 4)).toMatchObject({ kind: 'letter', sender: 'zus', opened: true });
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
  await expect(page.locator('#control-paper-1')).toBeAttached();
  await page.locator('#control-paper-clip-2').click();
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
  expect((await sheetBounds(page, 'paper-1')).w).toBe(188);
  const { state } = await exportState(page, testInfo, 'bundle-handoff.npsave');
  expect(state.visit).toBeNull();
  expect(state.paperClips).toEqual([[1]]);
});

test('findings update notes without the pen and preserve supplementary writing independently', async ({ page }, testInfo) => {
  await enter(page);
  for (const id of ['call-patient', 'take-document', 'take-paper']) await activate(page, id);
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName('Czysta kartka');
  await activate(page, 'run-vision');
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Wzrok: NORMA/);
  await expect(page.locator('#control-paper-2')).not.toHaveAccessibleName(/Pozycja siedząca/);
  await page.locator('#control-paper-action-2').click();
  await expect(page.locator('#control-paper-2')).toHaveAccessibleName(/Pozycja siedząca/);
  await sendPaper(page, 2, 'drawer');
  await activate(page, 'run-pressure');
  await activate(page, 'run-measurements');
  const { state } = await exportState(page, testInfo, 'auto-notes.npsave');
  expect(state.papers.find(paper => paper.id === 2)).toMatchObject({
    location: 'drawer', additionalWritten: true,
    results: { vision: 'pass', pressure: 'pass', weight: 62, height: 164 },
  });
});
