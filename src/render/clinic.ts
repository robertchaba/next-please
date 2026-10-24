/** Generated local artwork, composited with deterministic pixel geometry.
 * Sources, exact prompts and preparation are documented in docs/art-direction.md.
 * Loading and simulation updates happen outside all drawing functions.
 */
import { CABINET_HOTSPOTS, ITEM_RESTS, ITEM_SIZES, LEFT_WIDTH, PATIENT_HANDOFF, RIGHT_DESK_X, type DeskItemId } from '../core/desk';

const images = new Map<string, HTMLImageElement>();
const patientShadows = new Map<string, HTMLCanvasElement>();
const introNames = ['scalpel', 'catheter', 'pen', 'stamp'] as const;
const spriteNames = ['stamp-fit', 'stamp-unfit', 'manual', 'plant', 'certificate', 'clock',
  'patient-0', 'patient-1', 'patient-2', 'paper'] as const;

export async function loadClinicArt(): Promise<void> {
  const files = ['cabinet-clinic', ...introNames.map(name => `intro-${name}`), ...spriteNames.map(name => `sprites/${name}`)];
  await Promise.all(files.map(name => new Promise<void>((resolve, reject) => {
    const image = new Image();
    images.set(name, image);
    image.onload = () => {
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
  const secondAngle = clockMinutes * 60 % 60 * Math.PI / 30;
  line(ctx, x, y, x + Math.round(Math.sin(secondAngle) * 14), y - Math.round(Math.cos(secondAngle) * 14), '#96563d');
  rect(ctx, x, y, 2, 2, '#713d29');
}

function roomNumber(ctx: CanvasRenderingContext2D): void {
  const digits = ['0111010001', '1000110001', '1000110001', '1000111111', '1000100001', '1000100001', '0111000001'];
  digits.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel === '1') rect(ctx, 91 + x + (x >= 5 ? 1 : 0), 36 + y, 1, 1, '#292f23');
  }));
}

/** Generated environment and portraits with only supplied simulation state. */
export function drawCabinet(ctx: CanvasRenderingContext2D, options: CabinetArtOptions): void {
  rect(ctx, 0, 0, 570, 320, '#171e18');
  const background = images.get('cabinet-clinic');
  if (background?.complete && background.naturalWidth) {
    // Recompose the original artwork; physical joinery stays six pixels wide.
    ctx.drawImage(background, 0, 0, 282, 320, 0, 0, LEFT_WIDTH, 320);
    ctx.drawImage(background, 282, 0, 6, 320, LEFT_WIDTH, 0, 6, 320);
    ctx.drawImage(background, 288, 0, 282, 320, RIGHT_DESK_X, 0, 570 - RIGHT_DESK_X, 320);
  }
  roomNumber(ctx);
  wallClock(ctx, options.clockMinutes);
  const decoration = CABINET_HOTSPOTS.decoration;
  if (options.decoration === 'plant') asset(ctx, 'sprites/plant', decoration.x + 6, decoration.y, 45, 42);
  else asset(ctx, 'sprites/certificate', decoration.x + 11, decoration.y + 2, 36, 40);
  const motion = options.patientMotion;
  const frame = motion ? Math.max(0, Math.min(5, Math.floor(motion.frame))) : 5;
  const pose = motion?.direction === 'exit' ? 5 - frame : frame;
  const patientId = motion?.patientId ?? options.patientId;
  if (patientId !== null) {
    const { x, y, w, h } = PATIENT_HANDOFF;
    const exposure = pose / 5;
    const name = `sprites/patient-${patientId}`;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 3, LEFT_WIDTH, 114); ctx.clip();
    // The portrait stays still: its shadow resolves into the lit face and back.
    ctx.globalAlpha = exposure === 0 ? 0 : 0.45 + exposure * 0.55;
    asset(ctx, name, x, y, w, h);
    const shadow = patientShadows.get(name);
    if (shadow && exposure < 1) {
      ctx.globalAlpha *= (1 - exposure) * 0.95;
      ctx.drawImage(shadow, x, y, w, h);
    }
    ctx.restore();
  }
  // Extinguish the lamp's lens and dim only the room, keeping paperwork legible.
  if (!options.lampOn) {
    rect(ctx, 113, 24, 58, 2, '#343729');
    rect(ctx, 0, 0, LEFT_WIDTH, 128, '#111b17a3');
    rect(ctx, RIGHT_DESK_X, 0, 570 - RIGHT_DESK_X, 128, '#111b1759');
  }
}

/** The physical holders stay visible while their tools are in hand. */
export function drawDeskRests(ctx: CanvasRenderingContext2D): void {
  for (const [id, rest] of Object.entries(ITEM_RESTS)) {
    const { x, y, w, h } = rest;
    rect(ctx, x, y + h - 9, w, 9, '#171c15');
    rect(ctx, x + 1, y + h - 8, w - 2, 1, '#9c8455');
    rect(ctx, x + 2, y + h - 6, w - 4, 4, id === 'stamp-fit' ? '#43503a' : '#674032');
    rect(ctx, x, y + h - 8, 2, 6, '#6f5d3e');
    rect(ctx, x + w - 2, y + h - 8, 2, 6, '#6f5d3e');
  }
}

export function drawDeskItem(ctx: CanvasRenderingContext2D, kind: Exclude<DeskItemId, 'document'>, x: number, y: number, lifted = false,
  w = ITEM_SIZES[kind].w, h = ITEM_SIZES[kind].h): void {
  if (lifted) rect(ctx, x + 7, y + h - 4, w - 4, 5, '#11160fb3');
  asset(ctx, `sprites/${kind}`, x, y, w, h);
}

export function drawPaper(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  rect(ctx, x, y, w, h, '#ded4ae');
  asset(ctx, 'sprites/paper', x, y, w, h);
}

export function drawIntroIllustration(ctx: CanvasRenderingContext2D, slide: number): void {
  rect(ctx, 0, 0, 570, 320, '#171e18');
  asset(ctx, `intro-${introNames[slide]}`, 0, 0, 570, 320);
}
