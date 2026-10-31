import { formatGameDate } from '../core/calendar';
import { type NewspaperDeskItemId, type Rect } from '../core/desk';
import { classifiedPhone, type ClassifiedId, type NewspaperState, type PressArticleId } from '../core/newspaper';
import { workDayNumber } from '../core/progression';
import { translations, type Locale } from '../i18n';
import { drawDocumentHeading, drawDocumentText, measureDocumentHeading, measureDocumentText } from './font';
import { drawManualArt, drawNewspaperArt, drawNewspaperMasthead } from './clinic';
import { manualControls } from './manual';

export type NewspaperViews = Partial<Record<NewspaperDeskItemId, { open: boolean; page: number }>>;

export const NEWSPAPER_COLUMN_WIDTH = 130;
export const NEWSPAPER_TITLE_WIDTH = 274;
export const NEWSPAPER_BODY_BOTTOM = 158;
type NewspaperContent = Pick<NewspaperState, 'articleIds' | 'classifiedIds'>;
export const newspaperPageCount = (state: NewspaperContent): number => state.articleIds.length + Number(state.classifiedIds.length > 0);
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

export function newspaperClassifiedLayout(ids: readonly ClassifiedId[], locale: Locale) {
  const t = translations[locale].newspaper;
  return ids.map((id, index) => {
    const x = 13 + Math.floor(index / 2) * 144, y = 78 + (index % 2) * 42;
    const lines = wrapNews(t.classifieds[id]);
    const phone = classifiedPhone(id);
    const phoneText = phone ? `${t.telephone} ${phone}` : undefined;
    const phoneY = y + lines.length * 8;
    const phoneRect = phoneText ? { x, y: phoneY - 1, w: measureDocumentText(phoneText), h: 10 } : undefined;
    return { id, x, y, lines, phoneText, phoneRect, bottom: phoneY + (phone ? 8 : 0) };
  });
}

export function newspaperDescription(state: NewspaperContent, day: number, locale: Locale, page: number): string {
  const t = translations[locale].newspaper;
  const copy = page < state.articleIds.length ? t.articles[state.articleIds[page]!] : undefined;
  const content = copy ? [copy.title, copy.body, copy.byline] : [t.classifiedTitle,
    ...state.classifiedIds.map(id => `${t.classifieds[id]}${classifiedPhone(id) ? ` ${t.telephone} ${classifiedPhone(id)}.` : ''}`)];
  return [t.title, t.strapline, formatGameDate(day, locale), `${t.issue} ${workDayNumber(day)}.`,
    `${t.page} ${page + 1}/${newspaperPageCount(state)}.`, ...content].join(' ');
}

function corner(ctx: CanvasRenderingContext2D, bounds: Rect, right: boolean): void {
  drawManualArt(ctx, right ? 'corner-right' : 'corner-left',
    right ? bounds.x + bounds.w - 13 : bounds.x + 3, bounds.y + bounds.h - 12, 9, 9);
}

export function drawNewspaper(ctx: CanvasRenderingContext2D, bounds: Rect, state: NewspaperContent, day: number,
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
  if (page === state.articleIds.length && state.classifiedIds.length) {
    drawDocumentHeading(ctx, t.classifiedTitle, x + 13, y + 56, { scale: 2, color: ink });
    for (const ad of newspaperClassifiedLayout(state.classifiedIds, locale)) {
      drawDocumentText(ctx, ad.lines.join('\n'), x + ad.x, y + ad.y, { color: ink });
      if (ad.phoneText && ad.phoneRect) drawDocumentText(ctx, ad.phoneText, x + ad.phoneRect.x, y + ad.phoneRect.y + 1, { color: ink });
    }
  } else {
    const id = state.articleIds[page]!, copy = t.articles[id];
    const layout = newspaperArticleLayout(id, locale);
    layout.title.forEach((line, index) => drawDocumentHeading(ctx, line, x + 13, y + 56 + index * 14, { scale: 2, color: ink }));
    layout.columns.forEach((lines, column) => drawDocumentText(ctx, lines.join('\n'), x + 13 + column * 144, y + layout.bodyY, { color: ink }));
    drawDocumentText(ctx, copy.byline, x + 18, y + h - 13, { color: muted });
  }
  drawDocumentText(ctx, String(page + 1), x + w - 22, y + h - 13, { align: 'right', color: muted });
  if (page > 0) corner(ctx, bounds, false);
  if (page < newspaperPageCount(state) - 1) corner(ctx, bounds, true);
}
