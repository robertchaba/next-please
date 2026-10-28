import { expect, test, type Page } from '@playwright/test';
import { encodeSave } from '../../src/core/save';
import { translations } from '../../src/i18n';
import { longNoteState } from '../fixtures/long-notes';

async function key(page: Page, id: string): Promise<void> {
  await page.locator(`#control-${id}`).focus();
  await page.keyboard.press('Enter');
}

async function place(page: Page): Promise<void> {
  const stage = (await page.locator('#stage').boundingBox())!;
  await page.mouse.click(stage.x + 350 * stage.width / 570, stage.y + 220 * stage.height / 320);
}

for (const locale of ['pl', 'en'] as const) {
  test(`long medical notes paginate with pointer and keyboard in ${locale}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const state = longNoteState(), note = state.papers.find(paper => paper.kind === 'note')!;
    const t = translations[locale];
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await key(page, 'start');
    for (let n = 0; n < 4; n++) await key(page, 'intro-next');
    await page.clock.pauseAt(new Date(Date.now() + 1000));
    await key(page, `language-${locale}`);

    const load = async () => {
      await key(page, 'saves');
      await page.locator('#save-input').setInputFiles({ name: 'long-notes.npsave', mimeType: 'application/gzip', buffer: Buffer.from(encodeSave(state)) });
      await expect(page.locator('#announcement')).toContainText(/Zapis wczytany|Save loaded/);
      await key(page, 'back');
      await page.locator(`#control-paper-${note.id}`).focus();
      await page.keyboard.press('Space');
      await place(page);
    };
    await load();
    const paper = page.locator(`#control-paper-${note.id}`);
    await expect(paper).toHaveAccessibleName(new RegExp(`${t.notePagination.page} 1/2`));
    await expect(paper).toHaveAccessibleName(new RegExp(t.additionalTests.notes['chest-xray'].fit.replace('.', '\\.')));
    await expect(page.locator(`#control-paper-action-${note.id}`)).toHaveCount(0);
    await page.locator(`#control-note-next-${note.id}`).click();
    await expect(paper).toHaveAccessibleName(new RegExp(`${t.notePagination.page} 2/2`));
    await expect(page.locator(`#control-note-prev-${note.id}`)).toBeFocused();
    await expect(page.locator(`#control-note-next-${note.id}`)).toHaveCount(0);
    await page.locator('#stage').screenshot({ path: info.outputPath(`notes-last-page-${locale}.png`) });
    await key(page, `note-prev-${note.id}`);
    await expect(paper).toHaveAccessibleName(new RegExp(`${t.notePagination.page} 1/2`));
    await paper.focus();
    await page.keyboard.press('Space');
    await expect(page.locator(`[id^="control-note-next-"]`)).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.locator(`#control-note-next-${note.id}`)).toBeAttached();

    // A covering note owns its own corners and blocks the sheet beneath it.
    await key(page, 'take-paper');
    await place(page);
    const topId = state.nextPaperId;
    const topCorner = page.locator(`#control-note-next-${topId}`);
    await expect(topCorner).toHaveAttribute('data-owner', `paper-${topId}`);
    expect(await topCorner.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)?.id;
    })).toBe(`control-note-next-${topId}`);

    // A successful import discards temporary pagination, without saving it.
    await load();
    await key(page, `note-next-${note.id}`);
    await expect(paper).toHaveAccessibleName(new RegExp(`${t.notePagination.page} 2/2`));
    await load();
    await expect(paper).toHaveAccessibleName(new RegExp(`${t.notePagination.page} 1/2`));
    expect(errors).toEqual([]);
  });
}
