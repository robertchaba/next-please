import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, advanceClinicTime, DRAWERS, GAME_LIMITS, type GameAction, type GameState } from '../src/core/game';
import { createInitialState } from './fixtures/game';
import { decodeSave, encodeSave } from '../src/core/save';
import { drawerButtons, drawerSheets } from '../src/render/drawer';
import { CABINET_HOTSPOTS, containsPoint, dropTargetRect } from '../src/core/desk';

const act = (state: GameState, ...actions: GameAction[]) => actions.reduce((current, action) => applyAction(current, action).state, state);
const cabinet = () => act(createInitialState(), 'skip-intro');
const file = (state: unknown) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version: 34, savedAt: '2026-10-31T12:00:00.000Z', state })));

describe.each(DRAWERS)('%s independent storage', drawer => {
  const other = drawer === 'drawer' ? 'drawer-2' : 'drawer';

  it('files bundles in the chosen drawer, paginates independently and transfers without splitting', () => {
    let state = act(cabinet(), 'take-paper', 'take-paper', { type: 'clip-document', documentId: 1 },
      { type: 'join-documents', documentId: 2, targetId: 1 }, { type: 'store-paper', paperId: 2, drawer });
    for (let id = 3; id <= 27; id++) state = act(state, 'take-paper', { type: 'store-paper', paperId: id, drawer });
    state = act(state, 'take-paper', { type: 'store-paper', paperId: 28, drawer: other });
    expect(drawerSheets(state, 0, drawer).pages).toBe(2);
    expect(drawerSheets(state, 1, drawer).visible.map(entry => entry.paper.id)).toEqual([26, 27]);
    expect(drawerSheets(state, 0, other).papers.map(paper => paper.id)).toEqual([28]);
    state = act(decodeSave(encodeSave(state)), { type: 'retrieve-paper', paperId: 1 }, { type: 'store-paper', paperId: 1, drawer: other });
    expect(drawerSheets(state, 0, other).papers.map(paper => paper.id)).toEqual([28, 1]);
    expect(state.papers.filter(paper => paper.id <= 2).map(paper => paper.location)).toEqual([other, other]);
    expect(state.paperClips).toEqual([[1, 2]]);
  });

  it('keeps one rulebook, independent clips and both inventories through the next working day', () => {
    const original = cabinet();
    const stored = act(original, { type: 'store-drawer-item', item: 'manual', drawer },
      { type: 'store-drawer-item', item: 'clip', drawer }, { type: 'store-drawer-item', item: 'clip', drawer: other });
    expect(original.drawerItems[drawer]).toEqual({ manual: false, clips: 0 });
    expect(applyAction(stored, { type: 'store-drawer-item', item: 'manual', drawer: other }).state).toBe(stored);
    expect(applyAction(stored, { type: 'retrieve-drawer-item', item: 'manual', drawer: other }).feedback).toBe('item-missing');
    const moved = act(stored, { type: 'retrieve-drawer-item', item: 'manual', drawer },
      { type: 'store-drawer-item', item: 'manual', drawer: other }, { type: 'retrieve-drawer-item', item: 'clip', drawer });
    expect(moved.drawerItems[drawer]).toEqual({ manual: false, clips: 0 });
    expect(moved.drawerItems[other]).toEqual({ manual: true, clips: 1 });
    const next = act({ ...moved, clockMinutes: 840, money: 10000 }, 'end-day', 'next-day');
    expect(next.drawerItems).toEqual(moved.drawerItems);
    expect(decodeSave(encodeSave(next)).drawerItems).toEqual(moved.drawerItems);
  });

  it('updates notes filed in either drawer and never binds stored blank supplies', () => {
    const state = act(cabinet(), 'take-paper', { type: 'store-paper', paperId: 1, drawer }, 'call-patient',
      'take-paper', { type: 'store-paper', paperId: 2, drawer }, 'run-general', 'run-pressure');
    const saved = decodeSave(encodeSave(state));
    expect(saved.papers[0]).toMatchObject({ patientId: null, location: drawer });
    expect(saved.papers[1]).toMatchObject({ patientId: state.visit!.patientId, location: drawer,
      noteOrder: ['general', 'history', 'pressure'] });
  });

  it('accepts, moves and refunds cash without a second payment; settlement credits once', () => {
    const offer = act({ ...cabinet(), day: 8, money: 5000, shiftCompleted: 1, patientsProcessed: 1, clockMinutes: 484 }, 'call-patient');
    expect(offer.visit?.bribe).toBe('offered');
    const stored = act(offer, { type: 'accept-bribe', location: drawer });
    expect(drawerButtons(stored, 'pl', 0, () => {}, drawer).some(button => button.id === 'drawer-banknote')).toBe(true);
    expect(drawerButtons(stored, 'pl', 0, () => {}, other).some(button => button.id === 'drawer-banknote')).toBe(false);
    const moved = act(decodeSave(encodeSave(stored)), { type: 'retrieve-banknote', banknoteId: 1 },
      { type: 'store-banknote', banknoteId: 1, drawer: other });
    expect(moved.money).toBe(5000);
    expect(moved.bribeIncome).toBe(100);
    expect(moved.banknotes[0]?.location).toBe(other);
    const refunded = act(moved, { type: 'retrieve-banknote', banknoteId: 1 }, { type: 'return-banknote', banknoteId: 1 });
    expect(refunded.banknotes).toEqual([]);
    expect(refunded.bribeIncome).toBe(0);
    expect(refunded.money).toBe(5000);
    const home = advanceClinicTime(moved, 1000).state;
    expect(home.banknotes).toEqual([]);
    expect(home.settlement?.bribeIncome).toBe(100);
    expect(decodeSave(encodeSave(home))).toEqual(home);
  });
});

it('validates each inventory, the single rulebook and exact clip-group locations before import', () => {
  const state = act(cabinet(), 'take-paper', 'take-paper', { type: 'clip-document', documentId: 1 },
    { type: 'join-documents', documentId: 2, targetId: 1 }, { type: 'store-paper', paperId: 1, drawer: 'drawer-2' });
  const bad = [
    { ...state, papers: state.papers.map(paper => ({ ...paper, location: paper.id === 1 ? 'drawer' : 'drawer-2' })) },
    { ...state, papers: state.papers.map(paper => ({ ...paper, location: 'drawer-3' })) },
    { ...state, drawerItems: { drawer: { manual: true, clips: 0 }, 'drawer-2': { manual: true, clips: 0 } } },
    { ...state, drawerItems: { drawer: { manual: false, clips: 0 } } },
    ...[null, {}, { manual: false, clips: -1 }, { manual: false, clips: 0.5 }, { manual: false, clips: 4097 },
      { manual: false, clips: 1, extra: true }].map(inventory => ({ ...state, drawerItems: { ...state.drawerItems, 'drawer-2': inventory } })),
    { ...createInitialState(), drawerItems: { ...state.drawerItems, 'drawer-2': { manual: false, clips: 1 } } },
  ];
  for (const candidate of bad) expect(() => decodeSave(file(candidate))).toThrowError(expect.objectContaining({ code: 'invalid-state' }));
  const full = { ...state, drawerItems: { drawer: { manual: false, clips: GAME_LIMITS.drawerClips }, 'drawer-2': { manual: true, clips: GAME_LIMITS.drawerClips } } };
  const restored = decodeSave(encodeSave(full));
  expect(restored).toEqual(full);
  restored.drawerItems['drawer-2'].clips--;
  expect(full.drawerItems['drawer-2'].clips).toBe(GAME_LIMITS.drawerClips);
  for (const drawer of DRAWERS) expect(applyAction(full, { type: 'store-drawer-item', item: 'clip', drawer }).state).toBe(full);
});

it('gives each pixel along the desk front exactly one compatible drop target', () => {
  for (const held of ['paper-1', 'incoming-referral', 'manual', 'clip-1', 'banknote-1'] as const) {
    for (let x = 210; x < 570; x++) {
      const targets = [...DRAWERS, 'trash'] as const;
      expect(targets.filter(target => containsPoint(dropTargetRect(target, held), { x, y: 310 })).length).toBeLessThanOrEqual(1);
    }
  }
  for (const drawer of DRAWERS) {
    for (const held of [null, 'stamp-fit', 'stamp-unfit', 'document'] as const) expect(dropTargetRect(drawer, held)).toEqual(CABINET_HOTSPOTS[drawer]);
    expect(dropTargetRect(drawer, 'paper-1', ['paper-1', 'document'])).toEqual(CABINET_HOTSPOTS[drawer]);
  }
});
