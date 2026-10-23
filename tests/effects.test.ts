import { readFile, readdir } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { effectsManifest } from '../src/core/effects';

it('registers every bundled effect with a portable local URL and no looping', async () => {
  const directory = new URL('../public/assets/audio/', import.meta.url);
  const files = (await readdir(directory)).filter(file => file.endsWith('.wav')).sort();
  const registered = Object.entries(effectsManifest).map(([id, asset]) => {
    expect(asset.kind).toBe('sfx');
    expect(asset.loop).not.toBe(true);
    expect(asset.src).toEqual([`${import.meta.env.BASE_URL}assets/audio/${id}.wav`]);
    return `${id}.wav`;
  }).sort();
  expect(registered).toEqual(files);
  expect(registered.length).toBeGreaterThan(0);

  for (const file of files) {
    const wav = await readFile(new URL(file, directory));
    expect(wav.toString('ascii', 0, 4)).toBe('RIFF');
    expect(wav.toString('ascii', 8, 16)).toBe('WAVEfmt ');
    expect(wav.readUInt32LE(4)).toBe(wav.length - 8);
    expect(wav.readUInt16LE(20)).toBe(1); // Uncompressed PCM, widely supported.
    expect(wav.readUInt16LE(22)).toBe(1); // Mono.
    expect(wav.readUInt32LE(24)).toBe(44100);
    expect(wav.readUInt16LE(34)).toBe(16);
    expect(wav.toString('ascii', 36, 40)).toBe('data');
    expect(wav.readUInt32LE(40)).toBe(wav.length - 44);
    const duration = (wav.length - 44) / (44100 * 2);
    expect(duration).toBeGreaterThan(0.04);
    expect(duration).toBeLessThan(0.5);
    expect(wav.readInt16LE(44)).toBe(0);
    expect(wav.readInt16LE(wav.length - 2)).toBe(0);
    let peak = 0;
    for (let index = 44; index < wav.length; index += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(index)));
    expect(peak).toBeGreaterThan(1000);
    expect(peak).toBeLessThan(16000); // Leave headroom for overlapping keys and music.
    if (file === 'typewriter.wav') expect(duration).toBeLessThan(0.1);
  }
});
