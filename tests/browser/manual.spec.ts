import { createInitialState } from '../fixtures/routine';
import { expect, test, type Page } from '@playwright/test';
import { applyAction } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';

async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

function beginningOfDay(day: number) {
  let state = applyAction({ ...createInitialState(71), money: 10000 }, 'skip-intro').state;
  while (state.day < day && !state.ending) {
    if (state.phase === 'cabinet') state = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
    state = applyAction(state, 'next-day').state;
  }
  expect(state.day).toBe(day);
  return state;
}

for (const locale of ['pl', 'en'] as const) {
  test(`rulebook grows with working days and resets on earlier import in ${locale}`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await key(page, 'start');
    for (let step = 0; step < 4; step++) await key(page, 'intro-next');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await key(page, `language-${locale}`);
    const t = translations[locale];
    const editions = [
      [1, 9, t.manualBase], [2, 10, t.manualSupplements.inspection.label], [5, 11, t.manualSupplements.dates.label],
      [6, 12, t.manualSupplements.specialist.label], [7, 13, t.manualSupplements.authenticity.label],
      [8, 14, t.manualSupplements.payments.label], [9, 17, t.manualSupplements.additionalTests.label],
      [1, 9, t.manualBase],
    ] as const;
    for (const [day, count, label] of editions) {
      await key(page, 'saves');
      await page.locator('#save-input').setInputFiles({ name: 'manual.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(beginningOfDay(day))) });
      await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
      await key(page, 'back');
      await expect(page.locator('#controls')).toHaveAttribute('data-manual-open', 'false');
      await key(page, 'manual');
      for (let index = 0; index < count; index++) {
        if (index) await key(page, 'manual-next');
        await expect(page.locator('#controls')).toHaveAttribute('data-manual-page', String(index));
        await expect(page.locator('#screen-description')).toContainText(`${t.manualPageLabel} ${index + 1}/${count}.`);
      }
      await expect(page.locator('#control-manual-next')).toHaveCount(0);
      await expect(page.locator('#control-manual-prev')).toBeFocused();
      await expect(page.locator('#screen-description')).toContainText(label);
      if (day === 9) {
        await expect(page.locator('#screen-description')).toContainText(t.manualSupplements.additionalTests.pages[2].facingLines.join(' '));
      }
      await page.locator('#stage').screenshot({ path: info.outputPath(`manual-day-${day}-${locale}.png`) });
      // An open late-game annex must not survive importing an early edition.
    }
  });
}
