import { isWeekend } from './calendar';
import { DISCRETIONARY_CASE_START, JOBS, type MedicalAssessment, type PatientCase } from './patients';
import type { Visit } from './game';
import { storyPatientForId } from './story-patients';

export const ADDITIONAL_TESTS = ['audiometry', 'vestibular', 'psychiatry', 'chest-xray'] as const;
export type AdditionalTest = typeof ADDITIONAL_TESTS[number];
/** fit means unequivocal clearance; the immutable case distinguishes doubtful reports. */
export interface AdditionalResult { test: AdditionalTest; fit: boolean; source?: 'provided' }
export function additionalAssessment(patient: Pick<PatientCase, 'id' | 'jobId' | 'caseVariant'>, result: AdditionalResult): MedicalAssessment {
  const story = storyPatientForId(patient.id);
  if (story?.actorId === 'printer' && result.test === 'audiometry') return result.fit ? 'fit' : 'discretionary';
  return result.fit ? 'fit' : patient.id >= DISCRETIONARY_CASE_START && patient.caseVariant === 4
    && additionalTestForJob(patient) === result.test ? 'discretionary' : 'unfit';
}
/** The journal stores the received finding even after its separate report leaves. */
export type AdditionalNoteEntry = `additional:${AdditionalTest}:${'fit' | 'unfit'}`;
export function additionalNoteEntry(result: AdditionalResult): AdditionalNoteEntry {
  return `additional:${result.test}:${result.fit ? 'fit' : 'unfit'}`;
}
export function additionalNoteResult(entry: string): AdditionalResult | null {
  const [prefix, test, outcome, extra] = entry.split(':');
  if (prefix !== 'additional' || !ADDITIONAL_TESTS.includes(test as AdditionalTest)
    || (outcome !== 'fit' && outcome !== 'unfit') || extra !== undefined) return null;
  return { test: test as AdditionalTest, fit: outcome === 'fit' };
}
export interface PendingReferral {
  visit: Visit;
  sentDay: number;
  returnDay: number;
  returnMinute: number;
  returnAfterCompleted: number;
  test: AdditionalTest;
  fit: boolean;
}

/** Game-specific occupations; the names and findings are localized separately. */
export function additionalTestForJob(patient: Pick<PatientCase, 'jobId'>): AdditionalTest | null {
  switch (JOBS[patient.jobId]?.key) {
    case 'furnace-operator': return 'audiometry';
    case 'offset-operator': return 'audiometry';
    case 'pilot': return 'vestibular';
    case 'militia-officer': return 'psychiatry';
    case 'miner': return 'chest-xray';
    default: return null;
  }
}
export function additionalTestForPatient(patient: Pick<PatientCase, 'jobId' | 'general'>): AdditionalTest | null {
  const test = additionalTestForJob(patient);
  return (test === 'psychiatry' || test === 'chest-xray') && patient.general !== 'refer' ? null : test;
}

/** A fixed case result, never sampled while reading or drawing the report. */
export function additionalResultFor(patient: Pick<PatientCase, 'id' | 'jobId' | 'general' | 'caseVariant'>, test: AdditionalTest): AdditionalResult {
  if (storyPatientForId(patient.id)?.actorId === 'printer' && test === 'audiometry') return { test, fit: false };
  const relevant = additionalTestForJob(patient) === test;
  return { test, fit: !relevant || patient.caseVariant !== 4 || (patient.id < DISCRETIONARY_CASE_START && patient.id % 2 === 0) };
}
export function nextWorkingDay(day: number): number {
  let next = day + 1;
  while (isWeekend(next)) next += 1;
  return next;
}
