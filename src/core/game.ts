export const INTRO_SLIDES = 4;
export const SHIFT_LENGTH = 3;
export const ARRIVAL_MINUTES = 477;
export const SHIFT_START_MINUTES = 480;
export const SHIFT_END_MINUTES = 840;
// Minutes of simulated work. Pointer movement and rendering never spend time.
export const ACTION_MINUTES = { handling: 1, reading: 1, vision: 3, pressure: 4, measurements: 2 } as const;
export const GAME_LIMITS = { day: 1_000_000, money: 1_000_000_000, patients: 1_000_000_000, papers: 4096, paperId: 1_000_000_000 } as const;

export type Decision = 'fit' | 'unfit';
export type TestResult = 'pass' | 'refer';

/** Fictional training cases. Results are game rules, not clinical thresholds. */
export const PATIENTS = [
  { id: 0, vision: 'pass', pressure: 'pass', expectedDecision: 'fit', birthDate: '1952-04-18', sex: 'female', examination: 'periodic', managerial: false, weight: 62, height: 164 },
  { id: 1, vision: 'refer', pressure: 'pass', expectedDecision: 'unfit', birthDate: '1947-11-06', sex: 'male', examination: 'initial', managerial: true, weight: 86, height: 178 },
  { id: 2, vision: 'pass', pressure: 'refer', expectedDecision: 'unfit', birthDate: '1958-08-23', sex: 'female', examination: 'periodic', managerial: false, weight: 71, height: 169 },
] as const satisfies readonly {
  id: number; vision: TestResult; pressure: TestResult; expectedDecision: Decision;
  birthDate: string; sex: 'female' | 'male'; examination: 'initial' | 'periodic';
  managerial: boolean; weight: number; height: number;
}[];

export interface NoteResults {
  vision: TestResult | null;
  pressure: TestResult | null;
  weight: number | null;
  height: number | null;
}

interface PaperBase {
  id: number;
  day: number;
  location: 'desk' | 'drawer';
  clipped: boolean;
}
export type Paper =
  | (PaperBase & { kind: 'note'; patientId: number | null; results: NoteResults })
  | (PaperBase & { kind: 'referral'; patientId: number })
  | (PaperBase & { kind: 'letter'; patientId: number; sender: 'zus' | 'employer'; opened: boolean });

export interface Visit {
  patientId: number;
  document: 'tray' | 'desk';
  certificateTaken: boolean;
  visionTested: boolean;
  pressureTested: boolean;
  measurementsTaken: boolean;
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
  papers: Paper[];
  nextPaperId: number;
}

export type GameAction =
  | 'advance-intro' | 'skip-intro' | 'call-patient' | 'take-document' | 'take-certificate'
  | 'run-vision' | 'run-pressure' | 'run-measurements' | 'stamp-fit' | 'stamp-unfit'
  | 'return-document' | 'toggle-lamp' | 'change-decoration' | 'next-day'
  | 'handle-item' | 'read-manual' | 'take-paper' | 'use-phone'
  | { type: 'write-note' | 'store-paper' | 'retrieve-paper' | 'trash-paper' | 'open-letter' | 'clip-paper'; paperId: number };

export type GameFeedback =
  | 'none' | 'cabinet-ready' | 'patient-called' | 'patient-waiting' | 'shift-finished'
  | 'document-taken' | 'document-needed' | 'certificate-taken' | 'certificate-needed' | 'no-patient' | 'vision-pass' | 'vision-refer'
  | 'pressure-pass' | 'pressure-refer' | 'stamped-fit' | 'stamped-unfit'
  | 'stamp-needed' | 'patient-cleared' | 'patient-error' | 'lamp-on' | 'lamp-off'
  | 'decoration-changed' | 'next-day' | 'shift-unfinished' | 'limit-reached'
  | 'measurements-taken' | 'phone-unavailable' | 'paper-taken' | 'paper-written'
  | 'paper-stored' | 'paper-retrieved' | 'paper-trashed' | 'paper-missing'
  | 'paper-wrong-patient' | 'results-needed' | 'letter-opened' | 'paper-clipped';

export function createInitialState(): GameState {
  return {
    day: 1, money: 0, patientsProcessed: 0,
    phase: 'intro', introStep: 0, shiftCompleted: 0, clockMinutes: ARRIVAL_MINUTES, visit: null,
    lampOn: true, decoration: 'plant', papers: [], nextPaperId: 1,
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
  const canAddPaper = (): boolean => state.papers.length < GAME_LIMITS.papers && state.nextPaperId <= GAME_LIMITS.paperId;
  const addPaper = (paper: Paper, changes: Partial<GameState>, feedback: GameFeedback): ActionResult => changed({
    ...changes, papers: [...state.papers, paper], nextPaperId: state.nextPaperId + 1,
  }, feedback);
  if (action === 'use-phone') return changed({ clockMinutes: spend(ACTION_MINUTES.handling) }, 'phone-unavailable');
  if (action === 'take-paper') {
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'note', day: state.day, patientId: null, location: 'desk', clipped: false,
      results: { vision: null, pressure: null, weight: null, height: null } },
    { clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-taken');
  }
  if (typeof action === 'object') {
    const paper = state.papers.find(entry => entry.id === action.paperId);
    if (!paper) return unchanged('paper-missing');
    const updatePaper = (updated: Paper, feedback: GameFeedback): ActionResult => changed({
      papers: state.papers.map(entry => entry.id === paper.id ? updated : entry),
      clockMinutes: spend(ACTION_MINUTES.handling),
    }, feedback);
    if (action.type === 'store-paper') {
      if (paper.location === 'drawer') return unchanged('paper-stored');
      // Array order records filing order, so the drawer returns the last paper
      // actually stored, including an older sheet filed again after retrieval.
      return changed({
        papers: [...state.papers.filter(entry => entry.id !== paper.id), { ...paper, location: 'drawer' }],
        clockMinutes: spend(ACTION_MINUTES.handling),
      }, 'paper-stored');
    }
    if (action.type === 'retrieve-paper') {
      return paper.location === 'desk' ? unchanged('paper-retrieved') : updatePaper({ ...paper, location: 'desk' }, 'paper-retrieved');
    }
    if (paper.location !== 'desk') return unchanged('paper-missing');
    if (action.type === 'trash-paper') return changed({ papers: state.papers.filter(entry => entry.id !== paper.id), clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-trashed');
    if (action.type === 'clip-paper') return paper.clipped ? unchanged('paper-clipped') : updatePaper({ ...paper, clipped: true }, 'paper-clipped');
    if (action.type === 'open-letter') {
      if (paper.kind !== 'letter') return unchanged('paper-missing');
      return paper.opened ? unchanged('letter-opened') : updatePaper({ ...paper, opened: true }, 'letter-opened');
    }
    if (paper.kind !== 'note') return unchanged('paper-missing');
    const visit = state.visit;
    if (!visit) return unchanged('no-patient');
    if (visit.document !== 'desk') return unchanged('document-needed');
    if (paper.patientId !== null && (paper.patientId !== visit.patientId || paper.day !== state.day)) return unchanged('paper-wrong-patient');
    if (!visit.visionTested && !visit.pressureTested && !visit.measurementsTaken) return unchanged('results-needed');
    const patient = PATIENTS[visit.patientId]!;
    return updatePaper({ ...paper, patientId: visit.patientId, day: state.day, results: {
      vision: visit.visionTested ? patient.vision : null,
      pressure: visit.pressureTested ? patient.pressure : null,
      weight: visit.measurementsTaken ? patient.weight : null,
      height: visit.measurementsTaken ? patient.height : null,
    } }, 'paper-written');
  }
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
      patientId: state.shiftCompleted, document: 'tray', certificateTaken: false, visionTested: false, pressureTested: false, measurementsTaken: false, decision: null,
    } }, 'patient-called');
  }

  const visit = state.visit;
  if (!visit) return unchanged('no-patient');
  if (action === 'take-document') {
    if (visit.document === 'desk') return unchanged('document-taken');
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'referral', patientId: visit.patientId, day: state.day, location: 'desk', clipped: false },
      { clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, document: 'desk' } }, 'document-taken');
  }
  if (visit.document !== 'desk') return unchanged('document-needed');
  if (action === 'take-certificate') {
    if (visit.certificateTaken) return unchanged('certificate-taken');
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, certificateTaken: true } }, 'certificate-taken');
  }
  const patient = PATIENTS[visit.patientId]!;
  if (action === 'run-vision') {
    const feedback = patient.vision === 'pass' ? 'vision-pass' : 'vision-refer';
    return changed({ clockMinutes: spend(ACTION_MINUTES.vision), visit: { ...visit, visionTested: true } }, feedback);
  }
  if (action === 'run-pressure') {
    const feedback = patient.pressure === 'pass' ? 'pressure-pass' : 'pressure-refer';
    return changed({ clockMinutes: spend(ACTION_MINUTES.pressure), visit: { ...visit, pressureTested: true } }, feedback);
  }
  if (action === 'run-measurements') {
    return changed({ clockMinutes: spend(ACTION_MINUTES.measurements), visit: { ...visit, measurementsTaken: true } }, 'measurements-taken');
  }
  if (!visit.certificateTaken) return unchanged('certificate-needed');
  if (action === 'stamp-fit' || action === 'stamp-unfit') {
    const decision = action === 'stamp-fit' ? 'fit' : 'unfit';
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, decision } }, decision === 'fit' ? 'stamped-fit' : 'stamped-unfit');
  }
  if (!visit.decision) return unchanged('stamp-needed');
  const wrongDecision = visit.decision !== patient.expectedDecision;
  const correct = visit.visionTested && visit.pressureTested && visit.measurementsTaken && !wrongDecision;
  if (state.patientsProcessed === GAME_LIMITS.patients || (correct && state.money > GAME_LIMITS.money - 10)) {
    return unchanged('limit-reached');
  }
  if (wrongDecision && !canAddPaper()) return unchanged('limit-reached');
  const completion: Partial<GameState> = {
    visit: null,
    shiftCompleted: state.shiftCompleted + 1,
    clockMinutes: spend(ACTION_MINUTES.handling),
    patientsProcessed: state.patientsProcessed + 1,
    money: state.money + (correct ? 10 : 0),
  };
  if (wrongDecision) return addPaper({ id: state.nextPaperId, kind: 'letter', patientId: visit.patientId, day: state.day,
    location: 'desk', clipped: false, sender: visit.decision === 'fit' ? 'zus' : 'employer', opened: false }, completion, 'patient-error');
  return changed(completion, correct ? 'patient-cleared' : 'patient-error');
}
