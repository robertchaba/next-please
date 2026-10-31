import type { Paper } from '../core/game';
import type { NarrativeState } from '../core/story';
import { storyDocumentCopy, STORY_CONTACTS } from '../core/story-content';
import type { Rect } from '../core/desk';
import { translations, type Locale } from '../i18n';
import { drawDocumentText, measureDocumentText, drawText } from './font';
import { drawPaper, drawStationery, drawStoryArt, drawManualArt, drawDocumentSignature, type StoryArt } from './clinic';
import { drawAdministrativeStamp } from './document-style';
import { notePageControls } from './note-pages';

export type StoryPaper = Extract<Paper, { kind: 'story-document' }>;
const INK = '#333b2b', BLUE = '#385b78';

function wrap(value: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(/\s+/)) {
    if (measureDocumentText(word) > width) {
      if (line) { lines.push(line); line = ''; }
      for (const letter of word) {
        if (line && measureDocumentText(line + letter) > width) { lines.push(line); line = ''; }
        line += letter;
      }
      continue;
    }
    const next = line ? `${line} ${word}` : word;
    if (line && measureDocumentText(next) > width) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Text flows onto additional physical pages; every clue remains legible at 1×. */
export function storyPaperLayout(paper: StoryPaper, locale: Locale, page = 0, width = 200, story?: NarrativeState) {
  const copy = storyDocumentCopy(paper.data, locale, story);
  if (paper.data.definitionId === 'J-PARTY-CARD') {
    const heading = [copy.title,copy.subject].flatMap(text=>wrap(text,width-24));
    const body = [copy.issuer,copy.issuedDate,copy.reference,...copy.paragraphs,copy.signature].flatMap(text=>wrap(text,78));
    const count = Math.max(1,Math.ceil(body.length/13)), current = Math.max(0,Math.min(count-1,page));
    return { copy,count,page:current,lines:[
      ...heading.map((text,index)=>({text,color:INK,x:12,y:10+index*8})),
      ...body.slice(current*13,(current+1)*13).map((text,index)=>({text,color:INK,x:110,y:48+index*8})),
    ] };
  }
  const paragraphs = [copy.title, copy.issuer, `${copy.issuedDate}   ${copy.reference}`, copy.subject,
    ...copy.paragraphs, copy.signature].filter(Boolean);
  const lines = paragraphs.flatMap((paragraph, index) => [
    ...(index ? [{ text: '', color: INK }] : []),
    ...wrap(paragraph, width - 24).map(text => ({ text, color: index === 0 ? '#793f34' : INK })),
  ]);
  const capacity = copy.contact ? 14 : 15;
  const count = Math.max(1, Math.ceil(lines.length / capacity));
  const current = Math.max(0, Math.min(count - 1, page));
  return { copy, lines: lines.slice(current * capacity, (current + 1) * capacity).map((line,index)=>({...line,x:12,y:10+index*8})), count, page: current };
}

export function storyPaperDescription(paper: StoryPaper, locale: Locale, story?: NarrativeState): string {
  const copy = storyDocumentCopy(paper.data, locale, story);
  if (!paper.opened) return `${translations[locale].paperwork.envelope}. ${copy.issuer}. ${copy.issuedDate}.`;
  return [copy.title, copy.issuer, copy.subject, copy.issuedDate, copy.reference, ...copy.paragraphs, copy.signature,
    copy.contact ? `${translations[locale].story.ui.telephone} ${STORY_CONTACTS[copy.contact].phone}` : ''].filter(Boolean).join(' ');
}

export const storyPhoneRect = (bounds: Rect): Rect => ({ x: bounds.x + 10, y: bounds.y + bounds.h - 46, w: bounds.w - 20, h: 12 });

function artFor(paper: StoryPaper): StoryArt | undefined {
  const id = paper.data.definitionId;
  if (id === 'A-WARNING') return 'warning';
  if (id === 'A-EXPOSURE') return 'exposure';
  if (id === 'G-ORDER') return 'carbon-copy';
  if (id === 'I-NOTE' || id === 'I-THANKS') return 'private-note';
  if (id === 'J-PARTY-CARD') return 'party-card-open';
  if (id.includes('LEAFLET') || id === 'END-UNION' || id === 'C-PRINT-NOTE' || id === 'C-PAUSE') return 'leaflet';
  return undefined;
}

export function drawStoryPaper(ctx: CanvasRenderingContext2D, paper: StoryPaper, bounds: Rect, locale: Locale,
  page: number, actions: boolean, story?: NarrativeState): void {
  const { x, y, w, h } = bounds;
  const art = artFor(paper);
  if (!paper.opened) drawStationery(ctx, 'envelope', x, y, w, h);
  else if (art) drawStoryArt(ctx, art === 'party-card-open' && w < 190 ? 'party-card-cover' : art, x, y, w, h);
  else drawPaper(ctx, x, y, w, h);
  if (w < 190) return;
  const { copy, lines, count, page: current } = storyPaperLayout(paper, locale, page, w, story);
  if (!paper.opened) {
    wrap(copy.issuer, w - 60).forEach((line, index) => drawDocumentText(ctx, line, x + 30, y + 75 + index * 8, { color: INK }));
    return;
  }
  lines.forEach(line => drawDocumentText(ctx, line.text, x + line.x, y + line.y, { color: line.color }));
  const id = paper.data.definitionId;
  if (id === 'J-PARTY-CARD') drawStoryArt(ctx,'malec-photo',x+12,y+88,48,40);
  if (copy.mark === 'union') drawText(ctx, locale === 'pl' ? 'W' : 'M', x + w - 29, y + h - 35, { color: '#a33128', scale: 2 });
  else if (copy.mark === 'voluntary') {
    drawStoryArt(ctx, 'voluntary-imprint', x + 12, y + h - 39, w - 24, 22);
    drawDocumentText(ctx, translations[locale].story.ui.voluntary, x + Math.floor(w / 2), y + h - 31, { color: '#704361', align: 'center' });
  }
  else if (id === 'C-BHP' || id === 'C-BHP-2') drawStoryArt(ctx, 'bhp-paraph', x + w - 64, y + h - 35, 45, 18);
  else if (id === 'F-EDITOR') drawStoryArt(ctx, 'editor-paraph', x + w - 64, y + h - 35, 45, 18);
  else if (id === 'D-PARTY' || id === 'END-PARTY') drawStoryArt(ctx, 'committee-seal', x + w - 54, y + h - 35, 35, 22);
  else if (id === 'SYS-SECURITY' || id === 'END-SECURITY') drawStoryArt(ctx, 'security-seal', x + w - 54, y + h - 35, 35, 22);
  else if (!art) {
    drawAdministrativeStamp(ctx, id.includes('CHAMBER') || id.startsWith('A-FAKE') ? 'chamber' : 'clinic', locale, x + w - 70, y + h - 35, true);
    drawDocumentSignature(ctx, x + 16, y + h - 30, 45, 10);
  }
  if (copy.contact) drawDocumentText(ctx, `${translations[locale].story.ui.telephone} ${STORY_CONTACTS[copy.contact].phone}`, x + 12, y + h - 43, { color: BLUE });
  drawDocumentText(ctx, `${current + 1}/${count}`, x + Math.floor(w / 2), y + h - 12, { color: INK, align: 'center' });
  if (actions) {
    const corners = notePageControls(bounds);
    if (current > 0) drawManualArt(ctx, 'corner-left', corners.previous.x + 2, corners.previous.y + 2, 9, 9);
    if (current < count - 1) drawManualArt(ctx, 'corner-right', corners.next.x + 2, corners.next.y + 2, 9, 9);
  }
}
