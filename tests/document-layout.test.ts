import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { PATIENTS, applyAction, type Paper } from '../src/core/game';
import { ADDITIONAL_TESTS } from '../src/core/additional-tests';
import { drawCertificate, drawPaperwork, paperDescription, wrapDocumentLines } from '../src/render/paperwork';
import { paperDesktopSize, CLINICAL_PAPER_SIZE } from '../src/core/desk';
import { measureReadingText, READ_LINE_HEIGHT } from '../src/render/font';
import { wrapReadingText } from '../src/render/document-copy';
import { translations } from '../src/i18n';

/** Generated assets load only in the browser; record the actual native lettering. */
function letteringBounds(paper: Paper, locale: 'pl' | 'en') {
  const size = paperDesktopSize(paper.kind);
  const outside: { x: number; y: number }[] = [];
  let written = 0;
  const ctx = {
    fillStyle: '', save() {}, restore() {},
    fillRect(x: number, y: number, w: number, h: number) {
      // Measure individual lettering pixels, excluding larger state-driven marks.
      if (w !== 1 || h !== 1) return;
      written++;
      if (x < 0 || x >= size.w - 11 || y < 0 || y >= size.h) outside.push({ x, y });
    },
  } as unknown as CanvasRenderingContext2D;
  drawPaperwork(ctx, paper, { x: 0, y: 0, ...size }, locale, false);
  return { outside, written };
}

describe('revised document lettering', () => {
  it('fits every certificate identity and job on the smaller form at the original text size', () => {
    let state = createInitialState(1234);
    for (const action of ['skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'stamp-fit'] as const) state = applyAction(state, action).state;
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale];
      expect(wrapReadingText(t.documentDesign.certificateStatement, 160).length).toBeLessThanOrEqual(2);
      for (const patient of PATIENTS) {
        const outside: number[][] = [];
        let written = 0;
        const ctx = { fillStyle: '', save() {}, restore() {}, fillRect(x: number, y: number, w: number, h: number) {
          if (w !== 1 || h !== 1) return;
          written++;
          if (x < 8 || x >= 168 || y < 0 || y >= 157) outside.push([x, y]);
        } } as unknown as CanvasRenderingContext2D;
        drawCertificate(ctx, { ...state, visit: { ...state.visit!, patientId: patient.id } }, { x: 0, y: 0, ...CLINICAL_PAPER_SIZE }, locale, false);
        expect(written).toBeGreaterThan(100);
        expect(outside, `${locale}: ${patient.id}`).toEqual([]);
        expect(measureReadingText(`${t.paperwork.position}:`) + 4 + measureReadingText(t.patientJobs[patient.id]!)).toBeLessThanOrEqual(160);
      }
    }
  });

  it('keeps every referral identity, letterhead and seal inside the native sheet', () => {
    for (const locale of ['pl', 'en'] as const) for (const patient of PATIENTS) {
      const paper: Extract<Paper, { kind: 'referral' }> = {
        id: 1, kind: 'referral', day: 9, patientId: patient.id, location: 'desk',
        details: { ageDays: 0, seal: 'clear', authentic: true, phone: '42-1000' },
      };
      const marks = letteringBounds(paper, locale);
      expect(marks.written).toBeGreaterThan(100);
      expect(marks.outside, `${locale}: patient ${patient.id}`).toEqual([]);
    }
  });

  it('keeps both clinical outcomes and the clinic imprint inside the report', () => {
    for (const locale of ['pl', 'en'] as const) for (const test of ADDITIONAL_TESTS) for (const fit of [false, true]) {
      const t = translations[locale];
      const width = CLINICAL_PAPER_SIZE.w - 22;
      // Full result and scope text remain separate above the signature and seal.
      const rows = wrapReadingText(t.additionalTests.report[test][fit ? 'fit' : 'unfit'], width, 'handwritten');
      expect(73 + rows.length * READ_LINE_HEIGHT).toBeLessThanOrEqual(CLINICAL_PAPER_SIZE.h - 47);
      expect(wrapDocumentLines([t.additionalTests.otherChecks], width).length).toBeLessThanOrEqual(2);
      const paper: Extract<Paper, { kind: 'additional-result' }> = {
        id: 3, kind: 'additional-result', day: 9, patientId: 0, location: 'desk', test, fit,
      };
      const marks = letteringBounds(paper, locale);
      expect(marks.written).toBeGreaterThan(100);
      expect(marks.outside, `${locale}: ${test}/${fit}`).toEqual([]);
    }
  });

  it('keeps personalized correspondence within the sheet for the longest names', () => {
    for (const locale of ['pl', 'en'] as const) for (const patient of PATIENTS) {
      const paper: Extract<Paper, { kind: 'letter' }> = {
        id: 1, kind: 'letter', day: 9, patientId: patient.id, location: 'desk', sender: 'employer', opened: true,
      };
      expect(letteringBounds(paper, locale).outside, `${locale}: ${translations[locale].patientNames[patient.id]}`).toEqual([]);
    }
  });


  it('fits specialist identities and jobs plus envelope senders across the complete catalog', () => {
    for (const locale of ['pl', 'en'] as const) for (const patient of PATIENTS) {
      const specialist: Extract<Paper, { kind: 'specialist' }> = {
        id: 4, kind: 'specialist', day: 9, patientId: patient.id, location: 'desk',
        certificate: { jobId: patient.jobId, phone: '42-1000' },
      };
      expect(letteringBounds(specialist, locale).outside, `${locale}: ${patient.id}`).toEqual([]);
      const sender = translations[locale].patientReferrals[patient.id]!.employer;
      expect(wrapReadingText(sender, 144).length, sender).toBeLessThanOrEqual(2);
    }
  });

  it('announces a readable institutional imprint only when the referral seal is clear', () => {
    for (const locale of ['pl', 'en'] as const) for (const job of [0, 45, 46]) {
      const patient = PATIENTS.find(patient => patient.jobId === job)!;
      const institution = job === 45 ? 'militia' : job === 46 ? 'lot' : 'employer';
      const imprint = translations[locale].documentDesign.seal[institution].join(' ');
      for (const seal of ['clear', 'unclear', 'missing'] as const) {
        const paper: Extract<Paper, { kind: 'referral' }> = {
          id: 1, kind: 'referral', day: 9, patientId: patient.id, location: 'desk',
          details: { ageDays: 0, seal, authentic: seal !== 'missing', phone: '42-1000' },
        };
        expect(paperDescription(paper, locale).includes(imprint)).toBe(seal === 'clear');
        expect(paperDescription(paper, locale)).toContain(translations[locale].progression.seal[seal]);
      }
    }
  });
});
