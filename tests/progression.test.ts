import { describe, expect, it } from 'vitest';
import { applyAction, advanceClinicTime, createInitialState, type GameAction, type GameState } from '../src/core/game';
import { JOBS, PATIENTS, createRoster, randomStep } from '../src/core/patients';
import { arrangeProgressionRoster, createAppointmentDetails, createDailyRoster, directiveForDay, effectivePatient, expectedVisitDecision, patientForAppointment, referralDate, workDayNumber } from '../src/core/progression';
import { decodeSave, encodeSave } from '../src/core/save';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
const cabinet = (day = 1): GameState => ({ ...act(createInitialState(1337), 'skip-intro'), day });
const seedFor = (fraction: number): number => Number(((BigInt(Math.floor(fraction * 0x1_0000_0000)) - 1013904223n) * 4276115653n) & 0xffff_ffffn);
const pressurePatient = PATIENTS.find(patient => patient.general === 'pass' && patient.vision === 'pass' && patient.pressure === 'refer' && patient.requirementId === 'full')!;

function appointment(day: number, patientId = 0): GameState {
  const state = cabinet(day);
  return act({ ...state, roster: [patientId, ...state.roster.filter(id => PATIENTS[id]!.characterId !== PATIENTS[patientId]!.characterId)] }, 'call-patient');
}
function formalValid(state: GameState): GameState {
  return { ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, ageDays: 0, seal: 'clear', authentic: true } } };
}
function submit(state: GameState, decision: 'fit' | 'unfit', roll = 0.9): GameState {
  const ready = act(state, 'take-document', 'take-certificate', 'write-certificate', decision === 'fit' ? 'stamp-fit' : 'stamp-unfit');
  return act({ ...ready, rngState: seedFor(roll) }, 'return-document');
}
function bribeAppointment(): GameState {
  const state = cabinet(8);
  return act({ ...state, shiftCompleted: 1 }, 'call-patient');
}

describe('progression follows working days', () => {
  const reservedJobs = ['pilot', 'militia-officer', 'miner', 'furnace-operator'];
  it('reserves the four additional-test professions until working day seven before balancing the queue', () => {
    for (let seed = 0; seed < 256; seed++) {
      for (const day of [1, 2, 5, 6, 7, 8]) {
        const generated = createDailyRoster(seed, day);
        expect(createDailyRoster(seed, day)).toEqual(generated);
        expect(generated.roster).toHaveLength(118);
        expect(new Set(generated.roster.map(id => PATIENTS[id]!.characterId)).size).toBe(118);
        let unfit = 0, highestPercent = 0;
        const jobs = new Set(generated.roster.map(id => JOBS[PATIENTS[id]!.jobId]!.key));
        for (const job of reservedJobs) expect(jobs.has(job)).toBe(false);
        for (const [index, id] of generated.roster.entries()) {
          const patient = PATIENTS[id]!;
          unfit += Number(patient.expectedDecision === 'unfit');
          highestPercent = Math.max(highestPercent, unfit * 100 / (index + 1));
        }
        expect(highestPercent).toBeLessThanOrEqual(33);
      }
      for (const day of [9, 12]) {
        const { roster } = createDailyRoster(seed, day);
        expect(roster).toHaveLength(138);
        const jobs = roster.map(id => JOBS[PATIENTS[id]!.jobId]!.key);
        for (const job of reservedJobs) expect(jobs).toContain(job);
        expect(jobs.filter(job => job === 'militia-officer')).toHaveLength(10);
        expect(jobs.filter(job => job === 'pilot')).toHaveLength(5);
      }
    }
  });
  it('uses the gate on new games and daily transitions, including weekends and save reloads', () => {
    let state = act({ ...createInitialState(31), money: 100000 }, 'skip-intro');
    for (let day = 1; day <= 9; day++) {
      expect(state.day).toBe(day);
      expect(decodeSave(encodeSave(state))).toEqual(state);
      if (state.phase === 'cabinet') {
        expect(state.roster).toHaveLength(day < 9 ? 118 : 138);
        if (day < 9) for (const id of state.roster) expect(reservedJobs).not.toContain(JOBS[PATIENTS[id]!.jobId]!.key);
        if (day === 8) expect(applyAction({ ...state, shiftCompleted: 1 }, 'call-patient').state.visit?.bribe).toBe('offered');
        state = act({ ...state, clockMinutes: 840 }, 'end-day');
      } else expect(state.roster).toEqual([]);
      state = act(state, 'next-day');
    }
  });
  it('counts weekdays without advancing the rules during weekends', () => {
    expect(Array.from({ length: 12 }, (_, index) => workDayNumber(index + 1))).toEqual([1, 2, 2, 2, 3, 4, 5, 6, 7, 7, 7, 8]);
    expect([1, 2, 3, 4, 5, 6, 7, 8].map(directiveForDay)).toEqual([null, null, null, null, 'dates', 'specialist', 'authenticity', null]);
  });
  it('delivers one correctly signed directive before the first patient on days three, four and five', () => {
    let state = { ...cabinet(), money: 10000 };
    const received: string[] = [];
    for (let day = 2; day <= 8; day++) {
      state = act({ ...state, clockMinutes: 840 }, 'end-day', 'next-day');
      expect(state.day).toBe(day);
      for (const paper of state.papers.filter(paper => paper.kind === 'directive' && paper.day === day)) {
        if (paper.kind !== 'directive') throw new Error('Wrong paper');
        expect(state.clockMinutes).toBe(477);
        expect(state.visit).toBeNull();
        expect(paper.sender).toBe(paper.rule === 'specialist' ? 'chamber' : 'zus');
        expect(paper.opened).toBe(false);
        received.push(paper.rule);
        state = act(state, { type: 'open-letter', paperId: paper.id });
        expect(state.papers.find(entry => entry.id === paper.id)).toMatchObject({ opened: true });
      }
    }
    expect(received).toEqual(['dates', 'specialist', 'authenticity']);
  });
  it('substracts referral age across month and game-start boundaries without wall time', () => {
    expect(referralDate(1, 4)).toEqual({ year: 1983, month: 10, day: 30 });
    expect(referralDate(5, 3)).toEqual({ year: 1983, month: 11, day: 4 });
  });
});

describe('dated referrals and authenticity', () => {
  it('allows exactly three days and begins refusing older referrals on the third workday', () => {
    const young = formalValid(appointment(5));
    const old = { ...young, visit: { ...young.visit!, referral: { ...young.visit!.referral, ageDays: 4 } } };
    expect(expectedVisitDecision({ ...old, day: 2 })).toBe('fit');
    expect(expectedVisitDecision(old)).toBe('unfit');
    expect(expectedVisitDecision({ ...old, visit: { ...old.visit!, referral: { ...old.visit!.referral, ageDays: 3 } } })).toBe('fit');
    expect(submit(old, 'fit', 0.349999).daily.fines).toBe(0);
    expect(submit(old, 'fit', 0.350001).daily.fines).toBe(100);
    expect(submit(old, 'unfit').daily.refusals).toBe(0);
  });
  it('enforces actual authenticity from day five and retains unresolved ambiguity until a call', () => {
    const state = formalValid(appointment(7));
    for (const authentic of [false, true]) {
      const changed = { ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, seal: 'unclear' as const, authentic } } };
      expect(expectedVisitDecision(changed)).toBe(authentic ? 'fit' : 'unfit');
      expect(expectedVisitDecision({ ...changed, day: 6 })).toBe('fit');
      expect(changed.visit.calls.employer).toBeNull();
      const called = act(changed, 'take-document', 'call-employer', 'take-paper');
      expect(called.visit!.calls.employer).toBe(authentic);
      expect(called.papers.find(paper => paper.kind === 'note')).toMatchObject({ calls: { employer: authentic } });
      expect(applyAction(called, 'call-employer').feedback).toBe(authentic ? 'employer-confirmed' : 'employer-denied');
    }
  });
  it('charges the standard ZUS fine for wrongly rejecting a genuine unclear seal', () => {
    const state = formalValid(appointment(7));
    const unclear = { ...state, visit: { ...state.visit!, referral: { ...state.visit!.referral, seal: 'unclear' as const } } };
    expect(submit(unclear, 'unfit', 0.349999).daily.fines).toBe(0);
    const detected = submit(unclear, 'unfit', 0.350001);
    expect(detected.daily).toMatchObject({ zusCases: 1, fines: 100, refusals: 0 });
    expect(detected.insuranceRate).toBe(300);
    expect(detected.papers.some(paper => paper.kind === 'letter' && paper.sender === 'zus')).toBe(true);
    expect(submit(state, 'unfit', 0.9).daily).toMatchObject({ zusCases: 0, refusals: 1 });
  });
  it('samples approximately five percent old referrals and makes unclear seals evenly genuine', () => {
    let seed = 1337, old = 0, unclear = 0, realUnclear = 0;
    for (let sample = 0; sample < 20000; sample++) {
      const details = createAppointmentDetails({ day: 7, shiftCompleted: 0, rngState: seed }, 0); seed = details.seed;
      if (details.referral.ageDays > 3) old++;
      if (details.referral.seal === 'unclear') { unclear++; realUnclear += Number(details.referral.authentic); }
      expect(details.referral.ageDays).toBeGreaterThanOrEqual(0);
      expect(details.referral.ageDays).toBeLessThanOrEqual(10);
      if (details.referral.seal === 'clear') expect(details.referral.authentic).toBe(true);
      if (details.referral.seal === 'missing') expect(details.referral.authentic).toBe(false);
    }
    expect(old / 20000).toBeGreaterThan(0.04); expect(old / 20000).toBeLessThan(0.06);
    expect(realUnclear / unclear).toBeGreaterThan(0.45); expect(realUnclear / unclear).toBeLessThan(0.55);
  });
});

describe('specialist certificates and telephone conclusions', () => {
  it('waives hypertension only for the matching job after the fourth workday', () => {
    const state = formalValid(appointment(6, pressurePatient.id));
    const certificate = { jobId: pressurePatient.jobId, phone: '43-1234' };
    const match = { ...state, visit: { ...state.visit!, specialist: certificate } };
    expect(expectedVisitDecision(match)).toBe('fit');
    expect(expectedVisitDecision({ ...match, day: 5 })).toBe('unfit');
    expect(expectedVisitDecision({ ...match, visit: { ...match.visit!, specialist: { ...certificate, jobId: (certificate.jobId + 1) % 45 } } })).toBe('unfit');
    expect(submit(match, 'fit').daily.zusCases).toBe(0);
    expect(submit(match, 'unfit').daily.refusals).toBe(1);
  });
  it('never waives an independent vision or general contraindication', () => {
    for (const patient of PATIENTS.filter(patient => patient.requirementId === 'full' && (patient.general === 'refer' || patient.vision === 'refer')).slice(0, 20)) {
      const state = formalValid(appointment(6, patient.id));
      expect(expectedVisitDecision({ ...state, visit: { ...state.visit!, specialist: { jobId: patient.jobId, phone: '43-1234' } } })).toBe('unfit');
    }
  });
  it('records either specialist answer in existing and later notes without requiring an examination', () => {
    for (const valid of [true, false]) {
      const state = formalValid(appointment(6, pressurePatient.id));
      const presented = { ...state, visit: { ...state.visit!, specialist: { jobId: pressurePatient.jobId + Number(!valid), phone: '43-1234' } } };
      expect(applyAction(presented, 'call-specialist').feedback).toBe('document-needed');
      const called = act(presented, 'take-paper', 'take-specialist', 'call-specialist', 'take-paper');
      expect(called.papers.filter(paper => paper.kind === 'note')).toHaveLength(2);
      expect(called.papers.filter(paper => paper.kind === 'note').every(paper => paper.calls.specialist === valid)).toBe(true);
      expect(called.visit!.calls.specialist).toBe(valid);
      expect(applyAction(called, 'call-specialist').feedback).toBe(valid ? 'specialist-valid' : 'specialist-invalid');
    }
  });
  it('samples a quarter of hypertensive patients, with a third of certificates naming another job', () => {
    let seed = 183, certificates = 0, mismatch = 0;
    for (let sample = 0; sample < 20000; sample++) {
      const details = createAppointmentDetails({ day: 6, shiftCompleted: 0, rngState: seed }, pressurePatient.id); seed = details.seed;
      if (details.specialist) { certificates++; mismatch += Number(details.specialist.jobId !== pressurePatient.jobId); }
    }
    expect(certificates / 20000).toBeGreaterThan(0.23); expect(certificates / 20000).toBeLessThan(0.27);
    expect(mismatch / certificates).toBeGreaterThan(0.30); expect(mismatch / certificates).toBeLessThan(0.36);
    expect(applyAction(cabinet(5), 'use-phone').feedback).toBe('phone-unavailable');
    expect(applyAction(cabinet(6), 'use-phone').feedback).toBe('phone-ready');
  });
});

describe('borderline bribery and hospital ending', () => {
  it('keeps portraits unique and guarantees the second patient of workday six is borderline and offers100', () => {
    const original = createRoster(23).roster, roster = arrangeProgressionRoster(original, 8);
    expect(new Set(roster)).toEqual(new Set(original));
    expect(PATIENTS[roster[1]!]!.expectedDecision).toBe('unfit');
    const visit = bribeAppointment().visit!;
    expect(visit.bribe).toBe('offered');
    expect(visit.specialist).toBeNull();
    expect(visit.referral).toMatchObject({ authentic: true, seal: 'clear' });
    const patient = patientForAppointment(visit);
    expect(patient.general).toBe('pass');
    expect(patient.visionValues.left === -6.25 || patient.pressureValues.systolic === 162).toBe(true);
    expect(patient.expectedDecision).toBe('unfit');
  });
  it('pays100 once, can return it, and a refusal then earns the ordinary patient bonus without consequences', () => {
    const offered = bribeAppointment();
    const accepted = act(offered, 'accept-bribe', 'accept-bribe');
    expect(accepted.money).toBe(offered.money);
    expect(accepted.banknotes).toHaveLength(1);
    const returned = act(accepted, 'return-bribe', 'return-bribe');
    expect(returned.money).toBe(offered.money);
    expect(applyAction(returned, 'accept-bribe').feedback).toBe('bribe-missing');
    const finished = submit(returned, 'unfit');
    expect(finished.ending).toBeNull();
    expect(finished.daily.fines + finished.daily.refusals).toBe(0);
    const home = act({ ...finished, clockMinutes: 840 }, 'end-day');
    expect(home.settlement!.patientBonus).toBe(100); // One previous appointment plus this completed visit.
  });
  it('does not pocket an untouched banknote when returning the certificate', () => {
    const offered = bribeAppointment(), completed = submit(offered, 'unfit');
    expect(completed.money).toBe(offered.money);
    expect(completed.ending).toBeNull();
  });
  it('uses30percent detection for approving the borderline patient', () => {
    const state = act(bribeAppointment(), 'accept-bribe');
    expect(submit(state, 'fit', 0.699999).daily.zusCases).toBe(0);
    expect(submit(state, 'fit', 0.700001).daily.zusCases).toBe(1);
    expect(submit(state, 'fit', 0.700001).daily.fines).toBe(100);
  });
  it('defers the assault until going home and permanently ends the current game', () => {
    const completed = submit(act(bribeAppointment(), 'accept-bribe'), 'unfit');
    expect(completed.ending).toBe('assault-pending');
    expect(completed.phase).toBe('cabinet');
    const home = act({ ...completed, clockMinutes: 840 }, 'end-day');
    expect(home.ending).toBe('hospital');
    expect(home.phase).toBe('home');
    expect(applyAction(home, 'next-day').state).toBe(home);
    expect(advanceClinicTime(completed, 1000).state.ending).toBe('hospital');
  });
  it('adds roughly ten percent offers to a balanced later queue and never offers before the scripted visit', () => {
    let offered = 0, total = 0, seed = 914;
    for (let day = 0; day < 150; day++) {
      const roster = createRoster(seed); seed = roster.seed;
      for (let index = 0; index < roster.roster.length; index++) {
        const id = roster.roster[index]!;
        const details = createAppointmentDetails({ day: 9, shiftCompleted: index, rngState: seed }, id); seed = details.seed;
        offered += Number(details.bribe === 'offered'); total++;
        if (details.bribe === 'offered') expect(effectivePatient(id, true).expectedDecision).toBe('unfit');
      }
    }
    expect(offered / total).toBeGreaterThan(0.09); expect(offered / total).toBeLessThan(0.12);
    for (let sample = 0; sample < 100; sample++) {
      seed = randomStep(seed).seed;
      expect(createAppointmentDetails({ day: 8, shiftCompleted: 0, rngState: seed }, pressurePatient.id).bribe).toBe('none');
      expect(createAppointmentDetails({ day: 7, shiftCompleted: 1, rngState: seed }, pressurePatient.id).bribe).toBe('none');
    }
  });
});
