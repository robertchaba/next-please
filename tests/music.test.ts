import { readdir } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { musicManifest, musicPlaylist } from '../src/core/music';

it('registers every local MP3 once', async () => {
  const files = (await readdir(new URL('../public/assets/audio/music/', import.meta.url)))
    .filter(file => file.toLowerCase().endsWith('.mp3')).sort();
  const registeredFiles = musicPlaylist.map(id => decodeURIComponent(musicManifest[id].src[0].split('/').at(-1)!));
  expect(new Set(musicPlaylist).size).toBe(musicPlaylist.length);
  expect([...registeredFiles].sort()).toEqual(files);
});
