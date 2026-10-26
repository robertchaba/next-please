import { expect, it } from 'vitest';
import { examinationComment, examinationCommentText } from '../src/core/examination-feedback';
import { applyAction, createInitialState, type GameAction } from '../src/core/game';
import { PATIENTS } from '../src/core/patients';
import { measureDocumentText } from '../src/render/font';

it('comments on the latest measurement even after the two recorded values are fixed', () => {
  const initial = createInitialState(3);
  const ready = (['skip-intro', 'call-patient', 'take-document', 'run-pressure', 'run-pressure'] as GameAction[])
    .reduce((state, action) => applyAction(state, action).state, initial);
  const visit = { ...ready.visit!, pressureLatest: { systolic: 145, diastolic: 90 } };
  const before = structuredClone(visit);
  expect(examinationComment('run-pressure', visit)).toEqual({ kind: 'pressure', systolic: 145, diastolic: 90 });
  expect(examinationCommentText(examinationComment('run-pressure', visit)!, 'pl')).toBe('145/90');
  expect(examinationComment('run-pressure', { ...visit, pressureLatest: { systolic: 190, diastolic: 110 } })).toEqual({ kind: 'veryHigh' });
  expect(examinationComment('run-pressure', { ...visit, pressureLatest: { systolic: 120, diastolic: 80 } })).toEqual({ kind: 'normal' });
  expect(examinationComment('toggle-lamp', visit)).toBeUndefined();
  expect(visit).toEqual(before);
});

it('keeps every patient result brief and legible in both localized balloons', () => {
  const initial = createInitialState(3);
  const state = applyAction(applyAction(initial, 'skip-intro').state, 'call-patient').state;
  for (const patient of PATIENTS) for (const locale of ['pl', 'en'] as const) {
    for (const action of ['run-general', 'run-vision', 'run-pressure', 'run-measurements'] as const) {
      const visit = { ...state.visit!, patientId: patient.id, pressureLatest: patient.pressureValues };
      const comment = examinationComment(action, visit)!;
      const text = examinationCommentText(comment, locale);
      expect(text).not.toContain('undefined');
      expect(measureDocumentText(text)).toBeLessThanOrEqual(100);
    }
  }
});
