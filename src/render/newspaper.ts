import { formatGameDate } from '../core/calendar';
import { type NewspaperDeskItemId, type Rect } from '../core/desk';
import { type NewspaperState, type PressArticleId } from '../core/newspaper';
import { workDayNumber } from '../core/progression';
import { translations, type Locale } from '../i18n';
import { drawDocumentHeading, drawDocumentText, measureDocumentHeading, measureDocumentText } from './font';
import { drawManualArt, drawNewspaperArt, drawNewspaperMasthead } from './clinic';
import { manualControls } from './manual';

export type NewspaperViews = Partial<Record<NewspaperDeskItemId, { open: boolean; page: number }>>;

export const NEWSPAPER_COLUMN_WIDTH = 130;
export const NEWSPAPER_TITLE_WIDTH = 274;
export const NEWSPAPER_BODY_BOTTOM = 158;
export const newspaperPageCount = (state: Pick<NewspaperState, 'articleIds'>): number => state.articleIds.length;
export const newspaperControls = manualControls;

export function wrapNews(text: string, width = NEWSPAPER_COLUMN_WIDTH, heading = false): string[] {
  const measure = heading ? measureDocumentHeading : measureDocumentText;
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > width) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** One complete article flows down the left column, then down the right.
 * No truncation or hidden overflow: both language editions are checked at 1×.
 */
export function newspaperArticleLayout(id: PressArticleId, locale: Locale) {
  const copy = translations[locale].newspaper.articles[id];
  const title = wrapNews(copy.title, NEWSPAPER_TITLE_WIDTH / 2, true);
  const body = wrapNews(copy.body);
  const split = Math.ceil(body.length / 2);
  const columns = [body.slice(0, split), body.slice(split)];
  const bodyY = 56 + title.length * 14 + 5;
  return { title, body, columns, bodyY, bottom: bodyY + split * 8 };
}

export function newspaperDescription(state: Pick<NewspaperState, 'articleIds'>, day: number, locale: Locale, page: number): string {
  const t = translations[locale].newspaper;
  const copy = t.articles[state.articleIds[page]!];
  return [t.title, t.strapline, formatGameDate(day, locale), `${t.issue} ${workDayNumber(day)}.`,
    `${t.page} ${page + 1}/${newspaperPageCount(state)}.`, copy.title, copy.body, copy.byline].join(' ');
}

function corner(ctx: CanvasRenderingContext2D, bounds: Rect, right: boolean): void {
  drawManualArt(ctx, right ? 'corner-right' : 'corner-left',
    right ? bounds.x + bounds.w - 13 : bounds.x + 3, bounds.y + bounds.h - 12, 9, 9);
}

export function drawNewspaper(ctx: CanvasRenderingContext2D, bounds: Rect, state: Pick<NewspaperState, 'articleIds'>, day: number,
  locale: Locale, open: boolean, page: number, lifted: boolean): void {
  const { x, y, w, h } = bounds, t = translations[locale].newspaper;
  const unfolded = open && !lifted;
  drawNewspaperArt(ctx, unfolded, x, y, w, h);
  // Compact objects have only their generated artwork, like other desk items.
  if (!unfolded) return;
  const ink = '#30271b', muted = '#67533a';
  drawNewspaperMasthead(ctx, locale, x + (locale === 'pl' ? 16 : 42), y + 4);
  drawDocumentText(ctx, formatGameDate(day, locale), x + 13, y + 43, { color: ink });
  drawDocumentText(ctx, t.strapline, x + 150, y + 43, { align: 'center', color: muted });
  drawDocumentText(ctx, `${t.issue} ${workDayNumber(day)}`, x + w - 14, y + 43, { align: 'right', color: ink });
  const id = state.articleIds[page]!, copy = t.articles[id];
  const layout = newspaperArticleLayout(id, locale);
  layout.title.forEach((line, index) => drawDocumentHeading(ctx, line, x + 13, y + 56 + index * 14, { scale: 2, color: ink }));
  layout.columns.forEach((lines, column) => drawDocumentText(ctx, lines.join('\n'), x + 13 + column * 144, y + layout.bodyY, { color: ink }));
  drawDocumentText(ctx, copy.byline, x + 18, y + h - 13, { color: muted });
  drawDocumentText(ctx, String(page + 1), x + w - 22, y + h - 13, { align: 'right', color: muted });
  if (page > 0) corner(ctx, bounds, false);
  if (page < newspaperPageCount(state) - 1) corner(ctx, bounds, true);
}
