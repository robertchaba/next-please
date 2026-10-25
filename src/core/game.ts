import { gameDate, isWeekend } from './calendar';
import { PATIENTS, CHARACTER_COUNT, createRoster, randomStep, hasRequiredExaminations } from './patients';
import { BASE_INSURANCE, emptyConsequences, settleDay, type DailyConsequences, type DaySettlement } from './economy';
export type { DaySettlement, DailyConsequences } from './economy';

export const INTRO_SLIDES = 4;
export const SHIFT_LENGTH = CHARACTER_COUNT;
export const ARRIVAL_MINUTES = 477;
export const SHIFT_START_MINUTES = 480;
export const SHIFT_END_MINUTES = 840;
// Minutes of simulated work. Pointer movement and rendering never spend time.
export const ACTION_MINUTES = { handling: 1, reading: 1, vision: 3, pressure: 4, measurements: 2 } as const;
export const GAME_LIMITS = { day: 1_000_000, money: 1_000_000_000, patients: 1_000_000_000, papers: 4096, paperId: 1_000_000_000, drawerClips: 4096 } as const;

export type Decision = 'fit' | 'unfit';
export type TestResult = 'pass' | 'refer';
export type DocumentId = number | 'certificate';

export { PATIENTS } from './patients';

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
}
export type Paper =
  | (PaperBase & { kind: 'note'; patientId: number | null; results: NoteResults; additionalWritten: boolean })
  | (PaperBase & { kind: 'referral'; patientId: number })
  | (PaperBase & { kind: 'letter'; patientId: number; sender: 'zus' | 'employer'; opened: boolean });

export interface Visit {
  patientId: number;
  document: 'tray' | 'desk';
  certificateTaken: boolean;
  certificateNamed: boolean;
  visionTested: boolean;
  pressureTested: boolean;
  measurementsTaken: boolean;
  decision: Decision | null;
}

export interface GameState {
  day: number;
  money: number;
  previousMonthBalance: number;
  patientsProcessed: number;
  phase: 'intro' | 'cabinet' | 'home';
  rngState: number;
  roster: number[];
  insuranceRate: number;
  daily: DailyConsequences;
  settlement: DaySettlement | null;
  introStep: number;
  shiftCompleted: number;
  clockMinutes: number;
  visit: Visit | null;
  lampOn: boolean;
  decoration: 'plant' | 'certificate';
  papers: Paper[];
  nextPaperId: number;
  /** Each nonempty group shares one physical clip; singleton clips are valid. */
  paperClips: DocumentId[][];
  /** Stored objects are separate from papers and survive changing shifts. */
  drawerItems: { manual: boolean; clips: number };
}

export type GameAction =
  | 'advance-intro' | 'skip-intro' | 'call-patient' | 'take-document' | 'take-certificate' | 'write-certificate'
  | 'run-vision' | 'run-pressure' | 'run-measurements' | 'stamp-fit' | 'stamp-unfit'
  | 'end-day' | 'return-document' | 'toggle-lamp' | 'change-decoration' | 'next-day'
  | 'handle-item' | 'read-manual' | 'take-paper' | 'use-phone'
  | { type: 'store-drawer-item' | 'retrieve-drawer-item'; item: 'manual' | 'clip' }
  | { type: 'write-note' | 'store-paper' | 'retrieve-paper' | 'trash-paper' | 'open-letter' | 'clip-paper'; paperId: number }
  | { type: 'clip-document'; documentId: DocumentId }
  | { type: 'unclip-document'; documentId: DocumentId }
  | { type: 'join-documents'; documentId: DocumentId; targetId: DocumentId };

export type GameFeedback =
  | 'none' | 'cabinet-ready' | 'patient-called' | 'patient-waiting' | 'shift-finished'
  | 'document-taken' | 'document-needed' | 'certificate-taken' | 'certificate-needed' | 'no-patient' | 'vision-pass' | 'vision-refer'
  | 'pressure-pass' | 'pressure-refer' | 'stamped-fit' | 'stamped-unfit'
  | 'stamp-needed' | 'patient-cleared' | 'patient-completed' | 'patient-error' | 'lamp-on' | 'lamp-off'
  | 'decoration-changed' | 'next-day' | 'shift-unfinished' | 'limit-reached'
  | 'measurements-taken' | 'phone-unavailable' | 'paper-taken' | 'paper-written'
  | 'paper-stored' | 'paper-retrieved' | 'paper-trashed' | 'paper-missing'
  | 'paper-wrong-patient' | 'results-needed' | 'letter-opened' | 'paper-clipped'
  | 'paper-unclipped' | 'papers-joined' | 'clip-needed' | 'certificate-in-bundle'
  | 'certificate-written' | 'certificate-name-needed'
  | 'item-stored' | 'item-retrieved' | 'item-missing';

export function createInitialState(seed = globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!): GameState {
  const generated = createRoster(seed >>> 0);
  return {
    rngState: generated.seed, roster: generated.roster, insuranceRate: BASE_INSURANCE, daily: emptyConsequences(), settlement: null,
    day: 1, money: 0, previousMonthBalance: 0, patientsProcessed: 0,
    phase: 'intro', introStep: 0, shiftCompleted: 0, clockMinutes: ARRIVAL_MINUTES, visit: null,
    lampOn: true, decoration: 'plant', papers: [], nextPaperId: 1, paperClips: [], drawerItems: { manual: false, clips: 0 },
  };
}

export function isShiftFinished(state: GameState): boolean {
  return state.clockMinutes >= SHIFT_END_MINUTES || state.shiftCompleted >= state.roster.length;
}
export function canEndDay(state: GameState): boolean {
  return state.phase === 'cabinet' && state.visit === null && isShiftFinished(state);
}

export interface ActionResult {
  state: GameState;
  feedback: GameFeedback;
}

export function clippedDocuments(state: GameState, documentId: DocumentId): DocumentId[] {
  return [...(state.paperClips.find(group => group.includes(documentId)) ?? [documentId])];
}

export function isDocumentClipped(state: GameState, documentId: DocumentId): boolean {
  return state.paperClips.some(group => group.includes(documentId));
}

function noteResults(visit: Visit): NoteResults {
  const patient = PATIENTS[visit.patientId]!;
  return {
    vision: visit.visionTested ? patient.vision : null,
    pressure: visit.pressureTested ? patient.pressure : null,
    weight: visit.measurementsTaken ? patient.weight : null,
    height: visit.measurementsTaken ? patient.height : null,
  };
}

/** Examination transitions record findings, including notes kept in the drawer. */
function recordResults(papers: Paper[], visit: Visit | null, day: number): Paper[] {
  if (!visit || visit.document !== 'desk' || (!visit.visionTested && !visit.pressureTested && !visit.measurementsTaken)) return papers;
  return papers.map(paper => paper.kind === 'note'
    && ((paper.patientId === null && paper.location === 'desk') || (paper.patientId === visit.patientId && paper.day === day))
    ? { ...paper, patientId: visit.patientId, day, results: noteResults(visit) } : paper);
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

  if (action === 'next-day') {
    if (state.phase !== 'home') return unchanged('shift-unfinished');
    if (state.day === GAME_LIMITS.day) return unchanged('limit-reached');
    const day = state.day + 1;
    const previousMonthBalance = gameDate(day).month !== gameDate(state.day).month ? state.money : state.previousMonthBalance;
    if (isWeekend(day)) {
      const result = settleDay({ ...state, day, shiftCompleted: 0, daily: emptyConsequences(), restDay: true });
      if (Math.abs(result.settlement.closingBalance) > GAME_LIMITS.money) return unchanged('limit-reached');
      return changed({ ...result, day, previousMonthBalance, phase: 'home', shiftCompleted: 0, roster: [],
        clockMinutes: SHIFT_END_MINUTES, daily: emptyConsequences(), money: result.settlement.closingBalance }, 'next-day');
    }
    const generated = createRoster(state.rngState);
    return changed({ phase: 'cabinet', day, previousMonthBalance, shiftCompleted: 0, clockMinutes: ARRIVAL_MINUTES,
      roster: generated.roster, rngState: generated.seed, daily: emptyConsequences(), settlement: null }, 'next-day');
  }
  if (state.phase === 'home') return unchanged('none');
  if (action === 'end-day') {
    if (!canEndDay(state)) return unchanged('shift-unfinished');
    const result = settleDay(state);
    if (Math.abs(result.settlement.closingBalance) > GAME_LIMITS.money) return unchanged('limit-reached');
    return changed({ ...result, phase: 'home', clockMinutes: SHIFT_END_MINUTES, money: result.settlement.closingBalance }, 'shift-finished');
  }
  if (action === 'advance-intro' || action === 'skip-intro') return unchanged('none');
  const spend = (minutes: number): number => Math.min(SHIFT_END_MINUTES, state.clockMinutes + minutes);
  const canAddPaper = (): boolean => state.papers.length < GAME_LIMITS.papers && state.nextPaperId <= GAME_LIMITS.paperId;
  const addPaper = (paper: Paper, changes: Partial<GameState>, feedback: GameFeedback): ActionResult => changed({
    ...changes, papers: recordResults([...state.papers, paper], state.visit, state.day), nextPaperId: state.nextPaperId + 1,
  }, feedback);
  if (typeof action === 'object' && 'item' in action) {
    const storing = action.type === 'store-drawer-item';
    const { manual, clips } = state.drawerItems;
    if (action.item === 'manual') {
      if (manual === storing) return unchanged(storing ? 'item-stored' : 'item-missing');
      return changed({ drawerItems: { manual: storing, clips }, clockMinutes: spend(ACTION_MINUTES.handling) }, storing ? 'item-stored' : 'item-retrieved');
    }
    if (storing && clips >= GAME_LIMITS.drawerClips) return unchanged('limit-reached');
    if (!storing && clips === 0) return unchanged('item-missing');
    return changed({ drawerItems: { manual, clips: clips + (storing ? 1 : -1) }, clockMinutes: spend(ACTION_MINUTES.handling) }, storing ? 'item-stored' : 'item-retrieved');
  }
  if (action === 'use-phone') return changed({ clockMinutes: spend(ACTION_MINUTES.handling) }, 'phone-unavailable');
  if (action === 'take-paper') {
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'note', day: state.day, patientId: null, location: 'desk', additionalWritten: false,
      results: { vision: null, pressure: null, weight: null, height: null } },
    { clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-taken');
  }
  if (typeof action === 'object' && 'documentId' in action) {
    const onDesk = (id: DocumentId): boolean => id === 'certificate' ? state.visit?.certificateTaken === true
      : state.papers.some(paper => paper.id === id && paper.location === 'desk');
    if (!onDesk(action.documentId)) return unchanged('paper-missing');
    const clipped = isDocumentClipped(state, action.documentId);
    if (action.type === 'unclip-document') {
      if (!clipped) return unchanged('paper-unclipped');
      return changed({ paperClips: state.paperClips.filter(group => !group.includes(action.documentId)), clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-unclipped');
    }
    if (action.type === 'clip-document') {
      if (clipped) return unchanged('paper-clipped');
      return changed({ paperClips: [...state.paperClips, [action.documentId]], clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-clipped');
    }
    if (!onDesk(action.targetId)) return unchanged('paper-missing');
    if (!isDocumentClipped(state, action.targetId)) return unchanged('clip-needed');
    const source = clippedDocuments(state, action.documentId), target = clippedDocuments(state, action.targetId);
    if (source.includes(action.targetId)) return unchanged('papers-joined');
    return changed({
      paperClips: [...state.paperClips.filter(group => !group.includes(action.documentId) && !group.includes(action.targetId)), [...target, ...source]],
      clockMinutes: spend(ACTION_MINUTES.handling),
    }, 'papers-joined');
  }
  if (typeof action === 'object') {
    const paper = state.papers.find(entry => entry.id === action.paperId);
    if (!paper) return unchanged('paper-missing');
    const updatePaper = (updated: Paper, feedback: GameFeedback): ActionResult => changed({
      papers: state.papers.map(entry => entry.id === paper.id ? updated : entry),
      clockMinutes: spend(ACTION_MINUTES.handling),
    }, feedback);
    const group = clippedDocuments(state, paper.id);
    if (action.type === 'store-paper') {
      if (paper.location === 'drawer') return unchanged('paper-stored');
      if (group.includes('certificate')) return unchanged('certificate-in-bundle');
      // Array order records filing order, including an older sheet filed again
      // after retrieval; browsing the drawer must preserve this order.
      return changed({
        papers: [...state.papers.filter(entry => !group.includes(entry.id)), ...state.papers.filter(entry => group.includes(entry.id)).map(entry => ({ ...entry, location: 'drawer' as const }))],
        clockMinutes: spend(ACTION_MINUTES.handling),
      }, 'paper-stored');
    }
    if (action.type === 'retrieve-paper') {
      return paper.location === 'desk' ? unchanged('paper-retrieved') : changed({
        papers: recordResults(state.papers.map(entry => group.includes(entry.id) ? { ...entry, location: 'desk' } : entry), state.visit, state.day),
        clockMinutes: spend(ACTION_MINUTES.handling),
      }, 'paper-retrieved');
    }
    if (paper.location !== 'desk') return unchanged('paper-missing');
    if (action.type === 'trash-paper') {
      if (group.includes('certificate')) return unchanged('certificate-in-bundle');
      return changed({ papers: state.papers.filter(entry => !group.includes(entry.id)),
        paperClips: state.paperClips.filter(entries => !entries.includes(paper.id)), clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-trashed');
    }
    if (action.type === 'clip-paper') return applyAction(state, { type: 'clip-document', documentId: paper.id });
    if (action.type === 'open-letter') {
      if (paper.kind !== 'letter') return unchanged('paper-missing');
      return paper.opened ? unchanged('letter-opened') : updatePaper({ ...paper, opened: true }, 'letter-opened');
    }
    if (paper.kind !== 'note') return unchanged('paper-missing');
    const visit = state.visit;
    if (!visit) return unchanged('no-patient');
    if (visit.document !== 'desk') return unchanged('document-needed');
    if (paper.patientId !== null && (paper.patientId !== visit.patientId || paper.day !== state.day)) return unchanged('paper-wrong-patient');
    if (paper.additionalWritten) return unchanged('paper-written');
    return updatePaper({ ...paper, patientId: visit.patientId, day: state.day, additionalWritten: true, results: noteResults(visit) }, 'paper-written');
  }
  if (action === 'handle-item' || action === 'read-manual') {
    return changed({ clockMinutes: spend(action === 'read-manual' ? ACTION_MINUTES.reading : ACTION_MINUTES.handling) }, 'none');
  }
  if (action === 'toggle-lamp') return changed({ clockMinutes: spend(ACTION_MINUTES.handling), lampOn: !state.lampOn }, state.lampOn ? 'lamp-off' : 'lamp-on');
  if (action === 'change-decoration') {
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), decoration: state.decoration === 'plant' ? 'certificate' : 'plant' }, 'decoration-changed');
  }
  if (action === 'call-patient') {
    if (state.visit) return unchanged('patient-waiting');
    if (isShiftFinished(state)) return unchanged('shift-finished');
    if (state.patientsProcessed === GAME_LIMITS.patients) return unchanged('limit-reached');
    return changed({ clockMinutes: Math.max(SHIFT_START_MINUTES, spend(ACTION_MINUTES.handling)), visit: {
      patientId: state.roster[state.shiftCompleted]!, document: 'tray', certificateTaken: false, certificateNamed: false, visionTested: false, pressureTested: false, measurementsTaken: false, decision: null,
    } }, 'patient-called');
  }

  const visit = state.visit;
  if (!visit) return unchanged('no-patient');
  if (action === 'take-document') {
    if (visit.document === 'desk') return unchanged('document-taken');
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'referral', patientId: visit.patientId, day: state.day, location: 'desk' },
      { clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, document: 'desk' } }, 'document-taken');
  }
  if (visit.document !== 'desk') return unchanged('document-needed');
  if (action === 'take-certificate') {
    if (visit.certificateTaken) return unchanged('certificate-taken');
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, certificateTaken: true } }, 'certificate-taken');
  }
  const patient = PATIENTS[visit.patientId]!;
  const examination = (changes: Partial<Visit>, minutes: number, feedback: GameFeedback): ActionResult => {
    const updated = { ...visit, ...changes };
    return changed({ clockMinutes: spend(minutes), visit: updated, papers: recordResults(state.papers, updated, state.day) }, feedback);
  };
  if (action === 'run-vision') {
    const feedback = patient.vision === 'pass' ? 'vision-pass' : 'vision-refer';
    return examination({ visionTested: true }, ACTION_MINUTES.vision, feedback);
  }
  if (action === 'run-pressure') {
    const feedback = patient.pressure === 'pass' ? 'pressure-pass' : 'pressure-refer';
    return examination({ pressureTested: true }, ACTION_MINUTES.pressure, feedback);
  }
  if (action === 'run-measurements') {
    return examination({ measurementsTaken: true }, ACTION_MINUTES.measurements, 'measurements-taken');
  }
  if (!visit.certificateTaken) return unchanged('certificate-needed');
  if (action === 'write-certificate') {
    return visit.certificateNamed ? unchanged('certificate-written') : changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, certificateNamed: true } }, 'certificate-written');
  }
  if (action === 'stamp-fit' || action === 'stamp-unfit') {
    const decision = action === 'stamp-fit' ? 'fit' : 'unfit';
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, decision } }, decision === 'fit' ? 'stamped-fit' : 'stamped-unfit');
  }
  if (!visit.decision) return unchanged('stamp-needed');
  if (!visit.certificateNamed) return unchanged('certificate-name-needed');
  const wrongDecision = visit.decision !== patient.expectedDecision;
  const correct = hasRequiredExaminations(patient, visit) && !wrongDecision;
  if (state.patientsProcessed === GAME_LIMITS.patients) return unchanged('limit-reached');
  const draw = wrongDecision ? randomStep(state.rngState) : null;
  const undetected = visit.decision === 'fit' ? 0.35 : patient.managerial ? 0.03 : 0.25;
  const detected = wrongDecision && draw!.value >= undetected;
  if (detected && !canAddPaper()) return unchanged('limit-reached');
  let daily = state.daily, insuranceRate = state.insuranceRate;
  if (detected && visit.decision === 'fit') {
    daily = { ...daily, zusCases: daily.zusCases + 1, fines: daily.fines + (daily.zusCases === 0 ? 100 : 400) };
  } else if (detected) {
    const increase = insuranceRate === BASE_INSURANCE ? 50 : 100;
    if (insuranceRate > GAME_LIMITS.money - increase) return unchanged('limit-reached');
    insuranceRate += increase;
    daily = { ...daily, refusals: daily.refusals + 1, insuranceIncrease: daily.insuranceIncrease + increase };
  }
  const completion: Partial<GameState> = {
    visit: null,
    shiftCompleted: state.shiftCompleted + 1,
    clockMinutes: spend(ACTION_MINUTES.handling),
    patientsProcessed: state.patientsProcessed + 1,
    rngState: draw?.seed ?? state.rngState, daily, insuranceRate,
    paperClips: state.paperClips.map(group => group.filter(id => id !== 'certificate')).filter(group => group.length > 0),
  };
  if (detected) return addPaper({ id: state.nextPaperId, kind: 'letter', patientId: visit.patientId, day: state.day,
    location: 'desk', sender: visit.decision === 'fit' ? 'zus' : 'employer', opened: false }, completion, 'patient-error');
  return changed(completion, correct ? 'patient-cleared' : 'patient-completed');
}
