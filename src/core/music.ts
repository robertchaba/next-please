import type { AudioManifest } from './audio';
import type { GameState } from './game';

const tracks = [
  ['bureaucratic-march-1', 'Bureaucratic March - Opening the Office.mp3'],
  ['bureaucratic-march-2', 'Bureaucratic March - The Waiting Room.mp3'],
  ['bureaucratic-march-3', 'Bureaucratic March - In Triplicate.mp3'],
  ['happy-bureaucratic-anthem', 'Happy Bureaucratic Anthem - Everything in Order.mp3'],
  ['negative-bureaucratic-march', 'Negative Bureaucratic March - Application Denied.mp3'],
  ['new-bureaucratic-march-1', 'New Bureaucratic March - Revised Procedure.mp3'],
  ['new-bureaucratic-march-2', 'New Bureaucratic March - Further Instructions.mp3'],
  ['officious-march', 'Officious March - By the Book.mp3'],
  ['square-stomp', 'Square Stomp - Corridor Footsteps.mp3'],
  ['bureaucratic-efficiency', 'Bureaucratic Efficiency - Stamp and File.mp3'],
  ['bureaucratic-loop', 'Bureaucratic Loop - Please Wait.mp3'],
  ['bureaucratic-pulse', 'Bureaucratic Pulse - Office Hours.mp3'],
  ['bureaucratic-march-4', 'Bureaucratic March - The Paper Trail.mp3'],
  ['bureaucratic-pulse-2', 'Bureaucratic Pulse - Under Pressure.mp3'],
  ['file-42', 'File 42 - Pending Review.mp3'],
  ['menu-loop', 'Menu Loop - Before the Bell.mp3'],
  ['untitled', 'Untitled - A Note in the Margin.mp3'],
] as const;

/** This recording belongs only to the home/day-settlement context. */
export const endDayMusic = 'wissenschaftlicher-optimismus-eod';
export const endDayPlaylist: readonly string[] = [endDayMusic];
/** Terminal failures have their own cue, outside work and ordinary settlement. */
export const gameOverMusic = 'game-over';
export const gameOverPlaylist: readonly string[] = [gameOverMusic];
/** The success cue stays reserved until success scenes exist. */
export const reservedMusicFiles = ['Victory Fanfare - All Clear.mp3'] as const;

export const musicPlaylist = tracks.map(([id]) => id);
export const musicManifest: AudioManifest = Object.fromEntries([
  ...tracks,
  [endDayMusic, 'Wissenschaftlicher Optimismus - Feierabend.mp3'],
  [gameOverMusic, 'Game Over - The Final Stamp.mp3'],
].map(([id, filename]) => [id, {
  kind: 'music',
  src: [`${import.meta.env.BASE_URL}assets/audio/music/${encodeURIComponent(filename)}`],
}]));

export function playlistForState(state: Pick<GameState, 'phase' | 'ending'>): readonly string[] {
  if (state.ending === 'bankruptcy' || state.ending === 'hospital') return gameOverPlaylist;
  return state.phase === 'home' ? endDayPlaylist : musicPlaylist;
}
