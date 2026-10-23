import { drawCabinet, drawDeskItem, drawIntroIllustration, type CabinetArtOptions } from '../render/clinic';
import { drawDocumentText, drawText } from '../render/font';
import { INTRO_SLIDES, PATIENTS, SHIFT_LENGTH, type GameAction, type GameState } from '../core/game';
import { translations, type Locale } from '../i18n';
import type { Button } from '../ui';
import { itemRect, TRAY, type DeskState, type DeskItemId } from '../core/desk';

export type ShiftAction = GameAction | 'select-fit' | 'select-unfit' | 'apply-stamp' | 'manual' | 'move-cup' | 'move-pencil';
export type SelectedStamp = 'fit' | 'unfit' | null;
export type DeskPresentation = { desk: DeskState; held: DeskItemId | null; patientMotion?: CabinetArtOptions['patientMotion'] };
const c = { ink: '#293226', paper: '#ded4ae', muted: '#a6ac8e', red: '#aa5d48', green: '#4e674e' };

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}

export function clockTime(state: GameState): string {
  return `${String(Math.floor(state.clockMinutes / 60)).padStart(2, '0')}:${String(state.clockMinutes % 60).padStart(2, '0')}`;
}

export function shiftDescription(state: GameState, locale: Locale): string {
  const t = translations[locale]; const visit = state.visit;
  const patient = visit ? PATIENTS[visit.patientId] : null;
  return [t.cabinetHelp, `${t.clock}: ${clockTime(state)}.`, `${t.day}: ${state.day}.`, `${t.queue}: ${state.shiftCompleted}/${SHIFT_LENGTH}.`, `${t.points}: ${state.money}.`,
    visit && patient ? `${t.patientNames[visit.patientId]}. ${t.patientJobs[visit.patientId]}. ${t.patientLines[visit.patientId]}. ${visit.document === 'tray' ? t.awaitingDocument : t.document}. ${t.visionResult}: ${visit.visionTested ? t[patient.vision] : t.untested}. ${t.pressureResult}: ${visit.pressureTested ? t[patient.pressure] : t.untested}. ${visit.decision ? t[visit.decision] : t.stampHere}.`
      : state.shiftCompleted === SHIFT_LENGTH ? t.shiftDone : t.emptyChair,
  ].join(' ');
}

export function shiftButtons(state: GameState, locale: Locale, selected: SelectedStamp, onAction: (action: ShiftAction) => void, view: DeskPresentation): Button[] {
  const t = translations[locale];
  const button = (id: string, label: string, x: number, y: number, w: number, h: number, action: ShiftAction, kind: Button['kind'] = 'hotspot'): Button =>
    ({ id, label, x, y, w, h, kind, action: () => onAction(action) });
  const item = (id: string, label: string, itemId: DeskItemId, action: ShiftAction): Button => ({
    ...button(id, label, 0, 0, 0, 0, action),
    ...itemRect(view.desk, itemId, state.visit?.document === 'tray' && view.held !== 'document'), item: itemId,
  });
  if (state.phase === 'intro') return [
    button('intro-next', state.introStep === INTRO_SLIDES - 1 ? t.enterCabinet : t.next, 391, 262, 155, 26, 'advance-intro', 'text'),
  ];
  return [
    ...(state.shiftCompleted === SHIFT_LENGTH ? [button('next-day', t.nextDay, 239, 92, 34, 30, 'next-day')]
      : [button('call-patient', t.callPatient, 239, 92, 34, 30, 'call-patient')]),
    ...(state.visit?.document === 'tray' ? [item('take-document', t.takeDocument, 'document', 'take-document')]
      : state.visit ? [button('return-document', t.returnDocument, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 'return-document'),
        item('apply-stamp', t.applyStamp, 'document', 'apply-stamp')] : []),
    button('run-vision', t.vision, 308, 20, 48, 65, 'run-vision'),
    button('run-pressure', t.pressure, 383, 78, 73, 44, 'run-pressure'),
    { ...item('stamp-fit', t.stampFit, 'stamp-fit', 'select-fit'), pressed: selected === 'fit' },
    { ...item('stamp-unfit', t.stampUnfit, 'stamp-unfit', 'select-unfit'), pressed: selected === 'unfit' },
    item('manual', t.manual, 'manual', 'manual'),
    item('cup', t.cup, 'cup', 'move-cup'), item('pencil', t.pencil, 'pencil', 'move-pencil'),
    button('lamp', t.lamp, 179, 8, 49, 33, 'toggle-lamp'),
    button('decoration', t.decoration, 504, 19, 45, 45, 'change-decoration'),
  ];
}

export function renderIntro(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, characters: number): void {
  const slide = translations[locale].intro[state.introStep];
  box(ctx, 0, 0, 570, 320, '#1d2a22');
  for (let y = 8; y < 320; y += 11) for (let x = 5; x < 570; x += 17) {
    if ((x + y) % 5 === 0) box(ctx, x, y, 1, 1, '#2b392c');
  }
  drawIntroIllustration(ctx, state.introStep);
  drawText(ctx, slide.body.slice(0, characters), 270, 122, { color: state.introStep === 3 ? '#d69b73' : c.paper, scale: 2 });
}

export function renderCabinet(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, selected: SelectedStamp, view: DeskPresentation): void {
  const t = translations[locale], visit = state.visit;
  const patient = visit ? PATIENTS[visit.patientId] : null;
  drawCabinet(ctx, { patientId: visit?.patientId ?? null, lampOn: state.lampOn, decoration: state.decoration,
    clockMinutes: state.clockMinutes, patientMotion: view.patientMotion });
  // Only lettering intrinsic to the examination chart and actual paperwork.
  drawText(ctx, t.eyeChart[0], 332, 25, { color: c.ink, align: 'center', scale: 2 });
  drawText(ctx, t.eyeChart[1], 332, 49, { color: c.ink, align: 'center' });
  drawText(ctx, t.eyeChart[2], 332, 63, { color: c.ink, align: 'center' });
  for (const id of view.desk.order) {
    const lifted = view.held === id;
    const bounds = itemRect(view.desk, id, visit?.document === 'tray' && !lifted);
    const { x, y, w, h } = bounds;
    if (id !== 'document') {
      drawDeskItem(ctx, id, x, y, lifted);
      if ((id === 'stamp-fit' && selected === 'fit') || (id === 'stamp-unfit' && selected === 'unfit')) {
        box(ctx, x + 5, y + h - 1, w - 10, 2, '#ead39c');
      }
      continue;
    }
    if (!visit || !patient) continue;
    box(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#293126');
    box(ctx, x, y, w, h, c.paper);
    box(ctx, x, y, 2, h, '#b5a67f');
    box(ctx, x + 2, y, w - 4, 1, '#f0e3bb');
    const write = (value: string, dx: number, dy: number, color = c.ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color });
    if (visit.document === 'tray' && !lifted) {
      // Folded referral waiting in the narrow incoming tray, no floating label.
      box(ctx, x + 9, y + 12, 33, 1, '#9e9876');
      box(ctx, x + 9, y + 17, 23, 1, '#b0a780');
      for (let row = 0; row < 6; row++) box(ctx, x + 9, y + 30 + row * 6, 31 - row % 3 * 5, 1, '#b0a780');
      box(ctx, x + 1, y + 74, w - 2, 1, '#c2b58e');
      box(ctx, x + 1, y + 75, w - 2, 1, '#e7dbb4');
      drawDocumentText(ctx, String(visit.patientId + 1).padStart(2, '0'), x + 9, y + 83, { color: '#82785a' });
      continue;
    }
    write(t.documentTitleLabel, 12, 10);
    drawDocumentText(ctx, `${state.shiftCompleted + 1}/${SHIFT_LENGTH}`, x + w - 12, y + 10, { color: '#8a8668', align: 'right' });
    box(ctx, x + 12, y + 24, 164, 1, '#a59e79');
    write(t.patientNames[visit.patientId], 12, 31);
    write(t.patientJobs[visit.patientId], 12, 44, '#687056');
    write(t.documentVision, 12, 64, '#73765b');
    write(t.documentPressure, 12, 78, '#73765b');
    write(visit.visionTested ? t[patient.vision] : t.documentPending, 94, 64, visit.visionTested && patient.vision === 'refer' ? '#884d3a' : c.ink);
    write(visit.pressureTested ? t[patient.pressure] : t.documentPending, 94, 78, visit.pressureTested && patient.pressure === 'refer' ? '#884d3a' : c.ink);
    if (visit.decision) {
      const ink = visit.decision === 'fit' ? c.green : '#914c3c';
      const sx = x + 43, sy = y + 108, sw = 108;
      box(ctx, sx, sy, sw, 1, ink); box(ctx, sx, sy + 20, sw, 1, ink);
      box(ctx, sx, sy, 1, 21, ink); box(ctx, sx + sw - 1, sy, 1, 21, ink);
      drawText(ctx, t[visit.decision], sx + Math.floor(sw / 2), sy + 5, { align: 'center', color: ink });
      box(ctx, sx + 16, sy, 3, 1, c.paper); box(ctx, sx + 63, sy + 20, 2, 1, c.paper);
    } else for (let dx = 44; dx < 152; dx += 4) box(ctx, x + dx, y + 128, 2, 1, '#b3a984');
  }
}
