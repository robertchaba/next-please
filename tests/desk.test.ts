import { describe, expect, it } from 'vitest';
import {
  addDeskItem, containsPoint, createDeskState, DEFAULT_DOCUMENT, DESK_BOUNDS, CARRY_BOUNDS, ITEM_SIZES, CARRIED_ITEM_SIZES, PAPER_SIZE, CLINICAL_PAPER_SIZE, desktopItemSize, paperDesktopSize, restRect, itemAnchor, dropTargetRect, DROP_ZONES, CABINET_HOTSPOTS,
  itemRect, moveDeskItem, pickUpDeskItem, raiseDeskItem, TRAY_DOCUMENT, MANUAL_OPEN_POSITION, MANUAL_OPEN_SIZE, RIGHT_DESK_X, RIGHT_DESK_TOP, DESK_FRONT, type DeskItemId,
} from '../src/core/desk';

describe('temporary desktop layout', () => {
  it('keeps referrals, certificates and histories at the same size through carrying and placement', () => {
    const initial = createDeskState();
    const desk = addDeskItem(initial, 'paper-1', { x: 300, y: 150 }, CLINICAL_PAPER_SIZE);
    expect(itemRect(desk, 'paper-1')).toMatchObject({ w: 176, h: 157 });
    expect(itemRect(desk, 'document')).toMatchObject({ w: 176, h: 157 });
    expect(itemRect(addDeskItem(desk, 'paper-2', { x: 300, y: 150 }, paperDesktopSize('referral')), 'paper-2')).toMatchObject({ w: 176, h: 157 });
    expect(paperDesktopSize('specialist')).toEqual(CLINICAL_PAPER_SIZE);
    expect(paperDesktopSize('letter')).toEqual(PAPER_SIZE);
    const carried = pickUpDeskItem(desk, 'paper-1');
    expect(itemRect(carried, 'paper-1', false, true)).toMatchObject({ w: 48, h: 64 });
    const placed = moveDeskItem(carried, 'paper-1', { x: 280, y: 150 });
    expect(itemRect(placed, 'paper-1')).toEqual({ x: 280, y: 150, w: 176, h: 157 });
    expect(initial.sizes).toBeUndefined();
    expect(desk.positions['paper-1']).toEqual({ x: 300, y: 150 });
  });

  it.each((Object.keys(ITEM_SIZES) as DeskItemId[]).filter(id => id !== 'incoming-referral'))('keeps %s within its placement limits at integer coordinates', (id) => {
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
      const minimumY = id === 'document' && rect.x >= RIGHT_DESK_X ? RIGHT_DESK_TOP - rect.h / 2 : DESK_BOUNDS.y;
      expect(rect.y).toBeGreaterThanOrEqual(minimumY);
      expect(rect.x + rect.w).toBeLessThanOrEqual(DESK_BOUNDS.x + DESK_BOUNDS.w);
      expect(rect.y + rect.h).toBeLessThanOrEqual(DESK_BOUNDS.y + DESK_BOUNDS.h);
    }
    expect(moveDeskItem(state, id, { x: 250.4, y: 145.6 }).positions[id]).toEqual({ x: 250, y: 146 });
  });

  it.each(['document', 'paper-1'] as const)('allows %s over the room only while at least half remains over the right desktop', id => {
    const initial = addDeskItem(createDeskState(), 'paper-1', { x: 300, y: 151 });
    for (const y of [-Infinity, -100, 49, 50, 100, 138, 170, 300, Infinity]) {
      const placed = itemRect(moveDeskItem(initial, id, { x: 300, y }), id);
      const heightOnDesk = Math.min(placed.y + placed.h, DESK_FRONT.y) - Math.max(placed.y, RIGHT_DESK_TOP);
      expect(heightOnDesk * placed.w).toBeGreaterThanOrEqual(placed.w * placed.h / 2);
      expect(placed.y + placed.h).toBeLessThanOrEqual(DESK_BOUNDS.y + DESK_BOUNDS.h);
    }
    expect(itemRect(moveDeskItem(initial, id, { x: 300, y: -100 }), id)).toEqual({ x: 300, y: RIGHT_DESK_TOP - Math.floor(desktopItemSize(id).h / 2), ...desktopItemSize(id) });
    expect(itemRect(moveDeskItem(initial, id, { x: 300, y: 90 }), id).y).toBe(90);
    expect(itemRect(moveDeskItem(initial, id, { x: 90, y: -100 }), id).y).toBe(DESK_BOUNDS.y);
  });

  it('keeps small objects below the divider and fits the open book to the desk', () => {
    const initial = addDeskItem(createDeskState(), 'clip-1', { x: 300, y: 151 });
    for (const id of ['manual', 'stamp-fit', 'stamp-unfit', 'clip-1'] as const) {
      expect(itemRect(moveDeskItem(initial, id, { x: 300, y: -100 }), id).y).toBe(DESK_BOUNDS.y);
    }
    const book = itemRect(moveDeskItem(initial, 'manual', { x: 300, y: -100 }, false, true), 'manual', false, false, true);
    expect(book.y).toBe(134);
    expect(book.y + book.h).toBe(DESK_BOUNDS.y + DESK_BOUNDS.h);
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
    expect(rect.y + rect.h).toBeLessThanOrEqual(DESK_BOUNDS.y + DESK_BOUNDS.h);
    rect.x = 300;
    expect(second.positions.document).toEqual(DEFAULT_DOCUMENT);
  });

  it('keeps the incoming referral separate from the certificate supplied by the rack', () => {
    const initial = createDeskState();
    expect(itemRect(initial, 'incoming-referral')).toEqual(TRAY_DOCUMENT);
    expect(itemRect(initial, 'document')).toEqual({ ...DEFAULT_DOCUMENT, ...ITEM_SIZES.document });
    expect(DEFAULT_DOCUMENT.x).toBeGreaterThanOrEqual(RIGHT_DESK_X);
    const state = moveDeskItem(initial, 'document', { x: 250, y: 150 });
    expect(itemRect(state, 'incoming-referral')).toEqual(TRAY_DOCUMENT);
    expect(itemRect(state, 'document')).toEqual({ x: 250, y: 150, ...ITEM_SIZES.document });
    // Legacy tray flags must never turn the distinct certificate into a referral.
    expect(itemRect(state, 'document', true)).toEqual(itemRect(state, 'document'));
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
    for (const id of ['manual', 'document', 'incoming-referral'] as const) expect(restRect(id)).toBeUndefined();
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

  it('shrinks the incoming referral around its center and keeps that size while carried', () => {
    const initial = createDeskState();
    const before = itemRect(initial, 'incoming-referral');
    expect(before).toEqual({ x: 17, y: 190, w: 35, h: 83 });
    const carried = pickUpDeskItem(initial, 'incoming-referral');
    const held = itemRect(carried, 'incoming-referral', false, true);
    expect(held).toEqual({ x: 20, y: 198, w: 28, h: 66 });
    expect(held.x + Math.floor(held.w / 2)).toBe(before.x + Math.floor(before.w / 2));
    expect(held.y + Math.floor(held.h / 2)).toBe(before.y + Math.floor(before.h / 2));
    for (const point of [{ x: 300, y: 180 }, { x: Infinity, y: Infinity }]) {
      const moved = moveDeskItem(carried, 'incoming-referral', point, true);
      const rect = itemRect(moved, 'incoming-referral', false, true);
      expect({ w: rect.w, h: rect.h }).toEqual({ w: 28, h: 66 });
      expect(rect.x + rect.w).toBeLessThanOrEqual(CARRY_BOUNDS.w);
      expect(rect.y + rect.h).toBeLessThanOrEqual(CARRY_BOUNDS.h);
      expect(itemRect(moved, 'document')).toEqual(itemRect(initial, 'document'));
    }
    expect(itemRect(initial, 'incoming-referral')).toEqual(before);
    expect(initial.documentCarrySize).toBeUndefined();
  });

  it('retains an untouched pickup snapshot for canceling a referral, certificate or loose record', () => {
    const initial = addDeskItem(createDeskState(), 'paper-1', { x: 270, y: 150 });
    const snapshot = structuredClone(initial);
    for (const id of ['incoming-referral', 'document', 'paper-1'] as const) {
      const picked = pickUpDeskItem(initial, id);
      const moved = moveDeskItem(picked, id, { x: 400, y: 20 }, true);
      expect(moved.order.at(-1)).toBe(id);
      expect(moved.positions[id]).not.toEqual(initial.positions[id]);
      // Escape restores this exact snapshot; pickup and movement must not alter it.
      expect(initial).toEqual(snapshot);
      expect(itemRect(initial, 'incoming-referral')).toEqual(TRAY_DOCUMENT);
      expect(itemRect(initial, 'document')).toEqual({ ...DEFAULT_DOCUMENT, ...ITEM_SIZES.document });
      expect(itemRect(initial, 'paper-1')).toEqual({ x: 270, y: 146, ...PAPER_SIZE });
    }
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
    expect(itemRect(opened, 'manual', false, false, true)).toMatchObject({ w: 300, h: 180 });
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


describe('generous carrying targets', () => {
  it('opens drawer/trash margins only for compatible carried items', () => {
    for (const id of ['incoming-referral', 'paper-1', 'clip-1'] as const) {
      expect(dropTargetRect('drawer', id)).toEqual(DROP_ZONES.drawer);
      expect(dropTargetRect('trash', id)).toEqual(DROP_ZONES.trash);
    }
    expect(dropTargetRect('drawer', 'manual')).toEqual(DROP_ZONES.drawer);
    expect(dropTargetRect('trash', 'manual')).toEqual(CABINET_HOTSPOTS.trash);
    for (const id of [null, 'stamp-fit', 'stamp-unfit', 'document'] as const) {
      expect(dropTargetRect('drawer', id)).toEqual(CABINET_HOTSPOTS.drawer);
      expect(dropTargetRect('trash', id)).toEqual(CABINET_HOTSPOTS.trash);
    }
    for (const target of ['drawer', 'trash'] as const) {
      expect(dropTargetRect(target, 'paper-2', ['paper-2', 'document'])).toEqual(CABINET_HOTSPOTS[target]);
      expect(dropTargetRect(target, 'paper-2', ['paper-2', 'paper-1'])).toEqual(DROP_ZONES[target]);
    }
  });

  it('covers near-corner drops within the viewport while keeping stamp holders outside', () => {
    for (const [target, corners] of [
      ['drawer', [{ x: 210, y: 278 }, { x: 364, y: 319 }]],
      ['trash', [{ x: 456, y: 282 }, { x: 569, y: 319 }]],
    ] as const) {
      const rect = dropTargetRect(target, 'paper-1');
      for (const point of corners) expect(containsPoint(rect, point)).toBe(true);
      for (const id of ['stamp-fit', 'stamp-unfit'] as const) {
        const rest = restRect(id)!;
        expect(containsPoint(rect, { x: rest.x, y: rest.y })).toBe(false);
        expect(containsPoint(rect, { x: rest.x + rest.w - 1, y: rest.y + rest.h - 1 })).toBe(false);
      }
      expect(containsPoint(rect, { x: rect.x + rect.w, y: rect.y })).toBe(false);
      expect(containsPoint(rect, { x: rect.x, y: 320 })).toBe(false);
    }
  });
});
