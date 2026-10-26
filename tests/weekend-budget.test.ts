import { gunzipSync, gzipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, type GameState } from '../src/core/game';
import { decodeSave, encodeSave, importSave } from '../src/core/save';

const next = (state: GameState): GameState => applyAction(state, 'next-day').state;
function friday(money: number, seed = 1, insuranceRate = 300): GameState {
  const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
  return applyAction({ ...cabinet, day: 2, money, insuranceRate, clockMinutes: 840 }, 'end-day').state;
}
const file = (state: unknown, version = 17): Uint8Array => gzipSync(strToU8(JSON.stringify({
  game: 'next-please', version, savedAt: '2026-10-26T12:00:00.000Z', state,
})));

describe('affordable weekends', () => {
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

  it('uses only available cash when even the modest allowance is unaffordable', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const fri = friday(0, seed), sat = next(fri), sun = next(sat);
      if (fri.ending === 'bankruptcy') { expect(sat).toBe(fri); expect(sun).toBe(fri); continue; }
      expect(sun.money).toBe(Math.min(0, fri.money));
      expect(fri.settlement!.livingCost + sat.settlement!.livingCost + sun.settlement!.livingCost).toBeLessThanOrEqual(800);
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
      const fri = friday(3000, seed), sat = next(fri), sun = next(sat);
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

describe('version 17 weekend saves', () => {
  it('keeps Friday and Saturday reloads deterministic and never bills settled days twice', () => {
    const fri = friday(200), sat = next(fri);
    expect(next(decodeSave(encodeSave(fri)))).toEqual(sat);
    expect(next(decodeSave(encodeSave(sat)))).toEqual(next(sat));
    expect(applyAction(decodeSave(encodeSave(sat)), 'end-day').state).toEqual(sat);
    expect(JSON.parse(new TextDecoder().decode(gunzipSync(encodeSave(sat)))).version).toBe(18);
  });

  it('rejects missing, malformed and unaffordable weekend plans without replacing live state', async () => {
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
    const old = { ...current, day: 3, roster: [], money: ledger.openingBalance - ledger.expenses,
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
