import { describe, expect, it } from 'vitest';
import { manualSupplementsForDay } from '../src/core/manual';
import { drawManual, manualHeadingLayout, manualPageCount, manualPageDescription, manualPagesForDay } from '../src/render/manual';
import { measureDocumentHeading } from '../src/render/font';
import { translations } from '../src/i18n';

describe('gradually issued rulebook supplements', () => {
  it('keeps numbered headlines readable above the rule on every PL/EN page', () => {
    for (const locale of ['pl', 'en'] as const) {
      for (const page of manualPagesForDay(locale, 100)) for (const title of [page.title, page.facingTitle]) {
        const layout = manualHeadingLayout(title);
        expect(`${layout.number}. ${layout.lines.join(' ')}`).toBe(title);
        expect(layout.lines.length, title).toBeLessThanOrEqual(2);
        for (const line of layout.lines) expect(measureDocumentHeading(line, 'sans'), title).toBeLessThanOrEqual(layout.width);
        expect(measureDocumentHeading(layout.number, 'sans', 2)).toBeLessThan(layout.offset);
      }
      for (let page = 0; page < manualPageCount(100); page++) {
        const marks: { x: number; y: number; w: number; h: number }[] = [];
        const ctx = { save() {}, restore() {}, fillStyle: '', fillRect(x: number, y: number, w: number, h: number) { marks.push({ x, y, w, h }); } } as unknown as CanvasRenderingContext2D;
        drawManual(ctx, { x: 0, y: 0, w: 276, h: 164 }, locale, page, 100);
        const headings = marks.filter(mark => mark.y < 36);
        expect(headings.some(mark => mark.w === 2 && mark.h === 2)).toBe(true);
        expect(headings.every(mark => mark.y + mark.h <= 26)).toBe(true);
        expect(marks.every(mark => mark.x >= 12 && mark.x + mark.w <= 264 && mark.y >= 0 && mark.y + mark.h < 144)).toBe(true);
      }
    }
  });

  it('adds only the rules due on each working day, preserving earlier supplements over weekends', () => {
    expect([1, 2, 3, 4].map(manualSupplementsForDay)).toEqual([[], ['inspection'], ['inspection'], ['inspection']]);
    expect(manualSupplementsForDay(5)).toEqual(['inspection', 'dates']);
    expect(manualSupplementsForDay(6)).toEqual(['inspection', 'dates', 'specialist']);
    expect(manualSupplementsForDay(7)).toEqual(['inspection', 'dates', 'specialist', 'authenticity']);
    expect(manualSupplementsForDay(8)).toEqual(['inspection', 'dates', 'specialist', 'authenticity', 'payments']);
    expect(manualSupplementsForDay(9)).toEqual(['inspection', 'dates', 'specialist', 'authenticity', 'payments', 'additionalTests']);
    expect(manualSupplementsForDay(10)).toEqual(manualSupplementsForDay(9));
    expect(manualSupplementsForDay(11)).toEqual(manualSupplementsForDay(9));
    expect(manualPageCount(100)).toBe(17);
  });

  for (const locale of ['pl', 'en'] as const) {
    it(`keeps the ${locale} base intact and makes new rules accessible only when introduced`, () => {
      const t = translations[locale];
      const base = manualPagesForDay(locale, 1);
      expect(base).toHaveLength(9);
      const baseText = base.map((_, page) => manualPageDescription(locale, page, 1)).join(' ');
      expect(baseText).not.toMatch(/pkt 16|provision 16|specjalist|specialist|autentyczno|authenticity|badania dodatkowe|additional examinations|wyniku|report|gotówka|cash/i);
      for (const [day, count] of [[2, 10], [5, 11], [6, 12], [7, 13], [8, 14], [9, 17]] as const) {
        const pages = manualPagesForDay(locale, day);
        expect(pages).toHaveLength(count);
        expect(pages.slice(0, base.length)).toEqual(base);
        expect(manualPageDescription(locale, count - 1, day)).toContain(`${t.manualPageLabel} ${count}/${count}.`);
        expect(manualPageDescription(locale, count - 1, day)).toContain(pages[count - 1]!.section);
      }
      expect(manualPagesForDay(locale, 6)[11]!.section).toBe(t.manualSupplements.specialist.label);
      expect(manualPagesForDay(locale, 9).at(-1)!.facingLines).toEqual(t.manualSupplements.additionalTests.pages[2].facingLines);
    });
  }
});
