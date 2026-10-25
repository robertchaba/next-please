import { expect, type Page } from '@playwright/test';
import { applyAction, createInitialState, type GameState } from '../../src/core/game';
import { PATIENTS } from '../../src/core/patients';
import { encodeSave } from '../../src/core/save';

/** Explicit fixture for tests whose assertions depend on the original patients. */
export function knownQueueState(): GameState {
  const initial = createInitialState(1234);
  return {
    ...applyAction(initial, 'skip-intro').state,
    roster: [0, 1, 2, ...initial.roster.filter(id => PATIENTS[id]!.characterId >= 3)],
    rngState: 1000,
  };
}

/** Exercise the public validated import path; production new games stay random. */
export async function loadKnownQueue(page: Page): Promise<void> {
  await page.locator('#control-saves').click();
  await page.locator('#save-input').setInputFiles({
    name: 'known-patients.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(knownQueueState())),
  });
  await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
  await page.locator('#control-back').click();
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'cabinet');
}
