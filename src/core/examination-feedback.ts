import type { GameAction, Visit } from './game';
import { patientForAppointment } from './progression';
import { translations, type Locale } from '../i18n';

export type ExaminationComment = { kind: 'normal'; variant: number } | { kind: 'concern' | 'veryHigh' }
  | { kind: 'pressure'; systolic: number; diastolic: number }
  | { kind: 'measurements'; weight: number; height: number };

/** Snapshot a completed action; drawing never chooses or changes the result. */
export function examinationComment(action: GameAction, visit: Visit, previousNormal = -1): ExaminationComment | undefined {
  const patient = patientForAppointment(visit);
  const normal: ExaminationComment = { kind: 'normal', variant: (previousNormal + 1) % translations.pl.examinationSpeech.normal.length };
  if (action === 'run-general') return patient.general === 'pass' ? normal : { kind: 'concern' };
  if (action === 'run-vision') return patient.vision === 'pass' ? normal : { kind: 'concern' };
  if (action === 'run-pressure') {
    const reading = visit.pressureLatest;
    if (!reading) return;
    if (reading.systolic >= 180 || reading.diastolic >= 110) return { kind: 'veryHigh' };
    if (reading.systolic < 140 && reading.diastolic < 90) return normal;
    return { kind: 'pressure', ...reading };
  }
  if (action === 'run-measurements') return { kind: 'measurements', weight: patient.weight, height: patient.height };
}

export function examinationCommentText(comment: ExaminationComment, locale: Locale): string {
  const t = translations[locale];
  if (comment.kind === 'pressure') return `${comment.systolic}/${comment.diastolic}`;
  if (comment.kind === 'measurements') return `${comment.weight} ${t.paperwork.kg} / ${comment.height} ${t.paperwork.cm}`;
  if (comment.kind === 'normal') return t.examinationSpeech.normal[comment.variant]!;
  return t.examinationSpeech[comment.kind];
}
