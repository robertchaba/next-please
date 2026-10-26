import { isWeekend } from './calendar';
import { Gunzip, gzipSync, strToU8 } from 'fflate';
import { ARRIVAL_MINUTES, CLINIC_CLOSE_MINUTES, createInitialState, GAME_LIMITS, INTRO_SLIDES, PATIENTS, SHIFT_END_MINUTES, SHIFT_START_MINUTES, type GameState, type Visit, type Paper, type DocumentId } from './game';

import { CHARACTER_COUNT, disqualifyingPressure, type ExaminationId, type PressureValues } from './patients';
import { BASE_INSURANCE, BASE_PAY, PATIENT_BONUS, type DaySettlement, type DailyConsequences } from './economy';

export { createInitialState } from './game';
export type { GameState } from './game';

interface LegacyState {
  day: number;
  money: number;
  patientsProcessed: number;
}

const SHIFT_LENGTH = 3; // Original version 2–8 fixture limit never changes.
const V10_CASE_LIMIT = 302;
const V12_CASE_LIMIT = 327;
const V14_CASE_LIMIT = 552;
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

interface SaveV15 {
  game: 'next-please';
  version: 15;
  savedAt: string;
  state: GameState;
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
  return { ...createInitialState(0x4e505301), rngState: 3477621340,
    roster: [0, 1, 2, 62, 49, 75, 81, 66, 98, 4, 67, 43, 34, 28, 42, 58, 15, 21, 89, 26, 93, 52, 100, 8, 72, 86, 14, 38] };
}

function migrateStateV8(state: GameStateV8): GameStateV10 {
  // Historical counters and papers remain intact. No salary or penalties are
  // invented for already completed appointments; the current day settles once.
  return { ...legacyInitialState(), ...state };
}

function validateBudgetState(value: unknown, version: 9 | 10, maxPatient = V10_CASE_LIMIT, overtime = false, maxCharacters = V12_CHARACTER_COUNT): GameStateV10 {
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
    || !Array.isArray(value.roster) || !(version === 9 ? value.roster.length === 28 : [0, 28, V12_CHARACTER_COUNT, maxCharacters].includes(value.roster.length))) return fail();
  const restDay = version === 10 && value.roster.length === 0;
  const rosterLimit = value.roster.length;
  const caseLimit = rosterLimit === 28 ? 102 : rosterLimit === V12_CHARACTER_COUNT ? Math.min(V12_CASE_LIMIT, maxPatient) : maxPatient;
  if ((restDay && (value.phase !== 'home' || !isWeekend(value.day) || value.shiftCompleted !== 0))
    || value.shiftCompleted > value.roster.length
    || (version === 10 && !isIntegerInRange(value.previousMonthBalance, -GAME_LIMITS.money, GAME_LIMITS.money))) return fail();
  const characters = new Set<number>();
  const roster = value.roster.map((id: unknown): number => {
    if (!isIntegerInRange(id, 0, caseLimit)) return fail();
    const character = PATIENTS[id]!.characterId;
    if (characters.has(character) || character >= rosterLimit) return fail();
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
  const minimum = visit ? SHIFT_START_MINUTES + value.shiftCompleted * 4 + (visit.document === 'desk' ? 1 : 0)
    + (visit.visionTested ? 3 : 0) + (visit.pressureTested ? 4 : 0) + (visit.measurementsTaken ? 2 : 0) + (visit.decision ? 1 : 0)
    : value.shiftCompleted ? SHIFT_START_MINUTES + value.shiftCompleted * 4 - 1 : ARRIVAL_MINUTES;
  if (value.clockMinutes < Math.min(SHIFT_END_MINUTES, minimum)) return fail();
  const rawDaily = value.daily;
  if (!isRecord(rawDaily) || !hasOnlyKeys(rawDaily, ['zusCases', 'refusals', 'fines', 'insuranceIncrease'])
    || !isIntegerInRange(rawDaily.zusCases, 0, value.shiftCompleted) || !isIntegerInRange(rawDaily.refusals, 0, value.shiftCompleted)
    || rawDaily.zusCases + rawDaily.refusals > value.shiftCompleted
    || rawDaily.fines !== (rawDaily.zusCases ? 100 + (rawDaily.zusCases - 1) * 400 : 0)
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
      if (casePapers.has(key)) return fail();
      casePapers.add(key);
    }
    if (paper.day === value.day && paper.patientId !== null) {
      const position = roster.indexOf(paper.patientId);
      const interrupted = overtime && value.phase === 'home' && value.clockMinutes === CLINIC_CLOSE_MINUTES;
      if (position < 0 || position > value.shiftCompleted
        || (position === value.shiftCompleted && (paper.kind === 'letter'
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
    const basePay = restDay ? 0 : BASE_PAY;
    if (visit !== null || (overtime ? value.clockMinutes < SHIFT_END_MINUTES : value.clockMinutes !== SHIFT_END_MINUTES) || !isRecord(entry)
      || !hasOnlyKeys(entry, ['day', 'patients', 'basePay', 'patientBonus', 'income', 'livingCost', 'insuranceCost', 'fines', 'event', 'expenses', 'openingBalance', 'closingBalance'])
      || entry.day !== value.day || entry.patients !== value.shiftCompleted || entry.basePay !== basePay
      || entry.patientBonus !== value.shiftCompleted * PATIENT_BONUS || entry.income !== basePay + value.shiftCompleted * PATIENT_BONUS
      || !isIntegerInRange(entry.livingCost, 400, 800) || entry.insuranceCost !== value.insuranceRate || entry.fines !== daily.fines
      || !isIntegerInRange(entry.openingBalance, -GAME_LIMITS.money, GAME_LIMITS.money) || entry.closingBalance !== value.money) return fail();
    let event: DaySettlement['event'] = null;
    const available = entry.openingBalance + (entry.income as number) - entry.livingCost - value.insuranceRate - daily.fines;
    if (entry.event !== null) {
      if (!isRecord(entry.event) || !hasOnlyKeys(entry.event, ['kind', 'cost'])
        || (entry.event.kind !== 'medicine' && entry.event.kind !== 'car-repair' && entry.event.kind !== 'home-repair' && entry.event.kind !== 'fur-coat' && !(restDay && (entry.event.kind === 'mountain-trip' || entry.event.kind === 'seaside-trip')))
        || available <= 2000 || !isIntegerInRange(entry.event.cost, 200, Math.min(available, 700 + Math.floor((available - 2000) * 0.75)))) return fail();
      event = { kind: entry.event.kind, cost: entry.event.cost };
    }
    const expenses = entry.livingCost + value.insuranceRate + daily.fines + (event?.cost ?? 0);
    if (entry.expenses !== expenses || entry.closingBalance !== entry.openingBalance + (entry.income as number) - expenses) return fail();
    settlement = { day: value.day, patients: value.shiftCompleted, basePay, patientBonus: value.shiftCompleted * PATIENT_BONUS,
      income: basePay + value.shiftCompleted * PATIENT_BONUS, livingCost: entry.livingCost, insuranceCost: value.insuranceRate,
      fines: daily.fines, event, expenses, openingBalance: entry.openingBalance, closingBalance: value.money };
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

function validatePressureReadings(value: unknown, patientId: number | null, measured: boolean): PressureValues[] {
  if (!Array.isArray(value) || value.length > 2 || (value.length > 0) !== measured || (measured && patientId === null)) throw new SaveError('invalid-state');
  const patient = patientId === null ? null : PATIENTS[patientId]!;
  const readings = value.map((reading): PressureValues => {
    if (!patient || !isRecord(reading) || !hasOnlyKeys(reading, ['systolic', 'diastolic'])
      || !isIntegerInRange(reading.systolic, patient.pressureValues.systolic - 3, patient.pressureValues.systolic + 3)
      || !isIntegerInRange(reading.diastolic, patient.pressureValues.diastolic - 2, patient.pressureValues.diastolic + 2)
      || disqualifyingPressure({ systolic: reading.systolic, diastolic: reading.diastolic }) !== (patient.pressure === 'refer')) throw new SaveError('invalid-state');
    return { systolic: reading.systolic, diastolic: reading.diastolic };
  });
  if (readings.length === 2 && readings[0]!.systolic === readings[1]!.systolic && readings[0]!.diastolic === readings[1]!.diastolic) throw new SaveError('invalid-state');
  return readings;
}

function validatePaperV11(value: unknown, day: number, version: 11 | 12 | 13 | 14 | 15): Paper {
  const maxPatient = version >= 15 ? PATIENTS.length - 1 : version >= 13 ? V14_CASE_LIMIT : V12_CASE_LIMIT;
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
  const patient = value.patientId === null ? null : PATIENTS[value.patientId]!;
  const pressureReadings = version >= 12 ? validatePressureReadings(results.pressureReadings, value.patientId as number | null, results.pressure !== null)
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
function validateStateV11(value: unknown, version: 11 | 12 | 13 | 14 | 15 = 11): GameState {
  const maxPatient = version >= 15 ? PATIENTS.length - 1 : version >= 13 ? V14_CASE_LIMIT : V12_CASE_LIMIT;
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
    pressureReadings = version >= 12 ? validatePressureReadings(entry.pressureReadings, entry.patientId, entry.pressureTested)
      : entry.pressureTested ? [{ ...PATIENTS[entry.patientId]!.pressureValues }] : [];
    pressureLatest = version >= 12
      ? validatePressureReadings(entry.pressureLatest === null ? [] : [entry.pressureLatest], entry.patientId, entry.pressureTested)[0] ?? null
      : pressureReadings[0] ? { ...pressureReadings[0] } : null;
    if (pressureReadings.length === 1 && (pressureLatest?.systolic !== pressureReadings[0]!.systolic
      || pressureLatest.diastolic !== pressureReadings[0]!.diastolic)) throw new SaveError('invalid-state');
    const { generalTested: general, examinationOrder: _order, pressureReadings: _readings, pressureLatest: _latest, ...previous } = entry;
    generalTested = general;
    oldVisit = previous;
  }
  const papers = value.papers.map(paper => validatePaperV11(paper, value.day as number, version));
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
  const previous = validateBudgetState({ ...value, visit: oldVisit, papers: oldPapers }, 10, maxPatient, version >= 12, version >= 13 ? CHARACTER_COUNT : V12_CHARACTER_COUNT);
  const visit: Visit | null = previous.visit ? { ...previous.visit, generalTested, examinationOrder, pressureReadings, pressureLatest } : null;
  if (visit) {
    const minimum = SHIFT_START_MINUTES + previous.shiftCompleted * 4 + (visit.document === 'desk' ? 1 : 0)
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

export function encodeSave(state: GameState): Uint8Array {
  const envelope: SaveV15 = {
    game: 'next-please',
    version: 15,
    savedAt: new Date().toISOString(),
    state: validateStateV11(state, 15),
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

export function decodeSave(bytes: Uint8Array): GameState {
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
  if (envelope.version !== 1 && envelope.version !== 2 && envelope.version !== 3 && envelope.version !== 4 && envelope.version !== 5 && envelope.version !== 6 && envelope.version !== 7 && envelope.version !== 8 && envelope.version !== 9 && envelope.version !== 10 && envelope.version !== 11 && envelope.version !== 12 && envelope.version !== 13 && envelope.version !== 14 && envelope.version !== 15) throw new SaveError('unsupported-version');
  if (
    !hasOnlyKeys(envelope, ['game', 'version', 'savedAt', 'state']) ||
    typeof envelope.savedAt !== 'string' ||
    !Number.isFinite(Date.parse(envelope.savedAt)) ||
    new Date(envelope.savedAt).toISOString() !== envelope.savedAt
  ) {
    throw new SaveError('invalid-file');
  }
  if (envelope.version === 1) {
    return {
      ...legacyInitialState(), ...validateStateV1(envelope.state),
      phase: 'cabinet', introStep: INTRO_SLIDES - 1,
    };
  }
  if (envelope.version === 2) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(migrateStateV4(migrateStateV3(migrateStateV2(validateStateV2(envelope.state)))))))));
  if (envelope.version === 3) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(migrateStateV4(migrateStateV3(validateStateV3(envelope.state))))))));
  if (envelope.version === 4) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(migrateStateV4(validateStateV4(envelope.state)))))));
  if (envelope.version === 5) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(migrateStateV5(validateStateV5(envelope.state))))));
  if (envelope.version === 6) return migrateStateV10(migrateStateV8(migrateStateV7(migrateStateV6(validateStateV6(envelope.state)))));
  if (envelope.version === 7) return migrateStateV10(migrateStateV8(migrateStateV7(validateStateV7(envelope.state))));
  if (envelope.version === 8) return migrateStateV10(migrateStateV8(validateStateV8(envelope.state)));
  if (envelope.version === 11) return validateStateV11(envelope.state);
  if (envelope.version === 12 || envelope.version === 13 || envelope.version === 14 || envelope.version === 15) return validateStateV11(envelope.state, envelope.version);
  return migrateStateV10(validateBudgetState(envelope.state, envelope.version));
}

/** Call from a user action. Saves are downloaded; no account or server is used. */
export function downloadSave(state: GameState): void {
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

export async function importSave(file: File): Promise<GameState> {
  if (file.size > MAX_SAVE_BYTES) throw new SaveError('file-too-large');
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new SaveError('read-failed');
  }
  return decodeSave(bytes);
}
