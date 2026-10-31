import { createInitialState } from '../fixtures/routine';
import { defaultReferral } from '../../src/core/progression';
import { expect, test, type Page } from '@playwright/test';
import { encodeSave } from '../../src/core/save';

async function activate(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

test('calendar starts on the agreed date, follows the saved day and preserves older document dates', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await activate(page, 'start');
  for (let step = 0; step < 4; step++) await activate(page, 'intro-next');
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  await expect(page.locator('#screen-description')).toContainText('Datownik na biurku: 3 listopada.');
  await activate(page, 'language-en');
  await expect(page.locator('#screen-description')).toContainText('Desk calendar: 3 November.');
  await activate(page, 'language-pl');

  await activate(page, 'saves');
  const state = { ...createInitialState(), phase: 'cabinet' as const, introStep: 3, day: 28,
    patientsProcessed: 3, shiftCompleted: 3, clockMinutes: 840, nextPaperId: 2,
    papers: [{ id: 1, kind: 'referral' as const, patientId: 0, day: 1, details: defaultReferral(1, 0), location: 'desk' as const }],
  };
  await page.locator('#save-input').setInputFiles({ name: 'calendar.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await activate(page, 'back');
  await expect(page.locator('#screen-description')).toContainText('Datownik na biurku: 30 listopada.');
  await activate(page, 'end-day');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'home');
  await activate(page, 'home-next');
  await activate(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-home-kind', 'work');
  await activate(page, 'home-next');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
  await expect(page.locator('#screen-description')).toContainText('Datownik na biurku: 1 grudnia.');
  await expect(page.locator('#control-paper-1')).toHaveAccessibleName(/Wystawiono: 03\.11\.1983/);
  await activate(page, 'language-en');
  await expect(page.locator('#screen-description')).toContainText('Desk calendar: 1 December.');
  await expect(page.locator('#control-paper-1')).toHaveAccessibleName(/Issued: 03\/11\/1983/);
  await page.locator('#stage').screenshot({ path: testInfo.outputPath('calendar-december-en.png') });
  expect(errors).toEqual([]);
});
