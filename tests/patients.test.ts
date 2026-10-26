import { describe, expect, it } from 'vitest';
import { CHARACTER_COUNT, GENERAL_FINDING_COUNT, JOBS, LEGACY_CASE_COUNT, PATIENTS, REQUIREMENTS, createRoster, decisionForFindings, generalFindingIndex, hasRequiredExaminations, significantVisionDefect, disqualifyingPressure, veryHighPressure, patientAge } from '../src/core/patients';
import { applyAction, createInitialState, type GameAction } from '../src/core/game';
import { gameDate } from '../src/core/calendar';
import { translations } from '../src/i18n';

describe('patient and occupation catalog', () => {
  it('matches every portrait age and keeps birth dates identical across case variants', () => {
    // The two generated portrait batches document these intended ages in their art records.
    const ages = [41, 45, 58,
      26, 53, 41, 30, 59, 44, 33, 61, 47, 24, 38, 49, 55, 36, 22, 57, 45, 28, 63, 40, 31, 52, 43, 34, 50,
      32, 46, 60, 27, 39, 54, 23, 64, 48, 35, 56, 29, 42, 58, 25, 51, 37, 62, 44, 30, 55, 40, 33, 47, 59];
    for (let characterId = 0; characterId < CHARACTER_COUNT; characterId++) {
      const cases = PATIENTS.filter(patient => patient.characterId === characterId);
      expect(new Set(cases.map(patient => patient.birthDate)).size).toBe(1);
      for (const patient of cases) expect(patientAge(patient, gameDate(1))).toBe(ages[characterId]);
    }
  });

  it('counts completed years across birthdays, year boundaries and leap years', () => {
    const patient = PATIENTS[1]!;
    expect(patientAge(patient, gameDate(3))).toBe(45); // 5 November
    expect(patientAge(patient, gameDate(4))).toBe(46); // 6 November
    expect(patientAge(patient, gameDate(5))).toBe(46);
    expect(patientAge(patient, { year: 1984, month: 1, day: 1 })).toBe(46);
    expect(patientAge(patient, { year: 1984, month: 11, day: 6 })).toBe(47);
    const leapBirth = { birthDate: '1960-02-29' };
    expect(patientAge(leapBirth, { year: 1983, month: 2, day: 28 })).toBe(22);
    expect(patientAge(leapBirth, { year: 1983, month: 3, day: 1 })).toBe(23);
    expect(patientAge(leapBirth, { year: 1984, month: 2, day: 29 })).toBe(24);
  });

  it('provides 53 identities, 32 occupations and 20 localized employers with stable references', () => {
    expect(CHARACTER_COUNT).toBe(53);
    expect(PATIENTS).toHaveLength(328);
    expect(JOBS).toHaveLength(32);
    expect(new Set(PATIENTS.map(patient => patient.characterId)).size).toBe(53);
    expect(new Set(PATIENTS.map(patient => patient.jobId)).size).toBe(32);
    expect(new Set(PATIENTS.map(patient => patient.employerId)).size).toBe(20);
    for (const [id, patient] of PATIENTS.entries()) {
      expect(patient.id).toBe(id);
      expect(JOBS[patient.jobId]).toBeDefined();
      expect(patient.expectedDecision).toBe(decisionForFindings(patient.requirementId, patient));
      for (const t of Object.values(translations)) {
        expect(t.patientNames[id]).toBeTruthy();
        expect(t.patientJobs[id]).toBeTruthy();
        const referral = t.patientReferrals[id]!;
        expect(Object.values(referral).every(value => typeof value === 'string' && value.length > 0)).toBe(true);
        expect(t.paperwork.requirementCodes[patient.requirementId]).toBe(REQUIREMENTS[patient.requirementId].code);
      }
    }
  });

  it('keeps original case decisions and measurements stable while appending new profiles', () => {
    for (const patient of PATIENTS.slice(3, LEGACY_CASE_COUNT)) {
      const person = Math.floor((patient.id - 3) / 4), variant = (patient.id - 3) % 4;
      expect(patient.characterId).toBe(person + 3);
      expect(patient.portraitId).toBe(`patient-${String(person + 1).padStart(2, '0')}`);
      expect(patient.weight).toBe(53 + (person * 7) % 43 + variant);
      expect(patient.height).toBe(156 + (person * 5) % 32);
      expect(patient.expectedDecision).toBe(variant === 0 ? 'fit' : 'unfit');
      expect(patient.requirementId).toBe('full');
    }
    for (let characterId = 28; characterId < CHARACTER_COUNT; characterId++) {
      const cases = PATIENTS.filter(patient => patient.characterId === characterId);
      expect(cases).toHaveLength(9);
      expect(new Set(cases.map(patient => patient.portraitId)).size).toBe(1);
      expect(new Set(cases.map(patient => patient.birthDate)).size).toBe(1);
      expect(new Set(cases.map(patient => patient.jobId)).size).toBe(2);
      expect(new Set(cases.map(patient => patient.conditionId)).size).toBe(5);
      expect(new Set(cases.map(patient => patient.examination)).size).toBe(2);
      expect(cases.every(patient => JOBS[patient.jobId]!.employerIds.includes(patient.employerId))).toBe(true);
    }
  });

  it('reproduces a saved queue seed and shuffles every identity, including the original three', () => {
    const first = createRoster(15), second = createRoster(16);
    expect(createRoster(15)).toEqual(first);
    expect(createRoster(15, true)).toEqual(first);
    expect(second.roster).not.toEqual(first.roster);
    for (const { roster } of [first, second]) {
      expect(roster).toHaveLength(53);
      expect(new Set(roster.map(id => PATIENTS[id]!.characterId)).size).toBe(53);
    }
    const positions = Array.from({ length: 30 }, (_, seed) => createRoster(seed).roster.findIndex(id => id === 0));
    expect(new Set(positions).size).toBeGreaterThan(15);
    expect(positions.some(position => position > 2)).toBe(true);
  });

  it('assesses only findings required by a profile, always retaining body measurements', () => {
    const findings = { vision: 'refer' as const, pressure: 'pass' as const };
    expect(decisionForFindings('vision', findings)).toBe('unfit');
    expect(decisionForFindings('pressure', findings)).toBe('fit');
    expect(decisionForFindings('full', findings)).toBe('unfit');
    const pressureCase = PATIENTS.find(patient => patient.requirementId === 'pressure')!;
    expect(hasRequiredExaminations(pressureCase, { generalTested: true, visionTested: false, pressureTested: true, measurementsTaken: true })).toBe(true);
    expect(hasRequiredExaminations(pressureCase, { generalTested: true, visionTested: true, pressureTested: true, measurementsTaken: false })).toBe(false);
  });

  it('caps unfit patients at 33% of every queue prefix without losing identities or case variety', () => {
    const seenCases = new Set<number>();
    const seeds = [0, 0xffff_ffff, ...Array.from({ length: 4096 }, (_, index) => Math.imul(index + 1, 0x9e3779b1) >>> 0)];
    for (const seed of seeds) {
      const { roster } = createRoster(seed);
      expect(roster).toHaveLength(CHARACTER_COUNT);
      expect(new Set(roster.map(id => PATIENTS[id]!.characterId)).size).toBe(CHARACTER_COUNT);
      let unfit = 0, highestPercent = 0;
      for (const [index, id] of roster.entries()) {
        seenCases.add(id);
        if (PATIENTS[id]!.expectedDecision === 'unfit') unfit += 1;
        highestPercent = Math.max(highestPercent, 100 * unfit / (index + 1));
      }
      expect(highestPercent, `seed ${seed}`).toBeLessThanOrEqual(33);
      expect(unfit).toBeLessThanOrEqual(17);
      expect(roster).toContain(1);
      expect(roster).toContain(2);
    }
    expect(seenCases.size).toBe(PATIENTS.length);
  });

  it('completes a visit with its own required tests and does not penalize an unrelated finding', () => {
    const patient = PATIENTS.find(patient => patient.requirementId === 'pressure' && patient.vision === 'refer' && patient.pressure === 'pass')!;
    const initial = createInitialState(55);
    const roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
    const actions: GameAction[] = ['skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-general', 'run-pressure', 'run-measurements', 'stamp-fit'];
    const examined = actions.reduce((state, action) => applyAction(state, action).state, { ...initial, roster });
    expect(examined.visit?.visionTested).toBe(false);
    const returned = applyAction(examined, 'return-document');
    expect(returned.feedback).toBe('patient-cleared');
    expect(returned.state.daily.fines).toBe(0);
    expect(returned.state.papers.some(paper => paper.kind === 'letter')).toBe(false);
  });
});


describe('numerical clinical findings', () => {
  it('keeps minor sight defects eligible while only significant defects fail the vision test', () => {
    expect(significantVisionDefect({ left: -1, right: -2 })).toBe(false);
    expect(significantVisionDefect({ left: 0, right: -5.5 })).toBe(false);
    expect(significantVisionDefect({ left: -6, right: 0 })).toBe(true);
    expect(significantVisionDefect({ left: 0, right: 6 })).toBe(true);
    for (const patient of PATIENTS) {
      expect(significantVisionDefect(patient.visionValues)).toBe(patient.vision === 'refer');
      expect(disqualifyingPressure(patient.pressureValues)).toBe(patient.pressure === 'refer');
    }
    expect(PATIENTS.some(patient => patient.expectedDecision === 'fit' && patient.visionValues.left !== 0)).toBe(true);
  });

  it('distinguishes abnormal pressure from the very high readings highlighted in red', () => {
    expect(disqualifyingPressure({ systolic: 138, diastolic: 66 })).toBe(false);
    expect(disqualifyingPressure({ systolic: 160, diastolic: 90 })).toBe(true);
    expect(veryHighPressure({ systolic: 160, diastolic: 100 })).toBe(false);
    expect(veryHighPressure({ systolic: 180, diastolic: 90 })).toBe(true);
    expect(veryHighPressure({ systolic: 150, diastolic: 110 })).toBe(true);
  });

  it('requires refusal for any general finding, including profiles without vision requirements', () => {
    for (const profile of ['full', 'vision', 'pressure'] as const) {
      expect(decisionForFindings(profile, { general: 'refer', vision: 'pass', pressure: 'pass' })).toBe('unfit');
    }
    for (const patient of PATIENTS.slice(303)) {
      expect(patient.general).toBe('refer');
      expect(patient.expectedDecision).toBe('unfit');
    }
  });

  it('covers eighteen fixed general findings, each disqualifying every job profile', () => {
    const abnormal = PATIENTS.filter(patient => patient.general === 'refer');
    expect(new Set(abnormal.map(generalFindingIndex)).size).toBe(GENERAL_FINDING_COUNT);
    expect(GENERAL_FINDING_COUNT).toBe(18);
    for (const patient of PATIENTS) {
      const finding = generalFindingIndex(patient);
      if (patient.general === 'pass') { expect(finding).toBeNull(); continue; }
      expect(finding).toBeGreaterThanOrEqual(0);
      expect(finding).toBeLessThan(GENERAL_FINDING_COUNT);
      expect(generalFindingIndex({ ...patient })).toBe(finding);
      for (const job of JOBS) expect(decisionForFindings(job.requirementId, { general: patient.general, vision: 'pass', pressure: 'pass' })).toBe('unfit');
    }
    for (const t of Object.values(translations)) {
      expect(t.generalFindings).toHaveLength(GENERAL_FINDING_COUNT);
      expect(new Set(t.generalFindings).size).toBe(GENERAL_FINDING_COUNT);
    }
  });
});
