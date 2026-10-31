import { historicalState, legacyBudget, withMigratedNewspaper } from './fixtures/legacy-budget';
import { gunzipSync, gzipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, type GameState } from '../src/core/game';
import { decodeSave, encodeSave, importSave } from '../src/core/save';
import { createRoster } from '../src/core/patients';
import { homePage, homePages } from '../src/scenes/home';

const next = (state: GameState): GameState => applyAction(state, 'next-day').state;
function friday(money: number, seed = 1, insuranceRate = 300): GameState {
  const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
  return applyAction({ ...cabinet, roster: cabinet.roster.filter(id => id <= 3127), day: 2, money, insuranceRate, clockMinutes: 840 }, 'end-day').state;
}
const file = (state: unknown, version = 29): Uint8Array => gzipSync(strToU8(JSON.stringify({
  game: 'next-please', version, savedAt: '2026-10-26T12:00:00.000Z', state: version < 24 ? legacyBudget(state) : historicalState(state, version),
})));

describe('weekend living costs and bankruptcy', () => {
  it('charges one premium across Friday, Saturday and Sunday while the rate still recovers', () => {
    const fri = friday(3000, 1, 500), sat = next(fri), sun = next(sat);
    expect(fri.settlement!.insuranceCost).toBe(450);
    expect(sat.settlement!.insuranceCost).toBe(0);
    expect(sun.settlement!.insuranceCost).toBe(0);
    expect([fri.insuranceRate, sat.insuranceRate, sun.insuranceRate]).toEqual([450, 400, 350]);
    const mon = next(sun);
    expect(mon).toMatchObject({ day: 5, phase: 'cabinet', money: sun.money, settlement: null, insuranceRate: 350 });
  });

  it('covers three modest days with 800 total instead of borrowing for the weekend', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const fri = friday(200, seed), sat = next(fri), sun = next(sat);
      expect(fri.money).toBeGreaterThanOrEqual(100);
      expect(fri.settlement!.livingCost + sat.settlement!.livingCost + sun.settlement!.livingCost).toBe(800);
      expect(sun.money).toBe(100);
      expect(sat.settlement!.income + sun.settlement!.income).toBe(0);
      expect(decodeSave(encodeSave(sat))).toEqual(sat);
      expect(next(decodeSave(encodeSave(sat)))).toEqual(sun);
    }
  });

  it('ends the game when even the modest allowance is unaffordable', () => {
    const endingDays = new Set<number>();
    for (let seed = 1; seed <= 100; seed++) {
      const fri = friday(0, seed), sat = next(fri), sun = next(sat);
      expect(sun.ending).toBe('bankruptcy');
      expect(sun.money).toBeLessThan(0);
      expect(next(sun)).toBe(sun);
      for (const state of [fri, sat, sun]) expect(decodeSave(encodeSave(state))).toEqual(state);
      endingDays.add(sun.day);
    }
    expect(endingDays).toEqual(new Set([2, 3, 4]));
  });

  it.each([
    { insuranceRate: 300, completed: 0, fines: 0, zusCases: 0 },
    { insuranceRate: 500, completed: 2, fines: 500, zusCases: 2 },
  ])('uses the full 800 plus insurance and fines, including Friday bonuses: %j', ({ insuranceRate, completed, fines, zusCases }) => {
    const premium = Math.max(300, insuranceRate - 50), income = 1000 + 50 * completed;
    for (let seed = 1; seed <= 50; seed++) for (const difference of [-1, 0, 1]) {
      const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
      const fri = applyAction({ ...cabinet, day: 2, clockMinutes: 840, insuranceRate,
        money: 800 + premium + fines - income + difference, shiftCompleted: completed, patientsProcessed: completed,
        daily: { ...cabinet.daily, fines, zusCases } }, 'end-day').state;
      const sat = next(decodeSave(encodeSave(fri))), sun = next(decodeSave(encodeSave(sat)));
      expect(sun.money).toBe(difference);
      expect(sun.ending).toBe(difference < 0 ? 'bankruptcy' : null);
      expect(decodeSave(encodeSave(sun))).toEqual(sun);
      if (difference >= 0) {
        expect(sun.day).toBe(4);
        const ledgers = [...sun.budgetHistory, sun.settlement!];
        expect(ledgers.reduce((sum, ledger) => sum + ledger.livingCost, 0)).toBe(800);
        expect(ledgers.reduce((sum, ledger) => sum + ledger.insuranceCost, 0)).toBe(premium);
        expect(ledgers.reduce((sum, ledger) => sum + ledger.fines, 0)).toBe(fines);
        expect(next(sun)).toMatchObject({ day: 5, phase: 'cabinet', money: difference, ending: null });
      } else expect(next(sun)).toBe(sun);
    }
  });

  it('ends a bankrupt Friday before any weekend costs or premiums', () => {
    const fri = friday(-5000), sat = next(fri), sun = next(sat);
    expect(fri.money).toBeLessThan(0);
    expect(sat.money).toBe(fri.money);
    expect(sun.money).toBe(fri.money);
    expect(fri.ending).toBe('bankruptcy');
    expect(sat).toBe(fri); expect(sun).toBe(fri);
    expect(decodeSave(encodeSave(sun))).toEqual(sun);
  });

  it('charges ordinary daily living costs when savings cover both drawn days', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const fri = friday(10000, seed), sat = next(fri), sun = next(sat);
      for (const state of [sat, sun]) {
        expect(state.settlement!.livingCost).toBeGreaterThanOrEqual(400);
        expect(state.settlement!.livingCost).toBeLessThanOrEqual(800);
        expect(state.money).toBeGreaterThanOrEqual(0);
      }
      expect(sun.settlement!.livingCost).toBe(sat.settlement!.weekend!.sundayLivingCost);
    }
  });

  it('protects Sunday provisions while extra events still spend larger savings', () => {
    let events = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const fri = friday(10000, seed), sat = next(fri), sun = next(sat);
      events += Number(sat.settlement!.event !== null) + Number(sun.settlement!.event !== null);
      expect(sat.money).toBeGreaterThanOrEqual(sat.settlement!.weekend!.sundayLivingCost);
      expect(sun.money).toBeGreaterThanOrEqual(0);
      expect(decodeSave(encodeSave(sat))).toEqual(sat);
      expect(decodeSave(encodeSave(sun))).toEqual(sun);
    }
    expect(events).toBeGreaterThan(0);
  });
});

describe('weekend saves', () => {
  it('preserves cash-capped v21 weekends while new plans use the required allowance', async () => {
    let checked = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const fri = friday(0, seed);
      if (fri.ending) continue;
      const sat = next(fri), ledger = sat.settlement!;
      const remaining = Math.min(fri.money, 800 - fri.settlement!.livingCost);
      const livingCost = Math.floor(remaining / 2);
      const oldSaturday: GameState = { ...sat, ending: null, money: fri.money - livingCost,
        settlement: { ...ledger, livingCost, expenses: livingCost, closingBalance: fri.money - livingCost,
          weekend: { modest: true, sundayLivingCost: remaining - livingCost } } };
      for (const old of [oldSaturday, next(oldSaturday)]) {
        const loaded = decodeSave(file(old, 21));
        expect(loaded).toEqual(withMigratedNewspaper(old));
        expect(decodeSave(encodeSave(loaded))).toEqual(loaded);
        expect(next(loaded)).toEqual(next({ ...old, newspaper: loaded.newspaper, newspaperCopies: loaded.newspaperCopies }));
      }
      expect(next(oldSaturday)).toMatchObject({ day: 4, money: 0, ending: null });
      const restoredFriday = decodeSave(file(fri, 21));
      expect(next(restoredFriday)).toEqual({ ...sat, newspaper: restoredFriday.newspaper, newspaperCopies: restoredFriday.newspaperCopies });
      expect(next(sat).ending).toBe('bankruptcy');
      // New debt-bearing plans must never pass the frozen v21 validator.
      expect(() => decodeSave(file(sat, 21))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
      const ended = next(sat);
      const invalid = file({ ...ended, ending: null });
      let live = ended;
      await expect(importSave({ size: invalid.length, arrayBuffer: async () => invalid.buffer as ArrayBuffer } as File)
        .then(loaded => { live = loaded; })).rejects.toMatchObject({ code: 'invalid-state' });
      expect(live).toBe(ended);
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('keeps Friday and Saturday reloads deterministic and never bills settled days twice', () => {
    const fri = friday(200), sat = next(fri);
    expect(next(decodeSave(encodeSave(fri)))).toEqual(sat);
    expect(next(decodeSave(encodeSave(sat)))).toEqual(next(sat));
    expect(applyAction(decodeSave(encodeSave(sat)), 'end-day').state).toEqual(sat);
    expect(JSON.parse(new TextDecoder().decode(gunzipSync(encodeSave(sat)))).version).toBe(34);
  });

  it('preserves the whole weekend budget through saving, month rollover and Monday', () => {
    const cabinet = applyAction(createInitialState(17), 'skip-intro').state;
    const fri = applyAction({ ...cabinet, day: 58, money: 200, clockMinutes: 840 }, 'end-day').state;
    const sat = next(decodeSave(encodeSave(fri))), sun = next(decodeSave(encodeSave(sat)));
    expect(sat.budgetHistory).toEqual([fri.settlement]);
    expect(sun.budgetHistory).toEqual([fri.settlement, sat.settlement]);
    expect(sun.previousMonthBalance).toBe(sat.money);
    const loaded = decodeSave(encodeSave(sun));
    expect(loaded).toEqual(sun);
    for (const locale of ['pl', 'en'] as const) {
      const budget = homePage(loaded, locale, homePages(loaded).indexOf('budget'));
      expect(budget.rows[2]!.value).toBe('200 zł');
      expect(budget.rows[3]!.value).toBe('-800 zł');
    }
    expect(next(loaded)).toMatchObject({ phase: 'cabinet', day: 61, budgetHistory: [], money: sun.money });
  });

  it('rejects broken weekend history without replacing the live budget', async () => {
    const fri = friday(200), sat = next(fri), state = next(sat);
    const invalidHistories: unknown[] = [undefined, null, {}, [null], [fri.settlement],
      [...state.budgetHistory, sat.settlement],
      [{ ...fri.settlement, extra: true }, sat.settlement],
      [{ ...fri.settlement, day: 1 }, sat.settlement],
      [{ ...fri.settlement, expenses: 0 }, sat.settlement],
      [{ ...fri.settlement, openingBalance: 201, closingBalance: fri.money + 1 }, sat.settlement],
      [fri.settlement, { ...sat.settlement, weekend: { ...sat.settlement!.weekend, sundayLivingCost: sat.settlement!.weekend!.sundayLivingCost + 1 } }],
    ];
    for (const budgetHistory of invalidHistories) {
      const bytes = file({ ...state, budgetHistory });
      let live = state;
      await expect(importSave({ size: bytes.length, arrayBuffer: async () => bytes.buffer as ArrayBuffer } as File)
        .then(loaded => { live = loaded; })).rejects.toMatchObject({ code: 'invalid-state' });
      expect(live).toBe(state);
    }
    expect(() => decodeSave(file({ ...next(state), budgetHistory: state.budgetHistory }))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
  });

  it('imports v19 without inventing missing costs or settling a day again', () => {
    for (const current of [friday(200), next(friday(200)), next(next(friday(200)))]) {
      const { budgetHistory: _history, ...old } = current;
      if (old.roster.length) old.roster = createRoster(1, false, patient => patient.id < 5253).roster.filter(id => id <= 3127);
      const loaded = decodeSave(file(old, 19));
      expect(loaded).toEqual(withMigratedNewspaper({ ...old, budgetHistory: [] }));
      expect(decodeSave(encodeSave(loaded))).toEqual(loaded);
      expect(next(loaded).money).toBe(next(current).money);
      expect(next(loaded).rngState).toBe(next(current).rngState);
      expect(() => decodeSave(file(current, 19))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
    }
  });

  it('rejects missing, malformed and inconsistent weekend plans without replacing live state', async () => {
    const state = next(friday(200));
    for (const weekend of [undefined, {}, { modest: true, sundayLivingCost: -1 }, { modest: true, sundayLivingCost: 801 },
      { modest: true, sundayLivingCost: 10.5 }, { modest: true, sundayLivingCost: 500 },
      { modest: true, sundayLivingCost: 0, extra: true }, { modest: 'yes', sundayLivingCost: 0 }, null]) {
      const invalid = { ...state, settlement: { ...state.settlement, weekend } };
      expect(() => decodeSave(file(invalid))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
      const bytes = file(invalid);
      let live = state;
      await expect(importSave({ size: bytes.length, arrayBuffer: async () => bytes.buffer as ArrayBuffer } as File)
        .then(loaded => { live = loaded; })).rejects.toMatchObject({ code: 'invalid-state' });
      expect(live).toBe(state);
    }
    const sun = next(state);
    expect(() => decodeSave(file({ ...sun, settlement: { ...sun.settlement, weekend: { modest: true, sundayLivingCost: 1 } } })))
      .toThrowError(expect.objectContaining({ code: 'invalid-state' }));
  });

  it('migrates an already paid v16 Saturday without refunds or another Sunday charge', () => {
    const current = friday(3000);
    const { weekend: _weekend, ...ledger } = current.settlement!;
    const { budgetHistory: _history, pendingReferrals: _pending, referralsIssued: _issued, ...legacy } = current;
    const old = { ...legacy, day: 3, roster: [], money: ledger.openingBalance - ledger.expenses,
      settlement: { ...ledger, day: 3, basePay: 0, income: 0, closingBalance: ledger.openingBalance - ledger.expenses } };
    const migrated = decodeSave(file(old, 16));
    expect(migrated.money).toBe(old.money);
    expect(migrated.settlement).toEqual({ ...old.settlement, weekend: null });
    expect(migrated.rngState).toBe(old.rngState);
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    expect(next(migrated).settlement).toMatchObject({ livingCost: 0, insuranceCost: 0 });
    expect(() => decodeSave(file(migrated, 16))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
  });
});
