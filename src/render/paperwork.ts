import { PATIENTS, type GameState, type Paper } from '../core/game';
import { generalFindingIndex, patientAge, veryHighPressure, type PressureValues, type VisionValues } from '../core/patients';
import type { Rect } from '../core/desk';
import { formatGameDate, gameDate } from '../core/calendar';
import { translations, type Locale } from '../i18n';
import { drawPaper, drawPaperclip, drawDecisionImprint, drawDocumentSeal, drawDocumentSignature } from './clinic';
import { drawDocumentText, measureDocumentText } from './font';

export const DOCUMENT_INK = '#333b2b';
export const HANDWRITING_INK = '#385b78';
export const ALERT_INK = '#a33128';
const ink = DOCUMENT_INK, muted = '#79785c';

/** Stable archived correspondence: reading, language changes and imports never reroll it. */
export function letterContent(paper: Extract<Paper, { kind: 'letter' }>, locale: Locale) {
  const variants = translations[locale].paperwork.letters[paper.sender];
  return variants[((paper.day - 1) * 7 + paper.patientId * 5 + paper.id) % variants.length]!;
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
  const t = translations[locale], finding = generalFindingIndex(PATIENTS[patientId]!);
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
  for (const examination of paper.examinationOrder) {
    if (examination === 'general' && r.general !== null) rows.push({ text: `${t.generalResult}: ${r.general === 'pass' ? t.generalClear : generalReading(paper.patientId, locale)}`, color: HANDWRITING_INK });
    if (examination === 'vision' && r.vision !== null) rows.push({ text: `${t.documentVision}: ${visionReading(r.vision, locale)}`, color: HANDWRITING_INK });
    if (examination === 'pressure') for (const reading of r.pressureReadings) rows.push({ text: `${t.documentPressure}: ${pressureReading(reading)}`, color: veryHighPressure(reading) ? ALERT_INK : HANDWRITING_INK });
    if (examination === 'measurements' && r.weight !== null && r.height !== null) rows.push({ text: `${p.weight} ${r.weight} ${p.kg}   ${p.height} ${r.height} ${p.cm}`, color: HANDWRITING_INK });
  }
  if (paper.additionalWritten && r.general !== null) for (const text of t.patientNotes[paper.patientId]!) rows.push({ text, color: HANDWRITING_INK });
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

export function paperDescription(paper: Paper, locale: Locale, clipped = false): string {
  const t = translations[locale], p = t.paperwork;
  const name = paper.patientId === null ? '' : t.patientNames[paper.patientId];
  let text: string;
  if (paper.kind === 'referral') text = `${p.referral}. ${p.occupational}. ${referralLines(paper.patientId, locale).join('. ')}. ${p.employerSeal}. ${p.signed}.`;
  else if (paper.kind === 'letter') {
    const sender = paper.sender === 'zus' ? p.zus : t.patientReferrals[paper.patientId]!.employer;
    text = `${paper.opened ? p.letter : p.envelope}. ${p.sender}: ${sender}.`;
    text += ` ${paper.sender === 'zus' ? p.zusSeal : p.employerSeal}.`;
    if (paper.opened) {
      const letter = letterContent(paper, locale);
      text += ` ${name}. ${letter.subject}. ${letter.body} ${letter.role}: ${letter.signature}. ${p.signed}.`;
    }
  } else {
    text = paper.patientId === null ? p.blank : [p.note, noteIdentity(paper, locale),
      ...noteEntries(paper, locale).map(row => row.text.replace(/\.$/, ''))].join('. ') + '.';
    if (paper.results.pressureReadings.some(veryHighPressure)) text += ` ${t.documentPressure}: ${t.veryHigh}.`;
  }
  if (paper.kind !== 'note') text += ` ${p.issued}: ${formatGameDate(paper.day, locale)}. ${p.reference}: ${paper.id}.`;
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

export function drawPaperwork(ctx: CanvasRenderingContext2D, paper: Paper, bounds: Rect, locale: Locale, lifted: boolean, clipped = false, showActions = true): void {
  const { x, y, w, h } = bounds, t = translations[locale], p = t.paperwork;
  const full = w >= 188;
  const seal = paper.kind === 'letter' ? paper.sender : paper.kind === 'referral' ? 'employer' : 'clinic';
  fill(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#20271fc0');
  drawPaper(ctx, x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color });
  const dateAndReference = (): void => {
    write(`${p.date}: ${formatGameDate(paper.day, locale)}`, 11, 20, muted);
    drawDocumentText(ctx, `${p.reference} ${paper.id}`, x + w - 12, y + 20, { color: muted, align: 'right' });
  };
  const authentication = (): void => {
    drawDocumentSignature(ctx, x + 16, y + 120, 49, 10);
    drawDocumentSeal(ctx, x + w - (seal === 'zus' ? 49 : 38), y + 115, 22, seal);
  };
  if (paper.kind === 'letter' && !paper.opened) {
    fill(ctx, x + 2, y + 2, w - 4, h - 4, '#c3b68f');
    fill(ctx, x + 3, y + 3, w - 6, 1, '#e1d3a8');
    for (let dx = 0; dx < w - 8; dx++) {
      const depth = Math.floor(Math.min(dx, w - 9 - dx) * Math.min(0.45, h / w));
      fill(ctx, x + 4 + dx, y + 5 + depth, 1, 1, '#8e8060');
    }
    if (full) {
      drawDocumentSeal(ctx, x + w - (seal === 'zus' ? 48 : 42), y + 15, 24, seal);
      write(formatGameDate(paper.day, locale), 12, 50, muted);
      write(paper.sender === 'zus' ? p.zus : t.patientReferrals[paper.patientId]!.employer, 12, 66);
      write(p.recipient, 12, 84, '#625e46');
      if (showActions) drawActionCorner(ctx, bounds, false);
    } else drawDocumentSeal(ctx, x + w - (seal === 'zus' ? 26 : 20), y + h - 23, 12, seal);
  } else if (!full) {
    if (paper.kind !== 'note' || paper.patientId !== null) {
      fill(ctx, x + 7, y + 10, w - 14, 1, muted);
      for (let row = 0; row < 6; row++) fill(ctx, x + 7, y + 20 + row * 5, w - 15 - row % 3 * 4, 1, '#b0a780');
      drawDocumentSeal(ctx, x + w - (seal === 'zus' ? 26 : 20), y + h - 23, 12, seal);
    }
  } else if (paper.kind === 'referral') {
    write(p.referral, 11, 10);
    dateAndReference();
    fill(ctx, x + 11, y + 29, w - 22, 1, '#b0a47e');
    const lines = wrapDocumentLines(referralLines(paper.patientId, locale), w - 22);
    lines.forEach((line, index) => write(line, 11, 33 + index * 8));
    authentication();
  } else if (paper.kind === 'note') {
    if (paper.patientId !== null) {
      write(noteIdentity(paper, locale), 11, 12, HANDWRITING_INK);
      let rowY = 24;
      for (const entry of noteEntries(paper, locale)) {
        for (const line of wrapDocumentLines([entry.text], w - 22)) {
          write(line, 11, rowY, entry.color);
          rowY += 9;
        }
      }
    }
    if (!lifted && showActions) drawActionCorner(ctx, bounds, true);
  } else {
    write(p.letter, 11, 10);
    dateAndReference();
    write(paper.sender === 'zus' ? p.zus : t.patientReferrals[paper.patientId]!.employer, 11, 32, muted);
    fill(ctx, x + 11, y + 42, w - 22, 1, '#b0a47e');
    write(t.patientNames[paper.patientId]!, 11, 46);
    const letter = letterContent(paper, locale);
    write(letter.subject, 11, 57, '#78503a');
    const lines = wrapDocumentLines([letter.body], w - 22);
    lines.forEach((line, index) => write(line, 11, 68 + index * 8));
    write(letter.role, 11, 113, muted);
    write(letter.signature, 11, 122, HANDWRITING_INK);
    drawDocumentSignature(ctx, x + 79, y + 130, 49, 10);
    drawDocumentSeal(ctx, x + w - (seal === 'zus' ? 49 : 38), y + 115, 22, seal);
  }
  if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
}

/** Certificate art depends only on the supplied appointment, day and language. */
export function drawCertificate(ctx: CanvasRenderingContext2D, state: GameState, bounds: Rect, locale: Locale, lifted: boolean, clipped = false): void {
  const visit = state.visit;
  if (!visit?.certificateTaken) return;
  const { x, y, w, h } = bounds, t = translations[locale], p = t.paperwork;
  fill(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#293126');
  drawPaper(ctx, x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color });
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
    fill(ctx, x + 12, y + 40, w - 24, 1, '#a59e79');
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
