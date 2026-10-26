#!/usr/bin/env python3
"""Offline formant speech, then a quiet corridor reflection. Requires eSpeak NG.

No synthesizer or network service is part of the game. See audio/README.md.
"""
from array import array
from pathlib import Path
import math
import re
import subprocess
import wave

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public/assets/audio'
SOURCE = OUTPUT / 'source'
SOURCE.mkdir(exist_ok=True)
copy = (ROOT / 'src/i18n.ts').read_text()
phrases = re.findall(r"cleaner: '[^']*', closing: '([^']*)'", copy)
assert len(phrases) == 2

for locale, phrase in zip(('pl', 'en'), phrases):
    source = SOURCE / f'cleaner-{locale}.wav'
    subprocess.run(['espeak-ng', '-v', f'{locale}+f3', '-s', '155', '-p', '44',
                    '-a', '100', '-w', str(source), phrase], check=True)
    with wave.open(str(source), 'rb') as recording:
        rate = recording.getframerate()
        samples = array('h', recording.readframes(recording.getnframes()))
    # Resample to the other effects' 44.1 kHz mono PCM format.
    length = round(len(samples) * 44100 / rate)
    dry = []
    low = 0.0
    alpha = 1 - math.exp(-2 * math.pi * 3600 / 44100)
    for index in range(length):
        position = index * rate / 44100
        left = int(position)
        fraction = position - left
        sample = samples[min(left, len(samples) - 1)] * (1 - fraction)
        sample += samples[min(left + 1, len(samples) - 1)] * fraction
        low += alpha * (sample - low)
        dry.append(low)
    wet = dry + [0.0] * 13230
    for delay, gain in ((0.083, 0.22), (0.157, 0.13), (0.241, 0.07)):
        offset = round(delay * 44100)
        for index, sample in enumerate(dry):
            wet[index + offset] += sample * gain
    gain = 14500 / max(abs(sample) for sample in wet)
    pcm = array('h', (round(sample * gain * min(1, index / 220, (len(wet) - 1 - index) / 441))
                      for index, sample in enumerate(wet)))
    with wave.open(str(OUTPUT / f'cleaner-{locale}.wav'), 'wb') as recording:
        recording.setnchannels(1)
        recording.setsampwidth(2)
        recording.setframerate(44100)
        recording.writeframes(pcm.tobytes())
    print(f'{locale}: {len(pcm) / 44100:.2f}s')
