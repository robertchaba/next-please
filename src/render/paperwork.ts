import { PATIENTS, type GameState, type Paper } from '../core/game';
import { ADDITIONAL_TESTS, additionalNoteResult, additionalTestForJob, type AdditionalTest } from '../core/additional-tests';
import { referralDate, workDayNumber, effectivePatient } from '../core/progression';
import { generalFindingIndex, patientAge, veryHighPressure, type PressureValues, type VisionValues } from '../core/patients';
import type { Rect } from '../core/desk';
import { formatGameDate, gameDate } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import { drawPaper, drawPaperclip, drawDecisionImprint, drawDocumentSeal, drawDocumentSignature, drawUnclearSeal, drawInspectionForm, drawInspector, drawStationery } from './clinic';
import { drawDocumentText, measureDocumentText } from './font';
import { drawManualArt } from './clinic';
import { paginateNoteEntries, notePageControls, notePageLabel } from './note-pages';

export const DOCUMENT_INK = '#333b2b';
export const HANDWRITING_INK = '#385b78';
export const ALERT_INK = '#a33128';
const ink = DOCUMENT_INK, muted = '#79785c';

/** Employer identity selects artwork, independently of medical findings and locale. */
export function employerStationery(patientId: number): 'referral' | 'militia' | 'lot' {
  const job = PATIENTS[patientId]!.jobId;
  return job === 45 ? 'militia' : job === 46 ? 'lot' : 'referral';
}

/** Stable archived correspondence: reading, language changes and imports never reroll it. */
export function letterContent(paper: Extract<Paper, { kind: 'letter' }>, locale: Locale) {
  const variants = translations[locale].paperwork.letters[paper.reason === 'missing-result' ? 'missingResult' : paper.sender];
  return variants[((paper.day - 1) * 7 + paper.patientId * 5 + paper.id) % variants.length]!;
}

export function correspondenceSender(paper: Extract<Paper, { kind: 'letter' | 'directive' }>, locale: Locale): string {
  const t = translations[locale];
  if (paper.sender === 'zus') return t.paperwork.zus;
  if (paper.kind === 'directive') return t.progression.chamber;
  if (paper.reason === 'missing-result') {
    const job = PATIENTS[paper.patientId]!.jobId;
    if (job === 45) return t.paperwork.missingResultSenders.militia;
    if (job === 46) return t.paperwork.missingResultSenders.lot;
  }
  return t.patientReferrals[paper.patientId]!.employer;
}

export function visionReading(values: VisionValues, locale: Locale): string {
  const t = translations[locale];
  const value = (number: number) => (number > 0 ? '+' : '') + String(number).replace('.', locale === 'pl' ? ',' : '.');
  return `${t.leftEye}: ${value(values.left)}, ${t.rightEye}: ${value(values.right)}`;
}

export function pressureReading(values: PressureValues): string {
  return `${values.systolic}/${values.diastolic}`;
}

/** The clinical case fixes the finding; changing language only translates it. */
export function generalReading(patientId: number, locale: Locale): string {
  const patient = PATIENTS[patientId]!, t = translations[locale], finding = generalFindingIndex(patient);
  const additional = additionalTestForJob(patient);
  if (patient.general === 'refer' && (additional === 'psychiatry' || additional === 'chest-xray')) return t.additionalTests.concerns[additional];
  return finding === null ? t.generalClear : t.generalFindings[finding]!;
}

/** Identity and age belong to this visit even when the sheet is read years later. */
export function noteIdentity(paper: Extract<Paper, { kind: 'note' }>, locale: Locale): string {
  if (paper.patientId === null) return '';
  const t = translations[locale], age = patientAge(PATIENTS[paper.patientId]!, gameDate(paper.day));
  return `${t.patientNames[paper.patientId]}   ${t.paperwork.age}: ${age}`;
}

/** Completed entries only, in the order retained by the examination transitions. */
export function noteEntries(paper: Extract<Paper, { kind: 'note' }>, locale: Locale): { text: string; color: string }[] {
  if (paper.patientId === null) return [];
  const t = translations[locale], p = t.paperwork, r = paper.results;
  const rows: { text: string; color: string }[] = [];
  const history = paper.bribe ? t.progression.bribeNotes[effectivePatient(paper.patientId, true).vision === 'refer' ? 'vision' : 'pressure'] : t.patientNotes[paper.patientId]!;
  for (const entry of paper.noteOrder) {
    const additional = additionalNoteResult(entry);
    if (additional) rows.push({ text: `${t.additionalTests.tests[additional.test]}: ${t.additionalTests.notes[additional.test][additional.fit ? 'fit' : 'unfit']}`, color: HANDWRITING_INK });
    if (entry === 'general' && r.general !== null) rows.push({ text: `${t.generalResult}: ${r.general === 'pass' ? t.generalClear : generalReading(paper.patientId, locale)}`, color: HANDWRITING_INK });
    if (entry === 'history' && r.general !== null) for (const text of history) rows.push({ text, color: HANDWRITING_INK });
    if (entry === 'vision' && r.vision !== null) rows.push({ text: `${t.documentVision}: ${visionReading(r.vision, locale)}`, color: HANDWRITING_INK });
    if (entry === 'pressure' || entry === 'pressure-repeat') {
      const reading = r.pressureReadings[entry === 'pressure' ? 0 : 1];
      if (reading) rows.push({ text: `${t.documentPressure}: ${pressureReading(reading)}`, color: veryHighPressure(reading) ? ALERT_INK : HANDWRITING_INK });
    }
    if (entry === 'measurements' && r.weight !== null && r.height !== null) rows.push({ text: `${p.weight} ${r.weight} ${p.kg}   ${p.height} ${r.height} ${p.cm}`, color: HANDWRITING_INK });
    if (entry === 'call-specialist' && paper.calls.specialist !== null) rows.push({ text: t.progression.notes[paper.calls.specialist ? 'specialistValid' : 'specialistInvalid'], color: HANDWRITING_INK });
    if (entry === 'call-employer' && paper.calls.employer !== null) rows.push({ text: t.progression.notes[paper.calls.employer ? 'employerValid' : 'employerInvalid'], color: HANDWRITING_INK });
  }
  return rows;
}

export function referralLines(patientId: number, locale: Locale): string[] {
  const t = translations[locale], p = t.paperwork, patient = PATIENTS[patientId]!;
  const referral = t.patientReferrals[patientId]!;
  return [
    `${p.employer}: ${referral.employer}`,
    `${p.name}: ${t.patientNames[patientId]}`,
    `${p.birthShort}: ${patient.birthDate}   ${p.sex}: ${p[patient.sex]}`,
    `${p.examination}: ${p[patient.examination]}`,
    `${p.position}: ${t.patientJobs[patientId]}`,
    `${p.managerial}: ${patient.managerial ? p.yes : p.no}   ${p.requirements}: ${p.requirementCodes[patient.requirementId]}`,
    `${p.work}: ${referral.work}`,
    `${p.hazards}: ${referral.hazards}`,
  ];
}

export function referralIssueDate(paper: Extract<Paper, { kind: 'referral' }>, locale: Locale): string {
  const date = referralDate(paper.day, paper.details.ageDays);
  return [String(date.day).padStart(2, '0'), String(date.month).padStart(2, '0'), date.year].join(locale === 'pl' ? '.' : '/');
}

export function specialistJob(paper: Extract<Paper, { kind: 'specialist' }>, locale: Locale): string {
  const patient = PATIENTS[paper.patientId]!;
  if (paper.certificate.jobId === patient.jobId) return translations[locale].patientJobs[paper.patientId]!;
  const other = PATIENTS.find(entry => entry.jobId === paper.certificate.jobId && entry.sex === patient.sex)
    ?? PATIENTS.find(entry => entry.jobId === paper.certificate.jobId)!;
  return translations[locale].patientJobs[other.id]!;
}

/** Exactly the same rows serve text, pointer hit tests and keyboard controls. */
export function additionalTestRect(bounds: Rect, test: AdditionalTest): Rect {
  return { x: bounds.x + 11, y: bounds.y + 56 + ADDITIONAL_TESTS.indexOf(test) * 14, w: bounds.w - 22, h: 13 };
}

export function additionalResultText(paper: Extract<Paper, { kind: 'additional-result' }>, locale: Locale): string {
  return translations[locale].additionalTests.report[paper.test][paper.fit ? 'fit' : 'unfit'];
}

export function paperPhoneRect(bounds: Rect): Rect {
  return { x: bounds.x + 9, y: bounds.y + 128, w: 91, h: 12 };
}

export function paperDescription(paper: Paper, locale: Locale, clipped = false): string {
  const t = translations[locale], p = t.paperwork, q = t.progression;
  const name = paper.patientId === null ? '' : t.patientNames[paper.patientId];
  let text: string;
  if (paper.kind === 'inspection-id') {
    text = `${t.inspection.identity}. ${t.inspection.names[paper.inspectorId]}. ${t.inspection.role}. ${t.inspection.number}: K/${41 + paper.inspectorId}. ${t.inspection.validity}`;
  } else if (paper.kind === 'inspection-fine') {
    const q = t.inspection;
    text = `${q.fineTitle}. ${q.addressee}. ${name}. ${q.visit}: ${formatGameDate(paper.targetDay, locale)}. ${paper.amount === 200 ? q.absentReason : q.partialReason} ${q.amount}: ${paper.amount} ${t.home.currency}. ${q.inspectorSignature}: ${q.names[paper.inspectorId]}. ${q.settlement}`;
  } else if (paper.kind === 'referral') {
    text = `${p.referral}. ${p.occupational}. ${referralLines(paper.patientId, locale).join('. ')}. ${q.seal[paper.details.seal]}. ${p.signed}.`;
    const institution = employerStationery(paper.patientId);
    if (institution !== 'referral') text += ` ${p.stationery[institution]}.`;
    if (workDayNumber(paper.day) >= 5) text += ` ${q.hr}. ${q.phone} ${paper.details.phone}.`;
  } else if (paper.kind === 'additional-referral') {
    const a = t.additionalTests;
    text = `${a.title}. ${name}. ${p.position}: ${t.patientJobs[paper.patientId]}. ${a.choose}: ${ADDITIONAL_TESTS.map(test => a.tests[test]).join('; ')}. ${paper.test ? `${a.selected}: ${a.tests[paper.test]}` : a.empty}. ${a.selectionHelp}`;
  } else if (paper.kind === 'additional-result') {
    const a = t.additionalTests;
    text = `${a.resultTitle}. ${name}. ${p.position}: ${t.patientJobs[paper.patientId]}. ${a.tests[paper.test]}. ${additionalResultText(paper, locale)} ${a.otherChecks} ${p.signed}.`;
  } else if (paper.kind === 'specialist') {
    text = `${q.specialistTitle}. ${name}. ${q.treatment} ${q.clearance} ${p.position}: ${specialistJob(paper, locale)}. ${q.phone} ${paper.certificate.phone}. ${q.chamber}. ${p.signed}.`;
  } else if (paper.kind === 'letter' || paper.kind === 'directive') {
    const sender = correspondenceSender(paper, locale);
    text = `${paper.opened ? p.letter : p.envelope}. ${p.sender}: ${sender}.`;
    text += ` ${paper.sender === 'zus' ? p.zusSeal : paper.sender === 'chamber' ? q.chamber : p.employerSeal}.`;
    if (paper.opened) {
      const letter = paper.kind === 'directive' ? q.directives[paper.rule] : letterContent(paper, locale);
      text += ` ${name}. ${letter.subject}. ${letter.body} ${letter.role}: ${letter.signature}. ${p.signed}.`;
    }
  } else {
    text = paper.patientId === null ? p.blank : [p.note, noteIdentity(paper, locale),
      ...noteEntries(paper, locale).map(row => row.text.replace(/\.$/, ''))].join('. ') + '.';
    if (paper.results.pressureReadings.some(veryHighPressure)) text += ` ${t.documentPressure}: ${t.veryHigh}.`;
  }
  if (paper.kind !== 'note') text += ` ${p.issued}: ${paper.kind === 'referral' ? referralIssueDate(paper, locale) : formatGameDate(paper.day, locale)}. ${p.reference}: ${paper.id}.`;
  if (clipped) text += ` ${p.clipped}.`;
  if (paper.location === 'drawer') text += ` ${p.stored}.`;
  return text;
}

export function certificateDescription(state: GameState, locale: Locale): string {
  const t = translations[locale], p = t.paperwork, visit = state.visit;
  if (!visit?.certificateTaken) return t.certificate;
  return [t.certificate,
    visit.certificateNamed ? `${p.nameWritten}: ${t.patientNames[visit.patientId]}` : p.nameMissing,
    visit.certificateNamed ? `${p.position}: ${t.patientJobs[visit.patientId]}` : p.positionMissing,
    `${p.issued}: ${formatGameDate(state.day, locale)}`,
    `${p.reference}: ${state.day}/${state.shiftCompleted + 1}`,
    visit.decision ? `${p.decisionHeading}: ${t[visit.decision]}. ${p.signed}` : t.stampHere,
  ].join('. ') + '.';
}

export function paperActionRect(bounds: Rect): Rect {
  return { x: bounds.x + bounds.w - 27, y: bounds.y + bounds.h - 25, w: 24, h: 22 };
}

export function paperClipRect(bounds: Rect): Rect {
  return { x: bounds.x + bounds.w - 17, y: bounds.y - 2, w: 10, h: 19 };
}

/** The horizontal identity card shares the desk paper anchor, but has its own hit area. */
export function visiblePaperRect(paper: Paper | undefined, bounds: Rect): Rect {
  if (paper?.kind !== 'inspection-id') return bounds;
  const h = Math.round(bounds.w * 112 / 188);
  return { ...bounds, y: bounds.y + Math.round((bounds.h - h) / 2), h };
}

/** Native-pixel wrapping; text is never scaled or squeezed to fit a form. */
export function wrapDocumentLines(lines: readonly string[], width: number): string[] {
  return lines.flatMap(line => {
    const wrapped: string[] = [];
    let current = '';
    for (const word of line.split(' ')) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && measureDocumentText(candidate) > width) { wrapped.push(current); current = word; }
      else current = candidate;
    }
    wrapped.push(current);
    return wrapped;
  });
}

function fill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}

export function drawActionCorner(ctx: CanvasRenderingContext2D, bounds: Rect, pen: boolean): void {
  const { x, y, w, h } = bounds;
  if (pen) {
    // A small fountain-pen nib is printed at the writing corner of the sheet.
    for (let row = 0; row < 11; row++) fill(ctx, x + w - 16 - Math.floor(row / 2), y + h - 21 + row, 3, 1, '#625a40');
    fill(ctx, x + w - 21, y + h - 11, 2, 2, ink);
    fill(ctx, x + w - 22, y + h - 8, 11, 1, '#9b8b64');
  } else {
    for (let row = 0; row < 18; row++) {
      fill(ctx, x + w - 4 - row, y + h - 21 + row, row + 1, 1, '#8e8360');
      if (row > 1) fill(ctx, x + w - 3 - row, y + h - 21 + row, row - 1, 1, '#e0d3ab');
    }
  }
}

export function drawPaperwork(ctx: CanvasRenderingContext2D, paper: Paper, bounds: Rect, locale: Locale, lifted: boolean, clipped = false, showActions = true, page = 0): void {
  const { x, y, w, h } = bounds, t = translations[locale], p = t.paperwork;
  if (paper.kind === 'inspection-id' || paper.kind === 'inspection-fine') {
    drawInspectionPaper(ctx, paper, bounds, locale);
    if (clipped) { const clip = paperClipRect(visiblePaperRect(paper, bounds)); drawPaperclip(ctx, clip.x, clip.y, lifted); }
    return;
  }
  const full = w >= 188;
  const employer = paper.patientId === null ? 'referral' : employerStationery(paper.patientId);
  const employerSeal = employer === 'referral' ? 'employer' : employer;
  const seal = paper.kind === 'letter' || paper.kind === 'directive' ? paper.sender === 'employer' ? employerSeal : paper.sender : paper.kind === 'specialist' ? 'chamber' : paper.kind === 'referral' ? employerSeal : 'clinic';
  const sealed = paper.kind !== 'referral' || paper.details.seal !== 'missing';
  const drawSeal = (sx: number, sy: number, size: number): void => {
    if (!sealed) return;
    if (paper.kind === 'referral' && paper.details.seal === 'unclear') drawUnclearSeal(ctx, sx, sy, size);
    else drawDocumentSeal(ctx, sx, sy, size, seal);
  };
  fill(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#20271fc0');
  const envelope = (paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened;
  if (paper.kind === 'note') drawPaper(ctx, x, y, w, h);
  else drawStationery(ctx, envelope ? 'envelope' : paper.kind === 'referral' ? employer : paper.kind === 'additional-result' || paper.kind === 'specialist' ? 'clinical' : 'referral', x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color, face: color === HANDWRITING_INK || color === ALERT_INK ? 'handwritten' : dy <= 10 ? 'book' : 'typewriter' });
  const dateAndReference = (): void => {
    write(`${p.date}: ${paper.kind === 'referral' ? referralIssueDate(paper, locale) : formatGameDate(paper.day, locale)}`, 11, 20, muted);
    drawDocumentText(ctx, `${p.reference} ${paper.id}`, x + w - 12, y + 20, { color: muted, align: 'right', face: 'typewriter' });
  };
  const authentication = (): void => {
    drawDocumentSignature(ctx, x + 16, y + 120, 49, 10);
    drawSeal(x + w - (seal === 'zus' ? 49 : 38), y + 115, 22);
  };
  if ((paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened) {
    if (full) {
      drawSeal(x + 35, y + 116, 22);
      write(formatGameDate(paper.day, locale), 35, 67, muted);
      wrapDocumentLines([correspondenceSender(paper, locale)], 118).forEach((line, index) => write(line, 35, 79 + index * 8));
      write(p.recipient, 35, 103, '#625e46');
    } else drawSeal(x + w - (seal === 'zus' ? 26 : 20), y + h - 23, 12);
  } else if (!full) {
    if (paper.kind !== 'note' || paper.patientId !== null) {
      fill(ctx, x + 7, y + 10, w - 14, 1, muted);
      for (let row = 0; row < 6; row++) fill(ctx, x + 7, y + 20 + row * 5, w - 15 - row % 3 * 4, 1, '#b0a780');
      drawSeal(x + w - (seal === 'zus' ? 26 : 20), y + h - 23, 12);
    }
  } else if (paper.kind === 'referral') {
    const headingY = employer === 'lot' ? 14 : 10;
    drawDocumentText(ctx, p.referral, x + 11, y + headingY, { color: ink, face: 'book' });
    if (employer !== 'referral') drawDocumentText(ctx, p.stationery[employer], x + w - 12, y + headingY, { color: '#3d5261', align: 'right', face: 'book' });
    dateAndReference();
    const lines = wrapDocumentLines(referralLines(paper.patientId, locale), w - 22);
    lines.forEach((line, index) => write(line, 11, 33 + index * 8));
    authentication();
    if (workDayNumber(paper.day) >= 5) write(`${t.progression.phone} ${paper.details.phone}`, 11, 131, HANDWRITING_INK);
  } else if (paper.kind === 'additional-referral') {
    const a = t.additionalTests;
    write(a.title, 11, 10);
    dateAndReference();
    write(t.patientNames[paper.patientId]!, 11, 33, HANDWRITING_INK);
    write(`${p.position}: ${t.patientJobs[paper.patientId]}`, 11, 42, HANDWRITING_INK);
    for (const test of ADDITIONAL_TESTS) {
      const row = additionalTestRect(bounds, test);
      drawDocumentText(ctx, a.tests[test], row.x + 5, row.y + 3, { color: ink, face: 'typewriter' });
      if (paper.test === test) {
        // A state-driven hand-marked oval, rasterized on the native pixel grid.
        const width = measureDocumentText(a.tests[test]) + 10, height = 12;
        const rx = width / 2, ry = height / 2;
        for (let dx = 0; dx <= width; dx++) {
          const dy = Math.round(ry * Math.sqrt(Math.max(0, 1 - ((dx - rx) / rx) ** 2)));
          fill(ctx, row.x + dx, row.y + Math.round(ry) - dy, 1, 1, HANDWRITING_INK);
          fill(ctx, row.x + dx, row.y + Math.round(ry) + dy, 1, 1, HANDWRITING_INK);
        }
      }
    }
    write(a.choose, 11, 118, muted);
    drawDocumentSignature(ctx, x + 99, y + 126, 49, 10);
  } else if (paper.kind === 'additional-result') {
    const a = t.additionalTests;
    write(a.resultTitle, 11, 10);
    dateAndReference();
    write(t.patientNames[paper.patientId]!, 11, 33);
    write(a.tests[paper.test], 11, 45, muted);
    const body = wrapDocumentLines([additionalResultText(paper, locale)], w - 22);
    body.forEach((line, index) => write(line, 11, 58 + index * 8, paper.fit ? HANDWRITING_INK : ALERT_INK));
    wrapDocumentLines([a.otherChecks], w - 22).forEach((line, index) => write(line, 11, 91 + index * 8, muted));
    authentication();
  } else if (paper.kind === 'specialist') {
    write(t.progression.specialistTitle, 11, 10);
    dateAndReference();
    write(t.patientNames[paper.patientId]!, 11, 34);
    const body = wrapDocumentLines([t.progression.treatment, t.progression.clearance], w - 22);
    body.forEach((line, index) => write(line, 11, 48 + index * 8));
    write(`${p.position}: ${specialistJob(paper, locale)}`, 11, 96, HANDWRITING_INK);
    authentication();
    write(`${t.progression.phone} ${paper.certificate.phone}`, 11, 131, HANDWRITING_INK);
  } else if (paper.kind === 'note') {
    if (paper.patientId !== null) {
      drawDocumentText(ctx, noteIdentity(paper, locale), x + 11, y + 12, { color: HANDWRITING_INK, face: 'handwritten' });
      const sheet = paginateNoteEntries(noteEntries(paper, locale), w - 22, page);
      sheet.lines.forEach((line, index) => drawDocumentText(ctx, line.text, x + 11, y + 24 + index * 8, { color: line.color, face: 'handwritten' }));
      if (sheet.count > 1) {
        drawDocumentText(ctx, notePageLabel(locale, sheet.page, sheet.count), x + Math.floor(w / 2), y + h - 12, { color: muted, align: 'center' });
        if (!lifted && showActions) {
          const corners = notePageControls(bounds);
          if (sheet.page > 0) drawManualArt(ctx, 'corner-left', corners.previous.x + 2, corners.previous.y + 2, 9, 9);
          if (sheet.page < sheet.count - 1) drawManualArt(ctx, 'corner-right', corners.next.x + 2, corners.next.y + 2, 9, 9);
        }
      }
    }
  } else {
    write(p.letter, 11, 10);
    dateAndReference();
    write(correspondenceSender(paper, locale), 11, 32, muted);
    if (paper.kind === 'letter') write(t.patientNames[paper.patientId]!, 11, 46);
    const letter = paper.kind === 'directive' ? t.progression.directives[paper.rule] : letterContent(paper, locale);
    write(letter.subject, 11, paper.kind === 'directive' ? 46 : 57, '#78503a');
    const lines = wrapDocumentLines([letter.body], w - 22);
    lines.forEach((line, index) => write(line, 11, (paper.kind === 'directive' ? 59 : 68) + index * 8));
    write(letter.role, 11, 113, muted);
    write(letter.signature, 11, 122, HANDWRITING_INK);
    drawDocumentSignature(ctx, x + 79, y + 130, 49, 10);
    drawSeal(x + w - (seal === 'zus' ? 49 : 38), y + 115, 22);
  }
  if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
}

/** Original illustrated forms provide the paper, frames and security ornament. */
function drawInspectionPaper(ctx: CanvasRenderingContext2D, paper: Extract<Paper, { kind: 'inspection-id' | 'inspection-fine' }>, bounds: Rect, locale: Locale): void {
  const { x, y, w, h } = bounds, t = translations[locale], q = t.inspection;
  const full = w >= 188;
  if (paper.kind === 'inspection-id') {
    const { h: height, y: top } = visiblePaperRect(paper, bounds);
    drawInspectionForm(ctx, 'id', x, top, w, height);
    drawInspector(ctx, paper.inspectorId, x + Math.round(w * 12 / 188), top + Math.round(height * 28 / 112), Math.round(w * 42 / 188), Math.round(height * 43 / 112));
    if (full) {
      drawDocumentText(ctx, wrapDocumentLines([q.identity], w - 78).join('\n'), x + 65, top + 15, { color: DOCUMENT_INK });
      drawDocumentText(ctx, q.names[paper.inspectorId]!, x + 65, top + 40, { color: HANDWRITING_INK });
      const rows = [q.role, `${q.number}: K/${41 + paper.inspectorId}`, q.authority];
      drawDocumentText(ctx, wrapDocumentLines(rows, w - 78).join('\n'), x + 65, top + 52, { color: DOCUMENT_INK });
      drawDocumentText(ctx, q.validity, x + 65, top + height - 20, { color: '#615a41' });
    }
    return;
  }
  drawInspectionForm(ctx, 'fine', x, y, w, h);
  if (!full) return;
  const write = (value: string, dx: number, dy: number, color = DOCUMENT_INK): void => drawDocumentText(ctx, value, x + dx, y + dy, { color });
  write(q.fineTitle, 12, 15, ALERT_INK);
  drawDocumentText(ctx, `${t.paperwork.zus} / ${paper.id}`, x + w - 12, y + 15, { color: '#79664b', align: 'right' });
  write(q.fineSubtitle, 12, 25);
  write(`${t.paperwork.date}: ${formatGameDate(paper.day, locale)}`, 12, 34);
  write(`${q.visit}: ${formatGameDate(paper.targetDay, locale)}`, 12, 44);
  write(t.patientNames[paper.patientId]!, 12, 55, HANDWRITING_INK);
  const reason = paper.amount === 200 ? q.absentReason : q.partialReason;
  write(wrapDocumentLines([reason], w - 24).join('\n'), 12, 67);
  write(`${q.amount}: ${paper.amount} ${t.home.currency}`, 12, 91, ALERT_INK);
  write(q.names[paper.inspectorId]!, 12, 108, HANDWRITING_INK);
  drawDocumentSignature(ctx, x + w - 66, y + 104, 49, 10);
  write(q.settlement, 12, 117, '#79664b');
}

/** Certificate art depends only on the supplied appointment, day and language. */
export function drawCertificate(ctx: CanvasRenderingContext2D, state: GameState, bounds: Rect, locale: Locale, lifted: boolean, clipped = false): void {
  const visit = state.visit;
  if (!visit?.certificateTaken) return;
  const { x, y, w, h } = bounds, t = translations[locale], p = t.paperwork;
  fill(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#293126');
  drawStationery(ctx, 'certificate', x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color, face: color === HANDWRITING_INK ? 'handwritten' : dy === 9 ? 'book' : 'typewriter' });
  if (w < 188) {
    fill(ctx, x + 7, y + 10, w - 14, 1, '#9e9876');
    fill(ctx, x + 7, y + 15, w - 22, 1, '#b0a780');
    for (let row = 0; row < 4; row++) fill(ctx, x + 7, y + 25 + row * 5, w - 15 - row % 3 * 5, 1, '#b0a780');
    if (visit.decision) drawDecisionImprint(ctx, visit.decision, locale, x + 8, y + h - 25, w - 16, 12);
    write(String(visit.patientId + 1).padStart(2, '0'), 7, h - 12, '#82785a');
  } else {
    write(t.documentTitleLabel, 12, 9);
    drawDocumentText(ctx, `${p.reference} ${state.day}/${state.shiftCompleted + 1}`, x + w - 12, y + 9, { color: muted, align: 'right' });
    write(p.occupational, 12, 20, muted);
    write(`${p.date}: ${formatGameDate(state.day, locale)}`, 12, 30, muted);
    write(p.name, 12, 45, muted);
    if (visit.certificateNamed) write(t.patientNames[visit.patientId]!, 12, 56, HANDWRITING_INK);
    else for (let dx = 12; dx < 150; dx += 4) fill(ctx, x + dx, y + 63, 2, 1, '#b3a984');
    write(`${p.position}:`, 12, 69, muted);
    const positionX = 12 + measureDocumentText(`${p.position}: `);
    if (visit.certificateNamed) write(t.patientJobs[visit.patientId]!, positionX, 69, HANDWRITING_INK);
    else for (let dx = positionX; dx < w - 12; dx += 4) fill(ctx, x + dx, y + 76, 2, 1, '#b3a984');
    write(p.certificatePurpose, 12, 81, muted);
    write(p.decisionHeading, 12, 94, muted);
    if (visit.decision) {
      drawDecisionImprint(ctx, visit.decision, locale, x + 12, y + 105, 116, 32);
      drawDocumentSignature(ctx, x + 133, y + 107, 38, 11);
    } else for (let dx = 14; dx < 129; dx += 4) fill(ctx, x + dx, y + 133, 2, 1, '#b3a984');
    if (!lifted) drawActionCorner(ctx, bounds, true);
  }
  if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
}
