import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, PATIENTS, type GameAction } from '../src/core/game';
import { translations, type Locale } from '../src/i18n';
import { paperDescription, certificateDescription, drawPaperwork, drawCertificate, HANDWRITING_INK, DOCUMENT_INK, ALERT_INK, generalReading, noteEntries, noteIdentity, letterContent, visionReading, pressureReading } from '../src/render/paperwork';
import { decodeSave, encodeSave } from '../src/core/save';
import { measureDocumentText, measureReadingText, READ_CELL_HEIGHT, READ_LINE_HEIGHT } from '../src/render/font';
import { DOCUMENT_BODY_WIDTH, referralCopy, fieldLabelWidth, wrapReadingText } from '../src/render/document-copy';
import { NOTE_LINES_PER_PAGE, paginateNoteEntries } from '../src/render/note-pages';
import { createDeskState, addDeskItem, ITEM_SIZES } from '../src/core/desk';
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
        const copy = referralCopy(patient.id, locale);
        expect(49 + (copy.rows.length - 1) * READ_LINE_HEIGHT + READ_CELL_HEIGHT).toBeLessThanOrEqual(ITEM_SIZES.document.h - 29);
        for (const row of copy.rows) expect(fieldLabelWidth(row.label) + measureReadingText(row.value), row.value).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
        const text = copy.lines.join(' ');
        expect(text).toContain(patient.birthDate);
        expect(copy.employer).toBe(t.patientReferrals[patient.id]!.employer);
        expect(text).toContain(`${p.requirements}: ${p.requirementCodes[patient.requirementId]}`);
      }
      for (const letter of [...p.letters.zus, ...p.letters.employer]) {
        const lines = wrapReadingText(letter.body);
        expect(lines.join(' ')).toBe(letter.body);
        expect(70 + (lines.length - 1) * READ_LINE_HEIGHT + READ_CELL_HEIGHT).toBeLessThanOrEqual(ITEM_SIZES.document.h - 28);
        for (const line of lines) expect(measureReadingText(line), line).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
      }
      for (const label of [p.referral, p.occupational, p.note, p.letter]) {
        expect(measureDocumentText(label), label).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
      }
    }
  });

  it('describes persisted notes independently of the current appointment', () => {
    const examined = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-general', 'run-vision', 'run-pressure', 'run-measurements', 'take-paper');
    const blank = examined.papers.find(paper => paper.kind === 'note')!;
    expect(paperDescription(blank, 'pl')).toContain(`${PATIENTS[0].weight} kg`);
    expect(paperDescription(blank, 'pl')).not.toContain(translations.pl.paperwork.additionalHeading);
    const written = applyAction(examined, { type: 'write-note', paperId: blank.id }).state.papers.find(paper => paper.id === blank.id)!;
    const description = paperDescription(written, 'pl');
    expect(description).toContain(translations.pl.patientNames[0]);
    expect(description).toContain('Wiek: 41');
    expect(description).toContain(`${PATIENTS[0].weight} kg`);
    expect(description).toContain(`${PATIENTS[0].height} cm`);
    expect(description).toContain(pressureReading(PATIENTS[0].pressureValues));
    expect(description).toContain(translations.pl.patientNotes[0].join(' '));
    const translated = paperDescription(written, 'en');
    expect(translated).toContain(translations.en.paperwork.note);
    expect(translated).toContain('Age: 41');
    expect(translated).toContain(visionReading(PATIENTS[0].visionValues, 'en'));
  });

  it('records age on the note date and keeps its complete identity within the paper', () => {
    const examined = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-general', 'take-paper');
    const note = examined.papers.find(paper => paper.kind === 'note')!;
    if (note.kind !== 'note') throw new Error('Expected note');
    // The man's birthday is 6 November; an archived 5 November note remains 45.
    expect(noteIdentity({ ...note, patientId: 1, day: 3 }, 'pl')).toContain('Wiek: 45');
    expect(noteIdentity({ ...note, patientId: 1, day: 4 }, 'pl')).toContain('Wiek: 46');
    expect(noteIdentity({ ...note, patientId: 1, day: 3, location: 'drawer' }, 'en')).toContain('Age: 45');
    for (const patient of PATIENTS) for (const locale of ['pl', 'en'] as const) {
      expect(measureReadingText(noteIdentity({ ...note, patientId: patient.id }, locale), 'handwritten')).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
    }
  });

  it('keeps the first two pressure readings in order with individual alert colors', () => {
    const firstTwo = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-pressure', 'run-pressure', 'take-paper');
    const examined = applyAction(firstTwo, 'run-pressure').state;
    const note = examined.papers.find(paper => paper.kind === 'note')!;
    if (note.kind !== 'note') throw new Error('Expected note');
    expect(note.results.pressureReadings).toEqual(firstTwo.visit!.pressureReadings);
    for (const locale of ['pl', 'en'] as const) {
      const entries = noteEntries(note, locale);
      expect(entries.map(entry => entry.text)).toEqual(examined.visit!.pressureReadings.map(reading => `${translations[locale].documentPressure}: ${pressureReading(reading)}`));
      expect(entries).toHaveLength(2);
      for (const reading of examined.visit!.pressureReadings) expect(paperDescription(note, locale)).toContain(pressureReading(reading));
    }
    const readings = [{ systolic: 179, diastolic: 109 }, { systolic: 181, diastolic: 110 }];
    const marked = { ...note, results: { ...note.results, pressure: readings[1]!, pressureReadings: readings } };
    expect(noteEntries(marked, 'pl').map(entry => entry.color)).toEqual([HANDWRITING_INK, ALERT_INK]);
    expect(paperDescription(marked, 'pl')).toContain(translations.pl.veryHigh);
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
      for (const value of [...t.patientNames, ...t.patientJobs]) expect(measureReadingText(value, 'handwritten'), value).toBeLessThanOrEqual(ITEM_SIZES.document.w - 24);
      for (const notes of t.patientNotes) {
        expect(notes).toHaveLength(2);
        for (const entry of notes) {
          const lines = wrapReadingText(entry, DOCUMENT_BODY_WIDTH, 'handwritten');
          expect(lines.join(' ')).toBe(entry);
          for (const line of lines) expect(measureReadingText(line, 'handwritten'), line).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
        }
      }
      expect(measureDocumentText(`${t.paperwork.weight}:`)).toBeLessThan(34);
      expect(measureDocumentText(`${t.paperwork.height}:`)).toBeLessThan(40);
      expect(measureDocumentText(`178 ${t.paperwork.cm}`)).toBeLessThanOrEqual(45);
    }
  });

  it('uses distinct blue handwriting for recorded results and supplementary notes', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-measurements', 'run-general', 'take-paper', { type: 'write-note', paperId: 2 });
    const note = state.papers.find(paper => paper.kind === 'note')!;
    const marks: { x: number; y: number; color: string }[] = [];
    const recorder = {
      fillStyle: '', save() {}, restore() {},
      fillRect(x: number, y: number, w: number, h: number) {
        if (w === 1 && h === 1) marks.push({ x, y, color: this.fillStyle });
      },
    };
    drawPaperwork(recorder as unknown as CanvasRenderingContext2D, note, { x: 0, y: 0, ...ITEM_SIZES.document }, 'pl', false);
    expect(HANDWRITING_INK).not.toBe(DOCUMENT_INK);
    expect(marks.some(mark => mark.y >= 28 && mark.y < 28 + READ_CELL_HEIGHT && mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.some(mark => mark.y >= 28 + READ_LINE_HEIGHT && mark.y < 28 + 2 * READ_LINE_HEIGHT + READ_CELL_HEIGHT && mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.filter(mark => mark.y >= 12 && mark.y < 28 + 2 * READ_LINE_HEIGHT + READ_CELL_HEIGHT).every(mark => mark.color === HANDWRITING_INK)).toBe(true);
    expect(marks.every(mark => mark.x >= 0 && mark.x < ITEM_SIZES.document.w && mark.y >= 0 && mark.y < ITEM_SIZES.document.h)).toBe(true);
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
        expect(description).toContain(stored.kind === 'referral' ? translations[locale].progression.seal.clear : p.clinicSeal);
      }
    }
  });

  it('keeps certificate identity fields blank until writing, with consistent descriptions, ink and saved state', () => {
    const blank = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-certificate');
    const signed = applyAction(applyAction(blank, 'write-certificate').state, 'stamp-unfit').state;
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale], p = t.paperwork;
      expect(certificateDescription(blank, locale)).toContain(p.nameMissing);
      expect(certificateDescription(blank, locale)).toContain(p.positionMissing);
      expect(certificateDescription(blank, locale)).not.toContain(t.patientNames[0]);
      expect(certificateDescription(blank, locale)).not.toContain(t.patientJobs[0]);
      expect(certificateDescription(blank, locale)).not.toContain(p.signed);
      expect(certificateDescription(signed, locale)).toContain(t.patientNames[0]);
      expect(certificateDescription(signed, locale)).toContain(`${p.position}: ${t.patientJobs[0]}`);
      expect(certificateDescription(signed, locale)).not.toContain(p.positionMissing);
      expect(certificateDescription(signed, locale)).toContain(t.unfit);
      expect(certificateDescription(signed, locale)).toContain(p.signed);
      expect(certificateDescription(signed, locale)).toContain(locale === 'pl' ? '03.11.1983' : '03/11/1983');
      for (const state of [blank, signed]) {
        const restored = decodeSave(encodeSave(state));
        expect(certificateDescription(restored, locale)).toBe(certificateDescription(state, locale));
        const handwriting: number[] = [];
        const recorder = { fillStyle: '', save() {}, restore() {}, fillRect(_x: number, y: number) {
          if (this.fillStyle === HANDWRITING_INK) handwriting.push(y);
        } };
        drawCertificate(recorder as unknown as CanvasRenderingContext2D, restored, { x: 0, y: 0, ...ITEM_SIZES.document }, locale, false);
        expect(handwriting.some(y => y >= 56 && y < 56 + READ_CELL_HEIGHT)).toBe(state === signed);
        expect(handwriting.some(y => y >= 88 && y < 88 + READ_CELL_HEIGHT)).toBe(state === signed);
      }
    }
  });

  it('keeps complete dated forms and certificate lettering inside the native paper', () => {
    for (const locale of ['pl', 'en'] as const) for (const decision of ['stamp-fit', 'stamp-unfit'] as const) {
      const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'run-general', 'run-vision', 'take-paper',
        { type: 'write-note', paperId: 2 }, 'take-certificate', 'write-certificate', decision);
      const marks: { x: number; y: number }[] = [];
      const recorder = { fillStyle: '', save() {}, restore() {}, fillRect(x: number, y: number, w: number, h: number) {
        if (w === 1 && h === 1) marks.push({ x, y });
      } } as unknown as CanvasRenderingContext2D;
      for (const paper of state.papers) drawPaperwork(recorder, paper, { x: 0, y: 0, ...ITEM_SIZES.document }, locale, false);
      drawCertificate(recorder, state, { x: 0, y: 0, ...ITEM_SIZES.document }, locale, false);
      expect(marks.every(mark => mark.x >= 0 && mark.x < ITEM_SIZES.document.w && mark.y >= 0 && mark.y < ITEM_SIZES.document.h)).toBe(true);
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

  it('starts with identity and age, then adds chronological findings with no pending slots', () => {
    let state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-paper');
    const blank = state.papers.find(paper => paper.kind === 'note')!;
    if (blank.kind !== 'note') throw new Error('Expected note');
    expect(noteEntries(blank, 'pl')).toEqual([]);
    expect(paperDescription(blank, 'pl')).toBe(`${translations.pl.paperwork.note}. Irena Wolska   Wiek: 41.`);
    for (const action of ['run-measurements', 'run-general', 'run-vision', 'run-pressure', 'run-vision'] as const) state = applyAction(state, action).state;
    const note = state.papers.find(paper => paper.kind === 'note')!;
    if (note.kind !== 'note') throw new Error('Expected note');
    expect(noteEntries(note, 'pl').map(row => row.text)).toEqual([
      'Waga 62 kg   Wzrost 164 cm', 'Badanie ogólne: bez uwag', ...translations.pl.patientNotes[0]!, 'Wzrok: OL: 0, OP: 0', 'Ciśnienie: 108/62',
    ]);
    expect(paperDescription(note, 'pl')).not.toContain(translations.pl.untested);
  });

  it('hides history from legacy notes until the physical examination is recorded, in both languages', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-paper');
    const note = state.papers[1]!;
    if (note.kind !== 'note') throw new Error('Expected note');
    const legacy = { ...note, additionalWritten: true };
    const examined = applyAction({ ...state, papers: [state.papers[0]!, legacy] }, 'run-general').state.papers[1]!;
    for (const locale of ['pl', 'en'] as const) {
      expect(noteEntries(legacy, locale)).toEqual([]);
      for (const line of translations[locale].patientNotes[0]) {
        expect(paperDescription(legacy, locale)).not.toContain(line);
        expect(paperDescription(examined, locale)).toContain(line);
      }
    }
  });

  it('names the exact abnormal general finding and preserves it on repeat and import', () => {
    for (const patient of PATIENTS.filter(patient => patient.general === 'refer')) {
      const initial = createInitialState(1234);
      const roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
      const examined = (['skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general'] as GameAction[])
        .reduce((state, action) => applyAction(state, action).state, { ...initial, roster });
      const repeated = applyAction(examined, 'run-general').state;
      const imported = decodeSave(encodeSave(repeated));
      for (const locale of ['pl', 'en'] as const) {
        const t = translations[locale], finding = generalReading(patient.id, locale);
        expect(finding).not.toBe(t.generalConcern);
        for (const state of [examined, repeated, imported]) {
          const note = state.papers.find(paper => paper.kind === 'note')!;
          if (note.kind !== 'note') throw new Error('Expected note');
          expect(noteEntries(note, locale)).toEqual([{ text: `${t.generalResult}: ${finding}`, color: HANDWRITING_INK }, ...t.patientNotes[patient.id]!.map(text => ({ text, color: HANDWRITING_INK }))]);
          expect(paperDescription({ ...note, location: 'drawer' }, locale)).toContain(finding);
        }
      }
    }
  });

  it('writes very high pressure in red and keeps all case findings within the paper', () => {
    for (const locale of ['pl', 'en'] as const) for (const patient of PATIENTS) {
      const note = { id: 1, day: 1, location: 'desk' as const, kind: 'note' as const, patientId: patient.id, calls: { specialist: null, employer: null }, bribe: false,
        examinationOrder: ['general', 'vision', 'pressure', 'measurements'] as const,
        results: { general: patient.general, vision: patient.visionValues, pressure: patient.pressureValues, pressureReadings: [{ ...patient.pressureValues }, { ...patient.pressureValues, systolic: patient.pressureValues.systolic + 1 }], weight: patient.weight, height: patient.height }, additionalWritten: true };
      const entries = noteEntries({ ...note, noteOrder: ['general', 'vision', 'pressure', 'pressure-repeat', 'measurements', 'history'], examinationOrder: [...note.examinationOrder] }, locale);
      const pressure = entries[2]!;
      const high = patient.pressureValues.systolic >= 180 || patient.pressureValues.diastolic >= 110;
      expect(pressure.color).toBe(high ? ALERT_INK : HANDWRITING_INK);
      const first = paginateNoteEntries(entries);
      const pages = Array.from({ length: first.count }, (_, page) => paginateNoteEntries(entries, DOCUMENT_BODY_WIDTH, page));
      expect(pages.flatMap(page => page.lines)).toEqual(entries.flatMap(entry => wrapReadingText(entry.text, DOCUMENT_BODY_WIDTH, 'handwritten').map(text => ({ ...entry, text }))));
      for (const page of pages) {
        expect(page.lines.length).toBeLessThanOrEqual(NOTE_LINES_PER_PAGE);
        expect(28 + (page.lines.length - 1) * READ_LINE_HEIGHT + READ_CELL_HEIGHT).toBeLessThan(ITEM_SIZES.document.h - 15);
        for (const line of page.lines) expect(measureReadingText(line.text, 'handwritten')).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
      }
    }
  });

});
