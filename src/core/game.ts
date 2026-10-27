import { gameDate, isWeekend } from './calendar';
import { additionalResultFor, additionalTestForJob, additionalTestForPatient, nextWorkingDay, type AdditionalTest, type AdditionalResult, type PendingReferral } from './additional-tests';
import { PATIENTS, CHARACTER_COUNT, randomStep, hasRequiredExaminations, disqualifyingPressure, type ExaminationId, type VisionValues, type PressureValues } from './patients';
import { BASE_INSURANCE, emptyConsequences, settleDay, type DailyConsequences, type DaySettlement } from './economy';
import { arrangeProgressionRoster, createAppointmentDetails, createDailyRoster, directiveForDay, emptyCalls, expectedVisitDecision, patientForAppointment, specialistIsValid, workDayNumber,
  type BribeState, type DirectiveRule, type PhoneConclusions, type ReferralDetails, type SpecialistCertificate } from './progression';
export type { DaySettlement, DailyConsequences } from './economy';

export const INTRO_SLIDES = 4;
export const SHIFT_LENGTH = CHARACTER_COUNT;
export const ARRIVAL_MINUTES = 477;
export const SHIFT_START_MINUTES = 480;
export const SHIFT_END_MINUTES = 840;
export const CLEANER_WARNING_MINUTES = 1020;
export const CLINIC_CLOSE_MINUTES = 1035;
// Additional simulated minutes charged by actions, independent of elapsed time.
export const ACTION_MINUTES = { handling: 1, reading: 1, general: 3, vision: 3, pressure: 4, measurements: 2 } as const;
export const GAME_LIMITS = { day: 1_000_000, money: 1_000_000_000, patients: 1_000_000_000, papers: 4096, paperId: 1_000_000_000, drawerClips: 4096 } as const;

export type Decision = 'fit' | 'unfit';
export type TestResult = 'pass' | 'refer';
export type DocumentId = number | 'certificate';
export type NoteEntryId = ExaminationId | 'history' | 'pressure-repeat' | 'call-specialist' | 'call-employer';

export { PATIENTS } from './patients';

export interface NoteResults {
  general: TestResult | null;
  vision: VisionValues | null;
  pressure: PressureValues | null;
  pressureReadings: PressureValues[];
  weight: number | null;
  height: number | null;
}

interface PaperBase {
  id: number;
  day: number;
  location: 'desk' | 'drawer';
}
export type Paper =
  | (PaperBase & { kind: 'note'; patientId: number | null; results: NoteResults; examinationOrder: ExaminationId[]; noteOrder: NoteEntryId[]; additionalWritten: boolean; calls: PhoneConclusions; bribe: boolean })
  | (PaperBase & { kind: 'referral'; patientId: number; details: ReferralDetails })
  | (PaperBase & { kind: 'additional-referral'; patientId: number; test: AdditionalTest | null })
  | (PaperBase & { kind: 'additional-result'; patientId: number; test: AdditionalTest; fit: boolean })
  | (PaperBase & { kind: 'specialist'; patientId: number; certificate: SpecialistCertificate })
  | (PaperBase & { kind: 'directive'; patientId: null; sender: 'zus' | 'chamber'; rule: DirectiveRule; opened: boolean })
  | (PaperBase & { kind: 'letter'; patientId: number; sender: 'zus' | 'employer'; opened: boolean; reason?: 'missing-result' });

export interface Visit {
  startedDay: number;
  additionalResult: AdditionalResult | null;
  additionalTests: AdditionalTest[];
  patientId: number;
  referral: ReferralDetails;
  specialist: SpecialistCertificate | null;
  specialistTaken: boolean;
  calls: PhoneConclusions;
  bribe: BribeState;
  document: 'tray' | 'desk';
  certificateTaken: boolean;
  /** The pen fills both name and job; retain this key for save compatibility. */
  certificateNamed: boolean;
  generalTested: boolean;
  examinationOrder: ExaminationId[];
  /** Append-only chronology shared by existing and later-fetched notes. */
  noteOrder: NoteEntryId[];
  visionTested: boolean;
  pressureTested: boolean;
  pressureLatest: PressureValues | null;
  pressureReadings: PressureValues[];
  measurementsTaken: boolean;
  decision: Decision | null;
}

export interface GameState {
  pendingReferrals: PendingReferral[];
  referralsIssued: number;
  ending: null | 'assault-pending' | 'hospital' | 'bankruptcy';
  day: number;
  money: number;
  previousMonthBalance: number;
  /** Net cash accepted or returned during this day, already included in money. */
  bribeIncome: number;
  patientsProcessed: number;
  phase: 'intro' | 'cabinet' | 'home';
  rngState: number;
  roster: number[];
  insuranceRate: number;
  daily: DailyConsequences;
  settlement: DaySettlement | null;
  /** Earlier settled days included in Sunday's shared Friday–Sunday budget. */
  budgetHistory: DaySettlement[];
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
  | 'run-general' | 'run-vision' | 'run-pressure' | 'run-measurements' | 'stamp-fit' | 'stamp-unfit'
  | 'end-day' | 'return-document' | 'toggle-lamp' | 'change-decoration' | 'next-day'
  | 'handle-item' | 'read-manual' | 'take-paper' | 'use-phone'
  | 'take-additional-referral'
  | { type: 'select-additional-test'; paperId: number; test: AdditionalTest }
  | { type: 'hand-additional-referral'; paperId: number }
  | 'take-specialist' | 'call-specialist' | 'call-employer' | 'accept-bribe' | 'return-bribe'
  | { type: 'store-drawer-item' | 'retrieve-drawer-item'; item: 'manual' | 'clip' }
  | { type: 'write-note' | 'store-paper' | 'retrieve-paper' | 'trash-paper' | 'open-letter' | 'clip-paper'; paperId: number }
  | { type: 'clip-document'; documentId: DocumentId }
  | { type: 'unclip-document'; documentId: DocumentId }
  | { type: 'join-documents'; documentId: DocumentId; targetId: DocumentId };

export type GameFeedback =
  | 'additional-unavailable' | 'referral-taken' | 'test-selected' | 'test-needed' | 'test-already-done' | 'patient-referred' | 'patient-returned' | 'referral-penalty'
  | 'none' | 'cabinet-ready' | 'patient-called' | 'patient-waiting' | 'shift-finished'
  | 'document-taken' | 'document-needed' | 'certificate-taken' | 'certificate-needed' | 'no-patient' | 'vision-pass' | 'vision-refer'
  | 'general-pass' | 'general-refer'
  | 'pressure-pass' | 'pressure-refer' | 'stamped-fit' | 'stamped-unfit'
  | 'stamp-needed' | 'patient-cleared' | 'patient-completed' | 'patient-error' | 'lamp-on' | 'lamp-off'
  | 'decoration-changed' | 'next-day' | 'shift-unfinished' | 'limit-reached'
  | 'measurements-taken' | 'phone-unavailable' | 'paper-taken' | 'paper-written'
  | 'paper-stored' | 'paper-retrieved' | 'paper-trashed' | 'paper-missing'
  | 'paper-wrong-patient' | 'results-needed' | 'letter-opened' | 'paper-clipped'
  | 'paper-unclipped' | 'papers-joined' | 'clip-needed' | 'certificate-in-bundle'
  | 'certificate-written' | 'certificate-name-needed'
  | 'item-stored' | 'item-retrieved' | 'item-missing' | 'visit-interrupted'
  | 'phone-ready' | 'specialist-taken' | 'specialist-missing' | 'specialist-valid' | 'specialist-invalid'
  | 'employer-confirmed' | 'employer-denied' | 'bribe-accepted' | 'bribe-returned' | 'bribe-missing' | 'game-over';

export function createInitialState(seed = globalThis.crypto.getRandomValues(new Uint32Array(1))[0]!): GameState {
  const generated = createDailyRoster(seed >>> 0, 1);
  return {
    pendingReferrals: [], referralsIssued: 0, budgetHistory: [],
    ending: null,
    rngState: generated.seed, roster: generated.roster, insuranceRate: BASE_INSURANCE, daily: emptyConsequences(), settlement: null,
    day: 1, money: 0, bribeIncome: 0, previousMonthBalance: 0, patientsProcessed: 0,
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
  const patient = patientForAppointment(visit);
  return {
    general: visit.generalTested ? patient.general : null,
    vision: visit.visionTested ? { ...patient.visionValues } : null,
    pressure: visit.pressureReadings.length ? { ...visit.pressureReadings.at(-1)! } : null,
    pressureReadings: visit.pressureReadings.map(reading => ({ ...reading })),
    weight: visit.measurementsTaken ? patient.weight : null,
    height: visit.measurementsTaken ? patient.height : null,
  };
}

/** Available desk sheets receive the patient's identity before any findings. */
function recordResults(papers: Paper[], visit: Visit | null, day: number): Paper[] {
  if (!visit) return papers;
  return papers.map(paper => paper.kind === 'note'
    && ((paper.patientId === null && paper.location === 'desk') || (paper.patientId === visit.patientId && paper.day === visit.startedDay))
    ? { ...paper, patientId: visit.patientId, day: visit.startedDay, results: noteResults(visit), examinationOrder: [...visit.examinationOrder],
      noteOrder: [...paper.noteOrder, ...visit.noteOrder.filter(entry => !paper.noteOrder.includes(entry))],
      additionalWritten: paper.additionalWritten || visit.generalTested,
      calls: { ...visit.calls }, bribe: visit.bribe !== 'none' } : paper);
}

/** Bankruptcy is assessed only after all income and expenses are settled. */
function settledEnding(state: GameState, balance: number): GameState['ending'] {
  return state.ending === 'assault-pending' ? 'hospital' : balance < 0 ? 'bankruptcy' : state.ending;
}

/** Pure transitions: all results and rewards are reproducible from saved state. */
export function applyAction(state: GameState, action: GameAction): ActionResult {
  const result = transition(state, action);
  if (state.phase !== 'cabinet' || result.state === state || result.state.clockMinutes < CLINIC_CLOSE_MINUTES) return result;
  // A procedure which reaches closing cannot finish the appointment. Settle
  // from its prior state so it cannot award a bonus or issue a complaint.
  return finishAtClosing(state);
}

/** Settle the remaining weekend once before presenting its single home sequence. */
export function settleWeekend(state: GameState): GameState {
  while (state.phase === 'home' && state.ending === null && isWeekend(state.day + 1)) {
    const next = applyAction(state, 'next-day').state;
    if (next === state) break;
    state = next;
  }
  return state;
}

/** Whole minutes from the live clock; no action, examination or reward is implied. */
export function advanceClinicTime(state: GameState, minutes: number): ActionResult {
  if (state.phase !== 'cabinet' || !Number.isSafeInteger(minutes) || minutes <= 0) return { state, feedback: 'none' };
  if (minutes >= CLINIC_CLOSE_MINUTES - state.clockMinutes) return finishAtClosing(state);
  return { state: { ...state, clockMinutes: state.clockMinutes + minutes }, feedback: 'none' };
}

function finishAtClosing(state: GameState): ActionResult {
  const resumed = state.visit?.additionalResult ? state.visit : null;
  const returnDay = nextWorkingDay(state.day);
  const test = resumed?.additionalTests.at(-1);
  const pendingReferrals = resumed && test && returnDay <= GAME_LIMITS.day
    ? [...state.pendingReferrals, { visit: resumed, sentDay: state.day, returnDay, returnMinute: SHIFT_START_MINUTES,
      returnAfterCompleted: state.shiftCompleted + 3, test, fit: additionalResultFor(patientForAppointment(resumed), test).fit }]
    : state.pendingReferrals;
  const closed = { ...state, pendingReferrals, clockMinutes: CLINIC_CLOSE_MINUTES, visit: null,
    paperClips: state.paperClips.map(group => group.filter(id => id !== 'certificate')).filter(group => group.length > 0) };
  const settlement = settleDay(closed);
  if (Math.abs(settlement.settlement.closingBalance) > GAME_LIMITS.money) return { state, feedback: 'limit-reached' };
  return { state: { ...closed, ...settlement, phase: 'home', money: settlement.settlement.closingBalance,
    ending: settledEnding(state, settlement.settlement.closingBalance) },
    feedback: state.visit ? 'visit-interrupted' : 'shift-finished' };
}

function transition(state: GameState, action: GameAction): ActionResult {
  const unchanged = (feedback: GameFeedback): ActionResult => ({ state, feedback });
  const changed = (changes: Partial<GameState>, feedback: GameFeedback): ActionResult => ({ state: { ...state, ...changes }, feedback });

  if (state.ending === 'hospital' || state.ending === 'bankruptcy') return unchanged('game-over');

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
      return changed({ ...result, day, previousMonthBalance, bribeIncome: 0, phase: 'home', shiftCompleted: 0, roster: [],
        budgetHistory: [...state.budgetHistory, ...(state.settlement ? [state.settlement] : [])],
        clockMinutes: SHIFT_END_MINUTES, referralsIssued: 0, daily: emptyConsequences(), money: result.settlement.closingBalance,
        ending: settledEnding(state, result.settlement.closingBalance) }, 'next-day');
    }
    const generated = createDailyRoster(state.rngState, day);
    const rule = directiveForDay(day);
    if (rule && (state.papers.length >= GAME_LIMITS.papers || state.nextPaperId > GAME_LIMITS.paperId)) return unchanged('limit-reached');
    const papers: Paper[] = rule ? [...state.papers, { id: state.nextPaperId, kind: 'directive', patientId: null, day,
      location: 'desk', sender: rule === 'specialist' || rule === 'additional-tests' ? 'chamber' : 'zus', rule, opened: false }] : state.papers;
    return changed({ phase: 'cabinet', day, previousMonthBalance, bribeIncome: 0, shiftCompleted: 0, clockMinutes: ARRIVAL_MINUTES,
      roster: arrangeProgressionRoster(generated.roster.map(id => state.pendingReferrals.find(pending => PATIENTS[pending.visit.patientId]!.characterId === PATIENTS[id]!.characterId)?.visit.patientId ?? id), day), referralsIssued: 0, rngState: generated.seed, daily: emptyConsequences(), settlement: null, budgetHistory: [],
      papers, nextPaperId: state.nextPaperId + Number(rule !== null) }, 'next-day');
  }
  if (state.phase === 'home') return unchanged('none');
  if (action === 'end-day') {
    if (!canEndDay(state)) return unchanged('shift-unfinished');
    const result = settleDay(state);
    if (Math.abs(result.settlement.closingBalance) > GAME_LIMITS.money) return unchanged('limit-reached');
    return changed({ ...result, phase: 'home', clockMinutes: Math.max(SHIFT_END_MINUTES, state.clockMinutes), money: result.settlement.closingBalance,
      ending: settledEnding(state, result.settlement.closingBalance) }, 'shift-finished');
  }
  if (action === 'advance-intro' || action === 'skip-intro') return unchanged('none');
  const spend = (minutes: number): number => Math.min(CLINIC_CLOSE_MINUTES, state.clockMinutes + minutes);
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
  if (action === 'use-phone') return changed({ clockMinutes: spend(ACTION_MINUTES.handling) }, workDayNumber(state.day) >= 4 ? 'phone-ready' : 'phone-unavailable');
  if (action === 'take-paper') {
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'note', day: state.day, patientId: null, location: 'desk', additionalWritten: false,
      calls: emptyCalls(), bribe: false,
      examinationOrder: [], noteOrder: [], results: { general: null, vision: null, pressure: null, pressureReadings: [], weight: null, height: null } },
    { clockMinutes: spend(ACTION_MINUTES.handling) }, 'paper-taken');
  }
  if (action === 'take-additional-referral') {
    if (workDayNumber(state.day) < 7) return unchanged('additional-unavailable');
    if (!state.visit) return unchanged('no-patient');
    if (state.visit.document !== 'desk') return unchanged('document-needed');
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'additional-referral', day: state.visit.startedDay,
      patientId: state.visit.patientId, location: 'desk', test: null },
    { clockMinutes: spend(ACTION_MINUTES.handling) }, 'referral-taken');
  }
  if (typeof action === 'object' && (action.type === 'select-additional-test' || action.type === 'hand-additional-referral')) {
    if (workDayNumber(state.day) < 7) return unchanged('additional-unavailable');
    const visit = state.visit;
    if (!visit) return unchanged('no-patient');
    const paper = state.papers.find(paper => paper.id === action.paperId);
    if (!paper || paper.kind !== 'additional-referral' || paper.location !== 'desk') return unchanged('paper-missing');
    if (paper.patientId !== visit.patientId || paper.day !== visit.startedDay) return unchanged('paper-wrong-patient');
    if (action.type === 'select-additional-test') return changed({
      papers: state.papers.map(entry => entry === paper ? { ...paper, test: action.test } : entry),
      clockMinutes: spend(ACTION_MINUTES.handling),
    }, 'test-selected');
    if (!paper.test) return unchanged('test-needed');
    if (visit.additionalTests.includes(paper.test)) return unchanged('test-already-done');
    const patient = patientForAppointment(visit);
    const wrongJob = additionalTestForJob(patient) !== paper.test;
    if (wrongJob && !canAddPaper()) return unchanged('limit-reached');
    const draw = randomStep(state.rngState), delay = randomStep(draw.seed);
    const minute = state.clockMinutes + 120 + Math.floor(delay.value * 61);
    const returnTomorrow = draw.value < 0.4 || minute >= SHIFT_END_MINUTES || state.shiftCompleted + 3 >= state.roster.length;
    const returnDay = returnTomorrow ? nextWorkingDay(state.day) : state.day;
    if (returnDay > GAME_LIMITS.day) return unchanged('limit-reached');
    const report = additionalResultFor(patient, paper.test);
    const pending: PendingReferral = {
      visit: { ...visit, additionalTests: [...visit.additionalTests, paper.test] }, sentDay: state.day,
      returnDay, returnMinute: returnTomorrow ? SHIFT_START_MINUTES : minute,
      returnAfterCompleted: state.shiftCompleted + 3, test: paper.test, fit: report.fit,
    };
    const roster = [...state.roster]; roster.splice(state.shiftCompleted, 1); roster.push(visit.patientId);
    const papers: Paper[] = state.papers.filter(entry => entry !== paper);
    const daily = wrongJob ? { ...state.daily, zusCases: state.daily.zusCases + 1,
      fines: state.daily.fines + (state.daily.zusCases === 0 ? 100 : 400) } : state.daily;
    if (wrongJob) papers.push({ id: state.nextPaperId, kind: 'letter', patientId: visit.patientId,
      day: state.day, location: 'desk', sender: 'zus', opened: false });
    return changed({ visit: null, roster, pendingReferrals: [...state.pendingReferrals, pending], referralsIssued: state.referralsIssued + 1,
      papers, daily, nextPaperId: state.nextPaperId + Number(wrongJob), rngState: delay.seed,
      paperClips: state.paperClips.map(group => group.filter(id => id !== paper.id && id !== 'certificate')).filter(group => group.length > 0),
      clockMinutes: spend(ACTION_MINUTES.handling) }, wrongJob ? 'referral-penalty' : 'patient-referred');
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
      if (paper.kind !== 'letter' && paper.kind !== 'directive') return unchanged('paper-missing');
      return paper.opened ? unchanged('letter-opened') : updatePaper({ ...paper, opened: true }, 'letter-opened');
    }
    if (paper.kind !== 'note') return unchanged('paper-missing');
    const visit = state.visit;
    if (!visit) return unchanged('no-patient');
    if (visit.document !== 'desk') return unchanged('document-needed');
    if (paper.patientId !== null && (paper.patientId !== visit.patientId || paper.day !== visit.startedDay)) return unchanged('paper-wrong-patient');
    if (!visit.generalTested) return unchanged('results-needed');
    if (paper.additionalWritten) return unchanged('paper-written');
    return updatePaper({ ...paper, patientId: visit.patientId, day: visit.startedDay, additionalWritten: true, results: noteResults(visit), examinationOrder: [...visit.examinationOrder], noteOrder: [...visit.noteOrder],
      calls: { ...visit.calls }, bribe: visit.bribe !== 'none' }, 'paper-written');
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
    const returning = state.pendingReferrals.find(pending => pending.returnDay < state.day
      || (pending.returnDay === state.day && Math.max(SHIFT_START_MINUTES, state.clockMinutes) >= pending.returnMinute
        && (pending.sentDay < state.day || state.shiftCompleted >= pending.returnAfterCompleted)));
    const roster = [...state.roster];
    if (returning) {
      if (!canAddPaper()) return unchanged('limit-reached');
      const index = roster.indexOf(returning.visit.patientId);
      roster.splice(index, 1); roster.splice(state.shiftCompleted, 0, returning.visit.patientId);
      const incoming = { test: returning.test, fit: returning.fit };
      const required = additionalTestForJob(patientForAppointment(returning.visit));
      const additionalResult = returning.visit.additionalResult?.test === required && incoming.test !== required
        ? returning.visit.additionalResult : incoming;
      const visit: Visit = { ...returning.visit, additionalResult };
      return changed({ roster, visit, pendingReferrals: state.pendingReferrals.filter(pending => pending !== returning),
        clockMinutes: Math.max(SHIFT_START_MINUTES, spend(ACTION_MINUTES.handling)), nextPaperId: state.nextPaperId + 1,
        papers: recordResults([...state.papers, { id: state.nextPaperId, kind: 'additional-result', patientId: visit.patientId,
          day: state.day, location: 'desk', test: returning.test, fit: returning.fit }], visit, state.day) }, 'patient-returned');
    }
    const index = roster.findIndex((id, index) => index >= state.shiftCompleted && !state.pendingReferrals.some(pending => pending.visit.patientId === id));
    if (index < 0) return unchanged('patient-waiting');
    const [patientId] = roster.splice(index, 1); roster.splice(state.shiftCompleted, 0, patientId!);
    const details = createAppointmentDetails(state, patientId!);
    const visit: Visit = {
      startedDay: state.day, additionalResult: null, additionalTests: [],
      patientId: patientId!, document: 'tray', certificateTaken: false, certificateNamed: false, generalTested: false, examinationOrder: [], noteOrder: [], visionTested: false, pressureTested: false, pressureLatest: null, pressureReadings: [], measurementsTaken: false, decision: null,
      referral: details.referral, specialist: details.specialist, specialistTaken: false, calls: emptyCalls(), bribe: details.bribe,
    };
    return changed({ roster, clockMinutes: Math.max(SHIFT_START_MINUTES, spend(ACTION_MINUTES.handling)), visit, rngState: details.seed,
      papers: recordResults(state.papers, visit, state.day) }, 'patient-called');
  }

  const visit = state.visit;
  if (!visit) return unchanged('no-patient');
  if (action === 'accept-bribe' || action === 'return-bribe') {
    if (visit.bribe === 'none') return unchanged('bribe-missing');
    if (action === 'accept-bribe') {
      if (visit.bribe === 'accepted') return unchanged('bribe-accepted');
      if (visit.bribe !== 'offered') return unchanged('bribe-missing');
      if (state.money > GAME_LIMITS.money - 100 || state.bribeIncome >= CHARACTER_COUNT * 100) return unchanged('limit-reached');
      return changed({ money: state.money + 100, bribeIncome: state.bribeIncome + 100, visit: { ...visit, bribe: 'accepted' }, clockMinutes: spend(ACTION_MINUTES.handling) }, 'bribe-accepted');
    }
    if (visit.bribe === 'returned') return unchanged('bribe-returned');
    if (visit.bribe === 'accepted' && (state.money < -GAME_LIMITS.money + 100 || state.bribeIncome <= -CHARACTER_COUNT * 100)) return unchanged('limit-reached');
    return changed({ money: state.money - (visit.bribe === 'accepted' ? 100 : 0),
      bribeIncome: state.bribeIncome - (visit.bribe === 'accepted' ? 100 : 0), visit: { ...visit, bribe: 'returned' },
      clockMinutes: spend(ACTION_MINUTES.handling) }, 'bribe-returned');
  }
  if (action === 'take-specialist') {
    if (!visit.specialist || workDayNumber(state.day) < 4) return unchanged('specialist-missing');
    if (visit.specialistTaken) return unchanged('specialist-taken');
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'specialist', patientId: visit.patientId, day: visit.startedDay, location: 'desk',
      certificate: { ...visit.specialist } }, { visit: { ...visit, specialistTaken: true }, clockMinutes: spend(ACTION_MINUTES.handling) }, 'specialist-taken');
  }
  if (action === 'call-specialist' || action === 'call-employer') {
    if (workDayNumber(state.day) < (action === 'call-specialist' ? 4 : 5)) return unchanged('phone-unavailable');
    const documentKind = action === 'call-specialist' ? 'specialist' : 'referral';
    if (!state.papers.some(paper => paper.kind === documentKind && paper.patientId === visit.patientId
      && paper.day === visit.startedDay && paper.location === 'desk')) return unchanged('document-needed');
    const valid = action === 'call-specialist' ? specialistIsValid(visit) : visit.referral.authentic;
    const updated = { ...visit, noteOrder: visit.noteOrder.includes(action) ? [...visit.noteOrder] : [...visit.noteOrder, action], calls: { ...visit.calls, [action === 'call-specialist' ? 'specialist' : 'employer']: valid } };
    return changed({ visit: updated, papers: recordResults(state.papers, updated, state.day), clockMinutes: spend(3) },
      action === 'call-specialist' ? valid ? 'specialist-valid' : 'specialist-invalid' : valid ? 'employer-confirmed' : 'employer-denied');
  }
  if (action === 'take-document') {
    if (visit.document === 'desk') return unchanged('document-taken');
    if (!canAddPaper()) return unchanged('limit-reached');
    return addPaper({ id: state.nextPaperId, kind: 'referral', patientId: visit.patientId, day: visit.startedDay, location: 'desk', details: { ...visit.referral } },
      { clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, document: 'desk' } }, 'document-taken');
  }
  const isExamination = action === 'run-general' || action === 'run-vision' || action === 'run-pressure' || action === 'run-measurements';
  if (visit.document !== 'desk' && !isExamination) return unchanged('document-needed');
  if (action === 'take-certificate') {
    if (visit.certificateTaken) return unchanged('certificate-taken');
    return changed({ clockMinutes: spend(ACTION_MINUTES.handling), visit: { ...visit, certificateTaken: true } }, 'certificate-taken');
  }
  const patient = patientForAppointment(visit);
  const examination = (id: ExaminationId, changes: Partial<Visit>, minutes: number, feedback: GameFeedback): ActionResult => {
    const entries: NoteEntryId[] = id === 'general' ? ['general', 'history']
      : id === 'pressure' ? (visit.pressureReadings.length === 0 ? ['pressure'] : visit.pressureReadings.length === 1 ? ['pressure-repeat'] : []) : [id];
    const noteOrder = [...visit.noteOrder, ...entries.filter(entry => !visit.noteOrder.includes(entry))];
    const updated = { ...visit, ...changes, noteOrder, examinationOrder: visit.examinationOrder.includes(id) ? [...visit.examinationOrder] : [...visit.examinationOrder, id] };
    return changed({ clockMinutes: spend(minutes), visit: updated, papers: recordResults(state.papers, updated, state.day) }, feedback);
  };
  if (action === 'run-general') {
    return examination('general', { generalTested: true }, ACTION_MINUTES.general, patient.general === 'pass' ? 'general-pass' : 'general-refer');
  }
  if (action === 'run-vision') {
    const feedback = patient.vision === 'pass' ? 'vision-pass' : 'vision-refer';
    return examination('vision', { visionTested: true }, ACTION_MINUTES.vision, feedback);
  }
  if (action === 'run-pressure') {
    const previous = visit.pressureLatest;
    const draw = previous ? randomStep(state.rngState) : null;
    const baseline = patient.pressureValues;
    // Stay near the case's established values: fluctuations never alter the
    // fictional fitness category, and consecutive measurements always differ.
    const candidates: PressureValues[] = [];
    for (let systolic = -3; systolic <= 3; systolic++) for (let diastolic = -2; diastolic <= 2; diastolic++) {
      const reading = { systolic: baseline.systolic + systolic, diastolic: baseline.diastolic + diastolic };
      if ((!previous || reading.systolic !== previous.systolic || reading.diastolic !== previous.diastolic)
        && disqualifyingPressure(reading) === (patient.pressure === 'refer')) candidates.push(reading);
    }
    const reading = draw ? candidates[Math.floor(draw.value * candidates.length)]! : { ...baseline };
    const feedback = patient.pressure === 'pass' ? 'pressure-pass' : 'pressure-refer';
    const result = examination('pressure', { pressureTested: true, pressureLatest: reading,
      pressureReadings: visit.pressureReadings.length < 2 ? [...visit.pressureReadings, reading] : visit.pressureReadings }, ACTION_MINUTES.pressure, feedback);
    return { ...result, state: { ...result.state, rngState: draw?.seed ?? state.rngState } };
  }
  if (action === 'run-measurements') {
    return examination('measurements', { measurementsTaken: true }, ACTION_MINUTES.measurements, 'measurements-taken');
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
  const certificateBundle = state.paperClips.find(group => group.includes('certificate')) ?? [];
  const handedResults = state.papers.filter(paper => paper.kind === 'additional-result'
    && paper.patientId === visit.patientId && paper.day >= visit.startedDay && certificateBundle.includes(paper.id));
  const resultMissing = visit.decision === 'fit' && visit.additionalResult !== null
    && additionalTestForJob(patient) !== null && !handedResults.some(paper => paper.kind === 'additional-result'
      && paper.test === additionalTestForJob(patient) && paper.test === visit.additionalResult!.test
      && paper.fit === visit.additionalResult!.fit);
  const handedIds = new Set<DocumentId>(['certificate', ...handedResults.map(paper => paper.id)]);
  const wrongDecision = visit.decision !== expectedVisitDecision(state);
  const requiredAdditional = workDayNumber(state.day) >= 7 ? additionalTestForPatient(patient) : null;
  const correct = hasRequiredExaminations(patient, visit) && (!requiredAdditional || visit.additionalResult?.test === requiredAdditional) && !wrongDecision;
  if (state.patientsProcessed === GAME_LIMITS.patients) return unchanged('limit-reached');
  const draw = wrongDecision ? randomStep(state.rngState) : null;
  // Guessing wrongly about an illegible seal is the ZUS authenticity offence,
  // including refusing a genuine referral whose patient otherwise qualifies.
  const authenticityMistake = wrongDecision && visit.decision === 'unfit' && workDayNumber(state.day) >= 5
    && visit.referral.seal === 'unclear' && visit.referral.authentic;
  const zusOffence = visit.decision === 'fit' || authenticityMistake;
  const undetected = zusOffence ? visit.bribe !== 'none' ? 0.7 : 0.35 : patient.managerial ? 0.03 : 0.25;
  const detected = wrongDecision && draw!.value >= undetected;
  const letterCount = Number(detected) + Number(resultMissing);
  if (state.papers.length - handedResults.length + letterCount > GAME_LIMITS.papers
    || state.nextPaperId + letterCount > GAME_LIMITS.paperId + 1) return unchanged('limit-reached');
  let daily = state.daily, insuranceRate = state.insuranceRate;
  if (detected && zusOffence) {
    daily = { ...daily, zusCases: daily.zusCases + 1, fines: daily.fines + (daily.zusCases === 0 ? 100 : 400) };
  }
  if ((detected && !zusOffence) || resultMissing) {
    const increase = insuranceRate === BASE_INSURANCE ? 50 : 100;
    if (insuranceRate > GAME_LIMITS.money - increase) return unchanged('limit-reached');
    insuranceRate += increase;
    daily = { ...daily, refusals: daily.refusals + 1, insuranceIncrease: daily.insuranceIncrease + increase };
  }
  const completion: Partial<GameState> = {
    ending: visit.bribe === 'accepted' && visit.decision === 'unfit' ? 'assault-pending' : state.ending,
    visit: null,
    shiftCompleted: state.shiftCompleted + 1,
    clockMinutes: spend(ACTION_MINUTES.handling),
    patientsProcessed: state.patientsProcessed + 1,
    rngState: draw?.seed ?? state.rngState, daily, insuranceRate,
    paperClips: state.paperClips.map(group => group.filter(id => !handedIds.has(id))).filter(group => group.length > 0),
  };
  const letters: Paper[] = [];
  if (detected) letters.push({ id: state.nextPaperId, kind: 'letter', patientId: visit.patientId, day: state.day,
    location: 'desk', sender: zusOffence ? 'zus' : 'employer', opened: false });
  if (resultMissing) letters.push({ id: state.nextPaperId + letters.length, kind: 'letter', patientId: visit.patientId,
    day: state.day, location: 'desk', sender: 'employer', reason: 'missing-result', opened: false });
  const completed = changed({ ...completion,
    papers: recordResults([...state.papers.filter(paper => !handedIds.has(paper.id)), ...letters], visit, state.day),
    nextPaperId: state.nextPaperId + letterCount,
  }, letterCount ? 'patient-error' : correct ? 'patient-cleared' : 'patient-completed');
  // Finishing the last visit closes the shift immediately; the view can still
  // animate the departing patient before presenting this settled home state.
  if (canEndDay(completed.state)) {
    const home = applyAction(completed.state, 'end-day');
    if (home.feedback === 'limit-reached') return unchanged('limit-reached');
    return { state: home.state, feedback: completed.feedback };
  }
  return completed;
}
