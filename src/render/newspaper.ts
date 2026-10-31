import { formatGameDate } from '../core/calendar';
import { type NewspaperDeskItemId, type Rect } from '../core/desk';
import { classifiedPhone, type ClassifiedId, type NewspaperCopy, type NewspaperState, type PressArticleId } from '../core/newspaper';
import { storyArticleCopy, storyClassifiedCopy } from '../core/story-content';
import { workDayNumber } from '../core/progression';
import { translations, type Locale } from '../i18n';
import { drawText, drawDocumentText, measureText, measureDocumentText } from './font';
import { drawManualArt, drawNewspaperArt, drawNewspaperMasthead, drawStoryArt } from './clinic';
import { manualControls } from './manual';

export type NewspaperViews = Partial<Record<NewspaperDeskItemId, { open: boolean; page: number }>>;
export const NEWSPAPER_COLUMN_WIDTH = 130;
export const NEWSPAPER_TITLE_WIDTH = 274;
export const NEWSPAPER_BODY_BOTTOM = 158;
const HEADLINE_LINE_HEIGHT = 12;
type NewspaperContent = Pick<NewspaperState, 'articleIds' | 'classifiedIds'> & Partial<Pick<NewspaperCopy, 'publication' | 'issueNumber' | 'storyArticleIds' | 'storyClassifiedIds'>>;
export const newspaperControls = manualControls;
export const newspaperTitle = (copy: Pick<NewspaperContent, 'publication'>, locale: Locale): string => copy.publication === 'glos' ? translations[locale].story.ui.unionTitle : translations[locale].newspaper.title;

export function wrapNews(text: string, width = NEWSPAPER_COLUMN_WIDTH, heading = false): string[] {
  const measure = heading ? measureText : measureDocumentText;
  const lines: string[] = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function newspaperArticleLayout(id: PressArticleId, locale: Locale) {
  const copy = translations[locale].newspaper.articles[id];
  const title = wrapNews(copy.title, NEWSPAPER_TITLE_WIDTH, true), body = wrapNews(copy.body);
  const split = Math.ceil(body.length / 2), columns = [body.slice(0, split), body.slice(split)];
  const bodyY = 56 + title.length * HEADLINE_LINE_HEIGHT + 5;
  return { title, body, columns, bodyY, bottom: bodyY + split * 8 };
}
export function newspaperClassifiedLayout(ids: readonly ClassifiedId[], locale: Locale) {
  const t = translations[locale].newspaper;
  return ids.map((id, index) => {
    const x = 13 + Math.floor(index / 2) * 144, y = 78 + (index % 2) * 42;
    const lines = wrapNews(t.classifieds[id]), phone = classifiedPhone(id);
    const phoneText = phone ? `${t.telephone} ${phone}` : undefined;
    const phoneY = y + lines.length * 8;
    const phoneRect = phoneText ? { x, y: phoneY - 1, w: measureDocumentText(phoneText), h: 10 } : undefined;
    return { id, x, y, lines, phoneText, phoneRect, bottom: phoneY + (phone ? 8 : 0) };
  });
}

interface ArticlePage { kind: 'article'; title: string[]; body: string[]; columns: string[][]; bodyY: number; byline: string; photo: boolean }
interface ClassifiedPage { kind: 'classifieds' }
export type NewspaperPage = ArticlePage | ClassifiedPage;
/** A long translated article continues on paper, never beyond the reading surface. */
export function newspaperPages(state: NewspaperContent, locale: Locale): NewspaperPage[] {
  const pages: NewspaperPage[] = [];
  const articles = [
    ...(state.storyArticleIds ?? []).map(id => ({ ...storyArticleCopy(id, locale), photo: id === 'K-J-CHIEF' })),
    ...state.articleIds.map(id => ({ ...translations[locale].newspaper.articles[id], photo: false })),
  ];
  for (const article of articles) {
    const title = wrapNews(article.title, NEWSPAPER_TITLE_WIDTH, true), body = wrapNews(article.body);
    const bodyY = 56 + title.length * HEADLINE_LINE_HEIGHT + 5;
    const capacity = Math.max(1, Math.floor((NEWSPAPER_BODY_BOTTOM - bodyY) / 8));
    let remaining = [...body], first = true;
    do {
      // The photograph occupies five rows of the second column, only in this one story.
      const photo = article.photo && first;
      const rightCapacity = Math.max(0, capacity - (photo ? 5 : 0));
      const left = remaining.splice(0, remaining.length <= capacity + rightCapacity && !photo ? Math.ceil(remaining.length / 2) : capacity);
      const right = remaining.splice(0, rightCapacity);
      pages.push({ kind: 'article', title, body, columns: [left, right], bodyY, byline: article.byline, photo });
      first = false;
    } while (remaining.length);
  }
  if (state.classifiedIds.length || state.storyClassifiedIds?.length) pages.push({ kind: 'classifieds' });
  return pages;
}
export const newspaperPageCount = (state: NewspaperContent, locale: Locale = 'pl'): number => newspaperPages(state, locale).length;
export const newspaperIsClassifiedPage = (state: NewspaperContent, locale: Locale, page: number): boolean => newspaperPages(state, locale)[page]?.kind === 'classifieds';

/** The larger authored ad replaces the left column; two background ads use the right. */
export function newspaperAds(state: NewspaperContent, locale: Locale) {
  const ordinary = newspaperClassifiedLayout(state.classifiedIds, locale);
  const story = state.storyClassifiedIds?.includes('C-AD') ? storyClassifiedCopy('C-AD', locale) : undefined;
  if (!story) return { ordinary, story: undefined };
  const lines = wrapNews(story.text), phoneText = `${translations[locale].story.ui.telephone} ${story.phone}`;
  const phoneRect = { x: 13, y: 78 + lines.length * 8, w: measureDocumentText(phoneText), h: 10 };
  return { ordinary: ordinary.slice(0, 2).map((ad, index) => ({ ...ad, x: 157, y: 78 + index * 42,
    phoneRect: ad.phoneRect ? { ...ad.phoneRect, x: 157, y: 77 + index * 42 + ad.lines.length * 8 } : undefined })),
    story: { ...story, lines, phoneText, phoneRect } };
}

export function newspaperDescription(state: NewspaperContent, day: number, locale: Locale, page: number): string {
  const t = translations[locale].newspaper, selected = newspaperPages(state, locale)[page];
  const content = selected?.kind === 'article' ? [selected.title.join(' '), selected.body.join(' '), selected.byline]
    : [t.classifiedTitle, ...(state.storyClassifiedIds ?? []).map(id => { const copy = storyClassifiedCopy(id, locale); return `${copy.text} ${t.telephone} ${copy.phone}.`; }),
      ...state.classifiedIds.map(id => `${t.classifieds[id]}${classifiedPhone(id) ? ` ${t.telephone} ${classifiedPhone(id)}.` : ''}`)];
  return [newspaperTitle(state, locale), state.publication === 'glos' ? translations[locale].story.ui.unionStrapline : t.strapline,
    formatGameDate(day, locale), `${t.issue} ${state.issueNumber ?? workDayNumber(day)}.`, `${t.page} ${page + 1}/${newspaperPageCount(state, locale)}.`, ...content].join(' ');
}
function corner(ctx: CanvasRenderingContext2D, bounds: Rect, right: boolean): void {
  drawManualArt(ctx, right ? 'corner-right' : 'corner-left', right ? bounds.x + bounds.w - 13 : bounds.x + 3, bounds.y + bounds.h - 12, 9, 9);
}
export function drawNewspaper(ctx: CanvasRenderingContext2D, bounds: Rect, state: NewspaperContent, day: number,
  locale: Locale, open: boolean, page: number, lifted: boolean): void {
  const { x, y, w, h } = bounds, t = translations[locale].newspaper, union = state.publication === 'glos';
  const unfolded = open && !lifted;
  if (union) drawStoryArt(ctx, unfolded ? 'union-spread' : 'union-folded', x, y, w, h);
  else drawNewspaperArt(ctx, unfolded, x, y, w, h);
  if (!unfolded) return;
  const ink = '#30271b', muted = '#67533a';
  if (union) drawStoryArt(ctx, locale === 'pl' ? 'union-masthead-pl' : 'union-masthead-en', x + 16, y + 4, 268, 30);
  else drawNewspaperMasthead(ctx, locale, x + (locale === 'pl' ? 16 : 42), y + 4);
  drawDocumentText(ctx, formatGameDate(day, locale), x + 13, y + 43, { color: ink });
  drawDocumentText(ctx, union ? translations[locale].story.ui.unionStrapline : t.strapline, x + 150, y + 43, { align: 'center', color: muted });
  drawDocumentText(ctx, `${t.issue} ${state.issueNumber ?? workDayNumber(day)}`, x + w - 14, y + 43, { align: 'right', color: ink });
  const pages = newspaperPages(state, locale), current = pages[Math.min(page, pages.length - 1)];
  if (current?.kind === 'classifieds') {
    drawText(ctx, t.classifiedTitle, x + 13, y + 56, { color: ink });
    const ads = newspaperAds(state, locale);
    for (const ad of ads.ordinary) {
      drawDocumentText(ctx, ad.lines.join('\n'), x + ad.x, y + ad.y, { color: ink });
      if (ad.phoneText && ad.phoneRect) drawDocumentText(ctx, ad.phoneText, x + ad.phoneRect.x, y + ad.phoneRect.y + 1, { color: ink });
    }
    if (ads.story) {
      drawDocumentText(ctx, ads.story.lines.join('\n'), x + 13, y + 78, { color: ink });
      drawDocumentText(ctx, ads.story.phoneText, x + 13, y + ads.story.phoneRect.y + 1, { color: ink });
    }
  } else if (current) {
    current.title.forEach((line, index) => drawText(ctx, line, x + 13, y + 56 + index * HEADLINE_LINE_HEIGHT, { color: ink }));
    current.columns.forEach((lines, column) => drawDocumentText(ctx, lines.join('\n'), x + 13 + column * 144, y + current.bodyY + (current.photo && column === 1 ? 40 : 0), { color: ink }));
    if (current.photo) drawStoryArt(ctx, 'malec-photo', x + 190, y + current.bodyY, 48, 40);
    drawDocumentText(ctx, current.byline, x + 18, y + h - 13, { color: muted });
  }
  drawDocumentText(ctx, String(page + 1), x + w - 22, y + h - 13, { align: 'right', color: muted });
  if (page > 0) corner(ctx, bounds, false);
  if (page < pages.length - 1) corner(ctx, bounds, true);
}
