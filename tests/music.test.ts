import { readdir } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { musicManifest, musicPlaylist } from '../src/core/music';
import { translations } from '../src/i18n';
import { measureText } from '../src/render/font';

it('registers every local MP3 once and keeps both credit lists in sync with the files', async () => {
  const files = (await readdir(new URL('../public/assets/audio/music/', import.meta.url)))
    .filter(file => file.toLowerCase().endsWith('.mp3')).sort();
  const registeredFiles = musicPlaylist.map(id => decodeURIComponent(musicManifest[id].src[0].split('/').at(-1)!));
  expect(new Set(musicPlaylist).size).toBe(musicPlaylist.length);
  expect([...registeredFiles].sort()).toEqual(files);
  for (const translation of Object.values(translations)) {
    expect([...translation.musicTracks]).toEqual(registeredFiles.map(file => file.replace(/\.mp3$/i, '')));
    for (const title of translation.musicTracks) expect(measureText(title)).toBeLessThanOrEqual(174);
  }
});
