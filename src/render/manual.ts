import { drawDocumentText } from './font';
import { drawPaper } from './clinic';
import { translations, type Locale } from '../i18n';
import type { Rect } from '../core/desk';

export const MANUAL_PAGE_COUNT = translations.pl.manualPages.length;

export function manualPageDescription(locale: Locale, page: number): string {
  const t = translations[locale];
  const chapter = t.manualPages[page] ?? t.manualPages[0];
  return [t.manualTitle, `${t.manualPageLabel} ${page + 1}/${MANUAL_PAGE_COUNT}.`,
    chapter.title, chapter.lines.join(' '), chapter.facingTitle, chapter.facingLines.join(' ')].join(' ');
}

/** Page corners are separate semantic controls above the book's pickup target. */
export function manualControls(bounds: Rect): { previous: Rect; next: Rect; close: Rect } {
  const { x, y, w, h } = bounds;
  return {
    previous: { x: x + 7, y: y + h - 25, w: 24, h: 21 },
    next: { x: x + w - 31, y: y + h - 25, w: 24, h: 21 },
    close: { x: x + w - 21, y: y + 4, w: 16, h: 16 },
  };
}

export function drawManual(ctx: CanvasRenderingContext2D, bounds: Rect, locale: Locale, page: number): void {
  const { x, y, w, h } = bounds;
  const chapter = translations[locale].manualPages[page] ?? translations[locale].manualPages[0];
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
  drawDocumentText(ctx, `${page + 1}/${MANUAL_PAGE_COUNT}`, x + middle - 12, y + h - 22, { color: '#7d7456', align: 'right' });
  // Worn turned corners: their paper folds, rather than outlines, mark the controls.
  const arrow = (right: boolean): void => {
    const origin = right ? w - 24 : 11;
    for (let row = 0; row < 13; row++) {
      fill(right ? w - 5 - row : 4, h - 18 + row, row + 1, 1, '#beb18a');
    }
    for (let row = 0; row < 7; row++) {
      const offset = row < 4 ? row : 6 - row;
      fill(origin + (right ? offset : 3 - offset), h - 21 + row, 2, 1, '#566044');
    }
  };
  if (page > 0) arrow(false);
  if (page < MANUAL_PAGE_COUNT - 1) arrow(true);
  for (let pixel = 0; pixel < 5; pixel++) {
    fill(w - 16 + pixel, 9 + pixel, 1, 1, '#7e7454');
    fill(w - 12 - pixel, 9 + pixel, 1, 1, '#7e7454');
  }
}
