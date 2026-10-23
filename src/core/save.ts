import { Gunzip, gzipSync, strToU8 } from 'fflate';

export interface GameState {
  day: number;
  money: number;
  patientsProcessed: number;
}

interface SaveV1 {
  game: 'next-please';
  version: 1;
  savedAt: string;
  state: GameState;
}

export type SaveErrorCode =
  | 'file-too-large'
  | 'invalid-file'
  | 'unsupported-version'
  | 'invalid-state'
  | 'read-failed';

/** Codes, rather than these developer messages, are translated by the UI. */
export class SaveError extends Error {
  readonly code: SaveErrorCode;

  constructor(code: SaveErrorCode) {
    super(`Save error: ${code}`);
    this.name = 'SaveError';
    this.code = code;
  }
}

export const MAX_SAVE_BYTES = 1024 * 1024;
export const MAX_EXPANDED_SAVE_BYTES = 2 * 1024 * 1024;

export function createInitialState(): GameState {
  return { day: 1, money: 0, patientsProcessed: 0 };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function validateState(value: unknown): GameState {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ['day', 'money', 'patientsProcessed']) ||
    !isIntegerInRange(value.day, 1, 1_000_000) ||
    !isIntegerInRange(value.money, -1_000_000_000, 1_000_000_000) ||
    !isIntegerInRange(value.patientsProcessed, 0, 1_000_000_000)
  ) {
    throw new SaveError('invalid-state');
  }

  // Copy known fields instead of allowing imported objects into live game state.
  return { day: value.day, money: value.money, patientsProcessed: value.patientsProcessed };
}

export function encodeSave(state: GameState): Uint8Array {
  const envelope: SaveV1 = {
    game: 'next-please',
    version: 1,
    savedAt: new Date().toISOString(),
    state: validateState(state),
  };
  return gzipSync(strToU8(JSON.stringify(envelope)), { level: 6, mtime: 0 });
}

const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff]!;
  return (crc ^ 0xffffffff) >>> 0;
}

function validateGzipHeader(bytes: Uint8Array, view: DataView): void {
  if (bytes.length < 20 || bytes[0] !== 0x1f || bytes[1] !== 0x8b || bytes[2] !== 8) {
    throw new SaveError('invalid-file');
  }
  const flags = bytes[3]!;
  if (flags & 0xe0) throw new SaveError('invalid-file');

  const trailerOffset = bytes.length - 8;
  let position = 10;
  if (flags & 4) {
    if (position + 2 > trailerOffset) throw new SaveError('invalid-file');
    position += 2 + view.getUint16(position, true);
  }
  for (const flag of [8, 16]) {
    if (flags & flag) {
      while (position < trailerOffset && bytes[position] !== 0) position += 1;
      position += 1;
    }
  }
  if (flags & 2) {
    if (position + 2 > trailerOffset || view.getUint16(position, true) !== (crc32(bytes.subarray(0, position)) & 0xffff)) {
      throw new SaveError('invalid-file');
    }
    position += 2;
  }
  if (position >= trailerOffset) throw new SaveError('invalid-file');
}

function decompressSave(bytes: Uint8Array): Uint8Array {
  if (bytes.length > MAX_SAVE_BYTES) throw new SaveError('file-too-large');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  validateGzipHeader(bytes, view);
  const expectedLength = view.getUint32(bytes.length - 4, true);

  const chunks: Uint8Array[] = [];
  let length = 0;
  let finished = false;
  const stream = new Gunzip((chunk, final) => {
    length += chunk.length;
    if (length > MAX_EXPANDED_SAVE_BYTES) throw new SaveError('file-too-large');
    if (chunk.length) chunks.push(chunk);
    finished = final;
  });
  // A save is one gzip member, not a concatenated archive.
  stream.onmember = () => { throw new SaveError('invalid-file'); };

  try {
    // Small compressed chunks bound each expansion step; never trust gzip ISIZE
    // as an allocation size, because imported files can forge it.
    for (let offset = 0; offset < bytes.length; offset += 256) {
      stream.push(bytes.subarray(offset, offset + 256), offset + 256 >= bytes.length);
    }
  } catch (error) {
    if (error instanceof SaveError) throw error;
    throw new SaveError('invalid-file');
  }
  if (!finished || length !== expectedLength) throw new SaveError('invalid-file');

  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  // fflate inflates gzip data but does not verify its CRC32 trailer.
  if (crc32(result) !== view.getUint32(bytes.length - 8, true)) throw new SaveError('invalid-file');
  return result;
}

export function decodeSave(bytes: Uint8Array): GameState {
  const expanded = decompressSave(bytes);
  let envelope: unknown;
  try {
    envelope = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(expanded));
  } catch {
    throw new SaveError('invalid-file');
  }
  if (!isRecord(envelope) || envelope.game !== 'next-please' || !Number.isSafeInteger(envelope.version)) {
    throw new SaveError('invalid-file');
  }
  if (envelope.version !== 1) throw new SaveError('unsupported-version');
  if (
    !hasOnlyKeys(envelope, ['game', 'version', 'savedAt', 'state']) ||
    typeof envelope.savedAt !== 'string' ||
    !Number.isFinite(Date.parse(envelope.savedAt)) ||
    new Date(envelope.savedAt).toISOString() !== envelope.savedAt
  ) {
    throw new SaveError('invalid-file');
  }
  return validateState(envelope.state);
}

/** Call from a user action. Saves are downloaded; no account or server is used. */
export function downloadSave(state: GameState): void {
  const bytes = new Uint8Array(encodeSave(state));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/gzip' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `next-please-day-${state.day}.npsave`;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to start reading the download before releasing it.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function importSave(file: File): Promise<GameState> {
  if (file.size > MAX_SAVE_BYTES) throw new SaveError('file-too-large');
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new SaveError('read-failed');
  }
  return decodeSave(bytes);
}
