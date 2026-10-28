import { drawDocumentHeading, drawDocumentText, measureDocumentHeading, drawReadingText, measureReadingText, READ_LINE_HEIGHT } from './font';
import { drawDeskItem, drawManualArt } from './clinic';
import { translations, type Locale } from '../i18n';
import { MANUAL_OPEN_SIZE, RIGHT_DESK_X, type Rect } from '../core/desk';
import { manualSupplementsForDay } from '../core/manual';

const CORNER_SIZE = 9;
// The illustration includes the cover and page stack: measure from the actual
// cream leaf, leaving extra room at the outside edges and at the binding.
export const MANUAL_OUTER_INSET = 22;
export const MANUAL_INNER_INSET = 14;
export const MANUAL_COLUMN_WIDTH = MANUAL_OPEN_SIZE.w / 2 - MANUAL_OUTER_INSET - MANUAL_INNER_INSET;
const NUMBER_GUTTER = 14;

/** Numbering and titles remain the exact localized provision, with a common
 * gutter for one- and two-digit sections. Never shrink lettering to fit. */
export function manualHeadingLayout(title: string) {
  const numbered = /^(\d+)\.\s+(.+)$/.exec(title);
  const number = numbered?.[1] ?? '';
  const text = numbered?.[2] ?? title;
  const offset = number ? NUMBER_GUTTER : 0;
  const width = MANUAL_COLUMN_WIDTH - offset;
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureDocumentHeading(next, 'sans') > width) { lines.push(line); line = word; }
    else line = next;
  }
  lines.push(line);
  return { number, text, lines, offset, width };
}

function drawProvisionHeading(ctx: CanvasRenderingContext2D, title: string, x: number, y: number, color: string): void {
  const layout = manualHeadingLayout(title);
  // Numbers use the same native pixels as the title, centered beside either
  // one or two lines. Only the complete game viewport is enlarged for display.
  if (layout.number) drawDocumentHeading(ctx, layout.number, x, y + 12, { color, face: 'sans' });
  drawDocumentHeading(ctx, layout.lines.join('\n'), x + layout.offset, y + (layout.lines.length > 1 ? 8 : 12), { color, face: 'sans' });
}

/** Reflow complete provisions for the upright reading face; old line breaks are
 * editorial wrapping, never omitted text or a reason to shrink the type. */
export function manualBodyLayout(lines: readonly string[], width = MANUAL_COLUMN_WIDTH): string[] {
  const rows: string[] = [];
  let current = '';
  for (const word of lines.join(' ').split(' ')) {
    const next = current ? `${current} ${word}` : word;
    if (current && measureReadingText(next) > width) { rows.push(current); current = word; }
    else current = next;
  }
  rows.push(current);
  return rows;
}

function drawProvisionBody(ctx: CanvasRenderingContext2D, lines: readonly string[], x: number, y: number, width: number): void {
  manualBodyLayout(lines, width).forEach((line, index) => drawReadingText(ctx, line, x, y + index * READ_LINE_HEIGHT, {
    color: '#343c2c', face: 'typewriter',
  }));
}

export function manualPagesForDay(locale: Locale, day: number) {
  const t = translations[locale];
  return [
    ...t.manualPages.map(page => ({ ...page, section: t.manualBase })),
    ...manualSupplementsForDay(day).flatMap(id => {
      const supplement = t.manualSupplements[id];
      return supplement.pages.map(page => ({ ...page, section: supplement.label }));
    }),
  ];
}

export const manualPageCount = (day: number): number => manualPagesForDay('pl', day).length;

export function manualPageDescription(locale: Locale, page: number, day: number): string {
  const t = translations[locale];
  const pages = manualPagesForDay(locale, day);
  const chapter = pages[page] ?? pages[0]!;
  return [t.manualTitle, chapter.section, `${t.manualPageLabel} ${page + 1}/${pages.length}.`,
    chapter.title, chapter.lines.join(' '), chapter.facingTitle, chapter.facingLines.join(' ')].join(' ');
}

/** Page corners are separate semantic controls above the book's pickup target. */
export function manualControls(bounds: Rect): { previous: Rect; next: Rect } {
  const { x, y, w, h } = bounds;
  return {
    previous: { x: x + 3, y: y + h - CORNER_SIZE - 6, w: CORNER_SIZE + 4, h: CORNER_SIZE + 3 },
    next: { x: x + w - CORNER_SIZE - 7, y: y + h - CORNER_SIZE - 6, w: CORNER_SIZE + 4, h: CORNER_SIZE + 3 },
  };
}

/** Generated folded paper is the control itself, aligned with its semantic target. */
function drawCorner(ctx: CanvasRenderingContext2D, bounds: Rect, right: boolean): void {
  const { x, y, w, h } = bounds;
  drawManualArt(ctx, right ? 'corner-right' : 'corner-left',
    right ? x + w - CORNER_SIZE - 4 : x + 3, y + h - CORNER_SIZE - 3, CORNER_SIZE, CORNER_SIZE);
}

export function drawManualCover(ctx: CanvasRenderingContext2D, bounds: Rect, lifted = false): void {
  const { x, y, w, h } = bounds;
  if (h < w) drawDeskItem(ctx, 'manual', x, y, lifted, w, h);
  else drawManualArt(ctx, 'cover', x, y, w, h);
  if (!lifted && x >= RIGHT_DESK_X) drawCorner(ctx, bounds, true);
}

export function drawManual(ctx: CanvasRenderingContext2D, bounds: Rect, locale: Locale, page: number, day: number): void {
  const { x, y, w, h } = bounds;
  const pages = manualPagesForDay(locale, day);
  const chapter = pages[page] ?? pages[0]!;
  drawManualArt(ctx, 'spread', x, y, w, h);
  const middle = Math.floor(w / 2);
  const headingInk = chapter.section === translations[locale].manualBase ? '#39432e' : '#823e32';
  const left = x + MANUAL_OUTER_INSET, right = x + middle + MANUAL_INNER_INSET;
  const width = middle - MANUAL_OUTER_INSET - MANUAL_INNER_INSET;
  drawProvisionHeading(ctx, chapter.title, left, y, headingInk);
  drawProvisionHeading(ctx, chapter.facingTitle, right, y, headingInk);
  drawProvisionBody(ctx, chapter.lines, left, y + 36, width);
  drawProvisionBody(ctx, chapter.facingLines, right, y + 36, width);
  drawDocumentText(ctx, `${page + 1}/${pages.length}`, x + Math.floor(middle / 2), y + h - 34, { color: '#7d7456', align: 'center', face: 'typewriter' });
  drawDocumentText(ctx, chapter.section, x + middle + Math.floor(middle / 2), y + h - 34, { color: '#7d7456', align: 'center', face: 'typewriter' });
  drawCorner(ctx, bounds, false);
  if (page < pages.length - 1) drawCorner(ctx, bounds, true);
}
