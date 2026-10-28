import { describe, expect, it } from 'vitest';
import { PATIENTS, type Paper } from '../src/core/game';
import { ADDITIONAL_TESTS } from '../src/core/additional-tests';
import { drawPaperwork, paperDescription, wrapDocumentLines } from '../src/render/paperwork';
import { ITEM_SIZES } from '../src/core/desk';
import { wrapReadingText, DOCUMENT_BODY_WIDTH } from '../src/render/document-copy';
import { translations } from '../src/i18n';

/** Generated assets load only in the browser; record the actual native lettering. */
function letteringBounds(paper: Paper, locale: 'pl' | 'en') {
  const outside: { x: number; y: number }[] = [];
  let written = 0;
  const ctx = {
    fillStyle: '', save() {}, restore() {},
    fillRect(x: number, y: number, w: number, h: number) {
      // Ignore the existing lifted-paper shadow and state-driven pen corner.
      if (w !== 1 || h !== 1) return;
      written++;
      if (x < 0 || x >= ITEM_SIZES.document.w - 11 || y < 0 || y >= ITEM_SIZES.document.h) outside.push({ x, y });
    },
  } as unknown as CanvasRenderingContext2D;
  drawPaperwork(ctx, paper, { x: 0, y: 0, ...ITEM_SIZES.document }, locale, false);
  return { outside, written };
}

describe('revised document lettering', () => {
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
      // Five larger result rows stop before the small scope note and ink.
      expect(wrapReadingText(t.additionalTests.report[test][fit ? 'fit' : 'unfit'], DOCUMENT_BODY_WIDTH, 'handwritten').length).toBeLessThanOrEqual(5);
      expect(wrapDocumentLines([t.additionalTests.otherChecks], DOCUMENT_BODY_WIDTH).length).toBeLessThanOrEqual(2);
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
