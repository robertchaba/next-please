import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { ClinicClock } from '../src/core/clock';
import { advanceClinicTime, applyAction, type GameAction } from '../src/core/game';
import { decodeSave, encodeSave } from '../src/core/save';

const cabinet = () => applyAction(createInitialState(1234), 'skip-intro').state;
const visit = () => applyAction(cabinet(), 'call-patient').state;

describe('elapsed clinic clock', () => {
  it.each([[false, 5], [true, 30]] as const)('advances 30 seconds with patient=%s by %i minutes', (patient, minutes) => {
    const clock = new ClinicClock(200);
    clock.sample(200, true, patient);
    expect(clock.sample(30_200, true, patient)).toBe(minutes);
  });

  it('retains partial minutes across rate changes and long pauses without catch-up', () => {
    const clock = new ClinicClock(0);
    clock.sample(0, true, false);
    expect(clock.sample(3000, true, true)).toBe(0); // half a game minute
    expect(clock.sample(3250, false, true)).toBe(0); // another quarter
    expect(clock.sample(1_000_000, true, true)).toBe(0); // paused
    expect(clock.sample(1_000_250, true, true)).toBe(1);
    expect(clock.sample(1_002_750, true, false)).toBe(2);
    expect(clock.sample(1_005_750, true, false)).toBe(1);
  });

  it('uses elapsed duration even when callbacks are delayed and resets between sessions', () => {
    const clock = new ClinicClock(0);
    clock.sample(0, true, true);
    expect(clock.sample(30_750, true, true)).toBe(30);
    clock.reset(40_000);
    expect(clock.sample(80_000, true, true)).toBe(0);
    expect(clock.sample(80_250, true, true)).toBe(0);
    expect(clock.sample(81_000, true, true)).toBe(1);
  });

  it('adds elapsed minutes independently of action costs and keeps saves valid', () => {
    let state = advanceClinicTime(visit(), 30).state;
    expect(state.clockMinutes).toBe(510);
    state = applyAction(state, 'run-pressure').state;
    state = advanceClinicTime(state, 5).state;
    expect(state.clockMinutes).toBe(519);
    expect(state.visit?.pressureReadings).toHaveLength(1);
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it('stops new admissions at 14:00 while allowing an admitted visit to continue', () => {
    const empty = advanceClinicTime(cabinet(), 363).state;
    expect(empty.clockMinutes).toBe(840);
    expect(applyAction(empty, 'call-patient').state).toBe(empty);
    const active = advanceClinicTime(visit(), 360).state;
    expect(active.phase).toBe('cabinet');
    expect(applyAction(active, 'run-general').state.visit?.generalTested).toBe(true);
  });

  it('interrupts at 17:15, preserves notes, removes certificate clips and settles only once', () => {
    const actions: GameAction[] = ['take-document', 'take-paper', 'run-general', 'take-certificate', 'write-certificate', 'stamp-fit', { type: 'clip-document', documentId: 'certificate' }];
    const state = actions.reduce((state, action) => applyAction(state, action).state, visit());
    const result = advanceClinicTime(state, 10_000);
    expect(result.feedback).toBe('visit-interrupted');
    expect(result.state).toMatchObject({ phase: 'home', clockMinutes: 1035, visit: null, shiftCompleted: 0,
      patientsProcessed: 0, paperClips: [], papers: state.papers, daily: state.daily,
      settlement: { patientBonus: 0, fines: 0 } });
    expect(decodeSave(encodeSave(result.state))).toEqual(result.state);
    expect(advanceClinicTime(result.state, 60).state).toBe(result.state);
  });

  it('also closes an empty cabinet and ignores elapsed time outside work or invalid durations', () => {
    const state = cabinet();
    expect(advanceClinicTime(state, 558)).toMatchObject({ feedback: 'shift-finished', state: { phase: 'home', clockMinutes: 1035 } });
    const intro = createInitialState(1);
    expect(advanceClinicTime(intro, 30).state).toBe(intro);
    for (const minutes of [0, -1, 0.5, NaN, Infinity]) expect(advanceClinicTime(state, minutes).state).toBe(state);
  });
});
