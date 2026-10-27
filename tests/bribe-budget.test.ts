import { expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, advanceClinicTime, createInitialState, settleWeekend, type GameAction, type GameState } from '../src/core/game';
import { decodeSave, encodeSave, importSave } from '../src/core/save';
import { homePage, homePages } from '../src/scenes/home';
import { legacyBudget } from './fixtures/legacy-budget';

const act = (state: GameState, ...actions: GameAction[]) => actions.reduce((s, a) => applyAction(s, a).state, state);
function offer(day = 8): GameState {
  const generated = createInitialState(17);
  const initial = { ...generated, roster: generated.roster.filter(id => id <= 3127) };
  // The second visit on working day six always offers cash.
  const ready = act({ ...initial, day: 8, money: 5000, shiftCompleted: 1, patientsProcessed: 1, clockMinutes: 484 }, 'skip-intro', 'call-patient');
  expect(ready.visit!.bribe).toBe('offered');
  return { ...ready, day, visit: { ...ready.visit!, startedDay: day } };
}
const file = (state: unknown, version = 26) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-27T12:00:00.000Z', state })));

it('reports accepted cash once, alongside wages, with the true opening and closing balances', () => {
  const initial = offer();
  const paid = act(initial, 'accept-bribe', 'accept-bribe');
  expect(paid.money).toBe(5000);
  expect(paid.bribeIncome).toBe(100);
  const saved = decodeSave(encodeSave(paid));
  expect(saved).toEqual(paid);
  const home = advanceClinicTime(saved, 1000).state;
  expect(home.settlement).toMatchObject({ openingBalance: 5000, bribeIncome: 100, basePay: 1000, patientBonus: 50, income: 1150 });
  expect(home.money).toBe(5000 + 1150 - home.settlement!.expenses);
  expect(decodeSave(encodeSave(home))).toEqual(home);
  for (const locale of ['pl', 'en'] as const) {
    const rows = homePage(home, locale, homePages(home).indexOf('budget')).rows;
    expect(rows[2]).toMatchObject({ label: locale === 'pl' ? 'Łapówki' : 'Bribes', value: '100 zł', negative: false });
    expect(rows.at(-1)?.value).toContain('zł');
  }
});

it('accounts for a refund, direct rejection and an action interrupted by closing', () => {
  const initial = offer();
  for (const state of [act(initial, 'accept-bribe', 'return-bribe', 'return-bribe'), act(initial, 'return-bribe')]) {
    expect(state.money).toBe(5000);
    expect(state.bribeIncome).toBe(0);
    expect(advanceClinicTime(state, 1000).state.settlement!.bribeIncome).toBe(0);
  }
  const lowerBound = act({ ...initial, money: -1_000_000_000 }, 'accept-bribe', 'return-bribe');
  expect(lowerBound.banknotes).toEqual([]);
  expect(lowerBound.bribeIncome).toBe(0);
  expect(lowerBound.money).toBe(-1_000_000_000);
  const interrupted = act({ ...initial, clockMinutes: 1034 }, 'accept-bribe');
  expect(interrupted.settlement!.bribeIncome).toBe(0);
});

it('retains Friday cash in the single weekend budget and resets the daily counter', () => {
  const friday = advanceClinicTime(act(offer(9), 'accept-bribe'), 1000).state;
  const sunday = settleWeekend(friday);
  expect(sunday.day).toBe(11);
  expect(sunday.bribeIncome).toBe(0);
  expect(sunday.budgetHistory[0]!.bribeIncome).toBe(100);
  expect(decodeSave(encodeSave(sunday))).toEqual(sunday);
  expect(homePage(sunday, 'pl', 1).text).toContain('Łapówki: 100 zł');
  const monday = act(sunday, 'next-day');
  expect(monday.bribeIncome).toBe(0);
  expect(monday.budgetHistory).toEqual([]);
});

it('migrates unrecorded historical cash without inventing or paying it again', () => {
  const paid = act(offer(), 'accept-bribe');
  const loaded = decodeSave(file(legacyBudget(paid), 23));
  expect(loaded.money).toBe(5100);
  expect(loaded.bribeIncome).toBe(0);
  const settled = advanceClinicTime(paid, 1000).state;
  const oldHome = decodeSave(file(legacyBudget(settled), 23));
  expect(oldHome.money).toBe(settled.money);
  expect(oldHome.settlement).toMatchObject({ bribeIncome: 0, openingBalance: 5100, income: 1050 });
  expect(decodeSave(encodeSave(oldHome))).toEqual(oldHome);
  const returned = act(loaded, 'return-bribe');
  expect(returned.money).toBe(5000);
  expect(returned.bribeIncome).toBe(-100);
  const home = advanceClinicTime(returned, 1000).state;
  expect(home.settlement!.openingBalance).toBe(5100);
  expect(home.settlement!.income).toBe(950);
  expect(decodeSave(encodeSave(home))).toEqual(home);
});

it('rejects missing, forged and mismatched cash journals without replacing live state', async () => {
  const home = advanceClinicTime(act(offer(), 'accept-bribe'), 1000).state;
  const invalid = [
    { ...home, bribeIncome: undefined }, { ...home, bribeIncome: '100' }, { ...home, bribeIncome: 101 },
    { ...home, bribeIncome: 10400 }, { ...home, settlement: { ...home.settlement, bribeIncome: undefined } },
    { ...home, settlement: { ...home.settlement, bribeIncome: 200 } },
    { ...home, settlement: { ...home.settlement, income: home.settlement!.income + 100 } },
    { ...createInitialState(1), bribeIncome: 100 },
  ];
  for (const state of invalid) {
    const bytes = file(state);
    let live = home;
    await expect(importSave(new File([new Uint8Array(bytes)], 'invalid.npsave')).then(state => { live = state; })).rejects.toMatchObject({ code: 'invalid-state' });
    expect(live).toBe(home);
  }
  // Historical schemas must still reject the new fields.
  expect(() => decodeSave(file(home, 23))).toThrow();
});


it('keeps separate banknotes on either surface across visits, saves and returns', () => {
  let state = act(offer(), { type: 'accept-bribe', location: 'desk' }, 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
  const first = state.banknotes[0]!;
  expect(state.visit).toBeNull();
  expect(first.location).toBe('desk');
  expect(state.money).toBe(5000);
  expect(decodeSave(encodeSave(state))).toEqual(state);
  state = act(state, { type: 'store-banknote', banknoteId: first.id });
  expect(state.banknotes[0]!.location).toBe('drawer');
  state = act(state, { type: 'retrieve-banknote', banknoteId: first.id }, 'call-patient');
  expect(state.banknotes[0]!.location).toBe('desk');
  expect(applyAction(state, { type: 'return-banknote', banknoteId: first.id }).state).toBe(state);
  // A second genuine offer can coexist with the retained banknote.
  while (state.visit?.bribe !== 'offered') {
    state = act(state, 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document', 'call-patient');
    expect(state.phase).toBe('cabinet');
  }
  state = act(state, 'accept-bribe');
  expect(state.banknotes).toHaveLength(2);
  expect(state.bribeIncome).toBe(200);
  expect(state.money).toBe(5000);
  expect(decodeSave(encodeSave(state))).toEqual(state);
  const returned = act(state, { type: 'return-banknote', banknoteId: state.banknotes[1]!.id });
  expect(returned.banknotes).toEqual([first]);
  expect(returned.bribeIncome).toBe(100);
  expect(returned.money).toBe(5000);
  const home = advanceClinicTime(state, 1000).state;
  expect(home.banknotes).toEqual([]);
  expect(home.settlement!.bribeIncome).toBe(200);
  expect(home.money).toBe(5000 + home.settlement!.income - home.settlement!.expenses);
  expect(act(home, 'end-day')).toBe(home);
  expect(act(home, 'next-day').banknotes).toEqual([]);
});

it('migrates v25 banknotes without paying historical cash twice', () => {
  const current = act(offer(), 'accept-bribe');
  const { banknotes, ...old } = current;
  old.money += 100;
  const migrated = decodeSave(file(old, 25));
  expect(migrated.money).toBe(5100);
  expect(migrated.banknotes).toMatchObject([{ patientId: current.visit!.patientId, location: 'drawer', credited: true }]);
  expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
  expect(advanceClinicTime(migrated, 1000).state.money).toBe(advanceClinicTime(current, 1000).state.money);
  expect(act(migrated, 'return-bribe').money).toBe(5000);
});

it('rejects malformed banknote inventories and keeps the live state on failed import', async () => {
  const state = act(offer(), 'accept-bribe'), note = state.banknotes[0]!;
  for (const banknotes of [undefined, {}, [note, note], [{ ...note, location: 'pocket' }], [{ ...note, credited: 'false' }],
    [{ ...note, patientId: null }], [{ ...note, day: state.day + 1 }], [{ ...note, amount: 200 }]]) {
    let live = state;
    const bytes = file({ ...state, banknotes });
    await expect(importSave(new File([new Uint8Array(bytes)], 'invalid.npsave')).then(next => { live = next; })).rejects.toMatchObject({ code: 'invalid-state' });
    expect(live).toBe(state);
  }
  const home = advanceClinicTime(state, 1000).state;
  expect(() => decodeSave(file({ ...home, banknotes: [note] }))).toThrow();
});
