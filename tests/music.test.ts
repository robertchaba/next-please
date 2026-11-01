import { readdir } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { endDayMusic, endDayPlaylist, gameOverMusic, gameOverPlaylist, musicManifest, musicPlaylist, playlistForState, victoryMusic, victoryPlaylist } from '../src/core/music';
import { applyAction } from '../src/core/game';
import { createInitialState } from './fixtures/routine';
import { playStoryRoute } from './fixtures/story-route';
import { decodeSave, encodeSave } from '../src/core/save';

it('accounts for every local MP3 once as work, end-of-day, failure or success music', async () => {
  const files = (await readdir(new URL('../public/assets/audio/music/', import.meta.url)))
    .filter(file => file.toLowerCase().endsWith('.mp3')).sort();
  const registeredFiles = Object.values(musicManifest).map(asset => decodeURIComponent(asset.src[0].split('/').at(-1)!));
  expect(registeredFiles.sort()).toEqual(files);
  const all = [...musicPlaylist, ...endDayPlaylist, ...gameOverPlaylist, ...victoryPlaylist];
  expect(new Set(all).size).toBe(all.length);
  expect(all.sort()).toEqual(Object.keys(musicManifest).sort());
  expect(musicPlaylist).toHaveLength(17);
  expect(gameOverPlaylist).toEqual([gameOverMusic]);
  expect(victoryPlaylist).toEqual([victoryMusic]);
  expect(endDayPlaylist).toEqual([endDayMusic]);
  expect(musicManifest[gameOverMusic].src[0]).toContain('Game%20Over%20-%20The%20Final%20Stamp.mp3');
  expect(musicManifest[victoryMusic].src[0]).toContain('Victory%20Fanfare%20-%20All%20Clear.mp3');
});

it('prioritizes mechanical failures and keeps pending assaults on work music', () => {
  const state = createInitialState(17);
  for (const ending of ['bankruptcy', 'hospital'] as const) {
    expect(playlistForState({ ...state, phase: 'home', ending })).toBe(gameOverPlaylist);
    expect(playlistForState({ ...playStoryRoute('party'), ending })).toBe(gameOverPlaylist);
  }
  expect(playlistForState({ ...state, phase: 'cabinet', ending: 'assault-pending' })).toBe(musicPlaylist);
  expect(playlistForState({ ...state, phase: 'home' })).toBe(endDayPlaylist);
  expect(playlistForState(state)).toBe(musicPlaylist);
});

it.each(['exposed', 'audit', 'chaos', 'detained', 'party', 'union', 'independent'])('selects the %s chapter cue after resolution and import, then restores work music on continuation', route => {
  const state = playStoryRoute(route);
  const success = ['party', 'union', 'independent'].includes(route);
  const expected = success ? victoryPlaylist : gameOverPlaylist;
  expect(playlistForState(state)).toBe(expected);
  expect(playlistForState(decodeSave(encodeSave(state)))).toBe(expected);
  if (success) {
    const continued = applyAction(state, 'continue-story').state;
    expect(continued.story.resolution?.presented).toBe(true);
    expect(playlistForState(continued)).toBe(musicPlaylist);
    expect(playlistForState({ ...continued, phase: 'home' })).toBe(endDayPlaylist);
  }
});
