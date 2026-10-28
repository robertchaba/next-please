import { describe, expect, it } from 'vitest';
import { version } from '../package.json';
import { GAME_VERSION, releaseCodenameIndex, releaseLabel } from '../src/core/release';
import { translations } from '../src/i18n';
import { measureText } from '../src/render/font';

describe('release identity', () => {
  it('uses the package version and preserves published names in both languages', () => {
    expect(GAME_VERSION).toBe(version);
    expect(releaseLabel('pl')).toBe('WERSJA 0.8.3 / KOLEJKA');
    expect(releaseLabel('en')).toBe('VERSION 0.8.3 / QUEUE');
    expect(releaseLabel('pl', '0.8.2')).toBe('WERSJA 0.8.2 / PIECZĄTKA');
    expect(releaseLabel('en', '0.8.2')).toBe('VERSION 0.8.2 / STAMP');
    expect(releaseLabel('pl', '0.8.0')).toBe('WERSJA 0.8.0 / PAPIEROLOGIA');
    expect(releaseLabel('en', '0.8.0')).toBe('VERSION 0.8.0 / PAPERWORK');
  });

  it('uses every version component, with stable indices for SemVer suffixes', () => {
    const versions = {
      '0.8.1': 1, '1.8.1': 14, '0.9.1': 10, '0.8.2': 2,
      '0.8.1-alpha.1': 4, '0.8.1+build.1': 11,
    };
    for (const [releaseVersion, index] of Object.entries(versions)) {
      expect(releaseCodenameIndex(releaseVersion)).toBe(index);
      expect(releaseLabel('pl', releaseVersion)).toContain(translations.pl.releaseCodenames[index]);
      expect(releaseLabel('en', releaseVersion)).toContain(translations.en.releaseCodenames[index]);
    }
  });

  it('keeps all localized codenames in the title footer at native scale', () => {
    for (const copy of Object.values(translations)) {
      expect(copy.releaseCodenames).toHaveLength(17);
      expect(new Set(copy.releaseCodenames).size).toBe(17);
      for (const codename of copy.releaseCodenames) {
        const label = copy.build.replace('{version}', GAME_VERSION).replace('{codename}', codename);
        expect(measureText(label), label).toBeLessThanOrEqual(250);
      }
    }
  });
});
