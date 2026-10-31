import { createInitialState } from './fixtures/game';
import { describe, expect, it } from 'vitest';
import { applyAction, CLINIC_CLOSE_MINUTES, GAME_LIMITS, INTRO_SLIDES, PATIENTS, clippedDocuments, isDocumentClipped, type GameAction, type GameState } from '../src/core/game';
import { DISCRETIONARY_CASE_START, disqualifyingPressure, pressureAssessment } from '../src/core/patients';

function act(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((current, action) => applyAction(current, action).state, state);
}

function cabinet(): GameState {
  return act(createInitialState(), 'skip-intro');
}

function readyToStamp(state = cabinet()): GameState {
  return act(state, 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-general', 'run-vision', 'run-pressure', 'run-measurements');
}

describe('separate drawer objects', () => {
  it('stores and retrieves the manual and individual clips without changing documents', () => {
    const original = act(cabinet(), 'take-paper', { type: 'store-paper', paperId: 1 });
    const stored = act(original,
      { type: 'store-drawer-item', item: 'manual' },
      { type: 'store-drawer-item', item: 'clip' }, { type: 'store-drawer-item', item: 'clip' });
    expect(stored.drawerItems.drawer).toEqual({ manual: true, clips: 2 });
    expect(stored.papers).toBe(original.papers);
    expect(stored.clockMinutes).toBe(original.clockMinutes + 3);
    expect(original.drawerItems.drawer).toEqual({ manual: false, clips: 0 });
    const retrieved = act(stored, { type: 'retrieve-drawer-item', item: 'manual' }, { type: 'retrieve-drawer-item', item: 'clip' });
    expect(retrieved.drawerItems.drawer).toEqual({ manual: false, clips: 1 });
    expect(retrieved.clockMinutes).toBe(stored.clockMinutes + 2);
  });

  it('rejects empty retrieval, a duplicate manual and excess clips without spending time', () => {
    const empty = cabinet();
    for (const item of ['manual', 'clip'] as const) {
      expect(applyAction(empty, { type: 'retrieve-drawer-item', item })).toEqual({ state: empty, feedback: 'item-missing' });
    }
    const full = { ...empty, drawerItems: { drawer: { manual: true, clips: GAME_LIMITS.drawerClips }, 'drawer-2': { manual: false, clips: 0 } } };
    expect(applyAction(full, { type: 'store-drawer-item', item: 'manual' })).toEqual({ state: full, feedback: 'item-stored' });
    expect(applyAction(full, { type: 'store-drawer-item', item: 'clip' })).toEqual({ state: full, feedback: 'limit-reached' });
    expect(applyAction(createInitialState(), { type: 'store-drawer-item', item: 'manual' }).state.drawerItems.drawer.manual).toBe(false);
  });

  it('retains stored objects across visits and days, including actions after closing', () => {
    let state = act({ ...cabinet(), money: 100000 }, { type: 'store-drawer-item', item: 'manual' }, { type: 'store-drawer-item', item: 'clip' });
    for (let patient = 0; patient < state.roster.length; patient++) {
      state = act(state, 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    }
    const closed = { ...state, phase: 'cabinet' as const, settlement: null, clockMinutes: 840 };
    expect(applyAction(closed, { type: 'retrieve-drawer-item', item: 'clip' }).state).toMatchObject({ clockMinutes: 841, drawerItems: { drawer: { manual: true, clips: 0 }, 'drawer-2': { manual: false, clips: 0 } } });
    expect(act(closed, 'end-day', 'next-day').drawerItems.drawer).toEqual({ manual: true, clips: 1 });
  });
});

describe('career introduction', () => {
  it('enters an empty cabinet immediately after the fourth slide', () => {
    let state = createInitialState();
    for (let slide = 0; slide < 4; slide += 1) {
      expect(state.phase).toBe('intro');
      expect(state.introStep).toBe(slide);
      expect(applyAction(state, 'call-patient').state).toBe(state);
      state = act(state, 'advance-intro');
    }
    expect(state.phase).toBe('cabinet');
    expect(state.introStep).toBe(3);
    expect(state.visit).toBeNull();
    expect(state.shiftCompleted).toBe(0);
    expect(state.clockMinutes).toBe(477);
  });

  it('allows skipping the remaining introduction and cannot replay it accidentally', () => {
    const state = act(createInitialState(), 'advance-intro', 'skip-intro');
    expect(state.phase).toBe('cabinet');
    expect(state.introStep).toBe(INTRO_SLIDES - 1);
    expect(applyAction(state, 'advance-intro').state).toBe(state);
  });
});

describe('cabinet work', () => {
  it('requires a patient for work and referral intake before certificate handling', () => {
    let state = cabinet();
    expect(applyAction(state, 'run-vision')).toEqual({ state, feedback: 'no-patient' });
    state = act(state, 'call-patient');
    expect(state.visit?.document).toBe('tray');
    expect(applyAction(state, 'call-patient')).toEqual({ state, feedback: 'patient-waiting' });
    for (const action of ['take-certificate', 'write-certificate', 'stamp-fit', 'stamp-unfit', 'return-document'] as const) {
      expect(applyAction(state, action)).toEqual({ state, feedback: 'document-needed' });
    }
    state = act(state, 'take-document', 'take-certificate');
    expect(applyAction(state, 'return-document')).toEqual({ state, feedback: 'stamp-needed' });
    state = act(state, 'run-vision');
    state = act(state, 'run-pressure');
    expect(applyAction(state, 'return-document')).toEqual({ state, feedback: 'stamp-needed' });
    expect(state.patientsProcessed).toBe(0);
  });

  it.each([
    [], ['run-vision'], ['run-pressure'],
  ] as const)('allows a stamped document with incomplete examinations %j to be returned with neutral completion', (...tests) => {
    const state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'write-certificate', ...tests, 'stamp-fit');
    expect(state.visit?.decision).toBe('fit');
    const returned = applyAction(state, 'return-document');
    expect(returned.feedback).toBe('patient-completed');
    expect(returned.state).toMatchObject({ visit: null, money: 0, patientsProcessed: 1, shiftCompleted: 1, clockMinutes: state.clockMinutes + 1 });
  });

  it('allows examinations and stamp corrections after an early decision before returning it', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'stamp-unfit');
    expect(state.clockMinutes).toBe(483);
    state = act(state, 'stamp-fit', 'stamp-fit');
    expect(state.clockMinutes).toBe(485);
    state = act(state, 'run-pressure');
    expect(state.clockMinutes).toBe(489);
    expect(state.visit?.decision).toBe('fit');
    state = act(state, 'run-vision', 'run-vision', 'run-measurements');
    expect(state.clockMinutes).toBe(497);
    state = act(state, 'run-general', 'write-certificate');
    expect(applyAction(state, 'return-document')).toMatchObject({
      feedback: 'patient-cleared', state: { money: 0, patientsProcessed: 1, clockMinutes: 502 },
    });
  });

  it('lets a corrected stamp replace the first decision before submission', () => {
    const state = act(readyToStamp(), 'stamp-unfit', 'stamp-fit');
    expect(state.visit?.decision).toBe('fit');
    const returned = applyAction(state, 'return-document');
    expect(returned.feedback).toBe('patient-cleared');
    expect(returned.state).toMatchObject({ visit: null, money: 0, patientsProcessed: 1, shiftCompleted: 1 });
    expect(applyAction(returned.state, 'return-document').state).toBe(returned.state);
  });

  it('counts an incorrect decision without paying a reward', () => {
    const result = applyAction(act(readyToStamp(), 'stamp-unfit'), 'return-document');
    expect(result.feedback).toBe('patient-error');
    expect(result.state).toMatchObject({ visit: null, money: 0, patientsProcessed: 1, shiftCompleted: 1 });
  });

  it('settles a completed day and preserves totals and decorations into the next day', () => {
    let state = act(cabinet(), 'toggle-lamp', 'change-decoration');
    expect(applyAction(state, 'next-day')).toEqual({ state, feedback: 'shift-unfinished' });
    while (state.clockMinutes < 840 && state.shiftCompleted < state.roster.length) {
      const patient = PATIENTS[state.roster[state.shiftCompleted]!]!;
      state = act(state, 'call-patient', 'take-document', 'take-certificate');
      expect(state.visit?.patientId).toBe(patient.id);
      const vision = applyAction(state, 'run-vision');
      expect(vision.feedback).toBe(`vision-${patient.vision}`);
      const pressure = applyAction(vision.state, 'run-pressure');
      expect(pressure.feedback).toBe(`pressure-${patient.pressure}`);
      state = act(pressure.state, 'run-general', 'run-measurements', 'write-certificate', patient.expectedDecision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
    }
    expect(state).toMatchObject({ day: 1, phase: 'home', visit: null });
    expect(state.clockMinutes).toBeGreaterThanOrEqual(840);
    expect(applyAction(state, 'call-patient')).toEqual({ state, feedback: 'none' });
    state = act(state, 'end-day');
    expect(state.settlement).toMatchObject({ income: 1000 + state.shiftCompleted * 50, insuranceCost: 300, fines: 0 });
    const next = applyAction(state, 'next-day');
    expect(next.feedback).toBe('next-day');
    expect(next.state).toMatchObject({ day: 2, shiftCompleted: 0, money: state.money, patientsProcessed: state.patientsProcessed, clockMinutes: 477, lampOn: false, decoration: 'certificate' });
    // This assertion covers the next daily queue, independently of inspections.
    const ready = { ...next.state, inspectionCheckedAt: next.state.patientsProcessed };
    expect(act(ready, 'call-patient').visit?.patientId).toBe(next.state.roster[0]);
  });

  it('does not mutate either the original state or its visit', () => {
    const state = act(cabinet(), 'call-patient');
    Object.freeze(state.visit);
    Object.freeze(state);
    const onDesk = act(state, 'take-document');
    expect(onDesk).not.toBe(state);
    expect(onDesk.visit).not.toBe(state.visit);
    expect(state.visit?.document).toBe('tray');
    const tested = act(onDesk, 'run-vision');
    const repeated = applyAction(tested, 'run-vision').state;
    expect(repeated).not.toBe(tested);
    expect(repeated.visit).toEqual(tested.visit);
    expect(repeated.clockMinutes).toBe(tested.clockMinutes + 3);
  });

  it('spends small amounts on handling, reading, repeated work and returning the certificate', () => {
    let state = cabinet();
    expect(state.clockMinutes).toBe(477);
    state = act(state, 'toggle-lamp', 'change-decoration', 'run-pressure');
    expect(state.clockMinutes).toBe(479);
    const stages = [
      ['call-patient', 480], ['take-document', 481], ['take-certificate', 482], ['run-pressure', 486],
      ['run-vision', 489], ['stamp-fit', 490], ['stamp-unfit', 491],
      ['stamp-fit', 492], ['run-vision', 495], ['run-pressure', 499],
      ['handle-item', 500], ['read-manual', 501], ['write-certificate', 502], ['return-document', 503],
      ['call-patient', 504],
    ] as const;
    for (const [action, minutes] of stages) {
      state = act(state, action);
      expect(state.clockMinutes).toBe(minutes);
    }
  });

  it('does not spend time on unavailable work, menu actions, or the introduction', () => {
    const intro = createInitialState();
    expect(act(intro, 'handle-item', 'read-manual', 'run-vision').clockMinutes).toBe(477);
    const empty = cabinet();
    expect(act(empty, 'run-vision', 'return-document', 'next-day').clockMinutes).toBe(477);
    const active = act(empty, 'call-patient');
    expect(act(active, 'call-patient', 'take-certificate', 'return-document').clockMinutes).toBe(480);
  });

  it('continues action time beyond admissions closing while completing an active visit', () => {
    const late = { ...readyToStamp(), clockMinutes: 839 };
    const stamped = act(late, 'run-pressure', 'stamp-fit', 'handle-item', 'read-manual');
    expect(stamped.clockMinutes).toBe(846);
    const returned = applyAction(stamped, 'return-document');
    expect(returned.state.clockMinutes).toBe(847);
    expect(returned.feedback).toBe('patient-cleared');
  });

  it('keeps progress within the portable save limits', () => {
    const exhausted = { ...cabinet(), patientsProcessed: GAME_LIMITS.patients };
    expect(applyAction(exhausted, 'call-patient')).toEqual({ state: exhausted, feedback: 'limit-reached' });
    const stamped = act(readyToStamp(), 'stamp-fit');
    const rich = { ...stamped, money: GAME_LIMITS.money - 5 };
    expect(applyAction(rich, 'return-document').state.money).toBe(rich.money);
    const overflowing = { ...cabinet(), money: GAME_LIMITS.money, clockMinutes: 840, rngState: 7 };
    expect(applyAction(overflowing, 'end-day')).toEqual({ state: overflowing, feedback: 'limit-reached' });
    const finalDay = act({ ...cabinet(), day: GAME_LIMITS.day, money: 1000, clockMinutes: 840 }, 'end-day');
    expect(applyAction(finalDay, 'next-day')).toEqual({ state: finalDay, feedback: 'limit-reached' });
  });
});

describe('paperwork and the new instruments', () => {
  it('identifies desk notes on arrival and retrieval while keeping stored supplies blank', () => {
    const supplies = act(cabinet(), 'take-paper', 'take-paper', { type: 'store-paper', paperId: 2 });
    expect(supplies.papers.every(paper => paper.patientId === null)).toBe(true);
    const arrived = act(supplies, 'call-patient');
    expect(arrived.papers[0]).toMatchObject({ patientId: 0, additionalWritten: false, examinationOrder: [], results: { general: null } });
    expect(arrived.papers[1]).toMatchObject({ patientId: null, location: 'drawer' });
    const retrieved = act(arrived, { type: 'retrieve-paper', paperId: 2 });
    expect(retrieved.papers[1]).toMatchObject({ patientId: 0, additionalWritten: false, examinationOrder: [], results: { general: null } });
  });

  it('fills a blank stored sheet when it is retrieved after examinations', () => {
    const stored = act(cabinet(), 'take-paper', { type: 'store-paper', paperId: 1 },
      'call-patient', 'take-document', 'run-vision');
    expect(stored.papers.find(paper => paper.id === 1)).toMatchObject({ patientId: null, location: 'drawer', results: { vision: null } });
    const retrieved = act(stored, { type: 'retrieve-paper', paperId: 1 });
    expect(retrieved.papers.find(paper => paper.id === 1)).toMatchObject({ patientId: 0, location: 'desk', additionalWritten: false, results: { vision: PATIENTS[0]!.visionValues } });
    expect(retrieved.clockMinutes).toBe(stored.clockMinutes + 1);
  });

  it('requires measurements for a complete examination and returns reproducible weight and height', () => {
    const state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-general', 'run-vision', 'run-pressure', 'stamp-fit');
    expect(applyAction(state, 'return-document').feedback).toBe('patient-completed');
    const measured = applyAction(state, 'run-measurements');
    expect(measured.feedback).toBe('measurements-taken');
    expect(measured.state.clockMinutes).toBe(state.clockMinutes + 2);
    expect(measured.state.visit?.measurementsTaken).toBe(true);
    expect(applyAction(measured.state, 'return-document').feedback).toBe('patient-cleared');
    expect(applyAction(measured.state, 'run-measurements').state.clockMinutes).toBe(state.clockMinutes + 4);
  });

  it('automatically records results and history while the legacy writing action stays idempotent', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'take-paper');
    const blank = state.papers[1]!;
    expect(blank).toMatchObject({ id: 2, kind: 'note', patientId: 0, additionalWritten: false,
      results: { vision: null, pressure: null, weight: null, height: null } });
    state = act(state, 'run-vision', 'run-measurements');
    expect(state.papers).toHaveLength(2);
    expect(state.papers[0]).toMatchObject({ id: 1, kind: 'referral', patientId: 0 });
    expect(state.papers[1]).toMatchObject({ patientId: 0, additionalWritten: false,
      results: { vision: PATIENTS[0]!.visionValues, pressure: null, weight: 62, height: 164 } });
    expect(blank).toMatchObject({ patientId: 0, results: { vision: null } });
    expect(applyAction(state, { type: 'write-note', paperId: 2 })).toEqual({ state, feedback: 'results-needed' });
    state = act(state, 'run-general');
    state = act(state, { type: 'write-note', paperId: 2 });
    expect(state.papers[1]).toMatchObject({ additionalWritten: true });
    expect(applyAction(state, { type: 'write-note', paperId: 2 }).state).toBe(state);
    state = act(state, { type: 'clip-document', documentId: 2 }, { type: 'store-paper', paperId: 2 }, 'run-pressure');
    expect(state.papers[1]).toMatchObject({ location: 'drawer', results: { pressure: PATIENTS[0]!.pressureValues } });
    expect(isDocumentClipped(state, 2)).toBe(true);
    const stored = state;
    expect(applyAction(state, { type: 'write-note', paperId: 2 })).toEqual({ state, feedback: 'paper-missing' });
    state = act(state, { type: 'retrieve-paper', paperId: 2 });
    expect(state.papers[1]).toMatchObject({ location: 'desk' });
    expect(isDocumentClipped(state, 2)).toBe(true);
    expect(stored.papers[1]?.location).toBe('drawer');
    state = act(state, { type: 'trash-paper', paperId: 2 });
    expect(state.papers.map(paper => paper.kind)).toEqual(['referral']);
    expect(state.paperClips).toEqual([]);
    expect(state.visit).toMatchObject({ visionTested: true, pressureTested: true, measurementsTaken: true, decision: null });
  });

  it('backfills newly fetched notes while protecting previous patients and stored blank supplies', () => {
    let state = act(readyToStamp(), 'take-paper');
    expect(state.papers[1]).toMatchObject({ patientId: 0, additionalWritten: true,
      results: { vision: PATIENTS[0]!.visionValues, pressure: PATIENTS[0]!.pressureValues, weight: 62, height: 164 } });
    state = act(state, 'stamp-fit', 'return-document', 'take-paper', { type: 'store-paper', paperId: 3 },
      'call-patient', 'take-document', 'take-certificate', 'run-vision');
    expect(applyAction(state, { type: 'write-note', paperId: 2 })).toEqual({ state, feedback: 'paper-wrong-patient' });
    expect(state.papers.find(paper => paper.id === 2)).toMatchObject({ patientId: 0, results: { vision: PATIENTS[0]!.visionValues } });
    expect(state.papers.find(paper => paper.id === 3)).toMatchObject({ patientId: null, results: { vision: null } });
    state = act(state, { type: 'retrieve-paper', paperId: 3 }, 'run-pressure');
    expect(state.papers.find(paper => paper.id === 3)).toMatchObject({ patientId: 1, results: { vision: PATIENTS[1]!.visionValues, pressure: PATIENTS[1]!.pressureValues } });
  });

  it('files documents in last-stored order, including older papers filed again', () => {
    let state = act(cabinet(), 'take-paper', 'take-paper', { type: 'store-paper', paperId: 2 }, { type: 'store-paper', paperId: 1 });
    const latest = () => [...state.papers].reverse().find(paper => paper.location === 'drawer')?.id;
    expect(latest()).toBe(1);
    state = act(state, { type: 'retrieve-paper', paperId: 1 });
    expect(latest()).toBe(2);
    state = act(state, { type: 'store-paper', paperId: 1 });
    expect(latest()).toBe(1);
    expect(state.papers.map(paper => paper.id)).toEqual([2, 1]);
  });

  it('does not invent results or consume paper when repeated intake is activated', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'take-paper');
    expect(applyAction(state, 'take-document').state).toBe(state);
    state = act(state, { type: 'write-note', paperId: 2 });
    expect(state.papers[1]).toMatchObject({ patientId: 0, additionalWritten: false,
      results: { vision: null, pressure: null, weight: null, height: null } });
    expect(applyAction(state, { type: 'write-note', paperId: 2 }).state).toBe(state);
    state = act(state, { type: 'trash-paper', paperId: 1 });
    expect(state.papers).toHaveLength(1);
    expect(state.visit?.document).toBe('desk');
    expect(applyAction(state, { type: 'trash-paper', paperId: 999 }).state).toBe(state);
  });

  it('delivers an employer complaint for rejecting a fit patient, then opens and discards it', () => {
    let state = act(readyToStamp(), 'stamp-unfit', 'return-document');
    const letter = state.papers.find(paper => paper.kind === 'letter')!;
    expect(letter).toMatchObject({ kind: 'letter', sender: 'employer', opened: false, patientId: 0 });
    state = act(state, { type: 'open-letter', paperId: letter.id });
    expect(state.papers.find(paper => paper.id === letter.id)).toMatchObject({ opened: true });
    state = act(state, { type: 'trash-paper', paperId: letter.id });
    expect(state.papers.some(paper => paper.kind === 'letter')).toBe(false);
    expect(state.patientsProcessed).toBe(1);
  });

  it('delivers a ZUS complaint for accepting an unfit patient, and none for an incomplete correct decision', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    expect(state.papers.some(paper => paper.kind === 'letter')).toBe(false);
    state = act(state, 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    expect(state.papers.find(paper => paper.kind === 'letter')).toMatchObject({ sender: 'zus', patientId: 1, opened: false });
  });

  it('retains stored documentation across shifts and only records a telephone interaction', () => {
    let state = act(cabinet(), 'take-paper', { type: 'store-paper', paperId: 1 });
    for (const patient of state.roster.map(id => PATIENTS[id]!)) state = act(state, 'call-patient', 'take-document', 'take-certificate', 'write-certificate', patient.expectedDecision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
    const papers = state.papers;
    state = act(state, 'end-day', 'next-day');
    expect(state.papers).toBe(papers);
    const called = applyAction(state, 'use-phone');
    expect(called.feedback).toBe('phone-unavailable');
    expect(called.state).toEqual({ ...state, clockMinutes: 478 });
  });
});

describe('separate referral and certificate intake', () => {
  it('requires the handwritten name before handoff and writes it only once', () => {
    const waiting = act(cabinet(), 'call-patient');
    expect(applyAction(waiting, 'write-certificate')).toEqual({ state: waiting, feedback: 'document-needed' });
    const referral = act(waiting, 'take-document');
    expect(applyAction(referral, 'write-certificate')).toEqual({ state: referral, feedback: 'certificate-needed' });
    const unnamed = act(referral, 'take-certificate', 'stamp-fit');
    expect(unnamed.visit?.certificateNamed).toBe(false);
    expect(applyAction(unnamed, 'return-document')).toEqual({ state: unnamed, feedback: 'certificate-name-needed' });
    const named = applyAction(unnamed, 'write-certificate');
    expect(named.feedback).toBe('certificate-written');
    expect(named.state.visit?.certificateNamed).toBe(true);
    expect(named.state.clockMinutes).toBe(unnamed.clockMinutes + 1);
    expect(applyAction(named.state, 'write-certificate').state).toBe(named.state);
    expect(act(named.state, 'return-document').visit).toBeNull();
  });

  it('takes only the referral, permits examinations and notes, and requires a separately fetched certificate for a decision', () => {
    const empty = cabinet();
    expect(applyAction(empty, 'take-certificate')).toEqual({ state: empty, feedback: 'no-patient' });
    const waiting = act(empty, 'call-patient');
    expect(applyAction(waiting, 'take-certificate')).toEqual({ state: waiting, feedback: 'document-needed' });
    let state = act(waiting, 'take-document');
    expect(state.visit).toMatchObject({ document: 'desk', certificateTaken: false, decision: null });
    expect(state.papers).toHaveLength(1);
    expect(state.papers[0]?.kind).toBe('referral');
    for (const action of ['stamp-fit', 'stamp-unfit', 'return-document'] as const) {
      expect(applyAction(state, action)).toEqual({ state, feedback: 'certificate-needed' });
    }
    state = act(state, 'run-vision', 'run-pressure', 'run-measurements', 'take-paper', { type: 'write-note', paperId: 2 });
    expect(state.visit?.certificateTaken).toBe(false);
    expect(state.papers[1]).toMatchObject({ kind: 'note', results: { vision: PATIENTS[0]!.visionValues, pressure: PATIENTS[0]!.pressureValues, weight: 62, height: 164 } });
    const fetched = applyAction(state, 'take-certificate');
    expect(fetched.feedback).toBe('certificate-taken');
    expect(fetched.state.visit?.certificateTaken).toBe(true);
    expect(fetched.state.clockMinutes).toBe(state.clockMinutes + 1);
    expect(fetched.state.papers).toBe(state.papers);
    expect(fetched.state.nextPaperId).toBe(state.nextPaperId);
    expect(applyAction(fetched.state, 'take-certificate')).toEqual({ state: fetched.state, feedback: 'certificate-taken' });
    expect(applyAction(fetched.state, 'return-document').feedback).toBe('stamp-needed');
    state = act(fetched.state, 'write-certificate', 'stamp-fit', 'return-document', 'call-patient', 'take-document');
    expect(state.visit).toMatchObject({ patientId: 1, certificateTaken: false, decision: null });
  });
});

describe('paperclip bundles', () => {
  it('joins complete groups at an attached clip and clicking any member’s clip separates them', () => {
    let state = act(cabinet(), 'take-paper', 'take-paper', 'take-paper', 'take-paper');
    expect(applyAction(state, { type: 'join-documents', documentId: 2, targetId: 1 })).toEqual({ state, feedback: 'clip-needed' });
    state = act(state, { type: 'clip-document', documentId: 1 }, { type: 'join-documents', documentId: 2, targetId: 1 },
      { type: 'clip-document', documentId: 3 }, { type: 'join-documents', documentId: 4, targetId: 3 });
    const before = structuredClone(state);
    const joined = act(state, { type: 'join-documents', documentId: 2, targetId: 4 });
    expect(joined.paperClips).toEqual([[3, 4, 1, 2]]);
    expect(clippedDocuments(joined, 1)).toEqual([3, 4, 1, 2]);
    const members = clippedDocuments(joined, 1);
    members.pop();
    expect(joined.paperClips[0]).toHaveLength(4);
    expect(state).toEqual(before);
    expect(applyAction(joined, { type: 'join-documents', documentId: 2, targetId: 1 }).state).toBe(joined);
    expect(applyAction(joined, { type: 'clip-document', documentId: 2 }).state).toBe(joined);
    state = act(joined, { type: 'unclip-document', documentId: 4 });
    expect(state.paperClips).toEqual([]);
    expect(clippedDocuments(state, 1)).toEqual([1]);
    expect(isDocumentClipped(state, 1)).toBe(false);
    expect(state.clockMinutes).toBe(joined.clockMinutes + 1);
    expect(applyAction(state, { type: 'unclip-document', documentId: 4 }).state).toBe(state);
  });

  it('stores, retrieves and disposes the complete bundle with one action per operation', () => {
    let state = act(cabinet(), 'take-paper', 'take-paper', 'take-paper',
      { type: 'clip-document', documentId: 1 }, { type: 'join-documents', documentId: 2, targetId: 1 });
    const before = state.clockMinutes;
    state = act(state, { type: 'store-paper', paperId: 2 });
    expect(state.papers.map(paper => [paper.id, paper.location])).toEqual([[3, 'desk'], [1, 'drawer'], [2, 'drawer']]);
    expect(state.clockMinutes).toBe(before + 1);
    expect(applyAction(state, { type: 'join-documents', documentId: 3, targetId: 1 })).toEqual({ state, feedback: 'paper-missing' });
    expect(applyAction(state, { type: 'unclip-document', documentId: 2 })).toEqual({ state, feedback: 'paper-missing' });
    state = act(state, { type: 'retrieve-paper', paperId: 1 });
    expect(state.papers.every(paper => paper.location === 'desk')).toBe(true);
    expect(state.paperClips).toEqual([[1, 2]]);
    state = act(state, { type: 'trash-paper', paperId: 2 });
    expect(state.papers.map(paper => paper.id)).toEqual([3]);
    expect(state.paperClips).toEqual([]);
    expect(state.clockMinutes).toBe(before + 3);
  });

  it('protects an active certificate from storage and disposal and detaches it on handoff', () => {
    let state = act(readyToStamp(), 'take-paper', { type: 'clip-document', documentId: 'certificate' },
      { type: 'join-documents', documentId: 1, targetId: 'certificate' },
      { type: 'join-documents', documentId: 2, targetId: 1 });
    expect(state.paperClips).toEqual([['certificate', 1, 2]]);
    expect(applyAction(state, { type: 'store-paper', paperId: 1 })).toEqual({ state, feedback: 'certificate-in-bundle' });
    expect(applyAction(state, { type: 'trash-paper', paperId: 2 })).toEqual({ state, feedback: 'certificate-in-bundle' });
    state = act(state, 'stamp-fit', 'return-document');
    expect(state.visit).toBeNull();
    expect(state.papers).toHaveLength(2);
    expect(state.paperClips).toEqual([[1, 2]]);
    expect(applyAction(state, { type: 'clip-document', documentId: 'certificate' })).toEqual({ state, feedback: 'paper-missing' });
  });
});


describe('general examination and chronological findings', () => {
  it('examines before referral intake and retains findings on existing, retrieved and later-fetched notes', () => {
    let state = act(cabinet(), 'take-paper', 'take-paper', { type: 'store-paper', paperId: 2 }, 'call-patient');
    state = act(state, 'run-general', 'run-vision', 'run-pressure', 'run-measurements');
    expect(state.visit).toMatchObject({ document: 'tray', certificateTaken: false, decision: null,
      generalTested: true, visionTested: true, pressureTested: true, measurementsTaken: true,
      examinationOrder: ['general', 'vision', 'pressure', 'measurements'] });
    expect(state.clockMinutes).toBe(493);
    const first = state.papers[0]!;
    expect(first).toMatchObject({ patientId: 0, results: { general: 'pass', pressure: PATIENTS[0]!.pressureValues } });
    expect(state.papers[1]).toMatchObject({ patientId: null });
    state = act(state, { type: 'retrieve-paper', paperId: 2 }, 'take-paper');
    for (const note of state.papers) {
      expect(note).toMatchObject({ patientId: 0, examinationOrder: first.kind === 'note' ? first.examinationOrder : [],
        results: first.kind === 'note' ? first.results : {} });
    }
    const visitBeforeIntake = state.visit;
    state = act(state, 'take-document');
    expect(state.visit).toEqual({ ...visitBeforeIntake, document: 'desk' });
    expect(state.papers.at(-1)).toMatchObject({ kind: 'referral', patientId: 0 });
    expect(act(state, 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document')).toMatchObject({ patientsProcessed: 1, visit: null });
  });

  it('varies repeat pressure readings deterministically and keeps only the first two on all current notes', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-paper', 'run-pressure');
    expect(state.visit!.pressureReadings).toEqual([PATIENTS[0]!.pressureValues]);
    const first = state.visit!.pressureReadings[0];
    state = act(state, { type: 'store-paper', paperId: 2 });
    const replay = applyAction(state, 'run-pressure').state;
    const repeated = applyAction(state, 'run-pressure').state;
    expect(repeated).toEqual(replay);
    expect(repeated.visit!.pressureReadings).toHaveLength(2);
    expect(repeated.visit!.pressureReadings[1]).not.toEqual(first);
    state = act(repeated, 'run-pressure', 'take-paper');
    expect(state.visit!.pressureReadings).toHaveLength(2);
    expect(state.visit!.pressureReadings).toEqual(repeated.visit!.pressureReadings);
    expect(state.visit!.pressureLatest).not.toEqual(repeated.visit!.pressureLatest);
    for (const paper of state.papers.filter(paper => paper.kind === 'note')) {
      expect(paper).toMatchObject({ results: { pressureReadings: state.visit!.pressureReadings, pressure: state.visit!.pressureReadings[1] } });
    }
    expect(state.visit!.examinationOrder).toEqual(['pressure']);
  });

  it('keeps repeated readings close to every case baseline without changing its fitness category', () => {
    for (const patient of PATIENTS) {
      let state = act({ ...cabinet(), roster: [patient.id] }, 'call-patient', 'take-document');
      for (let index = 0; index < 8; index++) {
        const prior = state.visit!.pressureLatest;
        state = act(state, 'run-pressure');
        const reading = state.visit!.pressureLatest!;
        expect(reading).not.toEqual(prior);
        expect(Math.abs(reading.systolic - patient.pressureValues.systolic)).toBeLessThanOrEqual(3);
        expect(Math.abs(reading.diastolic - patient.pressureValues.diastolic)).toBeLessThanOrEqual(2);
        if (patient.id < DISCRETIONARY_CASE_START) expect(disqualifyingPressure(reading)).toBe(patient.pressure === 'refer');
        else expect(pressureAssessment(reading)).toBe(pressureAssessment(patient.pressureValues));
      }
    }
  });

  it.each(['run-pressure', 'return-document', 'handle-item'] as const)('interrupts at 17:15 during %s without counting or penalizing the unfinished visit', action => {
    const prepared = act(readyToStamp(), 'take-paper', 'stamp-unfit', { type: 'clip-document', documentId: 2 },
      { type: 'join-documents', documentId: 'certificate', targetId: 2 });
    const late = { ...prepared, clockMinutes: CLINIC_CLOSE_MINUTES - 1 };
    const result = applyAction(late, action);
    expect(result.feedback).toBe('visit-interrupted');
    expect(result.state).toMatchObject({ phase: 'home', visit: null, clockMinutes: CLINIC_CLOSE_MINUTES,
      shiftCompleted: 0, patientsProcessed: 0, daily: late.daily, papers: late.papers,
      paperClips: [[2]], settlement: { patients: 0, patientBonus: 0, fines: 0 } });
    expect(applyAction(result.state, 'end-day').state).toBe(result.state);
    expect(act(result.state, 'next-day')).toMatchObject({ phase: 'cabinet', clockMinutes: 477, visit: null });
  });

  it('requires a general examination for every profile, and records findings in action order only once', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-paper');
    expect(state.papers[1]).toMatchObject({ patientId: 0, examinationOrder: [], results: { general: null } });
    state = act(state, 'run-pressure', 'run-general', 'run-measurements', 'run-vision', 'run-general');
    const order = ['pressure', 'general', 'measurements', 'vision'];
    expect(state.visit).toMatchObject({ generalTested: true, examinationOrder: order });
    expect(state.papers[1]).toMatchObject({ examinationOrder: order, results: {
      general: 'pass', vision: PATIENTS[0]!.visionValues, pressure: PATIENTS[0]!.pressureValues, weight: 62, height: 164,
    } });
    const later = act(state, 'take-paper');
    expect(later.papers[2]).toMatchObject({ examinationOrder: order });
    expect(later.papers[2]!.kind === 'note' && later.papers[2].examinationOrder).not.toBe(state.visit!.examinationOrder);
  });

  it('treats general concerns alone as a reason to refuse regardless of the job profile', () => {
    const patient = PATIENTS.find(patient => patient.general === 'refer')!;
    const initial = cabinet();
    const roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
    const examined = act({ ...initial, roster, rngState: 1234 }, 'call-patient', 'take-document', 'run-general', 'take-paper');
    expect(examined.papers[1]).toMatchObject({ results: { general: 'refer' } });
    expect(patient.vision).toBe('pass');
    expect(patient.pressure).toBe('pass');
    const approved = act(examined, 'take-certificate', 'write-certificate', 'stamp-fit');
    expect(applyAction(approved, 'return-document').state.daily.zusCases).toBe(1);
    const refused = act(examined, 'take-certificate', 'write-certificate', 'stamp-unfit', 'return-document');
    expect(refused.daily.refusals).toBe(0);
    expect(refused.papers.some(paper => paper.kind === 'letter')).toBe(false);
  });

  it('settles once as the final patient leaves at closing, including the first day living costs', () => {
    const active = { ...act(readyToStamp(), 'stamp-fit'), clockMinutes: 839 };
    const departure = applyAction(active, 'return-document');
    expect(departure.state).toMatchObject({ phase: 'home', visit: null, clockMinutes: 840, shiftCompleted: 1 });
    expect(departure.state.settlement!.livingCost).toBeGreaterThanOrEqual(400);
    expect(departure.state.settlement!.livingCost).toBeLessThanOrEqual(800);
    expect(applyAction(departure.state, 'call-patient').state).toBe(departure.state);
    expect(applyAction(departure.state, 'end-day').state).toBe(departure.state);
  });
});
