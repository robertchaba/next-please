import { createInitialState } from './fixtures/game';
import { gunzipSync, gzipSync, strToU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { applyAction, PATIENTS, type GameState } from '../src/core/game';
import { defaultReferral } from '../src/core/progression';
import { PATIENT_IDENTITIES, CURATED_CASE_START, CASES_PER_IDENTITY, createRoster } from '../src/core/patients';
import {
  decodeSave,
  encodeSave,
  importSave,
  MAX_EXPANDED_SAVE_BYTES,
  MAX_SAVE_BYTES,
  SaveError,
} from '../src/core/save';

function envelope(overrides: Record<string, unknown> = {}): Uint8Array {
  if (typeof overrides.version === 'number' && overrides.version <= 19 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    delete old.budgetHistory;
    overrides = { ...overrides, state: old };
  }
  if (typeof overrides.version === 'number' && overrides.version <= 18 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    delete old.pendingReferrals; delete old.referralsIssued;
    if (old.visit && typeof old.visit === 'object') for (const key of ['startedDay', 'additionalResult', 'additionalTests']) delete (old.visit as Record<string, unknown>)[key];
    overrides = { ...overrides, state: old };
  }
  if (typeof overrides.version === 'number' && overrides.version <= 17 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    if (old.visit && typeof old.visit === 'object') delete (old.visit as Record<string, unknown>).noteOrder;
    if (Array.isArray(old.papers)) for (const paper of old.papers as Record<string, unknown>[]) delete paper.noteOrder;
    overrides = { ...overrides, state: old };
  }
  if (typeof overrides.version === 'number' && overrides.version <= 16 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    if (old.settlement && typeof old.settlement === 'object') delete (old.settlement as Record<string, unknown>).weekend;
    overrides = { ...overrides, state: old };
  }
  if (typeof overrides.version === 'number' && overrides.version <= 15 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    delete old.ending;
    if (old.visit && typeof old.visit === 'object') {
      const visit = old.visit as Record<string, unknown>;
      for (const key of ['referral', 'specialist', 'specialistTaken', 'calls', 'bribe']) delete visit[key];
    }
    if (Array.isArray(old.papers)) for (const paper of old.papers as Record<string, unknown>[]) {
      delete paper.details; delete paper.calls; delete paper.bribe;
    }
    overrides = { ...overrides, state: old };
  }
  if (typeof overrides.version === 'number' && overrides.version <= 11 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    if (old.visit && typeof old.visit === 'object') { delete (old.visit as Record<string, unknown>).pressureReadings; delete (old.visit as Record<string, unknown>).pressureLatest; }
    if (Array.isArray(old.papers)) for (const paper of old.papers as Record<string, unknown>[]) {
      if (paper.kind === 'note') delete (paper.results as Record<string, unknown>).pressureReadings;
    }
    overrides = { ...overrides, state: old };
  }
  if (typeof overrides.version === 'number' && overrides.version <= 10 && overrides.state && typeof overrides.state === 'object') {
    const old = structuredClone(overrides.state) as Record<string, unknown>;
    if (old.visit && typeof old.visit === 'object') {
      const visit = old.visit as Record<string, unknown>;
      delete visit.generalTested; delete visit.examinationOrder;
    }
    if (Array.isArray(old.papers)) for (const paper of old.papers as Record<string, unknown>[]) {
      if (paper.kind !== 'note') continue;
      delete paper.examinationOrder;
      const results = paper.results as Record<string, unknown>;
      delete results.general;
      const patient = typeof paper.patientId === 'number' ? PATIENTS[paper.patientId] : null;
      if (results.vision && typeof results.vision === 'object') results.vision = patient?.vision;
      if (results.pressure && typeof results.pressure === 'object') results.pressure = patient?.pressure;
    }
    overrides = { ...overrides, state: old };
  }
  // Current fixture builders contain v9 fields; explicit old-version fixtures
  // retain exactly their historical schema before testing the old validators.
  if (typeof overrides.version === 'number' && overrides.version <= 8 && overrides.state && typeof overrides.state === 'object' && !Array.isArray(overrides.state)) {
    const old = { ...overrides.state } as Record<string, unknown>;
    for (const key of ['rngState', 'roster', 'insuranceRate', 'daily', 'settlement', 'previousMonthBalance']) delete old[key];
    overrides = { ...overrides, state: old };
  }
  return gzipSync(strToU8(JSON.stringify({
    game: 'next-please',
    version: 22,
    savedAt: '2026-10-23T12:00:00.000Z',
    state: createInitialState(),
    ...overrides,
  })));
}

function legacyState(state: object): Record<string, unknown> {
  const legacy = { ...state } as Record<string, unknown>;
  delete legacy.papers; delete legacy.nextPaperId; delete legacy.paperClips; delete legacy.drawerItems;
  if (legacy.visit && typeof legacy.visit === 'object') {
    const visit = { ...legacy.visit } as Record<string, unknown>;
    delete visit.measurementsTaken; delete visit.certificateTaken; delete visit.certificateNamed; legacy.visit = visit;
  }
  return legacy;
}

function withLegacyProgressionDefaults(state: object, legacyRng = false): unknown {
  const current = structuredClone(state) as GameState;
  if (current.visit) current.visit.noteOrder = current.visit.examinationOrder.flatMap(entry => entry === 'pressure' && current.visit!.pressureReadings.length === 2 ? ['pressure', 'pressure-repeat'] as const : [entry]);
  if (current.visit?.generalTested) current.visit.noteOrder.push('history');
  for (const paper of current.papers) if (paper.kind === 'note') {
    paper.noteOrder = paper.examinationOrder.flatMap(entry => entry === 'pressure' && paper.results.pressureReadings.length === 2 ? ['pressure', 'pressure-repeat'] as const : [entry]);
    if (paper.results.general !== null) paper.noteOrder.push('history');
  }
  return { ...current, ending: null, ...(legacyRng ? { rngState: 3477621340 } : {}),
    visit: current.visit ? { ...current.visit, startedDay: current.day, additionalResult: null, additionalTests: [], referral: defaultReferral(current.day, current.visit.patientId),
      specialist: null, specialistTaken: false, calls: { specialist: null, employer: null }, bribe: 'none' } : null,
    papers: current.papers.map(paper => paper.kind === 'referral' ? { ...paper, details: defaultReferral(paper.day, paper.patientId) }
      : paper.kind === 'note' ? { ...paper, calls: { specialist: null, employer: null }, bribe: false } : paper) };
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
    expectCode(() => decodeSave(envelope({ version: 24, state: {} })), 'unsupported-version');
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
      version: 22,
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
    expect(decoded).toEqual(withLegacyProgressionDefaults({ ...legacy, visit: { ...legacy.visit, examinationOrder: ['vision', 'pressure'] } }, true));
    expect(decoded.visit).not.toBe(state.visit);
    expect(applyAction(applyAction(decoded, 'run-measurements').state, 'return-document').state).toMatchObject({
      patientsProcessed: 1, shiftCompleted: 1, money: 0, clockMinutes: 573,
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

  it('exports version 23 after migrating an older save', () => {
    const migrated = decodeSave(envelope({ version: 2, state: legacyState({ ...createInitialState(), introStep: 5 }) }));
    const bytes = encodeSave(migrated);
    const exported = JSON.parse(new TextDecoder().decode(gunzipSync(bytes)));
    expect(exported).toMatchObject({ version: 23, state: { phase: 'cabinet', introStep: 3 } });
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
    expect(applyAction(decoded, 'return-document').feedback).toBe('patient-completed');
    const examined = applyAction(applyAction(applyAction(applyAction(decoded, 'run-general').state, 'run-vision').state, 'run-pressure').state, 'run-measurements').state;
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
        expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 1035 } })), 'invalid-state');
      }
    }
    expect(state.clockMinutes).toBe(522);
    const nextDay = applyAction(applyAction({ ...state, clockMinutes: 840 }, 'end-day').state, 'next-day').state;
    expect(decodeSave(encodeSave(nextDay)).clockMinutes).toBe(477);
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 482 } })), 'invalid-state');
  });

  it('preserves v3 clocks after strict legacy validation and exports subsequent short actions as v9', () => {
    const legacy = {
      ...createInitialState(), phase: 'cabinet', introStep: 3, clockMinutes: 500,
      visit: { patientId: 0, document: 'desk', visionTested: false, pressureTested: false, decision: 'fit' },
    };
    const migrated = decodeSave(envelope({ version: 3, state: legacyState(legacy) }));
    expect(migrated).toEqual(withLegacyProgressionDefaults({ ...legacy, visit: { ...legacy.visit, generalTested: false, examinationOrder: [], pressureReadings: [], pressureLatest: null, measurementsTaken: false, certificateTaken: true, certificateNamed: true }, papers: [{ id: 1, kind: 'referral', patientId: 0, day: 1, location: 'desk' }], nextPaperId: 2 }, true));
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
    expect(originalNote.results.vision).toEqual(PATIENTS[0]!.visionValues);
    expect(state.papers[2]).toMatchObject({ kind: 'letter', sender: 'employer', opened: true });
  });

  it('migrates v4 intake into a referral with measurements still pending and preserves its clock', () => {
    const current = run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'run-vision', 'stamp-fit');
    const old = legacyState(current);
    const migrated = decodeSave(envelope({ version: 4, state: old }));
    expect(migrated).toEqual(withLegacyProgressionDefaults(current, true));
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
    const { paperClips, drawerItems: _drawerItems, ...previous } = state;
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
    expect(migrated).toEqual(withLegacyProgressionDefaults({ ...stamped, clockMinutes: 482, visit: { ...stamped.visit, certificateNamed: true } }, true));
    expect(migrated.visit).toMatchObject({ certificateTaken: true, decision: 'fit' });
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    expect(JSON.parse(new TextDecoder().decode(gunzipSync(encodeSave(migrated)))).version).toBe(23);
    const intake = act(createInitialState(), 'skip-intro', 'call-patient', 'take-document');
    expect(decodeSave(envelope({ version: 5, state: asV5(intake) }))).toEqual(withLegacyProgressionDefaults({ ...intake, visit: { ...intake.visit, certificateTaken: true, certificateNamed: true } }, true));
    const waiting = act(createInitialState(), 'skip-intro', 'call-patient');
    expect(decodeSave(envelope({ version: 5, state: asV5(waiting) }))).toEqual(withLegacyProgressionDefaults(waiting, true));
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

  it('round-trips an unwritten certificate and identity-only notes before any examination', () => {
    const state = run('skip-intro', 'call-patient', 'take-document', 'take-certificate', 'take-paper', { type: 'write-note', paperId: 2 });
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.visit?.certificateNamed).toBe(false);
    expect(decoded.papers[1]).toMatchObject({ patientId: 0, additionalWritten: false, results: { vision: null, pressure: null, weight: null, height: null } });
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
    expect(state.visit).toEqual({ ...old.visit, startedDay: 1, additionalResult: null, additionalTests: [], referral: defaultReferral(1, 0), specialist: null, specialistTaken: false, calls: { specialist: null, employer: null }, bribe: 'none', certificateNamed: true, generalTested: false, noteOrder: ['vision', 'pressure'], examinationOrder: ['vision', 'pressure'], pressureReadings: [PATIENTS[0]!.pressureValues], pressureLatest: PATIENTS[0]!.pressureValues });
    expect(state.papers[1]).toMatchObject({ additionalWritten: false, results: { vision: PATIENTS[0]!.visionValues, pressure: null } });
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
      { additionalWritten: undefined }, { additionalWritten: null }, { patientId: null, additionalWritten: true },
      { patientId: 1 }, { clipped: false }, { results: { vision: 'pass', pressure: null, weight: null, height: null } },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, papers: [state.papers[0], { ...note, ...patch }] } })), 'invalid-state');
  });
});

describe('version 8 drawer inventory', () => {
  const stored = (): GameState => [
    'skip-intro', 'take-paper', { type: 'store-paper', paperId: 1 },
    { type: 'store-drawer-item', item: 'manual' },
    { type: 'store-drawer-item', item: 'clip' }, { type: 'store-drawer-item', item: 'clip' },
  ].reduce<GameState>((state, action) => applyAction(state, action as Parameters<typeof applyAction>[1]).state, createInitialState());

  it('round-trips separate objects and returns independent inventory data', () => {
    const state = stored();
    const decoded = decodeSave(encodeSave(state));
    expect(decoded).toEqual(state);
    expect(decoded.drawerItems).not.toBe(state.drawerItems);
    decoded.drawerItems.clips = 0;
    expect(state.drawerItems.clips).toBe(2);
    expect(JSON.parse(new TextDecoder().decode(gunzipSync(encodeSave(state)))).version).toBe(23);
  });

  it('migrates strictly validated v7 papers in filing order without inventing stored objects', () => {
    const current = stored();
    const { drawerItems: _inventory, ...old } = current;
    const migrated = decodeSave(envelope({ version: 7, state: old }));
    expect(migrated).toEqual({ ...old, drawerItems: { manual: false, clips: 0 } });
    expect(migrated.clockMinutes).toBe(current.clockMinutes);
    expectCode(() => decodeSave(envelope({ version: 7, state: current })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ version: 7, state: { ...old, paperClips: [[999]] } })), 'invalid-state');
  });

  it('rejects malformed, missing and excess inventory without weakening legacy validation', () => {
    const state = stored();
    for (const drawerItems of [undefined, null, [], {}, { manual: false }, { clips: 0 },
      { manual: 1, clips: 0 }, { manual: false, clips: '1' }, { manual: false, clips: -1 },
      { manual: false, clips: 0.5 }, { manual: false, clips: 4097 }, { manual: true, clips: 1, unknown: true }]) {
      expectCode(() => decodeSave(envelope({ state: { ...state, drawerItems } })), 'invalid-state');
    }
    expect(decodeSave(envelope({ state: { ...state, drawerItems: { manual: false, clips: 4096 } } })).drawerItems.clips).toBe(4096);
    for (const drawerItems of [{ manual: true, clips: 0 }, { manual: false, clips: 1 }]) {
      expectCode(() => decodeSave(envelope({ state: { ...createInitialState(), drawerItems } })), 'invalid-state');
    }
  });
});

describe('version 9 economic state', () => {
  const closed = () => applyAction({ ...applyAction(createInitialState(75), 'skip-intro').state, clockMinutes: 840 }, 'end-day').state;
  it('preserves an unbalanced saved queue and applies the cap only on the next workday', () => {
    const state = applyAction({ ...createInitialState(75), money: 1000 }, 'skip-intro').state;
    state.roster = state.roster.map(id => {
      const characterId = PATIENTS[id]!.characterId;
      return PATIENTS.slice(0, 553).find(patient => patient.characterId === characterId && patient.expectedDecision === 'unfit')?.id
        ?? PATIENTS.find(patient => patient.characterId === characterId)!.id;
    });
    expect(state.roster.filter(id => PATIENTS[id]!.expectedDecision === 'unfit')).toHaveLength(77);
    const loaded = decodeSave(encodeSave(state));
    expect(loaded).toEqual(state);
    const home = applyAction({ ...loaded, clockMinutes: 840 }, 'end-day').state;
    const next = applyAction(decodeSave(encodeSave(home)), 'next-day').state;
    expect(next).toEqual(applyAction(home, 'next-day').state);
    expect(next.day).toBe(2);
    expect(next.roster).toHaveLength(83);
    let unfit = 0;
    for (const [index, id] of next.roster.entries()) {
      if (PATIENTS[id]!.expectedDecision === 'unfit') unfit += 1;
      expect(100 * unfit).toBeLessThanOrEqual(33 * (index + 1));
    }
    expect(decodeSave(encodeSave(next))).toEqual(next);
  });
  it('validates new top-level fields, queues and exact consequence counters', () => {
    const state = applyAction(createInitialState(), 'skip-intro').state;
    for (const patch of [
      { rngState: -1 }, { rngState: 0x1_0000_0000 }, { rngState: .5 },
      { roster: [] }, { roster: [...state.roster.slice(1), state.roster[1]] }, { roster: state.roster.map((id, i) => i === 4 ? 999 : id) },
      { insuranceRate: 299 }, { insuranceRate: 325 }, { previousMonthBalance: null }, { previousMonthBalance: 1.5 }, { previousMonthBalance: 1_000_000_001 },
      { daily: { zusCases: 0, refusals: 0, fines: 100, insuranceIncrease: 0 } },
      { daily: { zusCases: 0, refusals: 0, fines: 0, insuranceIncrease: 50 } },
      { daily: { zusCases: 1, refusals: 0, fines: 100, insuranceIncrease: 0 } },
      { daily: { ...state.daily, unknown: true } },
      { settlement: {} }, { phase: 'home' },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, ...patch } })), 'invalid-state');
    const keys = ['rngState', 'roster', 'insuranceRate', 'daily', 'settlement', 'previousMonthBalance'];
    for (const key of keys) {
      const partial = { ...state } as Record<string, unknown>;
      delete partial[key];
      expectCode(() => decodeSave(envelope({ state: partial })), 'invalid-state');
    }
  });
  it('rejects inconsistent ledgers and future payouts instead of granting money', () => {
    const state = closed();
    for (const patch of [
      { day: 2 }, { patients: 1 }, { basePay: 999 }, { patientBonus: 50 }, { income: 1001 },
      { livingCost: 399 }, { livingCost: 801 }, { insuranceCost: 350 }, { fines: 100 },
      { expenses: 0 }, { openingBalance: 100 }, { closingBalance: state.money + 1 },
      { event: { kind: 'bribe', cost: 500 } }, { event: { kind: 'medicine', cost: -1 } },
      { event: { kind: 'medicine', cost: 500 } }, { unknown: 0 },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, settlement: { ...state.settlement, ...patch } } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 839 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...state, money: state.money + 1 } })), 'invalid-state');
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });
  it('migrates v8 strictly and preserves old paper/case identities without inventing consequences', () => {
    let state = createInitialState();
    for (const action of ['skip-intro', 'call-patient', 'take-document', 'run-vision', 'take-paper'] as const) state = applyAction(state, action).state;
    const bytes = envelope({ version: 8, state });
    const migrated = decodeSave(bytes);
    expect(migrated).toEqual(withLegacyProgressionDefaults(state, true));
    expect(migrated.daily).toEqual({ zusCases: 0, refusals: 0, fines: 0, insuranceIncrease: 0 });
    expect(migrated.settlement).toBeNull();
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    const raw = JSON.parse(new TextDecoder().decode(gunzipSync(bytes)));
    raw.state.rngState = 1;
    expectCode(() => decodeSave(gzipSync(strToU8(JSON.stringify(raw)))), 'invalid-state');
  });
  it('returns independent nested economic state and preserves future random outcomes on roundtrip', () => {
    const state = closed(), decoded = decodeSave(encodeSave(state));
    expect(decoded.roster).not.toBe(state.roster);
    expect(decoded.daily).not.toBe(state.daily);
    expect(decoded.settlement).not.toBe(state.settlement);
    expect(applyAction(decoded, 'next-day').state).toEqual(applyAction(state, 'next-day').state);
    decoded.roster.reverse(); decoded.daily.fines = 100;
    expect(state.daily.fines).toBe(0);
    expect(decoded.roster).not.toEqual(state.roster);
  });
});


describe('version 10 compatibility and rest-day invariants', () => {
  const asV9 = (state: GameState): Record<string, unknown> => {
    const previous = { ...state } as Record<string, unknown>;
    delete previous.previousMonthBalance;
    return previous;
  };

  it('preserves the exact v9 queue, RNG, papers and settled budget without inventing monthly history', () => {
    let previous = applyAction(createInitialState(), 'skip-intro').state;
    for (const action of ['call-patient', 'take-document', 'take-paper', 'run-vision', 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document'] as const) previous = applyAction(previous, action).state;
    previous = applyAction({ ...previous, clockMinutes: 840 }, 'end-day').state;
    const loaded = decodeSave(envelope({ version: 9, state: asV9(previous) }));
    expect(loaded).toEqual(withLegacyProgressionDefaults(previous));
    expect(loaded.roster).toHaveLength(28);
    expect(loaded.previousMonthBalance).toBe(0);
    expect(decodeSave(encodeSave(loaded))).toEqual(loaded);
    expect(applyAction(loaded, 'next-day').state.roster).toHaveLength(83);
  });

  it('keeps v9 bounds and exact keys even after the catalog grows', () => {
    const previous = asV9(createInitialState());
    for (const patch of [
      { previousMonthBalance: 0 },
      { roster: createInitialState(15).roster },
      { roster: (previous.roster as number[]).map((id, index) => index === 27 ? 103 : id) },
    ]) expectCode(() => decodeSave(envelope({ version: 9, state: { ...previous, ...patch } })), 'invalid-state');
  });

  it('accepts a paid historical weekend shift but never treats it as a new rest-day payout', () => {
    const saturday = applyAction({ ...applyAction(createInitialState(), 'skip-intro').state, day: 3, money: 1000, clockMinutes: 840 }, 'end-day').state;
    const loaded = decodeSave(envelope({ version: 9, state: asV9(saturday) }));
    expect(loaded.settlement?.basePay).toBe(1000);
    expect(decodeSave(encodeSave(loaded))).toEqual(loaded);
    expect(applyAction(loaded, 'end-day').state).toBe(loaded);
    expect(applyAction(loaded, 'next-day').state.settlement?.basePay).toBe(0);
  });

  it('rejects rest days outside weekends, appointments on rest days and fabricated salaries', () => {
    const friday = applyAction({ ...applyAction(createInitialState(41), 'skip-intro').state, day: 2, money: 10000, clockMinutes: 840 }, 'end-day').state;
    const saturday = applyAction(friday, 'next-day').state;
    for (const patch of [
      { day: 5, settlement: { ...saturday.settlement, day: 5 } },
      { phase: 'cabinet', settlement: null },
      { shiftCompleted: 1, patientsProcessed: 1 },
      { settlement: { ...saturday.settlement, basePay: 1000, income: 1000, closingBalance: saturday.money + 1000 }, money: saturday.money + 1000 },
    ]) expectCode(() => decodeSave(envelope({ state: { ...saturday, ...patch } })), 'invalid-state');
  });
});

describe('version 11 clinical records', () => {
  const run = (state: GameState, ...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
  const examined = (): GameState => run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-paper',
    'run-pressure', 'run-general', 'run-measurements', 'run-vision', 'run-pressure');

  it('round-trips numerical readings and first-examination order with independent nested copies', () => {
    const state = examined(), loaded = decodeSave(encodeSave(state));
    expect(loaded).toEqual(state);
    expect(loaded.visit?.examinationOrder).toEqual(['pressure', 'general', 'measurements', 'vision']);
    const note = loaded.papers.find(paper => paper.kind === 'note');
    const original = state.papers.find(paper => paper.kind === 'note');
    if (note?.kind !== 'note' || original?.kind !== 'note') throw new Error('Missing notes');
    expect(note.results).toEqual({ general: 'pass', vision: PATIENTS[0]!.visionValues,
      pressure: state.visit!.pressureReadings.at(-1), pressureReadings: state.visit!.pressureReadings, weight: 62, height: 164 });
    note.examinationOrder.reverse();
    loaded.visit!.examinationOrder.reverse();
    note.results.vision!.left = 99;
    note.results.pressure!.systolic = 99;
    expect(original.examinationOrder).toEqual(['pressure', 'general', 'measurements', 'vision']);
    expect(state.visit!.examinationOrder).toEqual(original.examinationOrder);
    expect(original.results.vision).toEqual(PATIENTS[0]!.visionValues);
    expect(original.results.pressure).toEqual(state.visit!.pressureReadings.at(-1));
  });

  it('rejects forged readings, absent results, invalid order and a different order on current notes', () => {
    const state = examined(), note = state.papers[1]!;
    if (note.kind !== 'note') throw new Error('Missing note');
    for (const patch of [
      { examinationOrder: ['pressure', 'general', 'vision', 'measurements'] },
      { examinationOrder: ['pressure', 'general', 'measurements', 'vision', 'vision'] },
      { examinationOrder: ['pressure', 'general', 'measurements'] },
      { results: { ...note.results, general: 'refer' } },
      { results: { ...note.results, pressure: { systolic: 999, diastolic: note.results.pressure!.diastolic } } },
      { results: { ...note.results, vision: { ...note.results.vision, right: -99 } } },
      { results: { ...note.results, vision: { ...note.results.vision, extra: 1 } } },
      { results: { ...note.results, general: undefined } },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, papers: [state.papers[0], { ...note, ...patch }] } })), 'invalid-state');
    for (const patch of [
      { generalTested: false }, { generalTested: 'yes' }, { examinationOrder: [] },
      { examinationOrder: ['pressure', 'general', 'measurements', 'general'] },
      { examinationOrder: ['pressure', 'general', 'measurements', 'unknown'] },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, visit: { ...state.visit, ...patch } } })), 'invalid-state');
  });

  it('requires enough elapsed action time and rejects a referral attached to an untaken intake', () => {
    const state = run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'run-general');
    expect(state.clockMinutes).toBe(484);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    expectCode(() => decodeSave(envelope({ state: { ...state, clockMinutes: 483 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...state, visit: { ...state.visit, document: 'tray' } } })), 'invalid-state');
  });

  it('migrates v10 snapshots to numbers without inventing general examinations or historical ordering', () => {
    const state = run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-pressure', 'run-vision');
    const loaded = decodeSave(envelope({ version: 10, state }));
    expect(loaded.clockMinutes).toBe(state.clockMinutes);
    expect(loaded.visit).toMatchObject({ generalTested: false, examinationOrder: ['vision', 'pressure'] });
    expect(loaded.papers[1]).toMatchObject({ examinationOrder: ['vision', 'pressure'], results: {
      general: null, vision: PATIENTS[0]!.visionValues, pressure: PATIENTS[0]!.pressureValues,
    } });
    expect(decodeSave(encodeSave(loaded))).toEqual(loaded);
    const raw = JSON.parse(new TextDecoder().decode(gunzipSync(envelope({ version: 10, state }))));
    raw.state.visit.generalTested = false;
    expectCode(() => decodeSave(gzipSync(strToU8(JSON.stringify(raw)))), 'invalid-state');
    delete raw.state.visit.generalTested;
    raw.state.papers[1].results.vision = { left: 0, right: 0 };
    expectCode(() => decodeSave(gzipSync(strToU8(JSON.stringify(raw)))), 'invalid-state');
  });

  it('rejects a partial closing transaction when the household ledger would exceed the money limit', () => {
    const state = { ...run(examined(), 'take-certificate', 'write-certificate', 'stamp-fit'),
      clockMinutes: 839, money: 1_000_000_000, rngState: 7 };
    const before = decodeSave(encodeSave(state));
    const result = applyAction(state, 'return-document');
    expect(result.feedback).toBe('limit-reached');
    expect(result.state).toBe(state);
    expect(state).toEqual(before);
    expect(state.visit?.decision).toBe('fit');
    expect(state.settlement).toBeNull();
  });

  it('preserves general-only findings and their consequences while v10 retains its original case bound', () => {
    const initial = createInitialState(16), patient = PATIENTS[303]!;
    initial.roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
    const state = run(initial, 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general');
    expect(state.papers[1]).toMatchObject({ additionalWritten: true, examinationOrder: ['general'], results: {
      general: 'refer', vision: null, pressure: null, weight: null, height: null,
    } });
    expect(decodeSave(encodeSave(state))).toEqual(state);
    expectCode(() => decodeSave(envelope({ version: 10, state: initial })), 'invalid-state');
    const closed = run({ ...state, clockMinutes: 840, rngState: 1000 }, 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    expect(closed.phase).toBe('home');
    expect(decodeSave(encodeSave(closed))).toEqual(closed);
    expect(applyAction(closed, 'end-day').state).toBe(closed);
  });
});

describe('version 12 pressure history and overtime', () => {
  const run = (state: GameState, ...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);
  const active = (): GameState => run(createInitialState(), 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-pressure');

  it('round-trips examinations and notes before intake while retaining strict old tray-visit rules', () => {
    const waiting = run(createInitialState(), 'skip-intro', 'call-patient', 'take-paper');
    for (const action of ['run-general', 'run-vision', 'run-pressure', 'run-measurements'] as const) {
      const examined = run(waiting, action);
      expect(examined.visit?.document).toBe('tray');
      expect(decodeSave(encodeSave(examined))).toEqual(examined);
      expectCode(() => decodeSave(envelope({ version: 11, state: examined })), 'invalid-state');
    }
    const examined = run(waiting, 'run-general', 'run-vision', 'run-pressure', 'run-pressure', 'run-measurements');
    expect(decodeSave(encodeSave(examined))).toEqual(examined);
    expectCode(() => decodeSave(envelope({ state: { ...examined, visit: { ...examined.visit, certificateTaken: true } } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...examined, nextPaperId: 3, papers: [...examined.papers,
      { id: 2, kind: 'referral', patientId: 0, day: 1, location: 'desk' }] } })), 'invalid-state');
    const closed = run({ ...examined, clockMinutes: 1034 }, 'handle-item');
    expect(decodeSave(encodeSave(closed))).toEqual(closed);
  });

  it('migrates strictly validated v11 measurements without inventing a second reading', () => {
    const state = active(), bytes = envelope({ version: 11, state });
    expect(decodeSave(bytes)).toEqual(withLegacyProgressionDefaults(state));
    const loaded = decodeSave(bytes);
    expect(loaded.visit!.pressureReadings).toEqual([PATIENTS[0]!.pressureValues]);
    expect(loaded.visit!.pressureLatest).toEqual(PATIENTS[0]!.pressureValues);
    const raw = JSON.parse(new TextDecoder().decode(gunzipSync(bytes)));
    raw.state.visit.pressureReadings = [];
    expectCode(() => decodeSave(gzipSync(strToU8(JSON.stringify(raw)))), 'invalid-state');
    delete raw.state.visit.pressureReadings;
    raw.state.clockMinutes = 841;
    expectCode(() => decodeSave(gzipSync(strToU8(JSON.stringify(raw)))), 'invalid-state');
  });

  it('round-trips the first two findings separately from the latest measurement and continues the same sequence', () => {
    const state = run(active(), 'run-pressure', 'run-pressure', 'run-pressure');
    const loaded = decodeSave(encodeSave(state));
    expect(loaded).toEqual(state);
    expect(run(loaded, 'run-pressure')).toEqual(run(state, 'run-pressure'));
    loaded.visit!.pressureLatest!.systolic++;
    loaded.visit!.pressureReadings[0]!.systolic++;
    const note = loaded.papers[1];
    if (note?.kind !== 'note') throw new Error('Missing note');
    note.results.pressureReadings[0]!.systolic++;
    expect(state.visit!.pressureReadings[0]).toEqual(PATIENTS[0]!.pressureValues);
    expect(state.visit!.pressureLatest).not.toEqual(loaded.visit!.pressureLatest);
  });

  it('rejects invalid or inconsistent measurement histories and latest values', () => {
    const state = run(active(), 'run-pressure'), visit = state.visit!;
    for (const patch of [
      { pressureReadings: [] },
      { pressureReadings: [...visit.pressureReadings, visit.pressureReadings[0]] },
      { pressureReadings: [visit.pressureReadings[0], visit.pressureReadings[0]] },
      { pressureReadings: [{ ...visit.pressureReadings[0], systolic: 999 }] },
      { pressureReadings: [{ ...visit.pressureReadings[0], extra: 1 }] },
      { pressureLatest: null }, { pressureLatest: { systolic: 999, diastolic: 99 } },
      { pressureLatest: { ...visit.pressureLatest, diastolic: 64.5 } },
    ]) expectCode(() => decodeSave(envelope({ state: { ...state, visit: { ...visit, ...patch } } })), 'invalid-state');
    const note = state.papers[1];
    if (note?.kind !== 'note') throw new Error('Missing note');
    const different = [...note.results.pressureReadings].reverse();
    expectCode(() => decodeSave(envelope({ state: { ...state, papers: [state.papers[0], {
      ...note, results: { ...note.results, pressureReadings: different, pressure: different.at(-1) },
    }] } })), 'invalid-state');
  });

  it('preserves overtime and interrupted notes through export and the next day without a patient bonus', () => {
    const late = { ...active(), clockMinutes: 1034 };
    expect(decodeSave(encodeSave(late))).toEqual(late);
    const closed = applyAction(late, 'run-pressure').state;
    expect(closed).toMatchObject({ phase: 'home', clockMinutes: 1035, visit: null, shiftCompleted: 0,
      settlement: { patients: 0, patientBonus: 0 } });
    expect(decodeSave(encodeSave(closed))).toEqual(closed);
    const next = run(closed, 'next-day');
    expect(decodeSave(encodeSave(next))).toEqual(next);
    expect(next.papers).toEqual(late.papers);
    expectCode(() => decodeSave(envelope({ state: { ...late, clockMinutes: 1035 } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...closed, clockMinutes: 1036 } })), 'invalid-state');
  });
});

describe('version 14 identity-only notes', () => {
  it('round-trips fresh and filed identity-only notes while preserving the older validation rules', () => {
    const state = ['skip-intro', 'call-patient', 'take-paper'].reduce<GameState>(
      (state, action) => applyAction(state, action as Parameters<typeof applyAction>[1]).state, createInitialState());
    expect(decodeSave(encodeSave(state))).toEqual(state);
    const filed = applyAction(state, { type: 'store-paper', paperId: 1 }).state;
    expect(decodeSave(encodeSave(filed))).toEqual(filed);
    for (const version of [11, 12, 13]) expectCode(() => decodeSave(envelope({ version, state })), 'invalid-state');
  });

  it('preserves old supplementary annotations without inventing a general examination', () => {
    let state = ['skip-intro', 'call-patient', 'take-document', 'take-paper'].reduce<GameState>(
      (state, action) => applyAction(state, action as Parameters<typeof applyAction>[1]).state, createInitialState());
    state = { ...state, papers: state.papers.map(paper => paper.kind === 'note' ? { ...paper, additionalWritten: true } : paper) };
    const imported = decodeSave(envelope({ version: 13, state }));
    expect(imported).toEqual(withLegacyProgressionDefaults(state));
    expect(imported.visit?.generalTested).toBe(false);
    expect(decodeSave(encodeSave(imported))).toEqual(withLegacyProgressionDefaults(state));
  });
});

describe('version 13 patient expansion', () => {
  const run = (state: GameState, ...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);

  it('preserves a v12 queue, readings and paperwork until the next workday', () => {
    const initial = createInitialState(42);
    initial.roster = Array.from({ length: 53 }, (_, characterId) => PATIENTS.find(patient => patient.characterId === characterId)!.id);
    const state = run(initial, 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general', 'run-pressure', 'run-pressure');
    const loaded = decodeSave(envelope({ version: 12, state }));
    expect(loaded).toEqual(withLegacyProgressionDefaults(state));
    expect(loaded.roster).toHaveLength(53);
    expect(decodeSave(encodeSave(loaded))).toEqual(withLegacyProgressionDefaults(state));
    const home = run({ ...loaded, clockMinutes: 840 }, 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    const next = applyAction(home, 'next-day').state;
    expect(next.roster).toHaveLength(83);
    expect(next.papers.filter(paper => paper.kind === 'note')).toEqual(loaded.papers.filter(paper => paper.kind === 'note'));
    expect(decodeSave(encodeSave(next))).toEqual(next);
  });

  it('round-trips visits and notes for all 25 new portraits', () => {
    for (let person = 0; person < 25; person++) {
      const patient = PATIENTS[328 + person * 9 + (person % 2 === 0 ? 8 : 0)]!;
      const initial = createInitialState(person);
      initial.roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
      const state = run(initial, 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general', 'run-pressure', 'run-measurements');
      expect(state.visit?.patientId).toBe(patient.id);
      expect(state.papers[1]).toMatchObject({ patientId: patient.id, results: { general: patient.general, weight: patient.weight } });
      expect(decodeSave(encodeSave(state))).toEqual(state);
    }
  });

  it('keeps v10–12 catalog bounds strict and rejects incomplete or duplicate v13 queues', () => {
    const state = createInitialState(17);
    state.roster = state.roster.map(id => PATIENTS.find(patient => patient.characterId === PATIENTS[id]!.characterId)!.id);
    for (const version of [10, 11, 12]) {
      expectCode(() => decodeSave(envelope({ version, state })), 'invalid-state');
      const oldQueue = state.roster.filter(id => PATIENTS[id]!.characterId < 53);
      const old = { ...state, phase: 'cabinet', introStep: 3, day: 2, roster: oldQueue,
        papers: [{ id: 1, kind: 'referral', day: 1, patientId: 328, location: 'drawer' }], nextPaperId: 2 };
      expectCode(() => decodeSave(envelope({ version, state: old })), 'invalid-state');
    }
    for (const roster of [state.roster.slice(0, 77), [...state.roster.slice(0, 77), state.roster[0]], [...state.roster.slice(0, 77), 553]]) {
      expectCode(() => decodeSave(envelope({ version: 13, state: { ...state, roster } })), 'invalid-state');
    }
  });
});

describe('version 15 portrait identities', () => {
  const run = (state: GameState, ...actions: Parameters<typeof applyAction>[1][]): GameState => actions.reduce((current, action) => applyAction(current, action).state, state);

  it('preserves a v14 visit, historical queue and filed notes until the next workday', () => {
    const initial = createInitialState(42);
    initial.roster = Array.from({ length: 78 }, (_, characterId) => PATIENTS.find(patient => patient.characterId === characterId)!.id);
    const state = run(initial, 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general', 'run-pressure', 'run-pressure', { type: 'store-paper', paperId: 2 });
    const loaded = decodeSave(envelope({ version: 14, state }));
    expect(loaded).toEqual(withLegacyProgressionDefaults(state));
    expect(decodeSave(encodeSave(loaded))).toEqual(withLegacyProgressionDefaults(state));
    const home = run({ ...loaded, clockMinutes: 840 }, 'take-certificate', 'write-certificate', 'stamp-fit', 'return-document');
    const next = applyAction(home, 'next-day').state;
    expect(next.roster.every(id => id >= CURATED_CASE_START)).toBe(true);
    expect(next.papers.filter(paper => paper.kind === 'note')).toEqual(loaded.papers.filter(paper => paper.kind === 'note'));
    expect(decodeSave(encodeSave(next))).toEqual(next);
  });

  it('round-trips every new identity, including its appointment and filed medical notes', () => {
    for (const identity of PATIENT_IDENTITIES) {
      const patient = PATIENTS[CURATED_CASE_START + identity.id * CASES_PER_IDENTITY + identity.variant]!;
      const initial = createInitialState(identity.id);
      initial.roster = [patient.id, ...initial.roster.filter(id => PATIENTS[id]!.characterId !== patient.characterId)];
      const state = run(initial, 'skip-intro', 'call-patient', 'take-document', 'take-paper', 'run-general', 'run-vision', 'run-pressure', 'run-measurements', { type: 'store-paper', paperId: 2 });
      expect(state.visit?.patientId).toBe(patient.id);
      expect(state.papers[1]).toMatchObject({ patientId: patient.id, location: 'drawer' });
      expect(decodeSave(encodeSave(state)), `identity ${identity.id}`).toEqual(state);
    }
  });

  it('rejects new IDs in v13/v14 envelopes and duplicate faces even when their identities differ', () => {
    const current = createInitialState(17);
    const historical = { ...current, roster: Array.from({ length: 78 }, (_, characterId) => PATIENTS.find(patient => patient.characterId === characterId)!.id) };
    for (const version of [13, 14]) {
      expect(decodeSave(envelope({ version, state: historical }))).toEqual(historical);
      expectCode(() => decodeSave(envelope({ version, state: current })), 'invalid-state');
      const filed = { ...historical, phase: 'cabinet', introStep: 3, day: 2,
        papers: [{ id: 1, kind: 'referral', day: 1, patientId: CURATED_CASE_START, location: 'drawer' }], nextPaperId: 2 };
      expectCode(() => decodeSave(envelope({ version, state: filed })), 'invalid-state');
    }
    const duplicates = [...current.roster];
    duplicates[0] = CURATED_CASE_START;
    duplicates[1] = CURATED_CASE_START + CASES_PER_IDENTITY;
    expectCode(() => decodeSave(envelope({ state: { ...current, roster: duplicates } })), 'invalid-state');
    expectCode(() => decodeSave(envelope({ state: { ...current, roster: [...current.roster.slice(1), PATIENTS.length] } })), 'invalid-state');
  });
});

describe('version 21 occupation-gated queues', () => {
  it('round-trips a shorter queue and its active visit without restricting portrait IDs to queue length', () => {
    const initial = createInitialState(17);
    expect(initial.roster).toHaveLength(83);
    expect(initial.roster.some(id => PATIENTS[id]!.characterId === 102)).toBe(true);
    const active = ['skip-intro', 'call-patient', 'take-paper', 'run-general'].reduce(
      (state, action) => applyAction(state, action as Parameters<typeof applyAction>[1]).state, initial);
    expect(decodeSave(encodeSave(active))).toEqual(active);
    for (const version of [19, 20]) expectCode(() => decodeSave(envelope({ version, state: active })), 'invalid-state');
  });

  it('preserves a full v20 queue and active uniformed patient, applying the gate on the next day', () => {
    const generated = createRoster(17);
    const patientId = generated.roster.find(id => PATIENTS[id]!.jobId === 45)!;
    const initial = { ...createInitialState(17), money: 1000, rngState: generated.seed,
      roster: [patientId, ...generated.roster.filter(id => id !== patientId)] };
    const active = ['skip-intro', 'call-patient', 'take-paper', 'run-general'].reduce(
      (state, action) => applyAction(state, action as Parameters<typeof applyAction>[1]).state, initial);
    const loaded = decodeSave(envelope({ version: 20, state: active }));
    expect(loaded).toEqual(active);
    expect(decodeSave(encodeSave(loaded))).toEqual(active);
    const home = applyAction({ ...loaded, clockMinutes: 1034 }, 'handle-item').state;
    const next = applyAction(home, 'next-day').state;
    expect(next.day).toBe(2);
    expect(next.roster).toHaveLength(83);
    expect(next.roster.every(id => ![18, 45, 46, 47].includes(PATIENTS[id]!.jobId))).toBe(true);
  });

  it('still rejects empty work queues, oversized queues, duplicate portraits and inconsistent visits', () => {
    const initial = createInitialState(17);
    for (const roster of [[], [...initial.roster, initial.roster[0]], Array(104).fill(initial.roster[0]), [...initial.roster.slice(0, -1), PATIENTS.length]]) {
      expectCode(() => decodeSave(envelope({ state: { ...initial, roster } })), 'invalid-state');
    }
    const active = applyAction(applyAction(initial, 'skip-intro').state, 'call-patient').state;
    expectCode(() => decodeSave(envelope({ state: { ...active, visit: { ...active.visit!, patientId: initial.roster[1] } } })), 'invalid-state');
  });
});
