import { describe, expect, it } from 'vitest';
import { drawDocumentText, measureDocumentText, measureText } from '../src/render/font';
import { translations } from '../src/i18n';

type Pixel = [number, number, number, number];
function pixels(value: string, x = 0, y = 0): Pixel[] {
  const marks: Pixel[] = [];
  const context = {
    save() {}, restore() {}, fillStyle: '',
    fillRect(a: number, b: number, w: number, h: number) { marks.push([a, b, w, h]); },
  } as unknown as CanvasRenderingContext2D;
  drawDocumentText(context, value, x, y);
  return marks;
}

describe('compact original document font', () => {
  it('renders every Polish lowercase diacritic distinctly within a nine-row cell', () => {
    for (const [accented, plain] of Object.entries({ ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' })) {
      const marks = pixels(accented);
      expect(marks).not.toEqual(pixels(plain));
      expect(marks).not.toEqual(pixels('?'));
      expect(marks.every(([x, y, w, h]) => Number.isInteger(x) && Number.isInteger(y) && y >= 0 && y < 9 && w === 1 && h === 1)).toBe(true);
      expect(Math.max(...marks.map(([x]) => x)) + 1).toBeLessThanOrEqual(measureDocumentText(accented));
      expect(pixels(accented.normalize('NFD'))).toEqual(marks);
    }
  });

  it('keeps mixed case, narrow characters, descenders and integer placement', () => {
    expect(pixels('gabinet')).not.toEqual(pixels('GABINET'));
    expect(measureDocumentText('Irena Wolska')).toBeLessThan(measureText('Irena Wolska'));
    expect(measureDocumentText('iii')).toBeLessThan(measureDocumentText('mmm'));
    expect(Math.max(...pixels('gypq').map(([, y]) => y))).toBe(8);
    expect(pixels('Zażółć', 0.4, 0.3).every(mark => mark.every(Number.isInteger))).toBe(true);
  });

  it('fits both languages into the certificate and referral without squeezing', () => {
    for (const t of Object.values(translations)) {
      for (const value of [...t.patientNames, ...t.patientJobs]) expect(measureDocumentText(value)).toBeLessThanOrEqual(100);
      for (const value of [t.documentVision, t.documentPressure]) expect(measureDocumentText(value)).toBeLessThanOrEqual(78);
      for (const value of [t.pass, t.refer]) expect(measureDocumentText(value)).toBeLessThanOrEqual(82);
      expect(measureDocumentText(t.rulebookLabel)).toBeLessThanOrEqual(64);
      expect(measureDocumentText(t.documentTitleLabel)).toBeLessThanOrEqual(130);
      expect(measureDocumentText(`${t.selectedStamp}: ${t.unfit}. ${t.stampHere}.`)).toBeLessThanOrEqual(430);
      for (const caption of Object.values(t.feedback)) expect(measureDocumentText(caption)).toBeLessThanOrEqual(430);
    }
  });

  it('keeps every manual spread readable within its two native-pixel pages', () => {
    expect(translations.pl.manualPages).toHaveLength(5);
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
