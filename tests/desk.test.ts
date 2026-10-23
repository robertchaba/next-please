import { describe, expect, it } from 'vitest';
import {
  containsPoint, createDeskState, DEFAULT_DOCUMENT, DESK_BOUNDS, ITEM_SIZES,
  itemRect, moveDeskItem, raiseDeskItem, TRAY_DOCUMENT, type DeskItemId,
} from '../src/core/desk';

describe('temporary desktop layout', () => {
  it.each(Object.keys(ITEM_SIZES) as DeskItemId[])('keeps all of %s on the desk at integer coordinates', (id) => {
    const state = createDeskState();
    for (const point of [
      { x: -10000.6, y: -10000.6 },
      { x: 10000.6, y: 10000.6 },
      { x: Number.MAX_VALUE, y: -Number.MAX_VALUE },
      { x: -Infinity, y: Infinity },
      { x: 150.4, y: 155.6 },
      { x: NaN, y: NaN },
    ]) {
      const moved = moveDeskItem(state, id, point);
      const rect = itemRect(moved, id);
      expect(Number.isInteger(rect.x)).toBe(true);
      expect(Number.isInteger(rect.y)).toBe(true);
      expect(rect.x).toBeGreaterThanOrEqual(DESK_BOUNDS.x);
      expect(rect.y).toBeGreaterThanOrEqual(DESK_BOUNDS.y);
      expect(rect.x + rect.w).toBeLessThanOrEqual(DESK_BOUNDS.x + DESK_BOUNDS.w);
      expect(rect.y + rect.h).toBeLessThanOrEqual(DESK_BOUNDS.y + DESK_BOUNDS.h);
    }
    expect(moveDeskItem(state, id, { x: 150.4, y: 155.6 }).positions[id]).toEqual({ x: 150, y: 156 });
  });

  it('moves and raises an item without mutating the existing layout or other objects', () => {
    const state = createDeskState();
    const before = structuredClone(state);
    for (const point of Object.values(state.positions)) Object.freeze(point);
    Object.freeze(state.positions);
    Object.freeze(state.order);
    Object.freeze(state);
    const moved = moveDeskItem(state, 'stamp-fit', { x: 102.5, y: 168.2 });
    const raised = raiseDeskItem(moved, 'stamp-fit');
    expect(state).toEqual(before);
    expect(raised.positions['stamp-fit']).toEqual({ x: 103, y: 168 });
    for (const id of state.order.filter(item => item !== 'stamp-fit')) {
      expect(raised.positions[id]).toEqual(state.positions[id]);
    }
    expect(raised.order.at(-1)).toBe('stamp-fit');
    expect(raised.order.slice(0, -1)).toEqual(state.order.filter(item => item !== 'stamp-fit'));
    expect(new Set(raiseDeskItem(raised, 'stamp-fit').order).size).toBe(state.order.length);
  });

  it('creates independent starting layouts and returns independent hit rectangles', () => {
    const first = createDeskState();
    first.positions.document.x = 200;
    first.order.reverse();
    const second = createDeskState();
    expect(second.positions.document).toEqual(DEFAULT_DOCUMENT);
    expect(second.order[0]).toBe('document');
    const rect = itemRect(second, 'document');
    rect.x = 300;
    expect(second.positions.document).toEqual(DEFAULT_DOCUMENT);
  });

  it('uses the smaller tray paper only for the document before pickup', () => {
    const state = moveDeskItem(createDeskState(), 'document', { x: 200, y: 150 });
    expect(itemRect(state, 'document', true)).toEqual(TRAY_DOCUMENT);
    expect(itemRect(state, 'document')).toEqual({ x: 200, y: 150, ...ITEM_SIZES.document });
    expect(itemRect(state, 'stamp-fit', true)).toEqual(itemRect(state, 'stamp-fit'));
  });

  it('matches each canvas rectangle without overlapping the adjacent right or bottom pixel', () => {
    const rect = { x: 10, y: 20, w: 5, h: 6 };
    expect(containsPoint(rect, { x: 10, y: 20 })).toBe(true);
    expect(containsPoint(rect, { x: 14, y: 25 })).toBe(true);
    for (const point of [{ x: 9, y: 20 }, { x: 10, y: 19 }, { x: 15, y: 20 }, { x: 10, y: 26 }]) {
      expect(containsPoint(rect, point)).toBe(false);
    }
  });
});
