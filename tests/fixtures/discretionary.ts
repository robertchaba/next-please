import { applyAction, createInitialState, type GameAction, type GameState } from '../../src/core/game';
import { additionalTestForJob } from '../../src/core/additional-tests';
import { PATIENTS } from '../../src/core/patients';

export const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((s, action) => applyAction(s, action).state, state);

export function discretionaryAppointment(patientId: number, day = 1): GameState {
  const initial = createInitialState(123);
  const patient = PATIENTS[patientId]!;
  const roster = [patientId, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
  const state = act({ ...initial, day, money: 10000, roster }, 'skip-intro', 'call-patient');
  return { ...state, visit: { ...state.visit!, bribe: 'none', specialist: null,
    referral: { ...state.visit!.referral, ageDays: 0, authentic: true, seal: 'clear' } } };
}

export function sendDiscretionary(state: GameState): GameState {
  const test = additionalTestForJob(PATIENTS[state.visit!.patientId]!)!;
  state = act(state, 'take-document', 'take-paper', 'run-general', 'take-additional-referral');
  const paperId = state.papers.at(-1)!.id;
  return act({ ...state, rngState: 1 }, { type: 'select-additional-test', paperId, test }, { type: 'hand-additional-referral', paperId });
}

export function receiveDiscretionary(state: GameState): GameState {
  const day = state.pendingReferrals[0]!.returnDay;
  state = act({ ...state, clockMinutes: 840 }, 'end-day');
  while (state.day < day) state = act(state, 'next-day');
  return act(state, 'call-patient');
}

export function attachReport(state: GameState): GameState {
  const report = state.papers.find(paper => paper.kind === 'additional-result' && paper.patientId === state.visit!.patientId)!;
  return act(state, { type: 'clip-document', documentId: report.id }, { type: 'join-documents', documentId: 'certificate', targetId: report.id });
}
