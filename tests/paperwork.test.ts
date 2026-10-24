import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, PATIENTS, type GameAction } from '../src/core/game';
import { translations, type Locale } from '../src/i18n';
import { paperDescription, referralLines, wrapDocumentLines } from '../src/render/paperwork';
import { measureDocumentText } from '../src/render/font';

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
    expect(paperDescription(blank, 'pl')).toBe(translations.pl.paperwork.blank);
    const written = applyAction(examined, { type: 'write-note', paperId: blank.id }).state.papers.find(paper => paper.id === blank.id)!;
    const description = paperDescription(written, 'pl');
    expect(description).toContain(translations.pl.patientNames[0]);
    expect(description).toContain(`${PATIENTS[0].weight} kg`);
    expect(description).toContain(`${PATIENTS[0].height} cm`);
    expect(description).toContain(translations.pl.pass);
    const translated = paperDescription(written, 'en');
    expect(translated).toContain(translations.en.paperwork.note);
    expect(translated).toContain(translations.en.pass);
  });

  it('does not expose letter contents before the envelope is opened', () => {
    const state = stateAfter('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'stamp-unfit', 'return-document');
    const letter = state.papers.find(paper => paper.kind === 'letter')!;
    expect(paperDescription(letter, 'pl')).toContain(translations.pl.paperwork.envelope);
    expect(paperDescription(letter, 'pl')).not.toContain(translations.pl.paperwork.employerBody[1]);
    const opened = applyAction(state, { type: 'open-letter', paperId: letter.id }).state.papers.find(paper => paper.id === letter.id)!;
    expect(paperDescription(opened, 'pl')).toContain(translations.pl.paperwork.employerBody.join(' '));
  });
});
