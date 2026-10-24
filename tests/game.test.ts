import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, GAME_LIMITS, INTRO_SLIDES, PATIENTS, SHIFT_LENGTH, type GameAction, type GameState } from '../src/core/game';

function act(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((current, action) => applyAction(current, action).state, state);
}

function cabinet(): GameState {
  return act(createInitialState(), 'skip-intro');
}

function readyToStamp(state = cabinet()): GameState {
  return act(state, 'call-patient', 'take-document', 'take-certificate', 'run-vision', 'run-pressure', 'run-measurements');
}

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
  it('requires a patient and paperwork for work, and a stamp before returning the document', () => {
    let state = cabinet();
    expect(applyAction(state, 'run-vision')).toEqual({ state, feedback: 'no-patient' });
    state = act(state, 'call-patient');
    expect(state.visit?.document).toBe('tray');
    expect(applyAction(state, 'call-patient')).toEqual({ state, feedback: 'patient-waiting' });
    for (const action of ['take-certificate', 'run-vision', 'run-pressure', 'stamp-fit', 'stamp-unfit', 'return-document'] as const) {
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
  ] as const)('allows a stamped document with incomplete examinations %j to be returned as a mistake', (...tests) => {
    const state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', ...tests, 'stamp-fit');
    expect(state.visit?.decision).toBe('fit');
    const returned = applyAction(state, 'return-document');
    expect(returned.feedback).toBe('patient-error');
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
    expect(applyAction(state, 'return-document')).toMatchObject({
      feedback: 'patient-cleared', state: { money: 10, patientsProcessed: 1, clockMinutes: 498 },
    });
  });

  it('lets a corrected stamp replace the first decision before submission', () => {
    const state = act(readyToStamp(), 'stamp-unfit', 'stamp-fit');
    expect(state.visit?.decision).toBe('fit');
    const returned = applyAction(state, 'return-document');
    expect(returned.feedback).toBe('patient-cleared');
    expect(returned.state).toMatchObject({ visit: null, money: 10, patientsProcessed: 1, shiftCompleted: 1 });
    expect(applyAction(returned.state, 'return-document').state).toBe(returned.state);
  });

  it('counts an incorrect decision without paying a reward', () => {
    const result = applyAction(act(readyToStamp(), 'stamp-unfit'), 'return-document');
    expect(result.feedback).toBe('patient-error');
    expect(result.state).toMatchObject({ visit: null, money: 0, patientsProcessed: 1, shiftCompleted: 1 });
  });

  it('completes a deterministic shift and preserves totals and decorations into the next day', () => {
    let state = act(cabinet(), 'toggle-lamp', 'change-decoration');
    expect(applyAction(state, 'next-day')).toEqual({ state, feedback: 'shift-unfinished' });
    for (const patient of PATIENTS) {
      state = act(state, 'call-patient', 'take-document', 'take-certificate');
      expect(state.visit?.patientId).toBe(patient.id);
      const vision = applyAction(state, 'run-vision');
      expect(vision.feedback).toBe(`vision-${patient.vision}`);
      const pressure = applyAction(vision.state, 'run-pressure');
      expect(pressure.feedback).toBe(`pressure-${patient.pressure}`);
      state = act(pressure.state, 'run-measurements', patient.expectedDecision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
    }
    expect(state).toMatchObject({ day: 1, shiftCompleted: SHIFT_LENGTH, money: 30, patientsProcessed: 3, clockMinutes: 521, visit: null });
    expect(applyAction(state, 'call-patient')).toEqual({ state, feedback: 'shift-finished' });
    const next = applyAction(state, 'next-day');
    expect(next.feedback).toBe('next-day');
    expect(next.state).toMatchObject({ day: 2, shiftCompleted: 0, money: 30, patientsProcessed: 3, clockMinutes: 477, lampOn: false, decoration: 'certificate' });
    expect(act(next.state, 'call-patient').visit?.patientId).toBe(0);
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
      ['handle-item', 500], ['read-manual', 501], ['return-document', 502],
      ['call-patient', 503],
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
    expect(act(active, 'call-patient', 'run-pressure', 'return-document').clockMinutes).toBe(480);
  });

  it('caps action time at closing without preventing completion of an active visit', () => {
    const late = { ...readyToStamp(), clockMinutes: 839 };
    const stamped = act(late, 'run-pressure', 'stamp-fit', 'handle-item', 'read-manual');
    expect(stamped.clockMinutes).toBe(840);
    const returned = applyAction(stamped, 'return-document');
    expect(returned.state.clockMinutes).toBe(840);
    expect(returned.feedback).toBe('patient-cleared');
  });

  it('keeps progress within the portable save limits', () => {
    const exhausted = { ...cabinet(), patientsProcessed: GAME_LIMITS.patients };
    expect(applyAction(exhausted, 'call-patient')).toEqual({ state: exhausted, feedback: 'limit-reached' });
    const stamped = act(readyToStamp(), 'stamp-fit');
    const rich = { ...stamped, money: GAME_LIMITS.money - 5 };
    expect(applyAction(rich, 'return-document')).toEqual({ state: rich, feedback: 'limit-reached' });
    const finalDay = { ...cabinet(), day: GAME_LIMITS.day, patientsProcessed: 3, shiftCompleted: SHIFT_LENGTH, clockMinutes: 840 };
    expect(applyAction(finalDay, 'next-day')).toEqual({ state: finalDay, feedback: 'limit-reached' });
  });
});

describe('paperwork and the new instruments', () => {
  it('requires measurements for a complete examination and returns reproducible weight and height', () => {
    const state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'run-vision', 'run-pressure', 'stamp-fit');
    expect(applyAction(state, 'return-document').feedback).toBe('patient-error');
    const measured = applyAction(state, 'run-measurements');
    expect(measured.feedback).toBe('measurements-taken');
    expect(measured.state.clockMinutes).toBe(state.clockMinutes + 2);
    expect(measured.state.visit?.measurementsTaken).toBe(true);
    expect(applyAction(measured.state, 'return-document').feedback).toBe('patient-cleared');
    expect(applyAction(measured.state, 'run-measurements').state.clockMinutes).toBe(state.clockMinutes + 4);
  });

  it('gives each referral its own paper and lets the doctor write, clip, store and retrieve a separate note', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'take-paper', 'run-vision', 'run-measurements');
    expect(state.papers).toHaveLength(2);
    expect(state.papers[0]).toMatchObject({ id: 1, kind: 'referral', patientId: 0 });
    const blank = state.papers[1]!;
    expect(blank).toMatchObject({ id: 2, kind: 'note', patientId: null, results: { vision: null, pressure: null, weight: null, height: null } });
    state = act(state, { type: 'write-note', paperId: 2 });
    expect(state.papers[1]).toMatchObject({ patientId: 0, results: { vision: 'pass', pressure: null, weight: 62, height: 164 } });
    expect(blank).toMatchObject({ patientId: null, results: { vision: null } });
    state = act(state, 'run-pressure', { type: 'write-note', paperId: 2 }, { type: 'clip-paper', paperId: 2 }, { type: 'store-paper', paperId: 2 });
    expect(state.papers[1]).toMatchObject({ clipped: true, location: 'drawer', results: { pressure: 'pass' } });
    const stored = state;
    expect(applyAction(state, { type: 'write-note', paperId: 2 })).toEqual({ state, feedback: 'paper-missing' });
    state = act(state, { type: 'retrieve-paper', paperId: 2 });
    expect(state.papers[1]).toMatchObject({ clipped: true, location: 'desk' });
    expect(stored.papers[1]?.location).toBe('drawer');
    state = act(state, { type: 'trash-paper', paperId: 2 });
    expect(state.papers.map(paper => paper.kind)).toEqual(['referral']);
    expect(state.visit).toMatchObject({ visionTested: true, pressureTested: true, measurementsTaken: true, decision: null });
  });

  it('keeps blank supplies independent and prevents overwriting another patient’s notes', () => {
    let state = act(readyToStamp(), 'take-paper', 'take-paper', { type: 'write-note', paperId: 2 }, 'stamp-fit', 'return-document');
    expect(state.papers).toHaveLength(3);
    state = act(state, 'call-patient', 'take-document', 'take-certificate', 'run-vision');
    expect(applyAction(state, { type: 'write-note', paperId: 2 })).toEqual({ state, feedback: 'paper-wrong-patient' });
    state = act(state, { type: 'write-note', paperId: 3 });
    expect(state.papers.find(paper => paper.id === 3)).toMatchObject({ patientId: 1, results: { vision: 'refer' } });
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
    expect(applyAction(state, { type: 'write-note', paperId: 2 })).toEqual({ state, feedback: 'results-needed' });
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
    let state = act(cabinet(), 'call-patient', 'take-document', 'take-certificate', 'stamp-fit', 'return-document');
    expect(state.papers.some(paper => paper.kind === 'letter')).toBe(false);
    state = act(state, 'call-patient', 'take-document', 'take-certificate', 'stamp-fit', 'return-document');
    expect(state.papers.find(paper => paper.kind === 'letter')).toMatchObject({ sender: 'zus', patientId: 1, opened: false });
  });

  it('retains stored documentation across shifts and only records a telephone interaction', () => {
    let state = act(cabinet(), 'take-paper', { type: 'store-paper', paperId: 1 });
    for (const patient of PATIENTS) state = act(state, 'call-patient', 'take-document', 'take-certificate', patient.expectedDecision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
    const papers = state.papers;
    state = act(state, 'next-day');
    expect(state.papers).toBe(papers);
    const called = applyAction(state, 'use-phone');
    expect(called.feedback).toBe('phone-unavailable');
    expect(called.state).toEqual({ ...state, clockMinutes: 478 });
  });
});

describe('separate referral and certificate intake', () => {
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
    expect(state.papers[1]).toMatchObject({ kind: 'note', results: { vision: 'pass', pressure: 'pass', weight: 62, height: 164 } });
    const fetched = applyAction(state, 'take-certificate');
    expect(fetched.feedback).toBe('certificate-taken');
    expect(fetched.state.visit?.certificateTaken).toBe(true);
    expect(fetched.state.clockMinutes).toBe(state.clockMinutes + 1);
    expect(fetched.state.papers).toBe(state.papers);
    expect(fetched.state.nextPaperId).toBe(state.nextPaperId);
    expect(applyAction(fetched.state, 'take-certificate')).toEqual({ state: fetched.state, feedback: 'certificate-taken' });
    expect(applyAction(fetched.state, 'return-document').feedback).toBe('stamp-needed');
    state = act(fetched.state, 'stamp-fit', 'return-document', 'call-patient', 'take-document');
    expect(state.visit).toMatchObject({ patientId: 1, certificateTaken: false, decision: null });
  });
});
