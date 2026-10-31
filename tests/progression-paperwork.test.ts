import { describe, expect, it } from 'vitest';
import { translations } from '../src/i18n';
import { PATIENTS, type Paper } from '../src/core/game';
import { defaultReferral, effectivePatient } from '../src/core/progression';
import { measureDocumentText } from '../src/render/font';
import { noteEntries, paperDescription, referralIssueDate, specialistJob, wrapDocumentLines } from '../src/render/paperwork';
import { specialistIssuer } from '../src/render/document-copy';
import glossary from '../docs/localization-glossary.json';

describe('progressive paperwork presentation', () => {
  it('keeps named specialist contacts stable, localized and clear of the header reference', () => {
    const pl = translations.pl.progression.specialistNames, en = translations.en.progression.specialistNames;
    expect(pl).toHaveLength(en.length);
    expect(new Set(pl).size).toBe(pl.length);
    for (const [index, name] of pl.entries()) {
      const [, first, last] = name.split(' ');
      expect(en[index]).toBe(`Dr ${glossary.firstNames[first as keyof typeof glossary.firstNames]} ${glossary.surnames[last as keyof typeof glossary.surnames]}`);
    }
    for (const locale of ['pl', 'en'] as const) {
      const seen = new Set<string>();
      for (let number = 1000; number < 1016; number++) {
        const paper: Extract<Paper, { kind: 'specialist' }> = { kind: 'specialist', id: 1, day: 6, patientId: 0,
          location: 'desk', certificate: { jobId: 0, phone: `43-${number}` } };
        const issuer = specialistIssuer(paper.certificate, locale);
        seen.add(issuer);
        expect(measureDocumentText(issuer)).toBeLessThanOrEqual(112);
        expect(paperDescription(paper, locale)).toContain(issuer);
        expect(paperDescription({ ...paper, id: 99, location: 'drawer-2' }, locale)).toContain(issuer);
        expect(specialistIssuer(JSON.parse(JSON.stringify(paper.certificate)), locale)).toBe(issuer);
      }
      expect(seen.size).toBe(pl.length);
    }
  });

  it('fits the complete directives and specialist certificate in both languages', () => {
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale], p = t.progression;
      for (const letter of Object.values(p.directives)) {
        expect(measureDocumentText(letter.subject), letter.subject).toBeLessThanOrEqual(166);
        expect(wrapDocumentLines([letter.body], 166).length, letter.body).toBeLessThanOrEqual(7);
        expect(measureDocumentText(letter.role), letter.role).toBeLessThanOrEqual(150);
      }
      expect(measureDocumentText(p.specialistTitle)).toBeLessThanOrEqual(166);
      expect(wrapDocumentLines([p.treatment, p.clearance], 166).length).toBeLessThanOrEqual(5);
      for (const patient of PATIENTS) {
        const certificate: Extract<Paper, { kind: 'specialist' }> = { kind: 'specialist', id: 1, day: 6, patientId: patient.id,
          location: 'desk', certificate: { jobId: patient.jobId, phone: '43-1234' } };
        expect(measureDocumentText(`${t.paperwork.position}: ${specialistJob(certificate, locale)}`)).toBeLessThanOrEqual(166);
      }
    }
  });

  it('keeps both telephone conclusions and full examination notes within the sheet', () => {
    for (const locale of ['pl', 'en'] as const) for (const original of PATIENTS) {
      for (const bribe of [false, true]) {
        const patient = effectivePatient(original.id, bribe);
        const note: Extract<Paper, { kind: 'note' }> = { id: 1, day: 8, location: 'desk', kind: 'note', patientId: patient.id,
          examinationOrder: ['general', 'vision', 'pressure', 'measurements'], noteOrder: ['general', 'history', 'vision', 'pressure', 'pressure-repeat', 'measurements', 'call-specialist', 'call-employer'], bribe, calls: { specialist: true, employer: false }, additionalWritten: true,
          results: { general: patient.general, vision: patient.visionValues, pressure: patient.pressureValues,
            pressureReadings: [patient.pressureValues, patient.pressureValues], weight: patient.weight, height: patient.height } };
        const entries = noteEntries(note, locale), lines = entries.flatMap(entry => wrapDocumentLines([entry.text], 166));
        expect(lines.length, `${locale}/${patient.id}/${bribe}`).toBeLessThanOrEqual(15);
        expect(paperDescription(note, locale)).toContain(translations[locale].progression.notes.employerInvalid);
      }
    }
  });

  it('shows dates before the campaign and never reveals a smudged seal truth through accessibility', () => {
    const paper: Extract<Paper, { kind: 'referral' }> = { kind: 'referral', id: 1, day: 1, patientId: 0, location: 'desk',
      details: { ...defaultReferral(1, 0), ageDays: 4, seal: 'unclear', authentic: true } };
    expect(referralIssueDate(paper, 'pl')).toBe('30.10.1983');
    expect(referralIssueDate(paper, 'en')).toBe('30/10/1983');
    for (const locale of ['pl', 'en'] as const) {
      expect(paperDescription(paper, locale)).toEqual(paperDescription({ ...paper, details: { ...paper.details, authentic: false } }, locale));
      expect(paperDescription(paper, locale)).toContain(translations[locale].progression.seal.unclear);
    }
  });
});
