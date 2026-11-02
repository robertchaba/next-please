import type { GameState } from '../core/game';
import { isWeekend } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import { drawHomeIllustration, type HomeIllustration } from '../render/clinic';
import { drawText, measureText } from '../render/font';
import { ordinaryWeekendIllustration, weekendTripIllustration } from './weekend';
import { arrivalIllustration, budgetIllustration } from './home-art';

export const HOME_ACTION = { x: 23, y: 272, w: 318, h: 30 } as const;
export const HOME_AMOUNT_RIGHT = 319;
export type HomePageKind = 'hospital' | 'bankruptcy' | 'arrival' | 'event' | 'budget' | 'work';

/** The same original face as the welcome screen, wrapped at its rendered size. */
function homeLines(value: string, scale: number, width = 312): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of value.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureText(next, scale) > width) { lines.push(line); line = word; }
    else line = next;
  }
  lines.push(line);
  return lines;
}

/** Pages describe an already settled day. Reading or replaying them never rolls events. */
export function homePages(state: GameState): HomePageKind[] {
  if (state.ending === 'hospital') return ['hospital'];
  if (state.ending === 'bankruptcy') return ['budget', 'bankruptcy'];
  return ['arrival', ...(state.roster.length > 0 && state.settlement?.event ? ['event' as const] : []),
    ...(!isWeekend(state.day + 1) ? ['budget' as const, 'work' as const] : [])];
}

export function homePage(state: GameState, locale: Locale, page: number) {
  const h = translations[locale].home, s = state.settlement;
  if (state.ending === 'hospital') {
    const q = translations[locale].progression, body = homeLines(q.hospitalBody, 1, 286).join('\n');
    return { kind: 'hospital' as const, title: q.hospitalTitle, body, bodyScale: 1, rows: [], action: q.backToMenu,
      text: [q.hospitalTitle, body, q.gameOver, q.backToMenu].join('\n'), illustration: 'hospital-ending' as const, description: q.hospitalDescription };
  }
  const pages = homePages(state), kind = pages[Math.max(0, Math.min(page, pages.length - 1))]!;
  if (kind === 'bankruptcy') {
    const q = translations[locale].progression, body = homeLines(q.bankruptcyBody, 1, 286).join('\n');
    return { kind, title: q.bankruptcyTitle, body, bodyScale: 1, rows: [], action: q.restartGame,
      text: [q.bankruptcyTitle, body, q.gameOver, q.restartGame].join('\n'), illustration: 'bankruptcy-cloakroom' as const, description: q.bankruptcyDescription };
  }
  const rest = state.roster.length === 0;
  const modest = rest && s?.weekend?.modest === true;
  const ledgers = [...state.budgetHistory, ...(s ? [s] : [])];
  const sum = (key: 'basePay' | 'patientBonus' | 'bribeIncome' | 'livingCost' | 'fines' | 'insuranceCost'): number =>
    ledgers.reduce((total, ledger) => total + ledger[key], 0);
  const openingBalance = ledgers[0]?.openingBalance ?? 0;
  const extraExpenses = ledgers.reduce((total, ledger) => total + (ledger.event?.cost ?? 0), 0);
  const amount = (value: number): string => `${(value || 0).toLocaleString(locale === 'pl' ? 'pl-PL' : 'en-GB').replace(/\u00a0/g, ' ')} ${h.currency}`;
  const row = (label: string, value: number) => ({ label, value: amount(value), negative: value < 0 });
  const rows = kind === 'budget' && s ? [
    row(h.base, sum('basePay')),
    row(h.bonus, sum('patientBonus')),
    ...(sum('bribeIncome') ? [row(h.bribes, sum('bribeIncome'))] : []),
    row(state.budgetHistory.length ? h.beforeWeekend : h.previousDay, openingBalance),
    row(h.living, -sum('livingCost')),
    row(h.fines, -sum('fines')),
    row(h.insurance, -sum('insuranceCost')),
    ...(extraExpenses ? [row(h.extraExpenses, -extraExpenses)] : []),
    row(h.balance, s.closingBalance),
  ] : [];
  // One weekend illustration/comment, favouring a trip over an ordinary expense.
  const events = ledgers.flatMap(ledger => ledger.event ? [ledger.event.kind] : []);
  const event = rest ? events.find(kind => kind === 'mountain-trip' || kind === 'seaside-trip') ?? events[0] : s?.event?.kind;
  const title = kind === 'arrival' ? (rest ? h.weekendTitle : h.title)
    : kind === 'event' && event ? h.events[event]
    : kind === 'work' ? h.workTitle : rest ? h.weekendLedger : h.ledger;
  // Reuse entropy already saved by settlement. Reading, painting or importing a
  // card cannot draw randomness, change the simulation, or reroll its comment.
  const variant = (lines: readonly string[], offset: number, shift = 8): string => lines[((state.rngState >>> shift) + state.day + offset) % lines.length]!;
  const result = s ? s.closingBalance - openingBalance : 0;
  const budgetComments = result > 0 ? h.budgetComments.profit : result < 0 ? h.budgetComments.loss : h.budgetComments.even;
  let comment = kind === 'arrival' ? (modest ? h.modestRest : rest ? event ? h.eventComments[event] : h.rest : variant(h.arrivalComments, 0, 16))
    : kind === 'event' && event ? h.eventComments[event]
    : kind === 'work' ? variant(h.workComments, 5) : variant(budgetComments, 9);
  const trip = event === 'mountain-trip' || event === 'seaside-trip' ? weekendTripIllustration(state.day, event) : null;
  const arrival: HomeIllustration = !rest ? arrivalIllustration(state.day, state.rngState)
    : modest ? 'weekend-modest' : trip ?? (event ? 'weekend-budget' : ordinaryWeekendIllustration(state.day, state.rngState));
  const eventIllustration = trip ?? 'home-evening';
  const illustration: HomeIllustration = kind === 'work' ? 'going-to-work'
    : kind === 'arrival' ? arrival
    : kind === 'event' ? eventIllustration
    : budgetIllustration(state.day, state.rngState, [arrival, ...(!rest && event ? [eventIllustration] : [])]);
  if (kind === 'arrival' && !rest && illustration in h.arrivalSceneComments) {
    comment = variant(h.arrivalSceneComments[illustration as keyof typeof h.arrivalSceneComments], 3, 16);
  } else if (kind === 'arrival' && rest && illustration in h.weekendComments) {
    const comments = h.weekendComments[illustration as keyof typeof h.weekendComments];
    // Separate saved bits from the scene choice so both captions remain reachable.
    comment = comments[((state.rngState >>> 16) + state.day) % comments.length]!;
  }
  const bodyScale = kind === 'budget' ? 1 : 2;
  const body = homeLines(comment, bodyScale).join('\n');
  const next = pages[page + 1];
  const action = kind === 'work' ? h.enter : next === 'work' ? h.work : next ? h.onward : h.tomorrow;
  const text = [title, body, ...rows.map(row => `${row.label}: ${row.value}`), action].join('\n');
  return { kind, title, body, bodyScale, rows, action, text, illustration, description: h.illustrations[illustration] };
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
  reveal(content.body).split('\n').forEach((line, index) => drawText(ctx, line, 25,
    (content.kind === 'budget' ? 79 : (content.kind === 'hospital' || content.kind === 'bankruptcy') ? 85 : 99) + index * ((content.kind === 'hospital' || content.kind === 'bankruptcy') ? 16 : 24), { color: '#ded4b4', scale: content.bodyScale }));
  content.rows.forEach((row, index) => {
    const balance = index === content.rows.length - 1;
    const y = 112 + index * (content.rows.length > 8 ? 17 : content.rows.length > 7 ? 19 : 21) + (balance ? 5 : 0);
    if (balance && remaining > 0) {
      ctx.fillStyle = '#777b5c';
      ctx.fillRect(25, y - 6, HOME_AMOUNT_RIGHT - 25, 1);
    }
    drawText(ctx, reveal(row.label, 2), 25, y, { color: balance ? '#e8c58b' : '#ded4b4' });
    // Align to the full amount so its left edge stays fixed during typing.
    drawText(ctx, reveal(row.value), HOME_AMOUNT_RIGHT - measureText(row.value), y, { color: row.negative ? '#e18b79' : balance ? '#e8c58b' : '#e3d6b3' });
  });
  if (content.kind === 'hospital' || content.kind === 'bankruptcy') drawText(ctx, reveal(translations[locale].progression.gameOver), 25, 237, { color: '#d39a70' });
  drawText(ctx, reveal(content.action), HOME_ACTION.x + 2, HOME_ACTION.y + 9, { color: '#d39a70' });
}
