import { type GameState, type Paper, isDocumentClipped } from '../core/game';
import type { Rect } from '../core/desk';
import { formatGameDate } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import type { Button } from '../ui';
import { drawDrawerInterior, drawPaperclip, drawBanknote, drawArchiveFolder } from './clinic';
import { drawManualCover } from './manual';
import { drawPaperwork, paperDescription } from './paperwork';
import { drawDocumentText, measureDocumentText } from './font';

/** Two columns of exposed file-cover labels preserve the original filing order. */
export const DRAWER_BATCH_SIZE = 24;
export const DRAWER_CLOSE: Rect = { x: 0, y: 288, w: 570, h: 32 };
export const DRAWER_PREVIEW: Rect = { x: 283, y: 43, w: 250, h: 176 };
const manualBounds: Rect = { x: 444, y: 236, w: 88, h: 48 };
const clipBounds: Rect = { x: 363, y: 239, w: 62, h: 44 };
export type DrawerAction = { type: 'paper'; id: number } | { type: 'item'; item: 'manual' | 'clip' } | { type: 'page'; page: number } | { type: 'close' } | { type: 'return-bribe' };

export function drawerSheets(state: GameState, page: number) {
  const papers = state.papers.filter(paper => paper.location === 'drawer');
  const pages = Math.max(1, Math.ceil(papers.length / DRAWER_BATCH_SIZE));
  const current = Math.max(0, Math.min(pages - 1, page));
  return { papers, pages, current, visible: papers.slice(current * DRAWER_BATCH_SIZE, (current + 1) * DRAWER_BATCH_SIZE).map((paper, index) => ({
    paper, bounds: { x: 30 + Math.floor(index / 12) * 121, y: 35 + index % 12 * 17, w: 116, h: 17 } satisfies Rect,
  })) };
}

/** Focus and pointer hover share a single preview; changing page cannot expose a hidden sheet. */
export function drawerPreview(state: GameState, page: number, activeId = ''): Paper | undefined {
  const { visible } = drawerSheets(state, page);
  return visible.find(({ paper }) => activeId === `drawer-paper-${paper.id}`)?.paper ?? visible[0]?.paper;
}

function fitLabel(value: string, width: number): string {
  if (measureDocumentText(value) <= width) return value;
  let shortened = value;
  while (shortened && measureDocumentText(`${shortened}…`) > width) shortened = shortened.slice(0, -1);
  return `${shortened}…`;
}

export function drawerDescription(state: GameState, locale: Locale, page: number): string {
  const t = translations[locale], sheets = drawerSheets(state, page);
  return `${t.drawerViewHelp} ${t.drawerDocuments}: ${sheets.papers.length}. ${t.drawerObjects}: ${Number(state.drawerItems.manual) + state.drawerItems.clips}. ${t.drawerBatch} ${sheets.current + 1}/${sheets.pages}.`;
}

export function drawerButtons(state: GameState, locale: Locale, page: number, onAction: (action: DrawerAction) => void): Button[] {
  const t = translations[locale], sheets = drawerSheets(state, page);
  return [
    ...(state.visit?.bribe === 'accepted' ? [{ id: 'drawer-banknote', kind: 'hotspot' as const, x: 267, y: 241, w: 92, h: 42, label: t.progression.returnBribe, action: () => onAction({ type: 'return-bribe' }) }] : []),
    ...sheets.visible.map(({ paper, bounds }): Button => ({ id: `drawer-paper-${paper.id}`, kind: 'hotspot', ...bounds,
      label: `${t.drawerRetrieve}: ${paperDescription(paper, locale, isDocumentClipped(state, paper.id))}`,
      action: () => onAction({ type: 'paper', id: paper.id }),
    })),
    ...(state.drawerItems.manual ? [{ id: 'drawer-manual', kind: 'hotspot' as const, ...manualBounds, label: `${t.drawerRetrieve}: ${t.manual}`,
      action: () => onAction({ type: 'item', item: 'manual' }) }] : []),
    ...(state.drawerItems.clips ? [{ id: 'drawer-clip', kind: 'hotspot' as const, ...clipBounds, label: `${t.drawerRetrieve}: ${t.paperwork.paperclip}. ${state.drawerItems.clips}`,
      action: () => onAction({ type: 'item', item: 'clip' }) }] : []),
    ...(sheets.current > 0 ? [{ id: 'drawer-previous', kind: 'text' as const, x: 30, y: 263, w: 116, h: 19, label: t.drawerPrevious,
      action: () => onAction({ type: 'page', page: sheets.current - 1 }) }] : []),
    ...(sheets.current + 1 < sheets.pages ? [{ id: 'drawer-next', kind: 'text' as const, x: 151, y: 263, w: 116, h: 19, label: t.drawerNext,
      action: () => onAction({ type: 'page', page: sheets.current + 1 }) }] : []),
    { id: 'drawer-close', kind: 'hotspot', ...DRAWER_CLOSE, label: t.drawerClose, action: () => onAction({ type: 'close' }) },
  ];
}

export function renderDrawer(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, page: number, activeId = ''): void {
  drawDrawerInterior(ctx);
  if (state.visit?.bribe === 'accepted') drawBanknote(ctx, 267, 241);
  const sheets = drawerSheets(state, page), t = translations[locale];
  // Only the labelled upper strip of each generated cover is exposed. The lower
  // cover edges stay inside the paper compartment, away from navigation targets.
  ctx.save(); ctx.beginPath(); ctx.rect(28, 33, 241, 210); ctx.clip();
  for (const { paper, bounds } of sheets.visible) {
    drawArchiveFolder(ctx, bounds.x, bounds.y, bounds.w, 72);
    const title = paperDescription(paper, locale).split('.')[0]!;
    const name = paper.patientId === null ? title : t.patientNames[paper.patientId]!;
    drawDocumentText(ctx, fitLabel(name, 96), bounds.x + 9, bounds.y + 10, { color: paper.kind === 'note' ? '#385b78' : '#333b2b' });
  }
  ctx.restore();
  const preview = drawerPreview(state, page, activeId);
  if (preview) {
    drawDocumentText(ctx, fitLabel(paperDescription(preview, locale).split('.')[0]!, DRAWER_PREVIEW.w), DRAWER_PREVIEW.x, 29, { color: '#e2d8b9' });
    drawPaperwork(ctx, preview, DRAWER_PREVIEW, locale, false, isDocumentClipped(state, preview.id), false);
    drawDocumentText(ctx, `${formatGameDate(preview.day, locale)}   ${t.paperwork.reference}: ${preview.id}`, DRAWER_PREVIEW.x, 225, { color: '#d9cfaa' });
  }
  if (state.drawerItems.manual) drawManualCover(ctx, manualBounds, false);
  for (let index = 0; index < Math.min(8, state.drawerItems.clips); index++) {
    drawPaperclip(ctx, clipBounds.x + (index % 4) * 13, clipBounds.y + Math.floor(index / 4) * 14);
  }
  if (state.drawerItems.clips) drawDocumentText(ctx, String(state.drawerItems.clips), 422, 274, { align: 'right', color: '#d9cfaa' });
  if (sheets.pages > 1) drawDocumentText(ctx, `${sheets.current + 1}/${sheets.pages}`, 148, 246, { align: 'center', color: '#d9cfaa' });
}
