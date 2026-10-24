import { expect, test, type Page } from '@playwright/test';
import { CABINET_HOTSPOTS, DOCUMENT_RACK_SLOTS } from '../../src/core/desk';

async function clickPoint(page: Page, x: number, y: number): Promise<void> {
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + x * stage.width / 570, stage.y + y * stage.height / 320);
}
async function bounds(page: Page, id: string) {
  return page.locator(`#control-${id}`).evaluate(element => ({
    x: parseInt(element.style.left), y: parseInt(element.style.top),
    w: parseInt(element.style.width), h: parseInt(element.style.height),
  }));
}
async function enter(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let i = 0; i < 4; i++) await page.locator('#control-intro-next').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
}

test('generated workstation assets align with two active rack slots and two future slots', async ({ page }, testInfo) => {
  const assets: string[] = [];
  const errors: string[] = [];
  page.on('response', response => {
    if (/sprites\/workstation-.*\.png$/.test(response.url()) && response.ok()) assets.push(response.url().split('/').at(-1)!);
  });
  page.on('pageerror', error => errors.push(error.message));
  await enter(page);
  expect(new Set(assets)).toEqual(new Set(['workstation-phone.png', 'workstation-clips.png',
    'workstation-clip.png', 'workstation-rack.png', 'workstation-paper.png']));
  expect(await bounds(page, 'use-phone')).toEqual(CABINET_HOTSPOTS.phone);
  expect(CABINET_HOTSPOTS.phone.x).toBeGreaterThanOrEqual(210);
  expect(CABINET_HOTSPOTS.phone.y).toBeLessThan(128);
  expect(await bounds(page, 'take-clip')).toEqual(CABINET_HOTSPOTS.clipSupply);
  expect(await bounds(page, 'take-paper')).toEqual(DOCUMENT_RACK_SLOTS[0]);
  expect(await bounds(page, 'take-certificate')).toEqual(DOCUMENT_RACK_SLOTS[1]);
  for (const id of ['reserved-form-3', 'reserved-form-4']) await expect(page.locator(`#control-${id}`)).toBeDisabled();
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('generated-workstation.png') });
  await page.locator('#control-language-en').click();
  await expect(page.locator('#control-take-certificate')).toHaveAccessibleName('Take a certificate form from the document rack');
  expect(errors).toEqual([]);
});

test('referral comes from the left and individual forms come from their rack slots', async ({ page }, testInfo) => {
  await enter(page);
  await page.locator('#control-call-patient').click();
  await page.locator('#control-take-document').click();
  await expect(page.locator('#control-take-document')).toHaveAttribute('data-held', 'true');
  await expect(page.locator('#control-apply-stamp')).toHaveCount(0);
  await clickPoint(page, 340, 220);
  await expect(page.locator('#control-paper-1')).toBeAttached();
  await expect(page.locator('#control-take-document, #control-apply-stamp')).toHaveCount(0);
  const referral = await bounds(page, 'paper-1');
  expect(referral.x).toBeGreaterThanOrEqual(210);
  await page.locator('#control-take-certificate').click();
  await expect(page.locator('#control-apply-stamp')).toHaveAttribute('data-held', 'true');
  const certificate = await bounds(page, 'apply-stamp');
  expect(certificate).toMatchObject({ w: 48, h: 64 });
  expect(certificate.x + certificate.w / 2).toBe(CABINET_HOTSPOTS.certificateSupply.x + CABINET_HOTSPOTS.certificateSupply.w / 2);
  expect(certificate.y + certificate.h / 2).toBe(CABINET_HOTSPOTS.certificateSupply.y + CABINET_HOTSPOTS.certificateSupply.h / 2);
  expect(await bounds(page, 'paper-1')).toEqual(referral);
  await clickPoint(page, 400, 220);
  expect((await bounds(page, 'apply-stamp')).x).toBeGreaterThanOrEqual(210);
  expect(await bounds(page, 'paper-1')).toEqual(referral);
  await page.locator('#control-take-paper').click();
  await expect(page.locator('#control-paper-2')).toHaveAttribute('data-held', 'true');
  const blank = await bounds(page, 'paper-2');
  expect(blank).toMatchObject({ w: 48, h: 64 });
  expect(blank.x + blank.w / 2).toBe(CABINET_HOTSPOTS.paperSupply.x + CABINET_HOTSPOTS.paperSupply.w / 2);
  expect(blank.y + blank.h / 2).toBe(CABINET_HOTSPOTS.paperSupply.y + CABINET_HOTSPOTS.paperSupply.h / 2);
  await clickPoint(page, 350, 225);
  expect((await bounds(page, 'paper-2')).x).toBeGreaterThanOrEqual(210);
  await page.locator('#control-language-pl').focus();
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('separate-paperwork.png') });
});
