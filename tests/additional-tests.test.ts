import { legacyBudget } from './fixtures/legacy-budget';
import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, advanceClinicTime, createInitialState, GAME_LIMITS, type GameState, type GameAction } from '../src/core/game';
import { ADDITIONAL_TESTS, additionalTestForJob, additionalResultFor, type AdditionalTest } from '../src/core/additional-tests';
import { PATIENTS, randomStep } from '../src/core/patients';
import { expectedVisitDecision, patientForAppointment } from '../src/core/progression';
import { decodeSave, encodeSave } from '../src/core/save';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((s, action) => applyAction(s, action).state, state);
const patientForJob = (jobId: number, variant = 0) => PATIENTS.find(patient => patient.id >= 2503 && patient.jobId === jobId && patient.caseVariant === variant)!;
function appointment(jobId = 46, variant = 0, day = 9, patientId?: number): GameState {
  const patient = patientId === undefined ? patientForJob(jobId, variant) : PATIENTS[patientId]!, initial = createInitialState(3456);
  const roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
  const called = act({ ...initial, day, money: 10000, roster }, 'skip-intro', 'call-patient');
  return { ...called, visit: { ...called.visit!, bribe: 'none', specialist: null,
    referral: { ...called.visit!.referral, ageDays: 0, seal: 'clear', authentic: true } } };
}
function send(state: GameState, test: AdditionalTest, seed = 123456): GameState {
  const ready = act(state, 'take-document', 'take-additional-referral');
  const paperId = ready.papers.at(-1)!.id;
  return act({ ...ready, rngState: seed }, { type: 'select-additional-test', paperId, test }, { type: 'hand-additional-referral', paperId });
}
function complete(state: GameState): GameState {
  return act(state, 'take-document', 'take-certificate', 'write-certificate', expectedVisitDecision(state) === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
}
function returnNextWorkday(state: GameState): GameState {
  const returnDay = state.pendingReferrals[0]!.returnDay;
  state = act({ ...state, clockMinutes: 840 }, 'end-day');
  while (state.day < returnDay) state = act(state, 'next-day');
  return act(state, 'call-patient');
}
const roundTrip = (state: GameState) => expect(decodeSave(encodeSave(state))).toEqual(state);

describe('day seven additional examinations', () => {
  it('unlocks only on the seventh workday and delivers the Chamber directive', () => {
    const early = appointment(46, 0, 8);
    expect(applyAction(early, 'take-additional-referral').feedback).toBe('additional-unavailable');
    const home = act({ ...early, visit: null, clockMinutes: 840 }, 'end-day');
    const state = act(home, 'next-day');
    expect(state.papers).toContainEqual(expect.objectContaining({ kind: 'directive', rule: 'additional-tests', sender: 'chamber', day: 9 }));
    roundTrip(state);
  });

  it('selects exactly one test and retains notes, documents, findings and certificate without a bonus', () => {
    let state = act(appointment(), 'take-document', 'run-general', 'run-pressure', 'take-paper', 'take-certificate', 'write-certificate', 'take-additional-referral');
    const paperId = state.papers.at(-1)!.id;
    expect(applyAction(state, { type: 'hand-additional-referral', paperId }).feedback).toBe('test-needed');
    state = act(state, { type: 'select-additional-test', paperId, test: 'audiometry' }, { type: 'select-additional-test', paperId, test: 'vestibular' });
    const visit = state.visit!;
    state = act(state, { type: 'hand-additional-referral', paperId });
    expect(state.visit).toBeNull();
    expect(state.shiftCompleted).toBe(0);
    expect(state.patientsProcessed).toBe(0);
    expect(state.papers.map(paper => paper.kind)).toEqual(['referral', 'note']);
    expect(state.pendingReferrals[0]!.visit).toEqual({ ...visit, additionalTests: ['vestibular'] });
    roundTrip(state);
  });

  it.each(['vestibular', 'audiometry'] as const)('requires hours and three other appointments before a same-day %s return', (test) => {
    // This seed schedules a same-day return.
    let state = send(appointment(), test, 1000);
    const pending = state.pendingReferrals[0]!;
    expect(pending.returnDay).toBe(9);
    state = { ...state, clockMinutes: pending.returnMinute };
    for (let i = 0; i < 3; i++) {
      state = act(state, 'call-patient');
      expect(state.visit!.patientId).not.toBe(pending.visit.patientId);
      state = complete(state);
    }
    state = act(state, 'call-patient');
    expect(state.visit!.patientId).toBe(pending.visit.patientId);
    expect(state.visit!.additionalResult).toEqual({ test, fit: true });
    expect(state.pendingReferrals).toEqual([]);
    expect(state.papers).toContainEqual(expect.objectContaining({ kind: 'additional-result', patientId: pending.visit.patientId }));
    roundTrip(state);
  });

  it('keeps Friday paperwork through the weekend and resumes Monday without changing its original date', () => {
    let state = send(act(appointment(), 'take-document', 'run-pressure', 'take-paper'), 'vestibular', 1);
    expect(state.pendingReferrals[0]!.returnDay).toBe(12);
    const oldNote = state.papers.find(paper => paper.kind === 'note')!;
    state = act(state, { type: 'store-paper', paperId: oldNote.id });
    state = act({ ...state, clockMinutes: 840 }, 'end-day'); roundTrip(state);
    state = act(state, 'next-day'); roundTrip(state);
    state = act(state, 'next-day'); roundTrip(state);
    state = act(state, 'next-day', 'call-patient');
    expect(state.visit!.startedDay).toBe(9);
    expect(state.visit!.pressureReadings).toHaveLength(1);
    state = act(state, 'run-general', 'run-pressure', 'call-employer');
    const updated = state.papers.find(paper => paper.id === oldNote.id)!;
    expect(updated.day).toBe(9);
    expect(updated.kind === 'note' && updated.results.pressureReadings).toHaveLength(2);
    roundTrip(state);
  });

  it('fines every mismatched profession regardless of RNG and never counts referral as a completed appointment', () => {
    for (const seed of [0, 1, 1234, 0xffffffff]) {
      const state = send(appointment(), 'audiometry', seed);
      expect(state.daily).toMatchObject({ zusCases: 1, fines: 100 });
      expect(state.papers).toContainEqual(expect.objectContaining({ kind: 'letter', sender: 'zus' }));
      expect(state.shiftCompleted).toBe(0);
      roundTrip(state);
    }
  });

  it('maps all four tests to the correct occupations and preserves other contraindications', () => {
    for (const [job, test] of [[18, 'audiometry'], [46, 'vestibular'], [45, 'psychiatry'], [47, 'chest-xray']] as const) {
      expect(additionalTestForJob(patientForJob(job))).toBe(test);
    }
    const state = appointment(46, 2);
    const visit = { ...state.visit!, additionalTests: ['vestibular'] as AdditionalTest[], additionalResult: { test: 'vestibular' as const, fit: true } };
    expect(expectedVisitDecision({ ...state, visit })).toBe('unfit');
    const concerned = PATIENTS.find(patient => patient.jobId === 45 && patient.general === 'refer' && additionalResultFor(patient, 'psychiatry').fit)!;
    const psych = appointment(45, 4);
    const psychVisit = { ...psych.visit!, patientId: concerned.id, additionalTests: ['psychiatry'] as AdditionalTest[], additionalResult: { test: 'psychiatry' as const, fit: true } };
    expect(expectedVisitDecision({ ...psych, visit: psychVisit })).toBe('fit');
  });

  it('keeps the relevant report through a later wrong test and supports correction after a wrong first referral', () => {
    const patient = PATIENTS.find(patient => patient.id >= 2503 && patient.jobId === 45
      && patient.general === 'refer' && additionalResultFor(patient, 'psychiatry').fit)!;
    for (const order of [['psychiatry', 'audiometry'], ['audiometry', 'psychiatry']] as const) {
      let state = appointment(45, 4, 9, patient.id);
      for (const test of order) {
        state = returnNextWorkday(send(state, test, 1));
        roundTrip(state);
      }
      expect(state.visit!.additionalResult).toEqual({ test: 'psychiatry', fit: true });
      expect(expectedVisitDecision(state)).toBe('fit');
      state = act(state, 'take-additional-referral');
      const paperId = state.papers.at(-1)!.id;
      state = act(state, { type: 'select-additional-test', paperId, test: 'psychiatry' });
      expect(applyAction(state, { type: 'hand-additional-referral', paperId }).feedback).toBe('test-already-done');
    }
  });

  it('resumes an interrupted return on the next workday without losing its result or findings', () => {
    let state = returnNextWorkday(send(act(appointment(), 'take-document', 'run-pressure', 'take-paper'), 'vestibular', 1));
    const visit = state.visit!;
    state = advanceClinicTime(state, 1035 - state.clockMinutes).state;
    expect(state.phase).toBe('home');
    expect(state.shiftCompleted).toBe(0);
    expect(state.pendingReferrals[0]!.visit).toEqual(visit);
    roundTrip(state);
    state = act(state, 'next-day', 'call-patient');
    expect(state.visit).toEqual(visit);
    roundTrip(state);
  });

  it('migrates and re-exports an active historical paid weekend shift', () => {
    const initial = createInitialState(44);
    const historical = act({ ...initial, day: 3, roster: initial.roster.filter(id => PATIENTS[id]!.characterId < 78) }, 'skip-intro', 'call-patient');
    const raw = structuredClone(historical) as unknown as Record<string, unknown>;
    delete raw.pendingReferrals; delete raw.referralsIssued; delete raw.budgetHistory;
    const visit = raw.visit as Record<string, unknown>;
    delete visit.startedDay; delete visit.additionalResult; delete visit.additionalTests;
    const old = gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 18, savedAt: '2026-10-26T12:00:00.000Z', state: legacyBudget(raw) })));
    const migrated = decodeSave(old);
    expect(migrated.visit!.startedDay).toBe(3);
    roundTrip(migrated);
  });

  it('rejects forged result, return schedule, unknown fields and duplicate pending identities', () => {
    const state = send(appointment(), 'vestibular');
    const payload = (candidate: unknown) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 24, savedAt: '2026-10-26T12:00:00.000Z', state: candidate })));
    for (const change of [
      (s: GameState) => { s.pendingReferrals[0]!.fit = false; },
      (s: GameState) => { s.pendingReferrals[0]!.returnDay += 7; },
      (s: GameState) => { s.pendingReferrals.push(structuredClone(s.pendingReferrals[0]!)); },
      (s: GameState) => { s.pendingReferrals[0]!.visit.additionalTests = []; },
    ]) {
      const malformed = structuredClone(state); change(malformed);
      expect(() => decodeSave(payload(malformed))).toThrow();
    }
    expect(ADDITIONAL_TESTS).toHaveLength(4);
    expect(patientForAppointment(state.pendingReferrals[0]!.visit).jobId).toBe(46);
  });
});


describe('returned examination report handoff', () => {
  function returned(job = 46, variant = 0): GameState {
    const state = appointment(job, variant);
    const test = additionalTestForJob(patientForAppointment(state.visit!))!;
    return act(returnNextWorkday(send(state, test, 1)), 'take-document', 'take-certificate', 'write-certificate');
  }
  function bundle(state: GameState): GameState {
    const result = state.papers.find(paper => paper.kind === 'additional-result' && paper.patientId === state.visit!.patientId)!;
    return act(state, { type: 'clip-document', documentId: result.id },
      { type: 'join-documents', documentId: 'certificate', targetId: result.id });
  }

  it.each([18, 45, 46, 47])('always reprimands approval without the report for job %i', job => {
    const ready = act(returned(job), 'stamp-fit');
    expect(expectedVisitDecision(ready)).toBe('fit');
    for (const seed of [0, 1, 1000, 123456, 0xffffffff]) {
      const state = act({ ...ready, rngState: seed }, 'return-document');
      expect(state.visit).toBeNull();
      expect(state.daily).toEqual({ zusCases: 0, refusals: 1, fines: 0, insuranceIncrease: 50 });
      expect(state.insuranceRate).toBe(350);
      expect(state.rngState).toBe(seed);
      expect(state.papers).toContainEqual(expect.objectContaining({ kind: 'letter', sender: 'employer', reason: 'missing-result', opened: false }));
      expect(state.papers.some(paper => paper.kind === 'additional-result')).toBe(true);
      roundTrip(state);
    }
    const higher = act({ ...ready, insuranceRate: 450 }, 'return-document');
    expect(higher.insuranceRate).toBe(550);
    expect(higher.daily.insuranceIncrease).toBe(100);
    roundTrip(higher);
  });

  it.each(['fit', 'unfit'] as const)('hands over the clipped report with a %s certificate, retaining other records', decision => {
    let ready = act(returned(46, decision === 'fit' ? 0 : 2), 'take-paper', `stamp-${decision}`);
    const noteId = ready.papers.at(-1)!.id;
    ready = bundle(ready);
    ready = act(ready, { type: 'join-documents', documentId: noteId, targetId: 'certificate' });
    roundTrip(ready);
    const state = act(ready, 'return-document');
    expect(state.papers.map(paper => paper.kind)).toEqual(['referral', 'note']);
    expect(state.paperClips).toEqual([[noteId]]);
    expect(state.daily).toEqual(ready.daily);
    expect(state.insuranceRate).toBe(ready.insuranceRate);
    expect(state.shiftCompleted).toBe(1);
    roundTrip(state);
  });

  it('accepts a refusal without the report and leaves it with the doctor', () => {
    const ready = act(returned(46, 2), 'stamp-unfit');
    const state = act(ready, 'return-document');
    expect(state.visit).toBeNull();
    expect(state.daily).toEqual(ready.daily);
    expect(state.papers).toEqual(ready.papers);
    roundTrip(state);
  });

  it.each(['loose', 'filed', 'discarded', 'unclipped', 'wrong-patient', 'old-visit', 'wrong-test'] as const)('does not accept a %s report as the attachment', kind => {
    let ready = act(returned(), 'stamp-fit');
    const report = ready.papers.find(paper => paper.kind === 'additional-result')!;
    if (kind === 'filed' || kind === 'discarded') ready = act(ready, { type: kind === 'filed' ? 'store-paper' : 'trash-paper', paperId: report.id });
    if (kind === 'unclipped') ready = act(bundle(ready), { type: 'unclip-document', documentId: report.id });
    if (kind === 'wrong-patient' || kind === 'old-visit' || kind === 'wrong-test') {
      ready = bundle(ready);
      ready = { ...ready, papers: ready.papers.map(paper => paper.id !== report.id || paper.kind !== 'additional-result' ? paper : { ...paper,
        ...(kind === 'wrong-patient' ? { patientId: patientForJob(18).id } : {}),
        ...(kind === 'old-visit' ? { day: ready.visit!.startedDay - 1 } : {}),
        ...(kind === 'wrong-test' ? { test: 'audiometry' as const } : {}),
      }) };
    }
    const state = act(ready, 'return-document');
    expect(state.insuranceRate).toBe(350);
    expect(state.papers.some(paper => paper.kind === 'letter' && paper.reason === 'missing-result')).toBe(true);
    if (kind === 'wrong-patient' || kind === 'old-visit') expect(state.papers.some(paper => paper.id === report.id)).toBe(true);
  });

  it('applies the guaranteed insurance penalty alongside a detected medical approval error', () => {
    let seed = 0;
    while (randomStep(seed).value < 0.35) seed++;
    const ready = { ...act(returned(46, 2), 'stamp-fit'), rngState: seed };
    const state = act(ready, 'return-document');
    expect(state.daily).toEqual({ zusCases: 1, refusals: 1, fines: 100, insuranceIncrease: 50 });
    expect(state.papers.filter(paper => paper.kind === 'letter').map(paper => paper.sender)).toEqual(['zus', 'employer']);
    roundTrip(state);
    const old = gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 22, savedAt: '2026-10-27T12:00:00.000Z', state: legacyBudget(state) })));
    expect(() => decodeSave(old)).toThrow();
    const home = act({ ...state, clockMinutes: 840 }, 'end-day');
    expect(home.settlement).toMatchObject({ insuranceCost: 350, fines: 100, patientBonus: 50 });
    roundTrip(home);
  });

  it('keeps handoff atomic when insurance or letter identifiers reach their limits', () => {
    const ready = act(returned(), 'stamp-fit');
    for (const state of [{ ...ready, insuranceRate: GAME_LIMITS.money }, { ...ready, nextPaperId: GAME_LIMITS.paperId + 1 }]) {
      expect(applyAction(state, 'return-document')).toEqual({ state, feedback: 'limit-reached' });
    }
  });

  it('validates the saved reprimand reason and keeps previous saves importable', () => {
    const before = act(returned(), 'stamp-fit');
    const state = act(before, 'return-document');
    const file = (candidate: unknown, version = 24) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-27T12:00:00.000Z', state: version < 24 ? legacyBudget(candidate) : candidate })));
    expect(decodeSave(file(before, 22))).toEqual(before);
    for (const change of [{ reason: 'unknown' }, { sender: 'zus' }, { patientId: 0 }, { day: 1 }, { surprise: true }]) {
      const forged = { ...state, papers: state.papers.map(paper => paper.kind === 'letter' ? { ...paper, ...change } : paper) };
      expect(() => decodeSave(file(forged))).toThrow();
    }
  });
});
