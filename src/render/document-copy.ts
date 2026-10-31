import { PATIENTS } from '../core/patients';
import type { Paper } from '../core/game';
import type { SpecialistCertificate } from '../core/progression';
import { translations, type Locale } from '../i18n';
import { measureDocumentText, measureReadingText, type ReadingFace } from './font';
import { PAPER_SIZE, CLINICAL_PAPER_SIZE } from '../core/desk';

export const DOCUMENT_BODY_WIDTH = PAPER_SIZE.w - 22;
export const REFERRAL_BODY_WIDTH = CLINICAL_PAPER_SIZE.w - 22;
export const REFERRAL_BODY_Y = 50;
export const REFERRAL_LINE_HEIGHT = 10;

/** A saved phone contact always identifies the same issuer, including older saves. */
export function specialistIssuer(certificate: SpecialistCertificate, locale: Locale): string {
  const names = translations[locale].progression.specialistNames;
  return names[Number(certificate.phone.slice(-4)) % names.length]!;
}

/** Labels and values share one native size and baseline, including their gap. */
export const fieldLabelWidth = (label: string): number => measureReadingText(label + 'x') - measureReadingText('x');

export function wrapReadingText(text: string, width = DOCUMENT_BODY_WIDTH, face: ReadingFace = 'typewriter'): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && measureReadingText(next, face) > width) { lines.push(line); line = word; }
    else line = next;
  }
  lines.push(line);
  return lines;
}

export type DocumentInstitution = 'employer' | 'militia' | 'lot' | 'zus' | 'chamber' | 'clinic';
export interface DocumentField { number: string; label: string; value: string }
export interface DocumentRow { label: string; value: string }

/** Institutional language follows the immutable profession, never the medical result. */
export function employerInstitution(patientId: number): 'employer' | 'militia' | 'lot' {
  const job = PATIENTS[patientId]!.jobId;
  return job === 45 ? 'militia' : job === 46 ? 'lot' : 'employer';
}

/** Text stays whole at native resolution; labels are not squeezed to fit. */
export function wrapFormText(text: string, width = 166): string[] {
  const rows: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measureDocumentText(candidate, 'typewriter') > width) { rows.push(current); current = word; }
    else current = candidate;
  }
  rows.push(current);
  return rows;
}

/** Printed field labels and typed values can be drawn separately on each line. */
export function fieldRows(field: DocumentField, width = DOCUMENT_BODY_WIDTH): DocumentRow[] {
  const rows: DocumentRow[] = [];
  let label = `${field.number}  ${field.number === '01' ? '' : `${field.label}: `}`;
  let value = '';
  for (const word of field.value.split(' ')) {
    const candidate = value ? `${value} ${word}` : word;
    if (value && fieldLabelWidth(label) + measureReadingText(candidate) > width) {
      rows.push({ label, value }); label = '    '; value = word;
    } else value = candidate;
  }
  rows.push({ label, value });
  return rows;
}

export function referralCopy(patientId: number, locale: Locale) {
  const t = translations[locale], d = t.documentDesign, p = t.paperwork;
  const patient = PATIENTS[patientId]!, referral = t.patientReferrals[patientId]!;
  const institution = employerInstitution(patientId);
  const fields: DocumentField[] = [
    { number: '01', label: d.fields.identity, value: t.patientNames[patientId]! },
    { number: '02', label: p.birthShort, value: `${patient.birthDate}   ${p.sex}: ${p[patient.sex]}` },
    { number: '03', label: d.fields.position, value: t.patientJobs[patientId]! },
    { number: '04', label: p.managerial, value: `${patient.managerial ? p.yes : p.no}   ${p.requirements}: ${p.requirementCodes[patient.requirementId]}` },
    { number: '05', label: d.fields.work, value: referral.work },
    { number: '06', label: d.fields.hazards, value: referral.hazards },
  ];
  const instruction = d.referralInstruction[patient.examination];
  const rows = fields.flatMap(field => fieldRows(field, REFERRAL_BODY_WIDTH));
  const lines = [instruction, ...rows.map(row => row.label + row.value)];
  return {
    institution,
    masthead: institution === 'employer' ? referral.employer : d.institutions[institution],
    department: d.departments[institution],
    subheading: institution === 'employer' || referral.employer.toUpperCase() === d.institutions[institution]
      ? d.departments[institution] : referral.employer,
    employer: referral.employer,
    title: d.referral,
    instruction,
    fields,
    rows,
    lines,
  };
}

/** A clear letterhead replaces the generic "letter about a certificate" heading. */
export function correspondenceCopy(paper: Extract<Paper, { kind: 'letter' | 'directive' }>, locale: Locale) {
  const t = translations[locale], d = t.documentDesign;
  const institution: DocumentInstitution = paper.sender === 'employer' ? employerInstitution(paper.patientId!) : paper.sender;
  const employer = paper.patientId === null ? '' : t.patientReferrals[paper.patientId]!.employer;
  return {
    institution,
    masthead: institution === 'employer' ? employer : d.institutions[institution],
    department: d.departments[institution],
    employer,
    title: paper.kind === 'directive' ? d.directive : d.letter,
    recipient: d.recipient,
    subjectLabel: d.subject,
    referenceLabel: d.reference,
    personal: d.personal,
  };
}
