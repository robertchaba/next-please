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
GLYPHS['…'] = [...Array<string>(8).fill('00000'), '10101'];
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

/** Original seven-row document face: five-pixel capitals, four-pixel lowercase
 * and eight-pixel line advance. An accent row and a descender row remain distinct.
 * Narrow glyphs increase form density without fractional scaling. */
const DOCUMENT_CAPITALS: Record<string, string[]> = {
  A: ['0110', '1001', '1111', '1001', '1001'],
  B: ['1110', '1001', '1110', '1001', '1110'],
  C: ['0111', '1000', '1000', '1000', '0111'],
  D: ['1110', '1001', '1001', '1001', '1110'],
  E: ['1111', '1000', '1110', '1000', '1111'],
  F: ['1111', '1000', '1110', '1000', '1000'],
  G: ['0111', '1000', '1011', '1001', '0111'],
  H: ['1001', '1001', '1111', '1001', '1001'],
  I: ['111', '010', '010', '010', '111'],
  J: ['0011', '0001', '0001', '1001', '0110'],
  K: ['1001', '1010', '1100', '1010', '1001'],
  L: ['1000', '1000', '1000', '1000', '1111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['1001', '1101', '1011', '1001', '1001'],
  O: ['0110', '1001', '1001', '1001', '0110'],
  P: ['1110', '1001', '1110', '1000', '1000'],
  Q: ['0110', '1001', '1001', '1011', '0111'],
  R: ['1110', '1001', '1110', '1010', '1001'],
  S: ['0111', '1000', '0110', '0001', '1110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['1001', '1001', '1001', '1001', '0110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['1001', '1001', '0110', '1001', '1001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['1111', '0001', '0110', '1000', '1111'],
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['110', '001', '010', '100', '111'],
  '3': ['110', '001', '010', '001', '110'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '110', '001', '110'],
  '6': ['011', '100', '110', '101', '010'],
  '7': ['111', '001', '010', '010', '010'],
  '8': ['010', '101', '010', '101', '010'],
  '9': ['010', '101', '011', '001', '110'],
};
const DOCUMENT_GLYPHS: Record<string, string[]> = Object.fromEntries(
  Object.entries(DOCUMENT_CAPITALS).map(([letter, rows]) => {
    const empty = '0'.repeat(rows[0].length);
    return [letter, [empty, ...rows, empty]];
  }),
);
Object.assign(DOCUMENT_GLYPHS, {
  a: ['000', '000', '011', '101', '101', '011', '000'],
  b: ['000', '100', '110', '101', '101', '110', '000'],
  c: ['000', '000', '011', '100', '100', '011', '000'],
  d: ['000', '001', '011', '101', '101', '011', '000'],
  e: ['000', '000', '010', '111', '100', '011', '000'],
  f: ['000', '011', '100', '110', '100', '100', '000'],
  g: ['000', '000', '011', '101', '101', '011', '110'],
  h: ['000', '100', '110', '101', '101', '101', '000'],
  i: ['1', '0', '1', '1', '1', '1', '0'],
  j: ['001', '000', '001', '001', '001', '101', '010'],
  k: ['000', '100', '101', '110', '110', '101', '000'],
  l: ['00', '10', '10', '10', '10', '01', '00'],
  m: ['00000', '00000', '11010', '10101', '10101', '10101', '00000'],
  n: ['000', '000', '110', '101', '101', '101', '000'],
  o: ['000', '000', '010', '101', '101', '010', '000'],
  p: ['000', '000', '110', '101', '101', '110', '100'],
  q: ['000', '000', '011', '101', '101', '011', '001'],
  r: ['000', '000', '101', '110', '100', '100', '000'],
  s: ['000', '000', '011', '110', '001', '110', '000'],
  t: ['000', '010', '111', '010', '010', '001', '000'],
  u: ['000', '000', '101', '101', '101', '011', '000'],
  v: ['000', '000', '101', '101', '101', '010', '000'],
  w: ['00000', '00000', '10001', '10101', '10101', '01010', '00000'],
  x: ['000', '000', '101', '010', '010', '101', '000'],
  y: ['000', '000', '101', '101', '101', '011', '110'],
  z: ['000', '000', '111', '001', '100', '111', '000'],
  '.': ['0', '0', '0', '0', '0', '1', '0'],
  ',': ['00', '00', '00', '00', '00', '01', '10'],
  ':': ['0', '0', '1', '0', '1', '0', '0'],
  ';': ['00', '00', '01', '00', '01', '01', '10'],
  '-': ['000', '000', '000', '111', '000', '000', '000'],
  '/': ['000', '001', '001', '010', '100', '100', '000'],
  '!': ['0', '1', '1', '1', '0', '1', '0'],
  '?': ['000', '110', '001', '010', '000', '010', '000'],
});
for (const [letter, base] of Object.entries({ Ć: 'C', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', ć: 'c', ń: 'n', ó: 'o', ś: 's', ź: 'z' })) {
  const rows = DOCUMENT_GLYPHS[base];
  DOCUMENT_GLYPHS[letter] = ['0'.repeat(rows[0].length - 2) + '11', ...rows.slice(1)];
}
DOCUMENT_GLYPHS.Ż = ['0100', ...DOCUMENT_GLYPHS.Z.slice(1)];
DOCUMENT_GLYPHS.Ł = ['0000', '1000', '1010', '1100', '1000', '1111', '0000'];
DOCUMENT_GLYPHS.Ą = ['0000', '0110', '1001', '1111', '1001', '1001', '0011'];
DOCUMENT_GLYPHS.Ę = ['0000', '1111', '1000', '1110', '1000', '1111', '0011'];
DOCUMENT_GLYPHS.ż = ['010', ...DOCUMENT_GLYPHS.z.slice(1)];
DOCUMENT_GLYPHS.ł = ['000', '100', '101', '110', '100', '010', '000'];
DOCUMENT_GLYPHS.ą = ['000', '000', '011', '101', '101', '011', '001'];
DOCUMENT_GLYPHS.ę = ['000', '000', '010', '111', '100', '011', '001'];
DOCUMENT_GLYPHS['–'] = DOCUMENT_GLYPHS['-'];
DOCUMENT_GLYPHS['—'] = DOCUMENT_GLYPHS['-'];

function documentGlyph(character: string): string[] {
  return DOCUMENT_GLYPHS[character] ?? (GLYPHS[character] ?? GLYPHS['?']).slice(2);
}

function documentWidth(value: string): number {
  return Math.max(0, [...value].reduce((width, character) => width + (character === ' ' ? 3 : documentGlyph(character)[0].length + 1), 0) - 1);
}

export function measureDocumentText(value: string, _face?: DocumentFace | number): number {
  return Math.max(...value.normalize('NFC').replace(/\r\n?/g, '\n').split('\n').map(documentWidth));
}

export function drawDocumentText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, options: DocumentTextOptions = {}): void {
  ctx.save();
  ctx.fillStyle = options.color ?? '#282e24';
  for (const [lineIndex, line] of value.normalize('NFC').replace(/\r\n?/g, '\n').split('\n').entries()) {
    const width = documentWidth(line);
    const offset = options.align === 'center' ? width / 2 : options.align === 'right' ? width : 0;
    let cursorX = Math.round(x - offset);
    const cursorY = Math.round(y) + lineIndex * 8;
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

/** The original document glyphs and metrics from 0732752^ are shared by all
 * paperwork. These role names keep newer layouts compatible without introducing
 * alternate letterforms or changing the original renderer above. */
export type DocumentFace = 'print' | 'typewriter' | 'handwritten' | 'book';
export type DocumentTextOptions = Omit<TextOptions, 'scale'> & { face?: DocumentFace };
export type ReadingFace = 'typewriter' | 'handwritten';
export type ReadingTextOptions = Omit<TextOptions, 'scale'> & { face?: ReadingFace };
export const READ_CELL_HEIGHT = 7;
export const READ_LINE_HEIGHT = 8;
export const measureReadingText = measureDocumentText;
export const drawReadingText = drawDocumentText;

/** Heading roles also use the restored document alphabet. Retain the newer
 * layout's uppercase headings and whole-pixel enlargement for institutional marks. */
export type DocumentHeadingFace = 'serif' | 'sans';
export type DocumentHeadingOptions = TextOptions & { face?: DocumentHeadingFace };

export function measureDocumentHeading(value: string, _face: DocumentHeadingFace = 'serif', scale = 1): number {
  return measureDocumentText(normalize(value)) * integerScale(scale);
}

export function drawDocumentHeading(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, options: DocumentHeadingOptions = {}): void {
  const scale = integerScale(options.scale ?? 1);
  ctx.save();
  ctx.fillStyle = options.color ?? '#2e3329';
  for (const [index, line] of normalize(value).split('\n').entries()) {
    const width = documentWidth(line) * scale;
    const offset = options.align === 'center' ? width / 2 : options.align === 'right' ? width : 0;
    let cursorX = Math.round(x - offset);
    const cursorY = Math.round(y) + index * READ_LINE_HEIGHT * scale;
    for (const character of line) {
      if (character === ' ') { cursorX += 3 * scale; continue; }
      const rows = documentGlyph(character);
      for (let row = 0; row < rows.length; row++) for (let column = 0; column < rows[row].length; column++) {
        if (rows[row][column] === '1') ctx.fillRect(cursorX + column * scale, cursorY + row * scale, scale, scale);
      }
      cursorX += (rows[0].length + 1) * scale;
    }
  }
  ctx.restore();
}
