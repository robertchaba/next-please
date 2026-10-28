import { drawCabinet, drawDeskItem, drawDeskRests, drawIntroIllustration, drawPaper, drawWorkstationObjects, drawPaperclip, drawDeskCalendar, drawBanknote, drawInspectionForm, type CabinetArtOptions } from '../render/clinic';
import { drawPaperwork, paperDescription, paperActionRect, paperClipTargetRect, paperPhoneRect, additionalTestRect, wrapDocumentLines, drawCertificate, certificateDescription, visionReading, pressureReading, generalReading, visiblePaperRect, noteEntries } from '../render/paperwork';
import { paginateNoteEntries, notePageControls, notePageLabel } from '../render/note-pages';
export { paperDescription } from '../render/paperwork';
import { drawDocumentText, drawText, measureDocumentText } from '../render/font';
import { drawManual, drawManualCover, manualControls, manualPageCount } from '../render/manual';
import { INTRO_SLIDES, canReturnBanknote, canEndDay, isShiftFinished, isDocumentClipped, clippedDocuments, type DocumentId, type GameAction, type GameState } from '../core/game';
import { ADDITIONAL_TESTS } from '../core/additional-tests';
import { patientForVisit, workDayNumber } from '../core/progression';
import { translations, type Locale } from '../i18n';
import type { Button } from '../ui';
import { drawerSheets } from '../render/drawer';
import { calendarText, formatGameDate } from '../core/calendar';
import { CABINET_HOTSPOTS, CLINICAL_PAPER_SIZE, DOCUMENT_RACK_SLOTS, PATIENT_HANDOFF, RIGHT_DESK_X, itemRect, restRect, dropTargetRect, type DeskState, type DeskItemId, type Rect } from '../core/desk';
export { manualPageCount, manualPageDescription } from '../render/manual';

export type ShiftAction = GameAction | 'select-fit' | 'select-unfit' | 'apply-stamp' | 'manual'
  | 'manual-prev' | 'manual-next' | 'manual-close' | 'put-away-fit' | 'put-away-unfit'
  | 'take-clip' | 'drawer' | 'trash' | 'reserved-form' | { type: 'read-paper'; paperId: number }
  | { type: 'note-page'; paperId: number; direction: -1 | 1 };
export type SelectedStamp = 'fit' | 'unfit' | null;
export type PatientSpeech = { patientId: number; line: keyof typeof translations.pl.patientSpeech };
export type DeskPresentation = {
  desk: DeskState; held: DeskItemId | null; heldItems?: readonly DeskItemId[];
  manualOpen: boolean; manualPage: number; clockMinutes?: number;
  notePages?: Readonly<Record<number, number>>;
  patientMotion?: CabinetArtOptions['patientMotion'];
  patientSpeech?: PatientSpeech;
  phoneSpeech?: string;
  clinicSpeech?: { text: string; speaker: 'doctor' | 'cleaner' };
  hiddenPaperIds?: readonly number[];
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

/** A carried bundle can deliver its referral while the other sheets stay here. */
export function carriedAdditionalReferral(state: GameState, held: DeskItemId | null, heldItems: readonly DeskItemId[] = []) {
  if (!held || !state.visit) return undefined;
  for (const id of [held, ...heldItems.filter(id => id !== held)]) {
    const paper = state.papers.find(paper => `paper-${paper.id}` === id && paper.kind === 'additional-referral'
      && paper.patientId === state.visit!.patientId && paper.day === state.visit!.startedDay);
    if (paper?.kind === 'additional-referral') return paper;
  }
  return undefined;
}

const c = { ink: '#293226', paper: '#ded4ae', muted: '#a6ac8e', red: '#aa5d48', green: '#4e674e' };

export function inspectionDescription(state: GameState, locale: Locale): string {
  const inspection = state.inspection, t = translations[locale], q = t.inspection;
  if (!inspection) return '';
  if (inspection.stage === 'identity') return inspection.idTaken ? q.idReminder : q.greeting;
  const target = `${t.patientNames[inspection.target.patientId]}, ${formatGameDate(inspection.target.day, locale)}.`;
  return inspection.stage === 'confirm-missing'
    ? `${inspection.received.length ? q.partial : q.missing} ${target}`
    : `${q.request} ${target}${inspection.received.length ? ` ${q.received}: ${inspection.received.map(kind => kind === 'note' ? t.paperwork.note : t.paperwork.referral).join(', ')}.` : ''}`;
}

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}

export function clockTime(state: GameState): string {
  return `${String(Math.floor(state.clockMinutes / 60)).padStart(2, '0')}:${String(state.clockMinutes % 60).padStart(2, '0')}`;
}

export function shiftDescription(state: GameState, locale: Locale, hiddenPaperIds: readonly number[] = []): string {
  const t = translations[locale]; const visit = state.visit;
  const patient = patientForVisit(state);
  const date = calendarText(state.day, locale);
  return [t.cabinetHelp, `${t.clock}: ${clockTime(state)}.`, `${t.day}: ${state.day}.`, `${t.calendar.label}: ${date.day} ${date.month}.`, `${t.queue}: ${state.shiftCompleted}/${state.roster.length}.`, `${t.points}: ${state.money}.`,
    inspectionDescription(state, locale),
    visit && patient ? `${t.patientNames[visit.patientId]}. ${t.patientJobs[visit.patientId]}. ${visit.document === 'tray' ? t.awaitingDocument : t.document}. ${t.generalResult}: ${visit.generalTested ? (patient!.general === 'pass' ? t.generalClear : generalReading(visit.patientId, locale)) : t.untested}. ${t.visionResult}: ${visit.visionTested ? visionReading(patient.visionValues, locale) : t.untested}. ${t.pressureResult}: ${visit.pressureTested ? visit.pressureReadings.map(pressureReading).join('; ') : t.untested}. ${t.paperwork.weight}: ${visit.measurementsTaken ? `${patient.weight} ${t.paperwork.kg}` : t.untested}. ${t.paperwork.height}: ${visit.measurementsTaken ? `${patient.height} ${t.paperwork.cm}` : t.untested}. ${visit.decision ? t[visit.decision] : t.stampHere}.`
      : state.inspection ? t.inspection.inspector : isShiftFinished(state) ? t.shiftDone : t.emptyChair,
    ...(visit?.certificateTaken ? [certificateDescription(state, locale)] : []),
    ...state.papers.filter(paper => paper.location === 'desk' && !hiddenPaperIds.includes(paper.id)).map(paper => paperDescription(paper, locale, isDocumentClipped(state, paper.id))),
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
  const heldCash = state.banknotes.find(note => view.held === `banknote-${note.id}`);
  const heldReferral = carriedAdditionalReferral(state, view.held, view.heldItems);
  const heldInspectionPaper = state.inspection && view.held?.startsWith('paper-') ? state.papers.find(paper => `paper-${paper.id}` === view.held) : undefined;
  const pageCorners = manualControls(itemRect(view.desk, 'manual', false, false, view.manualOpen));
  return [
    ...(rest ? [button(restAction, restLabel, rest.x, rest.y, rest.w, rest.h, restAction)] : []),
    ...(canEndDay(state) ? [hotspot('end-day', t.endDay, CABINET_HOTSPOTS.callPatient, 'end-day')]
      : [{ ...hotspot('call-patient', t.callPatient, CABINET_HOTSPOTS.callPatient, 'call-patient'), disabled: isShiftFinished(state) || state.inspection !== null }]),
    ...(state.inspection?.stage === 'identity' && !state.inspection.idTaken
      ? [hotspot('take-inspection-id', t.inspection.takeId, { x: 18, y: 157, w: 60, h: 36 }, 'take-inspection-id')] : []),
    ...(state.inspection && view.held === null ? [hotspot('talk-inspector', state.inspection.stage === 'confirm-missing' ? `${t.inspection.confirm}. ${t.inspection.continueSearch}` : `${t.inspection.talk}. ${inspectionDescription(state, locale)}`, PATIENT_HANDOFF, 'talk-inspector')] : []),
    ...(heldInspectionPaper ? [hotspot('hand-inspection-paper', heldInspectionPaper.kind === 'inspection-id' ? t.inspection.returnId : t.inspection.hand, PATIENT_HANDOFF,
      heldInspectionPaper.kind === 'inspection-id' ? 'return-inspection-id' : { type: 'hand-inspection-paper', paperId: heldInspectionPaper.id })] : []),
    ...(state.visit?.specialist && !state.visit.specialistTaken ? [hotspot('take-specialist', t.progression.takeSpecialist, { x: 72, y: 181, w: 35, h: 66 }, 'take-specialist')] : []),
    ...(state.visit?.bribe === 'offered' ? [item('banknote', `${t.progression.banknote}. ${t.progression.bribeHelp}`, 'banknote', 'accept-bribe')] : []),
    ...(state.visit && view.held === 'banknote' ? [hotspot('return-bribe', t.progression.returnBribe, PATIENT_HANDOFF, 'return-bribe')] : []),
    ...state.banknotes.filter(note => note.location === 'desk').map(note => item(`banknote-${note.id}`, `${t.progression.banknote}. ${t.progression.bribeHelp}`, `banknote-${note.id}`)),
    ...(heldCash && canReturnBanknote(state, heldCash) ? [hotspot('return-bribe', t.progression.returnBribe, PATIENT_HANDOFF, { type: 'return-banknote', banknoteId: heldCash.id })] : []),
    ...(heldCash ? [hotspot('store-banknote', t.progression.acceptBribe, dropTargetRect('drawer', view.held), { type: 'store-banknote', banknoteId: heldCash.id })] : []),
    ...(view.held === 'banknote' ? [hotspot('accept-bribe', t.progression.acceptBribe, dropTargetRect('drawer', view.held), 'accept-bribe')] : []),
    ...(heldReferral ? [hotspot('hand-additional-referral', t.additionalTests.hand, PATIENT_HANDOFF, { type: 'hand-additional-referral', paperId: heldReferral.id })] : []),
    ...(state.visit?.document === 'tray' ? [item('take-document', t.takeDocument, 'incoming-referral', 'take-document')] : []),
    ...(state.visit?.certificateTaken ? [...(!heldReferral ? [hotspot('return-document', t.returnDocument, PATIENT_HANDOFF, 'return-document')] : []),
      item('apply-stamp', `${t.applyStamp}. ${certificateDescription(state, locale)}`, 'document', 'apply-stamp'),
      ...(certificateOnDesk ? [{ ...hotspot('write-certificate', t.paperwork.writeCertificate, paperActionRect(certificateBounds), 'write-certificate'), owner: 'document' as const }] : []),
      ...(!isLifted(view, 'document') && visibleDocumentClip(state, 'certificate', view)
        ? [{ ...hotspot('certificate-clip', t.paperwork.unclip, paperClipTargetRect(certificateBounds, view.held), { type: 'unclip-document', documentId: 'certificate' }), owner: 'document' as const }] : []),
    ] : []),
    ...(state.visit && view.held === null ? [hotspot('run-general', t.general, PATIENT_HANDOFF, 'run-general')] : []),
    hotspot('run-vision', t.vision, CABINET_HOTSPOTS.vision, 'run-vision'),
    hotspot('run-pressure', t.pressure, CABINET_HOTSPOTS.pressure, 'run-pressure'),
    hotspot('run-measurements', t.measurements, CABINET_HOTSPOTS.measurements, 'run-measurements'),
    hotspot('use-phone', t.phone, CABINET_HOTSPOTS.phone, 'use-phone'),
    hotspot('take-paper', t.takePaper, CABINET_HOTSPOTS.paperSupply, 'take-paper'),
    hotspot('take-certificate', t.takeCertificate, CABINET_HOTSPOTS.certificateSupply, 'take-certificate'),
    ...(workDayNumber(state.day) >= 7 ? [hotspot('take-additional-referral', t.additionalTests.take, CABINET_HOTSPOTS.additionalReferralSupply, 'take-additional-referral')]
      : [{ ...hotspot('reserved-form-3', `${t.reservedForm} 3`, DOCUMENT_RACK_SLOTS[2], 'reserved-form'), disabled: true }]),
    { ...hotspot('reserved-form-4', `${t.reservedForm} 4`, DOCUMENT_RACK_SLOTS[3], 'reserved-form'), disabled: true },
    hotspot('take-clip', t.takeClip, CABINET_HOTSPOTS.clipSupply, 'take-clip'),
    hotspot('drawer', `${t.drawer}: ${drawerSheets(state, 0).papers.length + Number(state.drawerItems.manual) + state.drawerItems.clips + state.banknotes.filter(note => note.location === 'drawer').length}. ${t.drawerHelp}`, dropTargetRect('drawer', view.held, view.heldItems), 'drawer'),
    hotspot('trash', t.trash, dropTargetRect('trash', view.held, view.heldItems), 'trash'),
    ...state.papers.filter(paper => paper.location === 'desk' && !view.hiddenPaperIds?.includes(paper.id)).flatMap(paper => {
      const id: DeskItemId = `paper-${paper.id}`;
      const action: ShiftAction = (paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened ? { type: 'open-letter', paperId: paper.id }
        : { type: 'read-paper', paperId: paper.id };
      const bounds = visiblePaperRect(paper, itemRect(view.desk, id, false, isLifted(view, id)));
      const canAct = !isLifted(view, id) && bounds.x >= RIGHT_DESK_X
        && ((paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened);
      const callable = !isLifted(view, id) && bounds.x >= RIGHT_DESK_X && paper.day === state.visit?.startedDay && paper.patientId === state.visit?.patientId
        && ((paper.kind === 'specialist' && workDayNumber(state.day) >= 4) || (paper.kind === 'referral' && workDayNumber(state.day) >= 5));
      const selectable = paper.kind === 'additional-referral' && paper.patientId === state.visit?.patientId && paper.day === state.visit?.startedDay
        && !isLifted(view, id) && bounds.x >= RIGHT_DESK_X;
      const note = paper.kind === 'note' ? paginateNoteEntries(noteEntries(paper, locale), CLINICAL_PAPER_SIZE.w - 22, view.notePages?.[paper.id]) : undefined;
      const noteCorners = notePageControls(bounds);
      const canTurnNote = note && note.count > 1 && !isLifted(view, id) && bounds.x >= RIGHT_DESK_X;
      const description = paperDescription(paper, locale, isDocumentClipped(state, paper.id))
        + (note && note.count > 1 ? ` ${notePageLabel(locale, note.page, note.count)}. ${t.notePagination.help}` : '');
      return [{ ...item(id, description, id, action), ...bounds },
        ...(canTurnNote && note.page > 0 ? [{ ...hotspot(`note-prev-${paper.id}`, `${t.notePagination.previous}. ${notePageLabel(locale, note.page - 1, note.count)}`, noteCorners.previous,
          { type: 'note-page', paperId: paper.id, direction: -1 }), owner: id }] : []),
        ...(canTurnNote && note.page < note.count - 1 ? [{ ...hotspot(`note-next-${paper.id}`, `${t.notePagination.next}. ${notePageLabel(locale, note.page + 1, note.count)}`, noteCorners.next,
          { type: 'note-page', paperId: paper.id, direction: 1 }), owner: id }] : []),
        ...(selectable ? ADDITIONAL_TESTS.map(test => ({ ...hotspot(`select-additional-test-${paper.id}-${test}`,
          `${t.additionalTests.choose}: ${t.additionalTests.tests[test]}`, additionalTestRect(bounds, test),
          { type: 'select-additional-test', paperId: paper.id, test }), owner: id, pressed: paper.test === test })) : []),
        ...(callable ? [{ ...hotspot(`${paper.kind === 'specialist' ? 'call-specialist' : 'call-employer'}-${paper.id}`,
          paper.kind === 'specialist' ? t.progression.callSpecialist : t.progression.callEmployer, paperPhoneRect(bounds),
          paper.kind === 'specialist' ? 'call-specialist' : 'call-employer'), owner: id }] : []),
        ...(canAct ? [{ ...hotspot(`paper-action-${paper.id}`, t.paperwork.open, paperActionRect(bounds), action), owner: id }] : []),
        ...(!isLifted(view, id) && visibleDocumentClip(state, paper.id, view)
          ? [{ ...hotspot(`paper-clip-${paper.id}`, t.paperwork.unclip, paperClipTargetRect(bounds, view.held), { type: 'unclip-document', documentId: paper.id }), owner: id }] : [])];
    }),
    ...view.desk.order.filter(id => id.startsWith('clip-')).map(id => item(id, t.paperwork.paperclip, id)),
    { ...item('stamp-fit', t.stampFit, 'stamp-fit', 'select-fit'), pressed: selected === 'fit' },
    { ...item('stamp-unfit', t.stampUnfit, 'stamp-unfit', 'select-unfit'), pressed: selected === 'unfit' },
    ...(!state.drawerItems.manual ? [item('manual', t.manual, 'manual', 'manual')] : []),
    ...(!state.drawerItems.manual && view.held !== 'manual' && view.desk.positions.manual.x >= RIGHT_DESK_X ? [
      ...(view.manualOpen ? [hotspot('manual-prev', view.manualPage === 0 ? t.manualClose : t.manualPrevious, pageCorners.previous, 'manual-prev')] : []),
      ...(!view.manualOpen || view.manualPage < manualPageCount(state.day) - 1
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
  const patient = patientForVisit(state);
  drawCabinet(ctx, { patientId: visit?.patientId ?? view.departingPatientId ?? null, lampOn: state.lampOn, decoration: state.decoration,
    clockMinutes: view.clockMinutes ?? state.clockMinutes, patientMotion: view.patientMotion, inspectorId: state.inspection?.inspectorId });
  if (view.patientSpeech) drawPatientSpeech(ctx, t.patientSpeech[view.patientSpeech.line]);
  drawDeskRests(ctx);
  drawWorkstationObjects(ctx, state.papers.filter(paper => paper.location === 'drawer').length, workDayNumber(state.day) >= 7);
  drawDeskCalendar(ctx, state.day, locale);
  if (state.inspection?.stage === 'identity' && !state.inspection.idTaken) drawInspectionForm(ctx, 'id', 18, 157, 60, 36);
  if (visit?.specialist && !visit.specialistTaken) drawPaper(ctx, 72, 181, 35, 66);
  for (const id of view.desk.order) {
    const lifted = isLifted(view, id);
    const bounds = itemRect(view.desk, id, visit?.document === 'tray' && !lifted, lifted, view.manualOpen);
    const { x, y, w, h } = bounds;
    if (id === 'banknote') { if (visit?.bribe === 'offered') drawBanknote(ctx, x, y, w, h); continue; }
    if (id.startsWith('banknote-')) {
      if (state.banknotes.some(note => id === `banknote-${note.id}` && note.location === 'desk')) drawBanknote(ctx, x, y, w, h);
      continue;
    }
    if (id === 'incoming-referral') {
      if (visit?.document === 'tray') drawPaper(ctx, x, y, w, h);
      continue;
    }
    if (id.startsWith('paper-')) {
      const paper = state.papers.find(entry => `paper-${entry.id}` === id && entry.location === 'desk');
      if (paper && !view.hiddenPaperIds?.includes(paper.id)) drawPaperwork(ctx, paper, bounds, locale, lifted, visibleDocumentClip(state, paper.id, view), true, view.notePages?.[paper.id]);
      continue;
    }
    if (id.startsWith('clip-')) {
      drawPaperclip(ctx, x, y, lifted);
      continue;
    }
    if (id !== 'document') {
      if (id === 'manual') {
        if (view.manualOpen && !lifted) drawManual(ctx, bounds, locale, view.manualPage, state.day);
        else drawManualCover(ctx, bounds, lifted);
      } else if (id === 'stamp-fit' || id === 'stamp-unfit') drawDeskItem(ctx, id, x, y, lifted, w, h);
      continue;
    }
    if (!visit?.certificateTaken || !patient) continue;
    drawCertificate(ctx, state, bounds, locale, lifted, visibleDocumentClip(state, 'certificate', view));
  }
  if (view.phoneSpeech) drawPatientSpeech(ctx, view.phoneSpeech, 216, 78, 'left');
  if (state.inspection) drawPatientSpeech(ctx, inspectionDescription(state, locale), 111, 34);
  // The doctor speaks from our side of the desk, opposite the seated patient.
  // Keep the existing balloon above paperwork, with its tail toward the player.
  if (view.clinicSpeech) drawPatientSpeech(ctx, view.clinicSpeech.text, view.clinicSpeech.speaker === 'cleaner' ? 8 : 20, view.clinicSpeech.speaker === 'cleaner' ? 9 : 292, view.clinicSpeech.speaker === 'doctor' ? 'down' : 'left');
}

/** A little paper-colored comic balloon, sized to the actual short utterance. */
function drawPatientSpeech(ctx: CanvasRenderingContext2D, value: string, x = 111, y = 49, tail: 'left' | 'down' = 'left'): void {
  const lines = wrapDocumentLines([value], 170);
  const w = Math.max(...lines.map(measureDocumentText)) + 14, h = 14 + lines.length * 8;
  box(ctx, x + 3, y, w - 6, h, '#30372a');
  box(ctx, x, y + 3, w, h - 6, '#30372a');
  box(ctx, x + 3, y + 1, w - 6, h - 2, '#e4dcbb');
  box(ctx, x + 1, y + 3, w - 2, h - 6, '#e4dcbb');
  // Patient speech points toward the face. The doctor's centered tail exits
  // the lower frame toward the player, without mirroring the localized text.
  for (let row = 0; row < 8; row++) {
    const left = tail === 'down' ? x + Math.floor(w / 2) - 4 + Math.floor(row / 2) : x + 6 - row;
    box(ctx, left, y + h - 1 + row, 8 - row, 1, '#30372a');
    if (row < 5) box(ctx, left + 1, y + h - 1 + row, 5 - row, 1, '#e4dcbb');
  }
  drawDocumentText(ctx, lines.join('\n'), x + 7, y + 6, { color: '#30372a' });
}
