import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { advanceClinicTime, applyAction, createInitialState, settleWeekend, type GameAction, type GameState } from '../src/core/game';
import { randomStep } from '../src/core/patients';
import { decodeSave, encodeSave } from '../src/core/save';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
const complete = (state: GameState): GameState => act(state, 'call-patient', 'take-document', 'take-paper', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
const seedFor = (wanted: boolean): number => {
  for (let seed = 1; seed < 10000; seed++) if ((randomStep(seed).value < 1 / 25) === wanted) return seed;
  throw new Error('No seed');
};
function ready(): GameState {
  const first = complete(act({ ...createInitialState(17), money: 5000 }, 'skip-intro'));
  return { ...act(advanceClinicTime(first, 1000).state, 'next-day'), rngState: seedFor(true) };
}
function inspector(): GameState { return act(ready(), 'call-patient'); }
function records(): GameState { return act(inspector(), 'take-inspection-id', 'return-inspection-id'); }
const file = (state: unknown, version = 26): Uint8Array => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-27T12:00:00.000Z', state })));

it('never calls an inspector on day one and retains the last 25 completed appointments independently of papers', () => {
  let state = act({ ...createInitialState(17), money: 5000 }, 'skip-intro');
  const visits: GameState['recentVisits'] = [];
  for (let index = 0; index < 27; index++) {
    state = { ...state, rngState: seedFor(true) };
    state = complete(state);
    expect(state.inspection).toBeNull();
    visits.push(state.recentVisits.at(-1)!);
    for (const paper of state.papers) state = act(state, { type: 'trash-paper', paperId: paper.id });
  }
  expect(state.recentVisits).toEqual(visits.slice(-25));
  expect(state.papers).toEqual([]);
  expect(decodeSave(encodeSave(state))).toEqual(state);
});

it('uses a seeded four-percent eligibility draw and does not reroll after an inspection', () => {
  const before = ready(), incoming = act(before, 'call-patient');
  expect(incoming.inspection).toMatchObject({ stage: 'identity', received: [], target: before.recentVisits[0] });
  expect(incoming.visit).toBeNull();
  expect(incoming.roster).toEqual(before.roster);
  expect(incoming.shiftCompleted).toBe(0);
  expect(incoming.patientsProcessed).toBe(before.patientsProcessed);
  expect(applyAction(incoming, 'call-patient').feedback).toBe('inspection-waiting');
  const finished = act(incoming, 'take-inspection-id', 'return-inspection-id', 'talk-inspector', 'talk-inspector');
  const next = act({ ...finished, rngState: seedFor(true) }, 'call-patient');
  expect(next.inspection).toBeNull();
  expect(next.visit).not.toBeNull();
  const normal = act({ ...before, rngState: seedFor(false) }, 'call-patient');
  expect(normal.visit).not.toBeNull();
  expect(normal.inspectionCheckedAt).toBe(before.patientsProcessed);
  let hits = 0, seed = 1;
  for (let index = 0; index < 2000; index++) {
    seed = randomStep(seed).seed;
    hits += Number(act({ ...before, rngState: seed }, 'call-patient').inspection !== null);
  }
  expect(hits).toBeGreaterThan(55); expect(hits).toBeLessThan(110);
});

it('requires viewing and returning the ID before documents, and protects that ID from disposal', () => {
  let state = inspector();
  expect(applyAction(state, 'talk-inspector').feedback).toBe('inspection-id-needed');
  state = act(state, 'take-inspection-id');
  const card = state.papers.find(paper => paper.kind === 'inspection-id')!;
  expect(card).toMatchObject({ inspectorId: state.inspection!.inspectorId });
  expect(applyAction(state, { type: 'trash-paper', paperId: card.id }).state).toBe(state);
  expect(decodeSave(encodeSave(state))).toEqual(state);
  state = act(state, { type: 'store-paper', paperId: card.id });
  expect(applyAction(state, 'return-inspection-id').feedback).toBe('inspection-id-needed');
  state = act(state, { type: 'retrieve-paper', paperId: card.id }, 'return-inspection-id');
  expect(state.papers.some(paper => paper.kind === 'inspection-id')).toBe(false);
  expect(state.inspection!.stage).toBe('records');
});

it('checks exact patient and visit date and accepts separate sheets or one clipped bundle without a penalty', () => {
  for (const bundled of [false, true]) {
    let state = records();
    const referral = state.papers.find(paper => paper.kind === 'referral')!, note = state.papers.find(paper => paper.kind === 'note')!;
    const wrongDay = { ...referral, day: state.day };
    expect(applyAction({ ...state, papers: state.papers.map(paper => paper.id === referral.id ? wrongDay : paper) },
      { type: 'hand-inspection-paper', paperId: referral.id }).feedback).toBe('inspection-wrong-document');
    if (bundled) state = act(state, { type: 'clip-document', documentId: referral.id }, { type: 'join-documents', documentId: note.id, targetId: referral.id });
    state = act(state, { type: 'hand-inspection-paper', paperId: referral.id });
    if (!bundled) {
      expect(state.inspection!.received).toEqual(['referral']);
      state = act(state, 'talk-inspector');
      expect(state.inspection!.stage).toBe('confirm-missing');
      state = act(state, { type: 'hand-inspection-paper', paperId: note.id });
    }
    expect(state.inspection).toBeNull(); expect(state.inspectionFines).toBe(0);
    expect(state.papers).toContainEqual(referral); expect(state.papers).toContainEqual(note);
    expect(decodeSave(encodeSave(state))).toEqual(state);
  }
});

describe.each([0, 1])('documents supplied: %i', count => {
  it('requires two confirmations, issues the proper fine and charges it once in the budget', () => {
    let state = records();
    const prior = state.daily.fines;
    if (count) state = act(state, { type: 'hand-inspection-paper', paperId: state.papers.find(paper => paper.kind === 'note')!.id });
    state = act(state, 'talk-inspector');
    expect(state.inspection!.stage).toBe('confirm-missing');
    expect(state.daily.fines).toBe(prior);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    state = act(state, 'talk-inspector');
    const fine = count ? 50 : 200;
    expect(state.inspection).toBeNull(); expect(state.daily.fines).toBe(prior + fine);
    expect(state.inspectionFines).toBe(fine);
    const receipt = state.papers.find(paper => paper.kind === 'inspection-fine')!;
    expect(receipt).toMatchObject({ amount: fine, day: 2, targetDay: 1 });
    state = act(state, { type: 'trash-paper', paperId: receipt.id });
    expect(state.daily.fines).toBe(prior + fine);
    const home = advanceClinicTime(state, 1000).state;
    expect(home.settlement!.fines).toBe(prior + fine);
    expect(decodeSave(encodeSave(home))).toEqual(home);
    const weekend = settleWeekend(home);
    expect(weekend.budgetHistory[0]!.fines).toBe(prior + fine);
    expect(decodeSave(encodeSave(weekend))).toEqual(weekend);
    const monday = act(weekend, 'next-day');
    expect(monday.inspectionFines).toBe(0);
  });
});

it('settles an overtime inspection without a patient bonus and removes an unreturned identity card', () => {
  const incoming = act(inspector(), 'take-inspection-id');
  const closed = advanceClinicTime(incoming, 1000).state;
  expect(closed.inspection).toBeNull(); expect(closed.settlement!.patientBonus).toBe(0);
  expect(closed.papers.some(paper => paper.kind === 'inspection-id')).toBe(false);
  expect(decodeSave(encodeSave(closed))).toEqual(closed);
  const late = { ...records(), clockMinutes: 850 };
  const concluded = act(late, 'talk-inspector', 'talk-inspector');
  expect(concluded.phase).toBe('home'); expect(concluded.settlement!.fines).toBe(200);
});

it('validates inspection state strictly and migrates v24 without invented history', () => {
  const state = act(inspector(), 'take-inspection-id');
  const invalid = [
    { ...state, recentVisits: undefined }, { ...state, inspectionFines: 1 }, { ...state, inspectionCheckedAt: state.patientsProcessed + 1 },
    { ...state, recentVisits: [...state.recentVisits, ...state.recentVisits] },
    { ...state, inspection: { ...state.inspection, target: { patientId: 12, day: 1 } } },
    { ...state, inspection: { ...state.inspection, inspectorId: 3 } },
    { ...state, inspection: { ...state.inspection, received: ['note'] } },
    { ...state, inspection: null }, { ...state, papers: state.papers.filter(paper => paper.kind !== 'inspection-id') },
    { ...state, inspection: { ...state.inspection, stage: 'records' } },
  ];
  for (const raw of invalid) expect(() => decodeSave(file(raw))).toThrow();
  const original = { ...ready(), roster: ready().roster.filter(id => id <= 3127) };
  const { banknotes: _banknotes, recentVisits: _recent, inspection: _inspection, inspectionCheckedAt: _checked, inspectionFines: _fines, ...old } = original;
  const migrated = decodeSave(file(old, 24));
  expect(migrated).toEqual({ ...old, banknotes: [], recentVisits: [], inspection: null, inspectionCheckedAt: old.patientsProcessed, inspectionFines: 0 });
  expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
  expect(() => decodeSave(file(original, 24))).toThrow();
});

it('keeps the expanded catalog exclusive to v25 and freezes historical cash ceilings', () => {
  const current = act(createInitialState(17), 'skip-intro');
  const { banknotes: _banknotes, recentVisits: _recent, inspection: _inspection, inspectionCheckedAt: _checked, inspectionFines: _fines, ...old } = current;
  expect(current.roster.some(id => id > 3127)).toBe(true);
  expect(decodeSave(encodeSave(current))).toEqual(current);
  expect(() => decodeSave(file(old, 24))).toThrow();
  const oldRoster = old.roster.filter(id => id <= 3127);
  expect(() => decodeSave(file({ ...old, day: 8, roster: oldRoster, money: 10400, bribeIncome: 10400 }, 24))).toThrow();
});
