import { expect, test, type Page } from '@playwright/test';

type Point = { x: number; y: number };
type Rect = Point & { w: number; h: number };

async function activate(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
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

async function screenPoint(page: Page, point: Point): Promise<Point> {
  const canvas = (await page.locator('#game').boundingBox())!;
  return { x: canvas.x + point.x * canvas.width / 570, y: canvas.y + point.y * canvas.height / 320 };
}

async function dragTo(page: Page, id: string, destination: Point): Promise<void> {
  const box = (await page.locator(`#control-${id}`).boundingBox())!;
  const target = await screenPoint(page, destination);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 8 });
  await page.mouse.up();
}

test('dragging paperwork and stamps follows the examination and submission rules', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'enter');
  await expect.poll(() => page.locator('#controls').getAttribute('data-patient-frame')).not.toBe('0');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');

  await dragTo(page, 'take-document', { x: 180, y: 220 });
  await expect(page.locator('#control-take-document')).toHaveCount(0);
  const paper = await logicalRect(page, 'apply-stamp');
  expect(paper.w).toBe(188); expect(paper.h).toBe(144);
  const stampTarget = { x: paper.x + 100, y: paper.y + 90 };
  await dragTo(page, 'stamp-fit', stampTarget);
  await expect(page.locator('#screen-description')).toContainText('Najpierw wykonaj oba badania.');
  await activate(page, 'return-document');
  await expect(page.locator('#control-apply-stamp')).toBeAttached();
  await expect(page.locator('#screen-description')).toContainText('Dokument potrzebuje pieczątki.');

  await dragTo(page, 'stamp-fit', { x: 350, y: 250 });
  await activate(page, 'run-vision');
  await expect(page.locator('#screen-description')).toContainText('Wzrok: NORMA.');
  await activate(page, 'run-pressure');
  await expect(page.locator('#screen-description')).toContainText('Ciśnienie: NORMA.');
  // Moving a stamp to bare wood must not issue a medical decision.
  await dragTo(page, 'stamp-fit', { x: 370, y: 250 });
  await activate(page, 'return-document');
  await expect(page.locator('#control-apply-stamp')).toBeAttached();
  await expect(page.locator('#screen-description')).toContainText('Dokument potrzebuje pieczątki.');
  await dragTo(page, 'stamp-fit', stampTarget);
  await expect(page.locator('#screen-description')).toContainText('Podbito: ZDOLNY.');
  // Clear the stamp from the document so its center is available to grab.
  await dragTo(page, 'stamp-fit', { x: 350, y: 250 });
  await dragTo(page, 'apply-stamp', { x: 114, y: 252 });
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  await expect(page.locator('#screen-description')).toContainText('Decyzja zgodna z regulaminem. +10 punktów.');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'exit');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
});

test('all loose objects move with their semantic hit areas without activating on drop', async ({ page }) => {
  await enterCabinet(page);
  for (const id of ['cup', 'pencil', 'manual', 'stamp-fit', 'stamp-unfit']) {
    const before = await logicalRect(page, id);
    const destination = { x: 160, y: 230 };
    await dragTo(page, id, destination);
    const moved = await logicalRect(page, id);
    expect(moved.x).toBe(Math.round(destination.x - before.w / 2));
    expect(moved.y).toBe(Math.round(destination.y - before.h / 2));
    const actual = (await page.locator(`#control-${id}`).boundingBox())!;
    const expected = await screenPoint(page, moved);
    expect(actual.x).toBeCloseTo(expected.x, 3);
    expect(actual.y).toBeCloseTo(expected.y, 3);
    const target = await screenPoint(page, destination);
    expect(await page.evaluate(point => document.elementFromPoint(point.x, point.y)?.id, target)).toBe(`control-${id}`);
    await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await dragTo(page, id, { x: before.x + before.w / 2, y: before.y + before.h / 2 });
  }
  await expect(page.locator('.surround-top')).toHaveCount(0);
});

test('keyboard pickup moves objects, Escape restores them, and Enter retains normal activation', async ({ page }) => {
  await enterCabinet(page);
  const before = await logicalRect(page, 'cup');
  await page.locator('#control-cup').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Shift+ArrowDown');
  await page.keyboard.press('Enter');
  expect(await logicalRect(page, 'cup')).toEqual({ ...before, x: before.x - 4, y: before.y + 12 });
  await expect(page.locator('#control-cup')).toBeFocused();

  const pencil = await logicalRect(page, 'pencil');
  await page.locator('#control-pencil').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Shift+ArrowLeft');
  expect((await logicalRect(page, 'pencil')).x).toBe(pencil.x - 12);
  await page.keyboard.press('Escape');
  expect(await logicalRect(page, 'pencil')).toEqual(pencil);
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#control-pencil')).toBeFocused();

  await page.locator('#control-manual').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Space');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toContainText('INSTRUKCJA OBSŁUGI DYŻURU');
  await page.keyboard.press('Escape');
  await expect(page.locator('#control-manual')).toBeFocused();
});

test('leaving the stage cancels a carried object and the shift can resume after Escape', async ({ page }) => {
  await enterCabinet(page);
  const manual = await logicalRect(page, 'manual');
  await page.locator('#control-manual').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Shift+ArrowLeft');
  expect((await logicalRect(page, 'manual')).x).toBe(manual.x - 12);
  await page.locator('#control-sound').click();
  expect(await logicalRect(page, 'manual')).toEqual(manual);
  await expect(page.locator('#control-manual')).not.toHaveAttribute('data-held', 'true');
  await expect(page.locator('#control-sound')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'welcome');
  await expect(page.locator('#control-start')).toHaveAccessibleName('WRÓĆ DO DYŻURU');
  await page.locator('#control-start').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  expect(await logicalRect(page, 'manual')).toEqual(manual);
  await activate(page, 'manual');
  await expect(page.getByRole('dialog')).toContainText('INSTRUKCJA OBSŁUGI DYŻURU');
});

test('touch dragging works with fractional mobile scaling', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterCabinet(page);
  const before = await logicalRect(page, 'cup');
  const box = (await page.locator('#control-cup').boundingBox())!;
  const target = await screenPoint(page, { x: 455, y: 230 });
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const client = await context.newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...start, id: 1 }] });
  for (let step = 1; step <= 6; step++) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove', touchPoints: [{
        x: start.x + (target.x - start.x) * step / 6,
        y: start.y + (target.y - start.y) * step / 6, id: 1,
      }],
    });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await client.detach();
  const after = await logicalRect(page, 'cup');
  expect(after).toEqual({ ...before, x: 438, y: 211 });
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('reduced motion skips entry and departure frames while preserving the complete visit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  for (const id of ['take-document', 'run-vision', 'run-pressure', 'stamp-fit', 'apply-stamp', 'return-document']) {
    await activate(page, id);
  }
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#screen-description')).toContainText('Decyzja zgodna z regulaminem. +10 punktów.');
});
