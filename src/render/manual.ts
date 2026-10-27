import { drawDocumentText } from './font';
import { drawDeskItem, drawPaper } from './clinic';
import { translations, type Locale } from '../i18n';
import { RIGHT_DESK_X, type Rect } from '../core/desk';
import { manualSupplementsForDay } from '../core/manual';

const CORNER_SIZE = 9;

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

/** The bent sheet/cover is the control itself; no symbol is printed over it. */
function drawCorner(ctx: CanvasRenderingContext2D, bounds: Rect, right: boolean, cover = false): void {
  const { x, y, w, h } = bounds;
  const edge = right ? x + w - 4 : x + 3;
  for (let row = 0; row < CORNER_SIZE; row++) {
    const start = right ? edge - row : edge;
    ctx.fillStyle = cover ? '#292d21' : '#827b5c';
    ctx.fillRect(start, y + h - CORNER_SIZE - 3 + row, row + 1, 1);
    if (row > 1) {
      ctx.fillStyle = cover ? '#a18d5b' : '#d8cba3';
      ctx.fillRect(start + 1, y + h - CORNER_SIZE - 3 + row, row - 1, 1);
    }
  }
}

export function drawManualCover(ctx: CanvasRenderingContext2D, bounds: Rect, lifted = false): void {
  const { x, y, w, h } = bounds;
  if (h < w) drawDeskItem(ctx, 'manual', x, y, lifted, w, h);
  else {
    const fill = (dx: number, dy: number, width: number, height: number, color: string): void => {
      ctx.fillStyle = color; ctx.fillRect(x + dx, y + dy, width, height);
    };
    // A single upright clothbound cover, prepared directly at the page's size.
    fill(lifted ? 6 : 3, lifted ? 6 : 4, w, h, '#151c16a8');
    fill(1, 2, w - 2, h - 2, '#22291d');
    fill(8, 5, w - 10, h - 7, '#a89d73');
    for (let edge = 0; edge < 3; edge++) {
      fill(11, h - 6 + edge * 2, w - 15, 1, '#736d51');
      fill(w - 6 + edge * 2, 9, 1, h - 18, '#736d51');
    }
    fill(2, 1, w - 7, h - 8, '#414932');
    fill(3, 2, 10, h - 10, '#303928');
    fill(12, 2, 1, h - 10, '#626346');
    fill(14, 2, 1, h - 10, '#252e20');
    // Quiet woven grain: a fixed repeating stitch pattern, never random noise.
    for (let dy = 5; dy < h - 12; dy += 4) {
      for (let dx = 17 + dy % 3; dx < w - 10; dx += 6) {
        fill(dx, dy, 2, 1, '#464c35');
        fill(dx + 2, dy + 1, 1, 1, '#3b442e');
      }
    }
    fill(20, 12, w - 34, 1, '#67704b');
    fill(20, 13, 1, h - 34, '#67704b');
    fill(w - 15, 13, 1, h - 34, '#293321');
    fill(20, h - 22, w - 34, 1, '#293321');
    fill(4, 3, 6, 1, '#87794e');
    fill(3, h - 12, 7, 1, '#81734a');
    fill(w - 13, 2, 5, 1, '#7e7850');
    fill(5, 4, 1, 4, '#675f3f');
    fill(6, h - 18, 1, 5, '#625f40');
  }
  if (!lifted && x >= RIGHT_DESK_X) drawCorner(ctx, bounds, true, true);
}

export function drawManual(ctx: CanvasRenderingContext2D, bounds: Rect, locale: Locale, page: number, day: number): void {
  const { x, y, w, h } = bounds;
  const pages = manualPagesForDay(locale, day);
  const chapter = pages[page] ?? pages[0]!;
  const fill = (dx: number, dy: number, width: number, height: number, color: string): void => {
    ctx.fillStyle = color; ctx.fillRect(x + dx, y + dy, width, height);
  };
  fill(3, 4, w, h, '#1c241b');
  fill(0, 0, w, h, '#454e37');
  drawPaper(ctx, x + 3, y + 2, w - 6, h - 6);
  const middle = Math.floor(w / 2);
  fill(middle - 3, 3, 2, h - 9, '#afa681');
  fill(middle - 1, 3, 2, h - 9, '#827d60');
  fill(middle + 1, 3, 3, h - 9, '#c5bb95');
  fill(4, h - 5, middle - 7, 1, '#a89d77');
  fill(middle + 4, h - 5, middle - 8, 1, '#a89d77');
  drawDocumentText(ctx, chapter.title, x + 12, y + 11, { color: '#39432e' });
  drawDocumentText(ctx, chapter.facingTitle, x + middle + 12, y + 11, { color: '#39432e' });
  fill(12, 26, middle - 26, 1, '#aea27b');
  fill(middle + 12, 26, middle - 26, 1, '#aea27b');
  drawDocumentText(ctx, chapter.lines.join('\n'), x + 12, y + 34, { color: '#343c2c' });
  drawDocumentText(ctx, chapter.facingLines.join('\n'), x + middle + 12, y + 34, { color: '#343c2c' });
  drawDocumentText(ctx, `${page + 1}/${pages.length}`, x + middle - 12, y + h - 22, { color: '#7d7456', align: 'right' });
  drawDocumentText(ctx, chapter.section, x + middle + 12, y + h - 22, { color: '#7d7456' });
  drawCorner(ctx, bounds, false);
  if (page < pages.length - 1) drawCorner(ctx, bounds, true);
}
