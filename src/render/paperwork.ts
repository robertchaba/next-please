import { PATIENTS, type Paper } from '../core/game';
import type { Rect } from '../core/desk';
import { translations, type Locale } from '../i18n';
import { drawPaper, drawPaperclip } from './clinic';
import { drawDocumentText, measureDocumentText } from './font';

export const DOCUMENT_INK = '#333b2b';
export const HANDWRITING_INK = '#385b78';
const ink = DOCUMENT_INK, muted = '#79785c';

export function referralLines(patientId: number, locale: Locale): string[] {
  const t = translations[locale], p = t.paperwork, patient = PATIENTS[patientId]!;
  const referral = t.patientReferrals[patientId]!;
  return [
    `${p.employer}: ${referral.employer}`,
    `${p.name}: ${t.patientNames[patientId]}`,
    `${p.birthShort}: ${patient.birthDate}   ${p.sex}: ${p[patient.sex]}`,
    `${p.examination}: ${p[patient.examination]}`,
    `${p.position}: ${t.patientJobs[patientId]}`,
    `${p.managerial}: ${patient.managerial ? p.yes : p.no}`,
    `${p.work}: ${referral.work}`,
    `${p.hazards}: ${referral.hazards}`,
  ];
}

export function paperDescription(paper: Paper, locale: Locale, clipped = false): string {
  const t = translations[locale], p = t.paperwork;
  const name = paper.patientId === null ? '' : t.patientNames[paper.patientId];
  let text: string;
  if (paper.kind === 'referral') text = `${p.referral}. ${p.occupational}. ${referralLines(paper.patientId, locale).join('. ')}.`;
  else if (paper.kind === 'letter') {
    const sender = paper.sender === 'zus' ? p.zus : t.patientReferrals[paper.patientId]!.employer;
    text = `${paper.opened ? p.letter : p.envelope}. ${p.sender}: ${sender}.`;
    if (paper.opened) text += ` ${name}. ${(paper.sender === 'zus' ? p.zusBody : p.employerBody).join(' ')}`;
  } else {
    const r = paper.results;
    text = paper.patientId === null ? p.blank : `${p.note}. ${name}. ${t.documentVision}: ${r.vision ? t[r.vision] : t.untested}. ${t.documentPressure}: ${r.pressure ? t[r.pressure] : t.untested}. ${p.weight}: ${r.weight === null ? t.untested : `${r.weight} ${p.kg}`}. ${p.height}: ${r.height === null ? t.untested : `${r.height} ${p.cm}`}.`;
  }
  if (paper.kind === 'note' && paper.additionalWritten && paper.patientId !== null) text += ` ${p.additionalHeading}: ${t.patientNotes[paper.patientId]!.join(' ')}`;
  if (clipped) text += ` ${p.clipped}.`;
  if (paper.location === 'drawer') text += ` ${p.stored}.`;
  return text;
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

export function drawPaperwork(ctx: CanvasRenderingContext2D, paper: Paper, bounds: Rect, locale: Locale, lifted: boolean, clipped = false): void {
  const { x, y, w, h } = bounds, t = translations[locale], p = t.paperwork;
  const full = w >= 188;
  fill(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#20271fc0');
  drawPaper(ctx, x, y, w, h);
  const write = (value: string, dx: number, dy: number, color = ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color });
  if (paper.kind === 'letter' && !paper.opened) {
    fill(ctx, x + 2, y + 2, w - 4, h - 4, '#c3b68f');
    fill(ctx, x + 3, y + 3, w - 6, 1, '#e1d3a8');
    for (let dx = 0; dx < w - 8; dx++) {
      const depth = Math.floor(Math.min(dx, w - 9 - dx) * Math.min(0.45, h / w));
      fill(ctx, x + 4 + dx, y + 5 + depth, 1, 1, '#8e8060');
    }
    if (full) {
      write(paper.sender === 'zus' ? p.zus : t.patientReferrals[paper.patientId]!.employer, 12, 66);
      write(p.recipient, 12, 84, '#625e46');
      drawActionCorner(ctx, bounds, false);
    }
  } else if (!full) {
    if (paper.kind !== 'note' || paper.patientId !== null) {
      fill(ctx, x + 7, y + 10, w - 14, 1, muted);
      for (let row = 0; row < 6; row++) fill(ctx, x + 7, y + 20 + row * 5, w - 15 - row % 3 * 4, 1, '#b0a780');
    }
  } else if (paper.kind === 'referral') {
    write(p.referral, 11, 10);
    write(p.occupational, 11, 20, muted);
    drawDocumentText(ctx, `${p.reference} ${paper.id}`, x + w - 12, y + 20, { color: muted, align: 'right' });
    fill(ctx, x + 11, y + 31, w - 22, 1, '#b0a47e');
    const lines = wrapDocumentLines(referralLines(paper.patientId, locale), w - 22);
    lines.forEach((line, index) => write(line, 11, 39 + index * 8));
  } else if (paper.kind === 'note') {
    if (paper.patientId !== null) {
      write(p.note, 11, 10);
      write(p.occupational, 11, 20, muted);
      drawDocumentText(ctx, `${p.reference} ${paper.id}`, x + w - 12, y + 20, { color: muted, align: 'right' });
      write(t.patientNames[paper.patientId]!, 11, 34, HANDWRITING_INK);
      fill(ctx, x + 11, y + 46, w - 22, 1, '#b0a47e');
      write(p.resultsHeading, 11, 51, muted);
      const r = paper.results;
      const rows = [
        [t.documentVision, r.vision === null ? t.documentPending : t[r.vision]],
        [t.documentPressure, r.pressure === null ? t.documentPending : t[r.pressure]],
      ];
      rows.forEach(([label, value], index) => { write(`${label}:`, 11, 63 + index * 12); write(value!, 91, 63 + index * 12, HANDWRITING_INK); });
      write(`${p.weight}:`, 11, 87);
      write(r.weight === null ? t.documentPending : `${r.weight} ${p.kg}`, 45, 87, HANDWRITING_INK);
      write(`${p.height}:`, 91, 87);
      write(r.height === null ? t.documentPending : `${r.height} ${p.cm}`, 131, 87, HANDWRITING_INK);
      write(p.additionalHeading, 11, 102, muted);
      if (paper.additionalWritten) t.patientNotes[paper.patientId]!.forEach((line, index) => write(line, 11, 114 + index * 9, HANDWRITING_INK));
    }
    if (!lifted) drawActionCorner(ctx, bounds, true);
  } else {
    write(p.letter, 11, 10);
    write(paper.sender === 'zus' ? p.zus : t.patientReferrals[paper.patientId]!.employer, 11, 24, muted);
    fill(ctx, x + 11, y + 36, w - 22, 1, '#b0a47e');
    write(t.patientNames[paper.patientId]!, 11, 44);
    write(paper.sender === 'zus' ? p.zusSubject : p.employerSubject, 11, 56, '#78503a');
    const lines = wrapDocumentLines(paper.sender === 'zus' ? p.zusBody : p.employerBody, w - 22);
    lines.forEach((line, index) => write(line, 11, 72 + index * 8));
  }
  if (clipped) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
}
