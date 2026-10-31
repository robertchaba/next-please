import { describe, expect, it } from 'vitest';
import { additionalAssessment, additionalResultFor, additionalTestForPatient } from '../src/core/additional-tests';
import { CHARACTER_COUNT, PATIENTS, compatiblePressureReading, createRoster, generalFindingIndex, patientAge, patientIdentity } from '../src/core/patients';
import { createAppointmentDetails, expectedVisitDecision } from '../src/core/progression';
import { STORY_ENCOUNTERS, calendarDayForWorkDay } from '../src/core/story';
import { STORY_PATIENT_FIRST_ID, STORY_PATIENTS, storyPatientForEncounter, storyPatientForId } from '../src/core/story-patients';
import { gameDate } from '../src/core/calendar';
import { translations } from '../src/i18n';
import type { Visit } from '../src/core/game';

describe('immutable narrative patients', () => {
  it('keeps every story name distinct from ordinary patient identities in both languages', () => {
    for (const locale of ['pl','en'] as const) {
      const ordinary = new Set<string>(PATIENTS.slice(0,STORY_PATIENT_FIRST_ID).map(patient=>translations[locale].patientNames[patient.id]));
      for (const name of Object.values(translations[locale].story.actors)) expect(ordinary.has(name),`${locale}: ${name}`).toBe(false);
    }
  });
  it('appends exactly 18 cases and reserves ten faces outside the randomized catalog', () => {
    expect(STORY_PATIENTS).toHaveLength(18);
    expect(PATIENTS.length).toBe(STORY_PATIENT_FIRST_ID + 18);
    expect(new Set(STORY_PATIENTS.map(patient => patient.characterId)).size).toBe(10);
    for (const seed of [0, 42, 0xffff_ffff]) {
      const roster = createRoster(seed).roster;
      expect(roster).toHaveLength(CHARACTER_COUNT);
      expect(roster.every(id => id < STORY_PATIENT_FIRST_ID)).toBe(true);
    }
    for (const patient of STORY_PATIENTS) {
      expect(PATIENTS[patient.id]).toBe(patient);
      expect(patientIdentity(patient)?.birthDate).toBe(patient.birthDate);
      expect(translations.pl.patientNames[patient.id]).toBeTruthy();
      expect(translations.en.patientNames[patient.id]).toBeTruthy();
    }
  });
  it('retains actor identity, birth and findings across recurring appointments', () => {
    for (const actor of ['agent', 'printer', 'malec']) {
      const cases = STORY_PATIENTS.filter(patient => storyPatientForId(patient.id)?.actorId === actor);
      expect(new Set(cases.map(patient => patient.characterId)).size).toBe(1);
      expect(new Set(cases.map(patient => patient.birthDate)).size).toBe(1);
      expect(new Set(cases.map(patient => translations.pl.patientNames[patient.id])).size).toBe(1);
    }
    const ages = { agent: 43, 'strike-leader': 44, printer: 46, dispatcher: 65, sergeant: 39, proofreader: 61, volunteer: 48, storekeeper: 53, alias: 41, malec: 52 };
    for (const definition of STORY_ENCOUNTERS) {
      const profile = storyPatientForEncounter(definition.id);
      expect(patientAge(profile.patient, gameDate(calendarDayForWorkDay(definition.scheduledWorkDay)))).toBe(ages[definition.actorId]);
    }
  });
  it('has exact authored assessment, genuine brought audiometry and no random formal offences', () => {
    for (const definition of STORY_ENCOUNTERS) {
      const profile = storyPatientForEncounter(definition.id), day = calendarDayForWorkDay(definition.scheduledWorkDay);
      const details = createAppointmentDetails({ day, shiftCompleted: 0, rngState: 123 }, profile.patient.id);
      expect(details).toMatchObject({ seed: 123, bribe: 'none', specialist: null, referral: { ageDays: 0, authentic: true, seal: 'clear' } });
      const visit = { patientId: profile.patient.id, bribe: 'none', referral: details.referral, specialist: null, additionalResult: profile.providedResult } as Visit;
      expect(expectedVisitDecision({ day, visit })).toBe(definition.assessment);
      expect(compatiblePressureReading(profile.patient, profile.patient.pressureValues)).toBe(true);
    }
    const printer = storyPatientForEncounter('C1');
    expect(printer.providedResult).toEqual({ test: 'audiometry', fit: false, source: 'provided' });
    expect(additionalAssessment(printer.patient, additionalResultFor(printer.patient, 'audiometry'))).toBe('discretionary');
    expect(additionalTestForPatient(storyPatientForEncounter('E1-VISIT').patient)).toBeNull();
    expect(generalFindingIndex(storyPatientForEncounter('H1').patient)).toBe(18);
  });
});
