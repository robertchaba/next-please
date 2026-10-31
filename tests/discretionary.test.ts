import { createInitialState } from './fixtures/routine';
import { historicalState, withMigratedNewspaper } from './fixtures/legacy-budget';
import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, type GameState } from '../src/core/game';
import { additionalAssessment, additionalResultFor, additionalTestForJob } from '../src/core/additional-tests';
import { DISCRETIONARY_CASE_START, PATIENTS, createRoster, medicalAssessment, pressureAssessment, visionAssessment } from '../src/core/patients';
import { createDailyRoster, expectedVisitDecision } from '../src/core/progression';
import { decodeSave, encodeSave } from '../src/core/save';
import { additionalResultText, noteEntries, paperDescription } from '../src/render/paperwork';
import { wrapReadingText } from '../src/render/document-copy';
import { translations } from '../src/i18n';
import { act, attachReport, discretionaryAppointment, receiveDiscretionary, sendDiscretionary } from './fixtures/discretionary';

const newCases = PATIENTS.slice(DISCRETIONARY_CASE_START);
const file = (state: unknown, version = 31) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-31T12:00:00.000Z', state: historicalState(state, version) })));
const roundTrip = (state: GameState) => expect(decodeSave(encodeSave(state))).toEqual(state);

describe('medical judgement at the limits', () => {
  it('respects both eyes, signs, pressure components and inclusive five-unit margins', () => {
    for (const values of [{ left: -6, right: 0 }, { left: 0, right: 6 }, { left: 6, right: -6 }]) expect(visionAssessment(values)).toBe('discretionary');
    expect(visionAssessment({ left: -6, right: 6.25 })).toBe('unfit');
    expect(visionAssessment({ left: -5.75, right: 5.75 })).toBe('fit');
    for (const [systolic, diastolic] of [[155, 80], [165, 80], [120, 95], [120, 105], [160, 100]]) {
      expect(pressureAssessment({ systolic: systolic!, diastolic: diastolic! })).toBe('discretionary');
    }
    expect(pressureAssessment({ systolic: 154, diastolic: 94 })).toBe('fit');
    expect(pressureAssessment({ systolic: 166, diastolic: 95 })).toBe('unfit');
    expect(pressureAssessment({ systolic: 155, diastolic: 106 })).toBe('unfit');
  });

  it.each(['fit', 'unfit'] as const)('accepts %s for borderline vision and pressure without a detection draw, letter or charge', decision => {
    const cases = [PATIENTS[4]!, ...['vision', 'pressure'].map(condition => newCases.find(patient => patient.conditionId === condition)!)];
    for (const patient of cases) for (const seed of [0, 123456, 0xffffffff]) {
      let state = act(discretionaryAppointment(patient.id), 'take-document', 'take-paper', 'take-certificate', 'write-certificate',
        'run-general', 'run-vision', 'run-pressure', 'run-measurements', `stamp-${decision}`);
      expect(expectedVisitDecision(state)).toBe('discretionary');
      roundTrip(state);
      state = { ...state, rngState: seed };
      const result = applyAction(state, 'return-document');
      expect(result.feedback).toBe('patient-cleared');
      expect(result.state.rngState).toBe(seed);
      expect(result.state.daily).toEqual(state.daily);
      expect(result.state.insuranceRate).toBe(state.insuranceRate);
      expect(result.state.papers.some(paper => paper.kind === 'letter')).toBe(false);
      roundTrip(result.state);
    }
  });

  it('lets repeated borderline pressure cross the nominal threshold without changing the decision or notes', () => {
    const patient = newCases.find(patient => patient.conditionId === 'pressure')!;
    let state = act(discretionaryAppointment(patient.id), 'take-paper', 'run-pressure');
    let above = false, below = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      state = act(state, 'run-pressure');
      const value = state.visit!.pressureLatest!;
      above ||= value.systolic > 160; below ||= value.systolic < 160;
      expect(expectedVisitDecision(state)).toBe('discretionary');
      expect(pressureAssessment(value)).toBe('discretionary');
      roundTrip(state);
    }
    expect(above && below).toBe(true);
    expect(state.visit!.pressureReadings).toHaveLength(2);
    const invalid = structuredClone(state);
    invalid.visit!.pressureLatest = { systolic: 166, diastolic: 100 };
    expect(() => decodeSave(file(invalid))).toThrow();
  });

  it('preserves independent medical contraindications and formal duties', () => {
    const combined = PATIENTS.find(patient => patient.general === 'pass' && visionAssessment(patient.visionValues) === 'discretionary'
      && pressureAssessment(patient.pressureValues) === 'unfit' && patient.requirementId === 'full')!;
    expect(expectedVisitDecision(discretionaryAppointment(combined.id))).toBe('unfit');
    const patient = newCases.find(patient => patient.conditionId === 'vision')!;
    const state = discretionaryAppointment(patient.id, 9);
    expect(expectedVisitDecision({ ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, ageDays: 4 } } })).toBe('unfit');
    expect(expectedVisitDecision({ ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, authentic: false } } })).toBe('unfit');
    const irrelevant = PATIENTS.find(patient => patient.requirementId === 'pressure' && visionAssessment(patient.visionValues) === 'discretionary' && patient.pressure === 'pass' && patient.general === 'pass')!;
    expect(expectedVisitDecision(discretionaryAppointment(irrelevant.id))).toBe('fit');
  });

  it('retains discretion with a positive hypertension certificate and with a managerial job or genuine unclear seal', () => {
    const pressure = newCases.find(patient => patient.conditionId === 'pressure')!;
    const state = discretionaryAppointment(pressure.id, 6);
    expect(expectedVisitDecision({ ...state, visit: { ...state.visit!, specialist: { jobId: pressure.jobId, phone: '43-1234' } } })).toBe('discretionary');
    const manager = newCases.find(patient => patient.managerial && patient.conditionId !== 'general')!;
    let managerial = discretionaryAppointment(manager.id, 9);
    managerial = { ...managerial, visit: { ...managerial.visit!, referral: { ...managerial.visit!.referral, seal: 'unclear' } } };
    for (const decision of ['fit', 'unfit'] as const) {
      const completed = act(managerial, 'take-document', 'take-certificate', 'write-certificate', `stamp-${decision}`, 'return-document');
      expect(completed.daily).toEqual(managerial.daily);
      expect(completed.papers.some(paper => paper.kind === 'letter')).toBe(false);
    }
  });

  it('keeps ambiguity near one fifth of former refusal slots across seeded early and late queues', () => {
    for (const day of [1, 9]) {
      let refused = 0, doubtful = 0;
      for (let seed = 0; seed < 128; seed++) for (const id of createDailyRoster(seed, day).roster) {
        const patient = PATIENTS[id]!;
        if (patient.expectedDecision !== 'unfit') continue;
        refused++;
        doubtful += Number(id >= DISCRETIONARY_CASE_START || medicalAssessment(patient) === 'discretionary');
      }
      expect(doubtful / refused).toBeGreaterThan(0.17);
      expect(doubtful / refused).toBeLessThan(0.23);
    }
  });

  it('imports v29 without changing findings or RNG, and rejects new IDs disguised as v29', () => {
    const old = { ...createInitialState(1), roster: createRoster(1, false, patient => patient.id < DISCRETIONARY_CASE_START).roster };
    expect(decodeSave(file(old, 29))).toEqual(withMigratedNewspaper(old));
    expect(() => decodeSave(file(discretionaryAppointment(DISCRETIONARY_CASE_START), 29))).toThrow();
  });
});

describe('equivocal specialist opinions', () => {
  it.each([18, 46, 45, 47])('preserves the job %i opinion through referral, return, filing and either decision', jobId => {
    const patient = newCases.find(patient => patient.jobId === jobId && patient.caseVariant === 4)!;
    const test = additionalTestForJob(patient)!;
    expect(additionalAssessment(patient, additionalResultFor(patient, test))).toBe('discretionary');
    const sent = sendDiscretionary(discretionaryAppointment(patient.id, 9));
    roundTrip(sent);
    let state = receiveDiscretionary(decodeSave(encodeSave(sent)));
    expect(expectedVisitDecision(state)).toBe('discretionary');
    state = act(state, 'take-certificate', 'write-certificate', 'run-vision', 'run-pressure', 'run-measurements');
    roundTrip(state);
    const report = state.papers.find(paper => paper.kind === 'additional-result')!;
    if (report.kind !== 'additional-result') throw new Error('Missing report');
    for (const locale of ['pl', 'en'] as const) {
      const text = translations[locale].additionalTests.report[test].discretionary;
      expect(additionalResultText(report, locale)).toBe(text);
      expect(paperDescription(report, locale)).toContain(text);
      expect(wrapReadingText(text, 154).length).toBeLessThanOrEqual(5);
    }
    for (const decision of ['fit', 'unfit'] as const) {
      const ready = act(decision === 'fit' ? attachReport(state) : state, `stamp-${decision}`);
      const completed = applyAction(ready, 'return-document');
      expect(completed.feedback).toBe('patient-cleared');
      expect(completed.state.daily).toEqual(state.daily);
      expect(completed.state.papers.some(paper => paper.kind === 'letter')).toBe(false);
      const note = completed.state.papers.find(paper => paper.kind === 'note')!;
      if (note.kind !== 'note') throw new Error('Missing notes');
      for (const locale of ['pl', 'en'] as const) expect(noteEntries(note, locale).map(row => row.text).join(' '))
        .toContain(translations[locale].additionalTests.notes[test].discretionary);
      roundTrip(completed.state);
    }
    const omitted = act(state, 'stamp-fit', 'return-document');
    expect(omitted.daily.insuranceIncrease).toBe(50);
    const forged = structuredClone(state);
    forged.visit!.additionalResult!.fit = true;
    expect(() => decodeSave(file(forged))).toThrow();
  });
});
