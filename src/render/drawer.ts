import { type GameState, isDocumentClipped, clippedDocuments } from '../core/game';
import type { Rect } from '../core/desk';
import { translations, type Locale } from '../i18n';
import type { Button } from '../ui';
import { drawDrawerInterior, drawPaperclip } from './clinic';
import { drawManualCover } from './manual';
import { drawPaperwork, paperDescription } from './paperwork';
import { drawDocumentText } from './font';

/** Each successive sheet covers most of the previous one, in filing order. */
export const DRAWER_BATCH_SIZE = 12;
export const DRAWER_CLOSE: Rect = { x: 0, y: 288, w: 570, h: 32 };
const manualBounds: Rect = { x: 444, y: 68, w: 88, h: 48 };
const clipBounds: Rect = { x: 453, y: 157, w: 62, h: 54 };
export type DrawerAction = { type: 'paper'; id: number } | { type: 'item'; item: 'manual' | 'clip' } | { type: 'page'; page: number } | { type: 'close' };

export function drawerSheets(state: GameState, page: number) {
  const papers = state.papers.filter(paper => paper.location === 'drawer');
  const pages = Math.max(1, Math.ceil(papers.length / DRAWER_BATCH_SIZE));
  const current = Math.max(0, Math.min(pages - 1, page));
  return { papers, pages, current, visible: papers.slice(current * DRAWER_BATCH_SIZE, (current + 1) * DRAWER_BATCH_SIZE).map((paper, index) => ({
    paper, bounds: { x: 30 + index * 18, y: 42 + index * 5, w: 188, h: 144 } satisfies Rect,
  })) };
}

export function drawerDescription(state: GameState, locale: Locale, page: number): string {
  const t = translations[locale], sheets = drawerSheets(state, page);
  return `${t.drawerViewHelp} ${t.drawerDocuments}: ${sheets.papers.length}. ${t.drawerObjects}: ${Number(state.drawerItems.manual) + state.drawerItems.clips}. ${t.drawerBatch} ${sheets.current + 1}/${sheets.pages}.`;
}

export function drawerButtons(state: GameState, locale: Locale, page: number, onAction: (action: DrawerAction) => void): Button[] {
  const t = translations[locale], sheets = drawerSheets(state, page);
  return [
    ...sheets.visible.map(({ paper, bounds }): Button => ({ id: `drawer-paper-${paper.id}`, kind: 'hotspot', ...bounds,
      label: `${t.drawerRetrieve}: ${paperDescription(paper, locale, isDocumentClipped(state, paper.id))}`,
      action: () => onAction({ type: 'paper', id: paper.id }),
    })),
    ...(state.drawerItems.manual ? [{ id: 'drawer-manual', kind: 'hotspot' as const, ...manualBounds, label: `${t.drawerRetrieve}: ${t.manual}`,
      action: () => onAction({ type: 'item', item: 'manual' }) }] : []),
    ...(state.drawerItems.clips ? [{ id: 'drawer-clip', kind: 'hotspot' as const, ...clipBounds, label: `${t.drawerRetrieve}: ${t.paperwork.paperclip}. ${state.drawerItems.clips}`,
      action: () => onAction({ type: 'item', item: 'clip' }) }] : []),
    ...(sheets.current > 0 ? [{ id: 'drawer-previous', kind: 'text' as const, x: 30, y: 263, w: 164, h: 19, label: t.drawerPrevious,
      action: () => onAction({ type: 'page', page: sheets.current - 1 }) }] : []),
    ...(sheets.current + 1 < sheets.pages ? [{ id: 'drawer-next', kind: 'text' as const, x: 262, y: 263, w: 150, h: 19, label: t.drawerNext,
      action: () => onAction({ type: 'page', page: sheets.current + 1 }) }] : []),
    { id: 'drawer-close', kind: 'hotspot', ...DRAWER_CLOSE, label: t.drawerClose, action: () => onAction({ type: 'close' }) },
  ];
}

export function renderDrawer(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, page: number): void {
  drawDrawerInterior(ctx);
  const sheets = drawerSheets(state, page);
  for (const { paper, bounds } of sheets.visible) {
    const group = clippedDocuments(state, paper.id);
    const top = [...sheets.papers].reverse().find(entry => group.includes(entry.id));
    drawPaperwork(ctx, paper, bounds, locale, false, isDocumentClipped(state, paper.id) && top?.id === paper.id, false);
  }
  if (state.drawerItems.manual) drawManualCover(ctx, manualBounds, false);
  for (let index = 0; index < Math.min(8, state.drawerItems.clips); index++) {
    drawPaperclip(ctx, clipBounds.x + (index % 4) * 13, clipBounds.y + Math.floor(index / 4) * 21);
  }
  if (state.drawerItems.clips) drawDocumentText(ctx, String(state.drawerItems.clips), 484, 216, { align: 'center', color: '#d9cfaa' });
  if (sheets.pages > 1) drawDocumentText(ctx, `${sheets.current + 1}/${sheets.pages}`, 224, 269, { align: 'center', color: '#d9cfaa' });
}
