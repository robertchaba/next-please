import { describe, expect, it } from 'vitest';
import type { Paper } from '../src/core/game';
import { translations } from '../src/i18n';
import { letterContent, paperDescription, wrapDocumentLines } from '../src/render/paperwork';
import { measureDocumentText } from '../src/render/font';

describe('signed administrative correspondence', () => {
  it('fits every subject, body and named signature on the sheet in both languages', () => {
    for (const t of Object.values(translations)) for (const sender of ['zus', 'employer'] as const) {
      const letters = t.paperwork.letters[sender];
      expect(letters.length).toBeGreaterThanOrEqual(6);
      expect(new Set(letters.map(letter => letter.body)).size).toBe(letters.length);
      for (const letter of letters) {
        expect(measureDocumentText(letter.subject), letter.subject).toBeLessThanOrEqual(166);
        const lines = wrapDocumentLines([letter.body], 166);
        expect(lines.length, letter.body).toBeLessThanOrEqual(5);
        for (const line of lines) expect(measureDocumentText(line), line).toBeLessThanOrEqual(166);
        for (const line of [letter.role, letter.signature]) expect(measureDocumentText(line), line).toBeLessThanOrEqual(115);
      }
    }
  });

  it('keeps the chosen variant and signature stable across repeated reads and languages', () => {
    for (const sender of ['zus', 'employer'] as const) {
      const seen = new Set<string>();
      for (let id = 1; id <= 6; id++) {
        const paper: Extract<Paper, { kind: 'letter' }> = { id, day: 3, patientId: 0, kind: 'letter', sender, location: 'desk', opened: true };
        const before = structuredClone(paper);
        const pl = letterContent(paper, 'pl'), en = letterContent(paper, 'en');
        expect(letterContent(paper, 'pl')).toEqual(pl);
        expect(pl.signature).toBe(en.signature);
        seen.add(pl.body);
        expect(paperDescription(paper, 'pl')).toContain(`${pl.role}: ${pl.signature}`);
        expect(paperDescription(paper, 'en')).toContain(`${en.role}: ${en.signature}`);
        expect(paperDescription({ ...paper, opened: false }, 'pl')).not.toContain(pl.body);
        expect(paper).toEqual(before);
      }
      expect(seen.size).toBe(6);
    }
  });
});
