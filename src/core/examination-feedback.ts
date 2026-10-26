import type { GameAction, Visit } from './game';
import { PATIENTS } from './patients';
import { translations, type Locale } from '../i18n';

export type ExaminationComment = { kind: 'normal' | 'concern' | 'veryHigh' }
  | { kind: 'pressure'; systolic: number; diastolic: number }
  | { kind: 'measurements'; weight: number; height: number };

/** Snapshot a completed action; drawing never chooses or changes the result. */
export function examinationComment(action: GameAction, visit: Visit): ExaminationComment | undefined {
  const patient = PATIENTS[visit.patientId]!;
  if (action === 'run-general') return { kind: patient.general === 'pass' ? 'normal' : 'concern' };
  if (action === 'run-vision') return { kind: patient.vision === 'pass' ? 'normal' : 'concern' };
  if (action === 'run-pressure') {
    const reading = visit.pressureLatest;
    if (!reading) return;
    if (reading.systolic >= 180 || reading.diastolic >= 110) return { kind: 'veryHigh' };
    if (reading.systolic < 140 && reading.diastolic < 90) return { kind: 'normal' };
    return { kind: 'pressure', ...reading };
  }
  if (action === 'run-measurements') return { kind: 'measurements', weight: patient.weight, height: patient.height };
}

export function examinationCommentText(comment: ExaminationComment, locale: Locale): string {
  const t = translations[locale];
  if (comment.kind === 'pressure') return `${comment.systolic}/${comment.diastolic}`;
  if (comment.kind === 'measurements') return `${comment.weight} ${t.paperwork.kg} / ${comment.height} ${t.paperwork.cm}`;
  return t.examinationSpeech[comment.kind];
}
