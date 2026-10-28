import { describe, expect, it } from 'vitest';
import { drawDocumentHeading, drawDocumentText, drawReadingText, drawText, measureDocumentHeading, measureDocumentText, measureReadingText, measureText, READ_CELL_HEIGHT, READ_LINE_HEIGHT, type DocumentFace } from '../src/render/font';
import { translations } from '../src/i18n';
import { mobileDialogueLines, mobileStatusLines } from '../src/render/mobile';
import { helpLayout, HELP_TEXT_WIDTH, HELP_VIEW } from '../src/render/help';

type Pixel = [number, number, number, number];

it('fits both beginner guides without dropping words or crowding the scrollbar', () => {
  for (const locale of ['pl', 'en'] as const) {
    const copy = translations[locale].help;
    const layout = helpLayout(locale);
    expect(layout.height).toBeGreaterThan(HELP_VIEW.h);
    expect(layout.blocks.map(block => block.text)).toEqual([copy.intro, ...copy.sections.flatMap(section => [section.title, section.body])]);
    for (const block of layout.blocks) {
      expect(block.lines.join(' ')).toBe(block.text);
      for (const line of block.lines) expect(measureText(line), line).toBeLessThanOrEqual(HELP_TEXT_WIDTH);
    }
    expect(measureText(copy.label)).toBeLessThanOrEqual(96);
    expect(measureText(copy.scrollHint)).toBeLessThanOrEqual(HELP_VIEW.w);
  }
});
function pixels(value: string, x = 0, y = 0,
  draw: (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => void = drawDocumentText): Pixel[] {
  const marks: Pixel[] = [];
  const context = {
    save() {}, restore() {}, fillStyle: '',
    fillRect(a: number, b: number, w: number, h: number) { marks.push([a, b, w, h]); },
  } as unknown as CanvasRenderingContext2D;
  draw(context, value, x, y);
  return marks;
}

describe('upright document reading face', () => {
  it('uses the original four-row lowercase and five-row capitals without cursive variants', () => {
    const height = (value: string, draw: typeof drawReadingText) => {
      const ys = pixels(value, 0, 0, draw).map(([, y]) => y);
      return Math.max(...ys) - Math.min(...ys) + 1;
    };
    expect(height('o', drawReadingText)).toBe(4);
    expect(height('o', drawDocumentText)).toBe(4);
    expect(height('A', drawReadingText)).toBe(5);
    expect(measureReadingText('Irena Gaj')).toBe(measureDocumentText('Irena Gaj'));
    expect(pixels('Poradnia', 0, 0, drawReadingText)).not.toEqual(pixels('PORADNIA', 0, 0, drawReadingText));
    // Handwritten entries retain upright lettering; color distinguishes the ink.
    expect(pixels('Gabinet', 0, 0, drawReadingText)).toEqual(pixels('Gabinet', 0, 0,
      (ctx, value, x, y) => drawReadingText(ctx, value, x, y, { face: 'handwritten' })));
  });

  it('keeps Polish accents, punctuation and descenders inside measured native cells', () => {
    for (const face of ['typewriter', 'handwritten'] as const) {
      const draw: typeof drawReadingText = (ctx, value, x, y) => drawReadingText(ctx, value, x, y, { face });
      for (const [accented, plain] of Object.entries({ ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z', Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z' })) {
        const marks = pixels(accented, 0, 0, draw);
        expect(marks, `${face}: ${accented}`).not.toEqual(pixels(plain, 0, 0, draw));
        expect(marks).not.toEqual(pixels('?', 0, 0, draw));
        expect(pixels(accented.normalize('NFD'), 0, 0, draw)).toEqual(marks);
      }
      for (const character of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzĄĆĘŁŃÓŚŹŻąćęłńóśźż0123456789.,:;!?/—–()„”’…') {
        expect(pixels(character, 0, 0, draw).every(([x, y, w, h]) => x >= 0 && x < measureReadingText(character, face) && y >= 0 && y < READ_CELL_HEIGHT && w === 1 && h === 1), `${face}: ${character}`).toBe(true);
      }
      expect(Math.max(...pixels('gypq', 0, 0, draw).map(([, y]) => y))).toBe(6);
    }
  });

  it('aligns mixed-case copy on integer pixels with a clear gap between lines', () => {
    for (const face of ['typewriter', 'handwritten'] as const) {
      const sample = 'Źdźbło gęślą';
      const original = pixels(sample, 0, 0, (ctx, value, x, y) => drawReadingText(ctx, value, x, y, { face }));
      for (const align of ['left', 'center', 'right'] as const) {
        const offset = align === 'center' ? measureReadingText(sample, face) / 2 : align === 'right' ? measureReadingText(sample, face) : 0;
        const line = original.map(([x, y, w, h]) => [x + Math.round(100.4 - offset), y + 10, w, h]);
        const marks = pixels(`${sample}\n${sample}`, 100.4, 10.3,
          (ctx, value, x, y) => drawReadingText(ctx, value, x, y, { face, align }));
        expect(marks).toEqual([...line, ...line.map(([x, y, w, h]) => [x, y + READ_LINE_HEIGHT, w, h])]);
        expect(marks.every(mark => mark.every(Number.isInteger))).toBe(true);
      }
      expect(READ_LINE_HEIGHT).toBeGreaterThan(READ_CELL_HEIGHT);
      expect(measureReadingText(`short\n${sample}`, face)).toBe(measureReadingText(sample, face));
    }
  });
});

describe('institutional document headline lettering', () => {
  it('uses the original document alphabet in all heading roles', () => {
    const serif = pixels('SKIEROWANIE', 0, 0, drawDocumentHeading);
    const sans = pixels('SKIEROWANIE', 0, 0, (ctx, text, x, y) => drawDocumentHeading(ctx, text, x, y, { face: 'sans' }));
    const body = pixels('SKIEROWANIE');
    expect(serif).toEqual(body);
    expect(serif).toEqual(sans);
    expect(Math.max(...serif.map(([, y]) => y))).toBe(5);
    expect(Math.max(...sans.map(([, y]) => y))).toBe(5);
    expect(measureDocumentHeading('SKIEROWANIE', 'sans')).toBe(measureDocumentHeading('SKIEROWANIE', 'serif'));
    for (const text of ['SKIEROWANIE', 'ORZECZENIE', 'ZAŚWIADCZENIE', 'EXAMINATION REPORT', 'CERTIFICATE']) {
      expect(measureDocumentHeading(text, 'serif'), text).toBeLessThanOrEqual(166);
    }
    expect(measureDocumentHeading('LOT', 'sans', 2)).toBeLessThanOrEqual(34);
    expect(pixels('orZeczenie', 0, 0, drawDocumentHeading)).toEqual(pixels('ORZECZENIE', 0, 0, drawDocumentHeading));
  });

  it('renders every Polish headline accent within measured bounds', () => {
    for (const face of ['serif', 'sans'] as const) {
      const draw: typeof drawDocumentText = (ctx, value, x, y) => drawDocumentHeading(ctx, value, x, y, { face });
      for (const [accented, plain] of Object.entries({ Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z' })) {
        const marks = pixels(accented, 0, 0, draw);
        expect(marks, `${face}: ${accented}`).not.toEqual(pixels(plain, 0, 0, draw));
        expect(marks).not.toEqual(pixels('?', 0, 0, draw));
        expect(marks.every(([x, y, w, h]) => x >= 0 && x < measureDocumentHeading(accented, face) && y >= 0 && y < 7 && w === 1 && h === 1)).toBe(true);
        expect(pixels(accented.normalize('NFD'), 0, 0, draw)).toEqual(marks);
      }
    }
  });

  it('aligns enlarged mastheads on integer pixels with clear multiline spacing', () => {
    for (const face of ['serif', 'sans'] as const) for (const align of ['left', 'center', 'right'] as const) {
      const sample = 'LOT / 04', scale = 2;
      const original = pixels(sample, 0, 0, (ctx, text, x, y) => drawDocumentHeading(ctx, text, x, y, { face }));
      const offset = align === 'center' ? measureDocumentHeading(sample, face, scale) / 2 : align === 'right' ? measureDocumentHeading(sample, face, scale) : 0;
      const draw: typeof drawDocumentText = (ctx, value, x, y) => drawDocumentHeading(ctx, value, x, y, { face, align, scale: 2.9 });
      const marks = pixels(`${sample}\n${sample}`, 100.4, 10.3, draw);
      const line = original.map(([x, y]) => [Math.round(100.4 - offset) + x * scale, 10 + y * scale, scale, scale]);
      expect(marks).toEqual([...line, ...line.map(([x, y, w, h]) => [x, y + 16, w, h])]);
      expect(marks.every(mark => mark.every(Number.isInteger))).toBe(true);
    }
  });
});

describe('compact original document font', () => {
  it('preserves the original glyphs and metrics for every document role', () => {
    const faces: DocumentFace[] = ['print', 'typewriter', 'handwritten', 'book'];
    const sample = 'Poradnia / Gabinet 04\nZażółć gęślą jaźń. 1983';
    const drawn = faces.map(face => pixels(sample, 0, 0, (ctx, value, x, y) => drawDocumentText(ctx, value, x, y, { face })));
    expect(new Set(drawn.map(marks => JSON.stringify(marks))).size).toBe(1);
    expect(drawn[2]).toEqual(drawn[0]);
    expect(['Gabinet', '04'].map(measureDocumentText)).toEqual([measureDocumentText('Gabinet'), measureDocumentText('04')]);
    for (const face of faces) {
      expect(measureDocumentText(sample, face)).toBe(measureDocumentText(sample));
      for (const t of Object.values(translations)) {
        for (const value of [...t.patientNames, ...t.patientJobs]) {
          expect(measureDocumentText(value, face), `${face}: ${value}`).toBe(measureDocumentText(value));
        }
      }
    }
  });

  it('keeps Polish accents, alignment and line separation in every document face', () => {
    for (const face of ['typewriter', 'handwritten', 'book'] as const) {
      const draw: typeof drawDocumentText = (ctx, value, x, y) => drawDocumentText(ctx, value, x, y, { face });
      for (const [accented, plain] of Object.entries({ ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z', Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z' })) {
        const marks = pixels(accented, 0, 0, draw);
        expect(marks, `${face}: ${accented}`).not.toEqual(pixels(plain, 0, 0, draw));
        expect(marks).not.toEqual(pixels('?', 0, 0, draw));
        expect(pixels(accented.normalize('NFD'), 0, 0, draw)).toEqual(marks);
        expect(marks.every(([x, y, w, h]) => x >= 0 && x < measureDocumentText(accented, face) && y >= 0 && y < 7 && w === 1 && h === 1)).toBe(true);
      }
      const sample = 'Źdźbło gęślą';
      const atOrigin = pixels(sample, 0, 0, draw);
      for (const align of ['center', 'right'] as const) {
        const marks = pixels(sample, 100.4, 10.3, (ctx, value, x, y) => drawDocumentText(ctx, value, x, y, { face, align }));
        const left = Math.round(100.4 - measureDocumentText(sample, face) / (align === 'center' ? 2 : 1));
        expect(marks).toEqual(atOrigin.map(([x, y, w, h]) => [x + left, y + 10, w, h]));
      }
      expect(pixels(`${sample}\n${sample}`, 0, 0, draw)).toEqual([...atOrigin, ...atOrigin.map(([x, y, w, h]) => [x, y + 8, w, h])]);
    }
  });

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
      for (const label of [t.manualBase, ...Object.values(t.manualSupplements).map(item => item.label)]) {
        expect(measureDocumentText(label), label).toBeLessThanOrEqual(114);
      }
      for (const page of [...t.manualPages, ...Object.values(t.manualSupplements).flatMap(item => item.pages)]) {
        for (const heading of [page.title, page.facingTitle]) expect(measureDocumentText(heading)).toBeLessThanOrEqual(111);
        for (const column of [page.lines, page.facingLines]) {
          expect(column.length).toBeLessThanOrEqual(9);
          for (const line of column) expect(measureDocumentText(line), line).toBeLessThanOrEqual(114);
        }
      }
    }
  });
});
