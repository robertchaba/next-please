import { expect, test, type Page } from '@playwright/test';
import { PATIENT_HANDOFF, TRAY, type Point, type Rect } from '../../src/core/desk';

async function activate(page: Page, id: string): Promise<void> {
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
  await activate(page, 'start');
  for (let step = 0; step < 4; step++) await activate(page, 'intro-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
}

async function logicalRect(page: Page, id: string): Promise<Rect> {
  return page.locator(`#control-${id}`).evaluate(element => ({
    x: parseFloat(element.style.left), y: parseFloat(element.style.top),
    w: parseFloat(element.style.width), h: parseFloat(element.style.height),
  }));
}

function center(rect: Rect): Point {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

async function screenPoint(page: Page, point: Point): Promise<Point> {
  const canvas = (await page.locator('#game').boundingBox())!;
  return { x: canvas.x + point.x * canvas.width / 570, y: canvas.y + point.y * canvas.height / 320 };
}

async function clickAt(page: Page, point: Point): Promise<void> {
  const target = await screenPoint(page, point);
  await page.mouse.click(target.x, target.y);
}

async function carryTo(page: Page, id: string, destination: Point): Promise<void> {
  await page.locator(`#control-${id}`).click();
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  const target = await screenPoint(page, destination);
  await page.mouse.move(target.x, target.y, { steps: 4 });
  await page.mouse.click(target.x, target.y);
}

async function clockMinutes(page: Page): Promise<number> {
  return Number(await page.locator('#controls').getAttribute('data-clock-minutes'));
}

test('carried stamps stay in hand, rest at the side, and only handing the certificate to the patient ends the visit', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'enter');
  await expect.poll(() => page.locator('#controls').getAttribute('data-patient-frame')).not.toBe('0');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');

  await carryTo(page, 'take-document', { x: 352, y: 228 });
  await expect(page.locator('#control-paper-1')).toBeVisible();
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  await activate(page, 'take-certificate');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#control-take-document')).toHaveCount(0);
  const paper = await logicalRect(page, 'apply-stamp');
  expect(paper).toMatchObject({ w: 188, h: 144 });
  const stampHome = await logicalRect(page, 'stamp-fit');
  expect(stampHome).toMatchObject({ x: 520, w: 36, h: 36 });
  await page.locator('#control-stamp-fit').click();
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');
  expect(await logicalRect(page, 'stamp-fit')).toMatchObject({ w: 48, h: 48 });
  const emptyDesk = await screenPoint(page, { x: 480, y: 286 });
  await page.mouse.move(emptyDesk.x, emptyDesk.y);
  await expect(page.locator('#stage')).toHaveCSS('cursor', 'none');
  expect(await logicalRect(page, 'stamp-fit')).toMatchObject({ x: 456, y: 244 });
  await page.mouse.click(emptyDesk.x, emptyDesk.y);
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');
  await expect(page.locator('#screen-description')).not.toContainText('Podbito:');

  await clickAt(page, { x: paper.x + 100, y: paper.y + 90 });
  await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
  await expect(page.locator('#screen-description')).toContainText('WZROK: BRAK');
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');
  await clickAt(page, center(stampHome));
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  expect(await logicalRect(page, 'stamp-fit')).toEqual(stampHome);

  await carryTo(page, 'apply-stamp', center(TRAY));
  await expect(page.locator('#control-apply-stamp')).toBeVisible();
  expect(await logicalRect(page, 'apply-stamp')).toMatchObject({ w: 60, h: 80 });
  await expect(page.locator('#screen-description')).toContainText('Irena Wolska');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await carryTo(page, 'apply-stamp', center(PATIENT_HANDOFF));
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  await expect(page.locator('#screen-description')).toContainText('Bez premii.');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'exit');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
});

test('an unstamped handoff preserves the visit and restores the document position', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  const before = await logicalRect(page, 'apply-stamp');
  expect(await logicalRect(page, 'return-document')).toEqual(PATIENT_HANDOFF);
  await carryTo(page, 'apply-stamp', center(PATIENT_HANDOFF));
  await expect(page.locator('#screen-description')).toContainText('Dokument potrzebuje pieczątki.');
  await expect(page.locator('#screen-description')).toContainText('Irena Wolska');
  expect(await logicalRect(page, 'apply-stamp')).toEqual(before);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
});

test('documents shrink from the tray and both desktops, with aligned hit areas and cancellation', async ({ page }) => {
  await enterCabinet(page);
  await expect(page.locator('#control-cup, #control-pencil')).toHaveCount(0);
  await activate(page, 'call-patient');
  const tray = await logicalRect(page, 'take-document');
  await page.locator('#control-take-document').click();
  expect(await logicalRect(page, 'take-document')).toMatchObject({ w: 28, h: 66 });
  const firstTarget = await screenPoint(page, { x: 350, y: 220 });
  await page.mouse.move(firstTarget.x, firstTarget.y);
  expect(await logicalRect(page, 'take-document')).toMatchObject({ w: 28, h: 66 });
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'take-document')).toEqual(tray);
  await carryTo(page, 'take-document', { x: 350, y: 220 });
  expect(await logicalRect(page, 'paper-1')).toMatchObject({ w: 188, h: 144 });
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  await activate(page, 'take-certificate');
  expect(await logicalRect(page, 'apply-stamp')).toMatchObject({ w: 188, h: 144 });
  const rightDesk = await logicalRect(page, 'apply-stamp');
  await page.locator('#control-apply-stamp').click();
  expect(await logicalRect(page, 'apply-stamp')).toMatchObject({ w: 48, h: 64 });
  const patientTarget = await screenPoint(page, center(PATIENT_HANDOFF));
  await page.mouse.move(patientTarget.x, patientTarget.y);
  expect(await logicalRect(page, 'apply-stamp')).toEqual({ x: 61, y: 48, w: 48, h: 64 });
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'apply-stamp')).toEqual(rightDesk);
  await carryTo(page, 'apply-stamp', { x: 110, y: 205 });
  expect(await logicalRect(page, 'apply-stamp')).toMatchObject({ w: 60, h: 80 });
  await page.locator('#control-apply-stamp').click();
  const target = await screenPoint(page, { x: 358, y: 227 });
  await page.mouse.move(target.x, target.y);
  const held = await logicalRect(page, 'apply-stamp');
  expect(held).toEqual({ x: 334, y: 195, w: 48, h: 64 });
  const actual = (await page.locator('#control-apply-stamp').boundingBox())!;
  const expected = await screenPoint(page, held);
  expect(actual.x).toBeCloseTo(expected.x, 3);
  expect(actual.y).toBeCloseTo(expected.y, 3);
  await page.mouse.click(target.x, target.y);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  expect(await logicalRect(page, 'apply-stamp')).toEqual({ x: 264, y: 155, w: 188, h: 144 });
  expect(await page.evaluate(point => document.elementFromPoint(point.x, point.y)?.id, target)).toBe('control-apply-stamp');
  await carryTo(page, 'apply-stamp', { x: 110, y: 205 });
  const shelf = await logicalRect(page, 'apply-stamp');
  await page.locator('#control-apply-stamp').focus();
  await page.keyboard.press('Space');
  const lifted = await logicalRect(page, 'apply-stamp');
  expect(lifted).toMatchObject({ w: 48, h: 64 });
  for (let step = 0; step < 20; step++) await page.keyboard.press('Shift+ArrowRight');
  expect(await logicalRect(page, 'apply-stamp')).toEqual({ ...lifted, x: lifted.x + 240 });
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'apply-stamp')).toEqual(shelf);
});

test('the rulebook keeps its cover on placement and its physical corners open and turn all five spreads', async ({ page }) => {
  await enterCabinet(page);
  const shelfBook = await logicalRect(page, 'manual');
  expect(shelfBook).toMatchObject({ w: 88, h: 48 });
  await expect(page.locator('#control-manual-next, #control-manual-prev')).toHaveCount(0);
  // The shelf book's lower-right corner picks up the book like the rest of its cover.
  await clickAt(page, { x: shelfBook.x + shelfBook.w - 12, y: shelfBook.y + shelfBook.h - 12 });
  await expect(page.locator('#control-manual')).toHaveAttribute('data-held', 'true');
  await expect(page.locator('#control-manual-next, #control-manual-prev')).toHaveCount(0);
  expect(await logicalRect(page, 'manual')).toMatchObject({ w: 64, h: 36 });
  await clickAt(page, { x: 350, y: 228 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  const cover = await logicalRect(page, 'manual');
  expect(cover).toMatchObject({ w: 138, h: 164 });
  await page.locator('#control-manual').focus();
  await page.keyboard.press('Space');
  expect(await logicalRect(page, 'manual')).toMatchObject({ w: 64, h: 36 });
  await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'manual')).toEqual(cover);
  const openingCorner = await logicalRect(page, 'manual-next');
  expect(openingCorner.x).toBeGreaterThan(cover.x + cover.w / 2);
  expect(openingCorner.y).toBeGreaterThan(cover.y + cover.h / 3);
  expect(openingCorner.x + openingCorner.w).toBeLessThanOrEqual(cover.x + cover.w);
  expect(openingCorner.y + openingCorner.h).toBeLessThanOrEqual(cover.y + cover.h);
  await expect(page.locator('#control-manual-next')).toHaveAccessibleName('Otwórz okładkę regulaminu');
  await page.locator('#control-manual-next').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  expect(await logicalRect(page, 'manual')).toMatchObject({ w: 276, h: 164 });
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', '0');
  await expect(page.locator('#screen-description')).toContainText('Przyjęcie');
  const book = await logicalRect(page, 'manual');
  await page.locator('#control-manual').focus();
  await page.keyboard.press('Space');
  expect(await logicalRect(page, 'manual')).toMatchObject({ w: 64, h: 36 });
  await expect(page.locator('#control-manual-next, #control-manual-prev')).toHaveCount(0);
  await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'manual')).toEqual(book);
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  for (let pageIndex = 1; pageIndex < 5; pageIndex++) {
    const next = await logicalRect(page, 'manual-next');
    expect(next.x).toBeGreaterThan(book.x + book.w / 2);
    expect(next.y).toBeGreaterThan(book.y + book.h / 2);
    await page.locator('#control-manual-next').click();
    await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', String(pageIndex));
    expect(await logicalRect(page, 'manual')).toEqual(book);
    await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  }
  await expect(page.locator('#screen-description')).toContainText('Czas');
  await activate(page, 'manual-prev');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', '3');
  await expect(page.locator('#screen-description')).toContainText('Dokumentacja');
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  await expect(page.locator('#control-manual')).toBeFocused();
  await activate(page, 'manual');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await carryTo(page, 'manual', center(shelfBook));
  expect(await logicalRect(page, 'manual')).toMatchObject({ w: 88, h: 48 });
  await expect(page.locator('#control-manual-next, #control-manual-prev')).toHaveCount(0);
});

test('keyboard pickup moves documents and Escape restores the previous position', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  const before = await logicalRect(page, 'apply-stamp');
  await page.locator('#control-apply-stamp').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Enter');
  const moved = { ...before, x: before.x - 4, y: before.y + 12 };
  expect(await logicalRect(page, 'apply-stamp')).toEqual(moved);
  await expect(page.locator('#control-apply-stamp')).toBeFocused();
  await page.keyboard.press('Space');
  const lifted = await logicalRect(page, 'apply-stamp');
  expect(lifted).toMatchObject({ w: 48, h: 64 });
  await page.keyboard.press('Shift+ArrowLeft');
  expect((await logicalRect(page, 'apply-stamp')).x).toBe(lifted.x - 12);
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'apply-stamp')).toEqual(moved);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#control-apply-stamp')).toBeFocused();
});

test('a keyboard-carried stamp can be used and returned through its semantic holder', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  const home = await logicalRect(page, 'stamp-fit');
  await page.locator('#control-stamp-fit').focus();
  await page.keyboard.press('Space');
  for (let step = 0; step < 16; step++) await page.keyboard.press('Shift+ArrowLeft');
  await page.keyboard.press('Enter');
  await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');
  await activate(page, 'put-away-fit');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  expect(await logicalRect(page, 'stamp-fit')).toEqual(home);
});

test('leaving the stage cancels carrying, and an open book can be carried back to the left shelf', async ({ page }) => {
  await enterCabinet(page);
  const home = await logicalRect(page, 'manual');
  await page.locator('#control-manual').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Shift+ArrowLeft');
  await page.locator('#control-language-pl').click();
  expect(await logicalRect(page, 'manual')).toEqual(home);
  await expect(page.locator('#control-manual')).not.toHaveAttribute('data-held', 'true');
  await activate(page, 'manual');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  await carryTo(page, 'manual', { x: 130, y: 245 });
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  const shelved = await logicalRect(page, 'manual');
  expect(shelved).toMatchObject({ w: 88, h: 48 });
  expect(shelved.x).toBeLessThan(204);
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'break-room');
  await expect(page.locator('#control-start')).toHaveAccessibleName('WRÓĆ DO DYŻURU');
  await page.locator('#control-start').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  expect(await logicalRect(page, 'manual')).toEqual(shelved);
});

test('touch taps place the closed rulebook then open its cover corner with fractional mobile scaling', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterCabinet(page);
  const start = await screenPoint(page, center(await logicalRect(page, 'manual')));
  const target = await screenPoint(page, { x: 350, y: 228 });
  const client = await context.newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('#control-manual')).toHaveAttribute('data-held', 'true');
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...target, id: 2 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const after = await logicalRect(page, 'manual');
  expect(after).toMatchObject({ w: 138, h: 164 });
  expect(Number.isInteger(after.x) && Number.isInteger(after.y)).toBe(true);
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  const corner = await screenPoint(page, center(await logicalRect(page, 'manual-next')));
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...corner, id: 3 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  expect(await logicalRect(page, 'manual')).toMatchObject({ w: 276, h: 164 });
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('clock hands animate short action costs and pointer movement consumes no additional time', async ({ page }) => {
  await enterCabinet(page);
  const controls = page.locator('#controls');
  expect(await clockMinutes(page)).toBe(477);
  await activate(page, 'call-patient');
  expect(await clockMinutes(page)).toBe(480);
  await expect(controls).toHaveAttribute('data-clock-moving', 'true');
  await expect.poll(async () => Number(await controls.getAttribute('data-clock-display'))).toBeGreaterThan(477);
  await expect(controls).toHaveAttribute('data-clock-moving', 'false');
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  expect(await clockMinutes(page)).toBe(484);
  await activate(page, 'run-vision');
  expect(await clockMinutes(page)).toBe(487);
  await activate(page, 'run-vision');
  expect(await clockMinutes(page)).toBe(490);
  await page.locator('#control-stamp-fit').click();
  const pickedUp = await clockMinutes(page);
  expect(pickedUp).toBe(491);
  for (const position of [{ x: 470, y: 285 }, { x: 475, y: 270 }, { x: 490, y: 280 }]) {
    const target = await screenPoint(page, position);
    await page.mouse.move(target.x, target.y);
    expect(await clockMinutes(page)).toBe(pickedUp);
  }
  await page.keyboard.press('Escape');
  await activate(page, 'manual');
  expect(await clockMinutes(page)).toBe(pickedUp + 1);
  await activate(page, 'manual-next');
  expect(await clockMinutes(page)).toBe(pickedUp + 2);
});

test('reduced motion skips patient and clock transitions while preserving the complete visit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-moving', 'false');
  for (const id of ['take-document', 'take-certificate', 'run-vision', 'run-pressure', 'run-measurements', 'stamp-fit', 'apply-stamp', 'return-document']) {
    await activate(page, id);
  }
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#controls')).toHaveAttribute('data-clock-moving', 'false');
  await expect(page.locator('#screen-description')).toContainText('Decyzja zgodna z regulaminem. +10 punktów.');
});

test('rulebook page boundaries keep keyboard focus on a page control', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'manual');
  for (let pageIndex = 1; pageIndex < 5; pageIndex++) {
    await activate(page, 'manual-next');
    await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', String(pageIndex));
  }
  await expect(page.locator('#control-manual-next')).toHaveCount(0);
  await expect(page.locator('#control-manual-prev')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', '3');
  for (let pageIndex = 2; pageIndex >= 0; pageIndex--) {
    await activate(page, 'manual-prev');
    await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', String(pageIndex));
  }
  await expect(page.locator('#control-manual-prev')).toHaveAccessibleName('Zamknij regulamin');
  await expect(page.locator('#control-manual-prev')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
  await expect(page.locator('#control-manual-prev')).toHaveCount(0);
  await expect(page.locator('#control-manual-next')).toBeFocused();
  await expect(page.locator('#control-manual-next')).toHaveAccessibleName('Otwórz okładkę regulaminu');
  await page.keyboard.press('Enter');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', '0');
  await expect(page.locator('#control-take-document')).toHaveCount(0);
  await expect(page.locator('#screen-description')).toContainText('NA RAZIE CISZA.');
});

test('a covering rulebook shields the document from a carried stamp when open or closed', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  await activate(page, 'manual');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'true');
  const stampHome = await logicalRect(page, 'stamp-fit');
  await page.locator('#control-stamp-fit').click();
  await clickAt(page, { x: 352, y: 227 });
  await expect(page.locator('#screen-description')).toContainText('Tu nie ma dokumentu do podbicia.');
  await expect(page.locator('#screen-description')).toContainText('PODBIJ TUTAJ');
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');
  await clickAt(page, center(stampHome));
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');

  // The closed cover still overlaps the upper-left part of the certificate.
  const book = await logicalRect(page, 'manual');
  const paper = await logicalRect(page, 'apply-stamp');
  const covered = { x: Math.max(book.x, paper.x) + 10, y: Math.max(book.y, paper.y) + 10 };
  expect(covered.x).toBeLessThan(Math.min(book.x + book.w, paper.x + paper.w));
  expect(covered.y).toBeLessThan(Math.min(book.y + book.h, paper.y + paper.h));
  await page.locator('#control-stamp-fit').click();
  await clickAt(page, covered);
  await expect(page.locator('#screen-description')).toContainText('Tu nie ma dokumentu do podbicia.');
  await expect(page.locator('#screen-description')).toContainText('PODBIJ TUTAJ');
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');

  // The exposed paper remains usable without putting the held stamp down.
  await clickAt(page, { x: paper.x + paper.w - 10, y: paper.y + 90 });
  await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
  await expect(page.locator('#control-stamp-fit')).toHaveAttribute('data-held', 'true');
});
