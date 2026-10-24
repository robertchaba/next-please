/** Temporary desk layout. Item positions are deliberately absent from gameplay saves. */
export type FixedDeskItemId = 'document' | 'incoming-referral' | 'stamp-fit' | 'stamp-unfit' | 'manual';
export type DeskItemId = FixedDeskItemId | `paper-${number}` | `clip-${number}`;

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
  /** Compact paper footprint remains stable until it is placed on a desktop. */
  documentCarrySize?: Pick<Rect, 'w' | 'h'>;
}

export const LEFT_WIDTH = 204;
export const RIGHT_DESK_X = 210;
export const CABINET_HOTSPOTS = {
  callPatient: { x: 150, y: 145, w: 44, h: 40 },
  vision: { x: 249, y: 16, w: 73, h: 60 },
  pressure: { x: 341, y: 58, w: 43, h: 46 },
  lamp: { x: 357, y: 10, w: 43, h: 31 },
  decoration: { x: 490, y: 4, w: 57, h: 42 },
  phone: { x: 216, y: 113, w: 73, h: 51 },
  paperSupply: { x: 507, y: 142, w: 54, h: 20 },
  certificateSupply: { x: 507, y: 162, w: 54, h: 14 },
  clipSupply: { x: 296, y: 137, w: 37, h: 36 },
  drawer: { x: 222, y: 299, w: 110, h: 18 },
  trash: { x: 478, y: 297, w: 68, h: 23 },
  measurements: { x: 405, y: 61, w: 42, h: 67 },
} as const satisfies Record<string, Rect>;
export const DOCUMENT_RACK: Rect = { x: 504, y: 140, w: 60, h: 65 };
export const DOCUMENT_RACK_SLOTS = [CABINET_HOTSPOTS.paperSupply, CABINET_HOTSPOTS.certificateSupply,
  { x: 507, y: 176, w: 54, h: 14 }, { x: 507, y: 190, w: 54, h: 13 }] as const;
export const DESK_FRONT: Rect = { x: 0, y: 296, w: 570, h: 24 };
export const PATIENT_HANDOFF: Rect = { x: 38, y: 32, w: 94, h: 96 };
export const MANUAL_OPEN_SIZE = { w: 276, h: 164 } as const;
export const MANUAL_OPEN_POSITION: Point = { x: 222, y: 144 };

/** Full-size artwork on the main desk; tools also use it while carried. */
export const ITEM_SIZES: Record<DeskItemId, Pick<Rect, 'w' | 'h'>> = {
  document: { w: 188, h: 144 },
  'incoming-referral': { w: 188, h: 144 },
  'stamp-fit': { w: 48, h: 48 },
  'stamp-unfit': { w: 48, h: 48 },
  manual: { w: 138, h: 164 },
};
const SMALL_DOCUMENT = { w: 60, h: 80 };
export const MANUAL_SHELF_SIZE = { w: 88, h: 48 } as const;
const RESTING_STAMP = { w: 36, h: 36 };
/** Papers and books shrink in hand; stamps retain their larger printing size. */
export const CARRIED_ITEM_SIZES: Record<DeskItemId, Pick<Rect, 'w' | 'h'>> = {
  document: { w: 48, h: 64 },
  'incoming-referral': { w: 28, h: 66 },
  'stamp-fit': ITEM_SIZES['stamp-fit'],
  'stamp-unfit': ITEM_SIZES['stamp-unfit'],
  manual: { w: 64, h: 36 },
};
const CARRIED_TRAY_DOCUMENT = { w: 28, h: 66 };

/** Stamps return to compact fixed holders at the far edge of the desk. */
export const ITEM_RESTS: Partial<Record<DeskItemId, Rect>> = {
  'stamp-fit': { x: 520, y: 214, ...RESTING_STAMP },
  'stamp-unfit': { x: 520, y: 257, ...RESTING_STAMP },
};

export function restRect(id: DeskItemId): Rect | undefined {
  const rest = ITEM_RESTS[id];
  return rest ? { ...rest } : undefined;
}

/** A carried stamp follows its printing face; other carried items their center. */
export function itemAnchor(id: DeskItemId, size: Pick<Rect, 'w' | 'h'> = fullSize(id)): Point {
  if (id === 'stamp-fit' || id === 'stamp-unfit') return { x: 24, y: 42 };
  const { w, h } = size;
  return { x: Math.floor(w / 2), y: Math.floor(h / 2) };
}

function fullSize(id: DeskItemId): Pick<Rect, 'w' | 'h'> {
  if (id.startsWith('paper-')) return ITEM_SIZES.document;
  if (id.startsWith('clip-')) return { w: 14, h: 19 };
  return ITEM_SIZES[id];
}

export function addDeskItem(state: DeskState, id: DeskItemId, point: Point): DeskState {
  if (state.positions[id]) return state;
  const added = { ...state, positions: { ...state.positions, [id]: { ...point } }, order: [...state.order, id] };
  return moveDeskItem(added, id, point);
}

export function removeDeskItem(state: DeskState, id: DeskItemId): DeskState {
  const positions = { ...state.positions };
  delete positions[id];
  return { ...state, positions, order: state.order.filter(item => item !== id) };
}

/** Resting position after importing a visit or canceling pickup from the rack. */
export const DEFAULT_DOCUMENT: Point = { x: 300, y: 151 };
export const TRAY: Rect = { x: 14, y: 154, w: 41, h: 130 };
export const TRAY_DOCUMENT: Rect = { x: 17, y: 190, w: 35, h: 83 };
export const DESK_BOUNDS: Rect = { x: 5, y: 143, w: 560, h: 171 };
export const CARRY_BOUNDS: Rect = { x: 0, y: 0, w: 570, h: 320 };

export function createDeskState(): DeskState {
  return {
    positions: {
      document: { ...DEFAULT_DOCUMENT },
      'incoming-referral': { x: 17, y: 190 },
      'stamp-fit': { x: 520, y: 214 },
      'stamp-unfit': { x: 520, y: 257 },
      manual: { x: 94, y: 247 },
    },
    order: ['document', 'incoming-referral', 'stamp-fit', 'stamp-unfit', 'manual'],
  };
}

function itemSize(id: DeskItemId, x: number, held: boolean, manualOpen: boolean, documentCarrySize?: Pick<Rect, 'w' | 'h'>): Pick<Rect, 'w' | 'h'> {
  if (id === 'incoming-referral') return held ? CARRIED_TRAY_DOCUMENT : TRAY_DOCUMENT;
  if (id.startsWith('clip-')) return fullSize(id);
  if (id.startsWith('paper-')) return held ? CARRIED_ITEM_SIZES.document : x < RIGHT_DESK_X ? SMALL_DOCUMENT : ITEM_SIZES.document;
  if (held) return id === 'document' && documentCarrySize ? documentCarrySize : CARRIED_ITEM_SIZES[id];
  if (id === 'stamp-fit' || id === 'stamp-unfit') return RESTING_STAMP;
  if (id === 'manual' && manualOpen) return MANUAL_OPEN_SIZE;
  if (x < RIGHT_DESK_X) return id === 'document' ? SMALL_DOCUMENT : MANUAL_SHELF_SIZE;
  return ITEM_SIZES[id];
}

export function itemRect(state: DeskState, id: DeskItemId, documentInTray = false, held = false, manualOpen = false): Rect {
  if (id === 'incoming-referral' && !held) return { ...TRAY_DOCUMENT };
  const point = state.positions[id];
  return { ...point, ...itemSize(id, point.x, held, manualOpen, state.documentCarrySize) };
}

/** Shrink around the item's center; crossing the divider never resizes it again. */
export function pickUpDeskItem(state: DeskState, id: DeskItemId, documentInTray = false, manualOpen = false): DeskState {
  const origin = itemRect(state, id, documentInTray, false, manualOpen);
  const size = itemSize(id, origin.x, true, false);
  const pickedUp = id === 'document' ? { ...state, documentCarrySize: { ...size } } : state;
  const point = id === 'document' || id === 'incoming-referral' || id === 'manual' || id.startsWith('paper-')
    ? { x: origin.x + Math.floor(origin.w / 2) - Math.floor(size.w / 2),
      y: origin.y + Math.floor(origin.h / 2) - Math.floor(size.h / 2) }
    : origin;
  return raiseDeskItem(moveDeskItem(pickedUp, id, point, true), id);
}

/** Placed items stay on either desktop. Carried items can reach the patient. */
export function moveDeskItem(state: DeskState, id: DeskItemId, point: Point, held = false, manualOpen = false): DeskState {
  const previous = state.positions[id];
  const requestedX = Math.round(Number.isNaN(point.x) ? previous.x : point.x);
  const requestedY = Math.round(Number.isNaN(point.y) ? previous.y : point.y);
  const onLeft = requestedX < RIGHT_DESK_X && !(id === 'manual' && manualOpen);
  const size = itemSize(id, onLeft ? 0 : RIGHT_DESK_X, held, manualOpen, state.documentCarrySize);
  const bounds = held ? CARRY_BOUNDS : {
    x: onLeft ? DESK_BOUNDS.x : RIGHT_DESK_X + 5,
    y: DESK_BOUNDS.y,
    w: onLeft ? LEFT_WIDTH - DESK_BOUNDS.x - 5 : 570 - RIGHT_DESK_X - 10,
    h: DESK_BOUNDS.h,
  };
  const x = Math.min(bounds.x + bounds.w - size.w, Math.max(bounds.x, requestedX));
  const y = Math.min(bounds.y + bounds.h - size.h, Math.max(bounds.y, requestedY));
  const moved = { ...state, positions: { ...state.positions, [id]: { x, y } } };
  if (id === 'document' && !held) delete moved.documentCarrySize;
  return moved;
}

export function raiseDeskItem(state: DeskState, id: DeskItemId): DeskState {
  return { ...state, order: [...state.order.filter(item => item !== id), id] };
}

/** Right and bottom edges belong to the next pixel, matching canvas rectangles. */
export function containsPoint(rect: Rect, point: Point): boolean {
  return point.x >= rect.x && point.x < rect.x + rect.w
    && point.y >= rect.y && point.y < rect.y + rect.h;
}
