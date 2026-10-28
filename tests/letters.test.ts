import { describe, expect, it } from 'vitest';
import { PATIENTS, type Paper } from '../src/core/game';
import { translations } from '../src/i18n';
import { letterContent, correspondenceSender, paperDescription, wrapDocumentLines, employerStationery } from '../src/render/paperwork';
import { measureDocumentText } from '../src/render/font';

describe('signed administrative correspondence', () => {
  it('fits every sender on the generated envelope label and keeps service headers separate', () => {
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale];
      for (const patient of PATIENTS) {
        const paper: Extract<Paper, { kind: 'letter' }> = { id: 1, day: 9, patientId: patient.id, kind: 'letter', sender: 'employer', location: 'desk', opened: false };
        const rows = wrapDocumentLines([correspondenceSender(paper, locale)], 118);
        expect(rows.length).toBeLessThanOrEqual(3);
        for (const row of rows) expect(measureDocumentText(row, 'typewriter')).toBeLessThanOrEqual(118);
        const institution = employerStationery(patient.id);
        if (institution !== 'referral') expect(measureDocumentText(t.paperwork.referral, 'book') + measureDocumentText(t.paperwork.stationery[institution], 'book') + 8).toBeLessThanOrEqual(166);
      }
      expect(measureDocumentText(t.paperwork.recipient, 'typewriter')).toBeLessThanOrEqual(118);
    }
  });

  it('fits every subject, body and named signature on the sheet in both languages', () => {
    for (const t of Object.values(translations)) for (const sender of ['zus', 'employer', 'missingResult'] as const) {
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


it('addresses report reprimands from militia headquarters, LOT or the workplace in both languages', () => {
  for (const locale of ['pl', 'en'] as const) for (const job of [18, 45, 46, 47]) {
    const t = translations[locale], patient = PATIENTS.find(patient => patient.jobId === job)!;
    const paper: Extract<Paper, { kind: 'letter' }> = { id: 1, day: 9, patientId: patient.id,
      kind: 'letter', sender: 'employer', reason: 'missing-result', location: 'desk', opened: true };
    const sender = job === 45 ? t.paperwork.missingResultSenders.militia : job === 46 ? t.paperwork.missingResultSenders.lot : t.patientReferrals[patient.id]!.employer;
    expect(correspondenceSender(paper, locale)).toBe(sender);
    expect(paperDescription(paper, locale)).toContain(sender);
    expect(paperDescription(paper, locale)).toContain(letterContent(paper, locale).body);
    expect(t.paperwork.letters.missingResult).toContainEqual(letterContent(paper, locale));
    expect(measureDocumentText(sender)).toBeLessThanOrEqual(166);
  }
});

it('describes records and duties without revealing sanctions in correspondence', () => {
  for (const t of Object.values(translations)) {
    const letters = [...Object.values(t.paperwork.letters).flat(), ...Object.values(t.progression.directives)];
    for (const letter of letters) expect(`${letter.subject} ${letter.body}`).not.toMatch(/sankcj|kar[ayę]|nagan|upomnien|składk|potrącen|\bfines?\b|penalt|premium|reprimand|warning|tariff/i);
  }
});
