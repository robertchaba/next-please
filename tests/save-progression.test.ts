import { gzipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, PATIENTS, type GameAction, type GameState } from '../src/core/game';
import { decodeSave, encodeSave } from '../src/core/save';
import { defaultReferral, effectivePatient } from '../src/core/progression';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((next, action) => applyAction(next, action).state, state);
const file = (state: unknown): Uint8Array => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 20, savedAt: '2026-10-26T12:00:00.000Z', state })));
const reject = (state: unknown): void => { expect(() => decodeSave(file(state))).toThrowError(expect.objectContaining({ code: 'invalid-state' })); };
const hypertensive = PATIENTS.find(patient => patient.id >= 553 && patient.pressure === 'refer' && patient.general === 'pass')!;

function appointment(day: number, patientId: number, position = 0, seed = 1): GameState {
  const initial = createInitialState(seed), character = PATIENTS[patientId]!.characterId;
  const others = initial.roster.filter(id => PATIENTS[id]!.characterId !== character);
  const roster = [...others.slice(0, position), patientId, ...others.slice(position)];
  return act({ ...initial, day, roster, shiftCompleted: position, patientsProcessed: position, clockMinutes: 480 + position * 4 }, 'skip-intro', 'call-patient');
}

function specialistVisit(): GameState {
  for (let seed = 0; seed < 100; seed++) {
    const state = appointment(6, hypertensive.id, 0, seed);
    if (state.visit?.specialist) return act(state, 'take-specialist', 'call-specialist', 'take-paper');
  }
  throw new Error('No specialist fixture');
}

describe('version 16 progression saves', () => {
  it('round-trips start-of-day directives and their mixed paperclip bundles', () => {
    let state = act({ ...createInitialState(1), day: 2, clockMinutes: 840 }, 'skip-intro', 'end-day', 'next-day', 'next-day', 'next-day');
    expect(state.day).toBe(5);
    expect(state.papers[0]).toMatchObject({ kind: 'directive', rule: 'dates', opened: false });
    state = act(state, { type: 'open-letter', paperId: 1 }, 'take-paper', { type: 'clip-document', documentId: 1 }, { type: 'join-documents', documentId: 2, targetId: 1 }, { type: 'store-paper', paperId: 1 });
    expect(state.paperClips).toEqual([[1, 2]]);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    reject({ ...state, papers: state.papers.map(paper => paper.kind === 'directive' ? { ...paper, sender: 'chamber' } : paper) });
    reject({ ...state, papers: state.papers.map(paper => paper.kind === 'directive' ? { ...paper, day: 4 } : paper) });
    reject({ ...state, paperClips: [[1, 2], [1]] });
  });

  it('preserves the specialist conversation and notes even before referral intake', () => {
    const state = specialistVisit();
    expect(state.visit?.document).toBe('tray');
    const loaded = decodeSave(encodeSave(state));
    expect(loaded).toEqual(state);
    expect(loaded.visit?.specialist).not.toBe(state.visit?.specialist);
    expect(loaded.visit?.calls).not.toBe(state.visit?.calls);
    expect(loaded.papers.find(paper => paper.kind === 'note')).toMatchObject({ calls: state.visit!.calls, examinationOrder: [] });
    expect(act(loaded, 'take-document', 'run-pressure')).toEqual(act(state, 'take-document', 'run-pressure'));
    reject({ ...state, visit: { ...state.visit, specialistTaken: false } });
    reject({ ...state, visit: { ...state.visit, calls: { specialist: !state.visit!.calls.specialist, employer: null } } });
    reject({ ...state, papers: state.papers.map(paper => paper.kind === 'specialist' ? { ...paper, certificate: { ...paper.certificate, phone: 'https://example.com' } } : paper) });
    reject({ ...state, papers: state.papers.map(paper => paper.kind === 'note' ? { ...paper, calls: { specialist: null, employer: null } } : paper) });
  });

  it('preserves unclear referral truth and HR conclusions without rerolling', () => {
    let state = appointment(7, 553);
    state = { ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, seal: 'unclear', authentic: false } } };
    state = act(state, 'take-document', 'take-paper', 'call-employer');
    const loaded = decodeSave(encodeSave(state));
    expect(loaded).toEqual(state);
    expect(loaded.visit?.calls.employer).toBe(false);
    reject({ ...state, visit: { ...state.visit, referral: { ...state.visit!.referral, authentic: true } } });
    reject({ ...state, papers: state.papers.map(paper => paper.kind === 'referral' ? { ...paper, details: { ...paper.details, ageDays: 11 } } : paper) });
    reject({ ...state, visit: { ...state.visit, referral: { ...state.visit!.referral, seal: 'clear' } } });
  });

  it('round-trips borderline findings, accepted cash and the pending and hospital endings', () => {
    let state = appointment(8, hypertensive.id, 1);
    expect(state.visit?.bribe).toBe('offered');
    state = act(state, 'take-document', 'take-paper', 'run-general', 'run-vision', 'run-pressure', 'run-pressure', 'run-pressure', 'accept-bribe');
    expect(state.money).toBe(100);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    const note = state.papers.find(paper => paper.kind === 'note');
    expect(note).toMatchObject({ bribe: true, results: { vision: effectivePatient(hypertensive.id, true).visionValues } });
    const pending = act(state, 'take-certificate', 'write-certificate', 'stamp-unfit', 'return-document');
    expect(pending.ending).toBe('assault-pending');
    expect(decodeSave(encodeSave(pending))).toEqual(pending);
    const hospital = act({ ...pending, clockMinutes: 840 }, 'end-day');
    expect(hospital.ending).toBe('hospital');
    expect(decodeSave(encodeSave(hospital))).toEqual(hospital);
    expect(act(decodeSave(encodeSave(hospital)), 'next-day')).toEqual(hospital);
    reject({ ...pending, ending: 'hospital' });
    reject({ ...hospital, ending: 'assault-pending' });
    reject({ ...state, papers: state.papers.map(paper => paper.kind === 'note' ? { ...paper, bribe: false } : paper) });
  });

  it('keeps ZUS correspondence for an expired referral of a clinically fit patient', () => {
    let state = appointment(5, 553);
    state = { ...state, rngState: 1000, visit: { ...state.visit!, referral: { ...defaultReferral(5, 553), ageDays: 5 } } };
    state = act(state, 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    expect(state.daily.zusCases).toBe(1);
    expect(state.papers.find(paper => paper.kind === 'letter')).toMatchObject({ sender: 'zus' });
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it('migrates v15 without new offences or RNG draws and keeps its schema strict', () => {
    const current = act(appointment(7, 553), 'take-document', 'take-paper', 'run-pressure');
    const historical = structuredClone(current) as unknown as Record<string, unknown>;
    delete historical.budgetHistory; delete historical.ending; delete historical.pendingReferrals; delete historical.referralsIssued;
    historical.roster = current.roster.filter(id => PATIENTS[id]!.characterId < 78);
    const oldVisit = historical.visit as Record<string, unknown>;
    for (const key of ['referral', 'specialist', 'specialistTaken', 'calls', 'bribe', 'noteOrder', 'startedDay', 'additionalResult', 'additionalTests']) delete oldVisit[key];
    for (const paper of historical.papers as Record<string, unknown>[]) {
      delete paper.noteOrder; delete paper.details; delete paper.calls; delete paper.bribe;
    }
    const oldFile = (state: unknown): Uint8Array => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 15, savedAt: '2026-10-26T12:00:00.000Z', state })));
    const migrated = decodeSave(oldFile(historical));
    expect(migrated.rngState).toBe(current.rngState);
    expect(migrated.visit).toMatchObject({ referral: defaultReferral(7, 553), specialist: null, specialistTaken: false,
      calls: { specialist: null, employer: null }, bribe: 'none', pressureReadings: current.visit!.pressureReadings });
    expect(migrated.ending).toBeNull();
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    expect(() => decodeSave(oldFile(current))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
    reject(historical);
  });

  it('rejects unknown or missing progression fields before replacing state', () => {
    const state = specialistVisit();
    for (const key of ['ending', 'visit']) {
      const missing = { ...state } as Record<string, unknown>;
      delete missing[key]; reject(missing);
    }
    reject({ ...state, visit: { ...state.visit, bribe: 'paid' } });
    reject({ ...state, visit: { ...state.visit, calls: { ...state.visit!.calls, extra: true } } });
    reject({ ...state, visit: { ...state.visit, referral: { ...state.visit!.referral, extra: 1 } } });
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
});
