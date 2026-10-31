import { describe, expect, it } from 'vitest';
import glossary from '../docs/localization-glossary.json';
import { translations } from '../src/i18n';

const firstNames: Record<string, string> = glossary.firstNames;
const surnames: Record<string, string> = glossary.surnames;

function englishName(name: string): string {
  const [first, surname] = name.replace(/^dr /, '').split(' ');
  expect(firstNames[first!], name).toBeDefined();
  const parts = surname!.split('-').map(part => {
    expect(surnames[part], name).toBeDefined();
    return surnames[part];
  });
  return `${name.startsWith('dr ') ? 'Dr ' : ''}${firstNames[first!]} ${parts.join('-')}`;
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('authored English proper names', () => {
  it('uses one glossary for every current and historical patient case, inspector and letter signatory', () => {
    for (const [index, name] of translations.pl.patientNames.entries()) {
      expect(translations.en.patientNames[index], `case ${index}`).toBe(englishName(name));
    }
    for (const [index, name] of translations.pl.inspection.names.entries()) {
      expect(translations.en.inspection.names[index]).toBe(englishName(name));
    }
    for (const sender of ['zus', 'employer', 'missingResult'] as const) {
      for (const [index, letter] of translations.pl.paperwork.letters[sender].entries()) {
        expect(translations.en.paperwork.letters[sender][index]!.signature).toBe(englishName(letter.signature));
      }
    }
    for (const kind of ['dates', 'specialist', 'authenticity', 'additional-tests'] as const) {
      expect(translations.en.progression.directives[kind].signature)
        .toBe(englishName(translations.pl.progression.directives[kind].signature));
    }
  });

  it('keeps Polish name fragments out of every English string, including prose and accessible labels', () => {
    const changed = Object.values(glossary).flatMap(group => Object.entries(group))
      .filter(([pl, en]) => pl !== en).map(([pl]) => pl);
    const text = strings(translations.en).join('\n');
    for (const name of changed) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(text, name).not.toMatch(new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, 'u'));
    }
    expect(text).not.toMatch(/(?:Street|Road) (?:Street|Road)|(?:Street|Road) \d/);
    expect(translations.en.creatorName).toBe('Robert Chaba');
    expect(translations.en.creatorGithub).toBe('github.com/robertchaba');
  });

  it('uses the same address and resident in separate articles and advertisements', () => {
    const press = translations.en.newspaper;
    expect(press.classifieds['old-city-photos']).toContain('Sophia Plowman');
    expect(press.classifieds['old-city-photos']).toContain('Station Road');
    expect(press.classifieds['jam-pots']).toContain('Northgate clubroom, 6 Linden Road');
    expect(press.articles.aquarium.body).toContain('Northgate clubroom, 6 Linden Road');
    expect(press.articles.stamps.body).toContain('Alder Street cultural centre');
    expect(press.classifieds.room).toContain('Alder Street cultural centre');
    expect(translations.en.patientReferrals.some(referral => referral.employer === 'Weft Textile Mill')).toBe(true);
    expect(translations.en.documentDesign.institutions).toMatchObject({ zus: 'SIO', lot: 'NAL' });
    expect(translations.pl.documentDesign.institutions).toMatchObject({ zus: 'ZUS', lot: 'LOT' });
  });
});
