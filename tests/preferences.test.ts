import { afterEach, expect, it, vi } from 'vitest';
import { readPreferences, savePreferences } from '../src/i18n';

afterEach(() => vi.unstubAllGlobals());

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

it('works with default preferences when storage is blocked', () => {
  const blocked = () => { throw new Error('Blocked'); };
  vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked });
  expect(readPreferences()).toEqual({ locale: 'pl', muted: true, musicVolume: 0.4 });
  expect(() => savePreferences('en', false, 0.65)).not.toThrow();
});
