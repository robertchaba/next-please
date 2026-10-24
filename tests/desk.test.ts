import { describe, expect, it } from 'vitest';
import {
  containsPoint, createDeskState, DEFAULT_DOCUMENT, DESK_BOUNDS, CARRY_BOUNDS, ITEM_SIZES, CARRIED_ITEM_SIZES, restRect, itemAnchor,
  itemRect, moveDeskItem, pickUpDeskItem, raiseDeskItem, TRAY_DOCUMENT, MANUAL_OPEN_POSITION, MANUAL_OPEN_SIZE, RIGHT_DESK_X, type DeskItemId,
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
    expect(moveDeskItem(state, id, { x: 250.4, y: 145.6 }).positions[id]).toEqual({ x: 250, y: 146 });
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
    const state = moveDeskItem(createDeskState(), 'document', { x: 250, y: 150 });
    expect(itemRect(state, 'document', true)).toEqual(TRAY_DOCUMENT);
    expect(itemRect(state, 'document')).toEqual({ x: 250, y: 150, ...ITEM_SIZES.document });
    expect(itemRect(state, 'stamp-fit', true)).toEqual(itemRect(state, 'stamp-fit'));
  });

  it('keeps tool holders fixed and separate from freely placed belongings', () => {
    const state = createDeskState();
    for (const id of ['stamp-fit', 'stamp-unfit'] as const) {
      const holder = restRect(id)!;
      expect(holder).toEqual(itemRect(state, id));
      const moved = moveDeskItem(state, id, { x: 100, y: 180 });
      expect(restRect(id)).toEqual(holder);
      expect(itemRect(moved, id)).not.toEqual(holder);
      holder.x = 999;
      expect(restRect(id)!.x).not.toBe(999);
    }
    for (const id of ['manual', 'document'] as const) expect(restRect(id)).toBeUndefined();
    expect(itemAnchor('stamp-fit')).toEqual({ x: 24, y: 42 });
  });

  it('shrinks shelf paper throughout carrying and expands it only when placed on the main desktop', () => {
    const left = moveDeskItem(createDeskState(), 'document', { x: 120, y: 220 });
    expect(itemRect(left, 'document')).toMatchObject({ w: 60, h: 80 });
    const carried = moveDeskItem(pickUpDeskItem(left, 'document'), 'document', { x: 38, y: 22 }, true);
    expect(itemRect(carried, 'document', false, true)).toEqual({ x: 38, y: 22, w: 48, h: 64 });
    const across = moveDeskItem(carried, 'document', { x: 500, y: 22 }, true);
    expect(itemRect(across, 'document', false, true)).toEqual({ x: 500, y: 22, w: 48, h: 64 });
    expect(itemAnchor('document', itemRect(across, 'document', false, true))).toEqual({ x: 24, y: 32 });
    const right = moveDeskItem(carried, 'document', { x: 300, y: 220 });
    const bounds = itemRect(right, 'document');
    expect(bounds.w).toBe(ITEM_SIZES.document.w);
    expect(bounds.x).toBeGreaterThanOrEqual(RIGHT_DESK_X);
    expect(bounds.y + bounds.h).toBeLessThanOrEqual(DESK_BOUNDS.y + DESK_BOUNDS.h);
    expect(right.documentCarrySize).toBeUndefined();
  });

  it('shrinks the incoming folded sheet and a large desk document before they cross the divider', () => {
    const initial = createDeskState();
    const carried = pickUpDeskItem(initial, 'document', true);
    expect(itemRect(carried, 'document', false, true)).toEqual({ x: 20, y: 173, w: 28, h: 88 });
    const across = moveDeskItem(carried, 'document', { x: Infinity, y: Infinity }, true);
    expect(itemRect(across, 'document', false, true)).toEqual({ x: 542, y: 232, w: 28, h: 88 });
    expect(initial.documentCarrySize).toBeUndefined();
    const right = moveDeskItem(across, 'document', DEFAULT_DOCUMENT);
    const backLeft = moveDeskItem(pickUpDeskItem(right, 'document'), 'document', { x: 10, y: 30 }, true);
    expect(itemRect(backLeft, 'document', false, true)).toEqual({ x: 10, y: 30, ...CARRIED_ITEM_SIZES.document });
  });

  it.each(Object.keys(ITEM_SIZES) as DeskItemId[])('lets a carried %s reach the upper room while retaining its carried footprint', id => {
    const state = createDeskState();
    for (const point of [{ x: -Infinity, y: -Infinity }, { x: Infinity, y: Infinity }]) {
      const carried = moveDeskItem(state, id, point, true);
      const bounds = itemRect(carried, id, false, true);
      expect(bounds.x).toBeGreaterThanOrEqual(CARRY_BOUNDS.x);
      expect(bounds.y).toBeGreaterThanOrEqual(CARRY_BOUNDS.y);
      expect(bounds.x + bounds.w).toBeLessThanOrEqual(CARRY_BOUNDS.w);
      expect(bounds.y + bounds.h).toBeLessThanOrEqual(CARRY_BOUNDS.h);
      expect({ w: bounds.w, h: bounds.h }).toEqual(CARRIED_ITEM_SIZES[id]);
    }
  });

  it('keeps the opened manual on the main desktop and changes to its closed size when carried', () => {
    const open = moveDeskItem(createDeskState(), 'manual', MANUAL_OPEN_POSITION, false, true);
    expect(itemRect(open, 'manual', false, false, true)).toEqual({ ...MANUAL_OPEN_POSITION, ...MANUAL_OPEN_SIZE });
    const moved = moveDeskItem(open, 'manual', { x: -100, y: 500 }, false, true);
    const bounds = itemRect(moved, 'manual', false, false, true);
    expect(bounds.x).toBeGreaterThanOrEqual(RIGHT_DESK_X);
    expect(bounds.y + bounds.h).toBeLessThanOrEqual(DESK_BOUNDS.y + DESK_BOUNDS.h);
    expect(itemRect(moved, 'manual', false, true, true)).toMatchObject(CARRIED_ITEM_SIZES.manual);
  });

  it('shows a compact shelf book and a single upright cover before the book is opened', () => {
    const shelf = createDeskState();
    expect(itemRect(shelf, 'manual')).toMatchObject({ w: 88, h: 48 });
    const carried = moveDeskItem(shelf, 'manual', { x: 280, y: 140 }, true);
    expect(itemRect(carried, 'manual', false, true)).toEqual({ x: 280, y: 140, w: 64, h: 36 });
    expect(itemAnchor('manual')).toEqual({ x: 69, y: 82 });
    const closed = moveDeskItem(carried, 'manual', { x: 280, y: 140 });
    expect(itemRect(closed, 'manual')).toEqual({ x: 280, y: 143, w: 138, h: 164 });
    const opened = moveDeskItem(closed, 'manual', closed.positions.manual, false, true);
    expect(itemRect(opened, 'manual', false, false, true)).toMatchObject({ w: 276, h: 164 });
  });

  it('keeps paper and book centers steady when keyboard pickup shrinks either desktop size', () => {
    for (const id of ['document', 'manual'] as const) {
      for (const point of [{ x: 90, y: 160 }, { x: 270, y: 150 }]) {
        const state = moveDeskItem(createDeskState(), id, point);
        const before = itemRect(state, id);
        const pickedUp = pickUpDeskItem(state, id);
        const after = itemRect(pickedUp, id, false, true);
        expect(after.w).toBeLessThan(before.w);
        expect(after.h).toBeLessThan(before.h);
        expect(after.x + Math.floor(after.w / 2)).toBe(before.x + Math.floor(before.w / 2));
        expect(after.y + Math.floor(after.h / 2)).toBe(before.y + Math.floor(before.h / 2));
        expect(itemRect(state, id)).toEqual(before);
      }
    }
    const open = moveDeskItem(createDeskState(), 'manual', MANUAL_OPEN_POSITION, false, true);
    const before = itemRect(open, 'manual', false, false, true);
    const after = itemRect(pickUpDeskItem(open, 'manual', false, true), 'manual', false, true);
    expect(after.x + after.w / 2).toBe(before.x + before.w / 2);
    expect(after.y + after.h / 2).toBe(before.y + before.h / 2);
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
