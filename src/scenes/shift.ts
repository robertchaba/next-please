import { drawCabinet, drawDeskItem, drawDeskRests, drawIntroIllustration, drawPaper, drawWorkstationObjects, drawPaperclip, type CabinetArtOptions } from '../render/clinic';
import { drawPaperwork, paperDescription, paperActionRect, paperClipRect, drawActionCorner, HANDWRITING_INK } from '../render/paperwork';
export { paperDescription } from '../render/paperwork';
import { drawDocumentText, drawText, measureDocumentText } from '../render/font';
import { drawManual, drawManualCover, manualControls, MANUAL_PAGE_COUNT } from '../render/manual';
import { INTRO_SLIDES, PATIENTS, SHIFT_LENGTH, isDocumentClipped, clippedDocuments, type DocumentId, type GameAction, type GameState } from '../core/game';
import { translations, type Locale } from '../i18n';
import type { Button } from '../ui';
import { CABINET_HOTSPOTS, DOCUMENT_RACK_SLOTS, PATIENT_HANDOFF, RIGHT_DESK_X, itemRect, restRect, type DeskState, type DeskItemId, type Rect } from '../core/desk';
export { MANUAL_PAGE_COUNT, manualPageDescription } from '../render/manual';

export type ShiftAction = GameAction | 'select-fit' | 'select-unfit' | 'apply-stamp' | 'manual'
  | 'manual-prev' | 'manual-next' | 'manual-close' | 'put-away-fit' | 'put-away-unfit'
  | 'take-clip' | 'drawer' | 'trash' | 'reserved-form' | { type: 'read-paper'; paperId: number };
export type SelectedStamp = 'fit' | 'unfit' | null;
export type PatientSpeech = { patientId: number; line: keyof typeof translations.pl.patientSpeech };
export type DeskPresentation = {
  desk: DeskState; held: DeskItemId | null; heldItems?: readonly DeskItemId[];
  manualOpen: boolean; manualPage: number; clockMinutes?: number;
  patientMotion?: CabinetArtOptions['patientMotion'];
  patientSpeech?: PatientSpeech;
  departingPatientId?: number;
};
const documentItem = (id: DocumentId): DeskItemId => id === 'certificate' ? 'document' : `paper-${id}`;
const isLifted = (view: DeskPresentation, id: DeskItemId): boolean => view.heldItems?.includes(id) ?? view.held === id;
/** One physical clip is visible on the top sheet of a bundle. */
export function visibleDocumentClip(state: GameState, documentId: DocumentId, view: DeskPresentation): boolean {
  if (!isDocumentClipped(state, documentId)) return false;
  const members = clippedDocuments(state, documentId).map(documentItem);
  const top = [...view.desk.order].reverse().find(id => members.includes(id));
  return top === documentItem(documentId);
}

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
    visit && patient ? `${t.patientNames[visit.patientId]}. ${t.patientJobs[visit.patientId]}. ${visit.document === 'tray' ? t.awaitingDocument : t.document}. ${t.visionResult}: ${visit.visionTested ? t[patient.vision] : t.untested}. ${t.pressureResult}: ${visit.pressureTested ? t[patient.pressure] : t.untested}. ${t.paperwork.weight}: ${visit.measurementsTaken ? `${patient.weight} ${t.paperwork.kg}` : t.untested}. ${t.paperwork.height}: ${visit.measurementsTaken ? `${patient.height} ${t.paperwork.cm}` : t.untested}. ${visit.decision ? t[visit.decision] : t.stampHere}.`
      : state.shiftCompleted === SHIFT_LENGTH ? t.shiftDone : t.emptyChair,
    ...(visit?.certificateTaken ? [`${t.certificate}. ${visit.certificateNamed ? `${t.paperwork.nameWritten}: ${t.patientNames[visit.patientId]}` : t.paperwork.nameMissing}.`] : []),
    ...state.papers.filter(paper => paper.location === 'desk').map(paper => paperDescription(paper, locale, isDocumentClipped(state, paper.id))),
  ].join(' ');
}

export function shiftButtons(state: GameState, locale: Locale, selected: SelectedStamp, onAction: (action: ShiftAction) => void, view: DeskPresentation): Button[] {
  const t = translations[locale];
  const button = (id: string, label: string, x: number, y: number, w: number, h: number, action: ShiftAction, kind: Button['kind'] = 'hotspot'): Button =>
    ({ id, label, x, y, w, h, kind, action: () => onAction(action) });
  const hotspot = (id: string, label: string, bounds: Rect, action: ShiftAction): Button =>
    button(id, label, bounds.x, bounds.y, bounds.w, bounds.h, action);
  const item = (id: string, label: string, itemId: DeskItemId, action?: ShiftAction): Button => ({
    id, label, kind: 'hotspot', action: action === undefined ? undefined : () => onAction(action),
    ...itemRect(view.desk, itemId, state.visit?.document === 'tray' && view.held !== 'document', isLifted(view, itemId), view.manualOpen), item: itemId,
  });
  if (state.phase === 'intro') return [
    button('intro-next', state.introStep === INTRO_SLIDES - 1 ? t.enterCabinet : t.next, 391, 262, 155, 26, 'advance-intro', 'text'),
  ];
  const rest = view.held ? restRect(view.held) : undefined;
  const restAction = view.held === 'stamp-fit' ? 'put-away-fit' : 'put-away-unfit';
  const restLabel = view.held === 'stamp-fit' ? t.putAwayFit : t.putAwayUnfit;
  const certificateBounds = itemRect(view.desk, 'document', false, isLifted(view, 'document'));
  const certificateOnDesk = !isLifted(view, 'document') && certificateBounds.x >= RIGHT_DESK_X;
  const pageCorners = manualControls(itemRect(view.desk, 'manual', false, false, view.manualOpen));
  return [
    ...(rest ? [button(restAction, restLabel, rest.x, rest.y, rest.w, rest.h, restAction)] : []),
    ...(state.shiftCompleted === SHIFT_LENGTH ? [hotspot('next-day', t.nextDay, CABINET_HOTSPOTS.callPatient, 'next-day')]
      : [hotspot('call-patient', t.callPatient, CABINET_HOTSPOTS.callPatient, 'call-patient')]),
    ...(state.visit?.document === 'tray' ? [item('take-document', t.takeDocument, 'incoming-referral', 'take-document')] : []),
    ...(state.visit?.certificateTaken ? [hotspot('return-document', t.returnDocument, PATIENT_HANDOFF, 'return-document'),
      item('apply-stamp', `${t.applyStamp}. ${state.visit.certificateNamed ? `${t.paperwork.nameWritten}: ${t.patientNames[state.visit.patientId]}` : t.paperwork.nameMissing}.`, 'document', 'apply-stamp'),
      ...(certificateOnDesk ? [{ ...hotspot('write-certificate', t.paperwork.writeCertificate, paperActionRect(certificateBounds), 'write-certificate'), owner: 'document' as const }] : []),
      ...(!isLifted(view, 'document') && visibleDocumentClip(state, 'certificate', view)
        ? [{ ...hotspot('certificate-clip', t.paperwork.unclip, paperClipRect(certificateBounds), { type: 'unclip-document', documentId: 'certificate' }), owner: 'document' as const }] : []),
    ] : []),
    hotspot('run-vision', t.vision, CABINET_HOTSPOTS.vision, 'run-vision'),
    hotspot('run-pressure', t.pressure, CABINET_HOTSPOTS.pressure, 'run-pressure'),
    hotspot('run-measurements', t.measurements, CABINET_HOTSPOTS.measurements, 'run-measurements'),
    hotspot('use-phone', t.phone, CABINET_HOTSPOTS.phone, 'use-phone'),
    hotspot('take-paper', t.takePaper, CABINET_HOTSPOTS.paperSupply, 'take-paper'),
    hotspot('take-certificate', t.takeCertificate, CABINET_HOTSPOTS.certificateSupply, 'take-certificate'),
    ...DOCUMENT_RACK_SLOTS.slice(2).map((bounds, index) => ({ ...hotspot(`reserved-form-${index + 3}`, `${t.reservedForm} ${index + 3}`, bounds, 'reserved-form'), disabled: true })),
    hotspot('take-clip', t.takeClip, CABINET_HOTSPOTS.clipSupply, 'take-clip'),
    hotspot('drawer', `${t.drawer}: ${state.papers.filter(paper => paper.location === 'drawer').length}. ${t.drawerHelp}`, CABINET_HOTSPOTS.drawer, 'drawer'),
    hotspot('trash', t.trash, CABINET_HOTSPOTS.trash, 'trash'),
    ...state.papers.filter(paper => paper.location === 'desk').flatMap(paper => {
      const id: DeskItemId = `paper-${paper.id}`;
      const action: ShiftAction = paper.kind === 'note' ? { type: 'write-note', paperId: paper.id }
        : paper.kind === 'letter' && !paper.opened ? { type: 'open-letter', paperId: paper.id }
        : { type: 'read-paper', paperId: paper.id };
      const bounds = itemRect(view.desk, id, false, isLifted(view, id));
      const canAct = !isLifted(view, id) && bounds.x >= RIGHT_DESK_X
        && (paper.kind === 'note' || (paper.kind === 'letter' && !paper.opened));
      return [item(id, paperDescription(paper, locale, isDocumentClipped(state, paper.id)), id, action),
        ...(canAct ? [{ ...hotspot(`paper-action-${paper.id}`, paper.kind === 'note' ? t.paperwork.write : t.paperwork.open, paperActionRect(bounds), action), owner: id }] : []),
        ...(!isLifted(view, id) && visibleDocumentClip(state, paper.id, view)
          ? [{ ...hotspot(`paper-clip-${paper.id}`, t.paperwork.unclip, paperClipRect(bounds), { type: 'unclip-document', documentId: paper.id }), owner: id }] : [])];
    }),
    ...view.desk.order.filter(id => id.startsWith('clip-')).map(id => item(id, t.paperwork.paperclip, id)),
    { ...item('stamp-fit', t.stampFit, 'stamp-fit', 'select-fit'), pressed: selected === 'fit' },
    { ...item('stamp-unfit', t.stampUnfit, 'stamp-unfit', 'select-unfit'), pressed: selected === 'unfit' },
    item('manual', t.manual, 'manual', 'manual'),
    ...(view.held !== 'manual' && view.desk.positions.manual.x >= RIGHT_DESK_X ? [
      ...(view.manualOpen ? [hotspot('manual-prev', view.manualPage === 0 ? t.manualClose : t.manualPrevious, pageCorners.previous, 'manual-prev')] : []),
      ...(!view.manualOpen || view.manualPage < MANUAL_PAGE_COUNT - 1
        ? [hotspot('manual-next', view.manualOpen ? t.manualNext : t.manualOpenCover, pageCorners.next, 'manual-next')] : []),
    ] : []),
    hotspot('lamp', t.lamp, CABINET_HOTSPOTS.lamp, 'toggle-lamp'),
    hotspot('decoration', t.decoration, CABINET_HOTSPOTS.decoration, 'change-decoration'),
  ];
}

export function renderIntro(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, characters: number): void {
  const slide = translations[locale].intro[state.introStep];
  drawIntroIllustration(ctx, state.introStep);
  drawText(ctx, slide.body.slice(0, characters), 270, 122, { color: state.introStep === 3 ? '#d69b73' : c.paper, scale: 2 });
}

export function renderCabinet(ctx: CanvasRenderingContext2D, state: GameState, locale: Locale, _selected: SelectedStamp, view: DeskPresentation): void {
  const t = translations[locale], visit = state.visit;
  const patient = visit ? PATIENTS[visit.patientId] : null;
  drawCabinet(ctx, { patientId: visit?.patientId ?? view.departingPatientId ?? null, lampOn: state.lampOn, decoration: state.decoration,
    clockMinutes: view.clockMinutes ?? state.clockMinutes, patientMotion: view.patientMotion });
  if (view.patientSpeech) drawPatientSpeech(ctx, t.patientSpeech[view.patientSpeech.line]);
  // Only lettering intrinsic to the examination chart and actual paperwork.
  const chart = CABINET_HOTSPOTS.vision, chartCenter = chart.x + Math.floor(chart.w / 2);
  drawText(ctx, t.eyeChart[0], chartCenter, chart.y + 7, { color: c.ink, align: 'center', scale: 2 });
  drawText(ctx, t.eyeChart[1], chartCenter, chart.y + 31, { color: c.ink, align: 'center' });
  drawText(ctx, t.eyeChart[2], chartCenter, chart.y + 45, { color: c.ink, align: 'center' });
  drawDeskRests(ctx);
  drawWorkstationObjects(ctx, state.papers.filter(paper => paper.location === 'drawer').length);
  for (const id of view.desk.order) {
    const lifted = isLifted(view, id);
    const bounds = itemRect(view.desk, id, visit?.document === 'tray' && !lifted, lifted, view.manualOpen);
    const { x, y, w, h } = bounds;
    if (id === 'incoming-referral') {
      if (visit?.document === 'tray') drawPaper(ctx, x, y, w, h);
      continue;
    }
    if (id.startsWith('paper-')) {
      const paper = state.papers.find(entry => `paper-${entry.id}` === id && entry.location === 'desk');
      if (paper) drawPaperwork(ctx, paper, bounds, locale, lifted, visibleDocumentClip(state, paper.id, view));
      continue;
    }
    if (id.startsWith('clip-')) {
      drawPaperclip(ctx, x, y, lifted);
      continue;
    }
    if (id !== 'document') {
      if (id === 'manual') {
        if (view.manualOpen && !lifted) drawManual(ctx, bounds, locale, view.manualPage);
        else drawManualCover(ctx, bounds, lifted);
      } else if (id === 'stamp-fit' || id === 'stamp-unfit') drawDeskItem(ctx, id, x, y, lifted, w, h);
      continue;
    }
    if (!visit?.certificateTaken || !patient) continue;
    box(ctx, x + (lifted ? 6 : 3), y + (lifted ? 6 : 3), w, h, '#293126');
    drawPaper(ctx, x, y, w, h);
    const write = (value: string, dx: number, dy: number, color = c.ink): void => drawDocumentText(ctx, value, x + dx, y + dy, { color });
    if (w < 188) {
      // The exchange shelf holds compact paper; full text is readable on the desk.
      box(ctx, x + 7, y + 10, w - 14, 1, '#9e9876');
      box(ctx, x + 7, y + 15, w - 22, 1, '#b0a780');
      for (let row = 0; row < 4; row++) box(ctx, x + 7, y + 25 + row * 5, w - 15 - row % 3 * 5, 1, '#b0a780');
      if (visit.decision) {
        const ink = visit.decision === 'fit' ? c.green : '#914c3c';
        box(ctx, x + 10, y + h - 22, w - 20, 8, ink);
        box(ctx, x + 12, y + h - 20, w - 24, 4, '#d4c69d');
      }
      drawDocumentText(ctx, String(visit.patientId + 1).padStart(2, '0'), x + 7, y + h - 12, { color: '#82785a' });
      if (visibleDocumentClip(state, 'certificate', view)) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
      continue;
    }
    const p = t.paperwork;
    write(t.documentTitleLabel, 12, 10);
    drawDocumentText(ctx, `${p.reference} ${state.shiftCompleted + 1}`, x + w - 12, y + 10, { color: '#8a8668', align: 'right' });
    write(p.occupational, 12, 21, '#79785c');
    box(ctx, x + 12, y + 33, 164, 1, '#a59e79');
    write(p.name, 12, 40, '#79785c');
    if (visit.certificateNamed) write(t.patientNames[visit.patientId], 12, 52, HANDWRITING_INK);
    else for (let dx = 12; dx < 150; dx += 4) box(ctx, x + dx, y + 60, 2, 1, '#b3a984');
    write(`${p.position}: ${t.patientJobs[visit.patientId]}`, 12, 69);
    write(p.certificatePurpose, 12, 82, '#79785c');
    write(p.decisionHeading, 12, 96, '#79785c');
    // Clinical results belong only to the doctor's separate notes.
    if (visit.decision) {
      const ink = visit.decision === 'fit' ? c.green : '#914c3c';
      const sx = x + 43, sy = y + 108, sw = 108;
      box(ctx, sx, sy, sw, 1, ink); box(ctx, sx, sy + 20, sw, 1, ink);
      box(ctx, sx, sy, 1, 21, ink); box(ctx, sx + sw - 1, sy, 1, 21, ink);
      drawText(ctx, t[visit.decision], sx + Math.floor(sw / 2), sy + 5, { align: 'center', color: ink });
      box(ctx, sx + 16, sy, 3, 1, c.paper); box(ctx, sx + 63, sy + 20, 2, 1, c.paper);
    } else for (let dx = 44; dx < 152; dx += 4) box(ctx, x + dx, y + 128, 2, 1, '#b3a984');
    if (!lifted) drawActionCorner(ctx, bounds, true);
    if (visibleDocumentClip(state, 'certificate', view)) { const clip = paperClipRect(bounds); drawPaperclip(ctx, clip.x, clip.y); }
  }
}

/** A little paper-colored comic balloon, sized to the actual short utterance. */
function drawPatientSpeech(ctx: CanvasRenderingContext2D, value: string): void {
  const x = 111, y = 49, w = measureDocumentText(value) + 14, h = 22;
  box(ctx, x + 3, y, w - 6, h, '#30372a');
  box(ctx, x, y + 3, w, h - 6, '#30372a');
  box(ctx, x + 3, y + 1, w - 6, h - 2, '#e4dcbb');
  box(ctx, x + 1, y + 3, w - 2, h - 6, '#e4dcbb');
  // The tapered tail points left toward the patient, staying clear of the face.
  for (let row = 0; row < 7; row++) {
    box(ctx, x + 6 - row, y + h - 1 + row, 8 - row, 1, '#30372a');
    if (row < 5) box(ctx, x + 7 - row, y + h - 1 + row, 5 - row, 1, '#e4dcbb');
  }
  drawDocumentText(ctx, value, x + 7, y + 6, { color: '#30372a' });
}
