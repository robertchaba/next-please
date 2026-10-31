import { historicalState, legacyBudget } from './fixtures/legacy-budget';
import { describe, expect, it } from 'vitest';
import { gzipSync, gunzipSync, strToU8 } from 'fflate';
import { applyAction, advanceClinicTime, createInitialState, type GameAction, type GameState, type Paper } from '../src/core/game';
import { decodeSave, encodeSave } from '../src/core/save';
import { noteEntries } from '../src/render/paperwork';
import { homePage, homePages } from '../src/scenes/home';
import { measureText } from '../src/render/font';
import { translations } from '../src/i18n';

const act = (state: GameState, ...actions: GameAction[]) => actions.reduce((s, a) => applyAction(s, a).state, state);
const notes = (state: GameState) => state.papers.filter((p): p is Extract<Paper, { kind: 'note' }> => p.kind === 'note');
const file = (state: unknown, version = 29) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-26T12:00:00.000Z', state: version < 24 ? legacyBudget(state) : historicalState(state, version) })));
function closed(balance: number) {
  const cabinet = act(createInitialState(17), 'skip-intro');
  const ready = { ...cabinet, clockMinutes: 840 };
  const cost = act(ready, 'end-day').money;
  return act({ ...ready, money: balance - cost }, 'end-day');
}

describe('append-only patient notes', () => {
  it('appends history, interleaved pressure readings and phone conclusions without moving earlier rows', () => {
    let state = act({ ...createInitialState(41), day: 7 }, 'skip-intro', 'call-patient', 'take-paper');
    for (const action of ['run-pressure', 'run-general', 'take-document', 'call-employer', 'run-vision', 'run-pressure', 'run-measurements'] as const) {
      const before = notes(state)[0]!;
      const prior = { pl: noteEntries(before, 'pl'), en: noteEntries(before, 'en') };
      state = act(state, action);
      for (const locale of ['pl', 'en'] as const) expect(noteEntries(notes(state)[0]!, locale).slice(0, prior[locale].length)).toEqual(prior[locale]);
      state = decodeSave(encodeSave(state));
    }
    expect(state.visit!.noteOrder).toEqual(['pressure', 'general', 'history', 'call-employer', 'vision', 'pressure-repeat', 'measurements']);
    const first = notes(state)[0]!;
    expect(first.additionalWritten).toBe(true);
    for (const locale of ['pl', 'en'] as const) for (const text of translations[locale].patientNotes[state.visit!.patientId]!) {
      expect(noteEntries(first, locale).filter(row => row.text === text)).toHaveLength(1);
    }
    const repeated = act(state, 'run-general', 'run-pressure', 'call-employer');
    for (const locale of ['pl', 'en'] as const) expect(noteEntries(notes(repeated)[0]!, locale)).toEqual(noteEntries(first, locale));
    const more = act(state, { type: 'store-paper', paperId: first.id }, 'take-paper');
    expect(notes(more).map(note => noteEntries(note, 'pl'))).toEqual([noteEntries(first, 'pl'), noteEntries(first, 'pl')]);
    expect(notes(more)[0]!.noteOrder).not.toBe(notes(more)[1]!.noteOrder);
  });

  it('updates filed notes and backfills sheets taken after the examination before referral intake', () => {
    let state = act(createInitialState(6), 'skip-intro', 'call-patient', 'take-paper', { type: 'store-paper', paperId: 1 });
    state = act(state, 'run-general', 'run-pressure', 'run-vision', 'run-pressure', 'take-paper');
    expect(state.visit!.document).toBe('tray');
    const [filed, fresh] = notes(decodeSave(encodeSave(state)));
    expect(filed!.location).toBe('drawer');
    expect(filed!.noteOrder).toEqual(['general', 'history', 'pressure', 'vision', 'pressure-repeat']);
    expect(noteEntries(fresh!, 'pl')).toEqual(noteEntries(filed!, 'pl'));
  });

  it('migrates old grouping once and appends subsequent entries after it', () => {
    const state = act({ ...createInitialState(5), roster: Array.from({ length: 78 }, (_, i) => 553 + i * 25) }, 'skip-intro', 'call-patient', 'run-general', 'run-pressure', 'run-vision', 'take-paper');
    const raw = JSON.parse(JSON.stringify(state));
    delete raw.pendingReferrals; delete raw.referralsIssued; delete raw.budgetHistory;
    delete raw.visit.startedDay; delete raw.visit.additionalResult; delete raw.visit.additionalTests;
    delete raw.visit.noteOrder;
    raw.papers.forEach((paper: Record<string, unknown>) => { delete paper.noteOrder; });
    const loaded = decodeSave(file(raw, 17));
    expect(loaded.visit!.noteOrder).toEqual(['general', 'pressure', 'vision', 'history']);
    const before = noteEntries(notes(loaded)[0]!, 'pl');
    const next = act(loaded, 'run-pressure');
    expect(noteEntries(notes(next)[0]!, 'pl').slice(0, before.length)).toEqual(before);
    expect(next.visit!.noteOrder.at(-1)).toBe('pressure-repeat');
    expect(decodeSave(encodeSave(next))).toEqual(next);
    const partial = structuredClone(raw);
    partial.papers[0].results.general = null;
    partial.papers[0].results.pressure = null;
    partial.papers[0].results.pressureReadings = [];
    partial.papers[0].additionalWritten = false;
    partial.papers[0].examinationOrder = ['vision'];
    const oldSheet = decodeSave(file(partial, 17));
    const rows = noteEntries(notes(oldSheet)[0]!, 'pl');
    const filled = act(oldSheet, 'run-measurements');
    expect(noteEntries(notes(filled)[0]!, 'pl').slice(0, rows.length)).toEqual(rows);
    expect(decodeSave(encodeSave(filled))).toEqual(filled);
  });

  it('rejects missing, duplicate, unknown, premature and incomplete journal entries', () => {
    const state = act(createInitialState(5), 'skip-intro', 'call-patient', 'run-pressure', 'run-vision', 'run-pressure', 'take-paper');
    for (const noteOrder of [undefined, [], ['pressure', 'vision'], ['pressure', 'pressure', 'vision'],
      ['unknown', 'vision', 'pressure-repeat'], ['pressure-repeat', 'vision', 'pressure'], ['vision', 'pressure', 'pressure-repeat']]) {
      expect(() => decodeSave(file({ ...state, visit: { ...state.visit, noteOrder } }))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
    }
    expect(() => decodeSave(file({ ...state, papers: notes(state).map(p => ({ ...p, noteOrder: ['pressure', 'pressure-repeat'] })) })))
      .toThrowError(expect.objectContaining({ code: 'invalid-state' }));
  });
});

describe('bankruptcy ending', () => {
  it('ends at a negative settled balance, including an empty day, but permits exactly zero', () => {
    const bankrupt = closed(-1), zero = closed(0), solvent = closed(1);
    expect(bankrupt).toMatchObject({ money: -1, ending: 'bankruptcy', phase: 'home', shiftCompleted: 0 });
    for (const action of ['next-day', 'end-day', 'call-patient', 'accept-bribe', 'take-paper'] as const) {
      expect(applyAction(bankrupt, action)).toEqual({ state: bankrupt, feedback: 'game-over' });
    }
    expect(advanceClinicTime(bankrupt, 30).state).toBe(bankrupt);
    for (const state of [zero, solvent]) {
      expect(state.ending).toBeNull();
      expect(act(state, 'next-day').day).toBe(2);
    }
    expect(decodeSave(encodeSave(bankrupt))).toEqual(bankrupt);
    expect(JSON.parse(new TextDecoder().decode(gunzipSync(encodeSave(bankrupt)))).version).toBe(31);
  });

  it('also ends at forced closing without awarding an unfinished appointment', () => {
    const visit = act({ ...createInitialState(17), money: -1000 }, 'skip-intro', 'call-patient', 'take-paper', 'run-general');
    const result = advanceClinicTime({ ...visit, clockMinutes: 1034 }, 1);
    expect(result.feedback).toBe('visit-interrupted');
    expect(result.state).toMatchObject({ phase: 'home', ending: 'bankruptcy', visit: null, patientsProcessed: 0, settlement: { patientBonus: 0 } });
    expect(result.state.papers).toEqual(visit.papers);
    expect(decodeSave(encodeSave(result.state))).toEqual(result.state);
  });

  it('prioritizes an already triggered hospital ending when the same settlement also creates debt', () => {
    const pending = { ...act(createInitialState(17), 'skip-intro'), day: 8, shiftCompleted: 1, patientsProcessed: 1,
      money: -1000, clockMinutes: 840, ending: 'assault-pending' as const };
    expect(act(pending, 'end-day').ending).toBe('hospital');
  });

  it('migrates settled historical debt without changing the ledger or random state', () => {
    const ended = { ...closed(-20), roster: Array.from({ length: 78 }, (_, i) => 553 + i * 25) };
    const { budgetHistory: _history, pendingReferrals: _pending, referralsIssued: _issued, ...legacy } = ended;
    const historical = { ...legacy, ending: null };
    const migrated = decodeSave(file(historical, 17));
    expect(migrated).toEqual(ended);
    expect(act(migrated, 'next-day')).toBe(migrated);
    expect(() => decodeSave(file({ ...ended, ending: null }))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
    for (const state of [{ ...ended, money: 0 }, { ...ended, phase: 'cabinet' }, { ...closed(1), ending: 'bankruptcy' }]) {
      expect(() => decodeSave(file(state))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
    }
    expect(() => decodeSave(file(legacy, 17))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
  });

  it('shows the final budget and a localized illustrated epilogue with a direct restart', () => {
    const state = closed(-1), before = structuredClone(state);
    expect(homePages(state)).toEqual(['budget', 'bankruptcy']);
    for (const locale of ['pl', 'en'] as const) {
      const content = homePage(state, locale, 1);
      expect(content.illustration).toBe('bankruptcy-cloakroom');
      expect(content.action).toBe(translations[locale].progression.restartGame);
      expect(content.text).toContain(translations[locale].progression.gameOver);
      expect(content.body.split('\n').length).toBeLessThanOrEqual(9);
      expect(measureText(content.title, 2)).toBeLessThanOrEqual(312);
      for (const line of content.body.split('\n')) expect(measureText(line)).toBeLessThanOrEqual(312);
    }
    expect(state).toEqual(before);
  });
});
