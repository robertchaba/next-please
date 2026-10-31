import { createInitialState } from './fixtures/routine';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { applyAction } from '../src/core/game';
import { PATIENT_IDENTITIES, PATIENTS, patientAge, createRoster } from '../src/core/patients';
import { ADDITIONAL_PORTRAITS } from '../src/core/patient-identities';
import { decodeSave, encodeSave } from '../src/core/save';
import { translations } from '../src/i18n';

describe('uniformed patients and fourth portrait expansion', () => {
  it('preserves all 2503 previously shipped case records exactly', () => {
    expect(createHash('sha256').update(JSON.stringify(PATIENTS.slice(0, 2503))).digest('hex'))
      .toBe('c3298eb9fcd00d4de119c10c767982bec5fa21eda1537d3f5b5d55d0bd94b203');
  });

  it('keeps every uniformed identity in its illustrated profession', () => {
    const newIdentities = PATIENT_IDENTITIES.filter(identity => identity.characterId >= 78 && identity.characterId < 103);
    expect(newIdentities).toHaveLength(125);
    for (const [index, portrait] of ADDITIONAL_PORTRAITS.slice(0, 25).entries()) {
      const identities = newIdentities.filter(identity => identity.portraitId === portrait.portraitId);
      expect(identities).toHaveLength(5);
      for (const identity of identities) {
        if (index < 15) expect(identity.jobId).toBe(index < 10 ? 45 : 46);
        expect(identity.sex).toBe(portrait.sex);
        expect(Math.abs(patientAge(identity, { year: 1983, month: 11, day: 3 }) - portrait.age)).toBeLessThanOrEqual(3);
      }
    }
    const { roster } = createRoster(76);
    expect(roster.filter(id => PATIENTS[id]!.jobId === 45)).toHaveLength(10);
    expect(roster.filter(id => PATIENTS[id]!.jobId === 46)).toHaveLength(5);
    expect(roster.filter(id => PATIENTS[id]!.jobId === 47)).toHaveLength(2);
    expect(roster.filter(id => PATIENTS[id]!.jobId === 18).length).toBeGreaterThanOrEqual(3);
  });

  it('round-trips all new identities with their notes and localized occupation', () => {
    for (const identity of PATIENT_IDENTITIES.filter(identity => identity.characterId >= 78)) {
      const patient = PATIENTS[553 + identity.id * 5]!;
      const initial = createInitialState(identity.id);
      initial.roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
      let state = applyAction(initial, 'skip-intro').state;
      for (const action of ['call-patient', 'take-document', 'take-paper', 'run-general'] as const) state = applyAction(state, action).state;
      expect(decodeSave(encodeSave(state))).toEqual(state);
      for (const t of Object.values(translations)) {
        expect(t.patientNames[patient.id]).toBeTruthy();
        expect(t.patientJobs[patient.id]).toBeTruthy();
      }
    }
  });

  it('ships a distinct local sprite for every catalog portrait in the established native footprint', () => {
    const hashes = new Set<string>();
    const portraits = new Set(PATIENTS.map(patient => patient.portraitId));
    for (const portrait of portraits) {
      const bytes = readFileSync(new URL(`../public/assets/art/sprites/${portrait}.png`, import.meta.url));
      expect(bytes.readUInt32BE(16)).toBe(94);
      expect(bytes.readUInt32BE(20)).toBe(96);
      hashes.add(createHash('sha256').update(bytes).digest('hex'));
    }
    expect(portraits.size).toBe(198);
    expect(hashes.size).toBe(portraits.size);
  });
});
