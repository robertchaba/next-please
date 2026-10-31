import { applyAction, advanceClinicTime, createInitialState, type GameAction, type GameState, type Decision } from '../../src/core/game';
import { storyPatientForId } from '../../src/core/story-patients';
import { expectedVisitDecision } from '../../src/core/progression';
import type { StoryEncounterId } from '../../src/core/story';

export const STORY_ROUTES: Record<string, Partial<Record<StoryEncounterId, Decision>>> = {
  party: { A1:'fit', A2:'fit', B1:'unfit', A3:'fit', C1:'unfit', J1:'fit', A4:'unfit', 'E1-VISIT':'fit', D1:'fit', G1:'fit', H1:'unfit', J2:'fit', F1:'unfit', I1:'unfit' },
  union: { A1:'fit', A2:'fit', B1:'fit', A3:'fit', C1:'fit', J1:'fit', A4:'unfit', 'E1-VISIT':'unfit', D1:'unfit', G1:'fit', C2:'fit', H1:'unfit', J2:'fit', F1:'fit', I1:'unfit' },
  independent: { A1:'fit', A2:'fit', B1:'fit', A3:'fit', C1:'unfit', J1:'fit', A4:'unfit', 'E1-VISIT':'fit', D1:'fit', G1:'fit', H1:'unfit', J2:'fit', F1:'fit', I1:'unfit' },
  detained: { A1:'fit', A2:'fit', B1:'fit', A3:'fit', C1:'fit', J1:'fit', A4:'unfit', 'E1-VISIT':'unfit', D1:'unfit', G1:'unfit', C2:'fit', H1:'fit', J2:'fit', F1:'fit', I1:'fit' },
  audit: { A1:'fit', A2:'fit', B1:'unfit', A3:'fit', C1:'unfit', J1:'fit', A4:'fit', 'E1-VISIT':'fit', A5:'fit', D1:'fit', G1:'fit', H1:'fit', J2:'fit', A6:'fit', F1:'unfit', I1:'fit', A7:'unfit' },
  exposed: { A1:'fit', A2:'fit', B1:'unfit', A3:'fit', C1:'unfit', J1:'fit', A4:'fit', 'E1-VISIT':'fit', A5:'fit', D1:'fit', G1:'fit', H1:'unfit', J2:'fit', A6:'fit', F1:'unfit', I1:'unfit', A7:'fit' },
  chaos: { A1:'fit', A2:'fit', B1:'unfit', A3:'fit', C1:'fit', J1:'fit', A4:'unfit', 'E1-VISIT':'fit', D1:'fit', G1:'fit', C2:'unfit', H1:'unfit', J2:'unfit', F1:'unfit', I1:'unfit' },
};
export const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((next, action) => applyAction(next, action).state, state);
export function completeAppointment(state: GameState, decision: Decision): GameState {
  state = act(state, 'take-document', 'take-paper', 'run-general', 'run-vision', 'run-pressure', 'run-measurements', 'take-certificate', 'write-certificate');
  const id = state.visit!.patientId, startedDay = state.visit!.startedDay;
  if (state.visit!.additionalResult) {
    const result = state.papers.find(paper => paper.kind === 'additional-result' && paper.patientId === id && paper.day >= startedDay)!;
    state = act(state, { type:'clip-document', documentId:result.id }, { type:'join-documents', documentId:'certificate', targetId:result.id });
  }
  state = act(state, decision === 'fit' ? 'stamp-fit' : 'stamp-unfit', 'return-document');
  for (const paper of state.papers.filter(paper => (paper.kind === 'note' || paper.kind === 'referral') && paper.patientId === id && paper.day === startedDay)) state = act(state, { type:'store-paper', paperId:paper.id });
  return state;
}
export function admitPatient(state: GameState): GameState {
  state = act(state, 'call-patient');
  if (state.inspection) {
    state = act(state, 'take-inspection-id', 'return-inspection-id');
    const target = state.inspection!.target;
    const files = state.papers.filter(paper => (paper.kind === 'note' || paper.kind === 'referral') && paper.patientId === target.patientId && paper.day === target.day);
    for (const paper of files) state = act(state, { type:'retrieve-paper',paperId:paper.id }, { type:'hand-inspection-paper',paperId:paper.id });
    if (state.inspection) throw new Error('Fixture lost clinical records');
    for (const paper of files) state = act(state, { type:'store-paper',paperId:paper.id });
    state = act(state, 'call-patient');
  }
  if (!state.visit) throw new Error(`No admission on day ${state.day}: ${state.clockMinutes}`);
  return state;
}
export function playStoryRoute(route: keyof typeof STORY_ROUTES, checkpoint: (state: GameState) => GameState = state => state, stopDay = 36): GameState {
  let state = act({ ...createInitialState(2046), money:100000 }, 'skip-intro');
  const choices = STORY_ROUTES[route]!;
  for (;;) {
    state = checkpoint(state);
    if (state.phase === 'epilogue' || state.ending) return state;
    if (state.phase === 'home') { state = act(state, 'next-day'); continue; }
    if (state.day > stopDay) return state;
    state = advanceClinicTime(state, Math.max(1, 480 - state.clockMinutes)).state;
    for (let index = 0; index < 3; index++) {
      state = admitPatient(state);
      const scripted = storyPatientForId(state.visit!.patientId);
      state = checkpoint(state);
      state = completeAppointment(state, scripted ? choices[scripted.encounterId] ?? 'unfit' : expectedVisitDecision(state) === 'unfit' ? 'unfit' : 'fit');
      state = checkpoint(state);
    }
    state = advanceClinicTime(state, 840 - state.clockMinutes).state;
    state = act(state, 'end-day');
  }
}

/** Capture a real, valid checkpoint without inventing past narrative events. */
export function storyMoment(matches: (state: GameState) => boolean, route: keyof typeof STORY_ROUTES = 'union'): GameState {
  const stop = Symbol('checkpoint'); let captured: GameState | undefined;
  try { playStoryRoute(route, state => { if (matches(state)) { captured = state; throw stop; } return state; }); }
  catch (error) { if (error !== stop) throw error; }
  if (!captured) throw new Error('Story checkpoint not reached');
  return captured;
}
