import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { applyAction, type GameState } from '../src/core/game';
import { CLASSIFIEDS, CLASSIFIED_CALL_RESULTS, classifiedPhone, createNewspaper, nextNewspaper } from '../src/core/newspaper';
import { decodeSave, encodeSave } from '../src/core/save';
import { newspaperClassifiedLayout, newspaperDescription, newspaperPageCount, NEWSPAPER_BODY_BOTTOM, NEWSPAPER_COLUMN_WIDTH, NEWSPAPER_TITLE_WIDTH } from '../src/render/newspaper';
import { measureText, measureDocumentText } from '../src/render/font';
import { translations } from '../src/i18n';
import { historicalState } from './fixtures/legacy-budget';

const file = (state: unknown, version = 35) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-31T12:00:00.000Z', state })));
function next(state: GameState): GameState {
  let result = applyAction({ ...state, clockMinutes: 840 }, 'end-day').state;
  do { result = applyAction(result, 'next-day').state; } while (result.phase === 'home');
  return result;
}
function ready(): GameState {
  let state = applyAction({ ...createInitialState(120), money: 100000 }, 'skip-intro').state;
  for (let i = 0; i < 3; i++) state = next(state);
  while (!state.newspaper.classifiedIds.some(id => classifiedPhone(id))) state = next(state);
  return state;
}

describe('classified newspaper page', () => {
  it('adds one page to about 75% of editions, samples 3–4 distinct ads, and allows no telephone contacts', () => {
    let issue = createNewspaper(120), editions = 0, withoutPhones = 0, phoneAds = 0, totalAds = 0;
    const seen = new Set<string>(), sizes = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const ids = issue.classifiedIds;
      expect([0, 3, 4]).toContain(ids.length);
      expect(new Set(ids).size).toBe(ids.length);
      expect(newspaperPageCount(issue)).toBe(issue.articleIds.length + Number(ids.length > 0));
      sizes.add(ids.length);
      if (ids.length) {
        editions++;
        const phoneCount = ids.filter(id => classifiedPhone(id)).length;
        withoutPhones += Number(phoneCount === 0);
        phoneAds += phoneCount; totalAds += ids.length;
        ids.forEach(id => seen.add(id));
      }
      const following = nextNewspaper(issue.rngState, issue);
      expect(following).toEqual(nextNewspaper(issue.rngState, structuredClone(issue)));
      issue = following;
    }
    expect(editions / 2000).toBeGreaterThan(0.71);
    expect(editions / 2000).toBeLessThan(0.79);
    expect(sizes).toEqual(new Set([0, 3, 4]));
    expect(seen.size).toBe(CLASSIFIEDS.length);
    expect(withoutPhones).toBeGreaterThan(0);
    const catalogShare = CLASSIFIEDS.filter(ad => ad.phone).length / CLASSIFIEDS.length;
    expect(catalogShare).toBeLessThanOrEqual(0.25);
    expect(phoneAds / totalAds).toBeCloseTo(catalogShare, 1);
  });

  it('keeps the expanded catalog below 25% phone contacts, with few numbered reply boxes', () => {
    expect(CLASSIFIEDS).toHaveLength(166);
    expect(new Set(CLASSIFIEDS.map(ad => ad.id)).size).toBe(CLASSIFIEDS.length);
    const phones = CLASSIFIEDS.flatMap(ad => ad.phone ? [ad.phone] : []);
    expect(phones).toHaveLength(32);
    expect(new Set(phones).size).toBe(phones.length);
    for (const locale of ['pl', 'en'] as const) {
      const copy = Object.values(translations[locale].newspaper.classifieds);
      expect(new Set(copy).size).toBe(CLASSIFIEDS.length);
      expect(copy.filter(text => /skrytka|box \d/i.test(text))).toHaveLength(4);
    }
  });

  it('offers the exchange tone on day one and calls printed numbers after the first delivery on day two', () => {
    let initial = applyAction(createInitialState(0), 'skip-intro').state;
    for (let seed = 1; seed < 256 && !initial.newspaper.classifiedIds.some(id => classifiedPhone(id)); seed++) {
      initial = applyAction(createInitialState(seed), 'skip-intro').state;
    }
    const id = initial.newspaper.classifiedIds.find(id => classifiedPhone(id))!;
    expect(id).toBeDefined();
    expect(initial.day).toBe(1);
    const tone = applyAction(initial, 'use-phone');
    expect(tone.feedback).toBe('phone-ready');
    expect(tone.state.clockMinutes).toBe(initial.clockMinutes + 1);
    expect(tone.state.rngState).toBe(initial.rngState);
    expect(applyAction(tone.state, { type: 'call-classified', day: 1, classifiedId: id }).state).toBe(tone.state);
    const second = next({ ...tone.state, money: 100000 });
    expect(second.day).toBe(2);
    const action = { type: 'call-classified', day: 2, classifiedId: id } as const;
    const call = applyAction(second, action);
    expect(CLASSIFIED_CALL_RESULTS).toContain(call.feedback);
    expect(call.state.clockMinutes).toBe(second.clockMinutes + 3);
    expect(call.state.visit).toBeNull();
    expect(call.state.newspaper).toBe(initial.newspaper);
    expect(call.state.papers).toBe(initial.papers);
    expect(call.state.money).toBe(second.money);
    expect(decodeSave(encodeSave(call.state))).toEqual(call.state);
    expect(applyAction(decodeSave(encodeSave(second)), action)).toEqual(call);
  });

  it('retains ads in old copies through both drawers, later issues and export', () => {
    let state = ready();
    const day = state.day, original = structuredClone(state.newspaper);
    state = applyAction(state, { type: 'store-newspaper', day, drawer: 'drawer-2' }).state;
    state = next(next(state));
    state = decodeSave(encodeSave(state));
    state = applyAction(state, { type: 'retrieve-newspaper', day, drawer: 'drawer-2' }).state;
    expect(state.newspaperCopies.find(copy => copy.day === day)).toMatchObject({ classifiedIds: original.classifiedIds, articleIds: original.articleIds, location: 'desk' });
    state = applyAction(state, { type: 'store-newspaper', day, drawer: 'drawer' }).state;
    expect(decodeSave(encodeSave(state))).toEqual(state);
  });

  it('draws generic outcomes on each attempt, consumes three minutes and preserves clinical records and the edition', () => {
    const initial = ready();
    const id = initial.newspaper.classifiedIds.find(id => classifiedPhone(id))!;
    const action = { type: 'call-classified', day: initial.day, classifiedId: id } as const;
    let state = applyAction(initial, 'call-patient').state;
    state = applyAction(state, 'take-paper').state;
    const outcomes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const result = applyAction(state, action);
      expect(result).toEqual(applyAction(decodeSave(encodeSave(state)), action));
      expect(CLASSIFIED_CALL_RESULTS).toContain(result.feedback);
      expect(result.state.clockMinutes).toBe(state.clockMinutes + 3);
      expect(result.state.visit).toBe(state.visit);
      expect(result.state.papers).toBe(state.papers);
      expect(result.state.newspaper).toBe(state.newspaper);
      expect(result.state.newspaperCopies).toBe(state.newspaperCopies);
      expect(result.state.money).toBe(state.money);
      outcomes.add(result.feedback);
      state = result.state;
    }
    expect(outcomes.size).toBe(CLASSIFIED_CALL_RESULTS.length);
    // No patient is required, and stored, discarded or non-telephone ads cannot be called.
    expect(CLASSIFIED_CALL_RESULTS).toContain(applyAction(initial, action).feedback);
    const nonPhone = initial.newspaper.classifiedIds.find(id => !classifiedPhone(id))!;
    expect(applyAction(initial, { ...action, classifiedId: nonPhone }).state).toBe(initial);
    expect(applyAction(initial, { ...action, day: 999 }).state).toBe(initial);
    const stored = applyAction(initial, { type: 'store-newspaper', day: initial.day }).state;
    expect(applyAction(stored, action).state).toBe(stored);
    const trashed = applyAction(initial, { type: 'trash-newspaper', day: initial.day }).state;
    expect(applyAction(trashed, action).state).toBe(trashed);
    const early = { ...initial, day: 1, newspaperCopies: [{ ...initial.newspaperCopies.at(-1)!, day: 1 }] };
    expect(CLASSIFIED_CALL_RESULTS).toContain(applyAction(early, { ...action, day: 1 }).feedback);
    const closing = applyAction({ ...initial, clockMinutes: 1033 }, action);
    expect(closing.state.phase).toBe('home');
    expect(closing.state.newspaper).toEqual(initial.newspaper);
  });

  it('migrates old issues without retroactively inserting ads or changing either saved RNG', () => {
    const state = ready();
    for (const version of [32, 33]) {
      const old = historicalState(state, version);
      const migrated = decodeSave(file(old, version));
      expect(migrated.newspaper).toEqual({ ...state.newspaper, classifiedIds: [] });
      expect(migrated.rngState).toBe(state.rngState);
      expect(migrated.newspaperCopies.every(copy => copy.classifiedIds.length === 0)).toBe(true);
      expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
      expect(() => decodeSave(file(state, version))).toThrow();
    }
  });

  it('rejects malformed or mismatched ads atomically and copies every validated array', () => {
    const state = ready(), original = structuredClone(state), copy = state.newspaperCopies.at(-1)!;
    for (const classifiedIds of [undefined, null, 'books', ['books'], ['books', 'jars'], ['books', 'books', 'jars'],
      ['books', 'jars', 'invented'], CLASSIFIEDS.slice(0, 5).map(ad => ad.id)]) {
      expect(() => decodeSave(file({ ...state, newspaper: { ...state.newspaper, classifiedIds } }))).toThrow();
      expect(() => decodeSave(file({ ...state, newspaperCopies: [{ ...copy, classifiedIds }] }))).toThrow();
    }
    expect(() => decodeSave(file({ ...state, newspaperCopies: [{ ...copy, classifiedIds: [] }] }))).toThrow();
    expect(() => decodeSave(file({ ...state, newspaper: { ...state.newspaper, extra: true } }))).toThrow();
    expect(() => decodeSave(file({ ...state, newspaperCopies: [{ ...copy, extra: true }] }))).toThrow();
    expect(state).toEqual(original);
    const loaded = decodeSave(encodeSave(state));
    loaded.newspaper.classifiedIds.pop(); loaded.newspaperCopies.at(-1)!.classifiedIds.pop();
    expect(state).toEqual(original);
  });

  it('fits every complete ad and telephone target at 1× in both languages, with the short drawer title', () => {
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale].newspaper;
      expect(Object.keys(t.classifieds)).toEqual(CLASSIFIEDS.map(ad => ad.id));
      expect(measureText(t.classifiedTitle)).toBeLessThanOrEqual(NEWSPAPER_TITLE_WIDTH);
      expect(measureDocumentText(`${t.shortTitle} 03.11.1983`)).toBeLessThanOrEqual(120);
      for (const ad of CLASSIFIEDS) {
        for (const layout of newspaperClassifiedLayout([ad.id, ad.id, ad.id, ad.id], locale)) {
          expect(layout.lines.join(' ')).toBe(t.classifieds[ad.id]);
          expect(layout.bottom, `${locale} ${ad.id}`).toBeLessThanOrEqual(NEWSPAPER_BODY_BOTTOM);
          expect.soft(layout.lines.length, `${locale} ${ad.id}`).toBeLessThanOrEqual(3);
          for (const line of layout.lines) expect(measureDocumentText(line)).toBeLessThanOrEqual(NEWSPAPER_COLUMN_WIDTH);
          if (layout.phoneRect) expect(layout.phoneRect.w).toBeLessThanOrEqual(NEWSPAPER_COLUMN_WIDTH);
        }
      }
      const state = ready(), page = newspaperDescription(state.newspaper, state.day, locale, state.newspaper.articleIds.length);
      for (const id of state.newspaper.classifiedIds) expect(page).toContain(t.classifieds[id]);
    }
  });
});
