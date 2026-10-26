/** Generated local artwork, composited with deterministic pixel geometry.
 * Sources, exact prompts and preparation are documented in docs/art-direction.md.
 * Loading and simulation updates happen outside all drawing functions.
 */
import { CABINET_HOTSPOTS, DOCUMENT_RACK, ITEM_RESTS, ITEM_SIZES, LEFT_WIDTH, PATIENT_HANDOFF, RIGHT_DESK_X } from '../core/desk';
import { calendarText } from '../core/calendar';
import { PATIENTS } from '../core/patients';
import { type Locale } from '../i18n';
import { drawDocumentText, drawText } from './font';

const images = new Map<string, HTMLImageElement>();
const patientShadows = new Map<string, HTMLCanvasElement>();
let creatorPhotograph: { image: HTMLCanvasElement; shadow: HTMLCanvasElement } | undefined;
const introNames = ['scalpel', 'catheter', 'pen', 'stamp'] as const;
const spriteNames = ['stamp-fit', 'stamp-unfit', 'manual', 'plant', 'certificate', 'clock',
  ...new Set(PATIENTS.map(patient => patient.portraitId)), 'workstation-phone', 'workstation-clips', 'workstation-clip', 'workstation-rack', 'workstation-paper',
  'workstation-calendar', 'imprint-fit-pl', 'imprint-unfit-pl', 'imprint-fit-en', 'imprint-unfit-en', 'document-seal', 'document-seal-zus', 'document-seal-employer', 'document-signature', 'document-seal-chamber', 'document-seal-employer-unclear', 'banknote-100'] as const;
export const PATIENT_MOTION_FRAMES = 12;

export async function loadClinicArt(): Promise<void> {
  const files = ['bankruptcy-cloakroom', 'home-evening', 'homecoming', 'going-to-work', 'weekend-budget', 'weekend-modest', 'mountain-resort', 'seaside-resort', 'cabinet-workstation', 'archives-clinic', 'break-room', 'drawer-interior', 'creator-robert', ...introNames.map(name => `intro-${name}`), ...spriteNames.map(name => `sprites/${name}`)];
  await Promise.all(files.map(name => new Promise<void>((resolve, reject) => {
    const image = new Image();
    images.set(name, image);
    image.onload = () => {
      if (name === 'creator-robert') creatorPhotograph = prepareCreatorPhotograph(image);
      if (name.startsWith('sprites/patient-')) {
        const shadow = document.createElement('canvas');
        shadow.width = image.naturalWidth; shadow.height = image.naturalHeight;
        const shadowContext = shadow.getContext('2d')!;
        shadowContext.drawImage(image, 0, 0);
        shadowContext.globalCompositeOperation = 'source-in';
        shadowContext.fillStyle = '#131c17';
        shadowContext.fillRect(0, 0, shadow.width, shadow.height);
        patientShadows.set(name, shadow);
      }
      resolve();
    };
    image.onerror = () => reject(new Error(`Cannot load local artwork: ${name}`));
    image.src = `${import.meta.env.BASE_URL}assets/art/${name}.png`;
  })));
}

function asset(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, w: number, h: number): void {
  const image = images.get(name);
  if (image?.complete && image.naturalWidth) ctx.drawImage(image, Math.round(x), Math.round(y), w, h);
}
function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}
/** Bresenham lines keep the moving clock hands on integer pixels. */
function line(ctx: CanvasRenderingContext2D, x: number, y: number, endX: number, endY: number, color: string, size = 1): void {
  const dx = Math.abs(endX - x), dy = -Math.abs(endY - y);
  const sx = x < endX ? 1 : -1, sy = y < endY ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    rect(ctx, x, y, size, size, color);
    if (x === endX && y === endY) break;
    const twice = 2 * error;
    if (twice >= dy) { error += dy; x += sx; }
    if (twice <= dx) { error += dx; y += sy; }
  }
}

/** Prepare the slight tilt once on load; inverse sampling keeps every edge pixel crisp. */
function prepareCreatorPhotograph(portrait: HTMLImageElement): NonNullable<typeof creatorPhotograph> {
  const mount = document.createElement('canvas');
  mount.width = 110; mount.height = 140;
  const mountContext = mount.getContext('2d')!;
  mountContext.imageSmoothingEnabled = false;
  rect(mountContext, 0, 0, 110, 140, '#eee9d2');
  rect(mountContext, 0, 0, 110, 1, '#f8f3df');
  mountContext.drawImage(portrait, 5, 5, 100, 124);
  rect(mountContext, 5, 134, 100, 1, '#d5d1b9');

  const image = document.createElement('canvas');
  image.width = 120; image.height = 148;
  const context = image.getContext('2d')!;
  const source = mountContext.getImageData(0, 0, mount.width, mount.height);
  const tilted = context.createImageData(image.width, image.height);
  const angle = 4 * Math.PI / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    const dx = x + 0.5 - image.width / 2, dy = y + 0.5 - image.height / 2;
    const sx = Math.floor(dx * cos + dy * sin + mount.width / 2);
    const sy = Math.floor(-dx * sin + dy * cos + mount.height / 2);
    if (sx < 0 || sx >= mount.width || sy < 0 || sy >= mount.height) continue;
    const from = (sy * mount.width + sx) * 4;
    tilted.data.set(source.data.subarray(from, from + 4), (y * image.width + x) * 4);
  }
  context.putImageData(tilted, 0, 0);
  const shadow = document.createElement('canvas');
  shadow.width = image.width; shadow.height = image.height;
  const shadowContext = shadow.getContext('2d')!;
  shadowContext.drawImage(image, 0, 0);
  shadowContext.globalCompositeOperation = 'source-in';
  rect(shadowContext, 0, 0, shadow.width, shadow.height, '#62634e');
  return { image, shadow };
}

/** The clip crosses the sheet's top edge; its rear leg disappears behind the photo. */
export function drawCreatorPortrait(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  if (!creatorPhotograph) return;
  const clipX = x + 34, clipY = y - 8;
  const wire = (points: readonly (readonly [number, number])[], color: string, offset = 0, size = 1): void => {
    for (let i = 1; i < points.length; i++) {
      const [a, b] = points[i - 1], [c, d] = points[i];
      line(ctx, clipX + a + offset, clipY + b + offset, clipX + c + offset, clipY + d + offset, color, size);
    }
  };
  const rear = [[0, 23], [0, 4], [1, 2], [3, 0], [8, 0], [10, 2], [11, 4]] as const;
  const front = [[11, 4], [11, 27], [10, 29], [8, 31], [5, 31], [3, 29],
    [3, 9], [4, 7], [6, 6], [8, 8], [8, 24]] as const;
  wire(rear, '#42483e', 1);
  wire(rear, '#a1a79c');
  ctx.drawImage(creatorPhotograph.shadow, x + 3, y + 4);
  ctx.drawImage(creatorPhotograph.image, x, y);
  wire(front, '#42483e', 1, 2);
  wire(front, '#c2c6b9');
}

export type CabinetArtOptions = {
  patientId: number | null;
  lampOn: boolean;
  decoration: 'plant' | 'certificate';
  clockMinutes: number;
  patientMotion?: { patientId: number; direction: 'enter' | 'exit'; frame: number };
};

function wallClock(ctx: CanvasRenderingContext2D, clockMinutes: number): void {
  const x = 422, y = 27;
  asset(ctx, 'sprites/clock', x - 19, y - 19, 38, 38);
  const minuteAngle = clockMinutes % 60 * Math.PI / 30;
  const hourAngle = clockMinutes % 720 * Math.PI / 360;
  line(ctx, x, y, x + Math.round(Math.sin(hourAngle) * 7), y - Math.round(Math.cos(hourAngle) * 7), '#29291f', 2);
  line(ctx, x, y, x + Math.round(Math.sin(minuteAngle) * 12), y - Math.round(Math.cos(minuteAngle) * 12), '#29291f');
  rect(ctx, x, y, 2, 2, '#713d29');
}

function roomNumber(ctx: CanvasRenderingContext2D): void {
  const digits = ['0111010001', '1000110001', '1000110001', '1000111111', '1000100001', '1000100001', '0111000001'];
  digits.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === '1') rect(ctx, 174 + x + (x >= 5 ? 1 : 0), 20 + y, 1, 1, '#292f23');
  }));
}

/** Generated environment and portraits with only supplied simulation state. */
export function drawCabinet(ctx: CanvasRenderingContext2D, options: CabinetArtOptions): void {
  rect(ctx, 0, 0, 570, 320, '#171e18');
  asset(ctx, 'cabinet-workstation', 0, 0, 570, 320);
  roomNumber(ctx);
  wallClock(ctx, options.clockMinutes);
  const decoration = CABINET_HOTSPOTS.decoration;
  if (options.decoration === 'plant') asset(ctx, 'sprites/plant', decoration.x + 6, decoration.y, 45, 42);
  else asset(ctx, 'sprites/certificate', decoration.x + 11, decoration.y + 2, 36, 40);
  const motion = options.patientMotion;
  const lastFrame = PATIENT_MOTION_FRAMES - 1;
  const frame = motion ? Math.max(0, Math.min(lastFrame, Math.floor(motion.frame))) : lastFrame;
  // Entry reveals a nearby standing figure, then lowers it into the chair.
  // The face and width retain their native scale, with no perspective zoom.
  const progress = motion?.direction === 'exit' ? 1 - frame / lastFrame : frame / lastFrame;
  const patientId = motion?.patientId ?? options.patientId;
  if (patientId !== null && progress > 0) {
    const { x, y, w, h } = PATIENT_HANDOFF;
    const approach = Math.min(1, progress / 0.64);
    const lit = approach * approach * (3 - 2 * approach);
    const sitting = Math.max(0, (progress - 0.64) / 0.36);
    const settle = sitting * sitting * (3 - 2 * sitting);
    const left = x - Math.round(24 * (1 - lit));
    const top = y - 18 + Math.round(18 * settle);
    const name = `sprites/${PATIENTS[patientId]!.portraitId}`;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, LEFT_WIDTH, 128); ctx.clip();
    const drawPortrait = (source: HTMLImageElement | HTMLCanvasElement): void => {
      // Keep the head at native scale. The lower jacket/forearms reach the
      // desk throughout sitting, without a floating gap below the figure.
      const upper = 64;
      ctx.drawImage(source, 0, 0, w, upper, left, top, w, upper);
      ctx.drawImage(source, 0, upper, w, h - upper, left, top + upper, w, y + h - top - upper);
    };
    const portrait = images.get(name);
    if (portrait?.complete && portrait.naturalWidth) drawPortrait(portrait);
    const shadow = patientShadows.get(name);
    if (shadow && lit < 1) {
      ctx.globalAlpha = (1 - lit) * 0.98;
      drawPortrait(shadow);
    }
    ctx.restore();
  }
  // Extinguish the lamp's lens and dim only the room, keeping paperwork legible.
  if (!options.lampOn) {
    rect(ctx, 359, 35, 39, 3, '#343729');
    rect(ctx, 374, 38, 9, 2, '#343729');
    rect(ctx, 0, 0, LEFT_WIDTH, 128, '#111b1740');
    rect(ctx, RIGHT_DESK_X, 0, 570 - RIGHT_DESK_X, 128, '#111b1759');
  }
}

/** The physical holders stay visible while their tools are in hand. */
export function drawDeskRests(ctx: CanvasRenderingContext2D): void {
  for (const [id, rest] of Object.entries(ITEM_RESTS)) {
    if (!rest) continue;
    const { x, y, w, h } = rest;
    rect(ctx, x, y + h - 9, w, 9, '#171c15');
    rect(ctx, x + 1, y + h - 8, w - 2, 1, '#9c8455');
    rect(ctx, x + 2, y + h - 6, w - 4, 4, id === 'stamp-fit' ? '#43503a' : '#674032');
    rect(ctx, x, y + h - 8, 2, 6, '#6f5d3e');
    rect(ctx, x + w - 2, y + h - 8, 2, 6, '#6f5d3e');
  }
}

export function drawDeskItem(ctx: CanvasRenderingContext2D, kind: 'stamp-fit' | 'stamp-unfit' | 'manual', x: number, y: number, lifted = false,
  w = ITEM_SIZES[kind].w, h = ITEM_SIZES[kind].h): void {
  if (lifted) rect(ctx, x + 7, y + h - 4, w - 4, 5, '#11160fb3');
  asset(ctx, `sprites/${kind}`, x, y, w, h);
}

/** Generated transparent steel clip, shared by carried and attached paperwork. */
export function drawPaperclip(ctx: CanvasRenderingContext2D, x: number, y: number, _lifted = false): void {
  asset(ctx, 'sprites/workstation-clip', x, y, 10, 19);
}

/** Every illustrated object comes from a generated local bitmap. */
export function drawWorkstationObjects(ctx: CanvasRenderingContext2D, _drawerCount: number): void {
  for (const [name, bounds] of [
    ['phone', CABINET_HOTSPOTS.phone],
    ['clips', CABINET_HOTSPOTS.clipSupply], ['rack', DOCUMENT_RACK],
  ] as const) asset(ctx, `sprites/workstation-${name}`, bounds.x, bounds.y, bounds.w, bounds.h);
}

export function drawPaper(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  asset(ctx, 'sprites/workstation-paper', x, y, w, h);
}

export function drawDrawerInterior(ctx: CanvasRenderingContext2D): void {
  asset(ctx, 'drawer-interior', 0, 0, 570, 320);
}

/** Generated ink is already distressed and angled; no runtime randomness or rotation. */
export function drawDecisionImprint(ctx: CanvasRenderingContext2D, decision: 'fit' | 'unfit', locale: Locale,
  x: number, y: number, w = 116, h = 32): void {
  asset(ctx, `sprites/imprint-${decision}-${locale}`, x, y, w, h);
}

export function drawDocumentSeal(ctx: CanvasRenderingContext2D, x: number, y: number, size = 22, kind: 'clinic' | 'employer' | 'zus' | 'chamber' = 'clinic'): void {
  const name = kind === 'clinic' ? 'document-seal' : `document-seal-${kind}`;
  asset(ctx, `sprites/${name}`, x, y, kind === 'zus' ? Math.round(size * 1.5) : size, size);
}

export function drawDocumentSignature(ctx: CanvasRenderingContext2D, x: number, y: number, w = 46, h = 12): void {
  asset(ctx, 'sprites/document-signature', x, y, w, h);
}

export const CALENDAR_BOUNDS = { x: 349, y: 118, w: 48, h: 40 } as const;

/** All calendar lettering is derived from the saved day, never the real clock. */
export function drawDeskCalendar(ctx: CanvasRenderingContext2D, day: number, locale: Locale): void {
  const { x, y, w, h } = CALENDAR_BOUNDS, date = calendarText(day, locale);
  asset(ctx, 'sprites/workstation-calendar', x, y, w, h);
  // The compact paper face leaves margins below the binding and above the lower edge.
  drawDocumentText(ctx, date.monthShort, x + 22, y + 11, { color: '#3d3a31', align: 'center' });
  ctx.save();
  ctx.translate(x + 22, y + 18);
  ctx.scale(2, 2);
  drawDocumentText(ctx, date.day, 0, 0, { color: '#3d3a31', align: 'center' });
  ctx.restore();
}

export function drawIntroIllustration(ctx: CanvasRenderingContext2D, slide: number): void {
  rect(ctx, 0, 0, 570, 320, '#171e18');
  asset(ctx, `intro-${introNames[slide]}`, 0, 0, 570, 320);
}

/** Quiet left-hand space keeps localized panel controls separate from the art. */
export function drawPanelIllustration(ctx: CanvasRenderingContext2D, panel: 'saves' | 'break-room'): void {
  rect(ctx, 0, 0, 570, 320, '#171e18');
  asset(ctx, panel === 'saves' ? 'archives-clinic' : 'break-room', 0, 0, 570, 320);
}

export type HomeIllustration = 'bankruptcy-cloakroom' | 'home-evening' | 'homecoming' | 'going-to-work' | 'weekend-budget' | 'weekend-modest' | 'mountain-resort' | 'seaside-resort';

export function drawHomeIllustration(ctx: CanvasRenderingContext2D, scene: HomeIllustration): void {
  rect(ctx, 0, 0, 570, 320, '#171e18');
  asset(ctx, scene, 0, 0, 570, 320);
}

export function drawUnclearSeal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  asset(ctx, 'sprites/document-seal-employer-unclear', x, y, size, size);
}

export function drawBanknote(ctx: CanvasRenderingContext2D, x: number, y: number, w = 92, h = 42): void {
  asset(ctx, 'sprites/banknote-100', x, y, w, h);
}
