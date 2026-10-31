import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, type GameState } from '../src/core/game';
import { newspaperCopy } from '../src/core/newspaper';
import { decodeSave, encodeSave } from '../src/core/save';
import { DRAWER_NEWSPAPER_BATCH_SIZE, drawerButtons, drawerNewspapers, drawerSheets } from '../src/render/drawer';
import { dropTargetRect, DROP_ZONES } from '../src/core/desk';
import { historicalState } from './fixtures/legacy-budget';

const start = () => next(applyAction({ ...createInitialState(120), money: 100000 }, 'skip-intro').state);
function next(state: GameState): GameState {
  let result = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
  do { result = applyAction(result, 'next-day').state; } while (result.phase === 'home');
  return result;
}
const file = (state: unknown, version = 35) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-31T12:00:00.000Z', state: version < 35 ? historicalState(state, 34) : state })));

describe('physical newspaper copies', () => {
  it('keeps dated editions across weekdays, weekends, both drawers and save imports', () => {
    let state = start();
    const original = structuredClone(state.newspaperCopies[0]!);
    const arrival = state.clockMinutes;
    state = applyAction(state, { type: 'store-newspaper', day: 2, drawer: 'drawer-2' }).state;
    expect(state.clockMinutes).toBe(arrival + 1);
    state = next(next(state));
    expect(state.day).toBe(6);
    expect(state.newspaperCopies.map(copy => copy.day)).toEqual([2, 5, 6]);
    expect(state.newspaperCopies[0]).toEqual({ ...original, location: 'drawer-2' });
    expect(decodeSave(encodeSave(state))).toEqual(state);
    const selection = structuredClone(state.newspaper);
    const before = state.clockMinutes;
    expect(applyAction(state, { type: 'retrieve-newspaper', day: 2, drawer: 'drawer' }).state).toBe(state);
    state = applyAction(state, { type: 'retrieve-newspaper', day: 2, drawer: 'drawer-2' }).state;
    state = applyAction(state, { type: 'store-newspaper', day: 2, drawer: 'drawer' }).state;
    expect(state.clockMinutes).toBe(before + 2);
    expect(state.newspaperCopies[0]).toEqual({ ...original, location: 'drawer' });
    expect(state.newspaper).toEqual(selection);
  });

  it('discards only the held edition, preserves the publication pool, and never resurrects it on load', () => {
    let state = next(start());
    const selection = structuredClone(state.newspaper);
    const first = structuredClone(state.newspaperCopies[0]);
    const before = state.clockMinutes;
    state = applyAction(state, { type: 'trash-newspaper', day: 5 }).state;
    expect(state.clockMinutes).toBe(before + 1);
    expect(state.newspaperCopies).toEqual([first]);
    expect(state.newspaper).toEqual(selection);
    expect(decodeSave(encodeSave(state))).toEqual(state);
    expect(applyAction(state, { type: 'retrieve-newspaper', day: 5 }).state).toBe(state);
    expect(applyAction(state, { type: 'trash-newspaper', day: 5 }).state).toBe(state);
    const tomorrow = next(state);
    expect(tomorrow.newspaperCopies.map(copy => copy.day)).toEqual([2, 6]);
    state = applyAction(state, { type: 'store-newspaper', day: 2 }).state;
    expect(applyAction(state, { type: 'trash-newspaper', day: 2 }).state).toBe(state);
  });

  it('migrates v32 with its exact issue and RNG, creating only the recoverable latest copy', () => {
    const current = next(start());
    const { newspaperCopies: _copies, ...old } = current;
    const migrated = decodeSave(file(historicalState(old, 32), 32));
    const newspaper = { ...old.newspaper, classifiedIds: [] };
    expect(migrated).toEqual({ ...old, newspaper, newspaperCopies: [newspaperCopy(newspaper, old.day)] });
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    expect(() => decodeSave(file(current, 32))).toThrow();
    // Historical intro saves can retain a later civil day and still re-export.
    const { newspaperCopies: _introCopies, ...intro } = { ...createInitialState(12), day: 8 };
    const loadedIntro = decodeSave(file(historicalState(intro, 32), 32));
    expect(decodeSave(encodeSave(loadedIntro))).toEqual(loadedIntro);
  });

  it('rejects duplicate dates, invented articles, wrong current content, locations and extra fields', () => {
    const state = next(next(start())), copy = state.newspaperCopies.at(-1)!;
    for (const copies of [null, [{ ...copy, extra: true }], [copy, copy], [{ ...copy, day: 3 }],
      [{ ...copy, day: state.day + 1 }], [{ ...copy, location: 'trash' }], [{ ...copy, articleIds: ['invented', 'bread', 'chess'] }],
      [{ ...copy, articleIds: [...copy.articleIds].reverse() }]]) {
      expect(() => decodeSave(file({ ...state, newspaperCopies: copies }))).toThrow();
    }
    expect(() => decodeSave(file({ ...createInitialState(12), newspaperCopies: [{ ...copy, day: 1, location: 'drawer' }] }))).toThrow();
    const loaded = decodeSave(encodeSave(state));
    loaded.newspaperCopies[0]!.articleIds.pop();
    expect(loaded.newspaperCopies[0]!.articleIds).not.toEqual(state.newspaperCopies[0]!.articleIds);
  });

  it('paginates stored newspapers independently of clinical files, with dated retrieval controls', () => {
    let state = start();
    const count = DRAWER_NEWSPAPER_BATCH_SIZE * 2 + 3;
    for (let i = 0; i < count; i++) {
      state = applyAction(state, { type: 'store-newspaper', day: state.day, drawer: 'drawer-2' }).state;
      if (i < count - 1) state = next(state);
    }
    expect(drawerSheets(state, 0, 'drawer').pages).toBe(1);
    expect(drawerSheets(state, 0, 'drawer-2').pages).toBe(3);
    expect(drawerNewspapers(state, 0, 'drawer-2')).toHaveLength(DRAWER_NEWSPAPER_BATCH_SIZE);
    expect(drawerNewspapers(state, 2, 'drawer-2')).toHaveLength(3);
    const days = state.newspaperCopies.map(copy => copy.day);
    state = { ...state, newspaperCopies: [...state.newspaperCopies].reverse() };
    expect([0, 1, 2].flatMap(page => drawerNewspapers(state, page, 'drawer-2').map(({ copy }) => copy.day))).toEqual(days);
    expect(state.newspaperCopies.map(copy => copy.day)).toEqual([...days].reverse());
    expect(drawerSheets(state, 99, 'drawer-2').current).toBe(2);
    expect(drawerButtons(state, 'pl', 0, () => {}, 'drawer-2').find(button => button.id === 'drawer-newspaper-2')?.label).toContain('04.11.1983');
    for (const target of ['drawer', 'drawer-2', 'trash'] as const) expect(dropTargetRect(target, 'newspaper-2')).toEqual(DROP_ZONES[target]);
  });

  it('overlaps generated newspapers while keeping each exposed edge selectable and clear of other objects', () => {
    let state = start();
    for (let i = 0; i < DRAWER_NEWSPAPER_BATCH_SIZE; i++) {
      state = applyAction(state, { type: 'store-newspaper', day: state.day }).state;
      if (i < DRAWER_NEWSPAPER_BATCH_SIZE - 1) state = next(state);
    }
    state = applyAction(state, { type: 'store-drawer-item', item: 'manual' }).state;
    state = applyAction(state, { type: 'store-drawer-item', item: 'clip' }).state;
    const stack = drawerNewspapers(state, 0, 'drawer');
    const controls = drawerButtons(state, 'pl', 0, () => {});
    for (const [index, { bounds, artwork, copy }] of stack.entries()) {
      expect(controls.find(control => control.id === `drawer-newspaper-${copy.day}`)).toMatchObject(bounds);
      expect(bounds.x).toBeGreaterThan(425); // Keep the whole stack beyond the wooden divider.
      expect(artwork.y + artwork.h).toBeLessThan(216); // The rulebook begins here.
      for (const other of controls.filter(control => control.id !== `drawer-newspaper-${copy.day}`)) {
        const overlap = bounds.x < other.x + other.w && bounds.x + bounds.w > other.x
          && bounds.y < other.y + other.h && bounds.y + bounds.h > other.y;
        expect(overlap, `${copy.day}/${other.id}`).toBe(false);
      }
      if (index + 1 < stack.length) {
        const next = stack[index + 1]!;
        expect(bounds.y + bounds.h).toBe(next.artwork.y);
        expect(artwork.y + artwork.h).toBeGreaterThan(next.artwork.y);
      } else expect(bounds).toEqual(artwork);
    }
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it('observes clinic closing before storing, retrieving or discarding a copy', () => {
    for (const type of ['store-newspaper', 'retrieve-newspaper', 'trash-newspaper'] as const) {
      let state = start();
      if (type === 'retrieve-newspaper') state = applyAction(state, { type: 'store-newspaper', day: 2 }).state;
      const copies = structuredClone(state.newspaperCopies);
      const result = applyAction({ ...state, clockMinutes: 1034 }, { type, day: 2 });
      expect(result.state.phase).toBe('home');
      expect(result.state.newspaperCopies).toEqual(copies);
    }
  });
});
