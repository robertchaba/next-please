import { gunzipSync, gzipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { applyAction, type GameState } from '../src/core/game';
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
    version: 4,
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
    const state = { ...createInitialState(), day: 18, money: -250, patientsProcessed: 127 };
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded).not.toBe(state);
  });

  it('rejects unsupported versions without interpreting their state', () => {
    expectCode(() => decodeSave(envelope({ version: 5, state: {} })), 'unsupported-version');
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
  ])('preserves strict validation of legacy state: %j', (state) => {
    expectCode(() => decodeSave(envelope({ version: 1, state })), 'invalid-state');
  });

  it('checks state before exporting it', () => {
    expectCode(() => encodeSave({ ...createInitialState(), money: Number.NaN }), 'invalid-state');
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
      version: 4,
      savedAt: '2026-10-23T12:00:00.000Z',
      state: createInitialState(),
    })), { filename: 'save.json' });
    expect(decodeSave(bytes)).toEqual(createInitialState());
  });

  it('imports a browser-selected file', async () => {
    const bytes = new Uint8Array(encodeSave(createInitialState()));
    await expect(importSave(new File([bytes], 'save.npsave'))).resolves.toEqual(createInitialState());
  });

  it('migrates legacy counters into an empty cabinet without replaying the introduction', () => {
    const legacy = { day: 18, money: -250, patientsProcessed: 127 };
    expect(decodeSave(envelope({ version: 1, state: legacy }))).toEqual({
      ...createInitialState(), ...legacy, phase: 'cabinet', introStep: 3, clockMinutes: 477,
    });
    expectCode(() => decodeSave(envelope({ version: 1, state: createInitialState() })), 'invalid-state');
  });

  it.each([0, 1, 2, 3])('keeps v2 introduction card %i at the same place', (introStep) => {
    const state = { ...createInitialState(), introStep };
    expect(decodeSave(envelope({ version: 2, state }))).toEqual(state);
  });

  it.each([4, 5])('migrates removed v2 card %i directly into the empty cabinet', (introStep) => {
    const legacy = { ...createInitialState(), introStep, day: 7, money: -20, patientsProcessed: 16, lampOn: false, decoration: 'certificate' };
    expect(decodeSave(envelope({ version: 2, state: legacy }))).toEqual({
      ...legacy, phase: 'cabinet', introStep: 3,
    });
  });

  it('migrates a stamped v2 visit without changing its work, clock, or decoration', () => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'toggle-lamp', 'change-decoration', 'call-patient', 'take-document', 'run-pressure', 'run-vision', 'stamp-fit'] as const) {
      state = applyAction(state, action).state;
    }
    const legacy = { ...state, clockMinutes: 570 };
    const decoded = decodeSave(envelope({ version: 2, state: { ...legacy, introStep: 5 } }));
    expect(decoded).toEqual(legacy);
    expect(decoded.visit).not.toBe(state.visit);
    expect(applyAction(decoded, 'return-document').state).toMatchObject({
      patientsProcessed: 1, shiftCompleted: 1, money: 10, clockMinutes: 571,
    });
  });

  it.each([
    { introStep: 6 },
    { phase: 'cabinet', introStep: 3 },
    { phase: 'cabinet', introStep: 5, clockMinutes: 480 },
    { introStep: 4, visit: {} },
    { introStep: 4, shiftCompleted: 1, patientsProcessed: 1 },
    { unexpected: true },
  ])('keeps the original v2 validation before migration: %j', (patch) => {
    expectCode(() => decodeSave(envelope({ version: 2, state: { ...createInitialState(), ...patch } })), 'invalid-state');
  });

  it('exports version 4 after migrating an older save', () => {
    const migrated = decodeSave(envelope({ version: 2, state: { ...createInitialState(), introStep: 5 } }));
    const bytes = encodeSave(migrated);
    const exported = JSON.parse(new TextDecoder().decode(gunzipSync(bytes)));
    expect(exported).toMatchObject({ version: 4, state: { phase: 'cabinet', introStep: 3 } });
    expect(decodeSave(bytes)).toEqual(migrated);
  });

  it('round-trips a mid-visit state and preserves the decision awaiting return', () => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'toggle-lamp', 'change-decoration', 'call-patient', 'take-document', 'run-pressure', 'run-vision', 'stamp-unfit'] as const) {
      state = applyAction(state, action).state;
    }
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.visit).not.toBe(state.visit);
    expect(decoded.clockMinutes).toBe(489);
    expect(applyAction(decoded, 'return-document').feedback).toBe('patient-error');
  });

  it.each([
    [], ['run-vision'], ['run-pressure'],
  ] as const)('round-trips an early stamp with incomplete examinations %j', (...tests) => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'call-patient', 'take-document', ...tests, 'stamp-fit'] as const) {
      state = applyAction(state, action).state;
    }
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.visit).toMatchObject({ decision: 'fit' });
    expect(decoded.visit).not.toBe(state.visit);
    expect(applyAction(decoded, 'return-document').feedback).toBe('patient-error');
    const examined = applyAction(applyAction(decoded, 'run-vision').state, 'run-pressure').state;
    expect(decodeSave(encodeSave(examined))).toEqual(examined);
    expect(applyAction(examined, 'return-document').feedback).toBe('patient-cleared');
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: state.clockMinutes - 10 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 2, state: { ...state, introStep: 5 } })), 'invalid-state');
  });

  it.each([
    { phase: 'unknown' }, { introStep: 4 }, { introStep: 5 }, { introStep: 6 }, { introStep: 0.5 }, { shiftCompleted: -1 },
    { shiftCompleted: 4 }, { shiftCompleted: 1 }, { lampOn: 1 }, { decoration: 'portrait' },
    { phase: 'cabinet', introStep: 0 }, { unexpected: true }, { money: Number.MAX_SAFE_INTEGER },
  ])('rejects malformed current state fields: %j', (patch) => {
    expectCode(() => decodeSave(envelope({ state: { ...createInitialState(), ...patch } })), 'invalid-state');
  });

  it('rejects missing state fields and visits inconsistent with their phase or progress', () => {
    const initial = createInitialState();
    const active = applyAction(applyAction(initial, 'skip-intro').state, 'call-patient').state;
    const invalidStates: unknown[] = [
      null, [], { ...initial, visit: undefined }, { ...initial, visit: active.visit },
      { ...active, visit: { ...active.visit, patientId: 1 } },
      { ...active, shiftCompleted: 3, patientsProcessed: 3 },
      { ...active, visit: { ...active.visit, document: 'pocket' } },
      { ...active, visit: { ...active.visit, visionTested: true } },
      { ...active, clockMinutes: 490, visit: { ...active.visit, decision: 'fit' } },
      { ...active, visit: { ...active.visit, document: 'desk', decision: 'fit' } },
      { ...active, visit: { ...active.visit, document: 'desk', decision: 'maybe' } },
      { ...active, visit: { ...active.visit, pressureTested: 'yes' } },
      { ...active, visit: { ...active.visit, unexpected: true } },
    ];
    for (const state of invalidStates) expectCode(() => decodeSave(envelope({ state })), 'invalid-state');
    for (const key of Object.keys(initial)) {
      const missing = { ...initial } as Record<string, unknown>;
      delete missing[key];
      expectCode(() => decodeSave(envelope({ state: missing })), 'invalid-state');
    }
  });

  it('bounds the current clock while retaining time spent on repeated work and handling', () => {
    const initial = createInitialState();
    for (const clockMinutes of [476, 478, 480, 840, 841, 477.5, '477']) {
      expectCode(() => decodeSave(envelope({ state: { ...initial, clockMinutes } })), 'invalid-state');
    }
    let state = applyAction(initial, 'skip-intro').state;
    for (let appointment = 0; appointment < 3; appointment += 1) {
      for (const action of ['handle-item', 'read-manual', 'call-patient', 'take-document', 'run-vision', 'run-pressure', 'stamp-fit', 'return-document'] as const) {
        state = applyAction(state, action).state;
        expect(decodeSave(encodeSave(state))).toEqual(state);
        // Additional time can come from earlier item handling or examinations.
        expect(decodeSave(envelope({ state: { ...state, clockMinutes: state.clockMinutes + 1 } })).clockMinutes).toBe(state.clockMinutes + 1);
        expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 841 } })), 'invalid-state');
      }
    }
    expect(state.clockMinutes).toBe(516);
    const nextDay = applyAction(state, 'next-day').state;
    expect(decodeSave(encodeSave(nextDay)).clockMinutes).toBe(477);
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 482 } })), 'invalid-state');
  });

  it('preserves v3 clocks after strict legacy validation and exports subsequent short actions as v4', () => {
    const legacy = {
      ...createInitialState(), phase: 'cabinet', introStep: 3, clockMinutes: 500,
      visit: { patientId: 0, document: 'desk', visionTested: false, pressureTested: false, decision: 'fit' },
    };
    const migrated = decodeSave(envelope({ version: 3, state: legacy }));
    expect(migrated).toEqual(legacy);
    const updated = applyAction(migrated, 'run-vision').state;
    expect(updated.clockMinutes).toBe(503);
    expect(decodeSave(encodeSave(updated))).toEqual(updated);
    for (const clockMinutes of [499, 501, 477]) {
      expectCode(() => decodeSave(envelope({ version: 3, state: { ...legacy, clockMinutes } })), 'invalid-state');
    }
    expectCode(() => decodeSave(envelope({ version: 3, state: { ...legacy, introStep: 4 } })), 'invalid-state');
  });

  it('leaves live progress untouched when an import fails validation', async () => {
    let liveState: GameState = applyAction(createInitialState(), 'skip-intro').state;
    const previous = liveState;
    const bytes = new Uint8Array(envelope({ state: { ...liveState, visit: {} } }));
    try {
      liveState = await importSave(new File([bytes], 'invalid.npsave'));
    } catch (error) {
      expect(error).toMatchObject({ code: 'invalid-state' });
    }
    expect(liveState).toBe(previous);
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
