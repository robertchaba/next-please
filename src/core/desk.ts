/** Temporary desk layout. Item positions are deliberately absent from gameplay saves. */
export type DeskItemId = 'document' | 'stamp-fit' | 'stamp-unfit' | 'manual' | 'cup' | 'pencil';

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  w: number;
  h: number;
}

export interface DeskState {
  positions: Record<DeskItemId, Point>;
  /** Back-to-front drawing and hit-test order. */
  order: DeskItemId[];
}

export const ITEM_SIZES: Record<DeskItemId, Pick<Rect, 'w' | 'h'>> = {
  document: { w: 188, h: 144 },
  'stamp-fit': { w: 48, h: 48 },
  'stamp-unfit': { w: 48, h: 48 },
  manual: { w: 100, h: 42 },
  cup: { w: 34, h: 38 },
  pencil: { w: 12, h: 66 },
};

export const DEFAULT_DOCUMENT: Point = { x: 86, y: 159 };
export const TRAY: Rect = { x: 9, y: 163, w: 65, h: 126 };
export const TRAY_DOCUMENT: Rect = { x: 15, y: 171, w: 53, h: 102 };
export const DESK_BOUNDS: Rect = { x: 5, y: 143, w: 560, h: 171 };

export function createDeskState(): DeskState {
  return {
    positions: {
      document: { ...DEFAULT_DOCUMENT },
      'stamp-fit': { x: 322, y: 166 },
      'stamp-unfit': { x: 390, y: 166 },
      manual: { x: 453, y: 265 },
      cup: { x: 515, y: 170 },
      pencil: { x: 417, y: 238 },
    },
    order: ['document', 'stamp-fit', 'stamp-unfit', 'manual', 'cup', 'pencil'],
  };
}

export function itemRect(state: DeskState, id: DeskItemId, documentInTray = false): Rect {
  if (id === 'document' && documentInTray) return { ...TRAY_DOCUMENT };
  return { ...state.positions[id], ...ITEM_SIZES[id] };
}

/** Keep the complete item on the desktop and aligned to logical pixels. */
export function moveDeskItem(state: DeskState, id: DeskItemId, point: Point): DeskState {
  const size = ITEM_SIZES[id];
  const previous = state.positions[id];
  const x = Math.min(DESK_BOUNDS.x + DESK_BOUNDS.w - size.w,
    Math.max(DESK_BOUNDS.x, Math.round(Number.isNaN(point.x) ? previous.x : point.x)));
  const y = Math.min(DESK_BOUNDS.y + DESK_BOUNDS.h - size.h,
    Math.max(DESK_BOUNDS.y, Math.round(Number.isNaN(point.y) ? previous.y : point.y)));
  return { ...state, positions: { ...state.positions, [id]: { x, y } } };
}

export function raiseDeskItem(state: DeskState, id: DeskItemId): DeskState {
  return { ...state, order: [...state.order.filter(item => item !== id), id] };
}

/** Right and bottom edges belong to the next pixel, matching canvas rectangles. */
export function containsPoint(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x < rect.x + rect.w
    && point.y >= rect.y && point.y < rect.y + rect.h;
}
