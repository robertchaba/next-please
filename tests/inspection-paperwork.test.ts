import { expect, it } from 'vitest';
import type { Paper } from '../src/core/game';
import { drawInspectorIdentity, drawPaperwork, paperDescription, visiblePaperRect } from '../src/render/paperwork';
import { measureDocumentText, measureDocumentHeading } from '../src/render/font';
import { translations } from '../src/i18n';

it('keeps identity-card hit areas on the illustrated card at each desk scale', () => {
  const card: Paper = { id: 7, kind: 'inspection-id', day: 2, patientId: null, location: 'desk', inspectorId: 1 };
  for (const bounds of [{ x: 300, y: 151, w: 188, h: 144 }, { x: 15, y: 193, w: 60, h: 80 }, { x: 70, y: 40, w: 48, h: 64 }]) {
    const actual = visiblePaperRect(card, bounds);
    expect(actual.h).toBe(Math.round(bounds.w * 112 / 188));
    expect(actual.x).toBe(bounds.x);
    expect(Math.abs((actual.y + actual.h / 2) - (bounds.y + bounds.h / 2))).toBeLessThanOrEqual(0.5);
  }
});

it('prints and describes matching inspector, visit and fine data within both original forms in PL and EN', () => {
  for (const locale of ['pl', 'en'] as const) {
    const t = translations[locale];
    expect(measureDocumentText(t.inspection.validity)).toBeLessThanOrEqual(110);
    expect(measureDocumentHeading(t.inspection.fineTitle, 'serif', 2)).toBeLessThanOrEqual(138);
    expect(measureDocumentText(t.inspection.absentReason)).toBeLessThanOrEqual(172);
    expect(measureDocumentText(t.inspection.partialReason)).toBeLessThanOrEqual(172);
    expect(measureDocumentText(t.inspection.settlement)).toBeLessThanOrEqual(172);
    for (const name of t.patientNames) expect(measureDocumentText(name)).toBeLessThanOrEqual(172);
    for (const inspectorId of [0, 1, 2] as const) {
      const forms: Paper[] = [
        { id: 7, kind: 'inspection-id', day: 2, patientId: null, location: 'desk', inspectorId },
        ...([50, 200] as const).map(amount => ({ id: 8, kind: 'inspection-fine' as const, day: 2, patientId: 0, targetDay: 1, amount, location: 'desk' as const, inspectorId })),
      ];
      for (const paper of forms) {
        const description = paperDescription(paper, locale);
        expect(description).toContain(t.inspection.names[inspectorId]);
        if (paper.kind === 'inspection-fine') {
          expect(description).toContain(String(paper.amount));
          expect(description).toContain(locale === 'pl' ? '03.11.1983' : '03/11/1983');
        } else expect(description).toContain(`K/${41 + inspectorId}`);
        const pixels: [number, number][] = [];
        const ctx = { save() {}, restore() {}, fillStyle: '', fillRect(x: number, y: number) { pixels.push([x, y]); } } as unknown as CanvasRenderingContext2D;
        drawPaperwork(ctx, paper, { x: 0, y: 0, w: 200, h: 168 }, locale, false);
        expect(pixels.length).toBeGreaterThan(100);
        expect(pixels.every(([x, y]) => x >= 0 && x < 200 && y >= 0 && y < 168)).toBe(true);
      }
    }
  }
});

it('fills every compact inspector card with native-pixel identity text in both languages', () => {
  for (const locale of ['pl', 'en'] as const) for (const inspectorId of [0, 1, 2] as const) {
    for (const w of [48, 60]) {
      const h = Math.round(w * 112 / 188);
      const pixels: [number, number][] = [];
      const ctx = { save() {}, restore() {}, fillStyle: '', fillRect(x: number, y: number) { pixels.push([x, y]); } } as unknown as CanvasRenderingContext2D;
      drawInspectorIdentity(ctx, inspectorId, { x: 0, y: 0, w, h }, locale);
      expect(pixels.length).toBeGreaterThan(30);
      expect(pixels.every(([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < w && y >= 0 && y < h)).toBe(true);
      for (const top of [4, 12, 20]) expect(pixels.some(([, y]) => y >= top && y < top + 7)).toBe(true);
    }
  }
});
