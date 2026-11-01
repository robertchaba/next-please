import { createInitialState } from '../fixtures/routine';
import { expect, test } from '@playwright/test';
import { applyAction, type GameAction } from '../../src/core/game';
import { PATIENTS } from '../../src/core/patients';
import { encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';

test('all 25 new patients load distinct portraits and retain their identities through the public save import', async ({ page }) => {
  test.setTimeout(60_000);
  const missingAssets: string[] = [];
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/assets/art/')) missingAssets.push(response.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let index = 0; index < 4; index++) await page.locator('#control-intro-next').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');
  const portraits = new Set<string>();
  for (let person = 0; person < 25; person++) {
    const patient = PATIENTS[328 + person * 9]!;
    const initial = createInitialState(person);
    initial.roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
    const actions: GameAction[] = ['skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general', 'run-measurements'];
    const state = actions.reduce((current, action) => applyAction(current, action).state, initial);
    await page.locator('#control-saves').click();
    await page.locator('#save-input').setInputFiles({
      name: `patient-${51 + person}.npsave`, mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)),
    });
    await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
    await page.locator('#control-back').click();
    for (const locale of ['pl', 'en'] as const) {
      await page.locator(`#control-language-${locale}`).click();
      await expect(page.locator('#screen-description')).toContainText(translations[locale].patientNames[patient.id]!);
    }
    await expect(page.locator('#control-run-general')).toBeVisible();
    // Wait for the restored scene to draw, then compare the actual patient area.
    const pixels = await page.locator('#game').evaluate(async canvas => {
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      return Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(38, 32, 94, 96).data).join(',');
    });
    portraits.add(pixels);
  }
  expect(portraits.size).toBe(25);
  expect(missingAssets).toEqual([]);
});
