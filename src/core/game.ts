export const INTRO_SLIDES = 4;
export const SHIFT_LENGTH = 3;
export const ARRIVAL_MINUTES = 477;
export const SHIFT_START_MINUTES = 480;
export const SHIFT_END_MINUTES = 840;
// Minutes of simulated work. Pointer movement and rendering never spend time.
export const ACTION_MINUTES = { handling: 1, reading: 1, vision: 3, pressure: 4 } as const;
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
  | 'return-document' | 'toggle-lamp' | 'change-decoration' | 'next-day'
  | 'handle-item' | 'read-manual';

export type GameFeedback =
  | 'none' | 'cabinet-ready' | 'patient-called' | 'patient-waiting' | 'shift-finished'
  | 'document-taken' | 'document-needed' | 'no-patient' | 'vision-pass' | 'vision-refer'
  | 'pressure-pass' | 'pressure-refer' | 'stamped-fit' | 'stamped-unfit'
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
  const spend = (minutes: number): number => Math.min(SHIFT_END_MINUTES, state.clockMinutes + minutes);
  if (action === 'handle-item' || action === 'read-manual') {
    return changed({ clockMinutes: spend(action === 'read-manual' ? ACTION_MINUTES.reading : ACTION_MINUTES.handling) }, 'none');
  }
  if (action === 'toggle-lamp') return changed({ clockMinutes: spend(ACTION_MINUTES.handling), lampOn: !state.lampOn }, state.lampOn ? 'lamp-off' : 'lamp-on');
  if (action === 'change-decoration') {
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), decoration: state.decoration === 'plant' ? 'certificate' : 'plant' }, 'decoration-changed');
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
    return changed({ clockMinutes: Math.max(SHIFT_START_MINUTES, spend(ACTION_MINUTES.handling)), visit: {
      patientId: state.shiftCompleted, document: 'tray', visionTested: false, pressureTested: false, decision: null,
    } }, 'patient-called');
  }

  const visit = state.visit;
  if (!visit) return unchanged('no-patient');
  if (action === 'take-document') {
    if (visit.document === 'desk') return unchanged('document-taken');
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, document: 'desk' } }, 'document-taken');
  }
  if (visit.document !== 'desk') return unchanged('document-needed');
  const patient = PATIENTS[visit.patientId]!;
  if (action === 'run-vision') {
    const feedback = patient.vision === 'pass' ? 'vision-pass' : 'vision-refer';
    return changed({ clockMinutes: spend(ACTION_MINUTES.vision), visit: { ...visit, visionTested: true } }, feedback);
  }
  if (action === 'run-pressure') {
    const feedback = patient.pressure === 'pass' ? 'pressure-pass' : 'pressure-refer';
    return changed({ clockMinutes: spend(ACTION_MINUTES.pressure), visit: { ...visit, pressureTested: true } }, feedback);
  }
  if (action === 'stamp-fit' || action === 'stamp-unfit') {
    const decision = action === 'stamp-fit' ? 'fit' : 'unfit';
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, decision } }, decision === 'fit' ? 'stamped-fit' : 'stamped-unfit');
  }
  if (!visit.decision) return unchanged('stamp-needed');
  const correct = visit.visionTested && visit.pressureTested && visit.decision === patient.expectedDecision;
  if (state.patientsProcessed === GAME_LIMITS.patients || (correct && state.money > GAME_LIMITS.money - 10)) {
    return unchanged('limit-reached');
  }
  return changed({
    visit: null,
    shiftCompleted: state.shiftCompleted + 1,
    clockMinutes: spend(ACTION_MINUTES.handling),
    patientsProcessed: state.patientsProcessed + 1,
    money: state.money + (correct ? 10 : 0),
  }, correct ? 'patient-cleared' : 'patient-error');
}
