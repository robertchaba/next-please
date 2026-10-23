import { gzipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import {
  createInitialState,
  decodeSave,
  encodeSave,
  importSave,
  MAX_EXPANDED_SAVE_BYTES,
  MAX_SAVE_BYTES,
  SaveError,
} from '../src/core/save';

function envelope(overrides: Record<string, unknown> = {}): Uint8Array {
  return gzipSync(strToU8(JSON.stringify({
    game: 'next-please',
    version: 1,
    savedAt: '2026-10-23T12:00:00.000Z',
    state: createInitialState(),
    ...overrides,
  })));
}

function expectCode(action: () => unknown, code: SaveError['code']): void {
  expect(action).toThrowError(expect.objectContaining({ name: 'SaveError', code }));
}

describe('portable saves', () => {
  it('round-trips an independent state with debt and progressed counters', () => {
    const state = { day: 18, money: -250, patientsProcessed: 127 };
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded).not.toBe(state);
  });

  it('rejects unsupported versions without interpreting their state', () => {
    expectCode(() => decodeSave(envelope({ version: 2, state: {} })), 'unsupported-version');
  });

  it('rejects a save for another game', () => {
    expectCode(() => decodeSave(envelope({ game: 'another-game' })), 'invalid-file');
  });

  it('rejects unknown envelope fields', () => {
    expectCode(() => decodeSave(envelope({ unexpected: true })), 'invalid-file');
  });

  it.each([
    { day: 0, money: 0, patientsProcessed: 0 },
    { day: 1.5, money: 0, patientsProcessed: 0 },
    { day: 1, money: '100', patientsProcessed: 0 },
    { day: 1, money: 0, patientsProcessed: -1 },
    { day: 1, money: 1_000_000_001, patientsProcessed: 0 },
    { day: 1, money: 0 },
    { day: 1, money: 0, patientsProcessed: 0, unexpected: true },
    null,
    [],
  ])('rejects invalid state: %j', (state) => {
    expectCode(() => decodeSave(envelope({ state })), 'invalid-state');
  });

  it('checks state before exporting it', () => {
    expectCode(() => encodeSave({ day: 1, money: Number.NaN, patientsProcessed: 0 }), 'invalid-state');
  });

  it.each(['2026-02-30T12:00:00.000Z', 'yesterday', null])('rejects malformed timestamps: %j', (savedAt) => {
    expectCode(() => decodeSave(envelope({ savedAt })), 'invalid-file');
  });

  it('rejects invalid gzip, JSON, and UTF-8', () => {
    for (const bytes of [new Uint8Array(), strToU8('{}'), gzipSync(strToU8('{')), gzipSync(new Uint8Array([0xff]))]) {
      expectCode(() => decodeSave(bytes), 'invalid-file');
    }
  });

  it('checks the gzip checksum even when the compressed data still inflates', () => {
    const bytes = encodeSave(createInitialState());
    bytes[bytes.length - 8] = bytes[bytes.length - 8]! ^ 0xff;
    expectCode(() => decodeSave(bytes), 'invalid-file');
  });

  it('rejects truncated files and altered length trailers', () => {
    const bytes = encodeSave(createInitialState());
    for (const removed of [1, 4, 8, Math.floor(bytes.length / 2)]) {
      expectCode(() => decodeSave(bytes.subarray(0, bytes.length - removed)), 'invalid-file');
    }
    const altered = bytes.slice();
    new DataView(altered.buffer).setUint32(altered.length - 4, 1, true);
    expectCode(() => decodeSave(altered), 'invalid-file');
  });

  it('rejects concatenated gzip members and trailing junk', () => {
    const first = encodeSave(createInitialState());
    const second = gzipSync(strToU8(' '));
    const joined = new Uint8Array(first.length + second.length);
    joined.set(first);
    joined.set(second, first.length);
    expectCode(() => decodeSave(joined), 'invalid-file');
    expectCode(() => decodeSave(new Uint8Array([...first, 1, 2, 3, 4])), 'invalid-file');
  });

  it('rejects oversized compressed files before inspecting their contents', () => {
    expectCode(() => decodeSave(new Uint8Array(MAX_SAVE_BYTES + 1)), 'file-too-large');
  });

  it('caps actual decompression even with a forged small gzip length', () => {
    const bytes = gzipSync(new Uint8Array(MAX_EXPANDED_SAVE_BYTES + 1));
    new DataView(bytes.buffer).setUint32(bytes.length - 4, 1, true);
    expect(bytes.length).toBeLessThan(MAX_SAVE_BYTES);
    expectCode(() => decodeSave(bytes), 'file-too-large');
  });

  it('supports Uint8Array views with a nonzero byte offset', () => {
    const bytes = encodeSave(createInitialState());
    const padded = new Uint8Array(bytes.length + 8);
    padded.set(bytes, 4);
    expect(decodeSave(padded.subarray(4, -4))).toEqual(createInitialState());
  });

  it('accepts gzip metadata produced by standard encoders', () => {
    const bytes = gzipSync(strToU8(JSON.stringify({
      game: 'next-please',
      version: 1,
      savedAt: '2026-10-23T12:00:00.000Z',
      state: createInitialState(),
    })), { filename: 'save.json' });
    expect(decodeSave(bytes)).toEqual(createInitialState());
  });

  it('imports a browser-selected file', async () => {
    const bytes = new Uint8Array(encodeSave(createInitialState()));
    await expect(importSave(new File([bytes], 'save.npsave'))).resolves.toEqual(createInitialState());
  });

  it('reports read failures with a translatable error code', async () => {
    const file = { size: 1, arrayBuffer: () => Promise.reject(new Error('File unavailable')) } as File;
    await expect(importSave(file)).rejects.toMatchObject({ code: 'read-failed' });
  });

  it('refuses oversized files before reading them', async () => {
    let read = false;
    const file = {
      size: MAX_SAVE_BYTES + 1,
      arrayBuffer: async () => { read = true; return new ArrayBuffer(0); },
    } as File;
    await expect(importSave(file)).rejects.toMatchObject({ code: 'file-too-large' });
    expect(read).toBe(false);
  });
});
