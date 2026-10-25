import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState } from '../src/core/game';
import { drawerButtons, drawerSheets, DRAWER_BATCH_SIZE, DRAWER_CLOSE } from '../src/render/drawer';
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
  it('retains filing order across dense overlapping sections and reaches every sheet', () => {
    const state = stockedDrawer(29), ids: number[] = [];
    for (let page = 0; page < 3; page++) {
      const { visible, pages } = drawerSheets(state, page);
      expect(pages).toBe(3);
      expect(visible.length).toBeLessThanOrEqual(DRAWER_BATCH_SIZE);
      for (const [index, { paper, bounds }] of visible.entries()) {
        ids.push(paper.id);
        expect(bounds.x + bounds.w).toBeLessThanOrEqual(420);
        expect(bounds.y + bounds.h).toBeLessThan(263);
        if (index) expect(bounds.x).toBeLessThan(visible[index - 1]!.bounds.x + bounds.w);
      }
    }
    expect(ids).toEqual(state.papers.map(paper => paper.id));
  });

  it('refiling a retrieved sheet places it above all previously stored sheets', () => {
    let state = stockedDrawer(3);
    state = applyAction(state, { type: 'retrieve-paper', paperId: 1 }).state;
    state = applyAction(state, { type: 'store-paper', paperId: 1 }).state;
    expect(drawerSheets(state, 0).visible.map(({ paper }) => paper.id)).toEqual([2, 3, 1]);
  });

  it('gives objects separate targets and the entire lower edge one closing action', () => {
    const state = { ...stockedDrawer(1), drawerItems: { manual: true, clips: 4 } };
    const controls = drawerButtons(state, 'pl', 0, () => {});
    expect(controls.find(button => button.id === 'drawer-close')).toMatchObject(DRAWER_CLOSE);
    for (const id of ['drawer-manual', 'drawer-clip']) expect(controls.find(button => button.id === id)?.x).toBeGreaterThan(438);
    expect(drawerSheets(state, 99).current).toBe(0);
  });

  it('fits Polish and English drawer labels without scaling text', () => {
    for (const t of Object.values(translations)) {
      expect(measureDocumentText(t.drawerClose)).toBeLessThan(400);
      expect(measureText(t.drawerPrevious)).toBeLessThanOrEqual(160);
      expect(measureText(t.drawerNext)).toBeLessThanOrEqual(146);
    }
  });
});
