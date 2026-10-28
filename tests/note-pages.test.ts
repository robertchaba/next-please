import { describe, expect, it } from 'vitest';
import { addDeskItem, createDeskState, itemRect } from '../src/core/desk';
import { encodeSave, decodeSave } from '../src/core/save';
import { noteEntries, wrapDocumentLines } from '../src/render/paperwork';
import { NOTE_LINES_PER_PAGE, notePageControls, paginateNoteEntries } from '../src/render/note-pages';
import { shiftButtons } from '../src/scenes/shift';
import { longNoteState } from './fixtures/long-notes';

describe('medical note pagination', () => {
  it('retains every wrapped line in journal order, including four supplementary findings', () => {
    const state = longNoteState(), paper = state.papers.find(paper => paper.kind === 'note')!;
    expect(decodeSave(encodeSave(state))).toEqual(state);
    for (const locale of ['pl', 'en'] as const) {
      const entries = noteEntries(paper, locale), first = paginateNoteEntries(entries);
      expect(first.count, JSON.stringify(entries)).toBeGreaterThan(1);
      const rendered = Array.from({ length: first.count }, (_, page) => paginateNoteEntries(entries, 166, page));
      expect(rendered.every(page => page.lines.length <= NOTE_LINES_PER_PAGE)).toBe(true);
      expect(rendered.flatMap(page => page.lines)).toEqual(entries.flatMap(entry => wrapDocumentLines([entry.text], 166).map(text => ({ ...entry, text }))));
      expect(paginateNoteEntries(entries, 166, 999).page).toBe(first.count - 1);
    }
  });

  it('keeps earlier rows stationary when more findings are appended', () => {
    const entries = Array.from({ length: NOTE_LINES_PER_PAGE }, (_, index) => ({ text: `Wpis ${index + 1}`, color: '#385b78' }));
    const before = paginateNoteEntries(entries);
    const after = paginateNoteEntries([...entries, { text: 'Nowy wynik', color: '#a33128' }]);
    expect(after.lines).toEqual(before.lines);
    expect(after.count).toBe(2);
    const partial = entries.slice(0, NOTE_LINES_PER_PAGE - 1);
    const continuation = { text: 'Konsultacja psychiatryczna: zaburzenia psychiczne.', color: '#385b78' };
    const together = paginateNoteEntries([...partial, continuation], 166, 1);
    expect(together.lines).toEqual(wrapDocumentLines([continuation.text], 166).map(text => ({ ...continuation, text })));
  });

  it('aligns folded-corner controls to their owning sheet and hides them while carried or compact', () => {
    const state = longNoteState(), paper = state.papers.find(paper => paper.kind === 'note')!;
    const id = `paper-${paper.id}` as const;
    const desk = state.papers.reduce((desk, entry) => addDeskItem(desk, `paper-${entry.id}`, { x: 300, y: 150 }), createDeskState());
    const view = { desk, held: null, manualOpen: false, manualPage: 0 };
    const buttons = shiftButtons(state, 'pl', null, () => {}, view);
    const next = buttons.find(button => button.id === `note-next-${paper.id}`)!;
    expect(next.owner).toBe(id);
    expect({ x: next.x, y: next.y, w: next.w, h: next.h }).toEqual(notePageControls(itemRect(desk, id)).next);
    expect(buttons.some(button => button.id === `note-prev-${paper.id}`)).toBe(false);
    for (const compact of [{ ...view, held: id }, { ...view, desk: { ...desk, positions: { ...desk.positions, [id]: { x: 40, y: 190 } } } }]) {
      expect(shiftButtons(state, 'pl', null, () => {}, compact).some(button => button.id.startsWith('note-next-'))).toBe(false);
    }
    const finalPage = paginateNoteEntries(noteEntries(paper, 'pl')).count - 1;
    const last = shiftButtons(state, 'pl', null, () => {}, { ...view, notePages: { [paper.id]: finalPage } });
    expect(last.some(button => button.id === `note-prev-${paper.id}`)).toBe(true);
    expect(last.some(button => button.id === `note-next-${paper.id}`)).toBe(false);
  });
});
