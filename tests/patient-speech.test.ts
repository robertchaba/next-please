import { expect, it } from 'vitest';
import { choosePatientSpeech } from '../src/core/patient-speech';
import { translations } from '../src/i18n';
import { measureDocumentText } from '../src/render/font';

it('leaves most arrivals and approved departures silent, with varied short lines over shifts', () => {
  const arrivals = Array.from({ length: 12 }, (_, index) => choosePatientSpeech('arrival', { day: index + 1, patientId: 0 }));
  const departures = Array.from({ length: 12 }, (_, index) => choosePatientSpeech('departure', { day: index + 1, patientId: 0, decision: 'fit' }));
  expect(arrivals.filter(Boolean)).toHaveLength(4);
  expect(departures.filter(Boolean)).toHaveLength(4);
  expect(new Set(arrivals.filter(Boolean)).size).toBe(3);
  expect(new Set(departures.filter(Boolean)).size).toBe(4);
  expect([0, 1, 2].map(patientId => choosePatientSpeech('arrival', { day: 1, patientId }))).toEqual(['greeting', undefined, undefined]);
});

it('never thanks a patient for a refusal and keeps successful examinations quiet', () => {
  for (let day = 1; day < 40; day++) for (let patientId = 0; patientId < 3; patientId++) {
    expect(choosePatientSpeech('departure', { day, patientId, decision: 'unfit' })).toBeUndefined();
    expect(choosePatientSpeech('vision-pass', { day, patientId })).toBeUndefined();
  }
});

it('answers an unreadable eye chart with hesitation and varies repeated attempts deterministically', () => {
  const context = { day: 1, patientId: 1 };
  expect(choosePatientSpeech('vision-refer', context)).toBe('hesitate');
  const attempts = Array.from({ length: 5 }, (_, visionAttempt) => choosePatientSpeech('vision-refer', { ...context, visionAttempt }));
  expect(new Set(attempts).size).toBe(5);
  expect(choosePatientSpeech('vision-refer', { ...context, visionAttempt: 3 })).toBe(attempts[3]);
});

it('keeps every localized utterance within the patient alcove', () => {
  expect(Object.keys(translations.pl.patientSpeech)).toEqual(Object.keys(translations.en.patientSpeech));
  for (const locale of ['pl', 'en'] as const) {
    for (const line of Object.values(translations[locale].patientSpeech)) expect(measureDocumentText(line)).toBeLessThanOrEqual(79);
  }
});
