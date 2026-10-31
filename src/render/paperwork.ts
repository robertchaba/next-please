import { storyPatientForId } from '../core/story-patients';
import { storyPaperLayout } from './story-paper';
import { PATIENTS, type GameState, type Paper } from '../core/game';
import { ADDITIONAL_TESTS, additionalAssessment, additionalNoteResult, additionalTestForJob, type AdditionalTest } from '../core/additional-tests';
import { referralDate, workDayNumber, effectivePatient } from '../core/progression';
import { generalFindingIndex, patientAge, veryHighPressure, type PressureValues, type VisionValues } from '../core/patients';
import { CLINICAL_PAPER_SIZE, paperDesktopSize, type DeskItemId, type Rect } from '../core/desk';
import { formatGameDate, gameDate } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import { drawPaper, drawPaperclip, drawDecisionImprint, drawDocumentSignature, drawUnclearSeal, drawInspectionForm, drawInspector, drawStationery } from './clinic';
import { drawDocumentText, drawDocumentHeading, measureDocumentText, drawReadingText, measureReadingText, READ_LINE_HEIGHT } from './font';
import { referralCopy, correspondenceCopy, employerInstitution, specialistIssuer, wrapReadingText, fieldLabelWidth, REFERRAL_BODY_Y, REFERRAL_LINE_HEIGHT } from './document-copy';
import { drawAdministrativeStamp, drawLetterhead, institutionInk } from './document-style';
import { drawManualArt } from './clinic';
import { paginateNoteEntries, notePageControls, notePageLabel, NOTE_LINE_HEIGHT } from './note-pages';
import { drawStoryPaper, storyPaperDescription } from './story-paper';
import { storyPhoneNoteKey, type NarrativeState, type StoryContactId } from '../core/story';

export const DOCUMENT_INK = '#333b2b';
export const HANDWRITING_INK = '#385b78';
export const ALERT_INK = '#a33128';
const ink = DOCUMENT_INK, muted = '#79785c';

/** Employer identity selects artwork, independently of medical findings and locale. */
export function employerStationery(patientId: number): 'referral' | 'militia' | 'lot' {
  const institution = employerInstitution(patientId);
  return institution === 'employer' ? 'referral' : institution;
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
    if (entry.startsWith('story-call:')) {
      const encounter = storyPatientForId(paper.patientId)?.encounterId;
      const conclusion = encounter && storyPhoneNoteKey(entry.slice('story-call:'.length) as StoryContactId, encounter);
      if (conclusion) rows.push({ text: t.story.phoneNotes[conclusion], color: HANDWRITING_INK });
    }
    const additional = additionalNoteResult(entry);
    if (additional) rows.push({ text: `${t.additionalTests.tests[additional.test]}: ${t.additionalTests.notes[additional.test][additionalAssessment(PATIENTS[paper.patientId]!, additional)]}`, color: HANDWRITING_INK });
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
  return { x: bounds.x + 11, y: bounds.y + 72 + ADDITIONAL_TESTS.indexOf(test) * 17, w: bounds.w - 22, h: 16 };
}

export function additionalResultText(paper: Extract<Paper, { kind: 'additional-result' }>, locale: Locale): string {
  const scripted = storyPatientForId(paper.patientId);
  if (scripted?.actorId === 'printer' && paper.test === 'audiometry') return translations[locale].story.documents[scripted.encounterId === 'C2' ? 'C-AUDIO-CONTROL' : 'C-AUDIO'].body;
  return translations[locale].additionalTests.report[paper.test][additionalAssessment(PATIENTS[paper.patientId]!, paper)];
}

export function paperPhoneRect(bounds: Rect): Rect {
  return { x: bounds.x + 9, y: bounds.y + bounds.h - 16, w: 105, h: 13 };
}

export function paperDescription(paper: Paper, locale: Locale, clipped = false, story?: NarrativeState): string {
  const t = translations[locale], p = t.paperwork, q = t.progression;
  const name = paper.patientId === null ? '' : t.patientNames[paper.patientId];
  let text: string;
  if (paper.kind === 'story-document') {
    text = storyPaperDescription(paper, locale, story);
  } else if (paper.kind === 'inspection-id') {
    text = `${t.inspection.identity}. ${t.inspection.names[paper.inspectorId]}. ${t.inspection.role}. ${t.inspection.number}: K/${41 + paper.inspectorId}. ${t.inspection.validity}`;
  } else if (paper.kind === 'inspection-fine') {
    const q = t.inspection;
    text = `${q.fineTitle}. ${q.addressee}. ${name}. ${q.visit}: ${formatGameDate(paper.targetDay, locale)}. ${paper.amount === 200 ? q.absentReason : q.partialReason} ${q.amount}: ${paper.amount} ${t.home.currency}. ${q.inspectorSignature}: ${q.names[paper.inspectorId]}. ${q.settlement}`;
  } else if (paper.kind === 'referral') {
    text = `${p.referral}. ${p.occupational}. ${referralLines(paper.patientId, locale).join('. ')}. ${q.seal[paper.details.seal]}. ${p.signed}.`;
    const copy = referralCopy(paper.patientId, locale);
    text += ` ${copy.masthead}. ${copy.instruction}`;
    if (paper.details.seal === 'clear') text += ` ${t.documentDesign.seal[copy.institution].join(' ')}.`;
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
    text = `${q.specialistTitle}. ${q.specialist}: ${specialistIssuer(paper.certificate, locale)}. ${name}. ${q.treatment} ${q.clearance} ${p.position}: ${specialistJob(paper, locale)}. ${q.phone} ${paper.certificate.phone}. ${q.chamber}. ${p.signed}.`;
  } else if (paper.kind === 'letter' || paper.kind === 'directive') {
    const sender = correspondenceSender(paper, locale);
    const copy = correspondenceCopy(paper, locale);
    text = `${paper.opened ? p.letter : p.envelope}. ${p.sender}: ${sender}.`;
    text += ` ${t.documentDesign.seal[copy.institution].join(' ')}.`;
    if (paper.sender === 'zus') text += ` ${p.zusSeal}.`;
    else if (paper.sender === 'chamber') text += ` ${q.chamber}.`;
    else if (copy.institution === 'employer') text += ` ${p.employerSeal}.`;
    if (paper.opened) {
      const letter = paper.kind === 'directive' ? q.directives[paper.rule] : letterContent(paper, locale);
      text += ` ${copy.title}. ${copy.recipient}.${name ? ` ${name}.` : ''} ${letter.subject}. ${letter.body} ${letter.role}: ${letter.signature}. ${p.signed}.`;
    }
  } else {
    text = paper.patientId === null ? p.blank : [p.note, noteIdentity(paper, locale),
      ...noteEntries(paper, locale).map(row => row.text.replace(/\.$/, ''))].join('. ') + '.';
    if (paper.results.pressureReadings.some(veryHighPressure)) text += ` ${t.documentPressure}: ${t.veryHigh}.`;
  }
  if (paper.kind !== 'note') text += ` ${p.issued}: ${paper.kind === 'referral' ? referralIssueDate(paper, locale) : formatGameDate(paper.day, locale)}. ${p.reference}: ${paper.id}.`;
  if (clipped) text += ` ${p.clipped}.`;
  if (paper.location !== 'desk') text += ` ${translations[locale].drawerNames[paper.location]}.`;
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

/** Forgiving joining target; empty-handed unclipping keeps the illustrated bounds. */
export function paperClipTargetRect(bounds: Rect, held: DeskItemId | null): Rect {
  const clip = paperClipRect(bounds);
  const joining = held === 'document' || held === 'incoming-referral' || held?.startsWith('paper-');
  const margin = joining ? 12 : 0;
  return { x: clip.x - margin, y: clip.y - margin, w: clip.w + margin * 2, h: clip.h + margin * 2 };
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

/** Longer authored jobs retain every duty and clue across normal-size clinical sheets. */
export function paperPagination(paper: Paper, locale: Locale, page = 0, story?: NarrativeState) {
  if (paper.kind === 'note') return paginateNoteEntries(noteEntries(paper, locale), CLINICAL_PAPER_SIZE.w - 22, page);
  if (paper.kind === 'story-document' && paper.opened) return storyPaperLayout(paper, locale, page, 200, story);
  if ((paper.kind !== 'referral' && paper.kind !== 'additional-result') || !storyPatientForId(paper.patientId)) return undefined;
  const t = translations[locale], p = t.paperwork;
  const entries = paper.kind === 'referral'
    ? [p.referral, ...referralLines(paper.patientId, locale), `${p.issued}: ${referralIssueDate(paper, locale)}`, `${p.reference}: ${paper.id}`, p.signed]
    : [t.additionalTests.resultTitle, t.patientNames[paper.patientId]!, t.patientJobs[paper.patientId]!, t.additionalTests.tests[paper.test], additionalResultText(paper, locale),
      `${p.issued}: ${formatGameDate(paper.day, locale)}`, p.signed];
  const lines = wrapDocumentLines(entries, CLINICAL_PAPER_SIZE.w - 22).map(text => ({ text, color: DOCUMENT_INK }));
  const count = Math.max(1, Math.ceil(lines.length / 14)), current = Math.max(0, Math.min(count - 1, page));
  return { lines: lines.slice(current * 14, (current + 1) * 14), count, page: current };
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

export function drawPaperwork(ctx: CanvasRenderingContext2D, paper: Paper, bounds: Rect, locale: Locale, lifted: boolean, clipped = false, showActions = true, page = 0, story?: NarrativeState): void {
  const { x, y, w, h } = bounds, t = translations[locale], p = t.paperwork;
  if (paper.kind === 'story-document') {
    drawStoryPaper(ctx, paper, bounds, locale, page, showActions && !lifted, story);
    if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y, lifted); }
    return;
  }
  if (paper.kind === 'inspection-id' || paper.kind === 'inspection-fine') {
    drawInspectionPaper(ctx, paper, bounds, locale);
    if (clipped) { const clip = paperClipRect(visiblePaperRect(paper, bounds)); drawPaperclip(ctx, clip.x, clip.y, lifted); }
    return;
  }
  const clinicalPages = (paper.kind === 'referral' || paper.kind === 'additional-result') && storyPatientForId(paper.patientId)
    ? paperPagination(paper, locale, page, story) : undefined;
  if (clinicalPages && w >= CLINICAL_PAPER_SIZE.w) {
    drawPaper(ctx, x, y, w, h);
    clinicalPages.lines.forEach((line, index) => drawDocumentText(ctx, line.text, x + 11, y + 10 + index * 8, { color: line.color }));
    const phone = paper.kind === 'referral' && workDayNumber(paper.day) >= 5 ? `${t.progression.phone} ${paper.details.phone}` : '';
    if (phone) drawDocumentText(ctx, phone, x + 11, y + h - 26, { color: HANDWRITING_INK });
    drawDocumentSignature(ctx, x + w - 60, y + h - 27, 40, 10);
    drawAdministrativeStamp(ctx, paper.kind === 'referral' ? employerInstitution(paper.patientId!) : 'chamber', locale, x + w - 42, y + h - 46, true);
    drawDocumentText(ctx, `${clinicalPages.page + 1}/${clinicalPages.count}`, x + Math.floor(w / 2), y + h - 12, { color: muted, align: 'center' });
    if (!lifted && showActions) {
      const corners = notePageControls(bounds);
      if (clinicalPages.page > 0) drawManualArt(ctx, 'corner-left', corners.previous.x + 2, corners.previous.y + 2, 9, 9);
      if (clinicalPages.page < clinicalPages.count - 1) drawManualArt(ctx, 'corner-right', corners.next.x + 2, corners.next.y + 2, 9, 9);
    }
    if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y, lifted); }
    return;
  }
  const full = w >= paperDesktopSize(paper.kind).w;
  const employer = paper.patientId === null ? 'referral' : employerStationery(paper.patientId);
  const employerSeal = employer === 'referral' ? 'employer' : employer;
  const seal = paper.kind === 'letter' || paper.kind === 'directive' ? paper.sender === 'employer' ? employerSeal : paper.sender : paper.kind === 'specialist' ? 'chamber' : paper.kind === 'referral' ? employerSeal : 'clinic';
  const sealed = paper.kind !== 'referral' || paper.details.seal !== 'missing';
  const drawSeal = (sx: number, sy: number, size: number): void => {
    if (!sealed) return;
    if (paper.kind === 'referral' && paper.details.seal === 'unclear') drawUnclearSeal(ctx, sx + (size < 20 ? 0 : 16), sy, size);
    else drawAdministrativeStamp(ctx, seal, locale, sx, sy, size < 20);
  };
  const envelope = (paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened;
  if (envelope) drawStationery(ctx, 'envelope', x, y, w, h);
  else drawPaper(ctx, x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color, face: color === HANDWRITING_INK || color === ALERT_INK ? 'handwritten' : dy <= 10 ? 'book' : 'typewriter' });
  const dateAndReference = (): void => {
    drawDocumentText(ctx, paper.kind === 'referral' ? referralIssueDate(paper, locale) : formatGameDate(paper.day, locale), x + w - 12, y + 9, { color: muted, align: 'right', face: 'typewriter' });
    drawDocumentText(ctx, `${p.reference} ${paper.id}`, x + w - 12, y + 19, { color: muted, align: 'right', face: 'print' });
  };
  const authentication = (): void => {
    drawDocumentSignature(ctx, x + 16, y + h - 25, 55, 11);
    drawSeal(x + w - 73, y + h - 29, 24);
  };
  const clinicalHeader = (title: string, specialist = false): void => {
    const d = t.documentDesign;
    const issuer = paper.kind === 'specialist' ? specialistIssuer(paper.certificate, locale) : t.progression.chamber;
    drawLetterhead(ctx, specialist ? 'chamber' : 'clinic', specialist ? t.progression.specialist : d.medicalOffice,
      specialist ? issuer : d.departments.clinic, x + 11, y + 6);
    dateAndReference();
    drawDocumentHeading(ctx, title, x + Math.floor(w / 2), y + 29, { color: ink, face: 'serif', align: 'center' });
  };
  if ((paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened) {
    if (full) {
      drawSeal(x + 35, y + 116, 24);
      write(t.documentDesign.personal, 35, 67, '#74443c');
      wrapReadingText(correspondenceSender(paper, locale), 144).forEach((line, index) => drawReadingText(ctx, line, x + 35, y + 79 + index * READ_LINE_HEIGHT, { color: ink }));
      write(p.recipient, 35, 103);
    } else drawSeal(x + w - 28, y + h - 18, 12);
  } else if (!full) {
    if (paper.kind !== 'note' || paper.patientId !== null) {
      fill(ctx, x + 7, y + 10, w - 14, 1, muted);
      for (let row = 0; row < 6; row++) fill(ctx, x + 7, y + 20 + row * 5, w - 15 - row % 3 * 4, 1, '#b0a780');
      if (paper.kind !== 'note') drawSeal(x + w - 28, y + h - 18, 12);
    }
  } else if (paper.kind === 'referral') {
    const copy = referralCopy(paper.patientId, locale);
    drawLetterhead(ctx, copy.institution, copy.masthead, copy.subheading, x + 11, y + 6);
    dateAndReference();
    drawDocumentHeading(ctx, copy.title, x + Math.floor(w / 2), y + 29, { color: institutionInk(copy.institution), face: 'serif', align: 'center' });
    drawReadingText(ctx, copy.instruction, x + 11, y + 40, { color: ink });
    copy.rows.forEach((row, index) => {
      const rowY = y + REFERRAL_BODY_Y + index * REFERRAL_LINE_HEIGHT;
      drawReadingText(ctx, row.label, x + 11, rowY, { color: '#53563f' });
      drawReadingText(ctx, row.value, x + 11 + fieldLabelWidth(row.label), rowY, { color: ink });
    });
    authentication();
    if (workDayNumber(paper.day) >= 5) drawReadingText(ctx, `${t.progression.phone} ${paper.details.phone}`, x + 11, y + h - 15, { face: 'handwritten', color: HANDWRITING_INK });
  } else if (paper.kind === 'additional-referral') {
    const a = t.additionalTests;
    clinicalHeader(t.documentDesign.referral);
    drawReadingText(ctx, t.patientNames[paper.patientId]!, x + 11, y + 44, { face: 'handwritten', color: HANDWRITING_INK });
    write(`${p.position}: ${t.patientJobs[paper.patientId]}`, 11, 60, HANDWRITING_INK);
    for (const test of ADDITIONAL_TESTS) {
      const row = additionalTestRect(bounds, test);
      drawReadingText(ctx, a.tests[test], row.x + 5, row.y + 2, { color: ink });
      if (paper.test === test) {
        // A state-driven hand-marked oval, rasterized on the native pixel grid.
        const width = measureReadingText(a.tests[test]) + 10, height = 15;
        const rx = width / 2, ry = height / 2;
        for (let dx = 0; dx <= width; dx++) {
          const dy = Math.round(ry * Math.sqrt(Math.max(0, 1 - ((dx - rx) / rx) ** 2)));
          fill(ctx, row.x + dx, row.y + Math.round(ry) - dy, 1, 1, HANDWRITING_INK);
          fill(ctx, row.x + dx, row.y + Math.round(ry) + dy, 1, 1, HANDWRITING_INK);
        }
      }
    }
    write(a.choose, 11, h - 29, muted);
    drawDocumentSignature(ctx, x + 99, y + h - 18, 49, 10);
  } else if (paper.kind === 'additional-result') {
    const a = t.additionalTests;
    clinicalHeader(t.documentDesign.report, true);
    drawReadingText(ctx, t.patientNames[paper.patientId]!, x + 11, y + 44, { color: ink });
    drawReadingText(ctx, a.tests[paper.test], x + 11, y + 59, { color: ink });
    const body = wrapReadingText(additionalResultText(paper, locale), w - 22, 'handwritten');
    const assessment = additionalAssessment(PATIENTS[paper.patientId]!, paper);
    body.forEach((line, index) => drawReadingText(ctx, line, x + 11, y + 73 + index * READ_LINE_HEIGHT, { face: 'handwritten', color: assessment === 'unfit' ? ALERT_INK : HANDWRITING_INK }));
    wrapDocumentLines([a.otherChecks], w - 22).forEach((line, index) => drawDocumentText(ctx, line, x + 11, y + h - 47 + index * 8, { color: muted, face: 'print' }));
    authentication();
  } else if (paper.kind === 'specialist') {
    clinicalHeader(t.documentDesign.specialist, true);
    drawReadingText(ctx, t.patientNames[paper.patientId]!, x + 11, y + 44, { color: ink });
    const body = wrapReadingText(`${t.progression.treatment} ${t.progression.clearance}`, w - 22);
    body.forEach((line, index) => drawReadingText(ctx, line, x + 11, y + 61 + index * READ_LINE_HEIGHT, { color: ink }));
    write(`${p.position}:`, 11, h - 48, muted);
    drawReadingText(ctx, specialistJob(paper, locale), x + 11, y + h - 39, { face: 'handwritten', color: HANDWRITING_INK });
    authentication();
    drawReadingText(ctx, `${t.progression.phone} ${paper.certificate.phone}`, x + 11, y + h - 15, { face: 'handwritten', color: HANDWRITING_INK });
  } else if (paper.kind === 'note') {
    if (paper.patientId !== null) {
      drawReadingText(ctx, noteIdentity(paper, locale), x + 11, y + 12, { color: HANDWRITING_INK, face: 'handwritten' });
      const sheet = paginateNoteEntries(noteEntries(paper, locale), w - 22, page);
      sheet.lines.forEach((line, index) => drawReadingText(ctx, line.text, x + 11, y + 32 + index * NOTE_LINE_HEIGHT, { color: line.color, face: 'handwritten' }));
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
    const copy = correspondenceCopy(paper, locale);
    drawLetterhead(ctx, copy.institution, copy.masthead, copy.department, x + 11, y + 6);
    dateAndReference();
    drawDocumentHeading(ctx, copy.title, x + Math.floor(w / 2), y + 29, { color: institutionInk(copy.institution), face: 'serif', align: 'center' });
    const letter = paper.kind === 'directive' ? t.progression.directives[paper.rule] : letterContent(paper, locale);
    if (paper.kind === 'letter') {
      drawReadingText(ctx, t.patientNames[paper.patientId]!, x + 11, y + 44, { color: ink });
    } else drawReadingText(ctx, copy.recipient, x + 11, y + 44, { color: ink });
    drawDocumentText(ctx, letter.subject, x + 11, y + 58, { color: '#78503a', face: 'book' });
    const lines = wrapReadingText(letter.body, w - 22);
    lines.forEach((line, index) => drawReadingText(ctx, line, x + 11, y + 70 + index * READ_LINE_HEIGHT, { color: ink }));
    write(letter.role, 11, h - 28, muted);
    write(letter.signature, 11, h - 19, HANDWRITING_INK);
    drawDocumentSignature(ctx, x + 60, y + h - 11, 44, 8);
    drawSeal(x + w - 73, y + h - 29, 24);
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
  drawPaper(ctx, x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color, face: color === HANDWRITING_INK ? 'handwritten' : dy === 9 ? 'book' : 'typewriter' });
  if (w < CLINICAL_PAPER_SIZE.w) {
    fill(ctx, x + 7, y + 10, w - 14, 1, '#9e9876');
    fill(ctx, x + 7, y + 15, w - 22, 1, '#b0a780');
    for (let row = 0; row < 4; row++) fill(ctx, x + 7, y + 25 + row * 5, w - 15 - row % 3 * 5, 1, '#b0a780');
    if (visit.decision) drawDecisionImprint(ctx, visit.decision, locale, x + 8, y + h - 25, w - 16, 12);
    write(String(visit.patientId + 1).padStart(2, '0'), 7, h - 12, '#82785a');
  } else {
    const d = t.documentDesign;
    drawDocumentHeading(ctx, d.medicalOffice, x + 8, y + 6, { color: ink });
    write(d.institutions.clinic, 8, 16);
    drawDocumentText(ctx, formatGameDate(state.day, locale), x + w - 8, y + 6, { color: muted, align: 'right', face: 'typewriter' });
    drawDocumentText(ctx, `${p.reference} ${state.day}/${state.shiftCompleted + 1}`, x + w - 8, y + 31, { color: muted, align: 'right' });
    drawDocumentHeading(ctx, d.certificate, x + 8, y + 31, { color: ink, face: 'serif' });
    write(p.name, 8, 46, muted);
    if (visit.certificateNamed) drawReadingText(ctx, t.patientNames[visit.patientId]!, x + 8, y + 56, { face: 'handwritten', color: HANDWRITING_INK });
    else for (let dx = 8; dx < w - 8; dx += 4) fill(ctx, x + dx, y + 63, 2, 1, '#b3a984');
    const jobLabel = `${p.position}:`;
    const jobX = 8 + measureReadingText(jobLabel) + 4;
    write(jobLabel, 8, 73, muted);
    const jobLines = wrapReadingText(`${jobLabel} ${t.patientJobs[visit.patientId]}`, w - 16);
    if (visit.certificateNamed) { drawReadingText(ctx, jobLines.join('\n'), x + 8, y + 73, { face: 'handwritten', color: HANDWRITING_INK }); write(jobLabel, 8, 73, muted); }
    else for (let dx = jobX; dx < w - 8; dx += 4) fill(ctx, x + dx, y + 80, 2, 1, '#b3a984');
    const statement = wrapReadingText(d.certificateStatement, w - 16);
    const statementY = Math.max(92, 73 + jobLines.length * READ_LINE_HEIGHT + 5);
    statement.forEach((line, index) => write(line, 8, statementY + index * READ_LINE_HEIGHT));
    const impressionY = statementY + statement.length * READ_LINE_HEIGHT + 4;
    if (visit.decision) {
      drawDecisionImprint(ctx, visit.decision, locale, x + 8, y + impressionY, 98, 27);
      drawDocumentSignature(ctx, x + 116, y + h - 33, 30, 10);
    } else for (let dx = 8; dx < 106; dx += 4) fill(ctx, x + dx, y + impressionY + 19, 2, 1, '#b3a984');
    if (!lifted) drawActionCorner(ctx, bounds, true);
  }
  if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
}
