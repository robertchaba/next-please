import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { DISCRETIONARY_CASE_START, PATIENTS } from '../../src/core/patients';
import { decodeSave, encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';
import { act, attachReport, discretionaryAppointment, receiveDiscretionary, sendDiscretionary } from '../fixtures/discretionary';

async function key(page: Page, id: string, value = 'Enter') {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press(value);
}

for (const locale of ['pl', 'en'] as const) test(`equivocal reports, notes and rulebook remain readable and either ruling is accepted in ${locale}`, async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/');
  await key(page, 'start');
  for (let step = 0; step < 4; step++) await key(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await key(page, `language-${locale}`);
  const t = translations[locale];
  const patient = PATIENTS.slice(DISCRETIONARY_CASE_START).find(patient => patient.jobId === 45 && patient.caseVariant === 4)!;
  const state = act(receiveDiscretionary(sendDiscretionary(discretionaryAppointment(patient.id, 9))),
    'take-certificate', 'write-certificate', 'run-vision', 'run-pressure', 'run-measurements');
  const report = state.papers.find(paper => paper.kind === 'additional-result')!;
  const note = state.papers.find(paper => paper.kind === 'note')!;
  for (const decision of ['fit', 'unfit'] as const) {
    const ready = act(decision === 'fit' ? attachReport(state) : state, `stamp-${decision}`);
    await key(page, 'saves');
    await page.locator('#save-input').setInputFiles({ name: 'judgement.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(ready)) });
    await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
    await key(page, 'back');
    await expect(page.locator(`#control-paper-${report.id}`)).toHaveAccessibleName(new RegExp(t.additionalTests.report.psychiatry.discretionary));
    await expect(page.locator(`#control-paper-${note.id}`)).toHaveAccessibleName(new RegExp(t.additionalTests.notes.psychiatry.discretionary));
    if (decision === 'unfit') {
      await key(page, `paper-${report.id}`, 'Space');
      const bounds = (await page.locator('#stage').boundingBox())!;
      await page.mouse.click(bounds.x + 385 * bounds.width / 570, bounds.y + 210 * bounds.height / 320);
      await page.locator('#stage').screenshot({ path: info.outputPath(`equivocal-report-${locale}.png`) });
      await key(page, 'manual');
      for (let spread = 0; spread <= 15; spread++) {
        if (spread) await key(page, 'manual-next');
        if ([2, 3, 15].includes(spread)) await page.locator('#stage').screenshot({ path: info.outputPath(`judgement-manual-${spread}-${locale}.png`) });
        if (spread === 2) await expect(page.locator('#screen-description')).toContainText(t.manualPages[2].facingLines.join(' '));
        if (spread === 3) await expect(page.locator('#screen-description')).toContainText(t.manualPages[3].lines.join(' '));
        if (spread === 15) await expect(page.locator('#screen-description')).toContainText(t.manualSupplements.additionalTests.pages[1].lines.join(' '));
      }
      await page.keyboard.press('Escape');
    }
    await key(page, decision === 'fit' ? `paper-${report.id}` : 'apply-stamp', 'Space');
    await key(page, 'return-document');
    await page.clock.runFor(2100);
    await key(page, 'saves');
    const download = page.waitForEvent('download');
    await key(page, 'export');
    const path = info.outputPath(`judgement-${decision}.npsave`);
    await (await download).saveAs(path);
    const completed = decodeSave(await readFile(path));
    expect(completed.visit).toBeNull();
    expect(completed.daily).toEqual(state.daily);
    expect(completed.insuranceRate).toBe(state.insuranceRate);
    expect(completed.papers.some(paper => paper.kind === 'letter')).toBe(false);
    await key(page, 'back');
  }
  expect(errors).toEqual([]);
});
