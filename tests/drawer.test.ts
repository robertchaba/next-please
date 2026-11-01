import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { applyAction, type DrawerId } from '../src/core/game';
import { drawerButtons, drawerSheets, DRAWER_BATCH_SIZE, DRAWER_CLOSE } from '../src/render/drawer';
import { decodeSave, encodeSave } from '../src/core/save';
import { translations } from '../src/i18n';
import { measureDocumentText, measureText } from '../src/render/font';

function stockedDrawer(count: number) {
  let state = applyAction(createInitialState(), 'skip-intro').state;
  for (let id = 1; id <= count; id++) {
    state = applyAction(state, 'take-paper').state;
    state = applyAction(state, { type: 'store-paper', paperId: id }).state;
  }
  return state;
}

describe('drawer presentation', () => {
  it('shows the latest filed records first across 24 exposed cover labels and reaches every sheet', () => {
    const state = stockedDrawer(53), ids: number[] = [];
    for (let page = 0; page < 3; page++) {
      const { visible, pages } = drawerSheets(state, page);
      expect(pages).toBe(3);
      expect(visible.length).toBeLessThanOrEqual(DRAWER_BATCH_SIZE);
      for (const [index, { paper, bounds }] of visible.entries()) {
        ids.push(paper.id);
        expect(bounds.x + bounds.w).toBeLessThan(283);
        expect(bounds.y + bounds.h).toBeLessThan(263);
        for (const previous of visible.slice(0, index)) {
          const overlap = bounds.x < previous.bounds.x + previous.bounds.w && bounds.x + bounds.w > previous.bounds.x
            && bounds.y < previous.bounds.y + previous.bounds.h && bounds.y + bounds.h > previous.bounds.y;
          expect(overlap).toBe(false);
        }
      }
    }
    expect(ids).toEqual(state.papers.map(paper => paper.id).reverse());
  });

  it('counts a clipped bundle once before pagination and retrieves every member', () => {
    let state = stockedDrawer(25);
    for (const id of [1, 2]) state = applyAction(state, { type: 'retrieve-paper', paperId: id }).state;
    state = applyAction(state, { type: 'clip-document', documentId: 1 }).state;
    state = applyAction(state, { type: 'join-documents', documentId: 2, targetId: 1 }).state;
    state = applyAction(state, { type: 'store-paper', paperId: 2 }).state;
    const sheets = drawerSheets(state, 0);
    expect(sheets.pages).toBe(1);
    expect(sheets.visible.map(({ paper }) => paper.id)).toEqual([1, ...Array.from({ length: 23 }, (_, i) => 25 - i)]);
    expect(drawerButtons(state, 'pl', 0, () => {}).filter(button => button.id.startsWith('drawer-paper-'))).toHaveLength(24);
    state = applyAction(state, { type: 'retrieve-paper', paperId: 1 }).state;
    expect(state.papers.filter(paper => paper.location === 'desk').map(paper => paper.id)).toEqual([1, 2]);
    expect(state.paperClips).toEqual([[1, 2]]);
  });

  it('refiling a retrieved sheet places it above all previously stored sheets', () => {
    let state = stockedDrawer(3);
    state = applyAction(state, { type: 'retrieve-paper', paperId: 1 }).state;
    state = applyAction(state, { type: 'store-paper', paperId: 1 }).state;
    expect(drawerSheets(state, 0).visible.map(({ paper }) => paper.id)).toEqual([1, 3, 2]);
  });

  it('gives objects separate targets and the entire lower edge one closing action', () => {
    const state = { ...stockedDrawer(1), drawerItems: { drawer: { manual: true, clips: 4 }, 'drawer-2': { manual: false, clips: 0 } } };
    const controls = drawerButtons(state, 'pl', 0, () => {});
    expect(controls.find(button => button.id === 'drawer-close')).toMatchObject(DRAWER_CLOSE);
    for (const id of ['drawer-manual', 'drawer-clip']) {
      expect(controls.find(button => button.id === id)?.x).toBeGreaterThan(350);
      expect(controls.find(button => button.id === id)?.y).toBeGreaterThan(200);
    }
    const manual = controls.find(button => button.id === 'drawer-manual')!;
    expect(manual.y + manual.h).toBeLessThan(278); // Stay inside the illustrated drawer front.
    expect(drawerSheets(state, 99).current).toBe(0);
  });

  it('fits Polish and English drawer labels without scaling text', () => {
    for (const t of Object.values(translations)) {
      expect(measureDocumentText(t.drawerClose)).toBeLessThan(400);
      expect(measureText(t.drawerPrevious)).toBeLessThanOrEqual(112);
      expect(measureText(t.drawerNext)).toBeLessThanOrEqual(112);
    }
  });

});

it('sorts by date before filing time, uses the newest bundle member and leaves both saved drawers intact', () => {
  for (const drawer of ['drawer', 'drawer-2'] as DrawerId[]) {
    const other = drawer === 'drawer' ? 'drawer-2' : 'drawer';
    const source = stockedDrawer(6);
    const state = { ...source, day: 5, papers: source.papers.map((paper, index) => ({ ...paper,
      day: [4, 1, 5, 4, 2, 5][index]!, location: index === 5 ? other : drawer })), paperClips: [[1, 3]] };
    const before = structuredClone(state);
    expect(drawerSheets(state, 0, drawer).papers.map(paper => paper.id)).toEqual([1, 4, 5, 2]);
    expect(drawerSheets(state, 0, other).papers.map(paper => paper.id)).toEqual([6]);
    expect(state).toEqual(before);
    // Actual chronological blank paperwork and the tie-break survive an import.
    const stored = { ...source, papers: source.papers.map(paper => ({ ...paper, location: drawer })) };
    expect(drawerSheets(decodeSave(encodeSave(stored)), 0, drawer).papers.map(paper => paper.id)).toEqual([6, 5, 4, 3, 2, 1]);
  }
});
