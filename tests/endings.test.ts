import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { homePage, homePages, renderHome } from '../src/scenes/home';
import { epilogueContent } from '../src/scenes/epilogue';
import { measureText } from '../src/render/font';
import { createInitialState } from './fixtures/routine';
import { act, playStoryRoute } from './fixtures/story-route';
import { decodeSave, encodeSave } from '../src/core/save';
import { translations } from '../src/i18n';

it('gives all eight endings distinct full-screen illustrations and preserves them after import', async () => {
  const assets: string[] = [];
  for (const route of ['exposed', 'audit', 'detained', 'party', 'union', 'independent']) {
    const state = playStoryRoute(route);
    for (const locale of ['pl', 'en'] as const) {
      expect(epilogueContent(decodeSave(encodeSave(state)), locale)).toEqual(epilogueContent(state, locale));
    }
    assets.push(`story/${epilogueContent(state, 'pl').picture}`);
  }
  const initial = act(createInitialState(17), 'skip-intro');
  const bankruptcy = act({ ...initial, clockMinutes: 840, money: -1000 }, 'end-day');
  const pending = act({ ...initial, day: 8, shiftCompleted: 1, patientsProcessed: 1 },
    'call-patient', 'take-document', 'take-certificate', 'write-certificate', 'accept-bribe', 'stamp-unfit', 'return-document');
  const hospital = act({ ...pending, clockMinutes: 840 }, 'end-day');
  expect(hospital.ending).toBe('hospital');
  for (const state of [bankruptcy, hospital]) {
    const page = homePages(state).length - 1;
    assets.push(homePage(state, 'pl', page).illustration);
    for (const locale of ['pl', 'en'] as const) {
      const content = homePage(state, locale, page);
      expect(homePage(decodeSave(encodeSave(state)), locale, page)).toEqual(content);
      expect(content.description.length).toBeGreaterThan(50);
      expect(content.body.split('\n').every(line => measureText(line) <= 286)).toBe(true);
      expect(content.body.split('\n').length * 16 + 85).toBeLessThan(237);
      expect(measureText(content.title, 2)).toBeLessThanOrEqual(312);
      const pixels: number[][] = [];
      renderHome({ save() {}, restore() {}, fillRect(x: number, y: number, w: number, h: number) { pixels.push([x, y, w, h]); } } as CanvasRenderingContext2D,
        state, locale, page, Infinity);
      expect(pixels.every(([x, y, w, h]) => x >= 0 && y >= 0 && x + w <= 570 && y + h <= 320)).toBe(true);
      expect(content.text).toContain(translations[locale].progression.gameOver);
    }
  }
  expect(new Set(assets).size).toBe(8);
  const hashes = await Promise.all(assets.map(async asset => {
    const png = await readFile(new URL(`../public/assets/art/${asset}.png`, import.meta.url));
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([570, 320]);
    return createHash('sha256').update(png).digest('hex');
  }));
  expect(new Set(hashes).size).toBe(8);
});
