/**
 * Original bitmap lettering for Next, Please! No external font assets required.
 * A glyph occupies 5 × 9 native pixels; spaces occupy 3 × 9. The top two rows
 * are reserved for accents. Ordinary capitals occupy y + 2 through y + 8.
 * Ogoneks fit within the same nine-row cell. Glyph spacing is one pixel and
 * multiline text advances twelve pixels. All rendering uses integer pixels.
 */

export type TextOptions = {
  color?: string;
  scale?: number;
  align?: 'left' | 'center' | 'right';
};

const BASE_GLYPHS: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '11001', '10101', '10011', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00100', '01000'],
  ':': ['00000', '00110', '00110', '00000', '00110', '00110', '00000'],
  ';': ['00000', '00110', '00110', '00000', '00110', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '\\': ['10000', '01000', '01000', '00100', '00010', '00010', '00001'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '<': ['00010', '00100', '01000', '10000', '01000', '00100', '00010'],
  '>': ['01000', '00100', '00010', '00001', '00010', '00100', '01000'],
  '[': ['01110', '01000', '01000', '01000', '01000', '01000', '01110'],
  ']': ['01110', '00010', '00010', '00010', '00010', '00010', '01110'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '#': ['01010', '01010', '11111', '01010', '11111', '01010', '01010'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '"': ['01010', '01010', '10100', '00000', '00000', '00000', '00000'],
  '_': ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
  '|': ['00100', '00100', '00100', '00100', '00100', '00100', '00100'],
  '*': ['00000', '10101', '01110', '11111', '01110', '10101', '00000'],
  '@': ['01110', '10001', '10111', '10101', '10111', '10000', '01111'],
};

const GLYPHS: Record<string, string[]> = Object.fromEntries(
  Object.entries(BASE_GLYPHS).map(([letter, rows]) => [letter, ['00000', '00000', ...rows]]),
);

for (const [letter, base] of Object.entries({ Ć: 'C', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z' })) {
  GLYPHS[letter] = ['00010', '00100', ...BASE_GLYPHS[base]];
}
GLYPHS.Ż = ['00100', '00000', ...BASE_GLYPHS.Z];
GLYPHS.Ł = ['00000', '00000', '10000', '10000', '10100', '11000', '10000', '10000', '11111'];
GLYPHS.Ą = ['00000', '00000', '01110', '10001', '10001', '11111', '10001', '10010', '00011'];
GLYPHS.Ę = ['00000', '00000', '11111', '10000', '11110', '10000', '11111', '00010', '00011'];
GLYPHS['–'] = GLYPHS['-'];
GLYPHS['—'] = GLYPHS['-'];
GLYPHS['’'] = GLYPHS["'"];
GLYPHS['‘'] = GLYPHS["'"];
GLYPHS['“'] = GLYPHS['"'];
GLYPHS['”'] = GLYPHS['"'];
GLYPHS['„'] = ['00000', '00000', '00000', '00000', '00000', '00000', '01010', '01010', '10100'];

function integerScale(scale: number): number {
  return Number.isFinite(scale) ? Math.max(1, Math.floor(scale)) : 1;
}

function normalize(text: string): string {
  return text.normalize('NFC').toUpperCase().replace(/\r\n?/g, '\n');
}

function lineWidth(text: string): number {
  let width = 0;
  for (const character of text) width += character === ' ' ? 4 : 6;
  return Math.max(0, width - 1);
}

/** Returns the widest line's width, excluding trailing inter-glyph spacing. */
export function measureText(text: string, scale = 1): number {
  return Math.max(...normalize(text).split('\n').map(lineWidth)) * integerScale(scale);
}

/** Draws nine-pixel-tall glyph cells, with twelve-pixel line spacing. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: TextOptions = {},
): void {
  const scale = integerScale(options.scale ?? 1);
  const originY = Math.round(y);
  ctx.save();
  ctx.fillStyle = options.color ?? '#e9dfbd';

  for (const [lineIndex, line] of normalize(text).split('\n').entries()) {
    const width = lineWidth(line) * scale;
    const offset = options.align === 'center' ? width / 2 : options.align === 'right' ? width : 0;
    let cursorX = Math.round(x - offset);
    const cursorY = originY + lineIndex * 12 * scale;

    for (const character of line) {
      if (character !== ' ') {
        const rows = GLYPHS[character] ?? GLYPHS['?'];
        for (let row = 0; row < rows.length; row += 1) {
          for (let column = 0; column < rows[row].length; column += 1) {
            if (rows[row][column] === '1') {
              ctx.fillRect(cursorX + column * scale, cursorY + row * scale, scale, scale);
            }
          }
        }
      }
      cursorX += (character === ' ' ? 4 : 6) * scale;
    }
  }

  ctx.restore();
}

/** Original compact, mixed-case document lettering. It shares the title font's
 * capitals, but uses narrow lowercase glyphs, a five-pixel x-height, and an
 * eleven-pixel line advance. Accents and descenders remain inside nine rows. */
const DOCUMENT_GLYPHS: Record<string, string[]> = {
  a: ['0000', '0000', '0000', '0110', '0001', '0111', '1001', '0111', '0000'],
  b: ['0000', '1000', '1000', '1110', '1001', '1001', '1001', '1110', '0000'],
  c: ['0000', '0000', '0000', '0111', '1000', '1000', '1000', '0111', '0000'],
  d: ['0000', '0001', '0001', '0111', '1001', '1001', '1001', '0111', '0000'],
  e: ['0000', '0000', '0000', '0110', '1001', '1111', '1000', '0111', '0000'],
  f: ['000', '011', '100', '110', '100', '100', '100', '100', '000'],
  g: ['0000', '0000', '0000', '0111', '1001', '1001', '0111', '0001', '1110'],
  h: ['0000', '1000', '1000', '1110', '1001', '1001', '1001', '1001', '0000'],
  i: ['0', '1', '0', '1', '1', '1', '1', '1', '0'],
  j: ['000', '001', '000', '001', '001', '001', '001', '101', '010'],
  k: ['0000', '1000', '1000', '1001', '1010', '1100', '1010', '1001', '0000'],
  l: ['00', '10', '10', '10', '10', '10', '10', '01', '00'],
  m: ['00000', '00000', '00000', '11010', '10101', '10101', '10101', '10101', '00000'],
  n: ['0000', '0000', '0000', '1110', '1001', '1001', '1001', '1001', '0000'],
  o: ['0000', '0000', '0000', '0110', '1001', '1001', '1001', '0110', '0000'],
  p: ['0000', '0000', '0000', '1110', '1001', '1001', '1110', '1000', '1000'],
  q: ['0000', '0000', '0000', '0111', '1001', '1001', '0111', '0001', '0001'],
  r: ['000', '000', '000', '101', '110', '100', '100', '100', '000'],
  s: ['0000', '0000', '0000', '0111', '1000', '0110', '0001', '1110', '0000'],
  t: ['000', '010', '010', '111', '010', '010', '010', '001', '000'],
  u: ['0000', '0000', '0000', '1001', '1001', '1001', '1001', '0111', '0000'],
  v: ['00000', '00000', '00000', '10001', '10001', '10001', '01010', '00100', '00000'],
  w: ['00000', '00000', '00000', '10001', '10001', '10101', '10101', '01010', '00000'],
  x: ['0000', '0000', '0000', '1001', '1001', '0110', '1001', '1001', '0000'],
  y: ['0000', '0000', '0000', '1001', '1001', '1001', '0111', '0001', '1110'],
  z: ['0000', '0000', '0000', '1111', '0001', '0110', '1000', '1111', '0000'],
};
for (const [letter, base] of Object.entries({ ć: 'c', ń: 'n', ó: 'o', ś: 's', ź: 'z' })) {
  DOCUMENT_GLYPHS[letter] = ['0001', '0010', '0000', ...DOCUMENT_GLYPHS[base].slice(3)];
}
DOCUMENT_GLYPHS.ż = ['0010', '0000', '0000', ...DOCUMENT_GLYPHS.z.slice(3)];
DOCUMENT_GLYPHS.ł = ['000', '100', '100', '101', '110', '100', '100', '010', '000'];
DOCUMENT_GLYPHS.ą = ['0000', '0000', '0000', '0110', '0001', '0111', '1001', '0111', '0001'];
DOCUMENT_GLYPHS.ę = ['0000', '0000', '0000', '0110', '1001', '1111', '1000', '0111', '0010'];

function documentGlyph(character: string): string[] {
  return DOCUMENT_GLYPHS[character] ?? GLYPHS[character] ?? GLYPHS['?'];
}

function documentWidth(value: string): number {
  return Math.max(0, [...value].reduce((width, character) => width + (character === ' ' ? 3 : documentGlyph(character)[0].length + 1), 0) - 1);
}

export function measureDocumentText(value: string): number {
  return Math.max(...value.normalize('NFC').replace(/\r\n?/g, '\n').split('\n').map(documentWidth));
}

export function drawDocumentText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, options: Omit<TextOptions, 'scale'> = {}): void {
  ctx.save();
  ctx.fillStyle = options.color ?? '#282e24';
  for (const [lineIndex, line] of value.normalize('NFC').replace(/\r\n?/g, '\n').split('\n').entries()) {
    const width = documentWidth(line);
    const offset = options.align === 'center' ? width / 2 : options.align === 'right' ? width : 0;
    let cursorX = Math.round(x - offset);
    const cursorY = Math.round(y) + lineIndex * 11;
    for (const character of line) {
      if (character === ' ') { cursorX += 3; continue; }
      const rows = documentGlyph(character);
      for (let row = 0; row < rows.length; row += 1) {
        for (let column = 0; column < rows[row].length; column += 1) {
          if (rows[row][column] === '1') ctx.fillRect(cursorX + column, cursorY + row, 1, 1);
        }
      }
      cursorX += rows[0].length + 1;
    }
  }
  ctx.restore();
}
