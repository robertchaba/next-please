export const INTRO_SLIDES = 4;
export const SHIFT_LENGTH = 3;
export const ARRIVAL_MINUTES = 477;
export const SHIFT_START_MINUTES = 480;
export const SHIFT_END_MINUTES = 840;
export const APPOINTMENT_MINUTES = (SHIFT_END_MINUTES - SHIFT_START_MINUTES) / SHIFT_LENGTH;
export const GAME_LIMITS = { day: 1_000_000, money: 1_000_000_000, patients: 1_000_000_000 } as const;

export type Decision = 'fit' | 'unfit';
export type TestResult = 'pass' | 'refer';

/** Fictional training cases. Results are game rules, not clinical thresholds. */
export const PATIENTS = [
  { id: 0, vision: 'pass', pressure: 'pass', expectedDecision: 'fit' },
  { id: 1, vision: 'refer', pressure: 'pass', expectedDecision: 'unfit' },
  { id: 2, vision: 'pass', pressure: 'refer', expectedDecision: 'unfit' },
] as const satisfies readonly { id: number; vision: TestResult; pressure: TestResult; expectedDecision: Decision }[];

export interface Visit {
  patientId: number;
  document: 'tray' | 'desk';
  visionTested: boolean;
  pressureTested: boolean;
  decision: Decision | null;
}

export interface GameState {
  day: number;
  money: number;
  patientsProcessed: number;
  phase: 'intro' | 'cabinet';
  introStep: number;
  shiftCompleted: number;
  clockMinutes: number;
  visit: Visit | null;
  lampOn: boolean;
  decoration: 'plant' | 'certificate';
}

export type GameAction =
  | 'advance-intro' | 'skip-intro' | 'call-patient' | 'take-document'
  | 'run-vision' | 'run-pressure' | 'stamp-fit' | 'stamp-unfit'
  | 'return-document' | 'toggle-lamp' | 'change-decoration' | 'next-day';

export type GameFeedback =
  | 'none' | 'cabinet-ready' | 'patient-called' | 'patient-waiting' | 'shift-finished'
  | 'document-taken' | 'document-needed' | 'no-patient' | 'vision-pass' | 'vision-refer'
  | 'pressure-pass' | 'pressure-refer' | 'tests-needed' | 'stamped-fit' | 'stamped-unfit'
  | 'stamp-needed' | 'patient-cleared' | 'patient-error' | 'lamp-on' | 'lamp-off'
  | 'decoration-changed' | 'next-day' | 'shift-unfinished' | 'limit-reached';

export function createInitialState(): GameState {
  return {
    day: 1, money: 0, patientsProcessed: 0,
    phase: 'intro', introStep: 0, shiftCompleted: 0, clockMinutes: ARRIVAL_MINUTES, visit: null,
    lampOn: true, decoration: 'plant',
  };
}

export interface ActionResult {
  state: GameState;
  feedback: GameFeedback;
}

/** Pure transitions: all results and rewards are reproducible from saved state. */
export function applyAction(state: GameState, action: GameAction): ActionResult {
  const unchanged = (feedback: GameFeedback): ActionResult => ({ state, feedback });
  const changed = (changes: Partial<GameState>, feedback: GameFeedback): ActionResult => ({ state: { ...state, ...changes }, feedback });

  if (state.phase === 'intro') {
    if (action === 'skip-intro' || (action === 'advance-intro' && state.introStep === INTRO_SLIDES - 1)) {
      return changed({ phase: 'cabinet', introStep: INTRO_SLIDES - 1 }, 'cabinet-ready');
    }
    if (action === 'advance-intro') return changed({ introStep: state.introStep + 1 }, 'none');
    return unchanged('none');
  }

  if (action === 'advance-intro' || action === 'skip-intro') return unchanged('none');
  if (action === 'toggle-lamp') return changed({ lampOn: !state.lampOn }, state.lampOn ? 'lamp-off' : 'lamp-on');
  if (action === 'change-decoration') {
    return changed({ decoration: state.decoration === 'plant' ? 'certificate' : 'plant' }, 'decoration-changed');
  }
  if (action === 'next-day') {
    if (state.visit || state.shiftCompleted < SHIFT_LENGTH) return unchanged('shift-unfinished');
    if (state.day === GAME_LIMITS.day) return unchanged('limit-reached');
    return changed({ day: state.day + 1, shiftCompleted: 0, clockMinutes: ARRIVAL_MINUTES }, 'next-day');
  }
  if (action === 'call-patient') {
    if (state.visit) return unchanged('patient-waiting');
    if (state.shiftCompleted === SHIFT_LENGTH) return unchanged('shift-finished');
    if (state.patientsProcessed === GAME_LIMITS.patients || state.money > GAME_LIMITS.money - 10) return unchanged('limit-reached');
    return changed({ clockMinutes: Math.max(SHIFT_START_MINUTES, state.clockMinutes), visit: {
      patientId: state.shiftCompleted, document: 'tray', visionTested: false, pressureTested: false, decision: null,
    } }, 'patient-called');
  }

  const visit = state.visit;
  if (!visit) return unchanged('no-patient');
  if (action === 'take-document') {
    if (visit.document === 'desk') return unchanged('document-taken');
    return changed({ clockMinutes: state.clockMinutes + 10, visit: { ...visit, document: 'desk' } }, 'document-taken');
  }
  if (visit.document !== 'desk') return unchanged('document-needed');
  const patient = PATIENTS[visit.patientId]!;
  if (action === 'run-vision') {
    const feedback = patient.vision === 'pass' ? 'vision-pass' : 'vision-refer';
    return visit.visionTested ? unchanged(feedback) : changed({ clockMinutes: state.clockMinutes + 35, visit: { ...visit, visionTested: true } }, feedback);
  }
  if (action === 'run-pressure') {
    const feedback = patient.pressure === 'pass' ? 'pressure-pass' : 'pressure-refer';
    return visit.pressureTested ? unchanged(feedback) : changed({ clockMinutes: state.clockMinutes + 35, visit: { ...visit, pressureTested: true } }, feedback);
  }
  if (action === 'stamp-fit' || action === 'stamp-unfit') {
    if (!visit.visionTested || !visit.pressureTested) return unchanged('tests-needed');
    const decision = action === 'stamp-fit' ? 'fit' : 'unfit';
    return changed({ clockMinutes: state.clockMinutes + (visit.decision === null ? 10 : 0), visit: { ...visit, decision } }, decision === 'fit' ? 'stamped-fit' : 'stamped-unfit');
  }
  if (!visit.decision) return unchanged('stamp-needed');
  const correct = visit.decision === patient.expectedDecision;
  if (state.patientsProcessed === GAME_LIMITS.patients || (correct && state.money > GAME_LIMITS.money - 10)) {
    return unchanged('limit-reached');
  }
  return changed({
    visit: null,
    shiftCompleted: state.shiftCompleted + 1,
    clockMinutes: SHIFT_START_MINUTES + APPOINTMENT_MINUTES * (state.shiftCompleted + 1),
    patientsProcessed: state.patientsProcessed + 1,
    money: state.money + (correct ? 10 : 0),
  }, correct ? 'patient-cleared' : 'patient-error');
}
