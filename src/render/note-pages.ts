import type { Rect } from '../core/desk';
import { translations, type Locale } from '../i18n';
import { measureReadingText } from './font';
import { DOCUMENT_BODY_WIDTH } from './document-copy';

export const NOTE_LINE_HEIGHT = 14;
export const NOTE_LINES_PER_PAGE = 9;
export type NoteLine = { text: string; color: string };

/** Pagination is presentation only; the append-only journal remains intact. */
export function paginateNoteEntries(entries: readonly NoteLine[], width = DOCUMENT_BODY_WIDTH, requestedPage = 0) {
  const pages: NoteLine[][] = [[]];
  for (const entry of entries) {
    const wrapped: NoteLine[] = [];
    let current = '';
    for (const word of entry.text.split(' ')) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && measureReadingText(candidate, 'handwritten') > width) {
        wrapped.push({ ...entry, text: current });
        current = word;
      } else current = candidate;
    }
    wrapped.push({ ...entry, text: current });
    // Keep a finding and its wrapped conclusion together whenever one page fits.
    if (wrapped.length <= NOTE_LINES_PER_PAGE && pages.at(-1)!.length + wrapped.length > NOTE_LINES_PER_PAGE) pages.push([]);
    for (const line of wrapped) {
      if (pages.at(-1)!.length === NOTE_LINES_PER_PAGE) pages.push([]);
      pages.at(-1)!.push(line);
    }
  }
  const count = pages.length;
  const page = Math.max(0, Math.min(count - 1, Math.floor(requestedPage)));
  return { count, page, lines: pages[page]! };
}

export function notePageControls(bounds: Rect): { previous: Rect; next: Rect } {
  return {
    previous: { x: bounds.x + 3, y: bounds.y + bounds.h - 15, w: 13, h: 13 },
    next: { x: bounds.x + bounds.w - 16, y: bounds.y + bounds.h - 15, w: 13, h: 13 },
  };
}

export function notePageLabel(locale: Locale, page: number, count: number): string {
  return `${translations[locale].notePagination.page} ${page + 1}/${count}`;
}
