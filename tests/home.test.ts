import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, type GameState } from '../src/core/game';
import { homePage, homePages } from '../src/scenes/home';
import { measureDocumentText, measureText } from '../src/render/font';
import { translations } from '../src/i18n';
import type { ExpenseKind } from '../src/core/economy';

function homeState(day = 1, money = 0): GameState {
  const cabinet = applyAction(createInitialState(17), 'skip-intro').state;
  return applyAction({ ...cabinet, day, clockMinutes: 840, money }, 'end-day').state;
}

const eventKinds: ExpenseKind[] = ['medicine', 'car-repair', 'home-repair', 'fur-coat', 'mountain-trip', 'seaside-trip'];

describe('localized home sequence', () => {
  it('shows only five requested budget rows, without explanations or event prices', () => {
    const state = homeState(), before = structuredClone(state);
    for (const locale of ['pl', 'en'] as const) {
      const content = homePage(state, locale, homePages(state).indexOf('budget'));
      const h = translations[locale].home;
      expect(content.rows.map(row => row.label)).toEqual([h.base, h.bonus, h.previousMonth, h.fines, h.insurance]);
      expect(content.rows.map(row => row.value)).toEqual([locale === 'pl' ? '1000 zł' : '1,000 zł', '0 zł', '0 zł', '0 zł', '300 zł']);
      expect(content.text).not.toMatch(/%|x 50|400–800|minimum|Minimum|ZUS/);
    }
    expect(state).toEqual(before);
  });

  it('fits every enlarged page and all labels into the quiet native scene in both languages', () => {
    for (const locale of ['pl', 'en'] as const) for (const event of [null, ...eventKinds]) {
      const state = homeState();
      state.settlement!.event = event ? { kind: event, cost: 300 } : null;
      for (let page = 0; page < homePages(state).length; page++) {
        const content = homePage(state, locale, page);
        expect(measureText(content.title, 2), content.title).toBeLessThanOrEqual(314);
        expect(measureDocumentText(content.action) * 2, content.action).toBeLessThanOrEqual(314);
        expect(content.body.split('\n').length).toBeLessThanOrEqual(5);
        for (const line of content.body.split('\n')) expect(measureDocumentText(line) * 2, line).toBeLessThanOrEqual(312);
        for (const row of content.rows) expect((measureDocumentText(row.label) + measureDocumentText(row.value)) * 2 + 12).toBeLessThanOrEqual(312);
        expect(content.text).not.toContain('undefined');
      }
    }
  });

  it('keeps maximum supported carryover and debt amounts clear of the labels', () => {
    for (const locale of ['pl', 'en'] as const) for (const previousMonthBalance of [-999999999, 999999999]) {
      const state = { ...homeState(), previousMonthBalance };
      const content = homePage(state, locale, homePages(state).indexOf('budget'));
      for (const row of content.rows) expect((measureDocumentText(row.label) + measureDocumentText(row.value)) * 2 + 12, row.label).toBeLessThanOrEqual(312);
    }
  });

  it('includes optional events without rerolling and shows the next workday on departure', () => {
    const state = homeState();
    expect(homePages(state)).toEqual(['arrival', 'budget', 'work']);
    expect(homePage(state, 'pl', 2).date).toBe('04.11.1983');
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
    expect(homePage(sunday, 'pl', homePages(sunday).indexOf('work')).date).toBe('07.11.1983');
  });
});
