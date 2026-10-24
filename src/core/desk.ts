/** Temporary desk layout. Item positions are deliberately absent from gameplay saves. */
export type DeskItemId = 'document' | 'stamp-fit' | 'stamp-unfit' | 'manual';

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

export const LEFT_WIDTH = 204;
export const RIGHT_DESK_X = 210;
export const CABINET_HOTSPOTS = {
  callPatient: { x: 174, y: 92, w: 27, h: 30 },
  vision: { x: 249, y: 16, w: 73, h: 60 },
  pressure: { x: 341, y: 58, w: 43, h: 46 },
  lamp: { x: 111, y: 14, w: 61, h: 13 },
  decoration: { x: 490, y: 4, w: 57, h: 42 },
} as const satisfies Record<string, Rect>;
export const PATIENT_HANDOFF: Rect = { x: 38, y: 22, w: 94, h: 96 };
export const MANUAL_OPEN_SIZE = { w: 276, h: 164 } as const;
export const MANUAL_OPEN_POSITION: Point = { x: 222, y: 144 };

/** Full-size artwork while carried or laid on the main desk. */
export const ITEM_SIZES: Record<DeskItemId, Pick<Rect, 'w' | 'h'>> = {
  document: { w: 188, h: 144 },
  'stamp-fit': { w: 48, h: 48 },
  'stamp-unfit': { w: 48, h: 48 },
  manual: { w: 100, h: 50 },
};
const SMALL_DOCUMENT = { w: 60, h: 80 };
const SMALL_MANUAL = { w: 88, h: 48 };
const RESTING_STAMP = { w: 36, h: 36 };

/** Stamps return to compact fixed holders at the far edge of the desk. */
export const ITEM_RESTS: Partial<Record<DeskItemId, Rect>> = {
  'stamp-fit': { x: 520, y: 154, ...RESTING_STAMP },
  'stamp-unfit': { x: 520, y: 217, ...RESTING_STAMP },
};

export function restRect(id: DeskItemId): Rect | undefined {
  const rest = ITEM_RESTS[id];
  return rest ? { ...rest } : undefined;
}

/** A carried stamp follows its printing face; other carried items their center. */
export function itemAnchor(id: DeskItemId): Point {
  if (id === 'stamp-fit' || id === 'stamp-unfit') return { x: 24, y: 42 };
  const { w, h } = ITEM_SIZES[id];
  return { x: Math.floor(w / 2), y: Math.floor(h / 2) };
}

export const DEFAULT_DOCUMENT: Point = { x: 258, y: 155 };
export const TRAY: Rect = { x: 14, y: 154, w: 41, h: 130 };
export const TRAY_DOCUMENT: Rect = { x: 17, y: 162, w: 35, h: 111 };
export const DESK_BOUNDS: Rect = { x: 5, y: 143, w: 560, h: 171 };
export const CARRY_BOUNDS: Rect = { x: 0, y: 0, w: 570, h: 320 };

export function createDeskState(): DeskState {
  return {
    positions: {
      document: { ...DEFAULT_DOCUMENT },
      'stamp-fit': { x: 520, y: 154 },
      'stamp-unfit': { x: 520, y: 217 },
      manual: { x: 94, y: 241 },
    },
    order: ['document', 'stamp-fit', 'stamp-unfit', 'manual'],
  };
}

function itemSize(id: DeskItemId, x: number, held: boolean, manualOpen: boolean): Pick<Rect, 'w' | 'h'> {
  if (held) return ITEM_SIZES[id];
  if (id === 'stamp-fit' || id === 'stamp-unfit') return RESTING_STAMP;
  if (id === 'manual' && manualOpen) return MANUAL_OPEN_SIZE;
  if (x < RIGHT_DESK_X) return id === 'document' ? SMALL_DOCUMENT : SMALL_MANUAL;
  return ITEM_SIZES[id];
}

export function itemRect(state: DeskState, id: DeskItemId, documentInTray = false, held = false, manualOpen = false): Rect {
  if (id === 'document' && documentInTray && !held) return { ...TRAY_DOCUMENT };
  const point = state.positions[id];
  return { ...point, ...itemSize(id, point.x, held, manualOpen) };
}

/** Placed items stay on either desktop. Carried items can reach the patient. */
export function moveDeskItem(state: DeskState, id: DeskItemId, point: Point, held = false, manualOpen = false): DeskState {
  const previous = state.positions[id];
  const requestedX = Math.round(Number.isNaN(point.x) ? previous.x : point.x);
  const requestedY = Math.round(Number.isNaN(point.y) ? previous.y : point.y);
  const onLeft = requestedX < RIGHT_DESK_X && !(id === 'manual' && manualOpen);
  const size = itemSize(id, onLeft ? 0 : RIGHT_DESK_X, held, manualOpen);
  const bounds = held ? CARRY_BOUNDS : {
    x: onLeft ? DESK_BOUNDS.x : RIGHT_DESK_X + 5,
    y: DESK_BOUNDS.y,
    w: onLeft ? LEFT_WIDTH - DESK_BOUNDS.x - 5 : 570 - RIGHT_DESK_X - 10,
    h: DESK_BOUNDS.h,
  };
  const x = Math.min(bounds.x + bounds.w - size.w, Math.max(bounds.x, requestedX));
  const y = Math.min(bounds.y + bounds.h - size.h, Math.max(bounds.y, requestedY));
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
