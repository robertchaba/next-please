import type { AudioManifest } from './audio';
import type { GameState } from './game';

const tracks = [
  ['bureaucratic-march-1', 'Bureaucratic March 1.mp3'],
  ['bureaucratic-march-2', 'Bureaucratic March 2.mp3'],
  ['bureaucratic-march-3', 'Bureaucratic March 3.mp3'],
  ['happy-bureaucratic-anthem', 'Happy Bureaucratic Anthem.mp3'],
  ['negative-bureaucratic-march', 'Negative Bureaucratic March.mp3'],
  ['new-bureaucratic-march-1', 'New Bureaucratic March 1.mp3'],
  ['new-bureaucratic-march-2', 'New Bureaucratic March 2.mp3'],
  ['officious-march', 'Officious March.mp3'],
  ['square-stomp', 'Square Stomp.mp3'],
  ['bureaucratic-efficiency', 'Bureaucratic Efficiency.mp3'],
  ['bureaucratic-loop', 'Bureaucratic Loop.mp3'],
  ['bureaucratic-pulse', 'Bureaucratic Pulse.mp3'],
  ['bureaucratic-march-4', 'Bureaucratic March 4.mp3'],
  ['bureaucratic-pulse-2', 'Bureaucratic Pulse 2.mp3'],
  ['file-42', 'File 42.mp3'],
  ['menu-loop', 'Menu Loop.mp3'],
  ['untitled', 'Untitled.mp3'],
] as const;

/** This recording belongs only to the home/day-settlement context. */
export const endDayMusic = 'wissenschaftlicher-optimismus-eod';
export const endDayPlaylist: readonly string[] = [endDayMusic];
/** Terminal failures have their own cue, outside work and ordinary settlement. */
export const gameOverMusic = 'game-over';
export const gameOverPlaylist: readonly string[] = [gameOverMusic];
/** The success cue stays reserved until success scenes exist. */
export const reservedMusicFiles = ['Victory Fanfare - SUCCESS.mp3'] as const;

export const musicPlaylist = tracks.map(([id]) => id);
export const musicManifest: AudioManifest = Object.fromEntries([
  ...tracks,
  [endDayMusic, 'Wissenschaftlicher Optimismus - EOD.mp3'],
  [gameOverMusic, 'Game Over.mp3'],
].map(([id, filename]) => [id, {
  kind: 'music',
  src: [`${import.meta.env.BASE_URL}assets/audio/music/${encodeURIComponent(filename)}`],
}]));

export function playlistForState(state: Pick<GameState, 'phase' | 'ending'>): readonly string[] {
  if (state.ending === 'bankruptcy' || state.ending === 'hospital') return gameOverPlaylist;
  return state.phase === 'home' ? endDayPlaylist : musicPlaylist;
}
