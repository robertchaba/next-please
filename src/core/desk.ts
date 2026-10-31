import type { Paper } from './game';

/** Temporary desk layout. Item positions are deliberately absent from gameplay saves. */
export type FixedDeskItemId = 'document' | 'incoming-referral' | 'stamp-fit' | 'stamp-unfit' | 'manual' | 'banknote';
export type DeskItemId = FixedDeskItemId | `paper-${number}` | `clip-${number}` | `banknote-${number}`;

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
  /** Per-item desktop footprints, derived from paper kinds rather than saved. */
  sizes?: Partial<Record<DeskItemId, Pick<Rect, 'w' | 'h'>>>;
  /** Compact paper footprint remains stable until it is placed on a desktop. */
  documentCarrySize?: Pick<Rect, 'w' | 'h'>;
}

export const LEFT_WIDTH = 204;
export const RIGHT_DESK_X = 210;
/** First desktop row below the horizontal wooden divider. */
export const RIGHT_DESK_TOP = 138;
export const CABINET_HOTSPOTS = {
  callPatient: { x: 150, y: 145, w: 44, h: 40 },
  vision: { x: 249, y: 16, w: 73, h: 60 },
  pressure: { x: 341, y: 58, w: 43, h: 46 },
  lamp: { x: 357, y: 10, w: 43, h: 31 },
  decoration: { x: 490, y: 4, w: 57, h: 42 },
  phone: { x: 216, y: 113, w: 73, h: 51 },
  paperSupply: { x: 507, y: 114, w: 54, h: 20 },
  certificateSupply: { x: 507, y: 134, w: 54, h: 14 },
  additionalReferralSupply: { x: 507, y: 148, w: 54, h: 14 },
  clipSupply: { x: 296, y: 137, w: 37, h: 36 },
  drawer: { x: 222, y: 299, w: 110, h: 18 },
  'drawer-2': { x: 350, y: 299, w: 110, h: 18 },
  trash: { x: 478, y: 297, w: 68, h: 23 },
  measurements: { x: 405, y: 61, w: 42, h: 67 },
} as const satisfies Record<string, Rect>;
/** Generous storage targets apply only while carrying a compatible item. */
export const DROP_ZONES = {
  drawer: { x: 210, y: 278, w: 132, h: 42 },
  'drawer-2': { x: 342, y: 278, w: 126, h: 42 },
  trash: { x: 468, y: 282, w: 102, h: 38 },
} as const satisfies Record<string, Rect>;

export function dropTargetRect(target: keyof typeof DROP_ZONES, held: DeskItemId | null, carried: readonly DeskItemId[] = []): Rect {
  const includesCertificate = held === 'document' || carried.includes('document');
  const compatible = held !== null && !includesCertificate && (held === 'incoming-referral' || held.startsWith('paper-')
    || held.startsWith('clip-') || (target !== 'trash' && (held === 'manual' || held === 'banknote' || held.startsWith('banknote-'))));
  return compatible ? { ...DROP_ZONES[target] } : { ...CABINET_HOTSPOTS[target] };
}

export const DOCUMENT_RACK: Rect = { x: 504, y: 112, w: 60, h: 65 };
export const DOCUMENT_RACK_SLOTS = [CABINET_HOTSPOTS.paperSupply, CABINET_HOTSPOTS.certificateSupply,
  CABINET_HOTSPOTS.additionalReferralSupply, { x: 507, y: 162, w: 54, h: 13 }] as const;
export const DESK_FRONT: Rect = { x: 0, y: 296, w: 570, h: 24 };
export const PATIENT_HANDOFF: Rect = { x: 38, y: 32, w: 94, h: 96 };
export const MANUAL_OPEN_SIZE = { w: 300, h: 180 } as const;
export const MANUAL_OPEN_POSITION: Point = { x: 216, y: 134 };

/** Full-size artwork on the main desk; tools also use it while carried. */
export const PAPER_SIZE = { w: 200, h: 168 } as const;
export const CLINICAL_PAPER_SIZE = { w: 176, h: 157 } as const;
export function paperDesktopSize(kind: Paper['kind']): Pick<Rect, 'w' | 'h'> {
  return kind === 'note' || kind === 'referral' || kind === 'specialist' || kind === 'additional-result' ? CLINICAL_PAPER_SIZE : PAPER_SIZE;
}
export const ITEM_SIZES: Record<DeskItemId, Pick<Rect, 'w' | 'h'>> = {
  banknote: { w: 92, h: 42 },
  document: CLINICAL_PAPER_SIZE,
  'incoming-referral': CLINICAL_PAPER_SIZE,
  'stamp-fit': { w: 48, h: 48 },
  'stamp-unfit': { w: 48, h: 48 },
  manual: { w: 138, h: 164 },
};
const SMALL_DOCUMENT = { w: 60, h: 80 };
export const MANUAL_SHELF_SIZE = { w: 88, h: 48 } as const;
const RESTING_STAMP = { w: 36, h: 36 };
/** Papers and books shrink in hand; stamps retain their larger printing size. */
export const CARRIED_ITEM_SIZES: Record<DeskItemId, Pick<Rect, 'w' | 'h'>> = {
  banknote: { w: 92, h: 42 },
  document: { w: 48, h: 64 },
  'incoming-referral': { w: 28, h: 66 },
  'stamp-fit': ITEM_SIZES['stamp-fit'],
  'stamp-unfit': ITEM_SIZES['stamp-unfit'],
  manual: { w: 64, h: 36 },
};
const CARRIED_TRAY_DOCUMENT = { w: 28, h: 66 };

/** Stamps return to compact fixed holders at the far edge of the desk. */
export const ITEM_RESTS: Partial<Record<DeskItemId, Rect>> = {
  'stamp-fit': { x: 520, y: 190, ...RESTING_STAMP },
  'stamp-unfit': { x: 520, y: 246, ...RESTING_STAMP },
};

export function restRect(id: DeskItemId): Rect | undefined {
  const rest = ITEM_RESTS[id];
  return rest ? { ...rest } : undefined;
}

/** A carried stamp follows its printing face; other carried items their center. */
export function itemAnchor(id: DeskItemId, size: Pick<Rect, 'w' | 'h'> = desktopItemSize(id)): Point {
  if (id === 'stamp-fit' || id === 'stamp-unfit') return { x: 24, y: 42 };
  const { w, h } = size;
  return { x: Math.floor(w / 2), y: Math.floor(h / 2) };
}

export function desktopItemSize(id: DeskItemId, state?: DeskState): Pick<Rect, 'w' | 'h'> {
  if (state?.sizes?.[id]) return state.sizes[id];
  if (id.startsWith('banknote-')) return ITEM_SIZES.banknote;
  if (id.startsWith('paper-')) return PAPER_SIZE;
  if (id.startsWith('clip-')) return { w: 14, h: 19 };
  return ITEM_SIZES[id];
}

export function addDeskItem(state: DeskState, id: DeskItemId, point: Point, size?: Pick<Rect, 'w' | 'h'>): DeskState {
  if (state.positions[id]) return state;
  const added = { ...state, positions: { ...state.positions, [id]: { ...point } }, order: [...state.order, id] };
  if (size) added.sizes = { ...state.sizes, [id]: { ...size } };
  return moveDeskItem(added, id, point);
}

export function removeDeskItem(state: DeskState, id: DeskItemId): DeskState {
  const positions = { ...state.positions };
  delete positions[id];
  const sizes = { ...state.sizes };
  delete sizes[id];
  return { ...state, positions, sizes, order: state.order.filter(item => item !== id) };
}

/** Resting position after importing a visit or canceling pickup from the rack. */
export const DEFAULT_DOCUMENT: Point = { x: 300, y: 134 };
export const TRAY: Rect = { x: 14, y: 154, w: 41, h: 130 };
export const TRAY_DOCUMENT: Rect = { x: 17, y: 190, w: 35, h: 83 };
export const DESK_BOUNDS: Rect = { x: 5, y: 143, w: 560, h: 171 };
export const CARRY_BOUNDS: Rect = { x: 0, y: 0, w: 570, h: 320 };

export function createDeskState(): DeskState {
  return {
    positions: {
      banknote: { x: 100, y: 198 },
      document: { ...DEFAULT_DOCUMENT },
      'incoming-referral': { x: 17, y: 190 },
      'stamp-fit': { x: 520, y: 190 },
      'stamp-unfit': { x: 520, y: 246 },
      manual: { x: 94, y: 247 },
    },
    order: ['document', 'incoming-referral', 'stamp-fit', 'stamp-unfit', 'manual'],
  };
}

function itemSize(state: DeskState, id: DeskItemId, x: number, held: boolean, manualOpen: boolean): Pick<Rect, 'w' | 'h'> {
  if (id === 'banknote' || id.startsWith('banknote-')) return ITEM_SIZES.banknote;
  if (id === 'incoming-referral') return held ? CARRIED_TRAY_DOCUMENT : TRAY_DOCUMENT;
  if (id.startsWith('clip-')) return desktopItemSize(id, state);
  if (id.startsWith('paper-')) return held ? CARRIED_ITEM_SIZES.document : x < RIGHT_DESK_X ? SMALL_DOCUMENT : desktopItemSize(id, state);
  if (held) return id === 'document' && state.documentCarrySize ? state.documentCarrySize : CARRIED_ITEM_SIZES[id];
  if (id === 'stamp-fit' || id === 'stamp-unfit') return RESTING_STAMP;
  if (id === 'manual' && manualOpen) return MANUAL_OPEN_SIZE;
  if (x < RIGHT_DESK_X) return id === 'document' ? SMALL_DOCUMENT : MANUAL_SHELF_SIZE;
  return ITEM_SIZES[id];
}

export function itemRect(state: DeskState, id: DeskItemId, documentInTray = false, held = false, manualOpen = false): Rect {
  if (id === 'incoming-referral' && !held) return { ...TRAY_DOCUMENT };
  const point = state.positions[id];
  return { ...point, ...itemSize(state, id, point.x, held, manualOpen) };
}

/** Shrink around the item's center; crossing the divider never resizes it again. */
export function pickUpDeskItem(state: DeskState, id: DeskItemId, documentInTray = false, manualOpen = false): DeskState {
  const origin = itemRect(state, id, documentInTray, false, manualOpen);
  const size = itemSize(state, id, origin.x, true, false);
  const pickedUp = id === 'document' ? { ...state, documentCarrySize: { ...size } } : state;
  const point = id === 'document' || id === 'incoming-referral' || id === 'manual' || id.startsWith('paper-')
    ? { x: origin.x + Math.floor(origin.w / 2) - Math.floor(size.w / 2),
      y: origin.y + Math.floor(origin.h / 2) - Math.floor(size.h / 2) }
    : origin;
  return raiseDeskItem(moveDeskItem(pickedUp, id, point, true), id);
}

/** Right-side papers may project over the room while keeping half on the desk. */
export function moveDeskItem(state: DeskState, id: DeskItemId, point: Point, held = false, manualOpen = false): DeskState {
  const previous = state.positions[id];
  const requestedX = Math.round(Number.isNaN(point.x) ? previous.x : point.x);
  const requestedY = Math.round(Number.isNaN(point.y) ? previous.y : point.y);
  const onLeft = requestedX < RIGHT_DESK_X && !(id === 'manual' && manualOpen);
  const size = itemSize(state, id, onLeft ? 0 : RIGHT_DESK_X, held, manualOpen);
  const paperOnRight = !onLeft && (id === 'document' || id.startsWith('paper-'));
  const top = paperOnRight ? RIGHT_DESK_TOP - Math.floor(size.h / 2)
    : id === 'manual' && manualOpen ? Math.min(DESK_BOUNDS.y, DESK_BOUNDS.y + DESK_BOUNDS.h - size.h) : DESK_BOUNDS.y;
  const bounds = held ? CARRY_BOUNDS : {
    x: onLeft ? DESK_BOUNDS.x : RIGHT_DESK_X + 5,
    y: top,
    w: onLeft ? LEFT_WIDTH - DESK_BOUNDS.x - 5 : 570 - RIGHT_DESK_X - 10,
    h: DESK_BOUNDS.y + DESK_BOUNDS.h - top,
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
