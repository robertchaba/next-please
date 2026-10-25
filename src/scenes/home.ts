import type { GameState } from '../core/game';
import { formatGameDate, isWeekend } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import { drawHomeIllustration, type HomeIllustration } from '../render/clinic';
import { drawText, measureText } from '../render/font';

export const HOME_ACTION = { x: 23, y: 272, w: 318, h: 30 } as const;
export type HomePageKind = 'arrival' | 'event' | 'budget' | 'work';

/** The same original face as the welcome screen, wrapped at its rendered size. */
function homeLines(value: string, scale: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureText(next, scale) > 312) { lines.push(line); line = word; }
    else line = next;
  }
  lines.push(line);
  return lines;
}

/** Pages describe an already settled day. Reading or replaying them never rolls events. */
export function homePages(state: GameState): HomePageKind[] {
  return ['arrival', ...(state.settlement?.event ? ['event' as const] : []), 'budget',
    ...(!isWeekend(state.day + 1) ? ['work' as const] : [])];
}

export function homePage(state: GameState, locale: Locale, page: number) {
  const h = translations[locale].home, s = state.settlement;
  const pages = homePages(state), kind = pages[Math.max(0, Math.min(page, pages.length - 1))]!;
  const rest = state.roster.length === 0;
  const amount = (value: number): string => `${value.toLocaleString(locale === 'pl' ? 'pl-PL' : 'en-GB').replace(/\u00a0/g, ' ')} ${h.currency}`;
  const rows = kind === 'budget' && s ? [
    { label: h.base, value: amount(s.basePay) },
    { label: h.bonus, value: amount(s.patientBonus) },
    { label: h.previousMonth, value: amount(state.previousMonthBalance) },
    { label: h.living, value: amount(s.livingCost) },
    { label: h.fines, value: amount(s.fines) },
    { label: h.insurance, value: amount(s.insuranceCost) },
  ] : [];
  const event = s?.event?.kind;
  const title = kind === 'arrival' ? (rest ? h.weekendTitle : h.title)
    : kind === 'event' && event ? h.events[event]
    : kind === 'work' ? h.workTitle : rest ? h.weekendLedger : h.ledger;
  const comment = kind === 'arrival' ? (rest ? h.rest : h.arrival)
    : kind === 'event' && event ? h.eventComments[event]
    : kind === 'work' ? h.workComment : rest ? h.weekendComment : h.ledgerComment;
  const illustration: HomeIllustration = kind === 'work' ? 'going-to-work'
    : kind === 'event' && event === 'mountain-trip' ? 'mountain-resort'
    : kind === 'event' && event === 'seaside-trip' ? 'seaside-resort'
    : rest ? 'weekend-budget' : kind === 'arrival' ? 'homecoming' : 'home-evening';
  const date = formatGameDate(state.day + Number(kind === 'work'), locale);
  const bodyScale = kind === 'budget' ? 1 : 2;
  const body = homeLines(comment, bodyScale).join('\n');
  const next = pages[page + 1];
  const action = kind === 'work' ? h.enter : next === 'budget' ? h.budget : next === 'work' ? h.work : next ? h.onward : h.tomorrow;
  const text = [title, date, body, ...rows.map(row => `${row.label}: ${row.value}`), action].join('\n');
  return { kind, title, date, body, bodyScale, rows, action, text, illustration, description: h.illustrations[illustration] };
}

/** Welcome-screen lettering; the cursor is supplied by presentation updates. */
export function renderHome(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, page: number, characters: number): void {
  const content = homePage(state, locale, page);
  drawHomeIllustration(ctx, content.illustration);
  let remaining = characters;
  const reveal = (value: string, separator = 1): string => {
    const visible = value.slice(0, Math.max(0, remaining));
    remaining -= value.length + separator;
    return visible;
  };
  drawText(ctx, reveal(content.title), 24, 25, { color: '#e3d6b3', scale: 2 });
  drawText(ctx, reveal(content.date), 25, 55, { color: '#aaa88d' });
  reveal(content.body).split('\n').forEach((line, index) => drawText(ctx, line, 25,
    (content.kind === 'budget' ? 79 : 99) + index * 24, { color: '#ded4b4', scale: content.bodyScale }));
  content.rows.forEach((row, index) => {
    drawText(ctx, reveal(row.label, 2), 25, 112 + index * 23, { color: '#ded4b4' });
    // Align to the full amount so its left edge stays fixed during typing.
    drawText(ctx, reveal(row.value), 337 - measureText(row.value), 112 + index * 23, { color: '#e3d6b3' });
  });
  drawText(ctx, reveal(content.action), HOME_ACTION.x + 2, HOME_ACTION.y + 9, { color: '#d39a70' });
}
