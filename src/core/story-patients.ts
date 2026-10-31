import type { JobDefinition, PatientCase, PatientIdentity } from './patients';
import type { AdditionalResult } from './additional-tests';
import type { StoryActorId, StoryEncounterId } from './story';

/** Append-only boundaries, independent of the random roster's arithmetic. */
export const STORY_PATIENT_FIRST_ID = 6193;
export const STORY_CHARACTER_FIRST_ID = 188;
export const STORY_CHARACTER_COUNT = 10;
export const STORY_IDENTITY_FIRST_ID = 940;

export const STORY_JOBS: readonly JobDefinition[] = [
  { id: 48, key: 'maintenance-worker', requirementId: 'full', exposures: ['oil', 'noise'], employerIds: [27, 28, 29, 30, 31, 32, 33], managerial: false },
  { id: 49, key: 'high-window-cleaner', requirementId: 'full', exposures: ['heights', 'chemicals'], employerIds: [34], managerial: false },
  { id: 50, key: 'offset-operator', requirementId: 'pressure', exposures: ['noise', 'night-work'], employerIds: [35], managerial: false },
  { id: 51, key: 'heat-dispatcher', requirementId: 'full', exposures: ['stress', 'night-work'], employerIds: [36], managerial: false },
  { id: 52, key: 'patrol-sergeant', requirementId: 'full', exposures: ['stress', 'night-work'], employerIds: [37], managerial: false },
  { id: 53, key: 'press-proofreader', requirementId: 'vision', exposures: ['fine-detail', 'paper-dust'], employerIds: [38], managerial: false },
  { id: 54, key: 'delegated-crane-operator', requirementId: 'full', exposures: ['heights', 'noise'], employerIds: [39], managerial: false },
  { id: 55, key: 'storekeeper-forklift', requirementId: 'full', exposures: ['lifting', 'traffic'], employerIds: [40], managerial: false },
  { id: 56, key: 'waterworks-maintenance', requirementId: 'full', exposures: ['oil', 'lifting'], employerIds: [41], managerial: false },
  { id: 57, key: 'sports-director', requirementId: 'full', exposures: ['stress'], employerIds: [42], managerial: true },
  { id: 58, key: 'provincial-sports-chief', requirementId: 'full', exposures: ['stress'], employerIds: [43], managerial: true },
];
interface ActorProfile {
  actorId: StoryActorId; birthDate: string; sex: PatientCase['sex']; weight: number; height: number;
}
/** Names are localized in i18n; each birth date and face belongs to one person. */
export const STORY_ACTORS: readonly ActorProfile[] = [
  { actorId: 'agent', birthDate: '1940-03-18', sex: 'male', weight: 78, height: 176 },
  { actorId: 'strike-leader', birthDate: '1939-05-06', sex: 'male', weight: 81, height: 178 },
  { actorId: 'printer', birthDate: '1937-09-12', sex: 'male', weight: 75, height: 173 },
  { actorId: 'dispatcher', birthDate: '1918-02-24', sex: 'male', weight: 83, height: 172 },
  { actorId: 'sergeant', birthDate: '1944-07-11', sex: 'male', weight: 86, height: 181 },
  { actorId: 'proofreader', birthDate: '1922-04-21', sex: 'female', weight: 62, height: 162 },
  { actorId: 'volunteer', birthDate: '1935-08-09', sex: 'male', weight: 79, height: 175 },
  { actorId: 'storekeeper', birthDate: '1930-06-17', sex: 'male', weight: 84, height: 174 },
  { actorId: 'alias', birthDate: '1942-03-28', sex: 'male', weight: 76, height: 177 },
  { actorId: 'malec', birthDate: '1931-01-15', sex: 'male', weight: 92, height: 174 },
];
export interface StoryPatientDefinition {
  encounterId: StoryEncounterId; actorId: StoryActorId; actorIndex: number;
  patient: PatientCase; providedResult: AdditionalResult | null;
}
type ProfileOptions = Partial<Pick<PatientCase, 'pressureValues' | 'visionValues' | 'general' | 'examination' | 'workPatternId'>>;
const rows: readonly [StoryEncounterId, number, number, number, ProfileOptions?][] = [
  ['A1', 0, 48, 27, { pressureValues: { systolic: 128, diastolic: 82 } }],
  ['A2', 0, 48, 28, { pressureValues: { systolic: 132, diastolic: 84 } }],
  ['B1', 1, 49, 34, { pressureValues: { systolic: 160, diastolic: 100 } }],
  ['A3', 0, 48, 29, { pressureValues: { systolic: 138, diastolic: 88 } }],
  ['C1', 2, 50, 35, { workPatternId: 'night' }],
  ['J1', 9, 57, 42, { pressureValues: { systolic: 145, diastolic: 90 } }],
  ['A4', 0, 48, 30, { pressureValues: { systolic: 160, diastolic: 100 } }],
  ['E1-VISIT', 4, 52, 37, { visionValues: { left: -6, right: -1 }, examination: 'control', workPatternId: 'shifts' }],
  ['A5', 0, 48, 31, { pressureValues: { systolic: 160, diastolic: 100 } }],
  ['D1', 3, 51, 36, { pressureValues: { systolic: 160, diastolic: 100 }, workPatternId: 'shifts' }],
  ['G1', 6, 54, 39, { pressureValues: { systolic: 132, diastolic: 84 }, workPatternId: 'shifts' }],
  ['C2', 2, 50, 35, { examination: 'control', workPatternId: 'night' }],
  ['H1', 7, 55, 40, { general: 'refer', examination: 'periodic' }],
  ['J2', 9, 58, 43, { pressureValues: { systolic: 145, diastolic: 90 } }],
  ['A6', 0, 48, 32, { pressureValues: { systolic: 174, diastolic: 108 } }],
  ['F1', 5, 53, 38, { visionValues: { left: -6, right: -2 }, examination: 'periodic' }],
  ['I1', 8, 56, 41],
  ['A7', 0, 48, 33, { pressureValues: { systolic: 174, diastolic: 108 } }],
];
export const STORY_PATIENT_DEFINITIONS: readonly StoryPatientDefinition[] = rows.map(([encounterId, actorIndex, jobId, employerId, options = {}], index) => {
  const actor = STORY_ACTORS[actorIndex]!, job = STORY_JOBS[jobId - 48]!;
  const pressureValues = options.pressureValues ?? { systolic: 128, diastolic: 82 };
  const visionValues = options.visionValues ?? { left: -1, right: -1 };
  const general = options.general ?? 'pass';
  const pressure = pressureValues.systolic >= 160 || pressureValues.diastolic >= 100 ? 'refer' : 'pass';
  const vision = Math.abs(visionValues.left) >= 6 || Math.abs(visionValues.right) >= 6 ? 'refer' : 'pass';
  const providedResult: AdditionalResult | null = actor.actorId === 'printer' ? { test: 'audiometry', fit: false, source: 'provided' } : null;
  const patient: PatientCase = {
    id: STORY_PATIENT_FIRST_ID + index, characterId: STORY_CHARACTER_FIRST_ID + actorIndex, portraitId: `story-${actor.actorId}`,
    employerId, jobId, caseVariant: providedResult ? 4 : 0,
    conditionId: general === 'refer' ? 'general' : pressure === 'refer' ? 'pressure' : vision === 'refer' ? 'vision' : 'healthy',
    general, pressureValues, visionValues, pressure, vision,
    expectedDecision: general === 'refer' || pressure === 'refer' || vision === 'refer' || providedResult || encounterId === 'I1' ? 'unfit' : 'fit',
    birthDate: actor.birthDate, sex: actor.sex, examination: options.examination ?? 'initial', managerial: job.managerial,
    weight: actor.weight, height: actor.height, requirementId: job.requirementId, workPatternId: options.workPatternId ?? 'day',
  };
  return { encounterId, actorId: actor.actorId, actorIndex, patient, providedResult };
});
export const STORY_PATIENTS: readonly PatientCase[] = STORY_PATIENT_DEFINITIONS.map(definition => definition.patient);
export function storyPatientForId(id: number): StoryPatientDefinition | undefined {
  return STORY_PATIENT_DEFINITIONS[id - STORY_PATIENT_FIRST_ID];
}
export function storyPatientForEncounter(encounterId: StoryEncounterId): StoryPatientDefinition {
  return STORY_PATIENT_DEFINITIONS.find(definition => definition.encounterId === encounterId)!;
}
export const storyActorForPatient = (id: number): StoryActorId | undefined => storyPatientForId(id)?.actorId;
export function storyIdentity(patientId: number): PatientIdentity | undefined {
  const definition = storyPatientForId(patientId);
  if (!definition) return;
  const patient = definition.patient;
  return { id: STORY_IDENTITY_FIRST_ID + definition.actorIndex, characterId: patient.characterId, variant: 0, portraitId: patient.portraitId,
    birthDate: patient.birthDate, sex: patient.sex, jobId: patient.jobId, employerId: patient.employerId,
    workPatternId: patient.workPatternId, weight: patient.weight, height: patient.height };
}
