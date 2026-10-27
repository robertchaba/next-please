import { describe, expect, it } from 'vitest';
import { manualSupplementsForDay } from '../src/core/manual';
import { manualPageCount, manualPageDescription, manualPagesForDay } from '../src/render/manual';
import { translations } from '../src/i18n';

describe('gradually issued rulebook supplements', () => {
  it('adds only the rules due on each working day, preserving earlier supplements over weekends', () => {
    expect([1, 2, 3, 4].map(manualSupplementsForDay)).toEqual([[], [], [], []]);
    expect(manualSupplementsForDay(5)).toEqual(['dates']);
    expect(manualSupplementsForDay(6)).toEqual(['dates', 'specialist']);
    expect(manualSupplementsForDay(7)).toEqual(['dates', 'specialist', 'authenticity']);
    expect(manualSupplementsForDay(8)).toEqual(['dates', 'specialist', 'authenticity', 'payments']);
    expect(manualSupplementsForDay(9)).toEqual(['dates', 'specialist', 'authenticity', 'payments', 'additionalTests']);
    expect(manualSupplementsForDay(10)).toEqual(manualSupplementsForDay(9));
    expect(manualSupplementsForDay(11)).toEqual(manualSupplementsForDay(9));
    expect(manualPageCount(100)).toBe(16);
  });

  for (const locale of ['pl', 'en'] as const) {
    it(`keeps the ${locale} base intact and makes new rules accessible only when introduced`, () => {
      const t = translations[locale];
      const base = manualPagesForDay(locale, 1);
      expect(base).toHaveLength(9);
      const baseText = base.map((_, page) => manualPageDescription(locale, page, 1)).join(' ');
      expect(baseText).not.toMatch(/pkt 16|provision 16|specjalist|specialist|autentyczno|authenticity|badania dodatkowe|additional examinations|wyniku|report|gotówka|cash/i);
      for (const [day, count] of [[5, 10], [6, 11], [7, 12], [8, 13], [9, 16]] as const) {
        const pages = manualPagesForDay(locale, day);
        expect(pages).toHaveLength(count);
        expect(pages.slice(0, base.length)).toEqual(base);
        expect(manualPageDescription(locale, count - 1, day)).toContain(`${t.manualPageLabel} ${count}/${count}.`);
        expect(manualPageDescription(locale, count - 1, day)).toContain(pages[count - 1]!.section);
      }
      expect(manualPagesForDay(locale, 6)[10]!.section).toBe(t.manualSupplements.specialist.label);
      expect(manualPagesForDay(locale, 9).at(-1)!.facingLines).toEqual(t.manualSupplements.additionalTests.pages[2].facingLines);
    });
  }
});
