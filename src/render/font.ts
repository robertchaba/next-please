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

/** Headline faces are separate from the compact seven-row form lettering.
 * The heavier serif face reads as letterpress; narrow sans capitals suit service
 * mastheads. Both have seven-pixel capitals, two accent rows, and 11px leading.
 * Only integer enlargement is supported; body fields retain their old metrics. */
export type DocumentHeadingFace = 'serif' | 'sans';
export type DocumentHeadingOptions = TextOptions & { face?: DocumentHeadingFace };

const HEADING_SERIF: Record<string, string[]> = {
  A: ['00100', '01110', '11011', '11011', '11111', '11011', '11011'],
  B: ['11110', '11001', '11001', '11110', '11001', '11001', '11110'],
  C: ['01111', '11001', '11000', '11000', '11000', '11001', '01110'],
  D: ['11110', '11001', '11001', '11001', '11001', '11001', '11110'],
  E: ['11111', '11001', '11000', '11110', '11000', '11001', '11111'],
  F: ['11111', '11001', '11000', '11110', '11000', '11000', '11100'],
  G: ['01111', '11001', '11000', '11011', '11001', '11001', '01111'],
  H: ['11011', '11011', '11011', '11111', '11011', '11011', '11011'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '11010', '11010', '01100'],
  K: ['11011', '11010', '11100', '11100', '11010', '11001', '11011'],
  L: ['11100', '11000', '11000', '11000', '11000', '11001', '11111'],
  M: ['1100011', '1110111', '1101011', '1101011', '1100011', '1100011', '1100011'],
  N: ['11001', '11101', '11101', '11011', '11011', '11001', '11001'],
  O: ['01110', '11001', '11001', '11001', '11001', '11001', '01110'],
  P: ['11110', '11001', '11001', '11110', '11000', '11000', '11100'],
  Q: ['01110', '11001', '11001', '11001', '11011', '11010', '01101'],
  R: ['11110', '11001', '11001', '11110', '11010', '11001', '11011'],
  S: ['01111', '11001', '11000', '01110', '00011', '10011', '11110'],
  T: ['11111', '10101', '00100', '00100', '00100', '00100', '01110'],
  U: ['11011', '11001', '11001', '11001', '11001', '11001', '01110'],
  V: ['11011', '11011', '11011', '01010', '01010', '00100', '00100'],
  W: ['1100011', '1100011', '1100011', '1101011', '1101011', '0110110', '0100010'],
  X: ['11011', '11011', '01010', '00100', '01010', '11011', '11011'],
  Y: ['11011', '11011', '01010', '00100', '00100', '00100', '01110'],
  Z: ['11111', '10011', '00010', '00100', '01000', '11001', '11111'],
};

const HEADING_SANS: Record<string, string[]> = {
  A: ['0110', '1001', '1001', '1001', '1111', '1001', '1001'],
  B: ['1110', '1001', '1001', '1110', '1001', '1001', '1110'],
  C: ['0111', '1000', '1000', '1000', '1000', '1000', '0111'],
  D: ['1110', '1001', '1001', '1001', '1001', '1001', '1110'],
  E: ['1111', '1000', '1000', '1110', '1000', '1000', '1111'],
  F: ['1111', '1000', '1000', '1110', '1000', '1000', '1000'],
  G: ['0111', '1000', '1000', '1011', '1001', '1001', '0111'],
  H: ['1001', '1001', '1001', '1111', '1001', '1001', '1001'],
  I: ['1', '1', '1', '1', '1', '1', '1'],
  J: ['0001', '0001', '0001', '0001', '1001', '1001', '0110'],
  K: ['1001', '1001', '1010', '1100', '1010', '1001', '1001'],
  L: ['1000', '1000', '1000', '1000', '1000', '1000', '1111'],
  M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
  N: ['1001', '1001', '1101', '1011', '1001', '1001', '1001'],
  O: ['0110', '1001', '1001', '1001', '1001', '1001', '0110'],
  P: ['1110', '1001', '1001', '1110', '1000', '1000', '1000'],
  Q: ['0110', '1001', '1001', '1001', '1001', '1011', '0111'],
  R: ['1110', '1001', '1001', '1110', '1010', '1001', '1001'],
  S: ['0111', '1000', '1000', '0110', '0001', '0001', '1110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['1001', '1001', '1001', '1001', '1001', '1001', '0110'],
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['1001', '1001', '1001', '0110', '1001', '1001', '1001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['1111', '0001', '0010', '0010', '0100', '1000', '1111'],
};

function makeHeadingFace(body: Record<string, string[]>): Record<string, string[]> {
  const glyphs = { ...GLYPHS };
  for (const [letter, rows] of Object.entries(body)) {
    const blank = '0'.repeat(rows[0].length);
    glyphs[letter] = [blank, blank, ...rows];
  }
  for (const [accented, plain] of Object.entries({ Ć: 'C', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z' })) {
    const rows = glyphs[plain], width = rows[0].length;
    glyphs[accented] = ['0'.repeat(width - 2) + '10', '0'.repeat(width - 3) + '100', ...rows.slice(2)];
  }
  const dot = '0'.repeat(glyphs.Z[0].length - 3) + '010';
  glyphs.Ż = [dot, glyphs.Z[1], ...glyphs.Z.slice(2)];
  const width = glyphs.L[0].length;
  glyphs.Ł = glyphs.L.map((row, y) => y === 4 || y === 5
    ? [...row].map((pixel, x) => x === width - (y === 4 ? 2 : 3) ? '1' : pixel).join('') : row);
  for (const [accented, plain] of Object.entries({ Ą: 'A', Ę: 'E' })) {
    const rows = glyphs[plain], width = rows[0].length;
    glyphs[accented] = [...rows.slice(0, 7), rows[8], '0'.repeat(width - 2) + '11'];
  }
  return glyphs;
}

const HEADING_FACES: Record<DocumentHeadingFace, Record<string, string[]>> = {
  serif: makeHeadingFace(HEADING_SERIF), sans: makeHeadingFace(HEADING_SANS),
};

function headingWidth(text: string, face: DocumentHeadingFace): number {
  const glyphs = HEADING_FACES[face];
  return Math.max(0, [...text].reduce((sum, character) => sum + (character === ' ' ? 4 : (glyphs[character] ?? glyphs['?'])[0].length + 1), 0) - 1);
}

export function measureDocumentHeading(text: string, face: DocumentHeadingFace = 'serif', scale = 1): number {
  return Math.max(...normalize(text).split('\n').map(line => headingWidth(line, face))) * integerScale(scale);
}

export function drawDocumentHeading(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: DocumentHeadingOptions = {}): void {
  const face = options.face ?? 'serif', scale = integerScale(options.scale ?? 1), glyphs = HEADING_FACES[face];
  ctx.save();
  ctx.fillStyle = options.color ?? '#2e3329';
  for (const [index, line] of normalize(text).split('\n').entries()) {
    const width = headingWidth(line, face) * scale;
    const offset = options.align === 'center' ? width / 2 : options.align === 'right' ? width : 0;
    let cursor = Math.round(x - offset);
    const top = Math.round(y) + index * 11 * scale;
    for (const character of line) {
      if (character === ' ') { cursor += 4 * scale; continue; }
      const rows = glyphs[character] ?? glyphs['?'];
      rows.forEach((row, dy) => [...row].forEach((pixel, dx) => {
        if (pixel === '1') ctx.fillRect(cursor + dx * scale, top + dy * scale, scale, scale);
      }));
      cursor += (rows[0].length + 1) * scale;
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

/** Original faces share advances, seven-row cells and eight-pixel leading.
 * A form can mix printed labels, typed entries and handwriting without moving
 * its fields. These are local glyph designs, not browser font substitutions. */
export type DocumentFace = 'print' | 'typewriter' | 'handwritten' | 'book';
export type DocumentTextOptions = Omit<TextOptions, 'scale'> & { face?: DocumentFace };

const TYPEWRITER_LETTERS: Record<string, string[]> = {
  A: ['0110', '1001', '1111', '1001', '1001'],
  C: ['0111', '1001', '1000', '1001', '0111'],
  E: ['1111', '1001', '1110', '1001', '1111'],
  F: ['1111', '1001', '1110', '1000', '1100'],
  G: ['0111', '1001', '1000', '1011', '0111'],
  J: ['0111', '0010', '0010', '1010', '0100'],
  L: ['1100', '1000', '1000', '1001', '1111'],
  M: ['10001', '11011', '10101', '10001', '11011'],
  T: ['11111', '10101', '00100', '00100', '01110'],
  V: ['11011', '10001', '10001', '01010', '00100'],
  W: ['11011', '10001', '10101', '10101', '01010'],
  Y: ['11011', '01010', '00100', '00100', '01110'],
  a: ['000', '011', '001', '111', '101'],
  b: ['100', '100', '110', '101', '110'],
  c: ['000', '011', '100', '100', '011'],
  d: ['001', '001', '011', '101', '011'],
  e: ['000', '111', '101', '110', '011'],
  f: ['011', '010', '111', '010', '110'],
  h: ['100', '100', '110', '101', '101'],
  k: ['100', '101', '110', '101', '101'],
  l: ['10', '10', '10', '10', '11'],
  m: ['00000', '11010', '10101', '10101', '10101'],
  n: ['000', '110', '101', '101', '101'],
  o: ['000', '111', '101', '101', '111'],
  r: ['000', '110', '101', '100', '110'],
  s: ['000', '011', '100', '001', '110'],
  t: ['010', '111', '010', '010', '011'],
  u: ['000', '101', '101', '101', '111'],
  z: ['000', '111', '001', '100', '111'],
};

const BOOK_LETTERS: Record<string, string[]> = {
  ...TYPEWRITER_LETTERS,
  A: ['0110', '1001', '1001', '1111', '1001'],
  B: ['1110', '1001', '1110', '1001', '1111'],
  D: ['1110', '1001', '1001', '1001', '1111'],
  Q: ['0110', '1001', '1001', '1011', '0110'],
  R: ['1110', '1001', '1110', '1010', '1011'],
  S: ['0111', '1001', '0110', '1001', '1110'],
  U: ['1001', '1001', '1001', '1001', '1110'],
  a: ['000', '110', '001', '111', '011'],
  c: ['000', '011', '101', '100', '011'],
  e: ['000', '010', '111', '100', '011'],
  f: ['011', '010', '110', '010', '010'],
  h: ['100', '100', '110', '101', '101'],
  o: ['000', '010', '101', '101', '010'],
  r: ['000', '111', '100', '100', '100'],
  s: ['000', '011', '110', '001', '110'],
  t: ['010', '111', '010', '010', '001'],
  u: ['000', '101', '101', '101', '011'],
};

const HANDWRITTEN_LETTERS: Record<string, string[]> = {
  A: ['0010', '0101', '1111', '1001', '1001'],
  B: ['0110', '0101', '1110', '1001', '1110'],
  C: ['0011', '0100', '1000', '1000', '0111'],
  D: ['0110', '0101', '1001', '1001', '1110'],
  E: ['0111', '0100', '1110', '1000', '1111'],
  F: ['0111', '0100', '1110', '1000', '1000'],
  G: ['0011', '0100', '1000', '1011', '0111'],
  I: ['011', '010', '010', '010', '110'],
  J: ['0011', '0001', '0010', '1010', '0100'],
  K: ['0101', '0110', '1100', '1010', '1001'],
  L: ['0100', '0100', '1000', '1000', '1111'],
  N: ['0101', '1101', '1011', '1001', '1001'],
  O: ['0010', '0101', '1001', '1001', '0110'],
  P: ['0110', '0101', '1110', '1000', '1000'],
  Q: ['0010', '0101', '1001', '1011', '0111'],
  R: ['0110', '0101', '1110', '1010', '1001'],
  S: ['0011', '0100', '0110', '0001', '1110'],
  T: ['01111', '00100', '00100', '01000', '01000'],
  U: ['0101', '1001', '1001', '1001', '0110'],
  Z: ['0111', '0001', '0010', '0100', '1111'],
  a: ['000', '010', '101', '101', '011'],
  b: ['010', '100', '110', '101', '110'],
  c: ['000', '001', '010', '100', '011'],
  d: ['001', '001', '011', '101', '011'],
  e: ['000', '011', '110', '100', '011'],
  f: ['001', '010', '111', '010', '100'],
  h: ['010', '100', '110', '101', '101'],
  k: ['010', '101', '110', '110', '101'],
  l: ['01', '01', '10', '10', '01'],
  m: ['00000', '01010', '10101', '10101', '10101'],
  n: ['000', '010', '101', '101', '101'],
  o: ['000', '011', '101', '101', '110'],
  r: ['000', '011', '110', '100', '100'],
  s: ['000', '011', '010', '001', '110'],
  t: ['001', '111', '010', '010', '001'],
  u: ['000', '101', '101', '101', '011'],
  v: ['000', '101', '101', '010', '010'],
  w: ['00000', '10001', '10101', '10101', '01010'],
  x: ['000', '001', '010', '101', '101'],
  z: ['000', '011', '001', '010', '111'],
  '0': ['011', '101', '101', '101', '110'],
  '1': ['001', '011', '010', '010', '010'],
  '2': ['011', '001', '010', '100', '111'],
  '7': ['111', '001', '011', '010', '100'],
};

function makeDocumentFace(letters: Record<string, string[]>): Record<string, string[]> {
  const glyphs = { ...DOCUMENT_GLYPHS };
  for (const [letter, body] of Object.entries(letters)) {
    const blank = '0'.repeat(body[0].length);
    glyphs[letter] = [blank, ...body, blank];
  }
  // Accents belong to their face's glyph, including composed Unicode input.
  for (const [accented, plain] of Object.entries({ Ć: 'C', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', ć: 'c', ń: 'n', ó: 'o', ś: 's', ź: 'z', Ż: 'Z', ż: 'z' })) {
    glyphs[accented] = [DOCUMENT_GLYPHS[accented][0], ...glyphs[plain].slice(1)];
  }
  for (const [accented, plain] of Object.entries({ Ą: 'A', Ę: 'E', ą: 'a', ę: 'e' })) {
    glyphs[accented] = [...glyphs[plain].slice(0, 6), DOCUMENT_GLYPHS[accented][6]];
  }
  return glyphs;
}

const DOCUMENT_FACES: Record<DocumentFace, Record<string, string[]>> = {
  print: DOCUMENT_GLYPHS,
  typewriter: makeDocumentFace(TYPEWRITER_LETTERS),
  handwritten: makeDocumentFace(HANDWRITTEN_LETTERS),
  book: makeDocumentFace(BOOK_LETTERS),
};

function documentGlyph(character: string, face: DocumentFace): string[] {
  return DOCUMENT_FACES[face][character] ?? (GLYPHS[character] ?? GLYPHS['?']).slice(2);
}

function documentWidth(value: string, face: DocumentFace): number {
  return Math.max(0, [...value].reduce((width, character) => width + (character === ' ' ? 3 : documentGlyph(character, face)[0].length + 1), 0) - 1);
}

export function measureDocumentText(value: string, face: DocumentFace): number;
export function measureDocumentText(value: string): number;
export function measureDocumentText(value: string, face: DocumentFace | number = 'print'): number {
  // The established one-argument API also serves as an Array.map callback.
  const selectedFace = typeof face === 'number' ? 'print' : face;
  return Math.max(...value.normalize('NFC').replace(/\r\n?/g, '\n').split('\n').map(line => documentWidth(line, selectedFace)));
}

export function drawDocumentText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, options: DocumentTextOptions = {}): void {
  const face = options.face ?? 'print';
  ctx.save();
  ctx.fillStyle = options.color ?? '#282e24';
  for (const [lineIndex, line] of value.normalize('NFC').replace(/\r\n?/g, '\n').split('\n').entries()) {
    const width = documentWidth(line, face);
    const offset = options.align === 'center' ? width / 2 : options.align === 'right' ? width : 0;
    let cursorX = Math.round(x - offset);
    const cursorY = Math.round(y) + lineIndex * 8;
    for (const character of line) {
      if (character === ' ') { cursorX += 3; continue; }
      const rows = documentGlyph(character, face);
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
