import type { AudioManifest } from './audio';

/** Original offline-synthesized effects; registration never loads or plays them. */
export const effectsManifest: AudioManifest = Object.fromEntries(
  ['typewriter', 'carriage', 'stamp', 'paper', 'bell', 'telephone', 'phone-tone', 'phone-dial'].map(id => [id, {
    kind: 'sfx',
    loop: id === 'phone-tone',
    src: [`${import.meta.env.BASE_URL}assets/audio/${id}.wav`],
  }]),
);
