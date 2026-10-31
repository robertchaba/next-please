import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { advanceClinicTime, applyAction, createInitialState, type GameAction, type GameState } from '../src/core/game';
import { decodeSave, encodeSave } from '../src/core/save';
import { expectedVisitDecision } from '../src/core/progression';
import { storyPatientForId } from '../src/core/story-patients';
import { eligibleStoryEncounters, type StoryDecision, type StoryEncounterId } from '../src/core/story';
import { noteEntries } from '../src/render/paperwork';
import { translations } from '../src/i18n';

const act = (state: GameState, ...actions: GameAction[]): GameState => actions.reduce((next, action) => applyAction(next, action).state, state);
const roundTrip = (state: GameState): GameState => {
  try { const loaded = decodeSave(encodeSave(state)); expect(loaded).toEqual(state); return loaded; }
  catch (error) { throw new Error(`Save failed day=${state.day}, phase=${state.phase}, visit=${state.visit?.patientId}, status=${JSON.stringify(state.story.encounterStatus)}`, { cause: error }); }
};
/** Exercise actual handoffs and morning/closing transitions; generous household funds isolate persistence. */
function routeTo(targetDay: number, choices: Partial<Record<StoryEncounterId, StoryDecision>> = {}, stopAtArrival?: StoryEncounterId): GameState {
  let state = act({ ...createInitialState(913), money: 100_000_000 }, 'skip-intro');
  while (state.day <= targetDay) {
    state = roundTrip(state);
    if (state.phase === 'epilogue' || state.ending) break;
    if (state.phase === 'home') { state = act(state, 'next-day'); continue; }
    if (state.day === targetDay && !stopAtArrival) return state;
    const encounters = eligibleStoryEncounters(state.story, state.day);
    const targetCount = encounters.length ? Math.max(...encounters.map(encounter => encounter.slot)) + 1 : 0;
    state = advanceClinicTime(state, Math.max(0, 480 - state.clockMinutes)).state;
    while (state.shiftCompleted < targetCount) {
      state = act(state, 'call-patient');
      if (state.inspection) { state = act(state, 'take-inspection-id', 'return-inspection-id', 'talk-inspector', 'talk-inspector'); continue; }
      const visit = state.visit;
      if (!visit) throw new Error(`Missing visitor on day ${state.day}`);
      const definition = storyPatientForId(visit.patientId);
      state = roundTrip(state);
      if (stopAtArrival && definition?.encounterId === stopAtArrival) return state;
      state = act(state, 'take-document', 'take-paper', 'take-certificate', 'write-certificate', 'run-general', 'run-vision', 'run-pressure', 'run-measurements');
      if (state.visit!.bribe === 'offered') state = act(state, 'return-bribe');
      const decision = definition ? choices[definition.encounterId] ?? 'fit' : expectedVisitDecision(state) === 'unfit' ? 'unfit' : 'fit';
      if (decision === 'fit' && state.visit!.additionalResult) {
        const result = state.papers.find(paper => paper.kind === 'additional-result' && paper.patientId === state.visit!.patientId)!;
        state = act(state, { type: 'clip-document', documentId: result.id }, { type: 'join-documents', documentId: 'certificate', targetId: result.id });
      }
      state = act(state, `stamp-${decision}`, 'return-document');
      state = roundTrip(state);
    }
    state = advanceClinicTime(state, Math.max(0, 840 - state.clockMinutes)).state;
    state = act(state, 'end-day');
    state = roundTrip(state);
    if (state.day === targetDay) return state;
  }
  return state;
}
describe('version 35 narrative saves', () => {
  it('retains a localized call conclusion once in the clinical chronology after discarding its source', () => {
    let state = routeTo(7, {}, 'B1');
    const patientId = state.visit!.patientId;
    const source = state.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'B-CHAMBER')!;
    state = act(state, 'take-document', 'take-paper', 'run-vision', { type: 'open-letter', paperId: source.id });
    const before = state;
    const call = { type: 'call-story', contactId: 'CALL-CHAMBER', paperId: source.id } as const;
    state = act(state, call, 'run-pressure', call, { type: 'trash-paper', paperId: source.id });
    expect(state.rngState).toBe(before.rngState);
    expect(state.story.decisions).toEqual(before.story.decisions);
    expect(state.story.contacts).toEqual(['CALL-CHAMBER:B1']);
    expect(state.visit!.noteOrder).toEqual(['vision', 'story-call:CALL-CHAMBER', 'pressure']);
    const note = state.papers.find(paper => paper.kind === 'note' && paper.patientId === patientId)!;
    if (note.kind !== 'note') throw new Error('Expected clinical note');
    expect(note.noteOrder).toEqual(state.visit!.noteOrder);
    for (const locale of ['pl', 'en'] as const) expect(noteEntries(note, locale)[1]!.text).toBe(translations[locale].story.phoneNotes['chamber-genuine']);
    roundTrip(state);
    state = act(state, 'take-paper');
    expect(state.papers.filter(paper => paper.kind === 'note' && paper.patientId === patientId)
      .every(paper => paper.kind === 'note' && paper.noteOrder.includes('story-call:CALL-CHAMBER'))).toBe(true);
    roundTrip(state);
  });
  it('keeps authentic and forged chamber calls attached to their own files', () => {
    let state = routeTo(15, {}, 'A4');
    const patientId = state.visit!.patientId;
    const genuine = state.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'B-CHAMBER')!;
    const forged = state.papers.find(paper => paper.kind === 'story-document' && paper.data.definitionId === 'A-FAKE-4')!;
    state = act(state, 'take-document', 'take-paper', { type: 'open-letter', paperId: forged.id },
      { type: 'call-story', contactId: 'CALL-CHAMBER', paperId: forged.id }, { type: 'open-letter', paperId: genuine.id },
      { type: 'call-story', contactId: 'CALL-CHAMBER', paperId: genuine.id });
    expect(state.story.contacts).toEqual(['CALL-CHAMBER:A4', 'CALL-CHAMBER:B1']);
    expect(state.visit!.noteOrder).toEqual(['story-call:CALL-CHAMBER']);
    const current = state.papers.find(paper => paper.kind === 'note' && paper.patientId === patientId)!;
    const archived = state.papers.find(paper => paper.kind === 'note' && paper.patientId !== null && storyPatientForId(paper.patientId)?.encounterId === 'B1')!;
    if (current.kind !== 'note' || archived.kind !== 'note') throw new Error('Expected clinical notes');
    expect(noteEntries(current, 'pl')[0]!.text).toBe(translations.pl.story.phoneNotes['chamber-forged']);
    expect(noteEntries(archived, 'pl').at(-1)!.text).toBe(translations.pl.story.phoneNotes['chamber-genuine']);
    roundTrip(state);
  });
  it('records the warehouse conclusion on an actual pending visit and on its retained notes', () => {
    let state = routeTo(26, {}, 'H1');
    const patientId = state.visit!.patientId;
    state = act(state, 'take-document', 'take-paper', 'take-additional-referral');
    const referral = state.papers.find(paper => paper.kind === 'referral' && paper.patientId === patientId)!;
    const additional = state.papers.find(paper => paper.kind === 'additional-referral' && paper.patientId === patientId)!;
    state = act(state, { type: 'select-additional-test', paperId: additional.id, test: 'chest-xray' },
      { type: 'hand-additional-referral', paperId: additional.id }, { type: 'call-story', contactId: 'CALL-WAREHOUSE', paperId: referral.id });
    expect(state.visit).toBeNull();
    expect(state.pendingReferrals.find(pending => pending.visit.patientId === patientId)!.visit.noteOrder).toEqual(['story-call:CALL-WAREHOUSE']);
    expect(state.story.contacts).toEqual(['CALL-WAREHOUSE:H1']);
    roundTrip(state);
  });
  it('rejects invented telephone context and notes unsupported by a completed call', () => {
    const state = act(routeTo(7, {}, 'B1'), 'take-document', 'take-paper');
    const file = (value: unknown) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 35, savedAt: '2026-11-01T12:00:00.000Z', state: value })));
    const unsupported = structuredClone(state);
    unsupported.visit!.noteOrder.push('story-call:CALL-CHAMBER');
    expect(() => decodeSave(file(unsupported))).toThrow();
    const wrongCase = structuredClone(state);
    wrongCase.story.contacts.push('CALL-MOS:B1');
    expect(() => decodeSave(file(wrongCase))).toThrow();
  });
  it('preserves supplied audiometry and does not invent an unfinished return at closing', () => {
    const initial = routeTo(12, {}, 'C1');
    expect(initial.visit!.additionalResult).toEqual({ test: 'audiometry', fit: false, source: 'provided' });
    const closed = advanceClinicTime(initial, 1035 - initial.clockMinutes).state;
    expect(closed.story.encounterStatus.C1).toBe('missed');
    expect(closed.pendingReferrals.some(item => item.visit.patientId === initial.visit!.patientId)).toBe(false);
    roundTrip(closed);
  });
  it('preserves warnings, both names, physical copies and an unissued certificate', () => {
    const state = routeTo(29, {}, 'I1');
    expect(state.papers.filter(paper => paper.kind === 'story-document' && paper.data.encounterId === 'I1')).toHaveLength(3);
    expect(state.story.warnings.some(item => item.warningId === 'militant')).toBe(true);
    expect(state.newspaperCopies.some(copy => copy.publication === 'glos')).toBe(true);
    roundTrip(act(state, 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit'));
  });
  it('freezes morning exposure with the actual previous ledger and no fictitious W26 salary', () => {
    const state = routeTo(36);
    expect(state.phase).toBe('epilogue');
    expect(state.story.resolution?.endingId).toBe('exposed');
    expect(state.settlement?.day).toBe(35);
    expect(state.newspaperCopies.some(copy => copy.day === 36)).toBe(false);
    const loaded = roundTrip(state);
    expect(act(loaded, 'continue-story')).toEqual(loaded);
  });
  it('keeps a skipped weekly issue absent and continues once after the settled chapter', () => {
    const choices: Partial<Record<StoryEncounterId, StoryDecision>> = { A4: 'unfit', C2: 'unfit', H1: 'unfit', I1: 'unfit', F1: 'fit' };
    const state = routeTo(37, choices);
    expect(state.phase).toBe('epilogue');
    expect(state.story.resolution?.terminal).toBe(false);
    expect(state.settlement?.day).toBe(36);
    expect(state.story.unionPress.skippedCalendarDays).toEqual([27]);
    expect(state.newspaperCopies.some(copy => copy.publication === 'glos' && copy.day === 27)).toBe(false);
    expect(state.newspaperCopies.some(copy => copy.publication === 'glos' && copy.day === 34)).toBe(true);
    const before = roundTrip(state), continued = act(before, 'continue-story');
    expect(continued.day).toBe(37);
    expect(continued.phase).toBe('cabinet');
    expect(continued.money).toBe(before.money);
    expect(continued.story.resolution?.presented).toBe(true);
    expect(continued.papers.some(paper => paper.kind === 'story-document' && paper.data.definitionId.startsWith('END-') && paper.day === 36)).toBe(true);
    roundTrip(continued);
  });
  it('rejects forged story fields without accepting a partly validated state', () => {
    const state = routeTo(29, {}, 'I1');
    const file = (value: unknown) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 35, savedAt: '2026-11-01T12:00:00.000Z', state: value })));
    const invalid = structuredClone(state);
    invalid.story.warnings[0]!.deliveredDay = 99;
    expect(() => decodeSave(file(invalid))).toThrow();
    expect(roundTrip(state)).toEqual(state);
    const forged = structuredClone(state);
    forged.story.decisions[0]!.decision = 'unfit';
    expect(() => decodeSave(file(forged))).toThrow();
  });
});
