import { drawDocumentText } from './font';
import { drawDeskItem, drawManualArt } from './clinic';
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
  drawDocumentText(ctx, chapter.title, x + 12, y + 11, { color: headingInk, face: 'book' });
  drawDocumentText(ctx, chapter.facingTitle, x + middle + 12, y + 11, { color: headingInk, face: 'book' });
  drawDocumentText(ctx, chapter.lines.join('\n'), x + 12, y + 36, { color: '#343c2c', face: 'book' });
  drawDocumentText(ctx, chapter.facingLines.join('\n'), x + middle + 12, y + 36, { color: '#343c2c', face: 'book' });
  drawDocumentText(ctx, `${page + 1}/${pages.length}`, x + middle - 12, y + h - 36, { color: '#7d7456', align: 'right', face: 'typewriter' });
  drawDocumentText(ctx, chapter.section, x + middle + 12, y + h - 36, { color: '#7d7456', face: 'typewriter' });
  drawCorner(ctx, bounds, false);
  if (page < pages.length - 1) drawCorner(ctx, bounds, true);
}
