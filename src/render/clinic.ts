/**
 * Original, code-drawn clinic art. Every mark resolves to integer pixel rows;
 * the renderer reads state without creating time, randomness, or game state.
 * Text and interaction overlays belong to the scene that calls these functions.
 */

const INK = '#1b241f';
const DARK = '#303c30';
const OLIVE = '#626d4e';
const SAGE = '#87906b';
const PLASTER = '#a6a783';
const PAPER = '#ddd2ac';
const LIGHT = '#ece1bb';
const WOOD = '#67553c';
const WOOD_LIGHT = '#8a7350';
const RUST = '#995448';
const STEEL = '#a6b1a3';

type Point = readonly [number, number];

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function frame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  rect(ctx, x, y, w, 1, color);
  rect(ctx, x, y + h - 1, w, 1, color);
  rect(ctx, x, y, 1, h, color);
  rect(ctx, x + w - 1, y, 1, h, color);
}

/** Bresenham lines retain hard edges even for diagonal instrument silhouettes. */
function line(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, size = 1): void {
  let [x, y] = start;
  const [endX, endY] = end;
  const dx = Math.abs(endX - x);
  const dy = -Math.abs(endY - y);
  const sx = x < endX ? 1 : -1;
  const sy = y < endY ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    rect(ctx, x, y, size, size, color);
    if (x === endX && y === endY) break;
    const twiceError = 2 * error;
    if (twiceError >= dy) { error += dy; x += sx; }
    if (twiceError <= dx) { error += dx; y += sy; }
  }
}

/** Scanline polygons avoid Canvas antialiasing at the native pixel resolution. */
function polygon(ctx: CanvasRenderingContext2D, points: readonly Point[], color: string): void {
  const top = Math.min(...points.map((point) => point[1]));
  const bottom = Math.max(...points.map((point) => point[1]));
  for (let y = top; y < bottom; y += 1) {
    const intersections: number[] = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y + 0.5 && y2 > y + 0.5) || (y2 <= y + 0.5 && y1 > y + 0.5)) {
        intersections.push(x1 + (y + 0.5 - y1) * (x2 - x1) / (y2 - y1));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i + 1 < intersections.length; i += 2) {
      const left = Math.ceil(intersections[i]);
      const right = Math.ceil(intersections[i + 1]);
      rect(ctx, left, y, right - left, 1, color);
    }
  }
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string): void {
  for (let row = -radius; row <= radius; row += 1) {
    const halfWidth = Math.floor(Math.sqrt(radius * radius - row * row));
    rect(ctx, x - halfWidth, y + row, halfWidth * 2 + 1, 1, color);
  }
}

function screw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x, y, 3, 3, DARK);
  rect(ctx, x + 1, y, 1, 2, STEEL);
}

function paper(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  rect(ctx, x + 3, y + 3, w, h, INK);
  rect(ctx, x, y, w, h, PAPER);
  rect(ctx, x, y, w, 1, LIGHT);
  rect(ctx, x + w - 4, y + 3, 1, h - 6, '#c3b993');
}

function plant(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x + 17, y + 8, 2, 24, '#4b6140');
  polygon(ctx, [[x + 18, y + 13], [x + 8, y + 1], [x + 4, y + 2], [x + 7, y + 10]], '#425a3c');
  polygon(ctx, [[x + 18, y + 19], [x + 27, y + 4], [x + 35, y + 3], [x + 31, y + 12]], '#657a4c');
  polygon(ctx, [[x + 17, y + 26], [x + 5, y + 14], [x, y + 15], [x + 5, y + 24]], '#6b8052');
  polygon(ctx, [[x + 19, y + 29], [x + 28, y + 17], [x + 38, y + 18], [x + 32, y + 26]], '#435f3e');
  line(ctx, [x + 18, y + 20], [x + 30, y + 8], '#829464');
  line(ctx, [x + 15, y + 24], [x + 5, y + 18], '#879064');
  polygon(ctx, [[x + 6, y + 30], [x + 31, y + 30], [x + 27, y + 45], [x + 10, y + 45]], '#8a5943');
  rect(ctx, x + 6, y + 29, 25, 5, '#a57351');
  rect(ctx, x + 7, y + 29, 23, 1, '#c19c6b');
  rect(ctx, x + 11, y + 35, 2, 8, '#b38157');
  rect(ctx, x + 24, y + 35, 3, 8, '#6d4839');
}

function certificate(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  rect(ctx, x + 3, y + 3, 40, 44, '#76795c');
  rect(ctx, x, y, 40, 44, '#554d36');
  rect(ctx, x + 2, y + 2, 36, 40, WOOD_LIGHT);
  rect(ctx, x + 4, y + 4, 32, 36, PAPER);
  frame(ctx, x + 6, y + 6, 28, 32, '#a3996f');
  rect(ctx, x + 11, y + 11, 18, 2, '#8c8b67');
  for (let row = 0; row < 3; row += 1) rect(ctx, x + 11, y + 17 + row * 4, 18 - row * 2, 1, '#b1a67e');
  disc(ctx, x + 24, y + 31, 4, RUST);
  disc(ctx, x + 24, y + 31, 2, PAPER);
  rect(ctx, x + 11, y + 31, 6, 1, '#8c8b67');
}

function lamp(ctx: CanvasRenderingContext2D, on: boolean): void {
  rect(ctx, 176, 31, 3, 15, '#595f49');
  rect(ctx, 162, 44, 31, 6, INK);
  polygon(ctx, [[159, 47], [185, 47], [195, 58], [149, 58]], '#52634b');
  rect(ctx, 154, 57, 37, 3, '#252f26');
  rect(ctx, 158, 60, 29, 2, on ? LIGHT : '#767a60');
  rect(ctx, 161, 49, 21, 2, '#879071');
  rect(ctx, 188, 61, 1, 8, INK);
  rect(ctx, 187, 68, 3, 3, RUST);
}

function person(ctx: CanvasRenderingContext2D, patientId: number): void {
  const id = [1, 0, 2][((patientId % 3) + 3) % 3];
  const skin = ['#c19a74', '#d0a583', '#b18869'][id];
  const shadow = ['#927052', '#aa7c63', '#85624f'][id];
  const coat = ['#79745b', '#78665d', '#52646a'][id];
  const highlight = ['#989075', '#a18a77', '#788789'][id];
  polygon(ctx, [[92, 118], [108, 111], [131, 111], [149, 121], [155, 159], [85, 159]], INK);
  polygon(ctx, [[94, 119], [109, 113], [130, 113], [147, 122], [151, 156], [88, 156]], coat);
  polygon(ctx, [[109, 113], [118, 122], [128, 113], [133, 141], [107, 141]], '#bbb394');
  polygon(ctx, [[105, 114], [115, 123], [111, 133], [102, 121]], highlight);
  polygon(ctx, [[132, 114], [123, 123], [127, 133], [138, 121]], highlight);
  rect(ctx, 116, 105, 12, 13, shadow);
  rect(ctx, 119, 109, 9, 8, skin);
  rect(ctx, 95, 82, 7, 15, shadow);
  rect(ctx, 137, 82, 6, 15, shadow);
  polygon(ctx, [[103, 67], [131, 67], [140, 78], [138, 99], [130, 109], [111, 110], [101, 99], [99, 80]], shadow);
  polygon(ctx, [[106, 69], [129, 69], [136, 78], [135, 99], [128, 106], [113, 106], [104, 97], [103, 81]], skin);
  rect(ctx, 105, 85, 10, 2, '#5a4e3d');
  rect(ctx, 125, 85, 9, 2, '#5a4e3d');
  rect(ctx, 110, 88, 3, 2, INK);
  rect(ctx, 127, 88, 3, 2, INK);
  rect(ctx, 117, 88, 3, 8, shadow);
  rect(ctx, 119, 94, 5, 2, '#dab08a');
  rect(ctx, 114, 101, 14, 1, '#755445');
  rect(ctx, 117, 103, 8, 1, '#dbac87');
  if (id === 0) {
    polygon(ctx, [[100, 81], [98, 73], [104, 64], [129, 63], [139, 73], [138, 82], [131, 77], [127, 71], [109, 74]], '#5b5140');
    rect(ctx, 104, 67, 21, 3, '#81715a');
    rect(ctx, 114, 98, 14, 3, '#61503d');
    rect(ctx, 100, 79, 3, 13, '#61503d');
    rect(ctx, 135, 79, 3, 13, '#61503d');
    rect(ctx, 119, 124, 4, 28, '#4b4a39');
    rect(ctx, 119, 125, 4, 3, '#343f33');
  } else if (id === 1) {
    polygon(ctx, [[98, 97], [95, 78], [100, 65], [109, 60], [131, 62], [143, 73], [144, 98], [135, 106], [137, 82], [127, 72], [110, 80], [104, 79], [105, 101]], '#695b43');
    rect(ctx, 103, 68, 23, 3, '#8f7953');
    line(ctx, [132, 70], [139, 80], '#9b835a', 2);
    rect(ctx, 104, 96, 2, 4, '#e0c394');
    rect(ctx, 136, 96, 2, 4, '#e0c394');
    polygon(ctx, [[110, 115], [120, 122], [130, 115], [127, 130], [119, 135]], '#8b4840');
    rect(ctx, 116, 126, 4, 21, '#a5604c');
  } else {
    polygon(ctx, [[98, 81], [99, 71], [105, 63], [130, 63], [139, 71], [140, 84], [134, 80], [132, 71], [108, 73], [104, 83]], '#aaa792');
    rect(ctx, 106, 65, 20, 3, '#d0c8ad');
    frame(ctx, 104, 84, 13, 9, '#424c40');
    frame(ctx, 124, 84, 12, 9, '#424c40');
    rect(ctx, 117, 87, 7, 1, '#424c40');
    rect(ctx, 100, 86, 4, 1, '#424c40');
    rect(ctx, 108, 87, 4, 1, '#d9b48d');
    rect(ctx, 127, 87, 4, 1, '#d9b48d');
    rect(ctx, 117, 128, 2, 23, '#333f40');
    rect(ctx, 130, 136, 11, 1, '#9da494');
    rect(ctx, 133, 132, 2, 5, RUST);
  }
  line(ctx, [95, 128], [92, 148], highlight, 2);
  line(ctx, [143, 128], [147, 147], '#3e493e', 2);
  rect(ctx, 93, 149, 18, 9, shadow);
  rect(ctx, 95, 149, 16, 5, skin);
  rect(ctx, 132, 149, 16, 9, shadow);
  rect(ctx, 132, 149, 14, 5, skin);
  rect(ctx, 110, 156, 19, 12, '#494d3e');
  rect(ctx, 131, 157, 16, 11, '#494d3e');
}

export type CabinetArtOptions = {
  patientId: number | null;
  lampOn: boolean;
  decoration: 'plant' | 'certificate';
  clockMinutes: number;
  patientMotion?: { patientId: number; direction: 'enter' | 'exit'; frame: number };
};

/** The clock renders simulation time supplied by the state layer. */
function wallClock(ctx: CanvasRenderingContext2D, clockMinutes: number): void {
  const x = 455;
  const y = 31;
  disc(ctx, x + 2, y + 2, 18, '#657052');
  disc(ctx, x, y, 18, INK);
  disc(ctx, x, y, 16, '#989b7b');
  disc(ctx, x, y, 14, PAPER);
  for (let tick = 0; tick < 12; tick += 1) {
    const angle = tick * Math.PI / 6;
    const inner = tick % 3 === 0 ? 9 : 11;
    line(ctx,
      [x + Math.round(Math.sin(angle) * inner), y - Math.round(Math.cos(angle) * inner)],
      [x + Math.round(Math.sin(angle) * 12), y - Math.round(Math.cos(angle) * 12)],
      '#62684f');
  }
  const minuteAngle = clockMinutes % 60 * Math.PI / 30;
  const hourAngle = clockMinutes % 720 * Math.PI / 360;
  line(ctx, [x, y], [x + Math.round(Math.sin(hourAngle) * 7), y - Math.round(Math.cos(hourAngle) * 7)], INK, 2);
  line(ctx, [x, y], [x + Math.round(Math.sin(minuteAngle) * 10), y - Math.round(Math.cos(minuteAngle) * 10)], INK);
  rect(ctx, x - 1, y - 1, 3, 3, RUST);
}

/** The room number is enamel sign geometry, independent of interface fonts. */
function roomNumber(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 105, 24, 30, 21, '#666950');
  rect(ctx, 103, 22, 30, 21, '#b7b99b');
  frame(ctx, 104, 23, 28, 19, '#dad6b1');
  const zero = ['01110', '11011', '11011', '11011', '11011', '11011', '01110'];
  const four = ['10010', '10010', '10010', '11111', '00010', '00010', '00010'];
  for (const [digit, x] of [[zero, 109], [four, 120]] as const) {
    digit.forEach((row, y) => {
      [...row].forEach((pixel, col) => {
        if (pixel === '1') rect(ctx, x + col, 26 + y * 2, 1, 2, '#3c4939');
      });
    });
  }
  rect(ctx, 105, 31, 1, 2, '#69735a');
  rect(ctx, 130, 31, 1, 2, '#69735a');
}

/** Four physical areas: the visitor, examination wall, records and tool desk. */
export function drawCabinet(ctx: CanvasRenderingContext2D, options: CabinetArtOptions): void {
  ctx.save();
  rect(ctx, 0, 0, 570, 320, WOOD);
  // Quiet distant walls leave the waist-up patient as the main silhouette.
  rect(ctx, 0, 0, 282, 128, options.lampOn ? '#949b79' : '#79856b');
  rect(ctx, 288, 0, 282, 128, options.lampOn ? '#a8ac88' : '#8a977b');
  rect(ctx, 0, 0, 570, 5, '#626f55');
  rect(ctx, 0, 5, 570, 1, '#b5b694');
  for (const [x, y, w] of [[139, 15, 9], [15, 56, 4], [246, 45, 7], [373, 20, 10], [548, 76, 7]]) {
    rect(ctx, x, y, w, 1, '#8c9575');
  }
  // A narrow open doorway with light reaching from a distant corridor.
  rect(ctx, 19, 11, 76, 113, '#4c5947');
  rect(ctx, 22, 13, 70, 109, '#6e7e63');
  rect(ctx, 26, 17, 62, 101, '#475a49');
  rect(ctx, 29, 19, 56, 66, '#78866a');
  rect(ctx, 29, 67, 56, 18, '#5c7058');
  rect(ctx, 29, 66, 56, 2, '#8f9878');
  rect(ctx, 46, 26, 26, 58, '#4e604c');
  rect(ctx, 49, 29, 20, 55, '#3b503f');
  rect(ctx, 50, 30, 18, 32, '#64775d');
  rect(ctx, 34, 25, 7, 13, '#8b9879');
  polygon(ctx, [[29, 85], [85, 85], [88, 118], [26, 118]], '#5f6a51');
  line(ctx, [46, 85], [34, 117], '#7b8261');
  line(ctx, [69, 85], [81, 117], '#7b8261');
  rect(ctx, 28, 99, 57, 1, '#788064');
  const motion = options.patientMotion;
  const frameNumber = motion ? Math.max(0, Math.min(5, Math.floor(motion.frame))) : 5;
  const stage = motion?.direction === 'exit' ? 5 - frameNumber : frameNumber;
  const doorWidth = motion ? [13, 10, 8, 9, 11, 13][stage] : 13;
  polygon(ctx, [[24, 15], [24 + doorWidth, 22], [24 + doorWidth, 114], [24, 120]], '#7a8263');
  line(ctx, [25, 17], [25, 117], '#a1a586');
  line(ctx, [24 + doorWidth, 22], [24 + doorWidth, 113], '#3d4f3d', 2);
  rect(ctx, 24 + doorWidth - 4, 72, 2, 5, '#c1bfa0');
  rect(ctx, 19, 11, 4, 113, '#a2a789');
  rect(ctx, 92, 11, 4, 113, '#727f62');
  rect(ctx, 19, 10, 77, 4, '#a2a789');
  rect(ctx, 19, 10, 77, 1, '#b6b695');
  roomNumber(ctx);
  // The lamp can be switched; illumination is a deliberate block of color.
  if (options.lampOn) polygon(ctx, [[191, 29], [219, 29], [250, 115], [150, 115]], '#a1a580');
  ctx.save(); ctx.translate(30, -33); lamp(ctx, options.lampOn); ctx.restore();
  // Patient animation is six supplied poses; no time or state is created here.
  const patientId = motion?.patientId ?? options.patientId;
  if (patientId !== null) {
    const x = motion ? [58, 79, 105, 130, 154, 170][stage] : 170;
    const bob = motion ? [-2, 0, -2, 0, -1, 0][stage] : 0;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 6, 282, 119); ctx.clip();
    polygon(ctx, [[x - 25, 112], [x + 18, 109], [x + 38, 122], [x - 17, 125]], '#53614b');
    ctx.translate(x - 120, -42 + bob);
    person(ctx, patientId);
    ctx.restore();
  }
  // The edge of the doctor's desk hides the seated patient's lower half.
  rect(ctx, 0, 120, 282, 8, '#756347');
  rect(ctx, 0, 120, 282, 2, '#a18960');
  rect(ctx, 4, 124, 205, 1, '#64573d');
  // A small bell stays beside the patient, within its semantic hit area.
  rect(ctx, 240, 116, 32, 6, '#303b2e');
  rect(ctx, 242, 113, 28, 6, '#68735a');
  disc(ctx, 256, 110, 11, '#aaa985');
  rect(ctx, 245, 110, 23, 5, '#c0b994');
  rect(ctx, 249, 101, 6, 2, '#e3d0a2');
  rect(ctx, 254, 96, 4, 5, '#9aa286');
  rect(ctx, 252, 94, 8, 3, '#d3c9a4');
  // Examination wall, with just enough tile seams to establish the material.
  rect(ctx, 288, 71, 282, 57, '#77896b');
  rect(ctx, 288, 70, 282, 3, '#4e674e');
  rect(ctx, 288, 73, 282, 1, '#a3ae8a');
  for (let y = 92; y < 128; y += 19) {
    rect(ctx, 288, y, 282, 1, '#62795b');
    for (let x = 289 + (y === 92 ? 0 : 17); x < 570; x += 35) rect(ctx, x, y - 18, 1, 18, '#62795b');
  }
  // Eye-chart lettering is supplied by the scene, on this physical sheet.
  rect(ctx, 310, 22, 47, 64, '#6c7959');
  rect(ctx, 308, 20, 47, 64, '#5e5841');
  rect(ctx, 310, 22, 43, 60, '#e0d7b0');
  rect(ctx, 311, 23, 41, 1, LIGHT);
  screw(ctx, 309, 21); screw(ctx, 351, 21);
  wallClock(ctx, options.clockMinutes);
  // One familiar decoration on a wall shelf.
  rect(ctx, 501, 66, 51, 4, '#5c6247');
  rect(ctx, 501, 66, 51, 1, '#aaa47d');
  if (options.decoration === 'plant') plant(ctx, 507, 20);
  else certificate(ctx, 506, 20);
  // Cuff and analog dial in an enamel tray. No explanatory labels.
  rect(ctx, 383, 118, 73, 4, '#344d3c');
  rect(ctx, 384, 80, 71, 40, '#5a735b');
  rect(ctx, 385, 81, 69, 1, '#a0ad8c');
  rect(ctx, 387, 102, 25, 15, '#303d33');
  rect(ctx, 389, 104, 21, 2, '#60735b');
  disc(ctx, 426, 96, 12, '#2b4133');
  disc(ctx, 426, 96, 10, '#b8bca0');
  disc(ctx, 426, 96, 8, '#e0d5af');
  line(ctx, [426, 96], [430, 90], '#293a2d');
  for (const [x, y] of [[426, 88], [419, 96], [433, 96]]) rect(ctx, x, y, 1, 2, '#7a866b');
  line(ctx, [429, 107], [437, 115], '#243b2d', 2);
  line(ctx, [437, 115], [449, 108], '#243b2d', 2);
  disc(ctx, 449, 107, 4, '#293e30');
  // The distant couch is reduced to a quiet upholstered silhouette.
  rect(ctx, 475, 106, 94, 7, '#3a5340');
  rect(ctx, 475, 104, 77, 4, '#a2ad8c');
  polygon(ctx, [[547, 106], [557, 92], [569, 92], [569, 106]], '#8c9e7e');
  line(ctx, [557, 92], [569, 92], '#b2b99a');
  rect(ctx, 480, 113, 3, 15, '#a1ae96');
  rect(ctx, 563, 113, 3, 15, '#a1ae96');
  // Lower two work surfaces are larger than the room views above them.
  rect(ctx, 0, 138, 282, 182, '#6c583e');
  rect(ctx, 288, 138, 282, 182, '#766044');
  for (let y = 147; y < 320; y += 19) {
    rect(ctx, 0, y, 282, 1, '#755f42');
    rect(ctx, 288, y, 282, 1, '#81694a');
    rect(ctx, 15 + y % 37, y + 3, 21, 1, '#594d37');
    rect(ctx, 467 + y % 41, y + 6, 32, 1, '#68553c');
  }
  // Empty correspondence tray; the scene supplies its draggable documents.
  rect(ctx, 9, 163, 65, 126, '#322f24');
  rect(ctx, 12, 166, 59, 119, '#5d5a40');
  rect(ctx, 14, 168, 55, 115, '#4d503a');
  rect(ctx, 9, 163, 3, 125, '#a58d61');
  rect(ctx, 71, 163, 3, 125, '#494632');
  rect(ctx, 9, 282, 65, 7, '#9b8158');
  rect(ctx, 10, 282, 63, 1, '#c1a377');
  screw(ctx, 13, 284); screw(ctx, 67, 284);
  // The broad blotter gives the certificate most of the paperwork quadrant.
  rect(ctx, 82, 151, 194, 159, '#2d3e30');
  rect(ctx, 84, 153, 190, 155, '#4d654b');
  frame(ctx, 87, 156, 184, 149, '#687e59');
  rect(ctx, 83, 308, 192, 2, '#283b2b');
  // A few scratches imply use while leaving movable tools easy to read.
  line(ctx, [423, 285], [443, 281], '#624f36');
  line(ctx, [429, 288], [438, 286], '#8b7150');
  rect(ctx, 311, 303, 29, 1, '#65513a');
  // Solid joinery makes all four parts legible without panel captions.
  rect(ctx, 0, 128, 570, 10, '#302d23');
  rect(ctx, 0, 129, 570, 5, '#9c8058');
  rect(ctx, 0, 129, 570, 1, '#b49a70');
  rect(ctx, 0, 134, 570, 2, '#634e34');
  rect(ctx, 282, 0, 6, 320, '#292f25');
  rect(ctx, 283, 0, 3, 320, '#7f7958');
  rect(ctx, 283, 0, 1, 320, '#a0a080');
  rect(ctx, 285, 138, 1, 182, '#554a32');
  ctx.restore();
}

/** Original movable desk sprites. Bounds match their DOM/keyboard hit areas. */
export function drawDeskItem(
  ctx: CanvasRenderingContext2D,
  kind: 'stamp-fit' | 'stamp-unfit' | 'manual' | 'cup' | 'pencil',
  x: number,
  y: number,
  lifted = false,
): void {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  const shadow = lifted ? '#493f2f' : '#3d392b';
  if (kind === 'stamp-fit' || kind === 'stamp-unfit') {
    const fit = kind === 'stamp-fit';
    rect(ctx, 3, 42, 43, 6, shadow);
    rect(ctx, 3, 35, 42, 10, '#252f25');
    rect(ctx, 5, 34, 38, 8, fit ? '#65795d' : '#9d5144');
    rect(ctx, 7, 35, 34, 1, fit ? '#9cac7c' : '#ca8060');
    rect(ctx, 5, 28, 38, 9, '#493b2b');
    rect(ctx, 4, 27, 40, 7, '#a17d50');
    rect(ctx, 6, 27, 36, 2, '#c5a16a');
    rect(ctx, 18, 15, 11, 14, '#77583b');
    rect(ctx, 19, 15, 3, 11, '#af8656');
    disc(ctx, 24, 12, 10, '#493c2c');
    disc(ctx, 23, 10, 9, '#8d6844');
    rect(ctx, 19, 4, 8, 2, '#b89765');
    if (fit) {
      line(ctx, [18, 38], [21, 41], '#d7d3a7');
      line(ctx, [21, 41], [28, 36], '#d7d3a7');
    } else {
      line(ctx, [20, 36], [26, 41], '#ead0a3');
      line(ctx, [26, 36], [20, 41], '#ead0a3');
    }
  } else if (kind === 'manual') {
    rect(ctx, 3, 7, 97, 35, shadow);
    rect(ctx, 0, 3, 97, 36, '#2c4033');
    rect(ctx, 3, 5, 93, 32, '#c4bd97');
    rect(ctx, 4, 32, 91, 1, '#918e6c');
    rect(ctx, 4, 35, 91, 1, '#e2d3a8');
    rect(ctx, 0, 0, 97, 32, '#597057');
    rect(ctx, 1, 0, 95, 1, '#829473');
    rect(ctx, 2, 1, 5, 32, '#304b38');
    rect(ctx, 7, 2, 1, 28, '#718966');
    frame(ctx, 13, 5, 75, 22, '#859372');
    frame(ctx, 15, 7, 71, 18, '#475f48');
    // Embossed geometric emblem, never an unreadable title substitute.
    frame(ctx, 45, 10, 10, 12, '#9fa47c');
    rect(ctx, 49, 12, 2, 8, '#a9ad84');
    rect(ctx, 47, 15, 6, 2, '#a9ad84');
    rect(ctx, 80, 28, 6, 11, RUST);
  } else if (kind === 'cup') {
    rect(ctx, 3, 31, 29, 6, shadow);
    frame(ctx, 24, 13, 10, 15, '#c7c09b');
    frame(ctx, 26, 15, 6, 11, '#a4ab8b');
    rect(ctx, 3, 11, 23, 20, '#b5b795');
    polygon(ctx, [[3, 30], [26, 30], [23, 36], [7, 36]], '#9ea786');
    disc(ctx, 14, 11, 11, '#e1d4ac');
    disc(ctx, 14, 11, 8, '#594c35');
    rect(ctx, 8, 5, 9, 1, '#83704d');
    rect(ctx, 5, 16, 2, 13, '#dfd2ac');
    rect(ctx, 22, 16, 2, 13, '#8c9c7e');
  } else {
    rect(ctx, 7, 6, 4, 59, shadow);
    rect(ctx, 4, 5, 4, 52, '#b49852');
    rect(ctx, 4, 6, 1, 50, '#e4cb80');
    rect(ctx, 7, 7, 1, 49, '#765f3b');
    rect(ctx, 4, 2, 4, 6, RUST);
    rect(ctx, 4, 7, 4, 3, '#aaa993');
    rect(ctx, 4, 8, 4, 1, '#dad0ac');
    polygon(ctx, [[4, 57], [8, 57], [6, 65]], '#cfb791');
    rect(ctx, 6, 63, 1, 3, INK);
  }
  ctx.restore();
}

function illustrationBackdrop(ctx: CanvasRenderingContext2D): void {
  // Light falls on the instrument, without an enclosing interface frame.
  disc(ctx, 132, 142, 91, '#2f3e31');
  disc(ctx, 132, 142, 79, '#3b4c38');
  disc(ctx, 132, 142, 70, '#46573f');
  for (const [x, y, w] of [[31, 245, 108], [91, 250, 121], [42, 253, 57]]) rect(ctx, x, y, w, 1, '#3b4633');
}

/** Four original instruments; the narration stays separately localized. */
export function drawIntroIllustration(ctx: CanvasRenderingContext2D, slide: number): void {
  ctx.save();
  illustrationBackdrop(ctx);
  if (slide === 0) {
    // A clean scalpel, displayed like an institutional equipment illustration.
    rect(ctx, 60, 199, 140, 6, '#344634');
    polygon(ctx, [[63, 189], [76, 196], [160, 108], [150, 97]], INK);
    polygon(ctx, [[65, 188], [75, 192], [154, 107], [148, 103]], '#7d897a');
    line(ctx, [69, 188], [150, 105], '#bac0a6', 2);
    for (let step = 0; step < 9; step += 1) line(ctx, [79 + step * 5, 179 - step * 5], [82 + step * 5, 182 - step * 5], '#475947');
    polygon(ctx, [[148, 104], [160, 112], [187, 82], [193, 65], [177, 71]], '#b9c3b0');
    polygon(ctx, [[157, 106], [163, 107], [188, 79], [191, 68]], '#e3e3c5');
    line(ctx, [149, 102], [180, 72], '#647768');
    rect(ctx, 51, 205, 159, 5, '#8e9677');
    rect(ctx, 51, 204, 159, 1, '#b4b99a');
    rect(ctx, 57, 210, 147, 3, '#3e503e');
  } else if (slide === 1) {
    // Soft tubing and its sealed reservoir: ordinary equipment, no bodily detail.
    rect(ctx, 157, 74, 3, 29, '#b4b99e');
    line(ctx, [157, 75], [171, 75], '#c4c8ac', 2);
    rect(ctx, 168, 75, 3, 129, '#9da58a');
    rect(ctx, 153, 204, 35, 3, '#8d9b83');
    rect(ctx, 142, 99, 34, 54, INK);
    rect(ctx, 144, 101, 30, 49, '#b3b9a0');
    rect(ctx, 147, 106, 24, 40, '#c9cbb0');
    rect(ctx, 147, 125, 24, 21, '#aaa66f');
    rect(ctx, 149, 107, 2, 37, '#e0dbb6');
    rect(ctx, 154, 95, 9, 8, '#b5b99b');
    rect(ctx, 156, 152, 5, 10, '#d3c18c');
    for (let y = 113; y <= 139; y += 8) rect(ctx, 165, y, 5, 1, '#888e72');
    const tube: Point[] = [[158, 158], [158, 177], [151, 187], [112, 187], [101, 179], [101, 131], [91, 123], [77, 123], [68, 133], [68, 174], [77, 184]];
    for (let i = 0; i < tube.length - 1; i += 1) {
      line(ctx, tube[i], tube[i + 1], '#343f2d', 5);
      line(ctx, [tube[i][0] + 1, tube[i][1]], [tube[i + 1][0] + 1, tube[i + 1][1]], '#c0b082', 3);
    }
    rect(ctx, 74, 180, 7, 12, '#dad1a9');
    rect(ctx, 73, 190, 9, 4, '#7f9a88');
    rect(ctx, 58, 207, 142, 4, '#314431');
  } else if (slide === 2) {
    paper(ctx, 65, 152, 123, 57);
    for (let i = 0; i < 5; i += 1) rect(ctx, 76, 164 + i * 7, 76 - i * 9, 1, '#b6ab80');
    polygon(ctx, [[89, 187], [106, 181], [183, 90], [179, 80], [170, 78], [95, 169]], '#172d25');
    polygon(ctx, [[103, 174], [110, 178], [178, 96], [172, 91]], '#355547');
    line(ctx, [107, 171], [173, 93], '#668169', 2);
    polygon(ctx, [[92, 169], [106, 181], [82, 197]], '#d4b878');
    polygon(ctx, [[87, 187], [92, 178], [99, 183], [82, 197]], '#f0d599');
    line(ctx, [83, 195], [97, 180], '#3e4d35');
    disc(ctx, 96, 181, 2, '#526246');
    line(ctx, [160, 105], [167, 111], '#c4ad74', 3);
    line(ctx, [172, 90], [157, 108], '#d3ba7c', 2);
    rect(ctx, 175, 80, 5, 2, '#d3ba7c');
    rect(ctx, 71, 200, 33, 1, '#71694d');
  } else if (slide === 3) {
    for (const [a, b] of [
      [[67, 91], [81, 110]], [[130, 75], [130, 96]], [[192, 91], [178, 110]],
      [[53, 140], [77, 140]], [[185, 140], [208, 140]],
    ] as readonly (readonly [Point, Point])[]) line(ctx, a, b, '#ada66e', 2);
    paper(ctx, 63, 183, 136, 29);
    frame(ctx, 80, 192, 57, 12, '#a66c56');
    rect(ctx, 85, 196, 47, 2, '#ba9271');
    rect(ctx, 85, 200, 30, 1, '#ba9271');
    rect(ctx, 86, 174, 91, 9, INK);
    rect(ctx, 84, 158, 95, 17, '#5b342c');
    rect(ctx, 88, 155, 87, 17, RUST);
    rect(ctx, 90, 156, 83, 3, '#c58460');
    rect(ctx, 89, 169, 85, 3, '#743d34');
    rect(ctx, 115, 133, 31, 23, '#3b3427');
    rect(ctx, 119, 128, 23, 28, '#766041');
    rect(ctx, 121, 128, 5, 25, '#a18758');
    polygon(ctx, [[109, 109], [117, 102], [143, 102], [153, 110], [151, 128], [144, 136], [117, 136], [109, 126]], INK);
    polygon(ctx, [[112, 110], [119, 105], [142, 105], [149, 111], [147, 125], [141, 130], [119, 130], [113, 124]], '#826546');
    rect(ctx, 118, 108, 24, 4, '#af8d5f');
    rect(ctx, 116, 113, 5, 8, '#a48156');
    rect(ctx, 141, 114, 6, 10, '#5e4b32');
    rect(ctx, 95, 177, 71, 2, '#9c8b68');
  }
  ctx.restore();
}
