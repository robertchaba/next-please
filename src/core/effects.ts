import type { AudioManifest } from './audio';

/** Original offline-synthesized effects; registration never loads or plays them. */
export const effectsManifest: AudioManifest = Object.fromEntries(
  ['typewriter', 'carriage', 'stamp', 'paper', 'bell', 'telephone'].map(id => [id, {
    kind: 'sfx',
    src: [`${import.meta.env.BASE_URL}assets/audio/${id}.wav`],
  }]),
);
