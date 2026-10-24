import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, PATIENTS, type GameAction } from '../src/core/game';
import { translations, type Locale } from '../src/i18n';
import { paperDescription, referralLines, wrapDocumentLines, drawPaperwork, HANDWRITING_INK, DOCUMENT_INK } from '../src/render/paperwork';
import { measureDocumentText } from '../src/render/font';
import { createDeskState, addDeskItem } from '../src/core/desk';
import { shiftButtons, visibleDocumentClip } from '../src/scenes/shift';

function stateAfter(...actions: GameAction[]) {
  return actions.reduce((state, action) => applyAction(state, action).state, createInitialState());
}

describe('separate localized paperwork', () => {
  it('fits complete referrals and letters in both languages at native font size', () => {
    for (const locale of Object.keys(translations) as Locale[]) {
      const t = translations[locale], p = t.paperwork;
      for (const patient of PATIENTS) {
        const lines = wrapDocumentLines(referralLines(patient.id, locale), 166);
        expect(lines.length).toBeLessThanOrEqual(11);
        for (const line of lines) expect(measureDocumentText(line), line).toBeLessThanOrEqual(166);
        expect(lines.join(' ')).toContain(patient.birthDate);
        expect(lines.join(' ')).toContain(t.patientReferrals[patient.id]!.employer);
      }
      for (const body of [p.zusBody, p.employerBody]) {
        const lines = wrapDocumentLines(body, 166);
        expect(lines.length).toBeLessThanOrEqual(8);
        for (const line of lines) expect(measureDocumentText(line), line).toBeLessThanOrEqual(166);
      }
      for (const label of [p.referral, p.occupational, p.note, p.letter, p.zusSubject, p.employerSubject]) {
        expect(measureDocumentText(label), label).toBeLessThanOrEqual(166);
      }
    }
  });

  it('describes persisted notes independently of the current appointment', () => {
    const examined = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-vision', 'run-pressure', 'run-measurements', 'take-paper');
    const blank = examined.papers.find(paper => paper.kind === 'note')!;
    expect(paperDescription(blank, 'pl')).toContain(`${PATIENTS[0].weight} kg`);
    expect(paperDescription(blank, 'pl')).not.toContain(translations.pl.paperwork.additionalHeading);
    const written = applyAction(examined, { type: 'write-note', paperId: blank.id }).state.papers.find(paper => paper.id === blank.id)!;
    const description = paperDescription(written, 'pl');
    expect(description).toContain(translations.pl.patientNames[0]);
    expect(description).toContain(`${PATIENTS[0].weight} kg`);
    expect(description).toContain(`${PATIENTS[0].height} cm`);
    expect(description).toContain(translations.pl.pass);
    expect(description).toContain(translations.pl.patientNotes[0].join(' '));
    const translated = paperDescription(written, 'en');
    expect(translated).toContain(translations.en.paperwork.note);
    expect(translated).toContain(translations.en.pass);
  });

  it('does not expose letter contents before the envelope is opened', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit', 'return-document');
    const letter = state.papers.find(paper => paper.kind === 'letter')!;
    expect(paperDescription(letter, 'pl')).toContain(translations.pl.paperwork.envelope);
    expect(paperDescription(letter, 'pl')).not.toContain(translations.pl.paperwork.employerBody[1]);
    const opened = applyAction(state, { type: 'open-letter', paperId: letter.id }).state.papers.find(paper => paper.id === letter.id)!;
    expect(paperDescription(opened, 'pl')).toContain(translations.pl.paperwork.employerBody.join(' '));
  });
  it('keeps additional details and certificate fields inside their native paper columns', () => {
    for (const t of Object.values(translations)) {
      for (const heading of [t.paperwork.resultsHeading, t.paperwork.additionalHeading,
        t.paperwork.certificatePurpose, t.paperwork.decisionHeading, t.paperwork.name]) {
        expect(measureDocumentText(heading), heading).toBeLessThanOrEqual(164);
      }
      for (const job of t.patientJobs) expect(measureDocumentText(`${t.paperwork.position}: ${job}`)).toBeLessThanOrEqual(164);
      for (const notes of t.patientNotes) {
        expect(notes).toHaveLength(2);
        for (const line of notes) expect(measureDocumentText(line), line).toBeLessThanOrEqual(146);
      }
      expect(measureDocumentText(`${t.paperwork.weight}:`)).toBeLessThan(34);
      expect(measureDocumentText(`${t.paperwork.height}:`)).toBeLessThan(40);
      expect(measureDocumentText(`178 ${t.paperwork.cm}`)).toBeLessThanOrEqual(45);
    }
  });

  it('uses distinct blue handwriting for recorded results and supplementary notes', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-measurements', 'take-paper', { type: 'write-note', paperId: 2 });
    const note = state.papers.find(paper => paper.kind === 'note')!;
    const marks: { x: number; y: number; color: string }[] = [];
    const recorder = {
      fillStyle: '', save() {}, restore() {},
      fillRect(x: number, y: number, w: number, h: number) {
        if (w === 1 && h === 1) marks.push({ x, y, color: this.fillStyle });
      },
    };
    drawPaperwork(recorder as unknown as CanvasRenderingContext2D, note, { x: 0, y: 0, w: 188, h: 144 }, 'pl', false);
    expect(HANDWRITING_INK).not.toBe(DOCUMENT_INK);
    expect(marks.some(mark => mark.y >= 87 && mark.y < 94 && mark.x >= 45 && mark.x < 85 && mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.filter(mark => mark.y >= 114 && mark.x < 157).every(mark => mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.some(mark => mark.y >= 63 && mark.y < 70 && mark.x < 80 && mark.color === DOCUMENT_INK)).toBe(true);
    expect(marks.every(mark => mark.x >= 0 && mark.x < 188 && mark.y >= 0 && mark.y < 144)).toBe(true);
  });

  it('exposes a single clip above its bundle and a separate certificate writing action', () => {
    let state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'take-paper',
      { type: 'clip-document', documentId: 1 }, { type: 'join-documents', documentId: 2, targetId: 1 });
    let desk = createDeskState();
    desk = addDeskItem(desk, 'paper-1', { x: 280, y: 100 });
    desk = addDeskItem(desk, 'paper-2', { x: 284, y: 104 });
    const view = { desk, held: null, manualOpen: false, manualPage: 0 };
    expect(visibleDocumentClip(state, 1, view)).toBe(false);
    expect(visibleDocumentClip(state, 2, view)).toBe(true);
    const buttons = shiftButtons(state, 'pl', null, () => {}, view);
    expect(buttons.filter(button => button.id.startsWith('paper-clip-')).map(button => button.id)).toEqual(['paper-clip-2']);
    expect(buttons.find(button => button.id === 'write-certificate')?.owner).toBe('document');
    expect(buttons.find(button => button.id === 'apply-stamp')?.label).toContain(translations.pl.paperwork.nameMissing);
    state = applyAction(state, 'write-certificate').state;
    expect(shiftButtons(state, 'pl', null, () => {}, view).find(button => button.id === 'apply-stamp')?.label).toContain(translations.pl.patientNames[0]);
  });

});
