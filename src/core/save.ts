import { gameDate, isWeekend } from './calendar';
import { ADDITIONAL_TESTS, additionalNoteEntry, additionalNoteResult, additionalResultFor, additionalTestForJob, nextWorkingDay, type AdditionalTest, type AdditionalResult, type PendingReferral } from './additional-tests';
import { Gunzip, gzipSync, strToU8 } from 'fflate';
import { ARRIVAL_MINUTES, CLINIC_CLOSE_MINUTES, createInitialState, GAME_LIMITS, INTRO_SLIDES, PATIENTS, SHIFT_END_MINUTES, SHIFT_START_MINUTES, type GameState as LatestGameState, type Visit as CurrentVisit, type Paper as CurrentPaper, type DocumentId, type NoteEntryId } from './game';

import { CHARACTER_COUNT, JOBS, compatiblePressureReading, type ExaminationId, type PressureValues, type PatientCase } from './patients';
import { defaultReferral, directiveForDay, emptyCalls, effectivePatient, employerPhone, specialistPhone, workDayNumber, type ReferralDetails, type SpecialistCertificate, type PhoneConclusions } from './progression';
import { BASE_INSURANCE, BASE_PAY, MODEST_WEEKEND_LIVING, PATIENT_BONUS, type DaySettlement as CurrentSettlement, type DailyConsequences } from './economy';

export { createInitialState } from './game';
export type { GameState } from './game';

/** Freeze the pre-progression schema so legacy validators keep exact bounds. */
type CurrentGameState = Omit<LatestGameState, 'portraitHistory'>;
type VisitV18 = Omit<CurrentVisit, 'startedDay' | 'additionalResult' | 'additionalTests'>;
type PaperV24 = Exclude<CurrentPaper, { kind: 'inspection-id' | 'inspection-fine' }>;
type StateV25 = Omit<CurrentGameState, 'banknotes'>;
type StateV24 = Omit<StateV25, 'recentVisits' | 'inspection' | 'inspectionCheckedAt' | 'inspectionFines' | 'papers'> & { papers: PaperV24[] };
type PaperV18 = Exclude<PaperV24, { kind: 'additional-referral' | 'additional-result' }>;
type DaySettlement = Omit<CurrentSettlement, 'bribeIncome'>;
type StateV23 = Omit<StateV24, 'bribeIncome' | 'settlement' | 'budgetHistory'> & { settlement: DaySettlement | null; budgetHistory: DaySettlement[] };
type StateV19 = Omit<StateV23, 'budgetHistory'>;
type StateV18 = Omit<StateV19, 'pendingReferrals' | 'referralsIssued' | 'visit' | 'papers'> & { visit: VisitV18 | null; papers: PaperV18[] };
type Visit = Omit<VisitV18, 'referral' | 'specialist' | 'specialistTaken' | 'calls' | 'bribe' | 'noteOrder'>;
type HistoricalPaper<T> = T extends { kind: 'note' } ? Omit<T, 'calls' | 'bribe' | 'noteOrder'>
  : T extends { kind: 'referral' } ? Omit<T, 'details'>
  : T extends { kind: 'letter' } ? T : never;
type Paper = HistoricalPaper<PaperV18>;
type GameState = Omit<StateV18, 'ending' | 'visit' | 'papers'> & { visit: Visit | null; papers: Paper[] };

type PreJournalVisit = Omit<VisitV18, 'noteOrder'>;
type PreJournalPaper = PaperV18 extends infer T ? T extends { kind: 'note' } ? Omit<T, 'noteOrder'> : T : never;
type PreJournalState = Omit<StateV18, 'visit' | 'papers'> & { visit: PreJournalVisit | null; papers: PreJournalPaper[] };

interface LegacyState {
  day: number;
  money: number;
  patientsProcessed: number;
}

const SHIFT_LENGTH = 3; // Original version 2–8 fixture limit never changes.
const V10_CASE_LIMIT = 302;
const V12_CASE_LIMIT = 327;
const V14_CASE_LIMIT = 552;
const V18_CASE_LIMIT = 2502;
const V18_CHARACTER_COUNT = 78;
const V27_CASE_LIMIT = 3377;
const V27_CHARACTER_COUNT = 113;
const V28_CASE_LIMIT = 4002;
const V28_CHARACTER_COUNT = 138;
interface InspectionValidation { fines: number; catalogCharacters: number }
interface ReferralValidation { inspection?: InspectionValidation; catalogCharacters?: number; pendingIds: Set<number>; referralsIssued: number; startedDay?: number; partialRoster?: boolean; resultAttachments?: boolean }
const V12_CHARACTER_COUNT = 53;
type VisitV10 = Omit<Visit, 'generalTested' | 'examinationOrder' | 'pressureReadings' | 'pressureLatest'>;
interface NoteResultsV10 {
  vision: 'pass' | 'refer' | null;
  pressure: 'pass' | 'refer' | null;
  weight: number | null;
  height: number | null;
}
type OldPaper<T> = T extends { kind: 'note' } ? Omit<T, 'results' | 'examinationOrder'> & { results: NoteResultsV10 } : T;
type PaperV10 = OldPaper<Paper>;
type GameStateV10 = Omit<GameState, 'visit' | 'papers'> & { visit: VisitV10 | null; papers: PaperV10[] };
type GameStateV8 = Omit<GameStateV10, 'phase' | 'rngState' | 'roster' | 'insuranceRate' | 'daily' | 'settlement' | 'previousMonthBalance'> & { phase: 'intro' | 'cabinet' };
type LegacyVisit = Omit<VisitV10, 'measurementsTaken' | 'certificateTaken' | 'certificateNamed'>;
type AppointmentState = Omit<GameStateV8, 'papers' | 'nextPaperId' | 'paperClips' | 'visit' | 'drawerItems'> & { visit: LegacyVisit | null };
type LegacyPaper<T> = T extends PaperV10 ? Omit<T, 'additionalWritten'> & { clipped: boolean } : never;
type PaperV6 = LegacyPaper<PaperV10>;
type VisitV5 = Omit<VisitV10, 'certificateTaken' | 'certificateNamed'>;
type GameStateV5 = Omit<GameStateV8, 'visit' | 'paperClips' | 'papers' | 'drawerItems'> & { visit: VisitV5 | null; papers: PaperV6[] };
type GameStateV6 = Omit<GameStateV5, 'visit'> & { visit: Omit<VisitV10, 'certificateNamed'> | null };
type GameStateV7 = Omit<GameStateV8, 'drawerItems'>;

interface SaveV30 {
  game: 'next-please';
  version: 30;
  savedAt: string;
  state: LatestGameState;
}

export type SaveErrorCode =
  | 'file-too-large'
  | 'invalid-file'
  | 'unsupported-version'
  | 'invalid-state'
  | 'read-failed';

/** Codes, rather than these developer messages, are translated by the UI. */
export class SaveError extends Error {
  readonly code: SaveErrorCode;

  constructor(code: SaveErrorCode) {
    super(`Save error: ${code}`);
    this.name = 'SaveError';
    this.code = code;
  }
}

export const MAX_SAVE_BYTES = 1024 * 1024;
export const MAX_EXPANDED_SAVE_BYTES = 2 * 1024 * 1024;
// Version 2 records the original six-card introduction. Its bounds must stay
// fixed even when the current introduction changes.
const V2_INTRO_LAST_STEP = 5;
const V3_INTRO_LAST_STEP = 3;
// Legacy two-hour slots remain fixed for validating old files.
const LEGACY_APPOINTMENT_MINUTES = 120;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function validateStateV1(value: unknown): LegacyState {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['day', 'money', 'patientsProcessed']) ||
    !isIntegerInRange(value.day, 1, 1_000_000) ||
    !isIntegerInRange(value.money, -1_000_000_000, 1_000_000_000) ||
    !isIntegerInRange(value.patientsProcessed, 0, 1_000_000_000)
  ) {
    throw new SaveError('invalid-state');
  }

  // Copy known fields instead of allowing imported objects into live game state.
  return { day: value.day, money: value.money, patientsProcessed: value.patientsProcessed };
}

function validateAppointmentState(value: unknown, introLastStep: number, allowUntestedDecision: boolean, actionClock = false): AppointmentState {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['day', 'money', 'patientsProcessed', 'phase', 'introStep', 'shiftCompleted', 'clockMinutes', 'visit', 'lampOn', 'decoration']) ||
    !isIntegerInRange(value.day, 1, GAME_LIMITS.day) ||
    !isIntegerInRange(value.money, -GAME_LIMITS.money, GAME_LIMITS.money) ||
    !isIntegerInRange(value.patientsProcessed, 0, GAME_LIMITS.patients) ||
    (value.phase !== 'intro' && value.phase !== 'cabinet') ||
    !isIntegerInRange(value.introStep, 0, introLastStep) ||
    !isIntegerInRange(value.shiftCompleted, 0, SHIFT_LENGTH) ||
    !isIntegerInRange(value.clockMinutes, ARRIVAL_MINUTES, SHIFT_END_MINUTES) ||
    value.shiftCompleted > value.patientsProcessed ||
    typeof value.lampOn !== 'boolean' ||
    (value.decoration !== 'plant' && value.decoration !== 'certificate') ||
    (value.phase === 'intro' && (value.visit !== null || value.shiftCompleted !== 0)) ||
    (value.phase === 'cabinet' && value.introStep !== introLastStep)
  ) {
    throw new SaveError('invalid-state');
  }

  let visit: LegacyVisit | null = null;
  if (value.visit !== null) {
    const entry = value.visit;
    if (
      !isRecord(entry) ||
      !hasOnlyKeys(entry, ['patientId', 'document', 'visionTested', 'pressureTested', 'decision']) ||
      !isIntegerInRange(entry.patientId, 0, SHIFT_LENGTH - 1) ||
      entry.patientId !== value.shiftCompleted ||
      (entry.document !== 'tray' && entry.document !== 'desk') ||
      typeof entry.visionTested !== 'boolean' || typeof entry.pressureTested !== 'boolean' ||
      (entry.decision !== null && entry.decision !== 'fit' && entry.decision !== 'unfit') ||
      (entry.document === 'tray' && (entry.visionTested || entry.pressureTested || entry.decision !== null)) ||
      (!allowUntestedDecision && entry.decision !== null && (!entry.visionTested || !entry.pressureTested))
    ) {
      throw new SaveError('invalid-state');
    }
    visit = {
      patientId: entry.patientId, document: entry.document,
      visionTested: entry.visionTested, pressureTested: entry.pressureTested, decision: entry.decision,
    };
  }

  if (actionClock) {
    // Handling and repeated work can spend additional minutes at every stage.
    // Require the minimum work represented by the state, rather than an exact
    // slot timestamp that would erase this history when importing.
    const minimumMinutes = value.phase === 'intro' ? ARRIVAL_MINUTES
      : visit === null
        ? (value.shiftCompleted === 0 ? ARRIVAL_MINUTES : SHIFT_START_MINUTES + value.shiftCompleted * 4 - 1)
        : SHIFT_START_MINUTES + value.shiftCompleted * 4 + (visit.document === 'desk' ? 1 : 0)
          + (visit.visionTested ? 3 : 0) + (visit.pressureTested ? 4 : 0) + (visit.decision !== null ? 1 : 0);
    if (value.clockMinutes < minimumMinutes || (value.phase === 'intro' && value.clockMinutes !== ARRIVAL_MINUTES)) {
      throw new SaveError('invalid-state');
    }
  } else {
    // Preserve v2/v3's exact slot invariant before migrating their clocks.
    const slotStart = SHIFT_START_MINUTES + LEGACY_APPOINTMENT_MINUTES * value.shiftCompleted;
    const expectedMinutes = visit === null
      ? (value.shiftCompleted === 0 ? ARRIVAL_MINUTES : slotStart)
      : slotStart + (visit.document === 'desk' ? 10 : 0)
        + (visit.visionTested ? 35 : 0) + (visit.pressureTested ? 35 : 0) + (visit.decision !== null ? 10 : 0);
    if (value.clockMinutes !== expectedMinutes) throw new SaveError('invalid-state');
  }
  return {
    day: value.day, money: value.money, patientsProcessed: value.patientsProcessed,
    phase: value.phase, introStep: value.introStep, shiftCompleted: value.shiftCompleted, clockMinutes: value.clockMinutes,
    visit, lampOn: value.lampOn, decoration: value.decoration,
  };
}

function validateStateV2(value: unknown): AppointmentState {
  return validateAppointmentState(value, V2_INTRO_LAST_STEP, false);
}

function migrateStateV2(state: AppointmentState): AppointmentState {
  return {
    ...state,
    phase: state.phase === 'intro' && state.introStep < INTRO_SLIDES ? 'intro' : 'cabinet',
    introStep: Math.min(state.introStep, INTRO_SLIDES - 1),
  };
}

function validateStateV3(value: unknown): AppointmentState {
  // A stamp can be applied before examinations. The existing fields represent
  // this decision directly; keep v2's original examination gate for old saves.
  return validateAppointmentState(value, V3_INTRO_LAST_STEP, true);
}

function validateStateV4(value: unknown): AppointmentState {
  return validateAppointmentState(value, INTRO_SLIDES - 1, true, true);
}

function migrateStateV3(state: AppointmentState): AppointmentState {
  // Preserve the patient's progress and recorded time; subsequent actions use
  // the short costs. Old saves are never silently rewound to a new clock.
  return validateStateV4(state);
}

function migrateStateV4(state: AppointmentState): GameStateV5 {
  const papers: PaperV6[] = state.visit?.document === 'desk'
    ? [{ id: 1, kind: 'referral', patientId: state.visit.patientId, day: state.day, location: 'desk', clipped: false }]
    : [];
  return { ...state, visit: state.visit ? { ...state.visit, measurementsTaken: false } : null, papers, nextPaperId: papers.length + 1 };
}

function validatePaper(value: unknown, day: number, maxPatient = SHIFT_LENGTH - 1): PaperV6 {
  if (!isRecord(value) || !isIntegerInRange(value.id, 1, GAME_LIMITS.paperId)
    || !isIntegerInRange(value.day, 1, day) || (value.location !== 'desk' && value.location !== 'drawer')
    || typeof value.clipped !== 'boolean') throw new SaveError('invalid-state');
  const common = { id: value.id, day: value.day, location: value.location, clipped: value.clipped } as const;
  const commonKeys = ['id', 'kind', 'day', 'patientId', 'location', 'clipped'];
  if (value.kind === 'note') {
    const results = value.results;
    if (!hasOnlyKeys(value, [...commonKeys, 'results']) || !isRecord(results)
      || !hasOnlyKeys(results, ['vision', 'pressure', 'weight', 'height'])
      || (value.patientId !== null && !isIntegerInRange(value.patientId, 0, maxPatient))) throw new SaveError('invalid-state');
    const patient = value.patientId === null ? null : PATIENTS[value.patientId]!;
    if ((results.vision !== null && (!patient || results.vision !== patient.vision))
      || (results.pressure !== null && (!patient || results.pressure !== patient.pressure))
      || (results.weight !== null && (!patient || results.weight !== patient.weight))
      || (results.height !== null && (!patient || results.height !== patient.height))
      || ((results.weight === null) !== (results.height === null))
      || (patient !== null && Object.values(results).every(entry => entry === null))) throw new SaveError('invalid-state');
    return { ...common, kind: 'note', patientId: value.patientId, results: {
      vision: results.vision as 'pass' | 'refer' | null, pressure: results.pressure as 'pass' | 'refer' | null,
      weight: results.weight as number | null, height: results.height as number | null,
    } };
  }
  if (!isIntegerInRange(value.patientId, 0, maxPatient)) throw new SaveError('invalid-state');
  if (value.kind === 'referral' && hasOnlyKeys(value, commonKeys)) return { ...common, kind: 'referral', patientId: value.patientId };
  if (value.kind === 'letter' && hasOnlyKeys(value, [...commonKeys, 'sender', 'opened'])
    && typeof value.opened === 'boolean'
    && (value.sender === 'zus' || value.sender === 'employer')
    && value.sender === (PATIENTS[value.patientId]!.expectedDecision === 'fit' ? 'employer' : 'zus')) {
    return { ...common, kind: 'letter', patientId: value.patientId, sender: value.sender, opened: value.opened };
  }
  throw new SaveError('invalid-state');
}

function validateStateV5(value: unknown): GameStateV5 {
  if (!isRecord(value) || !hasOnlyKeys(value, ['day', 'money', 'patientsProcessed', 'phase', 'introStep', 'shiftCompleted', 'clockMinutes', 'visit', 'lampOn', 'decoration', 'papers', 'nextPaperId'])
    || !Array.isArray(value.papers) || value.papers.length > GAME_LIMITS.papers
    || !isIntegerInRange(value.nextPaperId, 1, GAME_LIMITS.paperId + 1)) throw new SaveError('invalid-state');
  let measurementsTaken = false;
  let legacyVisit: unknown = null;
  if (value.visit !== null) {
    if (!isRecord(value.visit) || !hasOnlyKeys(value.visit, ['patientId', 'document', 'visionTested', 'pressureTested', 'measurementsTaken', 'decision'])
      || typeof value.visit.measurementsTaken !== 'boolean'
      || (value.visit.document === 'tray' && value.visit.measurementsTaken)) throw new SaveError('invalid-state');
    const { measurementsTaken: measured, ...rest } = value.visit;
    measurementsTaken = measured; legacyVisit = rest;
  }
  const { papers: rawPapers, nextPaperId, ...base } = value;
  const state = validateStateV4({ ...base, visit: legacyVisit });
  if (measurementsTaken && state.visit) {
    const minimum = SHIFT_START_MINUTES + state.shiftCompleted * 4 + 1
      + (state.visit.visionTested ? 3 : 0) + (state.visit.pressureTested ? 4 : 0) + 2 + (state.visit.decision !== null ? 1 : 0);
    if (state.clockMinutes < minimum) throw new SaveError('invalid-state');
  }
  const papers = rawPapers.map(entry => validatePaper(entry, state.day));
  const seen = new Set<number>();
  const casePapers = new Set<string>();
  for (const paper of papers) {
    if (seen.has(paper.id) || paper.id >= nextPaperId) throw new SaveError('invalid-state');
    seen.add(paper.id);
    if (paper.kind !== 'note') {
      const key = `${paper.day}:${paper.patientId}:${paper.kind}`;
      if (casePapers.has(key)) throw new SaveError('invalid-state');
      casePapers.add(key);
    }
    if (paper.day === state.day && paper.patientId !== null) {
      if (paper.patientId > state.shiftCompleted
        || (paper.patientId === state.shiftCompleted && (paper.kind === 'letter' || !state.visit || state.visit.document !== 'desk')))
        throw new SaveError('invalid-state');
      if (paper.kind === 'note' && paper.patientId === state.visit?.patientId) {
        if ((paper.results.vision !== null && !state.visit.visionTested)
          || (paper.results.pressure !== null && !state.visit.pressureTested)
          || (paper.results.weight !== null && !measurementsTaken)) throw new SaveError('invalid-state');
      }
    }
  }
  if (state.phase === 'intro' && (papers.length !== 0 || nextPaperId !== 1)) throw new SaveError('invalid-state');
  return { ...state, visit: state.visit ? { ...state.visit, measurementsTaken } : null, papers, nextPaperId };
}

function migrateStateV5(state: GameStateV5): GameStateV6 {
  // Before v6, taking a referral also made a certificate available. Preserve
  // that availability and any applied stamp without adding fictitious time.
  return { ...state, visit: state.visit ? { ...state.visit, certificateTaken: state.visit.document === 'desk' } : null };
}

function validateStateV6(value: unknown): GameStateV6 {
  if (!isRecord(value)) throw new SaveError('invalid-state');
  let certificateTaken = false;
  let visit: unknown = null;
  if (value.visit !== null) {
    if (!isRecord(value.visit)
      || !hasOnlyKeys(value.visit, ['patientId', 'document', 'certificateTaken', 'visionTested', 'pressureTested', 'measurementsTaken', 'decision'])
      || typeof value.visit.certificateTaken !== 'boolean'
      || (value.visit.document === 'tray' && value.visit.certificateTaken)
      || (value.visit.decision !== null && !value.visit.certificateTaken)) throw new SaveError('invalid-state');
    const { certificateTaken: taken, ...previous } = value.visit;
    certificateTaken = taken; visit = previous;
  }
  // Keep v5's minimum clock: migrated desk visits already had certificates,
  // and no additional provenance flag is needed merely to validate their time.
  const state = validateStateV5({ ...value, visit });
  return { ...state, visit: state.visit ? { ...state.visit, certificateTaken } : null };
}

function migrateStateV6(state: GameStateV6): GameStateV7 {
  return {
    ...state,
    visit: state.visit ? { ...state.visit, certificateNamed: state.visit.certificateTaken } : null,
    papers: state.papers.map(({ clipped: _clipped, ...paper }) => paper.kind === 'note' ? { ...paper, additionalWritten: false } : paper),
    paperClips: state.papers.filter(paper => paper.clipped).map(paper => [paper.id]),
  };
}

function validatePaperV7(value: unknown, day: number, maxPatient = SHIFT_LENGTH - 1): PaperV10 {
  if (!isRecord(value)) throw new SaveError('invalid-state');
  if (value.kind !== 'note') {
    if (Object.hasOwn(value, 'clipped')) throw new SaveError('invalid-state');
    const { clipped: _clipped, ...paper } = validatePaper({ ...value, clipped: false }, day, maxPatient);
    if (paper.kind === 'note') throw new SaveError('invalid-state');
    return paper;
  }
  if (!hasOnlyKeys(value, ['id', 'kind', 'day', 'patientId', 'location', 'results', 'additionalWritten'])
    || !isIntegerInRange(value.id, 1, GAME_LIMITS.paperId) || !isIntegerInRange(value.day, 1, day)
    || (value.location !== 'desk' && value.location !== 'drawer') || typeof value.additionalWritten !== 'boolean'
    || (value.patientId !== null && !isIntegerInRange(value.patientId, 0, maxPatient))) throw new SaveError('invalid-state');
  const results = value.results;
  if (!isRecord(results) || !hasOnlyKeys(results, ['vision', 'pressure', 'weight', 'height'])) throw new SaveError('invalid-state');
  const patient = value.patientId === null ? null : PATIENTS[value.patientId]!;
  if ((results.vision !== null && (!patient || results.vision !== patient.vision))
    || (results.pressure !== null && (!patient || results.pressure !== patient.pressure))
    || (results.weight !== null && (!patient || results.weight !== patient.weight))
    || (results.height !== null && (!patient || results.height !== patient.height))
    || ((results.weight === null) !== (results.height === null))
    || (!patient && value.additionalWritten)
    || (patient && !value.additionalWritten && Object.values(results).every(entry => entry === null))) throw new SaveError('invalid-state');
  return { id: value.id, kind: 'note', day: value.day, patientId: value.patientId, location: value.location, additionalWritten: value.additionalWritten,
    results: { vision: results.vision as 'pass' | 'refer' | null, pressure: results.pressure as 'pass' | 'refer' | null,
      weight: results.weight as number | null, height: results.height as number | null } };
}

function validateStateV7(value: unknown): GameStateV7 {
  if (!isRecord(value) || !hasOnlyKeys(value, ['day', 'money', 'patientsProcessed', 'phase', 'introStep', 'shiftCompleted', 'clockMinutes', 'visit', 'lampOn', 'decoration', 'papers', 'nextPaperId', 'paperClips'])
    || !Array.isArray(value.papers) || value.papers.length > GAME_LIMITS.papers
    || !isIntegerInRange(value.nextPaperId, 1, GAME_LIMITS.paperId + 1)
    || !Array.isArray(value.paperClips) || value.paperClips.length > value.papers.length + 1) throw new SaveError('invalid-state');
  let certificateNamed = false;
  let visit: unknown = null;
  if (value.visit !== null) {
    if (!isRecord(value.visit) || typeof value.visit.certificateNamed !== 'boolean'
      || (value.visit.certificateNamed && !value.visit.certificateTaken)) throw new SaveError('invalid-state');
    const { certificateNamed: named, ...previous } = value.visit;
    certificateNamed = named; visit = previous;
  }
  // The unchanged v6 validator checks the appointment and clock. Current papers
  // are validated below against their own exact schema, never reinterpreted as v6.
  const { paperClips: rawClips, papers: rawPapers, nextPaperId, ...base } = value;
  const previous = validateStateV6({ ...base, visit, papers: [], nextPaperId: 1 });
  const papers = rawPapers.map(paper => validatePaperV7(paper, previous.day));
  const seen = new Set<number>(), casePapers = new Set<string>();
  for (const paper of papers) {
    if (seen.has(paper.id) || paper.id >= nextPaperId) throw new SaveError('invalid-state');
    seen.add(paper.id);
    if (paper.kind !== 'note') {
      const key = `${paper.day}:${paper.patientId}:${paper.kind}`;
      if (casePapers.has(key)) throw new SaveError('invalid-state');
      casePapers.add(key);
    }
    if (paper.day === previous.day && paper.patientId !== null) {
      if (paper.patientId > previous.shiftCompleted
        || (paper.patientId === previous.shiftCompleted && (paper.kind === 'letter' || !previous.visit || previous.visit.document !== 'desk'))) throw new SaveError('invalid-state');
      if (paper.kind === 'note' && paper.patientId === previous.visit?.patientId
        && ((paper.results.vision !== null && !previous.visit.visionTested)
          || (paper.results.pressure !== null && !previous.visit.pressureTested)
          || (paper.results.weight !== null && !previous.visit.measurementsTaken))) throw new SaveError('invalid-state');
    }
  }
  const clipped = new Set<DocumentId>();
  const paperClips: DocumentId[][] = rawClips.map(rawGroup => {
    if (!Array.isArray(rawGroup) || rawGroup.length === 0 || rawGroup.length > papers.length + 1) throw new SaveError('invalid-state');
    let location: Paper['location'] | undefined;
    return rawGroup.map((id: unknown): DocumentId => {
      if (id !== 'certificate' && !isIntegerInRange(id, 1, GAME_LIMITS.paperId)) throw new SaveError('invalid-state');
      if (clipped.has(id)) throw new SaveError('invalid-state');
      clipped.add(id);
      const itemLocation = id === 'certificate' ? (previous.visit?.certificateTaken ? 'desk' : undefined) : papers.find(paper => paper.id === id)?.location;
      if (!itemLocation || (location && location !== itemLocation)) throw new SaveError('invalid-state');
      location = itemLocation;
      return id;
    });
  });
  if (previous.phase === 'intro' && (papers.length || nextPaperId !== 1 || paperClips.length)) throw new SaveError('invalid-state');
  return { ...previous, visit: previous.visit ? { ...previous.visit, certificateNamed } : null, papers, nextPaperId, paperClips };
}

function migrateStateV7(state: GameStateV7): GameStateV8 {
  return { ...state, drawerItems: { manual: false, clips: 0 } };
}

function validateStateV8(value: unknown): GameStateV8 {
  if (!isRecord(value) || !isRecord(value.drawerItems)
    || !hasOnlyKeys(value.drawerItems, ['manual', 'clips'])
    || typeof value.drawerItems.manual !== 'boolean'
    || !isIntegerInRange(value.drawerItems.clips, 0, GAME_LIMITS.drawerClips)) throw new SaveError('invalid-state');
  const manual = value.drawerItems.manual, clips = value.drawerItems.clips;
  const { drawerItems: _drawerItems, ...base } = value;
  // Preserve v7's exact schemas and invariants before validating the new inventory.
  const state = validateStateV7(base);
  if (state.phase === 'intro' && (manual || clips !== 0)) throw new SaveError('invalid-state');
  return { ...state, drawerItems: { manual, clips } };
}

/** Frozen original queue: legacy appointments retain their original positions. */
function legacyInitialState(): GameState {
  const { portraitHistory: _portraits, banknotes: _banknotes, recentVisits: _recent, inspection: _inspection, inspectionCheckedAt: _checked, inspectionFines: _fines, bribeIncome: _bribes, settlement: _settlement, budgetHistory: _history, pendingReferrals: _pending, referralsIssued: _issued, ...initial } = createInitialState(0x4e505301);
  return { ...initial, settlement: null, visit: null, papers: [], rngState: 3477621340,
    roster: [0, 1, 2, 62, 49, 75, 81, 66, 98, 4, 67, 43, 34, 28, 42, 58, 15, 21, 89, 26, 93, 52, 100, 8, 72, 86, 14, 38] };
}

function migrateStateV8(state: GameStateV8): GameStateV10 {
  // Historical counters and papers remain intact. No salary or penalties are
  // invented for already completed appointments; the current day settles once.
  return { ...legacyInitialState(), ...state };
}

/** Shared ledger checks for the current settlement and the saved weekend history. */
function validateSettlement(entry: unknown, day: number, patients: number, money: number,
  insuranceRate: number, fines: number, restDay: boolean, weekendBudgets: boolean, weekendDebt = false): DaySettlement {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  const basePay = restDay ? 0 : BASE_PAY;
  let weekend: DaySettlement['weekend'] = null;
  if (weekendBudgets && isRecord(entry) && entry.weekend !== null) {
    if (!restDay || !isRecord(entry.weekend) || !hasOnlyKeys(entry.weekend, ['modest', 'sundayLivingCost'])
      || typeof entry.weekend.modest !== 'boolean'
      || !isIntegerInRange(entry.weekend.sundayLivingCost, 0, 800)) return fail();
    weekend = { modest: entry.weekend.modest, sundayLivingCost: entry.weekend.sundayLivingCost };
  }
  const insuranceCost = weekend ? 0 : insuranceRate;
  if (!isRecord(entry)
    || !hasOnlyKeys(entry, ['day', 'patients', 'basePay', 'patientBonus', 'income', 'livingCost', 'insuranceCost', 'fines', 'event', 'expenses', 'openingBalance', 'closingBalance', ...(weekendBudgets ? ['weekend'] : [])])
    || entry.day !== day || entry.patients !== patients || entry.basePay !== basePay
    || entry.patientBonus !== patients * PATIENT_BONUS || entry.income !== basePay + patients * PATIENT_BONUS
    || !isIntegerInRange(entry.livingCost, weekend ? 0 : 400, 800) || entry.insuranceCost !== insuranceCost || entry.fines !== fines
    || !isIntegerInRange(entry.openingBalance, -GAME_LIMITS.money, GAME_LIMITS.money) || entry.closingBalance !== money) return fail();
  if (weekend) {
    if ((!(weekendDebt && weekend.modest) && entry.livingCost + weekend.sundayLivingCost > Math.max(0, entry.openingBalance))
      || (weekend.modest && entry.livingCost > 200)
      || (gameDate(day).weekday === 0 && weekend.sundayLivingCost !== 0)) return fail();
    if (gameDate(day).weekday === 6) {
      const ordinary = entry.livingCost >= 400 && weekend.sundayLivingCost >= 400;
      const modest = entry.livingCost <= 200 && weekend.sundayLivingCost <= 200
        && [entry.livingCost, entry.livingCost + 1].includes(weekend.sundayLivingCost);
      if (weekend.modest ? !modest : !ordinary) return fail();
    }
  }
  let event: DaySettlement['event'] = null;
  const available = entry.openingBalance + (entry.income as number) - entry.livingCost - insuranceCost - fines;
  if (entry.event !== null) {
    if (!isRecord(entry.event) || !hasOnlyKeys(entry.event, ['kind', 'cost'])
      || (entry.event.kind !== 'medicine' && entry.event.kind !== 'car-repair' && entry.event.kind !== 'home-repair' && entry.event.kind !== 'fur-coat' && !(restDay && (entry.event.kind === 'mountain-trip' || entry.event.kind === 'seaside-trip')))
      || available <= 2000 || !isIntegerInRange(entry.event.cost, 200, Math.min(available - (weekend?.sundayLivingCost ?? 0), 700 + Math.floor((available - 2000) * 0.75)))) return fail();
    event = { kind: entry.event.kind, cost: entry.event.cost };
  }
  const expenses = entry.livingCost + insuranceCost + fines + (event?.cost ?? 0);
  if (entry.expenses !== expenses || entry.closingBalance !== entry.openingBalance + (entry.income as number) - expenses) return fail();
  return { day, patients, basePay, patientBonus: patients * PATIENT_BONUS,
    income: basePay + patients * PATIENT_BONUS, livingCost: entry.livingCost, insuranceCost,
    fines, event, expenses, openingBalance: entry.openingBalance, closingBalance: money, weekend };
}

function validateBudgetState(value: unknown, version: 9 | 10, maxPatient = V10_CASE_LIMIT, overtime = false, maxCharacters = V12_CHARACTER_COUNT, weekendBudgets = false, referralState?: ReferralValidation, weekendDebt = false): GameStateV10 {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !hasOnlyKeys(value, ['day', 'money', 'patientsProcessed', 'phase', 'introStep', 'shiftCompleted', 'clockMinutes', 'visit', 'lampOn', 'decoration', 'papers', 'nextPaperId', 'paperClips', 'drawerItems', 'rngState', 'roster', 'insuranceRate', 'daily', 'settlement', ...(version === 10 ? ['previousMonthBalance'] : [])])) return fail();
  if (!isIntegerInRange(value.day, 1, GAME_LIMITS.day) || !isIntegerInRange(value.money, -GAME_LIMITS.money, GAME_LIMITS.money)
    || !isIntegerInRange(value.patientsProcessed, 0, GAME_LIMITS.patients)
    || (value.phase !== 'intro' && value.phase !== 'cabinet' && value.phase !== 'home')
    || !isIntegerInRange(value.introStep, 0, INTRO_SLIDES - 1)
    || (value.phase !== 'intro' && value.introStep !== INTRO_SLIDES - 1)
    || !isIntegerInRange(value.shiftCompleted, 0, maxCharacters) || value.shiftCompleted > value.patientsProcessed
    || !isIntegerInRange(value.clockMinutes, ARRIVAL_MINUTES, overtime ? CLINIC_CLOSE_MINUTES : SHIFT_END_MINUTES)
    || (overtime && value.phase === 'cabinet' && value.clockMinutes === CLINIC_CLOSE_MINUTES)
    || !isIntegerInRange(value.rngState, 0, 0xffff_ffff)
    || !isIntegerInRange(value.insuranceRate, BASE_INSURANCE, GAME_LIMITS.money) || value.insuranceRate % 50 !== 0
    || typeof value.lampOn !== 'boolean' || (value.decoration !== 'plant' && value.decoration !== 'certificate')
    || !Array.isArray(value.roster) || !(referralState?.partialRoster ? value.roster.length <= maxCharacters
      : version === 9 ? value.roster.length === 28 : [0, 28, V12_CHARACTER_COUNT, V18_CHARACTER_COUNT, maxCharacters].includes(value.roster.length))) return fail();
  const restDay = version === 10 && value.roster.length === 0;
  const rosterLimit = value.roster.length;
  const caseLimit = referralState?.partialRoster ? maxPatient : rosterLimit === 28 ? 102 : rosterLimit === V12_CHARACTER_COUNT ? Math.min(V12_CASE_LIMIT, maxPatient) : maxPatient;
  if ((restDay && (value.phase !== 'home' || !isWeekend(value.day) || value.shiftCompleted !== 0))
    || value.shiftCompleted > value.roster.length
    || (version === 10 && !isIntegerInRange(value.previousMonthBalance, -GAME_LIMITS.money, GAME_LIMITS.money))) return fail();
  const characters = new Set<number>();
  const roster = value.roster.map((id: unknown): number => {
    if (!isIntegerInRange(id, 0, caseLimit)) return fail();
    const character = PATIENTS[id]!.characterId;
    if (characters.has(character) || character >= (referralState?.partialRoster ? maxCharacters : rosterLimit)) return fail();
    characters.add(character);
    return id;
  });
  let visit: VisitV10 | null = null;
  if (value.visit !== null) {
    const entry = value.visit;
    if (value.phase !== 'cabinet' || !isRecord(entry)
      || !hasOnlyKeys(entry, ['patientId', 'document', 'certificateTaken', 'certificateNamed', 'visionTested', 'pressureTested', 'measurementsTaken', 'decision'])
      || !isIntegerInRange(entry.patientId, 0, caseLimit) || entry.patientId !== roster[value.shiftCompleted]
      || (entry.document !== 'tray' && entry.document !== 'desk')
      || typeof entry.certificateTaken !== 'boolean' || typeof entry.certificateNamed !== 'boolean'
      || typeof entry.visionTested !== 'boolean' || typeof entry.pressureTested !== 'boolean' || typeof entry.measurementsTaken !== 'boolean'
      || (entry.decision !== null && entry.decision !== 'fit' && entry.decision !== 'unfit')
      || (entry.document === 'tray' && (entry.certificateTaken || entry.decision !== null
        || (!overtime && (entry.visionTested || entry.pressureTested || entry.measurementsTaken))))
      || (!entry.certificateTaken && (entry.certificateNamed || entry.decision !== null))) return fail();
    visit = { patientId: entry.patientId, document: entry.document, certificateTaken: entry.certificateTaken, certificateNamed: entry.certificateNamed,
      visionTested: entry.visionTested, pressureTested: entry.pressureTested, measurementsTaken: entry.measurementsTaken, decision: entry.decision };
  }
  const minimum = visit && referralState?.startedDay !== undefined && referralState.startedDay < value.day ? SHIFT_START_MINUTES
    : visit ? SHIFT_START_MINUTES + value.shiftCompleted * 4 + (visit.document === 'desk' ? 1 : 0)
    + (visit.visionTested ? 3 : 0) + (visit.pressureTested ? 4 : 0) + (visit.measurementsTaken ? 2 : 0) + (visit.decision ? 1 : 0)
    : value.shiftCompleted ? SHIFT_START_MINUTES + value.shiftCompleted * 4 - 1 : ARRIVAL_MINUTES;
  if (value.clockMinutes < Math.min(SHIFT_END_MINUTES, minimum)) return fail();
  const maxConsequences = value.shiftCompleted + (referralState?.referralsIssued ?? 0);
  const rawDaily = value.daily;
  if (!isRecord(rawDaily) || !hasOnlyKeys(rawDaily, ['zusCases', 'refusals', 'fines', 'insuranceIncrease'])
    || !isIntegerInRange(rawDaily.zusCases, 0, maxConsequences) || !isIntegerInRange(rawDaily.refusals, 0, value.shiftCompleted)
    || rawDaily.zusCases + rawDaily.refusals > maxConsequences + (referralState?.resultAttachments && workDayNumber(value.day) >= 7 ? value.shiftCompleted : 0)
    || rawDaily.fines !== (rawDaily.zusCases ? 100 + (rawDaily.zusCases - 1) * 400 : 0) + (referralState?.inspection?.fines ?? 0)
    || !isIntegerInRange(rawDaily.insuranceIncrease, 0, maxCharacters * 100)
    || (rawDaily.refusals === 0 ? rawDaily.insuranceIncrease !== 0
      : rawDaily.insuranceIncrease !== rawDaily.refusals * 100 && rawDaily.insuranceIncrease !== rawDaily.refusals * 100 - 50)
    || value.insuranceRate < BASE_INSURANCE + rawDaily.insuranceIncrease) return fail();
  if (rawDaily.refusals > 0 && rawDaily.insuranceIncrease === rawDaily.refusals * 100 - 50 && value.insuranceRate !== BASE_INSURANCE + rawDaily.insuranceIncrease) return fail();
  if (rawDaily.refusals > 0 && rawDaily.insuranceIncrease === rawDaily.refusals * 100 && value.insuranceRate <= BASE_INSURANCE + rawDaily.insuranceIncrease) return fail();
  const daily: DailyConsequences = { zusCases: rawDaily.zusCases, refusals: rawDaily.refusals, fines: rawDaily.fines as number, insuranceIncrease: rawDaily.insuranceIncrease };
  if (!isRecord(value.drawerItems) || !hasOnlyKeys(value.drawerItems, ['manual', 'clips']) || typeof value.drawerItems.manual !== 'boolean'
    || !isIntegerInRange(value.drawerItems.clips, 0, GAME_LIMITS.drawerClips)
    || !Array.isArray(value.papers) || value.papers.length > GAME_LIMITS.papers
    || !isIntegerInRange(value.nextPaperId, 1, GAME_LIMITS.paperId + 1)
    || !Array.isArray(value.paperClips) || value.paperClips.length > value.papers.length + 1) return fail();
  const papers = value.papers.map(paper => validatePaperV7(paper, value.day as number, version === 9 ? 102 : maxPatient));
  const seen = new Set<number>(), casePapers = new Set<string>();
  for (const paper of papers) {
    if (seen.has(paper.id) || paper.id >= value.nextPaperId) return fail();
    seen.add(paper.id);
    if (paper.kind !== 'note') {
      const key = `${paper.day}:${paper.patientId}:${paper.kind}`;
      if (casePapers.has(key) && !(referralState && paper.kind === 'letter')) return fail();
      casePapers.add(key);
    }
    if (paper.day === value.day && paper.patientId !== null && !referralState?.pendingIds.has(paper.patientId)) {
      const position = roster.indexOf(paper.patientId);
      const interrupted = overtime && value.phase === 'home' && value.clockMinutes === CLINIC_CLOSE_MINUTES;
      if (position < 0 || position > value.shiftCompleted
        || (position === value.shiftCompleted && ((paper.kind === 'letter' && !referralState?.referralsIssued)
          || (!interrupted && (!visit || (visit.document !== 'desk' && !(overtime && paper.kind === 'note'))))))) return fail();
      if (paper.kind === 'note' && paper.patientId === visit?.patientId
        && ((paper.results.vision !== null && !visit.visionTested) || (paper.results.pressure !== null && !visit.pressureTested)
          || (paper.results.weight !== null && !visit.measurementsTaken))) return fail();
    }
  }
  const clipped = new Set<DocumentId>();
  const paperClips: DocumentId[][] = value.paperClips.map(raw => {
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > papers.length + 1) return fail();
    let location: Paper['location'] | undefined;
    return raw.map((id: unknown): DocumentId => {
      if (id !== 'certificate' && !isIntegerInRange(id, 1, GAME_LIMITS.paperId)) return fail();
      if (clipped.has(id)) return fail();
      clipped.add(id);
      const current = id === 'certificate' ? (visit?.certificateTaken ? 'desk' : undefined) : papers.find(paper => paper.id === id)?.location;
      if (!current || (location && current !== location)) return fail();
      location = current;
      return id;
    });
  });
  let settlement: DaySettlement | null = null;
  if (value.phase === 'home') {
    const entry = value.settlement;
    if (visit !== null || (overtime ? value.clockMinutes < SHIFT_END_MINUTES : value.clockMinutes !== SHIFT_END_MINUTES)) return fail();
    settlement = validateSettlement(entry, value.day, value.shiftCompleted, value.money, value.insuranceRate, daily.fines, restDay, weekendBudgets, weekendDebt);
  } else if (value.settlement !== null) return fail();
  if (value.phase === 'intro' && (value.clockMinutes !== ARRIVAL_MINUTES || value.shiftCompleted !== 0 || visit !== null
    || papers.length || value.nextPaperId !== 1 || paperClips.length || value.drawerItems.manual || value.drawerItems.clips
    || daily.fines || daily.refusals || value.insuranceRate !== BASE_INSURANCE)) return fail();
  return { day: value.day, money: value.money, previousMonthBalance: version === 9 ? 0 : value.previousMonthBalance as number, patientsProcessed: value.patientsProcessed, phase: value.phase,
    introStep: value.introStep, shiftCompleted: value.shiftCompleted, clockMinutes: value.clockMinutes, visit,
    lampOn: value.lampOn, decoration: value.decoration, papers, nextPaperId: value.nextPaperId, paperClips,
    drawerItems: { manual: value.drawerItems.manual, clips: value.drawerItems.clips },
    rngState: value.rngState, roster, insuranceRate: value.insuranceRate, daily, settlement };
}

/** Old formats did not record ordering; retain their former display order once. */
function legacyExaminationOrder(value: { vision: unknown; pressure: unknown; weight: unknown }): ExaminationId[] {
  const order: ExaminationId[] = [];
  if (value.vision !== null) order.push('vision');
  if (value.pressure !== null) order.push('pressure');
  if (value.weight !== null) order.push('measurements');
  return order;
}

function migrateStateV10(state: GameStateV10): GameState {
  const visit = state.visit ? { ...state.visit, generalTested: false,
    pressureLatest: state.visit.pressureTested ? { ...PATIENTS[state.visit.patientId]!.pressureValues } : null,
    pressureReadings: state.visit.pressureTested ? [{ ...PATIENTS[state.visit.patientId]!.pressureValues }] : [],
    examinationOrder: legacyExaminationOrder({ vision: state.visit.visionTested ? true : null,
      pressure: state.visit.pressureTested ? true : null, weight: state.visit.measurementsTaken ? true : null }) } : null;
  const papers: Paper[] = state.papers.map(paper => {
    if (paper.kind !== 'note') return paper;
    const patient = paper.patientId === null ? null : PATIENTS[paper.patientId]!;
    return { ...paper, examinationOrder: legacyExaminationOrder(paper.results), results: {
      general: null,
      vision: paper.results.vision !== null && patient ? { ...patient.visionValues } : null,
      pressure: paper.results.pressure !== null && patient ? { ...patient.pressureValues } : null,
      pressureReadings: paper.results.pressure !== null && patient ? [{ ...patient.pressureValues }] : [],
      weight: paper.results.weight, height: paper.results.height,
    } };
  });
  return { ...state, visit, papers };
}

function validateExaminationOrder(value: unknown, completed: Record<ExaminationId, boolean>): ExaminationId[] {
  if (!Array.isArray(value) || value.length !== Object.values(completed).filter(Boolean).length
    || new Set(value).size !== value.length
    || Array.from(value).some(id => typeof id !== 'string' || !Object.hasOwn(completed, id) || !completed[id as ExaminationId])) {
    throw new SaveError('invalid-state');
  }
  return [...value] as ExaminationId[];
}

function validatePressureReadings(value: unknown, patientId: number | null, measured: boolean, override?: PatientCase): PressureValues[] {
  if (!Array.isArray(value) || value.length > 2 || (value.length > 0) !== measured || (measured && patientId === null)) throw new SaveError('invalid-state');
  const patient = patientId === null ? null : override ?? PATIENTS[patientId]!;
  const readings = value.map((reading): PressureValues => {
    if (!patient || !isRecord(reading) || !hasOnlyKeys(reading, ['systolic', 'diastolic'])
      || !isIntegerInRange(reading.systolic, patient.pressureValues.systolic - 3, patient.pressureValues.systolic + 3)
      || !isIntegerInRange(reading.diastolic, patient.pressureValues.diastolic - 2, patient.pressureValues.diastolic + 2)
      || !compatiblePressureReading(patient, { systolic: reading.systolic, diastolic: reading.diastolic })) throw new SaveError('invalid-state');
    return { systolic: reading.systolic, diastolic: reading.diastolic };
  });
  if (readings.length === 2 && readings[0]!.systolic === readings[1]!.systolic && readings[0]!.diastolic === readings[1]!.diastolic) throw new SaveError('invalid-state');
  return readings;
}

function validatePaperV11(value: unknown, day: number, version: 11 | 12 | 13 | 14 | 15, override?: PatientCase, referralState?: ReferralValidation): Paper {
  const maxPatient = version >= 15 ? referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT : version >= 13 ? V14_CASE_LIMIT : V12_CASE_LIMIT;
  if (!isRecord(value)) throw new SaveError('invalid-state');
  if (value.kind !== 'note') {
    const paper = validatePaperV7(value, day, maxPatient);
    if (paper.kind === 'note') throw new SaveError('invalid-state');
    return paper;
  }
  if (!hasOnlyKeys(value, ['id', 'kind', 'day', 'patientId', 'location', 'results', 'additionalWritten', 'examinationOrder'])
    || !isIntegerInRange(value.id, 1, GAME_LIMITS.paperId) || !isIntegerInRange(value.day, 1, day)
    || (value.location !== 'desk' && value.location !== 'drawer') || typeof value.additionalWritten !== 'boolean'
    || (value.patientId !== null && !isIntegerInRange(value.patientId, 0, maxPatient))) throw new SaveError('invalid-state');
  const results = value.results;
  if (!isRecord(results) || !hasOnlyKeys(results, ['general', 'vision', 'pressure', 'weight', 'height', ...(version >= 12 ? ['pressureReadings'] : [])])) throw new SaveError('invalid-state');
  const patient = value.patientId === null ? null : override ?? PATIENTS[value.patientId]!;
  const pressureReadings = version >= 12 ? validatePressureReadings(results.pressureReadings, value.patientId as number | null, results.pressure !== null, override)
    : results.pressure !== null && patient ? [{ ...patient.pressureValues }] : [];
  const lastPressure = pressureReadings.at(-1);
  if ((results.general !== null && (!patient || results.general !== patient.general))
    || (results.vision !== null && (!patient || !isRecord(results.vision) || !hasOnlyKeys(results.vision, ['left', 'right'])
      || results.vision.left !== patient.visionValues.left || results.vision.right !== patient.visionValues.right))
    || (results.pressure !== null && (!patient || !isRecord(results.pressure) || !hasOnlyKeys(results.pressure, ['systolic', 'diastolic'])
      || results.pressure.systolic !== lastPressure?.systolic || results.pressure.diastolic !== lastPressure?.diastolic))
    || (results.weight !== null && (!patient || results.weight !== patient.weight))
    || (results.height !== null && (!patient || results.height !== patient.height))
    || ((results.weight === null) !== (results.height === null))
    || (!patient && value.additionalWritten)
    || (version < 14 && patient && !value.additionalWritten && Object.entries(results).filter(([key]) => key !== 'pressureReadings').every(([, entry]) => entry === null))) throw new SaveError('invalid-state');
  const examinationOrder = validateExaminationOrder(value.examinationOrder, { general: results.general !== null,
    vision: results.vision !== null, pressure: results.pressure !== null, measurements: results.weight !== null });
  return { id: value.id, kind: 'note', day: value.day, patientId: value.patientId, location: value.location,
    additionalWritten: value.additionalWritten, examinationOrder, results: {
      general: results.general as 'pass' | 'refer' | null,
      vision: results.vision !== null && patient ? { ...patient.visionValues } : null,
      pressure: lastPressure ? { ...lastPressure } : null,
      pressureReadings,
      weight: results.weight as number | null, height: results.height as number | null,
    } };
}

/** Validate new clinical data, then reuse unchanged ledger and inventory checks. */
function validateStateV11(value: unknown, version: 11 | 12 | 13 | 14 | 15 = 11, overrides: { visit?: PatientCase; notes?: Map<number, PatientCase>; weekendBudgets?: boolean; referralState?: ReferralValidation; weekendDebt?: boolean } = {}): GameState {
  const maxPatient = version >= 15 ? overrides.referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT : version >= 13 ? V14_CASE_LIMIT : V12_CASE_LIMIT;
  if (!isRecord(value) || !Array.isArray(value.papers) || value.papers.length > GAME_LIMITS.papers
    || !isIntegerInRange(value.day, 1, GAME_LIMITS.day)) throw new SaveError('invalid-state');
  let oldVisit: unknown = null;
  let generalTested = false;
  let examinationOrder: ExaminationId[] = [];
  let pressureReadings: PressureValues[] = [];
  let pressureLatest: PressureValues | null = null;
  if (value.visit !== null) {
    const entry = value.visit;
    if (!isRecord(entry) || !hasOnlyKeys(entry, ['patientId', 'document', 'certificateTaken', 'certificateNamed',
      'generalTested', 'visionTested', 'pressureTested', 'measurementsTaken', 'examinationOrder', 'decision', ...(version >= 12 ? ['pressureReadings', 'pressureLatest'] : [])])
      || typeof entry.generalTested !== 'boolean' || typeof entry.visionTested !== 'boolean'
      || typeof entry.pressureTested !== 'boolean' || typeof entry.measurementsTaken !== 'boolean'
      || !isIntegerInRange(entry.patientId, 0, maxPatient)
      || (version === 11 && entry.generalTested && entry.document !== 'desk')) throw new SaveError('invalid-state');
    examinationOrder = validateExaminationOrder(entry.examinationOrder, { general: entry.generalTested,
      vision: entry.visionTested, pressure: entry.pressureTested, measurements: entry.measurementsTaken });
    pressureReadings = version >= 12 ? validatePressureReadings(entry.pressureReadings, entry.patientId, entry.pressureTested, overrides.visit)
      : entry.pressureTested ? [{ ...PATIENTS[entry.patientId]!.pressureValues }] : [];
    pressureLatest = version >= 12
      ? validatePressureReadings(entry.pressureLatest === null ? [] : [entry.pressureLatest], entry.patientId, entry.pressureTested, overrides.visit)[0] ?? null
      : pressureReadings[0] ? { ...pressureReadings[0] } : null;
    if (pressureReadings.length === 1 && (pressureLatest?.systolic !== pressureReadings[0]!.systolic
      || pressureLatest.diastolic !== pressureReadings[0]!.diastolic)) throw new SaveError('invalid-state');
    const { generalTested: general, examinationOrder: _order, pressureReadings: _readings, pressureLatest: _latest, ...previous } = entry;
    generalTested = general;
    oldVisit = previous;
  }
  const papers = value.papers.map(paper => validatePaperV11(paper, value.day as number, version, isRecord(paper) && typeof paper.id === 'number' ? overrides.notes?.get(paper.id) : undefined, overrides.referralState));
  const oldPapers: PaperV10[] = papers.map(paper => {
    if (paper.kind !== 'note') return paper;
    const { examinationOrder: _order, ...previous } = paper;
    const patient = paper.patientId === null ? null : PATIENTS[paper.patientId]!;
    return { ...previous,
      // Identity-only and general-only notes need a nonempty legacy projection. The original flag
      // is restored below, so this never invents a supplementary annotation.
      additionalWritten: paper.additionalWritten || paper.patientId !== null,
      results: { vision: paper.results.vision !== null && patient ? patient.vision : null,
        pressure: paper.results.pressure !== null && patient ? patient.pressure : null,
        weight: paper.results.weight, height: paper.results.height } };
  });
  const previous = validateBudgetState({ ...value, visit: oldVisit, papers: oldPapers }, 10, maxPatient, version >= 12, version >= 13 ? overrides.referralState ? overrides.referralState.catalogCharacters ?? CHARACTER_COUNT : V18_CHARACTER_COUNT : V12_CHARACTER_COUNT, overrides.weekendBudgets, overrides.referralState, overrides.weekendDebt);
  const visit: Visit | null = previous.visit ? { ...previous.visit, generalTested, examinationOrder, pressureReadings, pressureLatest } : null;
  if (visit) {
    const minimum = overrides.referralState?.startedDay !== undefined && overrides.referralState.startedDay < previous.day ? SHIFT_START_MINUTES
      : SHIFT_START_MINUTES + previous.shiftCompleted * 4 + (visit.document === 'desk' ? 1 : 0)
      + (visit.generalTested ? 3 : 0) + (visit.visionTested ? 3 : 0) + (visit.pressureTested ? 4 : 0)
      + (visit.measurementsTaken ? 2 : 0) + (visit.decision ? 1 : 0);
    if (previous.clockMinutes < Math.min(SHIFT_END_MINUTES, minimum)) throw new SaveError('invalid-state');
    for (const paper of papers) {
      if (paper.kind !== 'note' || paper.patientId !== visit.patientId || paper.day !== previous.day) continue;
      if ((paper.results.general !== null && !visit.generalTested)
        || (version >= 12 && paper.results.pressure !== null && JSON.stringify(paper.results.pressureReadings) !== JSON.stringify(visit.pressureReadings))
        || paper.examinationOrder.some((id, index) => visit.examinationOrder.filter(exam => paper.examinationOrder.includes(exam))[index] !== id)) {
        throw new SaveError('invalid-state');
      }
    }
  }
  return { ...previous, visit, papers };
}

/** Legacy appointments keep valid paperwork and never acquire invented offences. */
function migrateStateV15(state: GameState): PreJournalState {
  return { ...state, ending: null,
    visit: state.visit ? { ...state.visit, referral: defaultReferral(state.day, state.visit.patientId),
      specialist: null, specialistTaken: false, calls: emptyCalls(), bribe: 'none' } : null,
    papers: state.papers.map((paper): PreJournalPaper => paper.kind === 'referral'
      ? { ...paper, details: defaultReferral(paper.day, paper.patientId) }
      : paper.kind === 'note' ? { ...paper, calls: emptyCalls(), bribe: false } : paper) };
}

function validateCalls(value: unknown, day: number, patientId: number | null): PhoneConclusions {
  if (!isRecord(value) || !hasOnlyKeys(value, ['specialist', 'employer'])
    || (value.specialist !== null && typeof value.specialist !== 'boolean')
    || (value.employer !== null && typeof value.employer !== 'boolean')
    || (value.specialist !== null && (patientId === null || workDayNumber(day) < 4))
    || (value.employer !== null && (patientId === null || workDayNumber(day) < 5))) throw new SaveError('invalid-state');
  return { specialist: value.specialist, employer: value.employer };
}

function validateReferral(value: unknown, day: number, patientId: number): ReferralDetails {
  if (!isRecord(value) || !hasOnlyKeys(value, ['ageDays', 'seal', 'authentic', 'phone'])
    || !isIntegerInRange(value.ageDays, 0, 10)
    || (value.seal !== 'clear' && value.seal !== 'missing' && value.seal !== 'unclear')
    || typeof value.authentic !== 'boolean' || value.phone !== employerPhone(patientId)
    || (value.seal === 'clear' && !value.authentic) || (value.seal === 'missing' && value.authentic)
    || (workDayNumber(day) < 5 && value.seal !== 'clear')) throw new SaveError('invalid-state');
  return { ageDays: value.ageDays, seal: value.seal, authentic: value.authentic, phone: value.phone as string };
}

function validateSpecialist(value: unknown, day: number, patientId: number, expandedCatalog = false): SpecialistCertificate {
  if (!isRecord(value) || !hasOnlyKeys(value, ['jobId', 'phone']) || workDayNumber(day) < 4
    || PATIENTS[patientId]!.pressure !== 'refer' || !isIntegerInRange(value.jobId, 0, expandedCatalog ? JOBS.length - 1 : 44)
    || value.phone !== specialistPhone(patientId)) throw new SaveError('invalid-state');
  return { jobId: value.jobId, phone: value.phone as string };
}

/** Reuse the frozen ledger/clinical checks after validating all progression data. */
function validateStateV16(value: unknown, weekendBudgets = false, bankruptcy = false, referralState?: ReferralValidation, weekendDebt = false): PreJournalState {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !isIntegerInRange(value.day, 1, GAME_LIMITS.day)
    || !Array.isArray(value.papers) || value.papers.length > GAME_LIMITS.papers
    || !Array.isArray(value.paperClips) || value.paperClips.length > value.papers.length + 1
    || !isIntegerInRange(value.nextPaperId, 1, GAME_LIMITS.paperId + 1)
    || (value.ending !== null && value.ending !== 'assault-pending' && value.ending !== 'hospital' && !(bankruptcy && value.ending === 'bankruptcy'))
    || ((value.ending === 'assault-pending' || value.ending === 'hospital') && (workDayNumber(value.day) < 6 || !isIntegerInRange(value.shiftCompleted, 1, CHARACTER_COUNT)))
    || (value.ending === 'hospital' && value.phase !== 'home')
    || (value.ending === 'bankruptcy' && (value.phase !== 'home' || typeof value.money !== 'number' || value.money >= 0))
    || (bankruptcy && value.phase === 'home' && typeof value.money === 'number' && value.money < 0 && value.ending === null)
    || (value.ending === 'assault-pending' && value.phase !== 'cabinet')) return fail();
  const { ending, ...historicalState } = value;
  let visitExtras: Pick<CurrentVisit, 'referral' | 'specialist' | 'specialistTaken' | 'calls' | 'bribe'> | null = null;
  let visitOverride: PatientCase | undefined;
  let oldVisit: unknown = null;
  if (value.visit !== null) {
    const entry = value.visit;
    if (!isRecord(entry) || !isIntegerInRange(entry.patientId, 0, referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT)
      || typeof entry.specialistTaken !== 'boolean'
      || !['none', 'offered', 'accepted', 'returned'].includes(entry.bribe as string)
      || (entry.bribe !== 'none' && workDayNumber(value.day) < 6)) return fail();
    const referral = validateReferral(entry.referral, value.day, entry.patientId);
    const specialist = entry.specialist === null ? null : validateSpecialist(entry.specialist, value.day, entry.patientId, !!referralState);
    const calls = validateCalls(entry.calls, value.day, entry.patientId);
    if ((entry.specialistTaken && !specialist)
      || (calls.specialist !== null && (!specialist || !entry.specialistTaken || calls.specialist !== (specialist.jobId === PATIENTS[entry.patientId]!.jobId)))
      || (calls.employer !== null && (entry.document !== 'desk' || calls.employer !== referral.authentic))
      || (entry.bribe !== 'none' && (specialist !== null || referral.ageDays > 3 || referral.seal !== 'clear'))) return fail();
    visitExtras = { referral, specialist, specialistTaken: entry.specialistTaken, calls, bribe: entry.bribe as CurrentVisit['bribe'] };
    visitOverride = effectivePatient(entry.patientId, entry.bribe !== 'none');
    const { referral: _referral, specialist: _specialist, specialistTaken: _taken, calls: _calls, bribe: _bribe, ...old } = entry;
    oldVisit = old;
  }
  const noteExtras = new Map<number, { calls: PhoneConclusions; bribe: boolean }>();
  const noteOverrides = new Map<number, PatientCase>();
  const referralExtras = new Map<number, ReferralDetails>();
  const letterSenders = new Map<number, 'zus' | 'employer'>();
  const addedPapers = new Map<number, PaperV18>();
  const paperLocations = new Map<number, 'desk' | 'drawer'>();
  const uniqueKinds = new Set<string>();
  const oldPapers: unknown[] = [];
  const rawPapers = value.papers;
  for (const raw of rawPapers) {
    if (!isRecord(raw) || !isIntegerInRange(raw.id, 1, GAME_LIMITS.paperId) || raw.id >= value.nextPaperId
      || paperLocations.has(raw.id) || !isIntegerInRange(raw.day, 1, value.day)
      || (raw.location !== 'desk' && raw.location !== 'drawer')) return fail();
    paperLocations.set(raw.id, raw.location);
    if (raw.kind === 'directive') {
      const key = `${raw.day}:directive`;
      if (!hasOnlyKeys(raw, ['id', 'kind', 'day', 'patientId', 'location', 'sender', 'rule', 'opened'])
        || raw.patientId !== null || typeof raw.opened !== 'boolean' || raw.rule !== directiveForDay(raw.day)
        || !['dates', 'specialist', 'authenticity'].includes(raw.rule as string)
        || raw.sender !== (raw.rule === 'specialist' ? 'chamber' : 'zus') || uniqueKinds.has(key)) return fail();
      uniqueKinds.add(key);
      addedPapers.set(raw.id, { id: raw.id, kind: 'directive', day: raw.day, patientId: null, location: raw.location,
        sender: raw.sender as 'zus' | 'chamber', rule: raw.rule as 'dates' | 'specialist' | 'authenticity', opened: raw.opened });
      continue;
    }
    if (raw.kind === 'specialist') {
      const key = `${raw.day}:${raw.patientId}:specialist`;
      if (!hasOnlyKeys(raw, ['id', 'kind', 'day', 'patientId', 'location', 'certificate'])
        || !isIntegerInRange(raw.patientId, 0, referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT) || uniqueKinds.has(key)) return fail();
      uniqueKinds.add(key);
      const certificate = validateSpecialist(raw.certificate, raw.day, raw.patientId, !!referralState);
      addedPapers.set(raw.id, { id: raw.id, kind: 'specialist', day: raw.day, patientId: raw.patientId, location: raw.location, certificate });
      continue;
    }
    if (raw.kind === 'note') {
      if (typeof raw.bribe !== 'boolean' || (raw.patientId !== null && !isIntegerInRange(raw.patientId, 0, referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT))
        || (raw.bribe && (raw.patientId === null || workDayNumber(raw.day) < 6))) return fail();
      const calls = validateCalls(raw.calls, raw.day, raw.patientId as number | null);
      noteExtras.set(raw.id, { calls, bribe: raw.bribe });
      if (raw.patientId !== null) noteOverrides.set(raw.id, effectivePatient(raw.patientId as number, raw.bribe));
      const { calls: _calls, bribe: _bribe, ...old } = raw;
      oldPapers.push(old);
    } else if (raw.kind === 'referral') {
      if (!isIntegerInRange(raw.patientId, 0, referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT)) return fail();
      referralExtras.set(raw.id, validateReferral(raw.details, raw.day, raw.patientId));
      const { details: _details, ...old } = raw;
      oldPapers.push(old);
    } else if (raw.kind === 'letter') {
      if (!isIntegerInRange(raw.patientId, 0, referralState ? PATIENTS.length - 1 : V18_CASE_LIMIT) || (raw.sender !== 'zus' && raw.sender !== 'employer')) return fail();
      const historicalSender = PATIENTS[raw.patientId]!.expectedDecision === 'fit' ? 'employer' : 'zus';
      if (workDayNumber(raw.day) < 3 && raw.sender !== historicalSender) return fail();
      letterSenders.set(raw.id, raw.sender);
      // Since day 3 documents can change fitness independently of the catalog.
      // Preserve the original sender after the frozen inventory checks.
      oldPapers.push({ ...raw, sender: historicalSender });
    } else oldPapers.push(raw);
  }
  const clipped = new Set<DocumentId>();
  const paperClips: DocumentId[][] = value.paperClips.map(raw => {
    if (!Array.isArray(raw) || !raw.length || raw.length > rawPapers.length + 1) return fail();
    let location: 'desk' | 'drawer' | undefined;
    return raw.map((id: unknown): DocumentId => {
      if (id !== 'certificate' && !isIntegerInRange(id, 1, GAME_LIMITS.paperId)) return fail();
      if (clipped.has(id)) return fail();
      clipped.add(id);
      const nextLocation = id === 'certificate' ? (isRecord(value.visit) && value.visit.certificateTaken ? 'desk' : undefined) : paperLocations.get(id);
      if (!nextLocation || (location && location !== nextLocation)) return fail();
      location = nextLocation;
      return id;
    });
  });
  const oldClips = paperClips.map(group => group.filter(id => id === 'certificate' || !addedPapers.has(id))).filter(group => group.length);
  const previous = validateStateV11({ ...historicalState, visit: oldVisit, papers: oldPapers, paperClips: oldClips }, 15,
    { visit: visitOverride, notes: noteOverrides, weekendBudgets, referralState, weekendDebt });
  if (previous.phase === 'intro' && addedPapers.size) return fail();
  const visit: PreJournalVisit | null = previous.visit && visitExtras ? { ...previous.visit, ...visitExtras } : null;
  const validatedPapers = new Map(previous.papers.map(paper => [paper.id, paper]));
  const papers: PreJournalPaper[] = rawPapers.map((raw): PreJournalPaper => {
    const id = (raw as Record<string, unknown>).id as number;
    const added = addedPapers.get(id);
    if (added) return added;
    const paper = validatedPapers.get(id)!;
    return paper.kind === 'note' ? { ...paper, ...noteExtras.get(id)! }
      : paper.kind === 'referral' ? { ...paper, details: referralExtras.get(id)! }
      : { ...paper, sender: letterSenders.get(id)! };
  });
  for (const paper of papers) {
    if (paper.day !== previous.day || paper.kind === 'directive' || referralState?.pendingIds.has(paper.patientId!)) continue;
    if (paper.kind === 'specialist') {
      const position = previous.roster.indexOf(paper.patientId);
      const interrupted = previous.phase === 'home' && previous.clockMinutes === CLINIC_CLOSE_MINUTES;
      if (position < 0 || position > previous.shiftCompleted || (position === previous.shiftCompleted && !visit && !interrupted)) return fail();
      if (paper.patientId === visit?.patientId && (!visit.specialistTaken || JSON.stringify(paper.certificate) !== JSON.stringify(visit.specialist))) return fail();
    }
    if (paper.patientId !== visit?.patientId) continue;
    if (paper.kind === 'referral' && JSON.stringify(paper.details) !== JSON.stringify(visit.referral)) return fail();
    if (paper.kind === 'note' && (paper.bribe !== (visit.bribe !== 'none') || paper.calls.specialist !== visit.calls.specialist || paper.calls.employer !== visit.calls.employer)) return fail();
  }
  return { ...previous, ending: ending as CurrentGameState['ending'], visit, papers, paperClips };
}

/** Older files retain their previously displayed grouping; no lost chronology is invented. */
function legacyNoteOrder(record: PreJournalVisit | Extract<PreJournalPaper, { kind: 'note' }>): NoteEntryId[] {
  const readings = 'results' in record ? record.results.pressureReadings : record.pressureReadings;
  const order: NoteEntryId[] = record.examinationOrder.flatMap((entry): NoteEntryId[] =>
    entry === 'pressure' && readings.length === 2 ? ['pressure', 'pressure-repeat'] : [entry]);
  if (record.examinationOrder.includes('general')) order.push('history');
  if (record.calls.specialist !== null) order.push('call-specialist');
  if (record.calls.employer !== null) order.push('call-employer');
  return order;
}

function migrateNoteOrder(state: PreJournalState): StateV18 {
  return { ...state, visit: state.visit ? { ...state.visit, noteOrder: legacyNoteOrder(state.visit) } : null,
    papers: state.papers.map(paper => paper.kind === 'note' ? { ...paper, noteOrder: legacyNoteOrder(paper) } : paper) };
}

/** Validate the journal separately, then reuse all frozen clinical and ledger rules. */
function validateStateV18(value: unknown, referralState?: ReferralValidation, weekendDebt = false): StateV18 {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !Array.isArray(value.papers)) return fail();
  let visitOrder: unknown;
  let oldVisit: unknown = value.visit;
  if (value.visit !== null) {
    if (!isRecord(value.visit)) return fail();
    const { noteOrder, ...old } = value.visit;
    visitOrder = noteOrder; oldVisit = old;
  }
  const noteOrders = new Map<unknown, unknown>();
  const oldPapers = value.papers.map(paper => {
    if (!isRecord(paper) || paper.kind !== 'note') return paper;
    const { noteOrder, ...old } = paper;
    noteOrders.set(paper.id, noteOrder); return old;
  });
  const previous = validateStateV16({ ...value, visit: oldVisit, papers: oldPapers }, true, true, referralState, weekendDebt);
  const validateOrder = (raw: unknown, record: PreJournalVisit | Extract<PreJournalPaper, { kind: 'note' }>): NoteEntryId[] => {
    const expected = legacyNoteOrder(record);
    if (!Array.isArray(raw) || raw.length !== expected.length || new Set(raw).size !== raw.length
      || raw.some(entry => !expected.includes(entry))
      || (!('results' in record) && JSON.stringify(raw.filter(entry => record.examinationOrder.includes(entry))) !== JSON.stringify(record.examinationOrder))
      || (raw.includes('pressure-repeat') && raw.indexOf('pressure-repeat') < raw.indexOf('pressure'))
      || (raw.includes('history') && raw.indexOf('history') < raw.indexOf('general'))) return fail();
    return [...raw] as NoteEntryId[];
  };
  const visit = previous.visit ? { ...previous.visit, noteOrder: validateOrder(visitOrder, previous.visit) } : null;
  const papers = previous.papers.map((paper): PaperV18 => {
    if (paper.kind !== 'note') return paper;
    const noteOrder = validateOrder(noteOrders.get(paper.id), paper);
    // Older partial sheets may receive missing findings later. Their own
    // append-only order need not match a newly fetched, complete sheet.
    return { ...paper, noteOrder };
  });
  return { ...previous, visit, papers };
}

/** Older saves keep their current appointment and acquire no invented referral. */
function migrateAdditionalTests(state: StateV18): StateV19 {
  return { ...state, pendingReferrals: [], referralsIssued: 0,
    visit: state.visit ? { ...state.visit, startedDay: state.day, additionalResult: null, additionalTests: [] } : null };
}

function validateStateV19(value: unknown, partialRoster = false, weekendDebt = false, resultAttachments = false, inspection?: InspectionValidation): StateV19 {
  const catalogCharacters = inspection?.catalogCharacters ?? 103;
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !isIntegerInRange(value.day, 1, GAME_LIMITS.day)
    || !isIntegerInRange(value.referralsIssued, 0, catalogCharacters * 4)
    || !Array.isArray(value.pendingReferrals) || value.pendingReferrals.length > catalogCharacters
    || !Array.isArray(value.papers) || value.papers.length > GAME_LIMITS.papers
    || !Array.isArray(value.paperClips) || !Array.isArray(value.roster)
    || (workDayNumber(value.day) < 7 && (value.referralsIssued !== 0 || value.pendingReferrals.length > 0))) return fail();
  const day = value.day;
  const isTest = (test: unknown): test is AdditionalTest => ADDITIONAL_TESTS.includes(test as AdditionalTest);
  const visitExtras = (raw: unknown): { startedDay: number; additionalResult: AdditionalResult | null; additionalTests: AdditionalTest[]; old: Record<string, unknown> } => {
    if (!isRecord(raw) || !isIntegerInRange(raw.patientId, 0, PATIENTS.length - 1)
      || !isIntegerInRange(raw.startedDay, 1, day)
      || !Array.isArray(raw.additionalTests) || raw.additionalTests.length > 4
      || new Set(raw.additionalTests).size !== raw.additionalTests.length || !raw.additionalTests.every(isTest)
      || ((workDayNumber(raw.startedDay) < 7 || isWeekend(raw.startedDay)) && raw.additionalTests.length)) return fail();
    let additionalResult: AdditionalResult | null = null;
    if (raw.additionalResult !== null) {
      const result = raw.additionalResult;
      if (!isRecord(result) || !hasOnlyKeys(result, ['test', 'fit']) || !isTest(result.test)
        || !raw.additionalTests.includes(result.test) || typeof result.fit !== 'boolean'
        || result.fit !== additionalResultFor(effectivePatient(raw.patientId, raw.bribe !== 'none'), result.test).fit) return fail();
      additionalResult = { test: result.test, fit: result.fit };
    }
    if (raw.startedDay < day && !raw.additionalTests.length) return fail();
    const { startedDay, additionalResult: _result, additionalTests, ...old } = raw;
    return { startedDay, additionalResult, additionalTests: [...additionalTests], old };
  };
  const pendingIds = new Set<number>();
  const pendingCharacters = new Set<number>();
  const pendingReferrals: PendingReferral[] = value.pendingReferrals.map(raw => {
    if (!isRecord(raw) || !hasOnlyKeys(raw, ['visit', 'sentDay', 'returnDay', 'returnMinute', 'returnAfterCompleted', 'test', 'fit'])
      || !isIntegerInRange(raw.sentDay, 1, day) || workDayNumber(raw.sentDay) < 7 || isWeekend(raw.sentDay)
      || !isIntegerInRange(raw.returnDay, raw.sentDay, Math.min(GAME_LIMITS.day, nextWorkingDay(raw.sentDay)))
      || ![raw.sentDay, nextWorkingDay(raw.sentDay)].includes(raw.returnDay)
      || !isIntegerInRange(raw.returnMinute, raw.returnDay === raw.sentDay ? 600 : 480, raw.returnDay === raw.sentDay ? 839 : 480)
      || !isIntegerInRange(raw.returnAfterCompleted, 3, catalogCharacters + 3) || !isTest(raw.test) || typeof raw.fit !== 'boolean') return fail();
    const extra = visitExtras(raw.visit), patientId = extra.old.patientId as number;
    const characterId = PATIENTS[patientId]!.characterId;
    if (extra.startedDay > raw.sentDay || extra.old.document !== 'desk'
      || extra.additionalTests.at(-1) !== raw.test || pendingIds.has(patientId) || pendingCharacters.has(characterId)
      || raw.fit !== additionalResultFor(effectivePatient(patientId, extra.old.bribe !== 'none'), raw.test).fit) return fail();
    pendingIds.add(patientId); pendingCharacters.add(characterId);
    const initial = migrateAdditionalTests(migrateNoteOrder(migrateStateV15(legacyInitialState())));
    const roster = Array.from({ length: catalogCharacters }, (_, character) => PATIENTS.find(patient => patient.characterId === character)!.id);
    const index = roster.findIndex(id => PATIENTS[id]!.characterId === characterId);
    roster.splice(index, 1); roster.unshift(patientId);
    const { pendingReferrals: _pending, referralsIssued: _issued, ...base } = initial;
    const validated = validateStateV18({ ...base, day, phase: 'cabinet', introStep: 3, clockMinutes: 839,
      roster, visit: extra.old, papers: [], paperClips: [] }, { pendingIds: new Set(), referralsIssued: 0, startedDay: extra.startedDay, catalogCharacters });
    if (!validated.visit) return fail();
    const visit: CurrentVisit = { ...validated.visit, startedDay: extra.startedDay,
      additionalResult: extra.additionalResult, additionalTests: extra.additionalTests };
    return { visit, sentDay: raw.sentDay, returnDay: raw.returnDay, returnMinute: raw.returnMinute,
      returnAfterCompleted: raw.returnAfterCompleted, test: raw.test, fit: raw.fit };
  });
  const active = value.visit === null ? null : visitExtras(value.visit);
  if (active && ((active.additionalTests.length > 0 && active.additionalResult === null) || pendingIds.has(active.old.patientId as number)
    || pendingCharacters.has(PATIENTS[active.old.patientId as number]!.characterId))) return fail();
  const extraPapers = new Map<number, PaperV24>();
  const allIds = new Set<number>();
  const locations = new Map<number, 'desk' | 'drawer'>();
  for (const raw of value.papers) {
    if (!isRecord(raw) || !isIntegerInRange(raw.id, 1, GAME_LIMITS.paperId)
      || !isIntegerInRange(value.nextPaperId, raw.id + 1, GAME_LIMITS.paperId + 1) || allIds.has(raw.id)
      || !isIntegerInRange(raw.day, 1, day) || (raw.location !== 'desk' && raw.location !== 'drawer')) return fail();
    allIds.add(raw.id); locations.set(raw.id, raw.location);
    if (raw.kind === 'directive' && raw.rule === 'additional-tests') {
      if (!hasOnlyKeys(raw, ['id', 'kind', 'day', 'patientId', 'location', 'sender', 'rule', 'opened'])
        || raw.patientId !== null || raw.sender !== 'chamber' || typeof raw.opened !== 'boolean'
        || directiveForDay(raw.day) !== 'additional-tests'
        || [...extraPapers.values()].some(paper => paper.kind === 'directive' && paper.day === raw.day)) return fail();
      extraPapers.set(raw.id, { id: raw.id, day: raw.day, location: raw.location, kind: 'directive', patientId: null,
        sender: 'chamber', rule: 'additional-tests', opened: raw.opened });
    } else if (raw.kind === 'additional-referral' || raw.kind === 'additional-result') {
      if (!hasOnlyKeys(raw, ['id', 'kind', 'day', 'patientId', 'location', 'test', ...(raw.kind === 'additional-result' ? ['fit'] : [])])
        || !isIntegerInRange(raw.patientId, 0, PATIENTS.length - 1) || workDayNumber(raw.day) < 7
        || !(isTest(raw.test) || (raw.kind === 'additional-referral' && raw.test === null))) return fail();
      if (raw.day === day && !pendingIds.has(raw.patientId)) {
        const index = value.roster.indexOf(raw.patientId);
        if (!isIntegerInRange(value.shiftCompleted, 0, CHARACTER_COUNT) || index < 0 || index > value.shiftCompleted) return fail();
      }
      const base = { id: raw.id, day: raw.day, patientId: raw.patientId, location: raw.location as 'desk' | 'drawer' };
      if (raw.kind === 'additional-result') {
        if (!isTest(raw.test) || typeof raw.fit !== 'boolean'
          || raw.fit !== additionalResultFor(PATIENTS[raw.patientId]!, raw.test).fit) return fail();
        extraPapers.set(raw.id, { ...base, kind: 'additional-result', test: raw.test, fit: raw.fit });
      } else extraPapers.set(raw.id, { ...base, kind: 'additional-referral', test: raw.test as AdditionalTest | null });
    }
  }
  const rawPaperCount = value.papers.length;
  const seenClips = new Set<DocumentId>();
  const paperClips: DocumentId[][] = value.paperClips.map(group => {
    if (!Array.isArray(group) || !group.length || group.length > rawPaperCount + 1) return fail();
    let location: string | undefined;
    return group.map((id: unknown): DocumentId => {
      if (id !== 'certificate' && !isIntegerInRange(id, 1, GAME_LIMITS.paperId)) return fail();
      const next = id === 'certificate' ? (active?.old.certificateTaken === true ? 'desk' : undefined) : locations.get(id);
      if (!next || seenClips.has(id) || (location && location !== next)) return fail();
      location = next; seenClips.add(id); return id;
    });
  });
  const { pendingReferrals: _pending, referralsIssued, ...old } = value;
  const previous = validateStateV18({ ...old, visit: active?.old ?? null,
    papers: value.papers.filter(paper => !extraPapers.has((paper as Record<string, unknown>).id as number)),
    paperClips: paperClips.map(group => group.filter(id => id === 'certificate' || !extraPapers.has(id))).filter(group => group.length),
  }, { pendingIds, referralsIssued: value.referralsIssued, startedDay: active?.startedDay, partialRoster, resultAttachments, inspection, catalogCharacters }, weekendDebt);
  if (previous.phase === 'intro' && (pendingReferrals.length || extraPapers.size || referralsIssued)) return fail();
  if (!isWeekend(day)) for (const pending of pendingReferrals) {
    const index = previous.roster.indexOf(pending.visit.patientId);
    if (index < previous.shiftCompleted || index < 0) return fail();
  }
  const validatedPapers = new Map(previous.papers.map(paper => [paper.id, paper]));
  const papers = value.papers.map(raw => extraPapers.get((raw as Record<string, unknown>).id as number)
    ?? validatedPapers.get((raw as Record<string, unknown>).id as number)!);
  const visit = previous.visit && active ? { ...previous.visit, startedDay: active.startedDay,
    additionalResult: active.additionalResult, additionalTests: active.additionalTests } : null;
  for (const appointment of [...pendingReferrals.map(pending => pending.visit), ...(visit ? [visit] : [])]) {
    for (const paper of papers) {
      if (paper.patientId !== appointment.patientId || paper.day !== appointment.startedDay) continue;
      if (paper.kind === 'referral' && JSON.stringify(paper.details) !== JSON.stringify(appointment.referral)) return fail();
      if (paper.kind === 'specialist' && (!appointment.specialistTaken || JSON.stringify(paper.certificate) !== JSON.stringify(appointment.specialist))) return fail();
      if (paper.kind === 'note' && (paper.bribe !== (appointment.bribe !== 'none')
        || paper.calls.specialist !== appointment.calls.specialist || paper.calls.employer !== appointment.calls.employer
        || (paper.results.general !== null && !appointment.generalTested)
        || (paper.results.vision !== null && !appointment.visionTested)
        || (paper.results.weight !== null && !appointment.measurementsTaken)
        || (paper.results.pressure !== null && JSON.stringify(paper.results.pressureReadings) !== JSON.stringify(appointment.pressureReadings))
        || paper.examinationOrder.some((entry, index) => appointment.examinationOrder.filter(exam => paper.examinationOrder.includes(exam))[index] !== entry))) return fail();
    }
  }
  return { ...previous, referralsIssued: value.referralsIssued, pendingReferrals, papers, paperClips, visit };
}

/** Preserve actual daily ledgers; older saves never invent missing Friday costs. */
function validateStateV20(value: unknown, partialRoster = false, weekendDebt = false, resultAttachments = false, inspection?: InspectionValidation): StateV23 {
  const maxCharacters = inspection?.catalogCharacters ?? 103;
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !Array.isArray(value.budgetHistory) || value.budgetHistory.length > 2) return fail();
  const { budgetHistory: rawHistory, ...old } = value;
  const state = validateStateV19(old, partialRoster, weekendDebt, resultAttachments, inspection);
  const weekday = gameDate(state.day).weekday;
  if (rawHistory.length && (state.phase !== 'home' || state.roster.length !== 0
    || !isWeekend(state.day) || rawHistory.length > (weekday === 6 ? 1 : 2))) return fail();
  const budgetHistory = rawHistory.map((raw, index): DaySettlement => {
    const day = state.day - rawHistory.length + index;
    if (!isRecord(raw) || day < 1
      || !isIntegerInRange(raw.patients, 0, Math.min(maxCharacters, state.patientsProcessed))
      || !isIntegerInRange(raw.closingBalance, 0, GAME_LIMITS.money)
      || !isIntegerInRange(raw.insuranceCost, 0, GAME_LIMITS.money) || raw.insuranceCost % 50 !== 0
      || !isIntegerInRange(raw.fines, 0, (maxCharacters * 5 - 1) * 400 + 100 + (inspection ? (maxCharacters + 1) * 200 : 0))
      || (inspection ? raw.fines % 50 !== 0 : raw.fines !== 0 && (raw.fines - 100) % 400 !== 0)) return fail();
    const restDay = isWeekend(day) && raw.basePay === 0;
    if ((restDay && (raw.patients !== 0 || raw.fines !== 0))
      || (raw.weekend === null && raw.insuranceCost < BASE_INSURANCE)) return fail();
    return validateSettlement(raw, day, raw.patients, raw.closingBalance, raw.insuranceCost, raw.fines, restDay, true, weekendDebt);
  });
  const ledgers = [...budgetHistory, ...(state.settlement ? [state.settlement] : [])];
  for (let index = 1; index < ledgers.length; index++) {
    const previous = ledgers[index - 1]!, current = ledgers[index]!;
    if (previous.closingBalance !== current.openingBalance) return fail();
    if (gameDate(current.day).weekday === 0 && current.weekend
      && (current.livingCost !== (previous.weekend?.sundayLivingCost ?? 0)
        || current.weekend.modest !== (previous.weekend?.modest ?? false))) return fail();
    if (gameDate(current.day).weekday === 6 && current.weekend?.modest) {
      const remaining = Math.max(0, MODEST_WEEKEND_LIVING - previous.livingCost);
      const planned = current.livingCost + current.weekend.sundayLivingCost;
      // Preserve already settled, cash-capped plans imported from versions 17–21.
      if (planned !== Math.min(current.openingBalance, remaining) && !(weekendDebt && planned === remaining)) return fail();
    }
  }
  return { ...state, budgetHistory };
}

/** New correspondence is validated before passing the unchanged paper inventory through legacy checks. */
function validateStateV23(value: unknown, inspection?: InspectionValidation): StateV23 {
  if (!isRecord(value) || !Array.isArray(value.papers)) throw new SaveError('invalid-state');
  const marked = new Set<number>(), cases = new Set<string>();
  const papers = value.papers.map((raw: unknown) => {
    if (!isRecord(raw) || !('reason' in raw)) return raw;
    if (raw.kind !== 'letter' || raw.reason !== 'missing-result' || raw.sender !== 'employer'
      || !isIntegerInRange(raw.id, 1, GAME_LIMITS.paperId)
      || !isIntegerInRange(raw.patientId, 0, PATIENTS.length - 1)
      || !isIntegerInRange(raw.day, 1, GAME_LIMITS.day) || workDayNumber(raw.day) < 7
      || additionalTestForJob(PATIENTS[raw.patientId]!) === null) throw new SaveError('invalid-state');
    const key = `${raw.day}:${raw.patientId}`;
    if (cases.has(key)) throw new SaveError('invalid-state');
    cases.add(key); marked.add(raw.id);
    const { reason: _reason, ...paper } = raw;
    return paper;
  });
  const state = validateStateV20({ ...value, papers }, true, true, true, inspection);
  if (state.papers.filter(paper => marked.has(paper.id) && paper.day === state.day).length > state.daily.refusals) {
    throw new SaveError('invalid-state');
  }
  return { ...state, papers: state.papers.map(paper => paper.kind === 'letter' && marked.has(paper.id)
    ? { ...paper, reason: 'missing-result' } : paper) };
}

/** Old files never recorded a complete cash journal; preserve their paid balances. */
function migrateBribeIncome(state: StateV23 | StateV24 | StateV25 | CurrentGameState): StateV24 | StateV25 | CurrentGameState {
  if ('bribeIncome' in state) return state;
  return { ...state, bribeIncome: 0,
    settlement: state.settlement ? { ...state.settlement, bribeIncome: 0 } : null,
    budgetHistory: state.budgetHistory.map(ledger => ({ ...ledger, bribeIncome: 0 })) };
}

function validateStateV24(value: unknown, inspection?: InspectionValidation): StateV24 {
  const maxCharacters = inspection?.catalogCharacters ?? 103;
  const fail = (): never => { throw new SaveError('invalid-state'); };
  const validCash = (cash: unknown, day: unknown, rest: boolean): cash is number =>
    isIntegerInRange(cash, -maxCharacters * 100, maxCharacters * 100) && cash % 100 === 0
    && (cash === 0 || (isIntegerInRange(day, 1, GAME_LIMITS.day) && workDayNumber(day) >= 6 && !rest));
  if (!isRecord(value) || !Array.isArray(value.budgetHistory)
    || !validCash(value.bribeIncome, value.day, value.phase === 'intro' || (Array.isArray(value.roster) && value.roster.length === 0))) return fail();
  const project = (raw: unknown): unknown => {
    if (!isRecord(raw) || !validCash(raw.bribeIncome, raw.day, raw.basePay === 0)
      || !isIntegerInRange(raw.openingBalance, -GAME_LIMITS.money, GAME_LIMITS.money)
      || !isIntegerInRange(raw.income, -maxCharacters * 100, BASE_PAY + maxCharacters * 150)) return fail();
    const { bribeIncome, ...ledger } = raw;
    return { ...ledger, openingBalance: raw.openingBalance + bribeIncome, income: raw.income - bribeIncome };
  };
  const { bribeIncome, budgetHistory, ...old } = value;
  if (value.settlement !== null && (!isRecord(value.settlement) || value.settlement.bribeIncome !== bribeIncome)) return fail();
  const state = validateStateV23({ ...old,
    settlement: value.settlement === null ? null : project(value.settlement),
    budgetHistory: budgetHistory.map(project) }, inspection);
  const restore = (ledger: DaySettlement, raw: unknown): CurrentSettlement => {
    const cash = (raw as { bribeIncome: number }).bribeIncome;
    return { ...ledger, bribeIncome: cash, openingBalance: ledger.openingBalance - cash, income: ledger.income + cash };
  };
  return { ...state, bribeIncome,
    settlement: state.settlement ? restore(state.settlement, value.settlement) : null,
    budgetHistory: state.budgetHistory.map((ledger, index) => restore(ledger, budgetHistory[index])) };
}

/** Historical files have no reliable completed-visit journal: do not invent one. */
function migrateInspection(state: StateV24 | StateV25 | CurrentGameState): StateV25 | CurrentGameState {
  return 'recentVisits' in state ? state : { ...state, recentVisits: [], inspection: null,
    inspectionCheckedAt: state.patientsProcessed, inspectionFines: 0 };
}

function validateHistoricalCatalog(value: unknown, maxPatient = 3127, maxCharacters = 103): void {
  if (!isRecord(value)) throw new SaveError('invalid-state');
  const pending: unknown[] = [value];
  while (pending.length) {
    const entry = pending.pop();
    if (Array.isArray(entry)) { for (const item of entry) pending.push(item); continue; }
    if (!isRecord(entry)) continue;
    if (entry.patientId !== undefined && entry.patientId !== null && !isIntegerInRange(entry.patientId, 0, maxPatient)) throw new SaveError('invalid-state');
    for (const item of Object.values(entry)) pending.push(item);
  }
  if ((Array.isArray(value.roster) && (value.roster.length > maxCharacters || value.roster.some(id => !isIntegerInRange(id, 0, maxPatient))))
    || (typeof value.referralsIssued === 'number' && value.referralsIssued > maxCharacters * 4)
    || (Array.isArray(value.pendingReferrals) && value.pendingReferrals.length > maxCharacters)
    || (typeof value.shiftCompleted === 'number' && value.shiftCompleted > maxCharacters)) throw new SaveError('invalid-state');
}

function validateStateV25(value: unknown, catalogCharacters = V27_CHARACTER_COUNT): StateV25 {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !Array.isArray(value.recentVisits) || !Array.isArray(value.papers)
    || !Array.isArray(value.paperClips) || !isIntegerInRange(value.day, 1, GAME_LIMITS.day)
    || !isIntegerInRange(value.patientsProcessed, 0, GAME_LIMITS.patients)
    || !isIntegerInRange(value.shiftCompleted, 0, catalogCharacters)
    || !isIntegerInRange(value.inspectionCheckedAt, 0, value.patientsProcessed)
    || !isIntegerInRange(value.inspectionFines, 0, (value.shiftCompleted + 1) * 200)
    || value.inspectionFines % 50 !== 0
    || (value.inspectionFines > 0 && (value.day === 1 || value.phase === 'intro' || (Array.isArray(value.roster) && !value.roster.length)))
    || value.recentVisits.length > Math.min(25, value.patientsProcessed)
    || value.papers.length > GAME_LIMITS.papers || !isIntegerInRange(value.nextPaperId, 1, GAME_LIMITS.paperId + 1)) return fail();
  const day = value.day, nextPaperId = value.nextPaperId;
  const validateTarget = (raw: unknown): CurrentGameState['recentVisits'][number] => {
    if (!isRecord(raw) || !hasOnlyKeys(raw, ['patientId', 'day'])
      || !isIntegerInRange(raw.patientId, 0, PATIENTS.length - 1) || !isIntegerInRange(raw.day, 1, day)) return fail();
    return { patientId: raw.patientId, day: raw.day };
  };
  const recentVisits = value.recentVisits.map(validateTarget);
  const keys = recentVisits.map(entry => `${entry.day}:${entry.patientId}`);
  if (new Set(keys).size !== keys.length) return fail();
  const specials = new Map<number, Extract<CurrentPaper, { kind: 'inspection-id' | 'inspection-fine' }>>();
  const ids = new Set<number>(), locations = new Map<number, 'desk' | 'drawer'>();
  let retainedFines = 0;
  for (const raw of value.papers) {
    if (!isRecord(raw) || !isIntegerInRange(raw.id, 1, nextPaperId - 1) || ids.has(raw.id)
      || (raw.location !== 'desk' && raw.location !== 'drawer')) return fail();
    ids.add(raw.id); locations.set(raw.id, raw.location);
    if (raw.kind !== 'inspection-id' && raw.kind !== 'inspection-fine') continue;
    if (!isIntegerInRange(raw.day, 2, day) || !isIntegerInRange(raw.inspectorId, 0, 2)) return fail();
    const inspectorId = raw.inspectorId as 0 | 1 | 2;
    if (raw.kind === 'inspection-id') {
      if (!hasOnlyKeys(raw, ['id', 'kind', 'day', 'patientId', 'location', 'inspectorId']) || raw.patientId !== null || raw.day !== day) return fail();
      specials.set(raw.id, { id: raw.id, kind: raw.kind, day: raw.day, patientId: null, location: raw.location, inspectorId });
    } else {
      if (!hasOnlyKeys(raw, ['id', 'kind', 'day', 'patientId', 'location', 'inspectorId', 'targetDay', 'amount'])
        || !isIntegerInRange(raw.patientId, 0, PATIENTS.length - 1) || !isIntegerInRange(raw.targetDay, 1, raw.day)
        || (raw.amount !== 50 && raw.amount !== 200)) return fail();
      specials.set(raw.id, { id: raw.id, kind: raw.kind, day: raw.day, patientId: raw.patientId, location: raw.location,
        targetDay: raw.targetDay, amount: raw.amount, inspectorId });
      if (raw.day === day) retainedFines += raw.amount;
    }
  }
  if (retainedFines > value.inspectionFines) return fail();
  let inspection: CurrentGameState['inspection'] = null;
  const cards = [...specials.values()].filter(paper => paper.kind === 'inspection-id');
  if (value.inspection !== null) {
    const raw = value.inspection;
    if (!isRecord(raw) || !hasOnlyKeys(raw, ['target', 'stage', 'idTaken', 'received', 'inspectorId'])
      || value.phase !== 'cabinet' || value.visit !== null || day === 1
      || !isIntegerInRange(value.clockMinutes, SHIFT_START_MINUTES, CLINIC_CLOSE_MINUTES - 1)
      || value.inspectionCheckedAt !== value.patientsProcessed
      || !isIntegerInRange(raw.inspectorId, 0, 2)
      || (raw.stage !== 'identity' && raw.stage !== 'records' && raw.stage !== 'confirm-missing')
      || typeof raw.idTaken !== 'boolean' || !Array.isArray(raw.received) || raw.received.length > 1
      || raw.received.some(kind => kind !== 'referral' && kind !== 'note')
      || (raw.stage === 'identity' ? raw.received.length > 0 : raw.idTaken)
      || cards.length !== Number(raw.idTaken)
      || cards.some(card => card.inspectorId !== raw.inspectorId)) return fail();
    const target = validateTarget(raw.target);
    if (!keys.includes(`${target.day}:${target.patientId}`)) return fail();
    inspection = { target, inspectorId: raw.inspectorId as 0 | 1 | 2, stage: raw.stage,
      idTaken: raw.idTaken, received: [...raw.received] as ('referral' | 'note')[] };
  } else if (cards.length) return fail();
  const seenClips = new Set<DocumentId>();
  const paperClips = value.paperClips.map(raw => {
    if (!Array.isArray(raw) || !raw.length || raw.length > ids.size + 1) return fail();
    let location: 'desk' | 'drawer' | undefined;
    return raw.map((id: unknown): DocumentId => {
      if (id !== 'certificate' && !isIntegerInRange(id, 1, GAME_LIMITS.paperId)) return fail();
      if (seenClips.has(id)) return fail();
      const current = id === 'certificate' ? (isRecord(value.visit) && value.visit.certificateTaken === true ? 'desk' : undefined) : locations.get(id);
      if (!current || (location && location !== current)) return fail();
      seenClips.add(id); location = current; return id;
    });
  });
  const { recentVisits: _recent, inspection: _inspection, inspectionCheckedAt, inspectionFines, ...old } = value;
  const previous = validateStateV24({ ...old,
    papers: value.papers.filter(raw => !specials.has((raw as { id: number }).id)),
    paperClips: paperClips.map(group => group.filter(id => id === 'certificate' || !specials.has(id))).filter(group => group.length),
  }, { fines: inspectionFines, catalogCharacters });
  if (previous.phase === 'intro' && (recentVisits.length || specials.size || inspectionFines)) return fail();
  for (const target of recentVisits) {
    if (target.day !== day) continue;
    const position = previous.roster.indexOf(target.patientId);
    if (position < 0 || position >= previous.shiftCompleted) return fail();
  }
  const papers = value.papers.map(raw => specials.get((raw as { id: number }).id)
    ?? previous.papers.find(paper => paper.id === (raw as { id: number }).id)!);
  return { ...previous, recentVisits, inspection, inspectionCheckedAt, inspectionFines, papers, paperClips };
}

/** Keep historical paid cash visible without paying it a second time. */
function migrateBanknotes(state: StateV25 | CurrentGameState): CurrentGameState {
  if ('banknotes' in state) return state;
  const visits = [state.visit, ...state.pendingReferrals.map(entry => entry.visit)]
    .filter(visit => visit?.bribe === 'accepted' && visit.startedDay === state.day);
  const count = state.phase === 'cabinet' ? Math.max(0, state.bribeIncome / 100, visits.length) : 0;
  return { ...state, banknotes: Array.from({ length: count }, (_, index) => ({ id: index + 1,
    patientId: visits[index]?.patientId ?? null, day: state.day, location: 'drawer', credited: true })) };
}

function validateStateV26(value: unknown, catalogCharacters = V27_CHARACTER_COUNT): CurrentGameState {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !Array.isArray(value.banknotes) || value.banknotes.length > catalogCharacters
    || !isIntegerInRange(value.money, -GAME_LIMITS.money, GAME_LIMITS.money)
    || !isIntegerInRange(value.day, 1, GAME_LIMITS.day)) return fail();
  const ids = new Set<number>(), owners = new Set<string>();
  const banknotes = value.banknotes.map((raw): CurrentGameState['banknotes'][number] => {
    if (!isRecord(raw) || !hasOnlyKeys(raw, ['id', 'patientId', 'day', 'location', 'credited'])
      || !isIntegerInRange(raw.id, 1, GAME_LIMITS.paperId) || ids.has(raw.id)
      || !isIntegerInRange(raw.day, 1, value.day as number) || workDayNumber(raw.day) < 6
      || (raw.patientId !== null && !isIntegerInRange(raw.patientId, 0, PATIENTS.length - 1))
      || (raw.location !== 'desk' && raw.location !== 'drawer') || typeof raw.credited !== 'boolean'
      || (raw.patientId === null && !raw.credited)) return fail();
    ids.add(raw.id);
    const owner = `${raw.day}:${raw.patientId}`;
    if (raw.patientId !== null && owners.has(owner)) return fail();
    if (raw.patientId !== null) owners.add(owner);
    return { id: raw.id, patientId: raw.patientId, day: raw.day, location: raw.location, credited: raw.credited };
  });
  const pending = banknotes.filter(note => !note.credited).length * 100;
  const { banknotes: _notes, ...old } = value;
  const previous = validateStateV25({ ...old, money: value.money + pending }, catalogCharacters);
  if (banknotes.length && (previous.phase !== 'cabinet' || workDayNumber(previous.day) < 6)) return fail();
  for (const note of banknotes) {
    const visit = [previous.visit, ...previous.pendingReferrals.map(entry => entry.visit)]
      .find(visit => visit?.patientId === note.patientId && visit.startedDay === note.day);
    if (visit && visit.bribe !== 'accepted') return fail();
  }
  return { ...previous, money: value.money, banknotes };
}

/** Old journals can only recover results evidenced by returned visits or retained reports. */
function migrateAdditionalNotes(state: CurrentGameState): CurrentGameState {
  const append = (order: NoteEntryId[], results: AdditionalResult[]): NoteEntryId[] => [
    ...order, ...new Set(results.map(additionalNoteEntry).filter(entry => !order.includes(entry))),
  ];
  const migrateVisit = (visit: CurrentVisit, pending?: PendingReferral): CurrentVisit => {
    const received = pending ? visit.additionalTests.filter((test, index) => index < visit.additionalTests.length - 1
      || visit.additionalResult?.test === test
      || state.papers.some(paper => paper.kind === 'additional-result' && paper.patientId === visit.patientId
        && paper.test === test && paper.day >= pending.sentDay)) : visit.additionalTests;
    return { ...visit, noteOrder: append(visit.noteOrder, received.map(test => additionalResultFor(effectivePatient(visit.patientId, visit.bribe !== 'none'), test))) };
  };
  const visit = state.visit ? migrateVisit(state.visit) : null;
  const pendingReferrals = state.pendingReferrals.map(pending => ({ ...pending, visit: migrateVisit(pending.visit, pending) }));
  const appointments = [...(visit ? [visit] : []), ...pendingReferrals.map(pending => pending.visit)];
  const papers = state.papers.map((paper): CurrentPaper => {
    if (paper.kind !== 'note' || paper.patientId === null) return paper;
    const appointment = appointments.find(entry => entry.patientId === paper.patientId && entry.startedDay === paper.day);
    // A completed historical report stores its issue day, not its original visit.
    // Only a same-day match is unambiguous without a surviving appointment.
    const results = appointment ? appointment.noteOrder.flatMap(entry => {
      const result = additionalNoteResult(entry); return result ? [result] : [];
    }) : state.papers.flatMap(report => report.kind === 'additional-result' && report.patientId === paper.patientId
      && report.day === paper.day ? [{ test: report.test, fit: report.fit }] : []);
    return { ...paper, noteOrder: append(paper.noteOrder, results) };
  });
  return { ...state, visit, pendingReferrals, papers };
}

/** v27 adds result-bearing journal entries; the v26 state schema stays frozen. */
function validateStateV27(value: unknown, catalogCharacters = V27_CHARACTER_COUNT): CurrentGameState {
  const fail = (): never => { throw new SaveError('invalid-state'); };
  if (!isRecord(value) || !Array.isArray(value.papers) || !Array.isArray(value.pendingReferrals)) return fail();
  const orders = new Map<string, NoteEntryId[]>();
  const strip = (raw: unknown, key: string): unknown => {
    if (!isRecord(raw) || !Array.isArray(raw.noteOrder) || raw.noteOrder.length > 12
      || raw.noteOrder.some(entry => typeof entry !== 'string')) return fail();
    const additional = raw.noteOrder.filter(entry => entry.startsWith('additional:'));
    if (additional.some(entry => !additionalNoteResult(entry))) return fail();
    orders.set(key, [...raw.noteOrder] as NoteEntryId[]);
    return { ...raw, noteOrder: raw.noteOrder.filter(entry => !entry.startsWith('additional:')) };
  };
  const previous = validateStateV26({ ...value,
    visit: value.visit === null ? null : strip(value.visit, 'visit'),
    papers: value.papers.map(paper => isRecord(paper) && paper.kind === 'note' ? strip(paper, `paper:${paper.id}`) : paper),
    pendingReferrals: value.pendingReferrals.map((pending, index) => {
      if (!isRecord(pending)) return fail();
      return { ...pending, visit: strip(pending.visit, `pending:${index}`) };
    }),
  }, catalogCharacters);
  const restore = <T extends CurrentVisit | Extract<CurrentPaper, { kind: 'note' }>>(record: T, key: string, pending = false): T => {
    const noteOrder = orders.get(key)!;
    const results = noteOrder.flatMap(entry => { const result = additionalNoteResult(entry); return result ? [result] : []; });
    const tests = results.map(result => result.test);
    const day = 'startedDay' in record ? record.startedDay : record.day;
    if (new Set(tests).size !== tests.length || (results.length && (record.patientId === null || workDayNumber(day) < 7))
      || results.some(result => result.fit !== additionalResultFor(effectivePatient(record.patientId!, record.bribe !== false && record.bribe !== 'none'), result.test).fit)) return fail();
    if ('additionalTests' in record) {
      const expected = record.additionalTests;
      if (results.length < expected.length - Number(pending) || results.length > expected.length
        || tests.some((test, index) => test !== expected[index])
        || (record.additionalResult && !noteOrder.includes(additionalNoteEntry(record.additionalResult)))
        || (!record.additionalResult && results.length > 0)) return fail();
    }
    return { ...record, noteOrder };
  };
  const visit = previous.visit ? restore(previous.visit, 'visit') : null;
  const pendingReferrals = previous.pendingReferrals.map((pending, index) => ({ ...pending, visit: restore(pending.visit, `pending:${index}`, true) }));
  const appointments = [...(visit ? [visit] : []), ...pendingReferrals.map(pending => pending.visit)];
  const papers = previous.papers.map((paper): CurrentPaper => {
    if (paper.kind !== 'note') return paper;
    const restored = restore(paper, `paper:${paper.id}`);
    const appointment = appointments.find(entry => entry.patientId === paper.patientId && entry.startedDay === paper.day);
    if (appointment && JSON.stringify(restored.noteOrder.filter(additionalNoteResult))
      !== JSON.stringify(appointment.noteOrder.filter(additionalNoteResult))) return fail();
    return restored;
  });
  return { ...previous, visit, pendingReferrals, papers };
}

/** Historical files remember only the admissions supported by their records. */
function migratePortraitHistory(state: CurrentGameState): LatestGameState {
  if ('portraitHistory' in state) return state as LatestGameState;
  const admissions = [
    ...state.recentVisits,
    ...state.roster.slice(0, state.shiftCompleted).map(patientId => ({ patientId, day: state.day })),
    ...state.pendingReferrals.map(({ visit }) => ({ patientId: visit.patientId, day: visit.startedDay })),
    ...(state.visit ? [{ patientId: state.visit.patientId, day: state.visit.startedDay }] : []),
  ].sort((a, b) => a.day - b.day);
  let portraitHistory: number[] = [];
  for (const { patientId } of admissions) {
    const character = PATIENTS[patientId]!.characterId;
    portraitHistory = [...portraitHistory.filter(id => id !== character), character];
  }
  return { ...state, portraitHistory };
}

function validateStateV29(value: unknown): LatestGameState {
  if (!isRecord(value) || !Array.isArray(value.portraitHistory)
    || value.portraitHistory.length > CHARACTER_COUNT
    || value.portraitHistory.some(id => !isIntegerInRange(id, 0, CHARACTER_COUNT - 1))
    || new Set(value.portraitHistory).size !== value.portraitHistory.length
    || (value.phase === 'intro' && value.portraitHistory.length > 0)) throw new SaveError('invalid-state');
  const { portraitHistory, ...previous } = value;
  const state = validateStateV27(previous, CHARACTER_COUNT);
  return { ...state, portraitHistory: [...portraitHistory] as number[] };
}

export function encodeSave(state: LatestGameState): Uint8Array {
  const envelope: SaveV30 = {
    game: 'next-please',
    version: 30,
    savedAt: new Date().toISOString(),
    state: validateStateV29(state),
  };
  return gzipSync(strToU8(JSON.stringify(envelope)), { level: 6, mtime: 0 });
}

const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff]!;
  return (crc ^ 0xffffffff) >>> 0;
}

function validateGzipHeader(bytes: Uint8Array, view: DataView): void {
  if (bytes.length < 20 || bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes[2] !== 8) {
    throw new SaveError('invalid-file');
  }
  const flags = bytes[3]!;
  if (flags & 0xe0) throw new SaveError('invalid-file');

  const trailerOffset = bytes.length - 8;
  let position = 10;
  if (flags & 4) {
    if (position + 2 > trailerOffset) throw new SaveError('invalid-file');
    position += 2 + view.getUint16(position, true);
  }
  for (const flag of [8, 16]) {
    if (flags & flag) {
      while (position < trailerOffset && bytes[position] !== 0) position += 1;
      position += 1;
    }
  }
  if (flags & 2) {
    if (position + 2 > trailerOffset || view.getUint16(position, true) !== (crc32(bytes.subarray(0, position)) & 0xffff)) {
      throw new SaveError('invalid-file');
    }
    position += 2;
  }
  if (position >= trailerOffset) throw new SaveError('invalid-file');
}

function decompressSave(bytes: Uint8Array): Uint8Array {
  if (bytes.length > MAX_SAVE_BYTES) throw new SaveError('file-too-large');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  validateGzipHeader(bytes, view);
  const expectedLength = view.getUint32(bytes.length - 4, true);

  const chunks: Uint8Array[] = [];
  let length = 0;
  let finished = false;
  const stream = new Gunzip((chunk, final) => {
    length += chunk.length;
    if (length > MAX_EXPANDED_SAVE_BYTES) throw new SaveError('file-too-large');
    if (chunk.length) chunks.push(chunk);
    finished = final;
  });
  // A save is one gzip member, not a concatenated archive.
  stream.onmember = () => { throw new SaveError('invalid-file'); };

  try {
    // Small compressed chunks bound each expansion step; never trust gzip ISIZE
    // as an allocation size, because imported files can forge it.
    for (let offset = 0; offset < bytes.length; offset += 256) {
      stream.push(bytes.subarray(offset, offset + 256), offset + 256 >= bytes.length);
    }
  } catch (error) {
    if (error instanceof SaveError) throw error;
    throw new SaveError('invalid-file');
  }
  if (!finished || length !== expectedLength) throw new SaveError('invalid-file');

  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  // fflate inflates gzip data but does not verify its CRC32 trailer.
  if (crc32(result) !== view.getUint32(bytes.length - 8, true)) throw new SaveError('invalid-file');
  return result;
}

export function decodeSave(bytes: Uint8Array): LatestGameState {
  const migration = { additionalNotes: false };
  const state = migrateBanknotes(migrateInspection(migrateBribeIncome(decodeState(bytes, migration))));
  return migratePortraitHistory(migration.additionalNotes ? migrateAdditionalNotes(state) : state);
}

function decodeState(bytes: Uint8Array, migration: { additionalNotes: boolean }): StateV23 | StateV24 | StateV25 | CurrentGameState {
  const expanded = decompressSave(bytes);
  let envelope: unknown;
  try {
    envelope = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(expanded));
  } catch {
    throw new SaveError('invalid-file');
  }
  if (!isRecord(envelope) || envelope.game !== 'next-please' || !Number.isSafeInteger(envelope.version)) {
    throw new SaveError('invalid-file');
  }
  if (!isIntegerInRange(envelope.version, 1, 30)) throw new SaveError('unsupported-version');
  if (
    !hasOnlyKeys(envelope, ['game', 'version', 'savedAt', 'state']) ||
    typeof envelope.savedAt !== 'string' ||
    !Number.isFinite(Date.parse(envelope.savedAt)) ||
    new Date(envelope.savedAt).toISOString() !== envelope.savedAt
  ) {
    throw new SaveError('invalid-file');
  }
  migration.additionalNotes = (envelope.version as number) < 27;
  if (envelope.version === 30) return validateStateV29(envelope.state);
  if (envelope.version === 29) {
    validateHistoricalCatalog(envelope.state, 5252, CHARACTER_COUNT);
    return validateStateV29(envelope.state);
  }
  // Catalog ceilings and exact field sets of older versions remain frozen.
  if (envelope.version === 28) {
    validateHistoricalCatalog(envelope.state, V28_CASE_LIMIT, V28_CHARACTER_COUNT);
    return validateStateV27(envelope.state, V28_CHARACTER_COUNT);
  }
  if (envelope.version >= 25) validateHistoricalCatalog(envelope.state, V27_CASE_LIMIT, V27_CHARACTER_COUNT);
  if (envelope.version === 27) return validateStateV27(envelope.state);
  if (envelope.version === 26) return validateStateV26(envelope.state);
  if (envelope.version === 25) return validateStateV25(envelope.state);
  // Catalog expansion must not relax any historical file's accepted identities.
  if (envelope.version >= 19) validateHistoricalCatalog(envelope.state);
  if (envelope.version === 24) return validateStateV24(envelope.state);
  if (envelope.version === 23) return validateStateV23(envelope.state);
  if (envelope.version === 22) return validateStateV20(envelope.state, true, true);
  if (envelope.version === 21) return validateStateV20(envelope.state, true);
  if (envelope.version === 20) return validateStateV20(envelope.state);
  if (envelope.version === 19) return { ...validateStateV19(envelope.state), budgetHistory: [] };
  if (envelope.version === 18) return { ...migrateAdditionalTests(validateStateV18(envelope.state)), budgetHistory: [] };
  const state = migrateNoteOrder(envelope.version === 16 || envelope.version === 17
    ? validateStateV16(envelope.state, envelope.version === 17)
    : migrateStateV15(decodeLegacyState(envelope.state, envelope.version as number)));
  // Validate the historical schema first; preserve the ledger and prefer the
  // already established hospital ending when a legacy settlement also has debt.
  return { ...migrateAdditionalTests(state.phase === 'home' && state.money < 0 && state.ending === null
    ? { ...state, ending: 'bankruptcy' } : state), budgetHistory: [] };
}

function decodeLegacyState(value: unknown, version: number): GameState {
  if (version === 1) {
    return {
      ...legacyInitialState(), ...validateStateV1(value),
      phase: 'cabinet', introStep: INTRO_SLIDES - 1,
    };
  }
  if (version === 2) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(migrateStateV4(migrateStateV3(migrateStateV2(validateStateV2(value)))))))));
  if (version === 3) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(migrateStateV4(migrateStateV3(validateStateV3(value))))))));
  if (version === 4) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(migrateStateV4(validateStateV4(value)))))));
  if (version === 5) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(validateStateV5(value))))));
  if (version === 6) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(validateStateV6(value)))));
  if (version === 7) return migrateStateV10(migrateStateV8(migrateStateV7(validateStateV7(value))));
  if (version === 8) return migrateStateV10(migrateStateV8(validateStateV8(value)));
  if (version === 11) return validateStateV11(value);
  if (version === 12 || version === 13 || version === 14 || version === 15) return validateStateV11(value, version);
  if (version !== 9 && version !== 10) throw new SaveError('unsupported-version');
  return migrateStateV10(validateBudgetState(value, version));
}

/** Call from a user action. Saves are downloaded; no account or server is used. */
export function downloadSave(state: LatestGameState): void {
  const bytes = new Uint8Array(encodeSave(state));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/gzip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `next-please-day-${state.day}.npsave`;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to start reading the download before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function importSave(file: File): Promise<LatestGameState> {
  if (file.size > MAX_SAVE_BYTES) throw new SaveError('file-too-large');
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new SaveError('read-failed');
  }
  return decodeSave(bytes);
}
