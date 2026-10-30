import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { gameDate } from '../src/core/calendar';
import { applyAction, createInitialState, settleWeekend, type GameState } from '../src/core/game';
import { decodeSave, encodeSave } from '../src/core/save';
import { homePage } from '../src/scenes/home';
import { NEW_WEEKEND_ILLUSTRATIONS, ordinaryWeekendIllustrations, weekendTripIllustration } from '../src/scenes/weekend';
import { translations } from '../src/i18n';
import { measureText } from '../src/render/font';

function dayFor(year: number, month: number, day: number): number {
  return (Date.UTC(year, month - 1, day) - Date.UTC(1983, 10, 3)) / 86400000 + 1;
}
function friday(day = 2, seed = 17, money = 3000): GameState {
  const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
  return applyAction({ ...cabinet, day, money, clockMinutes: 840 }, 'end-day').state;
}
function weekend(day = 2, seed = 17, money = 3000): GameState {
  return settleWeekend(friday(day, seed, money));
}

describe('seasonal weekend presentation', () => {
  it('ends golden autumn on November 15 and keeps snow, spring and summer in their seasons', () => {
    expect(ordinaryWeekendIllustrations(dayFor(1983, 11, 15))).toContain('weekend-autumn-park');
    expect(ordinaryWeekendIllustrations(dayFor(1983, 11, 16))).not.toContain('weekend-autumn-park');
    for (let day = 1; day <= 800; day++) {
      const { month, day: date } = gameDate(day);
      const scenes = ordinaryWeekendIllustrations(day);
      expect(scenes).toEqual(expect.arrayContaining(['weekend-budget', 'weekend-reading', 'weekend-radio', 'weekend-soup']));
      if (scenes.includes('weekend-autumn-park')) expect(month === 10 || (month === 11 && date <= 15)).toBe(true);
      if (scenes.includes('weekend-rain-tram')) expect([3, 4, 9, 10, 11]).toContain(month);
      if (scenes.includes('weekend-winter-park')) expect([12, 1, 2]).toContain(month);
      if (scenes.includes('weekend-spring-park')) expect([3, 4, 5]).toContain(month);
      if (scenes.includes('weekend-summer-garden')) expect([6, 7, 8]).toContain(month);
    }
    expect(ordinaryWeekendIllustrations(dayFor(1983, 12, 1))).toContain('weekend-winter-park');
    expect(ordinaryWeekendIllustrations(dayFor(1984, 2, 29))).toContain('weekend-winter-park');
    expect(ordinaryWeekendIllustrations(dayFor(1984, 3, 1))).not.toContain('weekend-winter-park');
  });

  it('keeps one mountain view and uses winter seaside artwork December–February, including the year boundary', () => {
    for (const [month, date, winter] of [[11, 30, false], [12, 1, true], [1, 1, true], [2, 29, true], [3, 1, false]] as const) {
      const day = dayFor(month >= 11 ? 1983 : 1984, month, date);
      expect(weekendTripIllustration(day, 'mountain-trip')).toBe('weekend-mountain-resort');
      expect(weekendTripIllustration(day, 'seaside-trip')).toBe(winter ? 'weekend-winter-seaside' : 'weekend-seaside-resort');
    }
  });

  it('reaches both captions for all active new images, with readable PL/EN text and descriptions', () => {
    const baseline = weekend();
    const seen = { pl: new Set<string>(), en: new Set<string>() };
    for (const day of [4, dayFor(1983, 12, 4), dayFor(1984, 4, 8), dayFor(1984, 7, 8)]) {
      for (let seed = 0; seed < 520; seed++) for (const event of [null, 'mountain-trip', 'seaside-trip'] as const) {
        const state: GameState = { ...baseline, day, rngState: seed * 256 + 1, budgetHistory: [],
          settlement: { ...baseline.settlement!, event: event ? { kind: event, cost: 300 } : null,
            weekend: { modest: false, sundayLivingCost: 0 } } };
        for (const locale of ['pl', 'en'] as const) {
          const page = homePage(state, locale, 0);
          const lines = page.body.split('\n');
          expect(lines.length, page.body).toBeLessThanOrEqual(5);
          for (const line of lines) expect(measureText(line, 2), line).toBeLessThanOrEqual(312);
          expect(page.description).toBeTruthy();
          expect(page.text).not.toMatch(/undefined|\d{2}[./]\d{2}[./]\d{4}/);
          seen[locale].add(lines.join(' '));
        }
        expect(homePage(state, 'pl', 0).illustration).toBe(homePage(state, 'en', 0).illustration);
      }
    }
    for (const locale of ['pl', 'en'] as const) for (const name of NEW_WEEKEND_ILLUSTRATIONS) {
      const comments = translations[locale].home.weekendComments[name];
      expect(new Set(comments).size).toBe(2);
      for (const comment of comments) expect(seen[locale]).toContain(comment);
      expect(translations[locale].home.illustrations[name]).toBeTruthy();
      const png = readFileSync(new URL(`../public/assets/art/${name}.png`, import.meta.url));
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([570, 320]);
    }
  });

  it('retains saved outcomes, budget and priority of trips, ordinary expenses and modest weekends', () => {
    for (const friday of [2, dayFor(1983, 12, 2), dayFor(1984, 4, 6), dayFor(1984, 7, 6)]) {
      for (let seed = 1; seed <= 12; seed++) {
        const state = weekend(friday, seed), before = structuredClone(state);
        const loaded = decodeSave(encodeSave(state));
        for (const locale of ['pl', 'en'] as const) {
          expect(homePage(loaded, locale, 0)).toEqual(homePage(state, locale, 0));
          expect(homePage(loaded, locale, 1)).toEqual(homePage(state, locale, 1));
        }
        expect(state).toEqual(before);
      }
    }
    const state = weekend(dayFor(1983, 12, 2));
    state.budgetHistory[0]!.event = { kind: 'car-repair', cost: 300 };
    state.settlement!.event = { kind: 'mountain-trip', cost: 300 };
    state.settlement!.weekend!.modest = false;
    expect(homePage(state, 'pl', 0).illustration).toBe('weekend-mountain-resort');
    state.settlement!.event = null;
    expect(homePage(state, 'pl', 0).illustration).toBe('weekend-budget');
    expect(homePage(state, 'pl', 0).body.replaceAll('\n', ' ')).toBe(translations.pl.home.eventComments['car-repair']);
    state.settlement!.weekend!.modest = true;
    expect(homePage(state, 'pl', 0).illustration).toBe('weekend-modest');
    expect(homePage(state, 'pl', 1).illustration).toBe('weekend-budget');
  });

  it('allows at most one trip per weekend, including resumed Saturdays and month/year boundaries', () => {
    const trips = new Set<string>(), sundayTrips = new Set<string>();
    let ordinaryExpensesAfterTrip = 0;
    const isTrip = (kind?: string) => kind === 'mountain-trip' || kind === 'seaside-trip';
    for (const day of [2, 30, 58, 86]) for (let seed = 1; seed <= 100; seed++) {
      const saturday = applyAction(friday(day, seed, 100000), 'next-day').state;
      const sunday = applyAction(saturday, 'next-day').state;
      expect(applyAction(decodeSave(encodeSave(saturday)), 'next-day').state).toEqual(sunday);
      const first = saturday.settlement!.event?.kind, second = sunday.settlement!.event?.kind;
      expect(Number(isTrip(first)) + Number(isTrip(second))).toBeLessThanOrEqual(1);
      if (isTrip(first)) {
        trips.add(first!);
        if (second) ordinaryExpensesAfterTrip++;
        expect(homePage(sunday, 'pl', 0).illustration).toBe(weekendTripIllustration(sunday.day, first as 'mountain-trip' | 'seaside-trip'));
      }
      if (isTrip(second)) sundayTrips.add(second!);
      expect(decodeSave(encodeSave(sunday))).toEqual(sunday);
    }
    expect(trips).toEqual(new Set(['mountain-trip', 'seaside-trip']));
    expect(sundayTrips).toEqual(trips);
    expect(ordinaryExpensesAfterTrip).toBeGreaterThan(0);
  });

  it('preserves already settled historical double-trip saves without refunds or another settlement', () => {
    const isTrip = (kind?: string) => kind === 'mountain-trip' || kind === 'seaside-trip';
    let sample: GameState | undefined;
    for (let seed = 1; seed <= 300; seed++) {
      const state = weekend(2, seed, 100000);
      const saturday = state.budgetHistory[1]?.event, sunday = state.settlement?.event;
      if (isTrip(saturday?.kind) && sunday) {
        // Historical v29 could draw a second trip at the same expense bounds.
        // Keep all costs, balances and the RNG; restore only that former kind.
        sunday.kind = saturday!.kind === 'mountain-trip' ? 'seaside-trip' : 'mountain-trip';
        sample = state; break;
      }
    }
    expect(sample).toBeDefined();
    const state = sample!, first = state.budgetHistory[1]!.event!;
    const expected = first.kind === 'mountain-trip' ? 'weekend-mountain-resort' : 'weekend-seaside-resort';
    expect(homePage(state, 'pl', 0).illustration).toBe(expected);
    const expenses = [...state.budgetHistory, state.settlement!].reduce((sum, ledger) => sum + (ledger.event?.cost ?? 0), 0);
    const row = homePage(state, 'pl', 1).rows.find(row => row.label === translations.pl.home.extraExpenses)!;
    expect(Number(row.value.replace(/[^\d-]/g, ''))).toBe(-expenses);
    const loaded = decodeSave(encodeSave(state));
    expect(loaded).toEqual(state);
    expect(settleWeekend(loaded)).toBe(loaded);
    expect(homePage(loaded, 'pl', 0)).toEqual(homePage(state, 'pl', 0));
    expect(applyAction(loaded, 'next-day').state.money).toBe(state.money);
  });
});
