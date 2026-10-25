import { readFile, readdir } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { effectsManifest } from '../src/core/effects';

it('registers every bundled effect locally, looping only the mobile exchange tone', async () => {
  const directory = new URL('../public/assets/audio/', import.meta.url);
  const files = (await readdir(directory)).filter(file => file.endsWith('.wav')).sort();
  const registered = Object.entries(effectsManifest).map(([id, asset]) => {
    expect(asset.kind).toBe('sfx');
    expect(asset.loop).toBe(id === 'phone-tone');
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
    const maximumDuration: Record<string, number> = {
      'telephone.wav': 2.1, 'bell.wav': 0.8, 'phone-tone.wav': 1.1, 'phone-dial.wav': 4,
    };
    expect(duration).toBeLessThan(maximumDuration[file] ?? 0.5);
    expect(wav.readInt16LE(44)).toBe(0);
    if (file !== 'phone-tone.wav') expect(wav.readInt16LE(wav.length - 2)).toBe(0);
    let peak = 0;
    for (let index = 44; index < wav.length; index += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(index)));
    expect(peak).toBeGreaterThan(1000);
    if (file === 'stamp.wav') {
      expect(peak).toBeGreaterThan(23000); // The mechanical strike must stand out.
      expect(peak).toBeLessThan(29000); // Retain headroom before Howler's effect gain.
    } else expect(peak).toBeLessThan(16000); // Quieter paper and overlapping typing.
    if (file === 'typewriter.wav') expect(duration).toBeLessThan(0.1);
    if (file === 'telephone.wav') {
      expect(duration).toBe(2);
      // Dial tone remains audible well after the receiver's initial click.
      for (const seconds of [0.25, 1, 1.75]) {
        const start = 44 + Math.round(seconds * 44100) * 2;
        let power = 0;
        for (let index = start; index < start + 4410; index += 2) power += (wav.readInt16LE(index) / 32768) ** 2;
        expect(Math.sqrt(power / 2205)).toBeGreaterThan(0.12);
      }
    }
    if (file === 'phone-tone.wav') {
      expect(duration).toBe(1);
      // Adjacent sample differences at the join match the waveform's normal
      // slope; a fade or click must not recur once per second.
      const firstStep = wav.readInt16LE(46) - wav.readInt16LE(44);
      const seamStep = wav.readInt16LE(44) - wav.readInt16LE(wav.length - 2);
      expect(Math.abs(firstStep - seamStep)).toBeLessThanOrEqual(1);
      const rms = (start: number, length: number) => {
        let power = 0;
        for (let index = start; index < start + length; index++) {
          power += (wav.readInt16LE(44 + index * 2) / 32768) ** 2;
        }
        return Math.sqrt(power / length);
      };
      expect(rms(0, 1764)).toBeCloseTo(rms(44100 - 1764, 1764), 5);
      expect(rms(0, 1764)).toBeGreaterThan(0.15);
    }
    if (file === 'phone-dial.wav') expect(duration).toBe(3.9);
  }
});
