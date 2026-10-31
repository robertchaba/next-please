import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { advanceClinicTime, applyAction } from '../src/core/game';
import { CHARACTER_COUNT, PATIENTS } from '../src/core/patients';
import { arrangeProgressionRoster, createDailyRoster } from '../src/core/progression';
import { decodeSave, encodeSave } from '../src/core/save';

const characters = (roster: readonly number[]) => roster.map(id => PATIENTS[id]!.characterId);

describe('portrait rotation across working days', () => {
  it('uses every eligible face before repeating during short shifts, then repeats oldest first', () => {
    let seed = 193, history: number[] = [];
    const admissions: number[] = [];
    for (let shift = 0; shift < 50; shift++) {
      const generated = createDailyRoster(seed, 9 + shift, history);
      expect(createDailyRoster(seed, 9 + shift, history)).toEqual(generated);
      seed = generated.seed;
      for (const character of characters(generated.roster.slice(0, 11))) {
        if (history.length === CHARACTER_COUNT) expect(character).toBe(history[0]);
        else expect(history).not.toContain(character);
        admissions.push(character);
        history = [...history.filter(id => id !== character), character];
      }
    }
    expect(new Set(admissions.slice(0, CHARACTER_COUNT)).size).toBe(CHARACTER_COUNT);
    expect(admissions.slice(CHARACTER_COUNT, CHARACTER_COUNT * 2)).toEqual(admissions.slice(0, CHARACTER_COUNT));
  });

  it('keeps unseen and oldest faces first even when prefix balancing needs fit cases', () => {
    for (let seed = 0; seed < 64; seed++) {
      const previous = characters(createDailyRoster(seed, 1).roster);
      const history = previous.slice(0, 165);
      const { roster } = createDailyRoster(seed, 9, history);
      const ids = characters(roster), unseen = ids.filter(id => !history.includes(id));
      expect(ids.slice(0, unseen.length)).toEqual(unseen);
      expect(ids.slice(unseen.length)).toEqual(history);
      let unfit = 0;
      for (const [index, id] of roster.entries()) {
        unfit += Number(PATIENTS[id]!.expectedDecision === 'unfit');
        expect(unfit * 100).toBeLessThanOrEqual((index + 1) * 33);
      }
    }
  });

  it('remembers an admitted but interrupted patient through saving and the next day', () => {
    const cabinet = applyAction({ ...createInitialState(14), money: 5000 }, 'skip-intro').state;
    const admitted = applyAction(cabinet, 'call-patient').state;
    const character = PATIENTS[admitted.visit!.patientId]!.characterId;
    expect(cabinet.portraitHistory).toEqual([]);
    expect(admitted.portraitHistory).toEqual([character]);
    const interrupted = advanceClinicTime(admitted, 1000).state;
    expect(interrupted.patientsProcessed).toBe(0);
    const restored = decodeSave(encodeSave(interrupted));
    expect(restored.portraitHistory).toEqual([character]);
    const next = applyAction(restored, 'next-day').state;
    expect(next.portraitHistory).toEqual([character]);
    expect(characters(next.roster).at(-1)).toBe(character);
    expect(next.recentVisits).toEqual([]);
  });

  it('preserves face and identity order for the scripted second-patient bribe', () => {
    const history = characters(createDailyRoster(42, 1).roster).slice(0, 160);
    const original = createDailyRoster(49, 8, history).roster;
    const arranged = arrangeProgressionRoster(original, 8);
    expect(characters(arranged)).toEqual(characters(original));
    const before = PATIENTS[original[1]!]!, after = PATIENTS[arranged[1]!]!;
    expect(after.expectedDecision).toBe('unfit');
    expect(after).toMatchObject({ portraitId: before.portraitId, birthDate: before.birthDate, jobId: before.jobId, employerId: before.employerId });
  });
});
