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
    version: 7,
    savedAt: '2026-10-23T12:00:00.000Z',
    state: createInitialState(),
    ...overrides,
  })));
}

function legacyState(state: object): Record<string, unknown> {
  const legacy = { ...state } as Record<string, unknown>;
  delete legacy.papers; delete legacy.nextPaperId; delete legacy.paperClips;
  if (legacy.visit && typeof legacy.visit === 'object') {
    const visit = { ...legacy.visit } as Record<string, unknown>;
    delete visit.measurementsTaken; delete visit.certificateTaken; delete visit.certificateNamed; legacy.visit = visit;
  }
  return legacy;
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
    expectCode(() => decodeSave(envelope({ version: 8, state: {} })), 'unsupported-version');
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
      version: 7,
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
    expect(decodeSave(envelope({ version: 2, state: legacyState(state) }))).toEqual(state);
  });

  it.each([4, 5])('migrates removed v2 card %i directly into the empty cabinet', (introStep) => {
    const legacy = { ...createInitialState(), introStep, day: 7, money: -20, patientsProcessed: 16, lampOn: false, decoration: 'certificate' };
    expect(decodeSave(envelope({ version: 2, state: legacyState(legacy) }))).toEqual({
      ...legacy, phase: 'cabinet', introStep: 3,
    });
  });

  it('migrates a stamped v2 visit without changing its work, clock, or decoration', () => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'toggle-lamp', 'change-decoration', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-pressure', 'run-vision', 'stamp-fit'] as const) {
      state = applyAction(state, action).state;
    }
    const legacy = { ...state, clockMinutes: 570 };
    const decoded = decodeSave(envelope({ version: 2, state: legacyState({ ...legacy, introStep: 5 }) }));
    expect(decoded).toEqual(legacy);
    expect(decoded.visit).not.toBe(state.visit);
    expect(applyAction(applyAction(decoded, 'run-measurements').state, 'return-document').state).toMatchObject({
      patientsProcessed: 1, shiftCompleted: 1, money: 10, clockMinutes: 573,
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
    expectCode(() => decodeSave(envelope({ version: 2, state: legacyState({ ...createInitialState(), ...patch }) })), 'invalid-state');
  });

  it('exports version 7 after migrating an older save', () => {
    const migrated = decodeSave(envelope({ version: 2, state: legacyState({ ...createInitialState(), introStep: 5 }) }));
    const bytes = encodeSave(migrated);
    const exported = JSON.parse(new TextDecoder().decode(gunzipSync(bytes)));
    expect(exported).toMatchObject({ version: 7, state: { phase: 'cabinet', introStep: 3 } });
    expect(decodeSave(bytes)).toEqual(migrated);
  });

  it('round-trips a mid-visit state and preserves the decision awaiting return', () => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'toggle-lamp', 'change-decoration', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-pressure', 'run-vision', 'stamp-unfit'] as const) {
      state = applyAction(state, action).state;
    }
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.visit).not.toBe(state.visit);
    expect(decoded.clockMinutes).toBe(491);
    expect(applyAction(decoded, 'return-document').feedback).toBe('patient-error');
  });

  it.each([
    [], ['run-vision'], ['run-pressure'],
  ] as const)('round-trips an early stamp with incomplete examinations %j', (...tests) => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', ...tests, 'stamp-fit'] as const) {
      state = applyAction(state, action).state;
    }
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.visit).toMatchObject({ decision: 'fit' });
    expect(decoded.visit).not.toBe(state.visit);
    expect(applyAction(decoded, 'return-document').feedback).toBe('patient-error');
    const examined = applyAction(applyAction(applyAction(decoded, 'run-vision').state, 'run-pressure').state, 'run-measurements').state;
    expect(decodeSave(encodeSave(examined))).toEqual(examined);
    expect(applyAction(examined, 'return-document').feedback).toBe('patient-cleared');
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: state.clockMinutes - 10 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 2, state: legacyState({ ...state, introStep: 5 }) })), 'invalid-state');
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
      for (const action of ['handle-item', 'read-manual', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-vision', 'run-pressure', 'stamp-fit', 'return-document'] as const) {
        state = applyAction(state, action).state;
        expect(decodeSave(encodeSave(state))).toEqual(state);
        // Additional time can come from earlier item handling or examinations.
        expect(decodeSave(envelope({ state: { ...state, clockMinutes: state.clockMinutes + 1 } })).clockMinutes).toBe(state.clockMinutes + 1);
        expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 841 } })), 'invalid-state');
      }
    }
    expect(state.clockMinutes).toBe(522);
    const nextDay = applyAction(state, 'next-day').state;
    expect(decodeSave(encodeSave(nextDay)).clockMinutes).toBe(477);
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 482 } })), 'invalid-state');
  });

  it('preserves v3 clocks after strict legacy validation and exports subsequent short actions as v7', () => {
    const legacy = {
      ...createInitialState(), phase: 'cabinet', introStep: 3, clockMinutes: 500,
      visit: { patientId: 0, document: 'desk', visionTested: false, pressureTested: false, decision: 'fit' },
    };
    const migrated = decodeSave(envelope({ version: 3, state: legacyState(legacy) }));
    expect(migrated).toEqual({ ...legacy, visit: { ...legacy.visit, measurementsTaken: false, certificateTaken: true, certificateNamed: true }, papers: [{ id: 1, kind: 'referral', patientId: 0, day: 1, location: 'desk' }], nextPaperId: 2 });
    const updated = applyAction(migrated, 'run-vision').state;
    expect(updated.clockMinutes).toBe(503);
    expect(decodeSave(encodeSave(updated))).toEqual(updated);
    for (const clockMinutes of [499, 501, 477]) {
      expectCode(() => decodeSave(envelope({ version: 3, state: legacyState({ ...legacy, clockMinutes }) })), 'invalid-state');
    }
    expectCode(() => decodeSave(envelope({ version: 3, state: legacyState({ ...legacy, introStep: 4 }) })), 'invalid-state');
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

describe('version 7 paperwork saves', () => {
  const run = (state: GameState, ...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
  const paperwork = (): GameState => run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-vision', 'run-pressure', 'run-measurements', 'take-paper', { type: 'write-note', paperId: 2 }, { type: 'clip-paper', paperId: 2 }, { type: 'store-paper', paperId: 2 }, 'stamp-unfit', 'return-document', { type: 'open-letter', paperId: 3 });

  it('round-trips drawer contents, complete notes, clips and opened complaint letters without sharing references', () => {
    const state = paperwork();
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.papers).not.toBe(state.papers);
    expect(decoded.papers[1]).not.toBe(state.papers[1]);
    const decodedNote = decoded.papers[1]; const originalNote = state.papers[1];
    if (decodedNote?.kind !== 'note' || originalNote?.kind !== 'note') throw new Error('Missing note fixture');
    expect(decodedNote.results).not.toBe(originalNote.results);
    decodedNote.results.vision = null;
    expect(originalNote.results.vision).toBe('pass');
    expect(state.papers[2]).toMatchObject({ kind: 'letter', sender: 'employer', opened: true });
  });

  it('migrates v4 intake into a referral with measurements still pending and preserves its clock', () => {
    const current = run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-vision', 'stamp-fit');
    const old = legacyState(current);
    const migrated = decodeSave(envelope({ version: 4, state: old }));
    expect(migrated).toEqual(current);
    expect(migrated.visit?.measurementsTaken).toBe(false);
    expect(migrated.papers[0]).toMatchObject({ kind: 'referral', patientId: 0 });
    expect(migrated.nextPaperId).toBe(2);
    expectCode(() => decodeSave(envelope({ version: 4, state: current })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 4, state: { ...old, clockMinutes: 480 } })), 'invalid-state');
  });

  it('migrates an empty v4 cabinet without inventing paperwork or spent minutes', () => {
    const current = run(createInitialState(), 'skip-intro');
    expect(decodeSave(envelope({ version: 4, state: legacyState(current) }))).toEqual(current);
  });

  it('rejects malformed, forged, duplicate or future paperwork', () => {
    const state = paperwork();
    const note = state.papers[1]!;
    const letter = state.papers[2]!;
    const malformed: unknown[] = [
      null, {}, { ...note, id: 0 }, { ...note, id: state.nextPaperId }, { ...note, day: 2 },
      { ...note, patientId: 3 }, { ...note, location: 'bin' }, { ...note, clipped: 'yes' },
      { ...note, unexpected: true }, { ...note, results: { vision: 'refer', pressure: 'pass', weight: 62, height: 164 } },
      { ...note, results: { vision: 'pass', pressure: 'pass', weight: 62, height: null } },
      { ...note, patientId: null }, { ...note, additionalWritten: false, results: { vision: null, pressure: null, weight: null, height: null } },
      { ...letter, opened: 1 }, { ...letter, sender: 'zus' }, { ...letter, kind: 'memo' },
      { ...letter, patientId: 1, sender: 'zus' },
    ];
    for (const paper of malformed) expectCode(() => decodeSave(envelope({ state: { ...state, papers: [paper] } })), 'invalid-state');
    for (const papers of [[note, note], [letter, { ...letter, id: 4 }], Array.from({ length: 4097 }, () => note)]) {
      expectCode(() => decodeSave(envelope({ state: { ...state, nextPaperId: 5, papers } })), 'invalid-state');
    }
    expectCode(() => decodeSave(envelope({ state: { ...state, nextPaperId: 3 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...state, nextPaperId: 1.5 } })), 'invalid-state');
  });

  it('rejects measurement flags without intake, necessary time, or corresponding note results', () => {
    const active = run(createInitialState(), 'skip-intro', 'call-patient');
    expectCode(() => decodeSave(envelope({ state: { ...active, visit: { ...active.visit, measurementsTaken: true } } })), 'invalid-state');
    const measured = run(active, 'take-document', 'run-measurements', 'take-paper', { type: 'write-note', paperId: 2 });
    expectCode(() => decodeSave(envelope({ state: { ...measured, clockMinutes: 481 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...measured, visit: { ...measured.visit, measurementsTaken: false } } })), 'invalid-state');
    expectCode(() => encodeSave({ ...measured, papers: measured.papers.map(paper => paper.kind === 'note' ? { ...paper, results: { ...paper.results, weight: undefined as unknown as number } } : paper) }), 'invalid-state');
  });
});

describe('version 6 certificate availability', () => {
  const act = (state: GameState, ...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
  const asV5 = (state: GameState): Record<string, unknown> => {
    const { paperClips, ...previous } = state;
    const papers = previous.papers.map(paper => {
      const { additionalWritten: _written, ...old } = paper as typeof paper & { additionalWritten?: boolean };
      return { ...old, clipped: paperClips.some(group => group.includes(paper.id)) };
    });
    if (!state.visit) return { ...previous, papers };
    const { certificateTaken: _taken, certificateNamed: _named, ...visit } = state.visit;
    return { ...previous, papers, visit };
  };

  it('round-trips a taken referral with no certificate and a separately fetched blank certificate', () => {
    const intake = act(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'run-vision');
    expect(decodeSave(encodeSave(intake))).toEqual(intake);
    expect(decodeSave(encodeSave(intake)).visit?.certificateTaken).toBe(false);
    const certificate = act(intake, 'take-certificate');
    expect(decodeSave(encodeSave(certificate))).toEqual(certificate);
    expect(decodeSave(encodeSave(certificate)).visit?.certificateTaken).toBe(true);
  });

  it('migrates v5 desk visits with their available certificate and stamp without adding time', () => {
    const stamped = act(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-certificate', 'stamp-fit');
    const old = { ...asV5(stamped), clockMinutes: 482 };
    const migrated = decodeSave(envelope({ version: 5, state: old }));
    expect(migrated).toEqual({ ...stamped, clockMinutes: 482, visit: { ...stamped.visit, certificateNamed: true } });
    expect(migrated.visit).toMatchObject({ certificateTaken: true, decision: 'fit' });
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    expect(JSON.parse(new TextDecoder().decode(gunzipSync(encodeSave(migrated)))).version).toBe(7);
    const intake = act(createInitialState(), 'skip-intro', 'call-patient', 'take-document');
    expect(decodeSave(envelope({ version: 5, state: asV5(intake) }))).toEqual({ ...intake, visit: { ...intake.visit, certificateTaken: true, certificateNamed: true } });
    const waiting = act(createInitialState(), 'skip-intro', 'call-patient');
    expect(decodeSave(envelope({ version: 5, state: asV5(waiting) }))).toEqual(waiting);
  });

  it('keeps the original exact v5 keys and clock rules during migration', () => {
    const intake = act(createInitialState(), 'skip-intro', 'call-patient', 'take-document');
    const old = asV5(intake);
    expectCode(() => decodeSave(envelope({ version: 5, state: intake })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 5, state: { ...old, clockMinutes: 480 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 5, state: { ...old, visit: { ...old.visit as object, measurementsTaken: 'yes' } } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 5, state: { ...old, unexpected: true } })), 'invalid-state');
  });

  it('rejects missing, mistyped or impossible certificate flags without allowing stamps on absent forms', () => {
    const waiting = act(createInitialState(), 'skip-intro', 'call-patient');
    const intake = act(waiting, 'take-document');
    for (const certificateTaken of [undefined, null, 1, 'true']) {
      expectCode(() => decodeSave(envelope({ state: { ...intake, visit: { ...intake.visit, certificateTaken } } })), 'invalid-state');
    }
    expectCode(() => decodeSave(envelope({ state: { ...waiting, visit: { ...waiting.visit, certificateTaken: true } } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...intake, clockMinutes: 482, visit: { ...intake.visit, decision: 'fit' } } })), 'invalid-state');
    expectCode(() => encodeSave({ ...intake, clockMinutes: 482, visit: { ...intake.visit!, decision: 'fit' } }), 'invalid-state');
  });
});

describe('version 7 document writing and bundles', () => {
  const run = (...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((state, action) => applyAction(state, action).state, createInitialState());

  it('round-trips an unwritten certificate and supplementary notes before any examination', () => {
    const state = run('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'take-paper', { type: 'write-note', paperId: 2 });
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.visit?.certificateNamed).toBe(false);
    expect(decoded.papers[1]).toMatchObject({ patientId: 0, additionalWritten: true, results: { vision: null, pressure: null, weight: null, height: null } });
    expect(decodeSave(encodeSave(applyAction(decoded, 'write-certificate').state)).visit?.certificateNamed).toBe(true);
  });

  it('round-trips clips with multiple papers and a certificate without sharing arrays', () => {
    const state = run('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'take-paper',
      { type: 'clip-document', documentId: 1 }, { type: 'join-documents', documentId: 2, targetId: 1 },
      { type: 'join-documents', documentId: 'certificate', targetId: 2 });
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.paperClips).not.toBe(state.paperClips);
    expect(decoded.paperClips[0]).not.toBe(state.paperClips[0]);
    decoded.paperClips[0]!.pop();
    expect(state.paperClips).toEqual([[1, 2, 'certificate']]);
    const unclipped = applyAction(state, { type: 'unclip-document', documentId: 'certificate' }).state;
    expect(decodeSave(encodeSave(unclipped)).paperClips).toEqual([]);
  });

  it('preserves historical v6 certificate identity, snapshots and singleton clips', () => {
    const old = {
      day: 1, money: 0, patientsProcessed: 0, phase: 'cabinet', introStep: 3, shiftCompleted: 0,
      clockMinutes: 495, lampOn: true, decoration: 'plant', nextPaperId: 3,
      visit: { patientId: 0, document: 'desk', certificateTaken: true, visionTested: true, pressureTested: true, measurementsTaken: false, decision: 'fit' },
      papers: [
        { id: 1, kind: 'referral', patientId: 0, day: 1, location: 'desk', clipped: true },
        { id: 2, kind: 'note', patientId: 0, day: 1, location: 'drawer', clipped: true, results: { vision: 'pass', pressure: null, weight: null, height: null } },
      ],
    };
    const state = decodeSave(envelope({ version: 6, state: old }));
    expect(state.clockMinutes).toBe(495);
    expect(state.visit).toEqual({ ...old.visit, certificateNamed: true });
    expect(state.papers[1]).toMatchObject({ additionalWritten: false, results: { vision: 'pass', pressure: null } });
    expect(state.paperClips).toEqual([[1], [2]]);
    expect(state.papers.every(paper => !Object.hasOwn(paper, 'clipped'))).toBe(true);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    for (const patch of [
      { paperClips: [] },
      { visit: { ...old.visit, certificateNamed: true } },
      { papers: [{ ...old.papers[1], additionalWritten: true }] },
      { papers: [{ ...old.papers[1], results: { vision: null, pressure: null, weight: null, height: null } }] },
    ]) expectCode(() => decodeSave(envelope({ version: 6, state: { ...old, ...patch } })), 'invalid-state');
  });

  it('rejects missing documents, duplicate membership, invalid groups and mixed storage', () => {
    const state = run('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'take-paper', 'take-paper', { type: 'store-paper', paperId: 3 });
    for (const paperClips of [
      null, {}, [null], [[]], [[0]], [[4]], [['document']], [[1, 1]], [[1], [1]],
      [['certificate'], ['certificate']], [[1, 3]], [['certificate', 3]], [[1.5]], [[true]],
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, paperClips } })), 'invalid-state');
    const waiting = run('skip-intro', 'call-patient');
    expectCode(() => decodeSave(envelope({ state: { ...waiting, paperClips: [['certificate']] } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...waiting, visit: { ...waiting.visit, certificateNamed: true } } })), 'invalid-state');
    for (const certificateNamed of [undefined, null, 1, 'true']) {
      expectCode(() => decodeSave(envelope({ state: { ...state, visit: { ...state.visit, certificateNamed } } })), 'invalid-state');
    }
  });

  it('rejects unnamed supplementary notes and additional fields from old paper schemas', () => {
    const state = run('skip-intro', 'call-patient', 'take-document', 'take-paper');
    const note = state.papers[1]!;
    for (const patch of [
      { additionalWritten: undefined }, { additionalWritten: null }, { additionalWritten: true },
      { patientId: 0 }, { clipped: false }, { results: { vision: 'pass', pressure: null, weight: null, height: null } },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, papers: [state.papers[0], { ...note, ...patch }] } })), 'invalid-state');
  });
});
