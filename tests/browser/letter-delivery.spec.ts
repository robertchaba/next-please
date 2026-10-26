import { expect, test, type Page } from '@playwright/test';
import { applyAction, type GameAction, type GameState } from '../../src/core/game';
import { encodeSave } from '../../src/core/save';
import { knownQueueState } from './fixtures';

const act = (page: Page, id: string) => page.locator(`#control-${id}`).evaluate(element => (element as HTMLButtonElement).click());

async function load(page: Page, state: GameState): Promise<void> {
  await page.clock.install();
  await page.goto('/');
  await act(page, 'start');
  for (let step = 0; step < 4; step++) await act(page, 'intro-next');
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await act(page, 'saves');
  await page.locator('#save-input').setInputFiles({ name: 'delivery.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
  await expect(page.locator('#announcement')).toContainText('Zapis wczytany');
  await act(page, 'back');
}

for (const finish of ['cancel', 'store-manual', 'return-referral'] as const) test(`delivering a letter while carrying preserves it after ${finish}`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const state = (['call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit'] as GameAction[])
    .reduce((state, action) => applyAction(state, action).state, knownQueueState());
  const letterId = applyAction(state, 'return-document').state.papers.find(paper => paper.kind === 'letter')!.id;
  await load(page, state);
  await act(page, 'return-document');
  if (finish === 'return-referral') await act(page, 'call-patient');
  const carried = finish === 'return-referral' ? 'take-document' : 'manual';
  await page.locator(`#control-${carried}`).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  await page.clock.runFor(2100);
  await expect(page.locator(`#control-paper-${letterId}`)).toBeVisible();
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'true');
  if (finish === 'cancel') await page.keyboard.press('Escape');
  else if (finish === 'store-manual') {
    await page.locator('#control-drawer').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#control-manual')).toHaveCount(0);
  } else {
    const stage = (await page.locator('#stage').boundingBox())!;
    await page.mouse.click(stage.x + 30 * stage.width / 570, stage.y + 220 * stage.height / 320);
    await expect(page.locator('#control-take-document')).toBeVisible();
  }
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
  await expect(page.locator(`#control-paper-${letterId}`)).toHaveAccessibleName(/koperta/i);
  await act(page, `paper-${letterId}`);
  await expect(page.locator(`#control-paper-${letterId}`)).toHaveAccessibleName(/Pismo w sprawie orzeczenia/);
  expect(errors).toEqual([]);
});

test('reaching 17:15 in an empty cabinet drawer opens the settled day', async ({ page }) => {
  const stored = applyAction(knownQueueState(), { type: 'store-drawer-item', item: 'manual' }).state;
  await load(page, { ...stored, clockMinutes: 1034 });
  await act(page, 'drawer');
  await act(page, 'drawer-manual');
  await expect(page.locator('#controls')).toHaveAttribute('data-screen', 'home');
  await expect(page.locator('#control-home-next')).toBeFocused();
  await expect(page.locator('#stage')).toHaveAttribute('data-carrying', 'false');
});
