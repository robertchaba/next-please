import type { AudioManifest } from './audio';

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
  ['victory-fanfare', 'Victory Fanfare.mp3'],
] as const;

export const musicPlaylist = tracks.map(([id]) => id);
export const musicManifest: AudioManifest = Object.fromEntries(tracks.map(([id, filename]) => [id, {
  kind: 'music',
  src: [`${import.meta.env.BASE_URL}assets/audio/music/${encodeURIComponent(filename)}`],
}]));
