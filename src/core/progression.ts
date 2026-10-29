import { gameDate, isWeekend } from './calendar';
import { additionalResultFor, additionalTestForJob, additionalTestForPatient } from './additional-tests';
import { JOBS, PATIENTS, REQUIREMENTS, createRoster, patientIdentity, randomStep, type PatientCase } from './patients';
import type { Decision, GameState, Visit } from './game';

export type DirectiveRule = 'dates' | 'specialist' | 'authenticity' | 'additional-tests';
export interface ReferralDetails {
  ageDays: number;
  seal: 'clear' | 'missing' | 'unclear';
  authentic: boolean;
  phone: string;
}
export interface SpecialistCertificate { jobId: number; phone: string }
export interface PhoneConclusions { specialist: boolean | null; employer: boolean | null }
export type BribeState = 'none' | 'offered' | 'accepted' | 'returned';
export const emptyCalls = (): PhoneConclusions => ({ specialist: null, employer: null });

/** The calendar starts on Thursday; Saturdays and Sundays never advance rules. */
export function workDayNumber(day: number): number {
  const completeWeeks = Math.floor((day - 1) / 7), remainder = (day - 1) % 7;
  return completeWeeks * 5 + [1, 2, 2, 2, 3, 4, 5][remainder]!;
}

/** Reserve the four additional-examination professions until their rules arrive. */
export function createDailyRoster(seed: number, day: number, portraitHistory: readonly number[] = []): ReturnType<typeof createRoster> {
  return createRoster(seed, false, patient => workDayNumber(day) >= 7 || additionalTestForJob(patient) === null, portraitHistory);
}

export function directiveForDay(day: number): DirectiveRule | null {
  if (isWeekend(day)) return null;
  const workDay = workDayNumber(day);
  return workDay === 3 ? 'dates' : workDay === 4 ? 'specialist' : workDay === 5 ? 'authenticity' : workDay === 7 ? 'additional-tests' : null;
}

export const employerPhone = (patientId: number): string => `42-${String(1000 + PATIENTS[patientId]!.employerId * 137).padStart(4, '0')}`;
export const specialistPhone = (patientId: number): string => `43-${String(1000 + (patientId * 31) % 9000).padStart(4, '0')}`;
/** Safe migration defaults never add a new offence to an existing appointment. */
export const defaultReferral = (_day: number, patientId: number): ReferralDetails => ({ ageDays: 0, seal: 'clear', authentic: true, phone: employerPhone(patientId) });

/** Civil date subtraction also supports a referral issued before the first shift. */
export function referralDate(day: number, ageDays: number): { year: number; month: number; day: number } {
  const today = gameDate(day);
  const date = new Date(0);
  date.setUTCFullYear(today.year, today.month - 1, today.day - ageDays);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** A bribe variant changes findings, never the established identity or job. */
export function effectivePatient(patientId: number, bribery = false): PatientCase {
  const patient = PATIENTS[patientId]!;
  if (!bribery) return patient;
  const relevant = REQUIREMENTS[patient.requirementId].disqualifying;
  const vision = relevant.includes('vision') && (patient.vision === 'refer' || !relevant.includes('pressure'));
  return { ...patient, general: 'pass', conditionId: vision ? 'vision' : 'pressure', expectedDecision: 'unfit',
    vision: vision ? 'refer' : 'pass', visionValues: vision ? { left: -6.25, right: -2 } : { left: -1, right: -1 },
    pressure: vision ? 'pass' : 'refer', pressureValues: vision ? { systolic: 128, diastolic: 82 } : { systolic: 162, diastolic: 101 } };
}
export const patientForAppointment = (visit: Pick<Visit, 'patientId' | 'bribe'>): PatientCase => effectivePatient(visit.patientId, visit.bribe !== 'none');
export const patientForVisit = (state: Pick<GameState, 'visit'>): PatientCase | undefined => state.visit ? patientForAppointment(state.visit) : undefined;

export function specialistIsValid(visit: Pick<Visit, 'patientId' | 'specialist'>): boolean {
  return visit.specialist !== null && visit.specialist.jobId === PATIENTS[visit.patientId]!.jobId;
}

export function expectedVisitDecision(state: Pick<GameState, 'day' | 'visit'>): Decision | null {
  const visit = state.visit;
  if (!visit) return null;
  const day = workDayNumber(state.day), patient = patientForAppointment(visit);
  if (day >= 3 && visit.referral.ageDays > 3) return 'unfit';
  if (day >= 5 && !visit.referral.authentic) return 'unfit';
  const additional = day >= 7 ? additionalTestForPatient(patient) : null;
  const clearsConcern = (additional === 'psychiatry' || additional === 'chest-xray')
    && visit.additionalResult?.test === additional && visit.additionalResult.fit;
  if (patient.general === 'refer' && !clearsConcern) return 'unfit';
  if (additional && !additionalResultFor(patient, additional).fit) return 'unfit';
  const relevant = REQUIREMENTS[patient.requirementId].disqualifying;
  if (relevant.includes('vision') && patient.vision === 'refer') return 'unfit';
  if (relevant.includes('pressure') && patient.pressure === 'refer' && !(day >= 4 && specialistIsValid(visit))) return 'unfit';
  return 'fit';
}

export function createAppointmentDetails(state: Pick<GameState, 'day' | 'shiftCompleted' | 'rngState'>, patientId: number): {
  referral: ReferralDetails; specialist: SpecialistCertificate | null; bribe: BribeState; seed: number;
} {
  let seed = state.rngState;
  const draw = (): number => { const random = randomStep(seed); seed = random.seed; return random.value; };
  const workDay = workDayNumber(state.day), patient = PATIENTS[patientId]!;
  const ageDays = draw() < 0.05 ? 4 + Math.floor(draw() * 7) : Math.floor(draw() * 4);
  let seal: ReferralDetails['seal'] = 'clear', authentic = true;
  if (workDay >= 5) {
    const impression = draw();
    seal = impression < 0.8 ? 'clear' : impression < 0.9 ? 'missing' : 'unclear';
    authentic = seal === 'clear' || (seal === 'unclear' && draw() < 0.5);
  }
  const referral = { ageDays, seal, authentic, phone: employerPhone(patientId) };
  let specialist: SpecialistCertificate | null = null;
  if (workDay >= 4 && patient.pressure === 'refer' && draw() < 0.25) {
    const matches = draw() >= 1 / 3;
    const jobId = matches ? patient.jobId : (patient.jobId + 1 + Math.floor(draw() * (JOBS.length - 1))) % JOBS.length;
    specialist = { jobId, phone: specialistPhone(patientId) };
  }
  const guaranteed = workDay === 6 && state.shiftCompleted === 1;
  const briberyActive = workDay > 6 || (workDay === 6 && state.shiftCompleted >= 1);
  const bribe = guaranteed || (briberyActive && patient.expectedDecision === 'unfit' && draw() < 1 / 3) ? 'offered' : 'none';
  if (bribe !== 'none') {
    // The offer concerns a borderline examination, not a second document offence.
    referral.ageDays = Math.min(3, referral.ageDays); referral.seal = 'clear'; referral.authentic = true;
    specialist = null;
  }
  return { referral, specialist, bribe, seed };
}

/** The scripted second visitor is the sole exception to the prefix ratio. */
export function arrangeProgressionRoster(roster: number[], day: number): number[] {
  if (workDayNumber(day) !== 6 || isWeekend(day)) return roster;
  const second = roster[1] === undefined ? undefined : PATIENTS[roster[1]];
  const identity = second && patientIdentity(second);
  if (identity) {
    // Keep the rare-face order: the scripted offer changes the second person's
    // medical variant, not their portrait or authored identity.
    const unfit = PATIENTS.find(patient => patientIdentity(patient)?.id === identity.id && patient.expectedDecision === 'unfit');
    if (unfit) return roster.map((id, index) => index === 1 ? unfit.id : id);
  }
  const source = roster.findIndex(id => PATIENTS[id]!.expectedDecision === 'unfit');
  if (source < 0 || source === 1) return roster;
  const arranged = [...roster];
  [arranged[1], arranged[source]] = [arranged[source]!, arranged[1]!];
  return arranged;
}
