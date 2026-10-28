import { describe, expect, it } from 'vitest';
import { PATIENTS } from '../src/core/patients';
import type { Paper } from '../src/core/game';
import { translations } from '../src/i18n';
import { correspondenceCopy, referralCopy, wrapFormText, wrapReadingText, fieldLabelWidth, DOCUMENT_BODY_WIDTH } from '../src/render/document-copy';
import { measureDocumentHeading, measureDocumentText, measureReadingText, READ_CELL_HEIGHT } from '../src/render/font';
import { ITEM_SIZES } from '../src/core/desk';

describe('institutional document copy', () => {
  it('keeps official correspondence clear of the signature and stamp area', () => {
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale];
      for (const letter of Object.values(t.progression.directives)) {
        expect(wrapReadingText(letter.body).length, `${locale}: ${letter.body}`).toBeLessThanOrEqual(7);
        expect(measureDocumentText(letter.role), letter.role).toBeLessThanOrEqual(100);
        expect(measureDocumentText(letter.signature), letter.signature).toBeLessThanOrEqual(100);
      }
      for (const letter of Object.values(t.paperwork.letters).flat()) {
        expect(wrapReadingText(letter.body).length, `${locale}: ${letter.body}`).toBeLessThanOrEqual(7);
        expect(measureDocumentText(letter.role), letter.role).toBeLessThanOrEqual(100);
        expect(measureDocumentText(letter.signature), letter.signature).toBeLessThanOrEqual(100);
      }
      const seal = t.documentDesign.seal;
      expect(measureDocumentHeading(seal.employer[0], 'sans')).toBeLessThanOrEqual(54);
      expect(measureDocumentText(seal.employer[1])).toBeLessThanOrEqual(54);
      for (const line of seal.militia) expect(measureDocumentText(line)).toBeLessThanOrEqual(38);
      expect(measureDocumentHeading(seal.lot[0], 'sans')).toBeLessThanOrEqual(34);
      expect(measureDocumentText(seal.lot[1])).toBeLessThanOrEqual(34);
      for (const kind of ['clinic', 'chamber'] as const) for (const line of seal[kind]) expect(measureDocumentText(line), line).toBeLessThanOrEqual(40);
      expect(wrapFormText(t.additionalTests.otherChecks).length).toBeLessThanOrEqual(2);
      expect(wrapReadingText(`${t.progression.treatment} ${t.progression.clearance}`).length).toBeLessThanOrEqual(6);
      for (const name of t.patientNames) expect(measureDocumentText(`${t.documentDesign.subject}: ${name}`), name).toBeLessThanOrEqual(166);
    }
  });

  it('retains every referral fact in compact numbered fields in both languages', () => {
    for (const locale of ['pl', 'en'] as const) for (const patient of PATIENTS) {
      const t = translations[locale], copy = referralCopy(patient.id, locale);
      const values = copy.fields.map(field => field.value).join(' ');
      expect(copy.employer).toBe(t.patientReferrals[patient.id]!.employer);
      expect(values).toContain(t.patientNames[patient.id]);
      expect(values).toContain(patient.birthDate);
      expect(values).toContain(t.paperwork[patient.sex]);
      expect(values).toContain(t.patientJobs[patient.id]);
      expect(values).toContain(t.paperwork[patient.managerial ? 'yes' : 'no']);
      expect(values).toContain(t.paperwork.requirementCodes[patient.requirementId]);
      expect(values).toContain(t.patientReferrals[patient.id]!.work);
      expect(values).toContain(t.patientReferrals[patient.id]!.hazards);
      expect(copy.instruction).toContain(t.paperwork[patient.examination]);
      const printed = copy.lines.join(' ').replace(/\s+/g, ' ');
      for (const field of copy.fields) expect(printed).toContain(field.value.replace(/\s+/g, ' '));
      for (const row of copy.rows) expect(fieldLabelWidth(row.label) + measureReadingText(row.value), row.label + row.value).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
      expect(measureReadingText(copy.instruction)).toBeLessThanOrEqual(DOCUMENT_BODY_WIDTH);
      expect(copy.rows.length, `${locale} ${patient.id}: ${copy.lines.join(' | ')}`).toBeLessThanOrEqual(7);
      expect(54 + (copy.rows.length - 1) * 12 + READ_CELL_HEIGHT).toBeLessThanOrEqual(ITEM_SIZES.document.h - 31);
      if (copy.institution === 'employer') expect(wrapFormText(copy.masthead.toUpperCase(), 104).length, copy.masthead).toBeLessThanOrEqual(2);
    }
  });

  it('gives militia and LOT distinct letterheads without adding a location', () => {
    for (const locale of ['pl', 'en'] as const) for (const jobId of [0, 45, 46]) {
      const patient = PATIENTS.find(patient => patient.jobId === jobId)!;
      const copy = referralCopy(patient.id, locale);
      const letter: Extract<Paper, { kind: 'letter' }> = { id: 9, kind: 'letter', day: 9, location: 'desk', patientId: patient.id, sender: 'employer', opened: true };
      const header = correspondenceCopy(letter, locale);
      expect(header.institution).toBe(copy.institution);
      expect(header.masthead).toBe(copy.masthead);
      expect(header.department).toBe(copy.department);
      expect(wrapFormText(copy.masthead).length).toBeLessThanOrEqual(2);
      expect(measureDocumentText(copy.department)).toBeLessThanOrEqual(166);
      if (locale === 'pl' && jobId === 45) expect(copy.subheading).toBe(translations.pl.documentDesign.departments.militia);
    }
  });
});
