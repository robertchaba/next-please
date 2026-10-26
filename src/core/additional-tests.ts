import { isWeekend } from './calendar';
import { JOBS, type PatientCase } from './patients';
import type { Visit } from './game';

export const ADDITIONAL_TESTS = ['audiometry', 'vestibular', 'psychiatry', 'chest-xray'] as const;
export type AdditionalTest = typeof ADDITIONAL_TESTS[number];
export interface AdditionalResult { test: AdditionalTest; fit: boolean }
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
  const relevant = additionalTestForJob(patient) === test;
  return { test, fit: !relevant || patient.caseVariant !== 4 || patient.id % 2 === 0 };
}
export function nextWorkingDay(day: number): number {
  let next = day + 1;
  while (isWeekend(next)) next += 1;
  return next;
}
