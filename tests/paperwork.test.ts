import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, PATIENTS, type GameAction } from '../src/core/game';
import { translations, type Locale } from '../src/i18n';
import { paperDescription, certificateDescription, referralLines, wrapDocumentLines, drawPaperwork, drawCertificate, HANDWRITING_INK, DOCUMENT_INK, ALERT_INK, noteEntries, letterContent, visionReading, pressureReading } from '../src/render/paperwork';
import { measureDocumentText } from '../src/render/font';
import { createDeskState, addDeskItem } from '../src/core/desk';
import { shiftButtons, visibleDocumentClip } from '../src/scenes/shift';

function stateAfter(...actions: GameAction[]) {
  const initial = createInitialState(1234);
  // These document fixtures concern Irena's fixed identity, independently of queue order.
  const roster = [0, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== 0)];
  return actions.reduce((state, action) => applyAction(state, action).state, { ...initial, roster, rngState: 1234 });
}

describe('separate localized paperwork', () => {
  it('fits complete referrals and letters in both languages at native font size', () => {
    for (const locale of Object.keys(translations) as Locale[]) {
      const t = translations[locale], p = t.paperwork;
      for (const patient of PATIENTS) {
        const lines = wrapDocumentLines(referralLines(patient.id, locale), 166);
        expect(lines.length).toBeLessThanOrEqual(10);
        for (const line of lines) expect(measureDocumentText(line), line).toBeLessThanOrEqual(166);
        expect(lines.join(' ')).toContain(patient.birthDate);
        expect(lines.join(' ')).toContain(t.patientReferrals[patient.id]!.employer);
        expect(lines.join(' ')).toContain(`${p.requirements}: ${p.requirementCodes[patient.requirementId]}`);
      }
      for (const letter of [...p.letters.zus, ...p.letters.employer]) {
        const lines = wrapDocumentLines([letter.body], 166);
        expect(lines.length).toBeLessThanOrEqual(6);
        for (const line of lines) expect(measureDocumentText(line), line).toBeLessThanOrEqual(166);
      }
      for (const label of [p.referral, p.occupational, p.note, p.letter]) {
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
    expect(description).toContain(pressureReading(PATIENTS[0].pressureValues));
    expect(description).toContain(translations.pl.patientNotes[0].join(' '));
    const translated = paperDescription(written, 'en');
    expect(translated).toContain(translations.en.paperwork.note);
    expect(translated).toContain(visionReading(PATIENTS[0].visionValues, 'en'));
  });

  it('does not expose letter contents before the envelope is opened', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-unfit', 'return-document');
    const letter = state.papers.find(paper => paper.kind === 'letter')!;
    expect(paperDescription(letter, 'pl')).toContain(translations.pl.paperwork.envelope);
    if (letter.kind !== 'letter') throw new Error('Expected correspondence');
    expect(paperDescription(letter, 'pl')).not.toContain(letterContent(letter, 'pl').body);
    const opened = applyAction(state, { type: 'open-letter', paperId: letter.id }).state.papers.find(paper => paper.id === letter.id)!;
    expect(paperDescription(opened, 'pl')).toContain(letterContent(letter, 'pl').body);
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
    expect(marks.some(mark => mark.y >= 24 && mark.y < 31 && mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.some(mark => mark.y >= 33 && mark.y < 49 && mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.filter(mark => mark.y >= 12 && mark.y < 49).every(mark => mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.every(mark => mark.x >= 0 && mark.x < 188 && mark.y >= 0 && mark.y < 144)).toBe(true);
  });

  it('retains the issue date and authentication when old paperwork is stored', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-vision', 'take-paper');
    for (const paper of state.papers.filter(paper => paper.kind !== 'note')) {
      const stored = { ...paper, day: 1, location: 'drawer' as const };
      for (const locale of ['pl', 'en'] as const) {
        const p = translations[locale].paperwork, description = paperDescription(stored, locale);
        expect(description).toContain(locale === 'pl' ? '03.11.1983' : '03/11/1983');
        expect(description).toContain(p.signed);
        expect(description).toContain(p.reference);
        expect(description).toContain(stored.kind === 'referral' ? p.employerSeal : p.clinicSeal);
      }
    }
  });

  it('describes date and signature consistently with the certificate decision', () => {
    const blank = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-certificate');
    const signed = applyAction(applyAction(blank, 'write-certificate').state, 'stamp-unfit').state;
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale], p = t.paperwork;
      expect(certificateDescription(blank, locale)).toContain(p.nameMissing);
      expect(certificateDescription(blank, locale)).not.toContain(p.signed);
      expect(certificateDescription(signed, locale)).toContain(t.patientNames[0]);
      expect(certificateDescription(signed, locale)).toContain(t.unfit);
      expect(certificateDescription(signed, locale)).toContain(p.signed);
      expect(certificateDescription(signed, locale)).toContain(locale === 'pl' ? '03.11.1983' : '03/11/1983');
    }
  });

  it('keeps complete dated forms and certificate lettering inside the native paper', () => {
    for (const locale of ['pl', 'en'] as const) for (const decision of ['stamp-fit', 'stamp-unfit'] as const) {
      const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-vision', 'take-paper',
        { type: 'write-note', paperId: 2 }, 'take-certificate', 'write-certificate', decision);
      const marks: { x: number; y: number }[] = [];
      const recorder = { fillStyle: '', save() {}, restore() {}, fillRect(x: number, y: number, w: number, h: number) {
        if (w === 1 && h === 1) marks.push({ x, y });
      } } as unknown as CanvasRenderingContext2D;
      for (const paper of state.papers) drawPaperwork(recorder, paper, { x: 0, y: 0, w: 188, h: 144 }, locale, false);
      drawCertificate(recorder, state, { x: 0, y: 0, w: 188, h: 144 }, locale, false);
      expect(marks.every(mark => mark.x >= 0 && mark.x < 188 && mark.y >= 0 && mark.y < 144)).toBe(true);
    }
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

  it('leaves a blank sheet empty and adds compact chronological findings with no pending slots', () => {
    let state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-paper');
    const blank = state.papers.find(paper => paper.kind === 'note')!;
    if (blank.kind !== 'note') throw new Error('Expected note');
    expect(noteEntries(blank, 'pl')).toEqual([]);
    expect(paperDescription(blank, 'pl')).toBe(translations.pl.paperwork.blank);
    for (const action of ['run-measurements', 'run-general', 'run-vision', 'run-pressure', 'run-vision'] as const) state = applyAction(state, action).state;
    const note = state.papers.find(paper => paper.kind === 'note')!;
    if (note.kind !== 'note') throw new Error('Expected note');
    expect(noteEntries(note, 'pl').map(row => row.text)).toEqual([
      'Waga 62 kg   Wzrost 164 cm', 'Badanie ogólne: bez uwag', 'Wzrok: OL: 0, OP: 0', 'Ciśnienie: 108/62',
    ]);
    expect(paperDescription(note, 'pl')).not.toContain(translations.pl.untested);
  });

  it('writes very high pressure in red and keeps all case findings within the paper', () => {
    for (const locale of ['pl', 'en'] as const) for (const patient of PATIENTS) {
      const note = { id: 1, day: 1, location: 'desk' as const, kind: 'note' as const, patientId: patient.id,
        examinationOrder: ['general', 'vision', 'pressure', 'measurements'] as const,
        results: { general: patient.general, vision: patient.visionValues, pressure: patient.pressureValues, weight: patient.weight, height: patient.height }, additionalWritten: true };
      const entries = noteEntries({ ...note, examinationOrder: [...note.examinationOrder] }, locale);
      const pressure = entries[2]!;
      const high = patient.pressureValues.systolic >= 180 || patient.pressureValues.diastolic >= 110;
      expect(pressure.color).toBe(high ? ALERT_INK : HANDWRITING_INK);
      const lines = entries.flatMap(entry => wrapDocumentLines([entry.text], 166));
      expect(lines.length).toBeLessThanOrEqual(10);
      for (const line of lines) expect(measureDocumentText(line)).toBeLessThanOrEqual(166);
    }
  });

});
