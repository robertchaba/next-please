import { translations, type Locale } from '../i18n';
import { drawDocumentText, drawDocumentHeading } from './font';
import { drawDocumentSeal, drawInkImpression } from './clinic';
import { wrapFormText, type DocumentInstitution } from './document-copy';

export function institutionInk(institution: DocumentInstitution): string {
  return institution === 'lot' || institution === 'militia' || institution === 'zus' ? '#284b6a'
    : institution === 'chamber' ? '#81473d' : '#343b30';
}

/** A letterhead uses a short institutional mark or the actual employer's name. */
export function drawLetterhead(ctx: CanvasRenderingContext2D, institution: DocumentInstitution,
  masthead: string, subheading: string, x: number, y: number): void {
  const color = institutionInk(institution);
  if (institution === 'lot' || institution === 'zus') {
    drawDocumentHeading(ctx, masthead, x, y, { face: 'sans', scale: 2, color });
    wrapFormText(subheading, 72).forEach((line, index) => drawDocumentText(ctx, line, x + 39, y + 3 + index * 8, { face: 'print', color }));
  } else if (institution === 'employer') {
    wrapFormText(masthead.toUpperCase(), 104).forEach((line, index) => drawDocumentText(ctx, line, x, y + 2 + index * 8, { face: 'typewriter', color }));
  } else {
    drawDocumentHeading(ctx, masthead, x, y, { face: 'sans', color });
    drawDocumentText(ctx, subheading, x, y + 12, { face: 'print', color });
  }
}

/** Generated dry-ink impressions carry readable localized lettering, not tiny emblems. */
export function drawAdministrativeStamp(ctx: CanvasRenderingContext2D, institution: DocumentInstitution,
  locale: Locale, x: number, y: number, compact = false): void {
  const labels = translations[locale].documentDesign.seal[institution];
  const color = institution === 'employer' ? '#62507a' : institutionInk(institution);
  if (compact) {
    if (institution === 'employer' || institution === 'militia' || institution === 'lot') {
      drawInkImpression(ctx, institution, x, y, 24, 11);
    } else drawDocumentSeal(ctx, x + 7, y, 11, institution, locale);
    return;
  }
  if (institution === 'employer') {
    drawInkImpression(ctx, institution, x, y, 62, 24);
    drawDocumentHeading(ctx, labels[0], x + 31, y + 3, { face: 'sans', align: 'center', color });
    drawDocumentText(ctx, labels[1], x + 31, y + 14, { face: 'typewriter', align: 'center', color });
  } else if (institution === 'militia') {
    drawInkImpression(ctx, institution, x + 6, y, 50, 24);
    drawDocumentText(ctx, labels.join('\n'), x + 31, y + 5, { face: 'typewriter', align: 'center', color });
  } else if (institution === 'lot') {
    drawInkImpression(ctx, institution, x, y, 62, 24);
    drawDocumentHeading(ctx, labels[0], x + 40, y + 2, { face: 'sans', align: 'center', color });
    drawDocumentText(ctx, labels[1], x + 40, y + 14, { face: 'typewriter', align: 'center', color });
  } else if (institution === 'zus') {
    drawDocumentSeal(ctx, x + 13, y, 24, 'zus', locale);
  } else {
    drawDocumentSeal(ctx, x, y + 1, 22, institution, locale);
    drawDocumentText(ctx, labels.join('\n'), x + 42, y + 5, { face: 'print', align: 'center', color });
  }
}
