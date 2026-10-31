import type { GameState } from '../core/game';
import type { ChapterEnding } from '../core/story';
import { translations, type Locale } from '../i18n';
import { drawStoryArt } from '../render/clinic';
import { drawText, measureText } from '../render/font';
import { drawStoryPaper, storyPaperDescription, storyPaperLayout, type StoryPaper } from '../render/story-paper';
import type { Button } from '../ui';

const pictures: Record<ChapterEnding, 'ending-e1' | 'ending-e2' | 'ending-e3' | 'ending-e4' | 'ending-e5' | 'ending-e6'> = {
  exposed: 'ending-e1', 'clinic-closed': 'ending-e2', detained: 'ending-e3', 'party-continue': 'ending-e4',
  'union-continue': 'ending-e5', 'independent-continue': 'ending-e6',
};
const FINAL_DOCUMENTS = ['A-EXPOSURE', 'A-CLOSURE', 'END-AUDIT', 'END-SECURITY', 'END-PARTY', 'END-UNION', 'END-ROTA'];
export type EpilogueAction = 'continue' | 'document' | 'close-document' | 'previous' | 'next';
const paperBounds = { x: 185, y: 65, w: 200, h: 168 };
const wrap = (value: string, width: number, scale = 1): string[] => {
  const lines: string[] = []; let line = '';
  for (const word of value.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureText(next, scale) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
};
export function epilogueContent(state: GameState, locale: Locale) {
  const resolution = state.story.resolution!;
  const t = translations[locale].story;
  const copy = t.endings[resolution.endingId];
  const body = resolution.variant === 'inconsistency' ? t.endings['clinic-closed'].bodyInconsistency : copy.body;
  return { ...copy, body, picture: pictures[resolution.endingId], action: resolution.terminal ? t.ui.backToMenu : t.ui.continueWork };
}
export function epilogueDocumentPages(state: GameState, locale: Locale) {
  return state.papers.filter((paper): paper is StoryPaper => paper.kind === 'story-document' && FINAL_DOCUMENTS.includes(paper.data.definitionId))
    .flatMap(paper => Array.from({ length: storyPaperLayout(paper, locale, 0, 200, state.story).count }, (_, page) => ({ paper, page })));
}
export function epilogueDescription(state: GameState, locale: Locale, documentPage: number | null): string {
  const content = epilogueContent(state, locale);
  const pages = epilogueDocumentPages(state, locale), selected = documentPage === null ? undefined : pages[Math.min(pages.length - 1, documentPage)];
  return selected ? storyPaperDescription(selected.paper, locale, state.story) : `${content.title}. ${content.body} ${content.description}`;
}
export function epilogueButtons(state: GameState, locale: Locale, documentPage: number | null, onAction: (action: EpilogueAction) => void): Button[] {
  const t = translations[locale], pages = epilogueDocumentPages(state, locale);
  const button = (id: string, label: string, action: EpilogueAction, x: number, y: number, w: number): Button => ({ id, label, x, y, w, h: 24, kind: 'text', action: () => onAction(action) });
  if (documentPage !== null) return [
    ...(documentPage > 0 ? [button('epilogue-previous', t.story.ui.previousPage, 'previous', 165, 240, 116)] : []),
    ...(documentPage < pages.length - 1 ? [button('epilogue-next', t.story.ui.nextPage, 'next', 295, 240, 115)] : []),
    button('epilogue-close-document', t.story.ui.backToEnding, 'close-document', 185, 276, 240),
  ];
  return [
    ...(pages.length ? [button('epilogue-document', t.story.ui.readEndingDocument, 'document', 24, 242, 310)] : []),
    button('epilogue-continue', epilogueContent(state, locale).action, 'continue', 24, 276, 310),
  ];
}
export function renderEpilogue(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, documentPage: number | null): void {
  const content = epilogueContent(state, locale);
  drawStoryArt(ctx, content.picture, 0, 0, 570, 320);
  if (content.picture === 'ending-e2') drawText(ctx, '04', 498, 59, { color: '#3c3528', align: 'center' });
  if (documentPage !== null) {
    const pages = epilogueDocumentPages(state, locale), selected = pages[Math.min(pages.length - 1, documentPage)];
    if (selected) drawStoryPaper(ctx, selected.paper, paperBounds, locale, selected.page, false, state.story);
    return;
  }
  const title = wrap(content.title, 264, 2);
  title.forEach((line, index) => drawText(ctx, line, 24, 25 + index * 24, { color: '#e3d6b3', scale: 2 }));
  wrap(content.body, 264).forEach((line, index) => drawText(ctx, line, 25, 42 + title.length * 24 + index * 15, { color: '#ded4b4' }));
}
