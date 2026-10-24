import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, GAME_LIMITS, INTRO_SLIDES, PATIENTS, SHIFT_LENGTH, type GameAction, type GameState } from '../src/core/game';

function act(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((current, action) => applyAction(current, action).state, state);
}

function cabinet(): GameState {
  return act(createInitialState(), 'skip-intro');
}

function readyToStamp(state = cabinet()): GameState {
  return act(state, 'call-patient', 'take-document', 'run-vision', 'run-pressure');
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
    for (const action of ['run-vision', 'run-pressure', 'stamp-fit', 'stamp-unfit', 'return-document'] as const) {
      expect(applyAction(state, action)).toEqual({ state, feedback: 'document-needed' });
    }
    state = act(state, 'take-document');
    expect(applyAction(state, 'return-document')).toEqual({ state, feedback: 'stamp-needed' });
    state = act(state, 'run-vision');
    state = act(state, 'run-pressure');
    expect(applyAction(state, 'return-document')).toEqual({ state, feedback: 'stamp-needed' });
    expect(state.patientsProcessed).toBe(0);
  });

  it.each([
    [], ['run-vision'], ['run-pressure'],
  ] as const)('allows a stamped document with incomplete examinations %j to be returned as a mistake', (...tests) => {
    const state = act(cabinet(), 'call-patient', 'take-document', ...tests, 'stamp-fit');
    expect(state.visit?.decision).toBe('fit');
    const returned = applyAction(state, 'return-document');
    expect(returned.feedback).toBe('patient-error');
    expect(returned.state).toMatchObject({ visit: null, money: 0, patientsProcessed: 1, shiftCompleted: 1, clockMinutes: state.clockMinutes + 1 });
  });

  it('allows examinations and stamp corrections after an early decision before returning it', () => {
    let state = act(cabinet(), 'call-patient', 'take-document', 'stamp-unfit');
    expect(state.clockMinutes).toBe(482);
    state = act(state, 'stamp-fit', 'stamp-fit');
    expect(state.clockMinutes).toBe(484);
    state = act(state, 'run-pressure');
    expect(state.clockMinutes).toBe(488);
    expect(state.visit?.decision).toBe('fit');
    state = act(state, 'run-vision', 'run-vision');
    expect(state.clockMinutes).toBe(494);
    expect(applyAction(state, 'return-document')).toMatchObject({
      feedback: 'patient-cleared', state: { money: 10, patientsProcessed: 1, clockMinutes: 495 },
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
      state = act(state, 'call-patient', 'take-document');
      expect(state.visit?.patientId).toBe(patient.id);
      const vision = applyAction(state, 'run-vision');
      expect(vision.feedback).toBe(`vision-${patient.vision}`);
      const pressure = applyAction(vision.state, 'run-pressure');
      expect(pressure.feedback).toBe(`pressure-${patient.pressure}`);
      state = act(pressure.state, patient.expectedDecision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
    }
    expect(state).toMatchObject({ day: 1, shiftCompleted: SHIFT_LENGTH, money: 30, patientsProcessed: 3, clockMinutes: 512, visit: null });
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
      ['call-patient', 480], ['take-document', 481], ['run-pressure', 485],
      ['run-vision', 488], ['stamp-fit', 489], ['stamp-unfit', 490],
      ['stamp-fit', 491], ['run-vision', 494], ['run-pressure', 498],
      ['handle-item', 499], ['read-manual', 500], ['return-document', 501],
      ['call-patient', 502],
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
