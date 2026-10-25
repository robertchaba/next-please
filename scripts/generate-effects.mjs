/**
 * Original, deterministic Foley-style synthesis for Next, Please!
 * Run with `node scripts/generate-effects.mjs [stamp bell telephone phone-tone phone-dial]`.
 * No recordings or dependencies.
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

function synthesize(duration, peak, seed, components, loop = false) {
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
  const maximum = samples.reduce((value, sample) => Math.max(value, Math.abs(sample)), 0);
  const pcm = Buffer.alloc(samples.length * 2);
  for (let index = 0; index < samples.length; index++) {
    const time = index / sampleRate;
    const edge = loop ? 1 : Math.min(1, time / 0.0005, (samples.length - 1 - index) / (sampleRate * 0.009));
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
const dialPulses = [4, 2, 6, 3];
let dialStart = 0.1;
const dialDigits = dialPulses.map(pulses => {
  const start = dialStart;
  dialStart += 0.28 + 0.06 + pulses * 0.1 + 0.2;
  return { start, pulses };
});

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
  'stamp.wav': synthesize(0.26, 0.79, 1637, (time, low, mid, high) => {
    // One press/release stroke: rubber meets paper and the wooden desk gives a
    // low, dry knock. The small return clack arrives separately, not as a ring.
    const impactTime = time - 0.006;
    const attack = Math.max(0, Math.min(1, impactTime / 0.0015));
    const rubber = decay(time, 0.006, 0.013) * (low * 2.1 + mid * 0.30);
    const desk = decay(time, 0.006, 0.022) * tone(impactTime, 146) * 0.58
      + decay(time, 0.006, 0.013) * tone(impactTime, 237) * 0.26
      + decay(time, 0.006, 0.008) * tone(impactTime, 431) * 0.09;
    const mechanism = decay(time, 0.002, 0.002) * (mid * 0.25 + high * 0.035)
      + decay(time, 0.018, 0.004) * (mid * 0.34 + high * 0.04);
    const slide = time > 0.06 && time < 0.14
      ? Math.sin((time - 0.06) / 0.08 * Math.PI) ** 2 * (low * 0.11 + mid * 0.025) : 0;
    const releaseTime = time - 0.142;
    const release = decay(time, 0.142, 0.005) * (mid * 0.45 + high * 0.065)
      + decay(time, 0.142, 0.009) * tone(releaseTime, 584) * 0.12
      + decay(time, 0.157, 0.0035) * (low * 0.16 + mid * 0.10);
    // Only gentle saturation: retain the woody body instead of a noisy crack.
    return Math.tanh((rubber + desk) * attack * 1.12) + mechanism + slide + release;
  }),
  'bell.wav': synthesize(0.68, 0.48, 7403, (time, low, mid, high) => {
    const strikeTime = time - 0.004;
    const attack = Math.max(0, Math.min(1, strikeTime / 0.001));
    // Inharmonic dome modes and a quiet adjacent mode give a small brass bell.
    // Each mode decays independently; there is no looping or synthetic echo.
    const ring = decay(time, 0.004, 0.18) * tone(strikeTime, 1850)
      + decay(time, 0.004, 0.16) * tone(strikeTime, 1857) * 0.16
      + decay(time, 0.004, 0.12) * tone(strikeTime, 2974) * 0.42
      + decay(time, 0.004, 0.075) * tone(strikeTime, 4916) * 0.21
      + decay(time, 0.004, 0.042) * tone(strikeTime, 6621) * 0.08;
    return ring * attack
      + decay(time, 0.002, 0.003) * (mid * 0.18 + high * 0.08)
      + decay(time, 0.028, 0.004) * low * 0.05;
  }),
  'paper.wav': synthesize(0.25, 0.27, 8137, (time, low, mid, high) => {
    const sweep = Math.sin(Math.PI * time / 0.25) ** 2;
    const flutter = 0.35 + 0.65 * Math.sin(time * 67) ** 2;
    return sweep * flutter * (mid * 0.38 + high * 0.11)
      + decay(time, 0.174, 0.015) * (low * 0.45 + mid * 0.12);
  }),
  'telephone.wav': synthesize(2, 0.29, 5049, (time, low, mid) => {
    // A receiver switch click followed by a steady, narrow-band exchange tone.
    // Its gentle harmonics suggest an old earpiece, without recorded samples.
    const connection = Math.max(0, Math.min(1, (time - 0.07) / 0.045));
    const hangup = Math.max(0, Math.min(1, (1.96 - time) / 0.045));
    const steady = tone(time, 425) * 0.65 + tone(time, 850) * 0.035 + low * 0.018;
    return connection * hangup * steady
      + decay(time, 0.008, 0.005) * (mid * 0.28 + low * 0.24);
  }),
  'phone-tone.wav': synthesize(1, 0.29, 5049, time => {
    // Integer cycles over exactly one second join seamlessly in Howler's loop.
    // No fade, connection click or random noise repeats at the seam.
    return tone(time, 425) * 0.65 + tone(time, 850) * 0.035;
  }, true),
  'phone-dial.wav': synthesize(3.9, 0.34, 1983, (time, low, mid, high) => {
    // Four original rotary turns: finger wind-up, spring return and ten pulses
    // per second, with a pause between digits. No touch-tone keypad or samples.
    let sound = decay(time, 0.012, 0.006) * (low * 0.26 + mid * 0.2);
    for (const { start, pulses } of dialDigits) {
      const wind = (time - start) / 0.28;
      if (wind >= 0 && wind < 1) {
        sound += Math.sin(wind * Math.PI) ** 2 * (mid * 0.12 + low * 0.18)
          * (0.4 + 0.6 * Math.max(0, tone(time, 36)));
      }
      const returning = time - start - 0.34;
      if (returning >= 0 && returning < pulses * 0.1) {
        sound += (mid * 0.055 + tone(returning, 138) * 0.035)
          * Math.min(1, returning / 0.012, (pulses * 0.1 - returning) / 0.02);
      }
      for (let pulse = 0; pulse < pulses; pulse++) {
        const tick = start + 0.34 + pulse * 0.1;
        sound += decay(time, tick, 0.005) * (mid * 0.55 + low * 0.38 + high * 0.08)
          + decay(time, tick + 0.06, 0.0035) * (mid * 0.26 + tone(time, 1140) * 0.055);
      }
      sound += decay(time, start + 0.34 + pulses * 0.1, 0.009) * (low * 0.34 + mid * 0.12);
    }
    return sound;
  }),
};

const requested = process.argv.slice(2).map(name => name.endsWith('.wav') ? name : `${name}.wav`);
for (const name of requested) {
  if (!(name in effects)) throw new Error(`Unknown effect: ${name}`);
}
await mkdir(output, { recursive: true });
for (const [filename, wav] of Object.entries(effects)) {
  if (requested.length && !requested.includes(filename)) continue;
  await writeFile(new URL(filename, output), wav);
  process.stdout.write(`${filename}: ${wav.length} bytes\n`);
}
