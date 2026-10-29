import { readdir } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { endDayMusic, endDayPlaylist, gameOverMusic, gameOverPlaylist, musicManifest, musicPlaylist, playlistForState, reservedMusicFiles } from '../src/core/music';

it('accounts for every local MP3 once as work, end-of-day, game-over, or reserved music', async () => {
  const files = (await readdir(new URL('../public/assets/audio/music/', import.meta.url)))
    .filter(file => file.toLowerCase().endsWith('.mp3')).sort();
  const registeredFiles = Object.values(musicManifest).map(asset => decodeURIComponent(asset.src[0].split('/').at(-1)!));
  expect(new Set(musicPlaylist).size).toBe(musicPlaylist.length);
  expect([...registeredFiles, ...reservedMusicFiles].sort()).toEqual(files);
  expect([...musicPlaylist, ...endDayPlaylist, ...gameOverPlaylist].sort()).toEqual(Object.keys(musicManifest).sort());
});

it('plays Game Over only for terminal failures, including imported endings', () => {
  expect(gameOverPlaylist).toEqual([gameOverMusic]);
  expect(musicManifest[gameOverMusic].src[0]).toContain('Game%20Over.mp3');
  expect(musicPlaylist).not.toContain(gameOverMusic);
  expect(endDayPlaylist).not.toContain(gameOverMusic);
  for (const ending of ['bankruptcy', 'hospital'] as const) {
    expect(playlistForState({ phase: 'home', ending })).toBe(gameOverPlaylist);
  }
  expect(playlistForState({ phase: 'cabinet', ending: 'assault-pending' })).toBe(musicPlaylist);
  expect(playlistForState({ phase: 'home', ending: null })).toBe(endDayPlaylist);
  expect(playlistForState({ phase: 'intro', ending: null })).toBe(musicPlaylist);
});

it('keeps home and future success recordings out of the working playlist', () => {
  expect(endDayPlaylist).toEqual([endDayMusic]);
  expect(musicPlaylist).not.toContain(endDayMusic);
  const workingFiles = musicPlaylist.map(id => decodeURIComponent(musicManifest[id].src[0].split('/').at(-1)!));
  expect(workingFiles).not.toContain('Wissenschaftlicher Optimismus - EOD.mp3');
  expect(Object.values(musicManifest).every(asset => !decodeURIComponent(asset.src[0]).includes(' - SUCCESS.mp3'))).toBe(true);
});

it('reserves the success cue and removes its older duplicate', async () => {
  const files = await readdir(new URL('../public/assets/audio/music/', import.meta.url));
  expect(files).not.toContain('Victory Fanfare.mp3');
  expect(reservedMusicFiles).toEqual(['Victory Fanfare - SUCCESS.mp3']);
  const registeredFiles = Object.values(musicManifest).map(asset => decodeURIComponent(asset.src[0].split('/').at(-1)!));
  expect(registeredFiles).not.toContain(reservedMusicFiles[0]);
  expect(musicPlaylist).toHaveLength(17);
});
