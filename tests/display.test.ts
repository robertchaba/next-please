import { describe, expect, it } from 'vitest';
import { getScale } from '../src/core/display';
import { measureText } from '../src/render/font';
import { translations } from '../src/i18n';

describe('native display', () => {
  it('uses integer enlargement and fits small screens without cropping', () => {
    expect(getScale(1440, 900)).toBe(2);
    expect(getScale(1920, 1080)).toBe(3);
    expect(getScale(570, 320)).toBe(1);
    expect(getScale(1140, 400)).toBe(1);
    const small = getScale(374, 700);
    expect(570 * small).toBeLessThanOrEqual(374);
    expect(320 * small).toBeLessThanOrEqual(700);
  });
  it('keeps both translations inside the menu and supports Polish characters', () => {
    for (const translation of Object.values(translations)) {
      expect(measureText(translation.start)).toBeLessThan(176);
      expect(measureText(translation.subtitle)).toBeLessThan(208);
      expect(measureText(translation.tagline)).toBeLessThan(208);
    }
    expect(measureText('zażółć gęślą jaźń')).toBe(measureText('ZAŻÓŁĆ GĘŚLĄ JAŹŃ'));
  });
});
