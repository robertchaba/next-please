import { createDailyRoster } from '../src/core/progression';
import { createInitialState } from './fixtures/game';
import { describe, expect, it, vi } from 'vitest';
import { applyAction, canEndDay, createInitialState as createGame, PATIENTS, type GameAction, type GameState } from '../src/core/game';
import { emptyConsequences, expenseProbability, settleDay } from '../src/core/economy';
import { createRoster, randomStep } from '../src/core/patients';
import { decodeSave, encodeSave } from '../src/core/save';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
const cabinet = () => act(createInitialState(), 'skip-intro');
const seedFor = (fraction: number): number => Number(((BigInt(Math.floor(fraction * 0x1_0000_0000)) - 1013904223n) * 4276115653n) & 0xffff_ffffn);
function submit(patientId: number, decision: 'fit' | 'unfit', fraction: number, base = cabinet()): GameState {
  const roster = [...base.roster];
  const character = PATIENTS[patientId]!.characterId;
  const index = roster.findIndex(id => PATIENTS[id]!.characterId === character);
  [roster[base.shiftCompleted], roster[index]] = [patientId, roster[base.shiftCompleted]!];
  const prepared = act({ ...base, roster }, 'call-patient', 'take-document', 'take-certificate', 'write-certificate', decision === 'fit' ? 'stamp-fit' : 'stamp-unfit');
  return act({ ...prepared, rngState: seedFor(fraction) }, 'return-document');
}

describe('patient catalog and deterministic queues', () => {
  it('preserves the original 103 case fixtures while adding five identities per portrait', () => {
    expect(PATIENTS).toHaveLength(6193);
    expect(new Set(PATIENTS.map(patient => patient.characterId)).size).toBe(188);
    for (let character = 3; character < 28; character += 1) {
      const cases = PATIENTS.slice(0, 103).filter(patient => patient.characterId === character);
      expect(cases).toHaveLength(4);
      expect(new Set(cases.map(patient => patient.conditionId)).size).toBe(4);
      expect(new Set(cases.map(patient => patient.employerId)).size).toBe(4);
      expect(new Set(cases.map(patient => patient.portraitId)).size).toBe(1);
      expect(cases.every(patient => patient.expectedDecision === (patient.vision === 'pass' && patient.pressure === 'pass' ? 'fit' : 'unfit'))).toBe(true);
    }
  });
  it('replays a saved seed, changes another seed, and never repeats an identity within a day', () => {
    const first = createRoster(15), second = createRoster(16);
    expect(createRoster(15)).toEqual(first);
    expect(second.roster).not.toEqual(first.roster);
    expect(new Set(first.roster.map(id => PATIENTS[id]!.characterId)).size).toBe(188);
    expect(createInitialState(15).roster).toEqual(createDailyRoster(15, 1).roster);
    expect(createInitialState(15).roster.slice(0, 3)).not.toEqual([0, 1, 2]);
  });
});

describe('decision consequences', () => {
  it.each([
    [0, 'unfit', .249999, false], [0, 'unfit', .25, true],
    [23, 'unfit', .029999, false], [23, 'unfit', .030001, true],
    [1, 'fit', .349999, false], [1, 'fit', .350001, true],
  ] as const)('uses the precise unnoticed probability for patient %i, %s at %f', (id, decision, roll, detected) => {
    const state = submit(id, decision, roll);
    expect(state.papers.some(paper => paper.kind === 'letter')).toBe(detected);
    expect(state.daily.zusCases + state.daily.refusals).toBe(detected ? 1 : 0);
    expect(state.money).toBe(0);
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('keeps unnoticed incorrect decisions neutral instead of revealing an error', () => {
    const ready = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit');
    expect(applyAction({ ...ready, rngState: seedFor(.1) }, 'return-document').feedback).toBe('patient-completed');
    expect(applyAction({ ...ready, rngState: seedFor(.9) }, 'return-document').feedback).toBe('patient-error');
  });
  it('charges 100 for the first detected unsafe approval and 400 for each later one', () => {
    let state = submit(1, 'fit', .9);
    expect(state.daily).toMatchObject({ zusCases: 1, fines: 100 });
    state = submit(2, 'fit', .9, state);
    expect(state.daily).toMatchObject({ zusCases: 2, fines: 500 });
    state = submit(6, 'fit', .9, state);
    expect(state.daily).toMatchObject({ zusCases: 3, fines: 900 });
    const home = act({ ...state, money: 2000, clockMinutes: 840 }, 'end-day');
    expect(home.settlement?.fines).toBe(900);
    expect(act(home, 'next-day').daily).toEqual(emptyConsequences());
  });
  it('does not escalate a hidden error and persists the 50 then 100 insurance increases', () => {
    let state = submit(0, 'unfit', .1, { ...cabinet(), money: 10000 });
    expect(state.insuranceRate).toBe(300);
    state = submit(3, 'unfit', .9, state);
    expect(state.insuranceRate).toBe(350);
    state = submit(7, 'unfit', .9, state);
    expect(state.insuranceRate).toBe(450);
    expect(state.daily).toMatchObject({ refusals: 2, insuranceIncrease: 150 });
    state = act({ ...state, clockMinutes: 840 }, 'end-day');
    expect(state.settlement?.insuranceCost).toBe(450);
    state = act(state, 'next-day');
    expect(state.insuranceRate).toBe(450);
    for (const rate of [400, 350, 300, 300]) {
      state = act({ ...state, clockMinutes: 840 }, 'end-day');
      expect(state.insuranceRate).toBe(rate);
      expect(state.settlement?.insuranceCost).toBe(state.roster.length ? rate : 0);
      state = act(state, 'next-day');
    }
  });
  it('records all patients for their 50 bonus, including incomplete and mistaken decisions', () => {
    const state = submit(0, 'unfit', .1);
    const home = act({ ...state, money: 2000, clockMinutes: 840 }, 'end-day');
    expect(home.settlement).toMatchObject({ patients: 1, basePay: 1000, patientBonus: 50, income: 1050 });
  });
});

describe('closing and the household budget', () => {
  it('allows a 13:59 arrival to complete every procedure after closing and blocks another arrival', () => {
    let state = act({ ...cabinet(), clockMinutes: 839 }, 'call-patient');
    expect(state.visit).not.toBeNull();
    expect(state.clockMinutes).toBe(840);
    expect(canEndDay(state)).toBe(false);
    expect(applyAction(state, 'end-day').state).toBe(state);
    state = act(state, 'take-document', 'run-general', 'run-vision', 'run-pressure', 'run-measurements', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    expect(state.visit).toBeNull();
    expect(state.phase).toBe('home');
    expect(canEndDay(state)).toBe(false);
    expect(applyAction(state, 'call-patient').state).toBe(state);
    expect(applyAction({ ...cabinet(), clockMinutes: 840 }, 'call-patient').feedback).toBe('shift-finished');
  });
  it('only settles once, survives a save at home, and clears the ledger on the next day', () => {
    const before = { ...cabinet(), clockMinutes: 840, money: 1700, insuranceRate: 450 };
    const home = act(before, 'end-day');
    expect(home.phase).toBe('home');
    expect(home.money).toBe(home.settlement!.openingBalance + home.settlement!.income - home.settlement!.expenses);
    for (const action of ['end-day', 'take-paper', 'call-patient', 'toggle-lamp'] as const) expect(act(home, action)).toBe(home);
    const loaded = decodeSave(encodeSave(home));
    expect(loaded).toEqual(home);
    expect(act(loaded, 'end-day')).toBe(loaded);
    const next = act(loaded, 'next-day');
    expect(next.clockMinutes).toBeGreaterThanOrEqual(459);
    expect(next.clockMinutes).toBeLessThanOrEqual(466);
    expect(next).toMatchObject({ day: 2, phase: 'cabinet', money: home.money, insuranceRate: 400, settlement: null, clockMinutes: expect.any(Number), shiftCompleted: 0 });
    expect(next.roster).not.toEqual(home.roster);
    expect(decodeSave(encodeSave(next))).toEqual(next);
  });
  it('draws inclusive 400–800 living costs with reproducible random state', () => {
    for (const [fraction, cost] of [[0, 400], [.999999, 800]] as const) {
      const state = { ...cabinet(), rngState: seedFor(fraction) };
      expect(settleDay(state).settlement.livingCost).toBe(cost);
      expect(settleDay(state)).toEqual(settleDay(structuredClone(state)));
    }
  });
  it('applies the savings threshold to the budget after fixed expenses, at the exact boundary', () => {
    // This seed yields living cost495 and a 0.0042 event draw, so a draw would
    // trigger as soon as the available savings exceed the threshold.
    const base = { ...cabinet(), rngState: 8 };
    const atThreshold = settleDay({ ...base, money: 1795 });
    expect(atThreshold.settlement.closingBalance).toBe(2000);
    expect(atThreshold.settlement.event).toBeNull();
    const aboveThreshold = settleDay({ ...base, money: 1796 });
    expect(aboveThreshold.settlement.event).not.toBeNull();
    expect(aboveThreshold.settlement.closingBalance).toBe(2001 - aboveThreshold.settlement.event!.cost);
  });
  it('increases the chance above 2000 savings and bounds each loss by available savings', () => {
    expect(expenseProbability(2000)).toBe(0);
    expect(expenseProbability(2001)).toBeGreaterThan(0);
    expect(expenseProbability(4000)).toBeGreaterThan(expenseProbability(2001));
    expect(expenseProbability(1000000)).toBe(.85);
    let occurred = 0;
    for (let seed = 0; seed < 100; seed += 1) {
      const result = settleDay({ ...cabinet(), money: 8000, rngState: seed });
      if (result.settlement.event) {
        occurred += 1;
        expect(result.settlement.event.cost).toBeGreaterThanOrEqual(200);
        expect(result.settlement.closingBalance).toBeGreaterThanOrEqual(0);
      }
      expect(settleDay({ ...cabinet(), money: 0, rngState: seed }).settlement.event).toBeNull();
    }
    expect(occurred).toBeGreaterThan(0);
    expect(occurred).toBeLessThan(100);
  });
  it('keeps the seeded draw separate from rendering and avoids mutation', () => {
    expect(randomStep(seedFor(.25)).value).toBe(.25);
    const state = cabinet();
    const copy = structuredClone(state);
    Object.freeze(state); Object.freeze(state.daily); Object.freeze(state.roster);
    act(state, 'call-patient');
    settleDay(state);
    expect(state).toEqual(copy);
  });
});

describe('multi-day case and save integration', () => {
  it('preserves new randomized patients, historical notes and daily accounts across repeated imports', () => {
    let state = act({ ...createInitialState(614), money: 100000 }, 'skip-intro');
    const seen = new Set<number>();
    for (let day = 0; day < 3; day++) {
      if (state.phase === 'cabinet') state = { ...state, clockMinutes: Math.max(480, state.clockMinutes) };
      while (state.phase === 'cabinet' && !canEndDay(state)) {
        state = act(state, 'call-patient');
        if (state.inspection) {
          const target = state.inspection.target;
          state = act(state, 'take-inspection-id', 'return-inspection-id');
          for (const paper of state.papers.filter(paper => (paper.kind === 'note' || paper.kind === 'referral')
            && paper.patientId === target.patientId && paper.day === target.day)) {
            state = act(state, { type: 'hand-inspection-paper', paperId: paper.id });
          }
          expect(state.inspection).toBeNull();
          expect(decodeSave(encodeSave(state))).toEqual(state);
          continue;
        }
        state = act(state, 'take-document', 'take-paper', 'run-general', 'run-vision', 'run-pressure', 'run-measurements', 'take-certificate', 'write-certificate');
        const patient = PATIENTS[state.visit!.patientId]!;
        seen.add(patient.characterId);
        // Mix correct and incorrect certificates so archived letters coexist
        // with examination notes when tomorrow selects different case variants.
        const decision = state.shiftCompleted % 3 === 0 ? 'fit' : patient.expectedDecision;
        state = act(state, decision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
        expect(decodeSave(encodeSave(state))).toEqual(state);
      }
      state = act(state, 'end-day');
      expect(decodeSave(encodeSave(state))).toEqual(state);
      const paid = state.money;
      state = act(decodeSave(encodeSave(state)), 'next-day');
      if (state.phase === 'cabinet') expect(state.money).toBe(paid);
      while (state.phase === 'home') {
        expect(state.settlement).toMatchObject({ basePay: 0, patients: 0 });
        state = act(decodeSave(encodeSave(state)), 'next-day');
      }
      expect(state.papers.some(paper => paper.day < state.day)).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(20);
  });
});


describe('rest days and monthly carryover', () => {
  it('obtains fresh browser entropy only when a game has no explicit seed', () => {
    const entropy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    try {
      createGame(); createGame();
      expect(entropy).toHaveBeenCalledTimes(2);
      expect(createGame(24)).toEqual(createGame(24));
      expect(entropy).toHaveBeenCalledTimes(2);
    } finally { entropy.mockRestore(); }
  });

  it('settles Saturday and Sunday once each, keeps stored papers and resumes Monday work', () => {
    const friday = act({ ...cabinet(), day: 2, clockMinutes: 840, money: 5000, insuranceRate: 500 }, 'take-paper', 'end-day');
    const saturday = act(friday, 'next-day');
    expect(saturday).toMatchObject({ day: 3, phase: 'home', roster: [], clockMinutes: 840, shiftCompleted: 0, insuranceRate: 400 });
    expect(saturday.settlement).toMatchObject({ basePay: 0, patientBonus: 0, patients: 0, income: 0, insuranceCost: 0, openingBalance: friday.money });
    expect(saturday.papers).toEqual(friday.papers);
    expect(saturday.money).toBe(friday.money - saturday.settlement!.expenses);
    expect(act(saturday, 'call-patient', 'end-day')).toBe(saturday);
    const sunday = act(decodeSave(encodeSave(saturday)), 'next-day');
    expect(sunday).toMatchObject({ day: 4, phase: 'home', roster: [], insuranceRate: 350 });
    expect(sunday.settlement).toMatchObject({ basePay: 0, patientBonus: 0, patients: 0, insuranceCost: 0, openingBalance: saturday.money });
    const monday = act(decodeSave(encodeSave(sunday)), 'next-day');
    expect(monday.clockMinutes).toBeGreaterThanOrEqual(459);
    expect(monday.clockMinutes).toBeLessThanOrEqual(466);
    expect(monday).toMatchObject({ day: 5, phase: 'cabinet', clockMinutes: expect.any(Number), money: sunday.money, insuranceRate: 350, settlement: null });
    expect(monday.roster).toHaveLength(168);
    expect(decodeSave(encodeSave(monday))).toEqual(monday);
  });

  it('draws both unnamed resort events only on rest days and persists their cost', () => {
    const kinds = new Set<string>();
    for (let seed = 0; seed < 1000; seed++) {
      const input = { ...cabinet(), day: 3, money: 8000, rngState: seed, restDay: true };
      const result = settleDay(input);
      if (result.settlement.event) kinds.add(result.settlement.event.kind);
      const state: GameState = { ...input, ...result, phase: 'home', roster: [], clockMinutes: 840, money: result.settlement.closingBalance };
      // restDay is an action input only, never persisted.
      delete (state as unknown as Record<string, unknown>).restDay;
      expect(decodeSave(encodeSave(state))).toEqual(state);
      expect(settleDay({ ...input, restDay: false }).settlement.event?.kind ?? '').not.toMatch(/trip/);
    }
    expect(kinds.has('mountain-trip')).toBe(true);
    expect(kinds.has('seaside-trip')).toBe(true);
  });

  it('snapshots the actual closing balance only when the month changes; historical debt stays in its own field', () => {
    const november = act({ ...cabinet(), day: 28, clockMinutes: 840, money: 2000, previousMonthBalance: -300 }, 'end-day');
    const december = act(november, 'next-day');
    expect(december.day).toBe(29);
    expect(december.previousMonthBalance).toBe(november.money);
    expect(december.previousMonthBalance).toBeGreaterThanOrEqual(0);
    const secondDay = act({ ...december, clockMinutes: 840 }, 'end-day', 'next-day');
    expect(secondDay.previousMonthBalance).toBe(november.money);
    expect(decodeSave(encodeSave(secondDay))).toEqual(secondDay);
  });
});
