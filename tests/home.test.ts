import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, type GameState } from '../src/core/game';
import { HOME_AMOUNT_RIGHT, homePage, homePages } from '../src/scenes/home';
import { measureText } from '../src/render/font';
import { translations } from '../src/i18n';
import type { ExpenseKind } from '../src/core/economy';

function homeState(day = 1, money = 200): GameState {
  const cabinet = applyAction(createInitialState(17), 'skip-intro').state;
  return applyAction({ ...cabinet, day, clockMinutes: 840, money }, 'end-day').state;
}

const eventKinds: ExpenseKind[] = ['medicine', 'car-repair', 'home-repair', 'fur-coat', 'mountain-trip', 'seaside-trip'];

describe('localized home sequence', () => {
  it('shows living costs in the first day budget, without explanations or event prices', () => {
    const state = homeState(), before = structuredClone(state);
    for (const locale of ['pl', 'en'] as const) {
      const content = homePage(state, locale, homePages(state).indexOf('budget'));
      const h = translations[locale].home;
      expect(content.rows.map(row => row.label)).toEqual([h.base, h.bonus, h.previousMonth, h.living, h.fines, h.insurance]);
      expect(content.rows.map(row => row.value)).toEqual([locale === 'pl' ? '1000 zł' : '1,000 zł', '0 zł', '0 zł', `${state.settlement!.livingCost} zł`, '0 zł', '300 zł']);
      expect(content.text).not.toMatch(/%|x 50|400–800|minimum|Minimum|ZUS/);
    }
    expect(state.settlement!.livingCost).toBeGreaterThanOrEqual(400);
    expect(state.settlement!.livingCost).toBeLessThanOrEqual(800);
    expect(state.money).toBe(200 + 1000 - state.settlement!.livingCost - 300);
    expect(state).toEqual(before);
  });

  it('fits every enlarged page and all labels into the quiet native scene in both languages', () => {
    for (const locale of ['pl', 'en'] as const) for (const event of [null, ...eventKinds]) {
      const state = homeState();
      state.settlement!.event = event ? { kind: event, cost: 300 } : null;
      for (let page = 0; page < homePages(state).length; page++) {
        const content = homePage(state, locale, page);
        expect(measureText(content.title, 2), content.title).toBeLessThanOrEqual(314);
        expect(measureText(content.action), content.action).toBeLessThanOrEqual(314);
        expect(content.body.split('\n').length).toBeLessThanOrEqual(5);
        for (const line of content.body.split('\n')) expect(measureText(line, content.bodyScale), line).toBeLessThanOrEqual(312);
        for (const row of content.rows) expect(measureText(row.label) + measureText(row.value) + 12).toBeLessThanOrEqual(HOME_AMOUNT_RIGHT - 25);
        expect(content.text).not.toContain('undefined');
      }
    }
  });

  it('keeps maximum supported carryover and debt amounts clear of the labels', () => {
    for (const locale of ['pl', 'en'] as const) for (const previousMonthBalance of [-999999999, 999999999]) {
      const state = { ...homeState(), previousMonthBalance };
      const content = homePage(state, locale, homePages(state).indexOf('budget'));
      for (const row of content.rows) expect(measureText(row.label) + measureText(row.value) + 12, row.label).toBeLessThanOrEqual(HOME_AMOUNT_RIGHT - 25);
    }
  });

  it('includes optional events without rerolling and omits dates from every home page', () => {
    const state = homeState();
    expect(homePages(state)).toEqual(['arrival', 'budget', 'work']);
    for (const locale of ['pl', 'en'] as const) {
      expect(homePage(state, locale, 0).action).toBe(translations[locale].home.onward);
      for (let page = 0; page < homePages(state).length; page++) {
        expect(homePage(state, locale, page).text).not.toMatch(/\d{2}[./]\d{2}[./]\d{4}/);
      }
    }
    for (const kind of eventKinds) {
      state.settlement!.event = { kind, cost: 999 };
      const before = structuredClone(state);
      expect(homePages(state)).toEqual(['arrival', 'event', 'budget', 'work']);
      const content = homePage(state, 'pl', 1);
      expect(content.body).not.toContain('999');
      expect(homePage(state, 'pl', 1)).toEqual(content);
      expect(state).toEqual(before);
      if (kind === 'mountain-trip') expect(content.illustration).toBe('mountain-resort');
      if (kind === 'seaside-trip') expect(content.illustration).toBe('seaside-resort');
    }
  });

  it('gives weekends a separate budget and skips departures until Sunday evening', () => {
    const friday = homeState(2);
    expect(homePages(friday)).toEqual(['arrival', 'budget']);
    const saturday = applyAction(friday, 'next-day').state;
    expect(homePage(saturday, 'pl', 0).title).toBe('WOLNY DZIEŃ');
    const budget = homePage(saturday, 'pl', homePages(saturday).indexOf('budget'));
    expect(budget.illustration).toBe('weekend-budget');
    expect(budget.rows[0].value).toBe('0 zł');
    expect(homePages(saturday)).not.toContain('work');
    const sunday = applyAction(saturday, 'next-day').state;
    expect(homePages(sunday)).toContain('work');
    expect(homePage(sunday, 'pl', homePages(sunday).indexOf('work')).title).toBe('DO PRACY');
  });

  it('shows the modest weekend artwork and joke only when reduced living costs apply', () => {
    const saturday = applyAction(homeState(2, 200), 'next-day').state;
    const sunday = applyAction(saturday, 'next-day').state;
    for (const state of [saturday, sunday]) for (const locale of ['pl', 'en'] as const) {
      const before = structuredClone(state), content = homePage(state, locale, 0);
      expect(content.illustration).toBe('weekend-modest');
      expect(content.body.replaceAll('\n', ' ')).toBe(translations[locale].home.modestRest);
      expect(content.description).toBe(translations[locale].home.illustrations['weekend-modest']);
      expect(content.body.split('\n').length).toBeLessThanOrEqual(5);
      for (const line of content.body.split('\n')) expect(measureText(line, 2), line).toBeLessThanOrEqual(312);
      expect(state).toEqual(before);
    }
    const comfortable = applyAction(homeState(2, 5000), 'next-day').state;
    expect(homePage(comfortable, 'pl', 0).illustration).toBe('weekend-budget');
    expect(homePage(homeState(2, 200), 'pl', 0).illustration).toBe('homecoming');
    expect(homePage(sunday, 'pl', homePages(sunday).indexOf('work')).illustration).toBe('going-to-work');
  });

  it('keeps all twelve daily comments stable, translated and within the narrative area', () => {
    const state = homeState();
    for (const locale of ['pl', 'en'] as const) {
      const arrival = new Set<string>(), work = new Set<string>();
      for (let index = 0; index < 12; index++) {
        const sample = { ...state, rngState: index * 256 };
        const before = structuredClone(sample);
        for (const page of [0, 2]) {
          const content = homePage(sample, locale, page);
          (page === 0 ? arrival : work).add(content.body.replaceAll('\n', ' '));
          expect(content.body.split('\n').length).toBeLessThanOrEqual(5);
          for (const line of content.body.split('\n')) expect(measureText(line, 2), line).toBeLessThanOrEqual(312);
          expect(homePage(sample, locale, page)).toEqual(content);
        }
        expect(sample).toEqual(before);
      }
      expect(arrival).toEqual(new Set(translations[locale].home.arrivalComments));
      expect(work).toEqual(new Set(translations[locale].home.workComments));
    }
  });

  it('chooses the budget joke from the daily result, regardless of total savings', () => {
    const state = homeState();
    for (const locale of ['pl', 'en'] as const) for (const result of [-100, 0, 100]) {
      const pool = translations[locale].home.budgetComments[result < 0 ? 'loss' : result > 0 ? 'profit' : 'even'];
      const comments = new Set<string>();
      for (let index = 0; index < pool.length; index++) {
        const sample = { ...state, rngState: index * 256,
          settlement: { ...state.settlement!, openingBalance: 10000, closingBalance: 10000 + result } };
        const content = homePage(sample, locale, 1);
        comments.add(content.body);
        expect(measureText(content.body), content.body).toBeLessThanOrEqual(312);
        expect(content.body).not.toContain('\n');
      }
      expect(comments).toEqual(new Set(pool));
    }
  });
});
