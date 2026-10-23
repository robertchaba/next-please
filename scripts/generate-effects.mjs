/**
 * Original, deterministic Foley-style synthesis for Next, Please!
 * Run with `node scripts/generate-effects.mjs`. No recordings or dependencies.
 * Each key has a body strike, a damped metal click and a quieter release;
 * the other effects layer similar mechanical resonances and filtered noise.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const sampleRate = 44100;
const output = new URL('../public/assets/audio/', import.meta.url);

function random(seed) {
  let state = seed;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000 * 2 - 1;
  };
}

function synthesize(duration, peak, seed, components) {
  const samples = new Float64Array(Math.round(duration * sampleRate));
  const noise = random(seed);
  let low = 0;
  let mid = 0;
  for (let index = 0; index < samples.length; index++) {
    const time = index / sampleRate;
    const white = noise();
    // Soft filtering avoids the brittle full-spectrum snap of raw noise.
    low += (white - low) * 0.055;
    mid += (white - mid) * 0.37;
    samples[index] = components(time, low, mid, white - mid);
  }
  const maximum = Math.max(...samples.map(Math.abs));
  const pcm = Buffer.alloc(samples.length * 2);
  for (let index = 0; index < samples.length; index++) {
    const time = index / sampleRate;
    const edge = Math.min(1, time / 0.0005, (samples.length - 1 - index) / (sampleRate * 0.009));
    pcm.writeInt16LE(Math.round(samples[index] / maximum * peak * edge * 32767), index * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const decay = (time, start, length) => time < start ? 0 : Math.exp(-(time - start) / length);
const tone = (time, frequency) => Math.sin(time * frequency * Math.PI * 2);

const effects = {
  'typewriter.wav': synthesize(0.085, 0.38, 4319, (time, low, mid, high) => {
    const strike = decay(time, 0.004, 0.0065);
    const release = decay(time, 0.028, 0.006);
    return strike * (mid * 1.3 + low * 0.5 + tone(time, 740) * 0.22 + tone(time, 1860) * 0.12)
      + decay(time, 0.004, 0.014) * tone(time, 238) * 0.15
      + release * (high * 0.13 + tone(time, 1120) * 0.09);
  }),
  'carriage.wav': synthesize(0.36, 0.31, 9501, (time, low, mid, high) => {
    const slide = Math.sin(Math.PI * Math.min(time / 0.27, 1)) ** 2;
    // A brief ratchet glide and carriage stop, with a small subdued bell.
    const teeth = (0.35 + 0.65 * Math.max(0, tone(time, 87 - time * 75)) ** 4);
    return slide * teeth * (mid * 0.25 + high * 0.06)
      + decay(time, 0.246, 0.012) * (low * 1.3 + mid * 0.7 + tone(time, 210) * 0.18)
      + decay(time, 0.255, 0.035) * (tone(time, 2080) * 0.055 + tone(time, 3112) * 0.02);
  }),
  'stamp.wav': synthesize(0.16, 0.44, 1637, (time, low, mid) => {
    const hit = decay(time, 0.008, 0.018);
    return hit * (low * 2.1 + mid * 0.45 + tone(time, 105) * 0.45 + tone(time, 233) * 0.12)
      + decay(time, 0.056, 0.011) * (mid * 0.22 + tone(time, 370) * 0.06);
  }),
  'paper.wav': synthesize(0.25, 0.27, 8137, (time, low, mid, high) => {
    const sweep = Math.sin(Math.PI * time / 0.25) ** 2;
    const flutter = 0.35 + 0.65 * Math.sin(time * 67) ** 2;
    return sweep * flutter * (mid * 0.38 + high * 0.11)
      + decay(time, 0.174, 0.015) * (low * 0.45 + mid * 0.12);
  }),
};

await mkdir(output, { recursive: true });
for (const [filename, wav] of Object.entries(effects)) {
  await writeFile(new URL(filename, output), wav);
  process.stdout.write(`${filename}: ${wav.length} bytes\n`);
}
