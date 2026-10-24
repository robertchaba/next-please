import { expect, test, type Page } from '@playwright/test';

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
  await page.clock.install();
  await page.goto('/');
  await activate(page, 'start');
  for (let step = 0; step < 4; step++) await activate(page, 'intro-next');
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}

const portraitPixels = (page: Page) => page.locator('#game').evaluate(canvas =>
  Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(0, 0, 110, 128).data));

test('the left desk bell calls a patient who emerges and sits within 720 ms without spending simulated time', async ({ page }) => {
  await enterCabinet(page);
  const empty = await portraitPixels(page);
  const bell = page.locator('#control-call-patient');
  const bellPosition = await bell.evaluate(element => ({ x: parseInt(element.style.left), y: parseInt(element.style.top) }));
  expect(bellPosition.x).toBeLessThan(204);
  expect(bellPosition.y).toBeGreaterThan(138);
  await bell.click();
  const minutes = await page.locator('#controls').getAttribute('data-clock-minutes');
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await page.clock.runFor(120);
  const emerging = await portraitPixels(page);
  await page.clock.runFor(300);
  const standing = await portraitPixels(page);
  const changed = (pixels: number[]) => pixels.filter((value, i) => i % 4 !== 3 && value !== empty[i]).length;
  expect(changed(emerging)).toBeGreaterThan(3000);
  expect(changed(standing)).toBeGreaterThan(3000);
  await page.clock.runFor(300);
  const seated = await portraitPixels(page);
  const topChangedRow = (pixels: number[]) => Math.floor(pixels.findIndex((value, i) => i % 4 !== 3 && Math.abs(value - empty[i]) > 20) / (110 * 4));
  expect(topChangedRow(seated)).toBeGreaterThan(topChangedRow(standing) + 12);
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#patient-speech')).toHaveText('Irena Wolska: Dzień dobry.');

  // Refreshing controls must retain the live node and avoid repeated speech.
  await page.locator('#patient-speech').evaluate(element => element.setAttribute('data-retained', 'true'));
  await activate(page, 'lamp');
  await expect(page.locator('#patient-speech')).toHaveAttribute('data-retained', 'true');
  await activate(page, 'saves');
  await page.clock.runFor(4000);
  await activate(page, 'back');
  await expect(page.locator('#patient-speech')).toHaveText('Irena Wolska: Dzień dobry.');
  await activate(page, 'language-en');
  await expect(page.locator('#patient-speech')).toHaveText('Irena Wolska: Good morning.');
  await page.clock.runFor(2400);
  await expect(page.locator('#patient-speech')).toBeEmpty();
  expect(Number(await page.locator('#controls').getAttribute('data-clock-minutes'))).toBe(Number(minutes) + 1);
});

test('patients speak sparingly, hesitate at failed vision tests and leave refusals silently', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await page.clock.runFor(720);
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  await activate(page, 'run-vision');
  await expect(page.locator('#patient-speech')).toBeEmpty();
  for (const id of ['stamp-fit', 'apply-stamp', 'write-certificate', 'return-document']) await activate(page, id);
  await expect(page.locator('#patient-speech')).toHaveText('Irena Wolska: Dziękuję.');
  await page.clock.runFor(1200);
  await expect(page.locator('#patient-speech')).toHaveText('Irena Wolska: Dziękuję.');
  await page.clock.runFor(1500);
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await activate(page, 'call-patient');
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await activate(page, 'take-document');
  await activate(page, 'take-certificate');
  await activate(page, 'run-vision');
  await expect(page.locator('#patient-speech')).toHaveText('Leon Burek: Yyy...');
  await activate(page, 'run-vision');
  await expect(page.locator('#patient-speech')).toHaveText('Leon Burek: Rozmazane...');
  for (const id of ['stamp-unfit', 'apply-stamp', 'write-certificate', 'return-document']) await activate(page, id);
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await page.clock.runFor(1600);
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await activate(page, 'menu');
  await expect(page.locator('#patient-speech')).toBeEmpty();
});

test('calling again finishes the previous farewell and pauses the new entrance under a panel', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await page.clock.runFor(720);
  for (const id of ['take-document', 'take-certificate', 'stamp-fit', 'apply-stamp', 'write-certificate', 'return-document']) await activate(page, id);
  await expect(page.locator('#patient-speech')).toContainText('Dziękuję.');
  await activate(page, 'call-patient');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'enter');
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await page.clock.runFor(180);
  const frame = await page.locator('#controls').getAttribute('data-patient-frame');
  await activate(page, 'saves');
  await page.clock.runFor(2000);
  await activate(page, 'back');
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-frame', frame!);
  await page.clock.runFor(540);
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await expect(page.locator('#screen-description')).toContainText('Leon Burek');
});

test('a silent refusal starts the exit immediately, without a farewell pause', async ({ page }) => {
  await enterCabinet(page);
  await activate(page, 'call-patient');
  await page.clock.runFor(720);
  for (const id of ['take-document', 'take-certificate', 'stamp-unfit', 'apply-stamp', 'write-certificate', 'return-document']) await activate(page, id);
  await expect(page.locator('#patient-speech')).toBeEmpty();
  await page.clock.runFor(180);
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'exit');
  expect(Number(await page.locator('#controls').getAttribute('data-patient-frame'))).toBeGreaterThan(0);
  await page.clock.runFor(540);
  await expect(page.locator('#controls')).toHaveAttribute('data-patient-motion', 'idle');
  await expect(page.locator('#patient-speech')).toBeEmpty();
});
