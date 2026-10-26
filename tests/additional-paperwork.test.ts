import { describe, expect, it } from 'vitest';
import { ADDITIONAL_TESTS } from '../src/core/additional-tests';
import { applyAction, createInitialState, type Paper } from '../src/core/game';
import { PATIENTS } from '../src/core/patients';
import { addDeskItem, CABINET_HOTSPOTS, createDeskState } from '../src/core/desk';
import { translations } from '../src/i18n';
import { measureDocumentText } from '../src/render/font';
import { additionalResultText, additionalTestRect, drawPaperwork, paperDescription, wrapDocumentLines } from '../src/render/paperwork';
import { carriedAdditionalReferral, shiftButtons } from '../src/scenes/shift';

const patient = PATIENTS.find(patient => patient.jobId === 18 && patient.general === 'pass')!;

describe('additional examination paperwork', () => {
  it('keeps all choices, reports and circled selections inside the paper in both languages', () => {
    for (const locale of ['pl', 'en'] as const) for (const test of ADDITIONAL_TESTS) {
      const referral: Extract<Paper, { kind: 'additional-referral' }> = { kind: 'additional-referral', id: 1, day: 9, location: 'desk', patientId: patient.id, test };
      const a = translations[locale].additionalTests;
      expect(measureDocumentText(a.tests[test]) + 10).toBeLessThanOrEqual(166);
      expect(paperDescription(referral, locale)).toContain(`${a.selected}: ${a.tests[test]}`);
      for (const fit of [false, true]) {
        const report: Extract<Paper, { kind: 'additional-result' }> = { ...referral, kind: 'additional-result', test, fit };
        expect(wrapDocumentLines([additionalResultText(report, locale)], 166).length).toBeLessThanOrEqual(4);
        expect(wrapDocumentLines([a.otherChecks], 166).length).toBeLessThanOrEqual(3);
        expect(paperDescription(report, locale)).toContain(a.otherChecks);
        const marks: { x: number; y: number }[] = [];
        const recorder = { fillStyle: '', save() {}, restore() {}, fillRect(x: number, y: number, w: number, h: number) { if (w === 1 && h === 1) marks.push({ x, y }); } };
        for (const paper of [report, referral]) drawPaperwork(recorder as unknown as CanvasRenderingContext2D, paper, { x: 0, y: 0, w: 188, h: 144 }, locale, false);
        expect(marks.every(mark => mark.x >= 0 && mark.x < 188 && mark.y >= 0 && mark.y < 144)).toBe(true);
      }
    }
  });

  it('activates only the third rack slot on day seven and aligns one selected choice with its printed row', () => {
    const initial = applyAction(createInitialState(2026), 'skip-intro').state;
    let state = { ...initial, day: 9, roster: [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)] };
    for (const action of ['call-patient', 'take-document', 'take-additional-referral'] as const) state = applyAction(state, action).state;
    const paper = state.papers.find(paper => paper.kind === 'additional-referral')!;
    state = applyAction(state, { type: 'select-additional-test', paperId: paper.id, test: 'audiometry' }).state;
    let desk = createDeskState();
    for (const paper of state.papers) desk = addDeskItem(desk, `paper-${paper.id}`, { x: 300, y: 150 });
    const view = { desk, held: null, manualOpen: false, manualPage: 0 };
    const buttons = shiftButtons(state, 'pl', null, () => {}, view);
    const supply = buttons.find(button => button.id === 'take-additional-referral')!;
    expect({ x: supply.x, y: supply.y, w: supply.w, h: supply.h }).toEqual(CABINET_HOTSPOTS.additionalReferralSupply);
    expect(buttons.find(button => button.id === 'reserved-form-4')?.disabled).toBe(true);
    for (const test of ADDITIONAL_TESTS) {
      const button = buttons.find(button => button.id === `select-additional-test-${paper.id}-${test}`)!;
      expect({ x: button.x, y: button.y, w: button.w, h: button.h }).toEqual(additionalTestRect({ x: 300, y: 150, w: 188, h: 144 }, test));
      expect(button.pressed).toBe(test === 'audiometry');
      expect(button.owner).toBe(`paper-${paper.id}`);
    }
    state = applyAction(state, 'take-paper').state;
    const note = state.papers.find(paper => paper.kind === 'note')!;
    state = applyAction(state, { type: 'clip-document', documentId: note.id }).state;
    state = applyAction(state, { type: 'join-documents', documentId: paper.id, targetId: note.id }).state;
    desk = addDeskItem(desk, `paper-${note.id}`, { x: 300, y: 150 });
    const bundleView = { ...view, desk, held: `paper-${note.id}` as const, heldItems: [`paper-${note.id}`, `paper-${paper.id}`] as const };
    expect(carriedAdditionalReferral(state, bundleView.held, bundleView.heldItems)?.id).toBe(paper.id);
    expect(shiftButtons(state, 'pl', null, () => {}, bundleView).find(button => button.id === 'hand-additional-referral')).toBeDefined();
    const handed = applyAction(state, { type: 'hand-additional-referral', paperId: paper.id }).state;
    expect(handed.papers.find(paper => paper.id === note.id)).toEqual(note);
    expect(handed.paperClips).toContainEqual([note.id]);
    const before = shiftButtons({ ...state, day: 8 }, 'pl', null, () => {}, { ...view, desk });
    expect(before.find(button => button.id === 'take-additional-referral')).toBeUndefined();
    expect(before.find(button => button.id === 'reserved-form-3')?.disabled).toBe(true);
  });
});
