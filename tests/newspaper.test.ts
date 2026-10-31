import { historicalState } from './fixtures/legacy-budget';
import { createInitialState } from './fixtures/routine';
import { describe, expect, it } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';
import { advanceClinicTime, applyAction, type GameState } from '../src/core/game';
import { createNewspaper, nextNewspaper, newspaperCopy, PRESS_ARTICLES } from '../src/core/newspaper';
import { decodeSave, encodeSave } from '../src/core/save';
import { NEWSPAPER_BODY_BOTTOM, NEWSPAPER_COLUMN_WIDTH, NEWSPAPER_TITLE_WIDTH, newspaperArticleLayout, newspaperDescription } from '../src/render/newspaper';
import { measureText, measureDocumentText } from '../src/render/font';
import { translations } from '../src/i18n';
import { createDeskState, itemRect, moveDeskItem, pickUpDeskItem, NEWSPAPER_OPEN_POSITION, NEWSPAPER_OPEN_SIZE } from '../src/core/desk';

const nextDay = (state: GameState) => applyAction(applyAction({ ...state, clockMinutes: 840 }, 'end-day').state, 'next-day').state;
const file = (state: unknown, version = 35) => gzipSync(strToU8(JSON.stringify({ game: 'next-please', version, savedAt: '2026-10-31T12:00:00.000Z', state: version < 35 ? historicalState(state, 34) : state })));

describe('morning newspaper', () => {
  it('delivers the first copy on 4 November, preserving the pending issue through saves', () => {
    const intro = createInitialState(120);
    expect(intro.newspaperCopies).toEqual([]);
    expect(decodeSave(encodeSave(intro))).toEqual(intro);
    const first = applyAction({ ...decodeSave(encodeSave(intro)), money: 100000 }, 'skip-intro').state;
    expect(first.day).toBe(1);
    expect(first.newspaperCopies).toEqual([]);
    for (const type of ['store-newspaper', 'retrieve-newspaper', 'trash-newspaper'] as const) {
      expect(applyAction(first, { type, day: 1 }).state).toBe(first);
    }
    const second = nextDay(decodeSave(encodeSave(first)));
    expect(second.day).toBe(2);
    expect(second.newspaper).toEqual(intro.newspaper);
    expect(second.newspaperCopies).toEqual([newspaperCopy(intro.newspaper, 2)]);
    expect(decodeSave(encodeSave(second))).toEqual(second);
    let monday = nextDay(second);
    while (monday.phase === 'home') monday = applyAction(monday, 'next-day').state;
    expect(monday.newspaperCopies.map(copy => copy.day)).toEqual([2, 5]);
    expect(monday.newspaper.articleIds.every(id => !second.newspaper.articleIds.includes(id))).toBe(true);
  });

  it('preserves explicitly saved legacy copies without inventing a first-day delivery on migration', () => {
    const intro = createInitialState(120);
    const legacy = { ...intro, newspaperCopies: [newspaperCopy(intro.newspaper, 1)] };
    expect(decodeSave(encodeSave(legacy))).toEqual(legacy);
    const second = nextDay(applyAction({ ...legacy, money: 100000 }, 'skip-intro').state);
    expect(second.newspaperCopies.map(copy => copy.day)).toEqual([1, 2]);
    expect(second.newspaper.articleIds.every(id => !intro.newspaper.articleIds.includes(id))).toBe(true);
    const { newspaperCopies: _copies, newspaper: _newspaper, ...old } = intro;
    const migrated = decodeSave(file(old, 31));
    expect(migrated.newspaperCopies).toEqual([]);
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
  });

  it('arrives 14–21 minutes before eight from day two, including Monday; first day stays at 7:57', () => {
    const minutes = new Set<number>();
    for (let seed = 0; seed < 128; seed++) {
      const first = applyAction({ ...createInitialState(seed), money: 100000 }, 'skip-intro').state;
      expect(first.clockMinutes).toBe(477);
      let next = nextDay(first);
      expect(next.clockMinutes).toBeGreaterThanOrEqual(459);
      expect(next.clockMinutes).toBeLessThanOrEqual(466);
      minutes.add(next.clockMinutes);
      expect(decodeSave(encodeSave(next))).toEqual(next);
      next = nextDay(next);
      while (next.phase === 'home') next = applyAction(next, 'next-day').state;
      expect(next.day).toBe(5);
      expect(next.clockMinutes).toBeGreaterThanOrEqual(459);
      expect(next.clockMinutes).toBeLessThanOrEqual(466);
    }
    expect([...minutes].sort()).toEqual([459, 460, 461, 462, 463, 464, 465, 466]);
  });

  it('does not consume queues or random draws before 7:55, then admits without jumping to eight', () => {
    const morning = nextDay(applyAction(createInitialState(12), 'skip-intro').state);
    const before = { ...morning, clockMinutes: 474 };
    for (let i = 0; i < 3; i++) expect(applyAction(before, 'call-patient')).toEqual({ state: before, feedback: 'waiting-room-empty' });
    const ready = advanceClinicTime(before, 1).state;
    const called = applyAction(ready, 'call-patient').state;
    expect(called.visit).not.toBeNull();
    expect(called.clockMinutes).toBe(476);
    expect(decodeSave(encodeSave(called))).toEqual(called);
    expect(decodeSave(encodeSave(applyAction(called, 'run-general').state)).visit?.generalTested).toBe(true);
  });

  it('publishes 3–4 unique articles, uses every fresh text before recycling, and continues for 150 issues', () => {
    expect(PRESS_ARTICLES).toHaveLength(170);
    expect(PRESS_ARTICLES.filter(article => article.reusable)).toHaveLength(70);
    expect(PRESS_ARTICLES.slice(20).filter(article => article.reusable).length / 150).toBeGreaterThanOrEqual(1 / 3);
    let issue = createNewspaper(120);
    const seen = new Set<string>();
    for (let day = 0; day < 150; day++) {
      expect(issue.articleIds.length).toBeGreaterThanOrEqual(3);
      expect(issue.articleIds.length).toBeLessThanOrEqual(4);
      expect(new Set(issue.articleIds).size).toBe(issue.articleIds.length);
      for (const id of issue.articleIds) {
        if (seen.has(id)) {
          expect(seen.size).toBe(PRESS_ARTICLES.length);
          expect(PRESS_ARTICLES.find(article => article.id === id)?.reusable).toBe(true);
        }
        seen.add(id);
      }
      const next = nextNewspaper(issue.rngState, issue);
      expect(next).toEqual(nextNewspaper(issue.rngState, structuredClone(issue)));
      if (seen.size === PRESS_ARTICLES.length) expect(next.articleIds.every(id => !issue.articleIds.includes(id))).toBe(true);
      issue = next;
    }
    expect(seen.size).toBe(PRESS_ARTICLES.length);
  });

  it('reserves part or all of an edition for editorial/story choices without duplicates', () => {
    const previous = createNewspaper(4);
    expect(nextNewspaper(previous.rngState, previous, ['choir']).articleIds[0]).toBe('choir');
    const priority = ['choir', 'chess', 'bread', 'cassette'] as const;
    expect(nextNewspaper(previous.rngState, previous, priority).articleIds).toEqual(priority);
    expect(() => nextNewspaper(2, previous, ['chess', 'chess'])).toThrow(RangeError);
  });

  it('preserves the issue, used pool and next draw through export; legacy imports keep their old clock and game RNG', () => {
    const current = nextDay(applyAction(createInitialState(22), 'skip-intro').state);
    expect(decodeSave(encodeSave(current))).toEqual(current);
    const loaded = decodeSave(encodeSave(current));
    expect(nextDay(loaded)).toEqual(nextDay(current));
    loaded.newspaper.articleIds.pop();
    expect(current.newspaper.articleIds.length).toBeGreaterThanOrEqual(3);
    const { newspaperCopies: _copies, newspaper: _newspaper, ...legacy } = { ...current, clockMinutes: 477 };
    const migrated = decodeSave(file(legacy, 31));
    expect(migrated).toMatchObject(legacy);
    expect(decodeSave(encodeSave(migrated))).toEqual(migrated);
    expect(() => decodeSave(file({ ...legacy, clockMinutes: 460 }, 31))).toThrow();
    expect(() => decodeSave(file(current, 31))).toThrow();
  });

  it('rejects malformed press state and impossible early visits before replacing live data', () => {
    const state = nextDay(applyAction(createInitialState(22), 'skip-intro').state);
    const paper = state.newspaper;
    for (const newspaper of [undefined, null, {}, { ...paper, extra: true }, { ...paper, rngState: -1 },
      { ...paper, articleIds: ['missing', 'bread', 'chess'] }, { ...paper, articleIds: ['bread', 'bread', 'chess'] },
      { ...paper, articleIds: ['bread'] }, { ...paper, usedArticleIds: [] },
      { ...paper, usedArticleIds: [...paper.usedArticleIds, paper.usedArticleIds[0]] }]) {
      expect(() => decodeSave(file({ ...state, newspaper }))).toThrow();
    }
    const occupied = applyAction({ ...state, clockMinutes: 475 }, 'call-patient').state;
    expect(() => decodeSave(file({ ...occupied, clockMinutes: 474 }))).toThrow();
    expect(() => decodeSave(file({ ...state, clockMinutes: 458 }))).toThrow();
    expect(() => decodeSave(file({ ...state, clockMinutes: 1035 }))).toThrow();
  });

  it('keeps complete PL/EN articles and masthead inside native paper margins', () => {
    for (const locale of ['pl', 'en'] as const) {
      const t = translations[locale].newspaper;
      expect(Object.keys(t.articles)).toEqual(PRESS_ARTICLES.map(article => article.id));
      expect(new Set(Object.values(t.articles).map(article => article.title)).size).toBe(PRESS_ARTICLES.length);
      expect(new Set(Object.values(t.articles).map(article => article.body)).size).toBe(PRESS_ARTICLES.length);
      expect(measureDocumentText(t.strapline)).toBeLessThanOrEqual(156);
      for (const article of PRESS_ARTICLES) {
        const layout = newspaperArticleLayout(article.id, locale);
        expect(layout.bottom, `${locale} ${article.id}`).toBeLessThanOrEqual(NEWSPAPER_BODY_BOTTOM);
        for (const line of layout.title) expect(measureText(line), line).toBeLessThanOrEqual(NEWSPAPER_TITLE_WIDTH);
        for (const line of layout.body) expect(measureDocumentText(line), line).toBeLessThanOrEqual(NEWSPAPER_COLUMN_WIDTH);
        expect(layout.body.join(' ')).toBe(t.articles[article.id].body);
        expect(layout.columns.flat()).toEqual(layout.body);
        expect(measureDocumentText(t.articles[article.id].byline)).toBeLessThanOrEqual(248);
      }
      const issue = createNewspaper(5);
      expect(newspaperDescription(issue, 2, locale, 0)).toContain(locale === 'pl' ? '04.11.1983' : '04/11/1983');
    }
  });

  it('shares newspaper geometry between pickup, placement and semantic bounds', () => {
    const initial = createDeskState();
    const opened = moveDeskItem(initial, 'newspaper', NEWSPAPER_OPEN_POSITION, false, false, true);
    expect(itemRect(opened, 'newspaper', false, false, false, true)).toEqual({ ...NEWSPAPER_OPEN_POSITION, ...NEWSPAPER_OPEN_SIZE });
    const carried = pickUpDeskItem(opened, 'newspaper', false, false, true);
    expect(itemRect(carried, 'newspaper', false, true)).toMatchObject({ w: 64, h: 40 });
    const placed = moveDeskItem(carried, 'newspaper', { x: 300, y: 180 }, false, false, true);
    expect(itemRect(placed, 'newspaper', false, false, false, true)).toMatchObject(NEWSPAPER_OPEN_SIZE);
    const shelf = moveDeskItem(placed, 'newspaper', { x: 94, y: 188 });
    expect(itemRect(shelf, 'newspaper')).toMatchObject({ w: 88, h: 56 });
  });
});
