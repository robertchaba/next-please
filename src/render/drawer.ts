import { type DrawerId, type GameState, type Paper } from '../core/game';
import type { Rect } from '../core/desk';
import { formatGameDate } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import type { Button } from '../ui';
import { drawDrawerInterior, drawPaperclip, drawBanknote, drawArchiveFolder, drawNewspaperArt } from './clinic';
import { drawManualCover } from './manual';
import { paperDescription } from './paperwork';
import { drawDocumentText, measureDocumentText } from './font';

/** Two columns of exposed file-cover labels preserve the original filing order. */
export const DRAWER_BATCH_SIZE = 24;
export const DRAWER_CLOSE: Rect = { x: 0, y: 288, w: 570, h: 32 };
const manualBounds: Rect = { x: 444, y: 216, w: 88, h: 48 };
const clipBounds: Rect = { x: 363, y: 239, w: 62, h: 44 };
export type DrawerAction = { type: 'newspaper'; day: number } | { type: 'paper'; id: number } | { type: 'item'; item: 'manual' | 'clip' } | { type: 'page'; page: number } | { type: 'close' } | { type: 'banknote'; id: number };

export function drawerNewspapers(state: GameState, page: number, drawer: DrawerId) {
  return state.newspaperCopies.filter(copy => copy.location === drawer).slice(page * 5, (page + 1) * 5).map((copy, index) => ({
    copy, bounds: { x: 294 + index % 2 * 150, y: 35 + Math.floor(index / 2) * 64, w: 88, h: 56 } satisfies Rect,
  }));
}

export function drawerSheets(state: GameState, page: number, drawer: DrawerId = 'drawer') {
  const groups = new Map(state.paperClips.flatMap(group => group.map(id => [id, group] as const)));
  const seen = new Set<number>();
  const papers = state.papers.filter(paper => {
    if (paper.location !== drawer || seen.has(paper.id)) return false;
    for (const id of groups.get(paper.id) ?? [paper.id]) if (typeof id === 'number') seen.add(id);
    return true;
  });
  const pages = Math.max(1, Math.ceil(papers.length / DRAWER_BATCH_SIZE), Math.ceil(state.newspaperCopies.filter(copy => copy.location === drawer).length / 5));
  const current = Math.max(0, Math.min(pages - 1, page));
  return { papers, pages, current, visible: papers.slice(current * DRAWER_BATCH_SIZE, (current + 1) * DRAWER_BATCH_SIZE).map((paper, index) => ({
    paper, bounds: { x: 30 + Math.floor(index / 12) * 121, y: 35 + index % 12 * 17, w: 116, h: 17 } satisfies Rect,
  })) };
}

function fitLabel(value: string, width: number): string {
  if (measureDocumentText(value) <= width) return value;
  let shortened = value;
  while (shortened && measureDocumentText(`${shortened}…`) > width) shortened = shortened.slice(0, -1);
  return `${shortened}…`;
}

function coverName(paper: Paper, locale: Locale): string {
  return paper.patientId === null ? paperDescription(paper, locale).split('.')[0]! : translations[locale].patientNames[paper.patientId]!;
}

function storedCash(state: GameState, drawer: DrawerId) { return state.banknotes.filter(note => note.location === drawer); }
const cashBounds: Rect = { x: 267, y: 227, w: 92, h: 56 };

export function drawerDescription(state: GameState, locale: Locale, page: number, drawer: DrawerId = 'drawer'): string {
  const t = translations[locale], sheets = drawerSheets(state, page, drawer);
  return `${t.drawerNames[drawer]}. ${t.drawerViewHelp} ${t.drawerDocuments}: ${sheets.papers.length}. ${t.drawerObjects}: ${Number(state.drawerItems[drawer].manual) + state.drawerItems[drawer].clips + storedCash(state, drawer).length + state.newspaperCopies.filter(copy => copy.location === drawer).length}. ${t.drawerBatch} ${sheets.current + 1}/${sheets.pages}.`;
}

export function drawerButtons(state: GameState, locale: Locale, page: number, onAction: (action: DrawerAction) => void, drawer: DrawerId = 'drawer'): Button[] {
  const t = translations[locale], sheets = drawerSheets(state, page, drawer), cash = storedCash(state, drawer);
  return [
    ...drawerNewspapers(state, sheets.current, drawer).map(({ copy, bounds }): Button => ({ id: `drawer-newspaper-${copy.day}`, kind: 'hotspot', ...bounds,
      label: `${t.drawerRetrieve}: ${t.newspaper.shortTitle} ${formatGameDate(copy.day, locale)}`, action: () => onAction({ type: 'newspaper', day: copy.day }),
    })),
    ...(cash.length ? [{ id: 'drawer-banknote', kind: 'hotspot' as const, ...cashBounds, label: `${t.drawerRetrieve}: ${t.progression.banknote}. ${t.drawerCash}: ${cash.length * 100} zł`, action: () => onAction({ type: 'banknote', id: cash.at(-1)!.id }) }] : []),
    ...sheets.visible.map(({ paper, bounds }): Button => ({ id: `drawer-paper-${paper.id}`, kind: 'hotspot', ...bounds,
      label: `${t.drawerRetrieve}: ${coverName(paper, locale)}. ${formatGameDate(paper.day, locale)}`,
      action: () => onAction({ type: 'paper', id: paper.id }),
    })),
    ...(state.drawerItems[drawer].manual ? [{ id: 'drawer-manual', kind: 'hotspot' as const, ...manualBounds, label: `${t.drawerRetrieve}: ${t.manual}`,
      action: () => onAction({ type: 'item', item: 'manual' }) }] : []),
    ...(state.drawerItems[drawer].clips ? [{ id: 'drawer-clip', kind: 'hotspot' as const, ...clipBounds, label: `${t.drawerRetrieve}: ${t.paperwork.paperclip}. ${state.drawerItems[drawer].clips}`,
      action: () => onAction({ type: 'item', item: 'clip' }) }] : []),
    ...(sheets.current > 0 ? [{ id: 'drawer-previous', kind: 'text' as const, x: 30, y: 263, w: 116, h: 19, label: t.drawerPrevious,
      action: () => onAction({ type: 'page', page: sheets.current - 1 }) }] : []),
    ...(sheets.current + 1 < sheets.pages ? [{ id: 'drawer-next', kind: 'text' as const, x: 151, y: 263, w: 116, h: 19, label: t.drawerNext,
      action: () => onAction({ type: 'page', page: sheets.current + 1 }) }] : []),
    { id: 'drawer-close', kind: 'hotspot', ...DRAWER_CLOSE, label: t.drawerClose, action: () => onAction({ type: 'close' }) },
  ];
}

export function renderDrawer(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, page: number, activeId = '', drawer: DrawerId = 'drawer'): void {
  const t = translations[locale];
  drawDrawerInterior(ctx);
  const cash = storedCash(state, drawer);
  for (let index = 0; index < Math.min(8, cash.length); index++) drawBanknote(ctx, 267, 241 - index * 2);
  const sheets = drawerSheets(state, page, drawer);
  // Only the labelled upper strip of each generated cover is exposed. The lower
  // cover edges stay inside the paper compartment, away from navigation targets.
  ctx.save(); ctx.beginPath(); ctx.rect(28, 33, 241, 210); ctx.clip();
  for (const { paper, bounds } of sheets.visible) {
    drawArchiveFolder(ctx, bounds.x, bounds.y, bounds.w, 72);
    if (activeId === `drawer-paper-${paper.id}`) drawDocumentText(ctx, fitLabel(coverName(paper, locale), 96), bounds.x + 9, bounds.y + 10, { color: '#385b78' });
  }
  ctx.restore();
  for (const { copy, bounds } of drawerNewspapers(state, sheets.current, drawer)) {
    drawNewspaperArt(ctx, false, bounds.x, bounds.y, bounds.w, bounds.h);
    if (activeId === `drawer-newspaper-${copy.day}`) drawDocumentText(ctx, `${t.newspaper.shortTitle} ${formatGameDate(copy.day, locale)}`, bounds.x + 44, bounds.y + 56, { align: 'center', color: '#d9cfaa' });
  }
  if (state.drawerItems[drawer].manual) drawManualCover(ctx, manualBounds, false);
  for (let index = 0; index < Math.min(8, state.drawerItems[drawer].clips); index++) {
    drawPaperclip(ctx, clipBounds.x + (index % 4) * 13, clipBounds.y + Math.floor(index / 4) * 14);
  }
  if (state.drawerItems[drawer].clips) drawDocumentText(ctx, String(state.drawerItems[drawer].clips), 422, 274, { align: 'right', color: '#d9cfaa' });
  if (sheets.pages > 1) drawDocumentText(ctx, `${sheets.current + 1}/${sheets.pages}`, 148, 246, { align: 'center', color: '#d9cfaa' });
}
