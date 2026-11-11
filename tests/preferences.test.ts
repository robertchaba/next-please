import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { readPreferences, savePreferences } from '../src/i18n';

beforeEach(() => {
  vi.stubGlobal('navigator', { languages: ['en-US'], language: 'en-US' });
  vi.stubGlobal('localStorage', { getItem: () => null });
});

afterEach(() => vi.unstubAllGlobals());

it.each([
  { languages: ['en-US', 'pl-PL'], expected: 'en' },
  { languages: ['pl-PL', 'en-US'], expected: 'pl' },
  { languages: ['de-DE', 'pl'], expected: 'pl' },
  { languages: ['fr-FR', 'en-GB', 'pl'], expected: 'en' },
  { languages: ['PL-pl'], expected: 'pl' },
  { languages: ['de-DE', 'fr-FR'], expected: 'en' },
])('chooses $expected from the ordered browser languages $languages', ({ languages, expected }) => {
  vi.stubGlobal('navigator', { languages, language: languages[0] });
  expect(readPreferences().locale).toBe(expected);
});

it('uses navigator.language when the language list is missing or empty', () => {
  vi.stubGlobal('navigator', { language: 'pl-PL' });
  expect(readPreferences().locale).toBe('pl');
  vi.stubGlobal('navigator', { languages: [], language: 'pl-PL' });
  expect(readPreferences().locale).toBe('pl');
});

it('falls back to English without browser language information', () => {
  vi.stubGlobal('navigator', undefined);
  expect(readPreferences().locale).toBe('en');
  vi.stubGlobal('navigator', { languages: [], language: '' });
  expect(readPreferences().locale).toBe('en');
});

it.each(['pl', 'en'] as const)('honors a saved %s choice over browser preferences', locale => {
  vi.stubGlobal('navigator', { languages: [locale === 'pl' ? 'en-US' : 'pl-PL'] });
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ locale }) });
  expect(readPreferences().locale).toBe(locale);
});

it.each(['{}', '{"locale":"de"}', '{"locale":null}', 'null', '{broken'])('uses browser preferences for missing, invalid or corrupt stored preferences: %s', stored => {
  vi.stubGlobal('navigator', { languages: ['pl-PL'] });
  vi.stubGlobal('localStorage', { getItem: () => stored });
  expect(readPreferences()).toEqual({ locale: 'pl', muted: true, musicVolume: 0.4 });
});

it('keeps older preferences compatible and defaults the music volume to 40%', () => {
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ locale: 'en', muted: false }) });
  expect(readPreferences()).toEqual({ locale: 'en', muted: false, musicVolume: 0.4 });
});

it.each([-1, 1.1, '0.5', null, {}])('rejects an invalid stored music volume: %j', musicVolume => {
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ musicVolume }) });
  expect(readPreferences().musicVolume).toBe(0.4);
});

it('persists volume independently of mute and accepts zero volume', () => {
  let stored = '';
  vi.stubGlobal('localStorage', { getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; } });
  savePreferences('en', false, 0);
  expect(readPreferences()).toEqual({ locale: 'en', muted: false, musicVolume: 0 });
  savePreferences('pl', true, 0.37);
  expect(readPreferences()).toEqual({ locale: 'pl', muted: true, musicVolume: 0.37 });
});

it.each(['en', 'pl'] as const)('uses browser language %s when storage is blocked', locale => {
  vi.stubGlobal('navigator', { languages: [locale] });
  const blocked = () => { throw new Error('Blocked'); };
  vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked });
  expect(readPreferences()).toEqual({ locale, muted: true, musicVolume: 0.4 });
  expect(() => savePreferences('en', false, 0.65)).not.toThrow();
});
