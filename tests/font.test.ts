import { describe, expect, it } from 'vitest';
import { drawDocumentText, drawText, measureDocumentText, measureText } from '../src/render/font';
import { translations } from '../src/i18n';
import { mobileDialogueLines, mobileStatusLines } from '../src/render/mobile';

type Pixel = [number, number, number, number];
function pixels(value: string, x = 0, y = 0, draw = drawDocumentText): Pixel[] {
  const marks: Pixel[] = [];
  const context = {
    save() {}, restore() {}, fillStyle: '',
    fillRect(a: number, b: number, w: number, h: number) { marks.push([a, b, w, h]); },
  } as unknown as CanvasRenderingContext2D;
  draw(context, value, x, y);
  return marks;
}

describe('compact original document font', () => {
  it('keeps the mobile dialogue and handwritten note within the generated paper in both languages', () => {
    for (const { mobile } of Object.values(translations)) {
      for (const value of [mobile.greeting, mobile.reply]) {
        const lines = mobileDialogueLines(value);
        expect(lines.join(' ')).toBe(value);
        expect(lines.length).toBeLessThanOrEqual(4);
        for (const line of lines) expect(measureDocumentText(line)).toBeLessThanOrEqual(108);
      }
      expect(measureDocumentText(mobile.title) * 4 + 2).toBeLessThanOrEqual(224);
      for (const line of mobile.noteLines) expect(measureDocumentText(line) * 3 + 2, line).toBeLessThanOrEqual(224);
      expect(mobile.noteLines.length).toBeLessThanOrEqual(7);
      expect(mobile.noteLines.filter(Boolean).join(' ')).toBe(`${mobile.note} ${mobile.noteHelp}`);
    }
  });
  it('fits enlarged mobile sound captions and retains their ellipsis glyph', () => {
    for (const { mobile } of Object.values(translations)) {
      for (const caption of [mobile.tone, mobile.dialing]) {
        const lines = mobileStatusLines(caption).split('\n');
        expect(lines.join(' ')).toBe(caption);
        expect(lines.length).toBeLessThanOrEqual(2);
        for (const line of lines) expect(measureText(line, 3), line).toBeLessThanOrEqual(276);
      }
    }
    const ellipsis = pixels('…', 0, 0, drawText);
    expect(ellipsis).not.toEqual(pixels('?', 0, 0, drawText));
    expect(ellipsis).toHaveLength(3);
    expect(new Set(ellipsis.map(([, y]) => y)).size).toBe(1);
  });
  it('renders every Polish diacritic distinctly within a seven-row cell', () => {
    for (const [accented, plain] of Object.entries({ ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z', Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z' })) {
      const marks = pixels(accented);
      expect(marks).not.toEqual(pixels(plain));
      expect(marks).not.toEqual(pixels('?'));
      expect(marks.every(([x, y, w, h]) => Number.isInteger(x) && Number.isInteger(y) && y >= 0 && y < 7 && w === 1 && h === 1)).toBe(true);
      expect(Math.max(...marks.map(([x]) => x)) + 1).toBeLessThanOrEqual(measureDocumentText(accented));
      expect(pixels(accented.normalize('NFD'))).toEqual(marks);
    }
  });

  it('keeps mixed case, narrow characters, descenders and integer placement', () => {
    expect(pixels('gabinet')).not.toEqual(pixels('GABINET'));
    expect(measureDocumentText('Irena Wolska')).toBeLessThan(measureText('Irena Wolska'));
    expect(measureDocumentText('iii')).toBeLessThan(measureDocumentText('mmm'));
    expect(Math.max(...pixels('gypq').map(([, y]) => y))).toBe(6);
    expect(pixels('Zażółć', 0.4, 0.3).every(mark => mark.every(Number.isInteger))).toBe(true);
  });

  it('leaves separation between accented and descending lines at its smaller size', () => {
    const first = pixels('gęślą');
    const second = pixels('Źdźbło', 0, 8);
    expect(pixels('gęślą\nŹdźbło')).toEqual([...first, ...second]);
    expect(Math.max(...first.map(([, y]) => y))).toBeLessThan(Math.min(...second.map(([, y]) => y)) - 1);
  });

  it('fits both languages into the certificate and referral without squeezing', () => {
    for (const t of Object.values(translations)) {
      for (const value of [...t.patientNames, ...t.patientJobs]) expect(measureDocumentText(value)).toBeLessThanOrEqual(100);
      for (const value of [t.documentVision, t.documentPressure]) expect(measureDocumentText(value)).toBeLessThanOrEqual(78);
      for (const value of [t.pass, t.refer]) expect(measureDocumentText(value)).toBeLessThanOrEqual(82);
      expect(measureDocumentText(t.rulebookLabel)).toBeLessThanOrEqual(64);
      expect(measureDocumentText(t.documentTitleLabel)).toBeLessThanOrEqual(130);
      expect(measureDocumentText(`${t.selectedStamp}: ${t.unfit}. ${t.stampHere}.`)).toBeLessThanOrEqual(430);
      for (const caption of Object.values(t.feedback)) expect(measureDocumentText(caption), caption).toBeLessThanOrEqual(430);
    }
  });

  it('fits all specific general findings within two native note lines', () => {
    for (const t of Object.values(translations)) {
      for (const finding of t.generalFindings) {
        expect(measureDocumentText(finding), finding).toBeLessThanOrEqual(166);
        // The examination label and full finding can each occupy one line.
        expect(measureDocumentText(`${t.generalResult}:`)).toBeLessThanOrEqual(166);
      }
    }
  });

  it('fits every brief patient reply within the speech bubble in both languages', () => {
    for (const t of Object.values(translations)) {
      for (const line of Object.values(t.patientSpeech)) expect(measureDocumentText(line), line).toBeLessThanOrEqual(79);
    }
  });

  it('fits the archive, staff room and restart copy into their quiet left wall', () => {
    for (const t of Object.values(translations)) {
      for (const title of [t.savesTitle, t.restartTitle]) expect(measureText(title) * 2).toBeLessThanOrEqual(208);
      for (const line of t.gameTitleLines) expect(measureText(line) * 5).toBeLessThanOrEqual(208);
      for (const line of [...t.savesBody, ...t.restartBody]) expect(measureText(line), line).toBeLessThanOrEqual(208);
      for (const label of [t.resume, t.restart, t.restartConfirm, t.restartCancel, t.saves]) expect(measureText(label)).toBeLessThanOrEqual(178);
    }
  });

  it('keeps every manual spread readable within its two native-pixel pages', () => {
    expect(translations.pl.manualPages).toHaveLength(9);
    expect(translations.en.manualPages).toHaveLength(translations.pl.manualPages.length);
    for (const t of Object.values(translations)) {
      for (const page of t.manualPages) {
        for (const heading of [page.title, page.facingTitle]) expect(measureDocumentText(heading)).toBeLessThanOrEqual(111);
        for (const column of [page.lines, page.facingLines]) {
          expect(column.length).toBeLessThanOrEqual(9);
          for (const line of column) expect(measureDocumentText(line), line).toBeLessThanOrEqual(114);
        }
      }
    }
  });
});
