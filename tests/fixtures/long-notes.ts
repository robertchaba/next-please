import { ADDITIONAL_TESTS } from '../../src/core/additional-tests';
import { applyAction, createInitialState, type GameAction, type GameState } from '../../src/core/game';
import { PATIENTS } from '../../src/core/patients';

const act = (state: GameState, ...actions: GameAction[]) => actions.reduce((value, action) => applyAction(value, action).state, state);

/** A real sequence of four referrals and returns, retaining one medical note. */
export function longNoteState(): GameState {
  const patient = PATIENTS.find(patient => patient.jobId === 45 && patient.caseVariant === 4 && patient.id % 2 !== 0)!;
  const initial = createInitialState(3456);
  let state = act({ ...initial, day: 9, money: 100000,
    roster: [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)] },
  'skip-intro', 'call-patient', 'take-document', 'run-general', 'run-pressure', 'run-pressure', 'run-vision', 'run-measurements', 'call-employer', 'take-paper');
  for (const test of ADDITIONAL_TESTS) {
    state = act(state, 'take-additional-referral');
    const paperId = state.papers.at(-1)!.id;
    state = act({ ...state, rngState: 1 }, { type: 'select-additional-test', paperId, test }, { type: 'hand-additional-referral', paperId });
    const returnDay = state.pendingReferrals[0]!.returnDay;
    state = act({ ...state, clockMinutes: 840 }, 'end-day');
    while (state.day < returnDay) state = act(state, 'next-day');
    state = act({ ...state, clockMinutes: 480 }, 'call-patient');
  }
  return state;
}
