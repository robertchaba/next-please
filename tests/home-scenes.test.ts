import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { applyAction, settleWeekend } from '../src/core/game';
import { gameDate } from '../src/core/calendar';
import { decodeSave, encodeSave } from '../src/core/save';
import { homePage, homePages } from '../src/scenes/home';
import { arrivalIllustrations, BUDGET_ILLUSTRATIONS, NEW_HOME_ILLUSTRATIONS } from '../src/scenes/home-art';
import { translations } from '../src/i18n';
import { measureText } from '../src/render/font';
import { homeSceneState } from './fixtures/home-scenes';
import { createInitialState } from './fixtures/routine';

describe('daily and weekend home artwork', () => {
  it('reuses indoor scenes year round and keeps the rainy tram in its existing seasons', () => {
    for (let day = 1; day <= 800; day++) {
      const scenes = arrivalIllustrations(day);
      expect(scenes).toEqual(expect.arrayContaining(['weekend-budget', 'weekend-reading', 'weekend-radio', 'weekend-soup']));
      expect(scenes.includes('weekend-rain-tram')).toBe([3, 4, 9, 10, 11].includes(gameDate(day).month));
      expect(scenes).not.toContain('weekend-modest');
      expect(scenes.some(scene => /resort|winter|garden/.test(scene))).toBe(false);
    }
  });

  it('reaches every daily scene through a real settlement and preserves it across locales and save imports', () => {
    for (const kind of ['arrival', 'budget'] as const) for (const scene of kind === 'arrival' ? arrivalIllustrations(1) : BUDGET_ILLUSTRATIONS) {
      const state = homeSceneState(scene, kind), before = structuredClone(state);
      const restored = decodeSave(encodeSave(state));
      for (const locale of ['pl', 'en'] as const) {
        const page = homePage(state, locale, kind === 'arrival' ? 0 : 1);
        expect(page.illustration).toBe(scene);
        expect(homePage(restored, locale, kind === 'arrival' ? 0 : 1)).toEqual(page);
        expect(page.description).toBeTruthy();
        expect(page.body.split('\n').length).toBeLessThanOrEqual(5);
        for (const line of page.body.split('\n')) expect(measureText(line, page.bodyScale), line).toBeLessThanOrEqual(312);
        expect(homePage(state, locale, 2).illustration).toBe('going-to-work');
      }
      expect(state).toEqual(before);
    }
  });

  it('gives reused scenes weekday captions and keeps all new captions reachable in both languages', () => {
    const baseline = homeSceneState('homecoming', 'arrival');
    for (const locale of ['pl', 'en'] as const) {
      const seen = new Set<string>();
      for (let index = 0; index < 512; index++) {
        const page = homePage({ ...baseline, rngState: index * 104729 }, locale, 0);
        seen.add(page.body.replaceAll('\n', ' '));
        for (const line of page.body.split('\n')) expect(measureText(line, 2), line).toBeLessThanOrEqual(312);
        expect(page.body.split('\n').length).toBeLessThanOrEqual(5);
      }
      for (const comments of Object.values(translations[locale].home.arrivalSceneComments)) {
        expect(comments).toHaveLength(2);
        for (const comment of comments) expect(seen).toContain(comment);
      }
    }
  });

  it('varies weekend budgets too, never repeats preceding artwork, and retains result-based budget captions', () => {
    const baseline = homeSceneState('weekend-radio', 'arrival');
    const cabinet = applyAction(createInitialState(17), 'skip-intro').state;
    const weekend = settleWeekend(applyAction({ ...cabinet, day: 2, money: 1200, clockMinutes: 840 }, 'end-day').state);
    const seen = new Set<string>();
    for (const initial of [baseline, weekend]) for (let index = 0; index < 256; index++) {
      const state = { ...initial, rngState: index * 104729 };
      // Include an expense card on weekdays and an ordinary expense in weekends.
      for (const event of [null, { kind: 'medicine' as const, cost: 300 }]) {
        state.settlement = { ...initial.settlement!, event };
        const pages = homePages(state), arrival = homePage(state, 'pl', 0);
        for (const locale of ['pl', 'en'] as const) {
          const budget = homePage(state, locale, pages.indexOf('budget'));
          expect(budget.illustration).not.toBe(arrival.illustration);
          if (pages.includes('event')) expect(budget.illustration).not.toBe(homePage(state, locale, pages.indexOf('event')).illustration);
          expect(Object.values(translations[locale].home.budgetComments).flat()).toContain(budget.body);
          expect(homePage(state, locale, pages.indexOf('work')).illustration).toBe('going-to-work');
          if (initial === weekend) seen.add(budget.illustration);
        }
      }
    }
    expect(seen).toEqual(new Set(BUDGET_ILLUSTRATIONS));
  });

  it('uses the new budgets before bankruptcy, retains ending art and prepares eight opaque native assets', () => {
    const baseline = homeSceneState('homecoming', 'arrival');
    const hospital = { ...baseline, ending: 'hospital' as const };
    expect(homePages(hospital)).toEqual(['hospital']);
    expect(homePage(hospital, 'pl', 0).illustration).toBe('hospital-ending');
    const bankruptcy = { ...baseline, ending: 'bankruptcy' as const };
    expect(homePages(bankruptcy)).toEqual(['budget', 'bankruptcy']);
    for (const roster of [bankruptcy.roster, []]) for (const locale of ['pl', 'en'] as const) {
      expect(BUDGET_ILLUSTRATIONS).toContain(homePage({ ...bankruptcy, roster }, locale, 0).illustration);
    }
    expect(homePage(bankruptcy, 'pl', 1).illustration).toBe('bankruptcy-cloakroom');
    expect(NEW_HOME_ILLUSTRATIONS).toHaveLength(8);
    for (const scene of NEW_HOME_ILLUSTRATIONS) {
      const png = readFileSync(new URL(`../public/assets/art/${scene}.png`, import.meta.url));
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([570, 320]);
      expect(png[25]).toBe(2); // RGB, no alpha.
    }
  });
});
