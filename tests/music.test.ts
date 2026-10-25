import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { endDayMusic, endDayPlaylist, musicManifest, musicPlaylist, reservedMusicFiles } from '../src/core/music';

it('accounts for every local MP3 once as work, end-of-day, or reserved music', async () => {
  const files = (await readdir(new URL('../public/assets/audio/music/', import.meta.url)))
    .filter(file => file.toLowerCase().endsWith('.mp3')).sort();
  const registeredFiles = Object.values(musicManifest).map(asset => decodeURIComponent(asset.src[0].split('/').at(-1)!));
  expect(new Set(musicPlaylist).size).toBe(musicPlaylist.length);
  expect([...registeredFiles, ...reservedMusicFiles].sort()).toEqual(files);
  expect([...musicPlaylist, ...endDayPlaylist].sort()).toEqual(Object.keys(musicManifest).sort());
});

it('keeps home and future success recordings out of the working playlist', () => {
  expect(endDayPlaylist).toEqual([endDayMusic]);
  expect(musicPlaylist).not.toContain(endDayMusic);
  const workingFiles = musicPlaylist.map(id => decodeURIComponent(musicManifest[id].src[0].split('/').at(-1)!));
  expect(workingFiles).not.toContain('Wissenschaftlicher Optimismus - EOD.mp3');
  expect(Object.values(musicManifest).every(asset => !decodeURIComponent(asset.src[0]).includes(' - SUCCESS.mp3'))).toBe(true);
});

it('reserves both byte-identical success filenames instead of playing the older alias at work', async () => {
  const filenames = ['Victory Fanfare.mp3', 'Victory Fanfare - SUCCESS.mp3'];
  const hashes = await Promise.all(filenames.map(async filename => createHash('sha256')
    .update(await readFile(new URL(`../public/assets/audio/music/${filename}`, import.meta.url))).digest('hex')));
  expect(hashes[0]).toBe(hashes[1]);
  const registeredFiles = Object.values(musicManifest).map(asset => decodeURIComponent(asset.src[0].split('/').at(-1)!));
  for (const filename of filenames) {
    expect(reservedMusicFiles).toContain(filename);
    expect(registeredFiles).not.toContain(filename);
  }
  expect(musicPlaylist).toHaveLength(17);
});
