/** Stable fictional case catalog: no real diagnostic thresholds or medical advice. */
export type PatientCondition = 'healthy' | 'vision' | 'pressure' | 'combined' | 'general';
export type ExaminationId = 'general' | 'vision' | 'pressure' | 'measurements';
export type RequirementId = 'full' | 'vision' | 'pressure';
export type ExposureId = 'paper-dust' | 'noise' | 'heights' | 'traffic' | 'textile-dust' | 'oil' | 'lifting' | 'stress' | 'fine-detail' | 'heat' | 'chemicals' | 'outdoors' | 'night-work' | 'standing' | 'food';
export type WorkPatternId = 'day' | 'early' | 'shifts' | 'night' | 'split' | 'seasonal';

/** Fictional game profiles, not clinical thresholds. The referral prints their code. */
export const REQUIREMENTS: Record<RequirementId, { code: string; examinations: readonly ExaminationId[]; disqualifying: readonly ('vision' | 'pressure')[] }> = {
  full: { code: 'WC', examinations: ['general', 'vision', 'pressure', 'measurements'], disqualifying: ['vision', 'pressure'] },
  vision: { code: 'W', examinations: ['general', 'vision', 'measurements'], disqualifying: ['vision'] },
  pressure: { code: 'C', examinations: ['general', 'pressure', 'measurements'], disqualifying: ['pressure'] },
};

export interface JobDefinition {
  id: number;
  key: string;
  requirementId: RequirementId;
  exposures: readonly ExposureId[];
  employerIds: readonly number[];
  managerial: boolean;
}

const job = (id: number, key: string, requirementId: RequirementId, exposures: readonly ExposureId[], employerIds: readonly number[], managerial = false): JobDefinition =>
  ({ id, key, requirementId, exposures, employerIds, managerial });

/** IDs and keys are append-only; labels and duty descriptions are in i18n.ts. */
export const JOBS: readonly JobDefinition[] = [
  job(0, 'archivist', 'full', ['paper-dust'], [0]),
  job(1, 'crane-operator', 'full', ['noise', 'heights'], [1]),
  job(2, 'driver', 'full', ['traffic'], [2]),
  job(3, 'weaver', 'full', ['textile-dust', 'noise'], [3]),
  job(4, 'mechanic', 'full', ['oil', 'noise'], [4]),
  job(5, 'caretaker', 'full', ['lifting'], [5]),
  job(6, 'storekeeper', 'full', ['lifting'], [6]),
  job(7, 'manager', 'full', ['stress'], [7], true),
  job(8, 'typesetter', 'vision', ['fine-detail', 'paper-dust'], [8]),
  job(9, 'watchmaker', 'vision', ['fine-detail'], [9]),
  job(10, 'tailor', 'vision', ['fine-detail', 'textile-dust'], [3, 10]),
  job(11, 'baker', 'pressure', ['heat', 'lifting', 'food'], [11]),
  job(12, 'cook', 'pressure', ['heat', 'standing', 'food'], [12, 19]),
  job(13, 'cleaner', 'pressure', ['chemicals', 'lifting'], [5, 12, 19]),
  job(14, 'gardener', 'pressure', ['outdoors', 'lifting'], [13]),
  job(15, 'post-carrier', 'pressure', ['outdoors', 'lifting'], [14]),
  job(16, 'electrician', 'full', ['heights', 'fine-detail'], [1, 15]),
  job(17, 'welder', 'full', ['heat', 'fine-detail'], [1, 4]),
  job(18, 'furnace-operator', 'full', ['heat', 'noise'], [1, 15]),
  job(19, 'lathe-operator', 'vision', ['fine-detail', 'noise'], [1, 4]),
  job(20, 'lab-assistant', 'vision', ['chemicals', 'fine-detail'], [16]),
  job(21, 'proofreader', 'vision', ['fine-detail', 'paper-dust'], [8]),
  job(22, 'bookbinder', 'vision', ['fine-detail', 'chemicals'], [8, 10]),
  job(23, 'laundry-worker', 'pressure', ['heat', 'chemicals'], [17]),
  job(24, 'boiler-attendant', 'pressure', ['heat', 'lifting'], [15, 17]),
  job(25, 'track-worker', 'full', ['traffic', 'outdoors'], [18]),
  job(26, 'signal-operator', 'full', ['traffic', 'night-work'], [18]),
  job(27, 'forklift-operator', 'full', ['traffic', 'lifting'], [6]),
  job(28, 'porter', 'pressure', ['lifting', 'standing'], [19, 6]),
  job(29, 'quality-inspector', 'vision', ['fine-detail', 'stress'], [1, 3, 10]),
  job(30, 'shift-supervisor', 'full', ['stress', 'noise'], [1, 3, 6], true),
  job(31, 'survey-assistant', 'full', ['outdoors', 'fine-detail'], [13, 15]),
];

export interface VisionValues { left: number; right: number }
export interface PressureValues { systolic: number; diastolic: number }

// Deliberately simplified game rules, not clinical diagnostic criteria.
export const VISION_LIMIT = 6;
export const PRESSURE_LIMIT = { systolic: 160, diastolic: 100 } as const;
export const VERY_HIGH_PRESSURE = { systolic: 180, diastolic: 110 } as const;
export const significantVisionDefect = (values: VisionValues): boolean => Math.abs(values.left) >= VISION_LIMIT || Math.abs(values.right) >= VISION_LIMIT;
export const disqualifyingPressure = (values: PressureValues): boolean => values.systolic >= PRESSURE_LIMIT.systolic || values.diastolic >= PRESSURE_LIMIT.diastolic;
export const veryHighPressure = (values: PressureValues): boolean => values.systolic >= VERY_HIGH_PRESSURE.systolic || values.diastolic >= VERY_HIGH_PRESSURE.diastolic;

export interface PatientCase {
  id: number;
  characterId: number;
  portraitId: string;
  employerId: number;
  jobId: number;
  caseVariant: number;
  conditionId: PatientCondition;
  general: 'pass' | 'refer';
  visionValues: VisionValues;
  pressureValues: PressureValues;
  vision: 'pass' | 'refer';
  pressure: 'pass' | 'refer';
  expectedDecision: 'fit' | 'unfit';
  birthDate: string;
  sex: 'female' | 'male';
  examination: 'initial' | 'periodic';
  managerial: boolean;
  weight: number;
  height: number;
  requirementId: RequirementId;
  workPatternId: WorkPatternId;
}

export const CHARACTER_COUNT = 53;
export const LEGACY_CASE_COUNT = 103;
type OriginalCase = Omit<PatientCase, 'general' | 'visionValues' | 'pressureValues'>;
const original: OriginalCase[] = [
  { id: 0, characterId: 0, portraitId: 'patient-0', employerId: 0, jobId: 0, caseVariant: 0, conditionId: 'healthy', vision: 'pass', pressure: 'pass', expectedDecision: 'fit', birthDate: '1952-04-18', sex: 'female', examination: 'periodic', managerial: false, weight: 62, height: 164, requirementId: 'full', workPatternId: 'day' },
  { id: 1, characterId: 1, portraitId: 'patient-1', employerId: 1, jobId: 1, caseVariant: 1, conditionId: 'vision', vision: 'refer', pressure: 'pass', expectedDecision: 'unfit', birthDate: '1947-11-06', sex: 'male', examination: 'initial', managerial: true, weight: 86, height: 178, requirementId: 'full', workPatternId: 'shifts' },
  { id: 2, characterId: 2, portraitId: 'patient-2', employerId: 2, jobId: 2, caseVariant: 2, conditionId: 'pressure', vision: 'pass', pressure: 'refer', expectedDecision: 'unfit', birthDate: '1958-08-23', sex: 'female', examination: 'periodic', managerial: false, weight: 71, height: 169, requirementId: 'full', workPatternId: 'shifts' },
];
const ages = [26, 53, 41, 30, 59, 44, 33, 61, 47, 24, 38, 49, 55, 36, 22, 57, 45, 28, 63, 40, 31, 52, 43, 34, 50];
const newAges = [32, 46, 60, 27, 39, 54, 23, 64, 48, 35, 56, 29, 42, 58, 25, 51, 37, 62, 44, 30, 55, 40, 33, 47, 59];
const conditions: PatientCondition[] = ['healthy', 'vision', 'pressure', 'combined'];
const patterns: WorkPatternId[] = ['day', 'early', 'shifts', 'night', 'split', 'seasonal'];

export function decisionForFindings(requirementId: RequirementId, findings: Pick<PatientCase, 'vision' | 'pressure'> & Partial<Pick<PatientCase, 'general'>>): 'fit' | 'unfit' {
  return findings.general === 'refer' || REQUIREMENTS[requirementId].disqualifying.some(examination => findings[examination] === 'refer') ? 'unfit' : 'fit';
}

export function requiredExaminations(patient: PatientCase): readonly ExaminationId[] {
  return REQUIREMENTS[patient.requirementId].examinations;
}

export function hasRequiredExaminations(patient: PatientCase, visit: { generalTested: boolean; visionTested: boolean; pressureTested: boolean; measurementsTaken: boolean }): boolean {
  const completed = { general: visit.generalTested, vision: visit.visionTested, pressure: visit.pressureTested, measurements: visit.measurementsTaken };
  return requiredExaminations(patient).every(examination => completed[examination]);
}

const establishedCases: readonly OriginalCase[] = [
  ...original,
  ...Array.from({ length: 25 * 4 }, (_, index): OriginalCase => {
    const person = Math.floor(index / 4), variant = index % 4;
    return {
      id: 3 + index, characterId: 3 + person, portraitId: `patient-${String(person + 1).padStart(2, '0')}`,
      employerId: (person + variant * 3) % 8, jobId: (person * 3 + variant) % 8,
      caseVariant: variant, conditionId: conditions[variant]!,
      vision: variant === 1 || variant === 3 ? 'refer' : 'pass',
      pressure: variant >= 2 ? 'refer' : 'pass', expectedDecision: variant === 0 ? 'fit' : 'unfit',
      birthDate: `${1983 - ages[person]! - ((1 + person % 12 > 11 || (1 + person % 12 === 11 && 1 + (person * 3) % 28 > 3)) ? 1 : 0)}-${String(1 + person % 12).padStart(2, '0')}-${String(1 + (person * 3) % 28).padStart(2, '0')}`,
      sex: person % 2 === 0 ? 'female' : 'male', examination: variant % 2 === 0 ? 'periodic' : 'initial',
      managerial: (person * 3 + variant) % 8 === 7,
      weight: 53 + (person * 7) % 43 + variant, height: 156 + (person * 5) % 32,
      requirementId: 'full', workPatternId: patterns[(person + variant) % patterns.length]!,
    };
  }),
  ...Array.from({ length: 25 * 8 }, (_, index): OriginalCase => {
    const person = Math.floor(index / 8), variant = index % 8, condition = variant % 4;
    const job = JOBS[8 + (person * 7 + Math.floor(variant / 4) * 11) % 24]!;
    const vision = condition === 1 || condition === 3 ? 'refer' : 'pass';
    const pressure = condition >= 2 ? 'refer' : 'pass';
    const month = 1 + (person * 5) % 12, date = 1 + (person * 7) % 28;
    return {
      id: LEGACY_CASE_COUNT + index, characterId: 28 + person, portraitId: `patient-${String(26 + person).padStart(2, '0')}`,
      employerId: job.employerIds[(person + Math.floor(variant / 4)) % job.employerIds.length]!, jobId: job.id,
      caseVariant: variant, conditionId: conditions[condition]!, vision, pressure,
      expectedDecision: decisionForFindings(job.requirementId, { vision, pressure }),
      birthDate: `${1983 - newAges[person]! - (month > 11 || (month === 11 && date > 3) ? 1 : 0)}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
      sex: person % 2 === 0 ? 'male' : 'female', examination: variant < 4 ? 'initial' : 'periodic',
      managerial: job.managerial, weight: 52 + (person * 11) % 49, height: 154 + (person * 7) % 37,
      requirementId: job.requirementId, workPatternId: patterns[(person + Math.floor(variant / 4)) % patterns.length]!,
    };
  }),
];

/** Stable measurements attach to case IDs without altering legacy case decisions. */
function withMeasurements(patient: OriginalCase, general: 'pass' | 'refer' = 'pass'): PatientCase {
  const id = patient.id;
  const visionValues: VisionValues = patient.vision === 'refer'
    ? { left: -(6 + id % 4), right: -(2 + id % 6) }
    : { left: -(id % 6) / 2 || 0, right: -((id * 3) % 6) / 2 || 0 };
  const pressureValues: PressureValues = patient.pressure === 'refer'
    ? { systolic: 160 + (id % 8) * 8, diastolic: 100 + (id % 7) * 4 }
    : { systolic: 108 + (id % 20) * 2, diastolic: 62 + (id % 14) * 2 };
  return { ...patient, general, visionValues, pressureValues };
}

export const PATIENTS: readonly PatientCase[] = [
  ...establishedCases.map(patient => withMeasurements(patient)),
  // Append-only general-examination cases preserve every older save's identity.
  ...Array.from({ length: 25 }, (_, person): PatientCase => {
    const original = establishedCases[LEGACY_CASE_COUNT + person * 8]!;
    return withMeasurements({ ...original, id: establishedCases.length + person,
      caseVariant: 8, conditionId: 'general', vision: 'pass', pressure: 'pass', expectedDecision: 'unfit' }, 'refer');
  }),
];

const CASES_BY_CHARACTER = Array.from({ length: CHARACTER_COUNT }, (_, characterId) => PATIENTS.filter(patient => patient.characterId === characterId).map(patient => patient.id));

/** Explicit unsigned state makes replay/import independent of browser randomness. */
export function randomStep(seed: number): { value: number; seed: number } {
  const next = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return { value: next / 0x1_0000_0000, seed: next };
}

export function createRoster(seed: number, _tutorial = false): { roster: number[]; seed: number } {
  const ids = Array.from({ length: CHARACTER_COUNT }, (_, index) => index);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const random = randomStep(seed); seed = random.seed;
    const target = Math.floor(random.value * (i + 1));
    [ids[i], ids[target]] = [ids[target]!, ids[i]!];
  }
  const roster = ids.map(characterId => {
    const cases = CASES_BY_CHARACTER[characterId]!;
    if (cases.length === 1) return cases[0]!;
    const random = randomStep(seed); seed = random.seed;
    return cases[Math.floor(random.value * cases.length)]!;
  });
  return { roster, seed };
}
