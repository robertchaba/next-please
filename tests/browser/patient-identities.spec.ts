import { expect, test } from '@playwright/test';
import { applyAction, createInitialState, type GameAction } from '../../src/core/game';
import { PATIENTS, PATIENT_IDENTITIES, CURATED_CASE_START, CASES_PER_IDENTITY, patientAge } from '../../src/core/patients';
import { gameDate } from '../../src/core/calendar';
import { encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';

test('five identities share a portrait while names, occupations and ages survive import and language changes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#control-start').click();
  for (let index = 0; index < 4; index++) await page.locator('#control-intro-next').click();
  await expect(page.locator('#stage')).toHaveAttribute('data-art-ready', 'true');

  // Academic, workshop and female professional portraits exercise distinct roles.
  for (const portraitId of ['patient-72', 'patient-74', 'patient-13']) {
    const portraits = new Set<string>();
    const names = new Set<string>();
    for (const identity of PATIENT_IDENTITIES.filter(identity => identity.portraitId === portraitId)) {
      const patient = PATIENTS[CURATED_CASE_START + identity.id * CASES_PER_IDENTITY]!;
      const initial = createInitialState(identity.id);
      initial.roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== identity.characterId)];
      const actions: GameAction[] = ['skip-intro', 'call-patient', 'take-document', 'take-paper', 'take-certificate', 'write-certificate'];
      const state = actions.reduce((current, action) => applyAction(current, action).state, initial);
      await page.locator('#control-saves').click();
      await page.locator('#save-input').setInputFiles({ name: 'identity.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
      await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
      await page.locator('#control-back').click();
      for (const locale of ['pl', 'en'] as const) {
        await page.locator(`#control-language-${locale}`).click();
        const t = translations[locale];
        await expect(page.locator('#screen-description')).toContainText(t.patientNames[patient.id]!);
        await expect(page.locator('#control-paper-1')).toHaveAccessibleName(new RegExp(t.patientJobs[patient.id]!));
        await expect(page.locator('#control-paper-1')).toHaveAccessibleName(new RegExp(patient.birthDate));
        await expect(page.locator('#control-paper-2')).toHaveAccessibleName(new RegExp(`${t.paperwork.age}: ${patientAge(patient, gameDate(1))}`));
      }
      names.add(translations.pl.patientNames[patient.id]!);
      portraits.add(await page.locator('#game').evaluate(async canvas => {
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        return Array.from((canvas as HTMLCanvasElement).getContext('2d')!.getImageData(38, 32, 94, 96).data).join(',');
      }));
    }
    expect(names.size).toBe(5);
    expect(portraits.size).toBe(1);
  }
  expect(errors).toEqual([]);
});
