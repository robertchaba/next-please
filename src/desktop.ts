import './style.css';
import { advanceClinicTime, applyAction, settleWeekend, CLEANER_WARNING_MINUTES, SHIFT_END_MINUTES, PATIENTS, canEndDay, canReturnBanknote, clippedDocuments, isDocumentClipped, type DocumentId, type GameAction, type ActionResult, type GameState } from './core/game';
import { patientForVisit } from './core/progression';
import { ClinicClock } from './core/clock';
import { effectsManifest } from './core/effects';
import { choosePatientSpeech } from './core/patient-speech';
import { examinationComment, examinationCommentText, type ExaminationComment } from './core/examination-feedback';
import { renderCabinet, renderIntro, shiftButtons, shiftDescription, manualPageDescription, paperDescription, carriedAdditionalReferral, visibleDocumentClip, manualPageCount, type SelectedStamp, type ShiftAction, type PatientSpeech } from './scenes/shift';
import { homePage, homePages, renderHome, HOME_ACTION } from './scenes/home';
import type { Button } from './ui';
import { createDeskState, addDeskItem, removeDeskItem, itemRect, moveDeskItem, pickUpDeskItem, raiseDeskItem, containsPoint, restRect, dropTargetRect, itemAnchor, TRAY, DEFAULT_DOCUMENT, PATIENT_HANDOFF, MANUAL_SHELF_SIZE, RIGHT_DESK_X, CABINET_HOTSPOTS, type DeskItemId, type Point, type Rect } from './core/desk';
import { installDeskInput } from './core/desk-input';
import { drawCreatorPortrait, drawPaper, drawPanelIllustration, loadClinicArt, PATIENT_MOTION_FRAMES, type CabinetArtOptions } from './render/clinic';
import { drawText } from './render/font';
import { paperClipRect, visionReading, pressureReading, generalReading, visiblePaperRect } from './render/paperwork';
import { drawerButtons, drawerDescription, renderDrawer, type DrawerAction } from './render/drawer';
import { installCursor, installDisplay, WIDTH, HEIGHT } from './core/display';
import { translations, readPreferences, savePreferences, type Locale } from './i18n';
import { audio } from './core/audio';
import { musicManifest, musicPlaylist, playlistForState } from './core/music';
import { createInitialState, downloadSave, importSave, SaveError } from './core/save';
import { sharePage } from './core/share';
import { releaseLabel } from './core/release';

type Screen = 'welcome' | 'intro' | 'cabinet' | 'credits' | 'saves' | 'break-room' | 'restart' | 'drawer' | 'home';
const app = document.querySelector<HTMLElement>('#app')!;
let desktopActive = !app.hidden;
let desktopFocus: string | undefined;
const viewport = document.querySelector<HTMLElement>('#viewport')!;
const stage = document.querySelector<HTMLElement>('#stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const controls = document.querySelector<HTMLElement>('#controls')!;
const utilityControls = document.querySelector<HTMLElement>('#utility-controls')!;
const sessionControls = document.querySelector<HTMLElement>('#session-controls')!;
const fileInput = document.querySelector<HTMLInputElement>('#save-input')!;
const ctx = canvas.getContext('2d', { alpha: false })!;
ctx.imageSmoothingEnabled = false;
const colors = { ink: '#171d19', bone: '#ddd6b5', muted: '#a5ab91', red: '#bf7052', paper: '#cac5a3', darkRed: '#7c4438', line: '#505c48' };
const preferences = readPreferences();
let locale: Locale = preferences.locale;
let screen: Screen = 'welcome';
let buttons: Button[] = [];
let hovered = '';
let focused = '';
let returnFocus = 'start';
let panelReturn: Screen = 'welcome';
let shiftStarted = false;
let selectedStamp: SelectedStamp = null;
let feedback = '';
let introCharacters = 0;
let homePageIndex = 0;
let typingKey = '';
let activeMusicPlaylist: readonly string[] = musicPlaylist;
let typingTimer: ReturnType<typeof setInterval> | undefined;
let gameState = createInitialState(crypto.getRandomValues(new Uint32Array(1))[0]);
let deskState = createDeskState();
let heldItem: DeskItemId | null = null;
let nextClipId = 1;
let drawerPage = 0;
let deskBeforePickup = deskState;
let manualOpen = false;
let manualPage = 0;
let manualBeforePickup = false;
let clockMinutes = gameState.clockMinutes;
let clockTransition: { from: number; to: number; elapsed: number } | undefined;
const clinicClock = new ClinicClock(performance.now());
let patientMotion: CabinetArtOptions['patientMotion'];
let patientExitHold = 0;
let patientSpeech: (PatientSpeech & { remaining: number; departure: boolean }) | undefined;
let visionSpeechAttempt = 0;
let previousNormalComment = -1;
let clinicSpeech: { comment?: ExaminationComment; speaker: 'doctor' | 'cleaner'; remaining: number } | undefined;
let phoneCall: { kind: 'specialist' | 'employer'; valid: boolean; elapsed: number } | undefined;
let phoneToneTimer: ReturnType<typeof setTimeout> | undefined;
let interruptedPatient: number | undefined;
// Delivery is presentation only: consequences and correspondence are already saved.
const pendingLetters = new Map<number, { patientId: number; remaining: number }>();
const motionQueue: NonNullable<CabinetArtOptions['patientMotion']>[] = [];
const documentId = (id: DeskItemId): DocumentId | undefined => id === 'document' ? 'certificate' : id.startsWith('paper-') ? Number(id.slice(6)) : undefined;
const documentItem = (id: DocumentId): DeskItemId => id === 'certificate' ? 'document' : `paper-${id}`;
function groupItems(id: DeskItemId): DeskItemId[] {
  const record = documentId(id);
  return record === undefined ? [id] : clippedDocuments(gameState, record).map(documentItem);
}
const isHeld = (id: DeskItemId): boolean => heldItem !== null && groupItems(heldItem).includes(id);
const deskView = () => ({ desk: deskState, held: heldItem, heldItems: heldItem ? groupItems(heldItem) : [], patientMotion, manualOpen, manualPage, clockMinutes,
  phoneSpeech: phoneCallText(), patientSpeech: visiblePatientSpeech(), departingPatientId: departingPatientId(),
  clinicSpeech: clinicSpeech ? { text: clinicSpeechText(), speaker: clinicSpeech.speaker } : undefined, hiddenPaperIds: [...pendingLetters.keys()] });
const deskRect = (id: DeskItemId) => itemRect(deskState, id, gameState.visit?.document === 'tray' && heldItem !== 'document', isHeld(id), manualOpen);
const itemControlId = (id: DeskItemId): string => id === 'incoming-referral' ? 'take-document' : id === 'document' ? 'apply-stamp' : id;
function deskItemHelp(id: DeskItemId): string {
  if (isHeld(id)) return t().carryingHelp;
  if (id === 'banknote' || id.startsWith('banknote-')) return t().progression.bribeHelp;
  if (id === 'manual') return t().manualHelp;
  if (id.startsWith('paper-')) {
    const paper = gameState.papers.find(record => record.id === Number(id.slice(6)));
    if (paper?.kind === 'additional-referral') return t().additionalTests.selectionHelp;
    return paper && (paper.kind === 'letter' || paper.kind === 'directive') && !paper.opened ? t().letterHelp : t().paperHelp;
  }
  return t().dragHelp;
}
let busy = false;
let sharing = false;
let saveReadId = 0;
let status = '';
let toast = '';
let toastTimer: ReturnType<typeof setTimeout>;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let musicLevels: readonly number[] = [0, 0, 0];
audio.setMuted(preferences.muted);
audio.setMusicVolume(preferences.musicVolume);
audio.register(musicManifest);
audio.register(effectsManifest);
const t = () => translations[locale];
audio.preparePlaylist(musicPlaylist, () => notify(t().audioError));
const art = new Image();
art.src = `${import.meta.env.BASE_URL}assets/art/title-clinic.png`;
art.onload = render;
art.onerror = () => notify(t().artError);

function rect(x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
}
function text(value: string, x: number, y: number, color = colors.bone, scale = 1, align: 'left' | 'center' | 'right' = 'left'): void {
  drawText(ctx, value, x, y, { color, scale, align });
}
function outline(x: number, y: number, w: number, h: number, color: string): void {
  rect(x, y, w, 1, color); rect(x, y + h - 1, w, 1, color);
  rect(x, y, 1, h, color); rect(x + w - 1, y, 1, h, color);
}

function notify(message: string): void {
  toast = message;
  document.querySelector('#announcement')!.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast = ''; render(); }, 4500);
  render();
}

function persist(): void { savePreferences(locale, audio.isMuted(), audio.getMusicVolume()); }
function setLocale(next: Locale): void {
  deskInput.cancel();
  locale = next; persist(); status = ''; toast = '';
  if (screen === 'intro' || screen === 'home') startTyping();
  if (screen === 'cabinet') feedback = '';
  syncControls(`language-${next}`);
}

function playEffect(id: string): void {
  if (desktopActive && !audio.isMuted()) audio.playSound(id);
}

function stopPhone(): void {
  clearTimeout(phoneToneTimer); phoneCall = undefined;
  audio.stopSound('phone-tone'); audio.stopSound('phone-dial');
}

function phoneCallText(): string | undefined {
  if (!phoneCall) return;
  const d = t().progression.dialogue;
  if (phoneCall.elapsed < 1500) return d.dialing;
  if (phoneCall.elapsed < 3300) return d[phoneCall.kind === 'specialist' ? 'specialistQuestion' : 'employerQuestion'];
  return phoneCall.kind === 'specialist' ? d[phoneCall.valid ? 'specialistValid' : 'specialistInvalid']
    : d[phoneCall.valid ? 'employerValid' : 'employerInvalid'];
}

function typedContent(): string {
  return screen === 'home' ? homePage(gameState, locale, homePageIndex).text : t().intro[gameState.introStep].body;
}

function startTyping(): void {
  if (screen === 'home') gameState = settleWeekend(gameState);
  clearInterval(typingTimer);
  const body = typedContent();
  const key = `${screen}:${gameState.day}:${gameState.introStep}:${homePageIndex}:${locale}`;
  if (typingKey !== key) { typingKey = key; introCharacters = 0; }
  if (reducedMotion.matches) introCharacters = body.length;
  if (introCharacters === body.length) return;
  typingTimer = setInterval(() => {
    if (screen !== 'intro' && screen !== 'home') { clearInterval(typingTimer); return; }
    if (!desktopActive || document.hidden) return;
    introCharacters = Math.min(body.length, introCharacters + 1);
    if (body[introCharacters - 1]?.trim() && (screen === 'intro' || introCharacters % 3 === 0)) playEffect('typewriter');
    if (introCharacters === body.length) {
      clearInterval(typingTimer);
      if (screen === 'home') syncControls(focused || undefined);
    }
    render();
  }, screen === 'home' ? 24 : 55);
}

function advanceHome(): void {
  if (introCharacters < typedContent().length) {
    introCharacters = typedContent().length; clearInterval(typingTimer); syncControls('home-next'); return;
  }
  playEffect('carriage');
  if (homePageIndex < homePages(gameState).length - 1) { homePageIndex++; startTyping(); syncControls('home-next'); }
  else if (gameState.ending === 'bankruptcy') restartGame();
  else if (gameState.ending === 'hospital') { screen = 'break-room'; syncControls('restart'); }
  else handleShiftAction('next-day');
}

function startShift(): void {
  shiftStarted = true;
  screen = gameState.phase;
  if (screen === 'intro' || screen === 'home') startTyping();
  syncControls(screen === 'intro' ? 'intro-next' : screen === 'home' ? 'home-next' : canEndDay(gameState) ? 'end-day' : 'call-patient');
}

function clearPatientMotion(preserveSpeech = false): void {
  patientMotion = undefined; motionQueue.length = 0; patientExitHold = 0;
  if (!preserveSpeech) { patientSpeech = undefined; visionSpeechAttempt = 0; }
}

function departingPatientId(): number | undefined {
  return reducedMotion.matches && !gameState.visit && patientSpeech?.departure ? patientSpeech.patientId : undefined;
}

function visiblePatientSpeech(): PatientSpeech | undefined {
  if (!patientSpeech) return;
  const visibleId = patientMotion?.patientId ?? gameState.visit?.patientId ?? departingPatientId();
  if (patientSpeech.patientId !== visibleId) return;
  if (patientMotion) {
    const progress = patientMotion.frame / (PATIENT_MOTION_FRAMES - 1);
    if (patientMotion.direction === 'enter' ? progress < 0.7 : progress > 0.4) return;
  }
  return patientSpeech;
}

function say(patientId: number, line: PatientSpeech['line'] | undefined, departure = false): void {
  patientSpeech = line ? { patientId, line, remaining: departure ? 1500 : 2400, departure } : undefined;
}

function farewellHold(patientId: number): number {
  return patientSpeech?.departure && patientSpeech.patientId === patientId ? Math.min(1320, patientSpeech.remaining) : 0;
}

function animatePatient(patientId: number, direction: 'enter' | 'exit'): void {
  if (reducedMotion.matches) { clearPatientMotion(true); return; }
  const next = { patientId, direction, frame: 0 };
  if (patientMotion) motionQueue.push(next);
  else { patientMotion = next; patientExitHold = direction === 'exit' ? farewellHold(patientId) : 0; }
}

function updateClock(): void {
  if (gameState.clockMinutes === clockTransition?.to || gameState.clockMinutes === clockMinutes) return;
  if (reducedMotion.matches || gameState.clockMinutes < clockMinutes) {
    clockMinutes = gameState.clockMinutes; clockTransition = undefined;
  } else clockTransition = { from: clockMinutes, to: gameState.clockMinutes, elapsed: 0 };
}

function clinicSpeechText(): string {
  return clinicSpeech?.comment ? examinationCommentText(clinicSpeech.comment, locale)
    : clinicSpeech ? t().examinationSpeech.closing : '';
}

/** Every action path, including carrying and drawer operations, observes closing. */
function performAction(action: GameAction): ActionResult {
  const elapsed = sampleClinicClock();
  if (elapsed?.state.phase === 'home') return elapsed;
  const previous = gameState;
  const result = applyAction(previous, action);
  acceptResult(previous, result);
  if (gameState.day !== previous.day) clinicClock.reset(performance.now());
  clinicClock.setContext(clinicClockRunning(), gameState.visit !== null || gameState.inspection !== null);
  return result;
}

/** Actions and elapsed time share warnings, interruption and clock animation. */
function acceptResult(previous: GameState, result: ActionResult): void {
  gameState = result.state;
  if (gameState === previous) return;
  for (const paper of gameState.papers) {
    if (paper.kind === 'letter' && paper.id >= previous.nextPaperId) {
      pendingLetters.set(paper.id, { patientId: paper.patientId, remaining: 2000 });
    }
  }
  if (previous.phase === 'cabinet' && previous.clockMinutes < CLEANER_WARNING_MINUTES && gameState.clockMinutes >= CLEANER_WARNING_MINUTES) {
    clinicSpeech = { speaker: 'cleaner', remaining: 3600 };
    playEffect(`cleaner-${locale}`);
  }
  if (result.feedback === 'visit-interrupted') interruptedPatient = previous.visit?.patientId;
  updateClock();
}

function clinicClockRunning(): boolean {
  return desktopActive && !document.hidden && gameState.phase === 'cabinet' && (screen === 'cabinet' || screen === 'drawer');
}

function sampleClinicClock(): ActionResult | undefined {
  const now = performance.now();
  const minutes = clinicClock.sample(now, clinicClockRunning(), gameState.visit !== null || gameState.inspection !== null);
  if (!minutes) return;
  const previous = gameState;
  const result = advanceClinicTime(previous, minutes);
  acceptResult(previous, result);
  if (gameState.phase !== 'cabinet') clinicClock.reset(now);
  return result;
}

function spendTime(action: 'handle-item' | 'read-manual'): void {
  performAction(action);
}


function setManualOpen(open: boolean): void {
  manualOpen = open;
  if (open) {
    manualPage = 0;
    const point = deskState.positions.manual;
    const onDesk = point.x >= RIGHT_DESK_X ? point : { x: 222, y: 144 };
    deskState = raiseDeskItem(moveDeskItem(deskState, 'manual', onDesk, false, true), 'manual');
  } else deskState = moveDeskItem(deskState, 'manual', deskState.positions.manual);
}

/** Gameplay owns paper contents; the desk owns only their current geometry. */
function arrangeDocumentGroup(active: DeskItemId, held: boolean, raise = false): void {
  const others = groupItems(active).filter(id => id !== active && deskState.positions[id]);
  const origin = deskState.positions[active];
  for (const [index, id] of others.entries()) {
    const offset = Math.min(others.length - index, 3) * 2;
    deskState = moveDeskItem(deskState, id, { x: origin.x + offset, y: origin.y + offset }, held);
    if (raise) deskState = raiseDeskItem(deskState, id);
  }
  if (raise) deskState = raiseDeskItem(deskState, active);
}

function reconcileDeskPapers(): void {
  if (gameState.visit?.bribe === 'offered') {
    if (!deskState.positions.banknote) deskState = addDeskItem(deskState, 'banknote', { x: 100, y: 198 });
    else if (!deskState.order.includes('banknote')) deskState = raiseDeskItem(deskState, 'banknote');
  } else if (deskState.order.includes('banknote')) deskState = removeDeskItem(deskState, 'banknote');
  const cash = new Set(gameState.banknotes.filter(note => note.location === 'desk').map(note => `banknote-${note.id}`));
  for (const id of deskState.order) if (id.startsWith('banknote-') && !cash.has(id)) deskState = removeDeskItem(deskState, id);
  for (const note of gameState.banknotes) if (note.location === 'desk') {
    deskState = addDeskItem(deskState, `banknote-${note.id}`, { x: 100, y: 190 + (note.id % 5) * 8 });
  }
  if (gameState.drawerItems.manual) deskState = { ...deskState, order: deskState.order.filter(id => id !== 'manual') };
  else if (!deskState.order.includes('manual')) deskState = raiseDeskItem(deskState, 'manual');
  const visible = new Set(gameState.papers.filter(paper => paper.location === 'desk' && !pendingLetters.has(paper.id)).map(paper => `paper-${paper.id}` as DeskItemId));
  for (const id of deskState.order) {
    if (id.startsWith('paper-') && !visible.has(id)) deskState = removeDeskItem(deskState, id);
  }
  for (const paper of gameState.papers) {
    if (paper.location !== 'desk' || pendingLetters.has(paper.id)) continue;
    const id: DeskItemId = `paper-${paper.id}`;
    // Incoming paperwork stays on the left until the player carries each sheet.
    deskState = addDeskItem(deskState, id, { x: 15 + ((paper.id - 1) % 4) * 7, y: 193 + ((paper.id - 1) % 3) * 5 });
  }
  for (const group of gameState.paperClips) {
    const ids = group.map(documentItem);
    const top = [...deskState.order].reverse().find(id => ids.includes(id));
    if (top) arrangeDocumentGroup(heldItem && ids.includes(heldItem) ? heldItem : top, heldItem !== null && ids.includes(heldItem));
  }
}

function announceDesk(message: string, focusId?: string): void {
  feedback = message;
  syncControls(focusId);
  document.querySelector('#announcement')!.textContent = feedback;
}

function finishInspectionPresentation(previous: GameState): string | undefined {
  if (!previous.inspection || gameState.inspection) return;
  heldItem = null;
  reconcileDeskPapers();
  const notice = gameState.papers.find(paper => paper.kind === 'inspection-fine' && paper.id >= previous.nextPaperId);
  if (notice) deskState = raiseDeskItem(moveDeskItem(deskState, `paper-${notice.id}`, DEFAULT_DOCUMENT), `paper-${notice.id}`);
  screen = gameState.phase;
  if (screen === 'home') { homePageIndex = 0; typingKey = ''; startTyping(); return 'home-next'; }
  return notice ? `paper-${notice.id}` : 'call-patient';
}

function handleShiftAction(action: ShiftAction, carryNewSheet = true): void {
  if (action === 'end-day') { deskInput.cancel(); selectedStamp = null; }
  if (action === 'reserved-form') return;
  if (typeof action === 'object') {
    if (action.type === 'store-drawer-item' || action.type === 'retrieve-drawer-item') return;
    const paper = 'paperId' in action ? gameState.papers.find(record => record.id === action.paperId) : undefined;
    if (action.type === 'read-paper') {
      if (paper) { spendTime('read-manual'); announceDesk(paperDescription(paper, locale, isDocumentClipped(gameState, paper.id)), `paper-${paper.id}`); }
      return;
    }
    const previousState = gameState;
    const result = performAction(action);
    gameState = result.state;
    if (result.feedback === 'visit-interrupted') { syncControls(); return; }
    updateClock(); reconcileDeskPapers();
    playEffect('paper');
    if (action.type === 'hand-inspection-paper') {
      const focus = finishInspectionPresentation(previousState) ?? 'talk-inspector';
      announceDesk(t().feedback[result.feedback], focus);
      return;
    }
    if (action.type === 'hand-additional-referral' && previousState.visit && !gameState.visit) {
      stopPhone(); clearPatientMotion();
      if (clinicSpeech?.speaker !== 'cleaner') clinicSpeech = undefined;
      animatePatient(previousState.visit.patientId, 'exit');
      selectedStamp = null; heldItem = null;
      let focus = canEndDay(gameState) ? 'end-day' : 'call-patient';
      if (gameState.phase === 'home') {
        homePageIndex = 0; typingKey = '';
        if (patientMotion || departingPatientId() !== undefined) screen = 'cabinet';
        else { screen = 'home'; clearPatientMotion(); startTyping(); focus = 'home-next'; }
      }
      announceDesk(t().feedback[result.feedback], focus);
      return;
    }
    const focus = action.type === 'select-additional-test' ? `select-additional-test-${action.paperId}-${action.test}` : 'documentId' in action ? itemControlId(documentItem(action.documentId))
      : paper && gameState.papers.some(record => record.id === paper.id && record.location === 'desk') ? `paper-${paper.id}` : 'drawer';
    announceDesk(t().feedback[result.feedback], focus);
    return;
  }
  if (action === 'take-clip') {
    deskInput.cancel();
    const id: DeskItemId = `clip-${nextClipId++}`;
    deskState = addDeskItem(deskState, id, { x: CABINET_HOTSPOTS.clipSupply.x + 12, y: CABINET_HOTSPOTS.clipSupply.y + 10 });
    feedback = t().clipTaken;
    deskInput.pickUp(id);
    document.querySelector('#announcement')!.textContent = feedback;
    return;
  }
  if (action === 'drawer') {
    deskInput.cancel();
    screen = 'drawer'; drawerPage = 0; toast = '';
    playEffect('paper'); syncControls('drawer-close');
    return;
  }
  if (action === 'trash') { announceDesk(t().trashHelp, 'trash'); return; }
  if (action === 'put-away-fit' || action === 'put-away-unfit') {
    deskInput.putAway(action === 'put-away-fit' ? 'stamp-fit' : 'stamp-unfit');
    return;
  }
  if (action === 'manual' || action === 'manual-close' || action === 'manual-prev' || action === 'manual-next') {
    if (action === 'manual-prev') {
      if (manualPage === 0) setManualOpen(false);
      else manualPage--;
    } else if (action === 'manual-next') {
      if (!manualOpen) setManualOpen(true);
      else manualPage = Math.min(manualPageCount(gameState.day) - 1, manualPage + 1);
    }
    else setManualOpen(action === 'manual' && !manualOpen);
    spendTime('read-manual'); playEffect('paper');
    feedback = manualOpen ? manualPageDescription(locale, manualPage, gameState.day) : t().manualClosed;
    const pageFocus = !manualOpen ? 'manual-next'
      : action === 'manual-next' && manualPage === manualPageCount(gameState.day) - 1 ? 'manual-prev' : action;
    syncControls(action === 'manual-prev' || action === 'manual-next' ? pageFocus : 'manual');
    document.querySelector('#announcement')!.textContent = feedback;
    return;
  }
  if (action === 'select-fit' || action === 'select-unfit') {
    spendTime('handle-item');
    selectedStamp = action === 'select-fit' ? 'fit' : 'unfit';
    feedback = `${t().selectedStamp}: ${t()[selectedStamp]}. ${t().stampHere}.`;
    syncControls(action === 'select-fit' ? 'stamp-fit' : 'stamp-unfit');
    document.querySelector('#announcement')!.textContent = feedback;
    return;
  }
  if (action === 'apply-stamp' && !selectedStamp) {
    feedback = t().feedback['stamp-needed']; syncControls('stamp-fit');
    document.querySelector('#announcement')!.textContent = feedback; return;
  }
  const actual: GameAction = action === 'apply-stamp' ? (selectedStamp === 'fit' ? 'stamp-fit' : 'stamp-unfit') : action;
  const previousState = gameState;
  const result = performAction(actual);
  gameState = result.state; feedback = t().feedback[result.feedback];
  if (result.feedback === 'visit-interrupted') { syncControls(); return; }
  if (gameState !== previousState && gameState.visit && clinicSpeech?.speaker !== 'cleaner') {
    const comment = examinationComment(actual, gameState.visit, previousNormalComment);
    if (comment?.kind === 'normal') previousNormalComment = comment.variant;
    if (comment) clinicSpeech = { comment, speaker: 'doctor', remaining: 1900 };
  }
  reconcileDeskPapers();
  updateClock();
  screen = gameState.phase;
  let focusId: string = action;
  let newSheet: DeskItemId | undefined;
  let sheetSupply: Rect | undefined;
  if (actual === 'advance-intro' || actual === 'skip-intro') {
    playEffect('carriage');
    if (screen === 'intro') { startTyping(); focusId = 'intro-next'; }
    else { clearInterval(typingTimer); focusId = 'call-patient'; }
  } else if (result.feedback === 'inspector-arrived') {
    selectedStamp = null; clearPatientMotion(); stopPhone(); clinicSpeech = undefined;
    playEffect('bell'); focusId = 'take-inspection-id';
  } else if (actual === 'take-inspection-id' && result.feedback === 'inspection-id-taken' && gameState !== previousState) {
    playEffect('paper'); newSheet = `paper-${gameState.nextPaperId - 1}`; focusId = newSheet;
  } else if (actual === 'return-inspection-id' || actual === 'talk-inspector') {
    playEffect('paper'); focusId = finishInspectionPresentation(previousState) ?? 'talk-inspector';
  } else if (actual === 'call-patient' && (result.feedback === 'patient-called' || result.feedback === 'patient-returned')) {
    selectedStamp = null; playEffect('bell'); focusId = result.feedback === 'patient-returned' ? `paper-${gameState.nextPaperId - 1}` : 'take-document';
    deskState = moveDeskItem(deskState, 'document', DEFAULT_DOCUMENT);
    // Calling again finishes the previous farewell so the portrait and papers
    // always belong to the same patient, even when the doctor works quickly.
    clearPatientMotion();
    stopPhone(); clinicSpeech = undefined;
    animatePatient(gameState.visit!.patientId, 'enter');
    say(gameState.visit!.patientId, result.feedback === 'patient-returned' ? 'returned' : gameState.visit!.bribe === 'offered' ? 'bribe' : choosePatientSpeech('arrival', { day: gameState.day, patientId: gameState.visit!.patientId }));
  } else if (actual === 'take-document' && result.feedback === 'document-taken') {
    playEffect('paper'); focusId = 'run-general';
    if (gameState !== previousState) newSheet = `paper-${gameState.nextPaperId - 1}`;
  } else if (actual === 'take-specialist' && result.feedback === 'specialist-taken') {
    playEffect('paper');
    if (gameState !== previousState) newSheet = `paper-${gameState.nextPaperId - 1}`;
    focusId = newSheet ?? 'take-document';
  } else if (actual === 'take-certificate' && result.feedback === 'certificate-taken') {
    playEffect('paper'); focusId = 'apply-stamp';
    if (gameState !== previousState) {
      deskState = raiseDeskItem(moveDeskItem(deskState, 'document', DEFAULT_DOCUMENT), 'document');
      newSheet = 'document';
      sheetSupply = CABINET_HOTSPOTS.certificateSupply;
    }
  } else if (actual === 'run-general') {
    focusId = 'run-vision';
    if (gameState !== previousState && gameState.visit) feedback = `${t().generalResult}: ${patientForVisit(gameState)!.general === 'pass' ? t().generalClear : generalReading(gameState.visit.patientId, locale)}.`;
  } else if (actual === 'run-vision') {
    focusId = 'run-pressure';
    if (gameState !== previousState && gameState.visit) {
      feedback += ` ${visionReading(patientForVisit(gameState)!.visionValues, locale)}.`;
      say(gameState.visit.patientId, choosePatientSpeech(result.feedback === 'vision-pass' ? 'vision-pass' : 'vision-refer', {
        day: gameState.day, patientId: gameState.visit.patientId, visionAttempt: visionSpeechAttempt++,
      }));
    }
  }
  else if (actual === 'run-pressure') {
    focusId = 'run-measurements';
    if (gameState !== previousState && gameState.visit) feedback += ` ${pressureReading(gameState.visit.pressureLatest!)} ${t().pressureUnit}.`;
  }
  else if (actual === 'run-measurements') {
    focusId = 'take-paper';
    if (gameState.visit?.measurementsTaken) {
      const patient = PATIENTS[gameState.visit.patientId]!;
      feedback += ` ${patient.weight} ${t().paperwork.kg} / ${patient.height} ${t().paperwork.cm}.`;
    }
  }
  else if ((actual === 'take-paper' || actual === 'take-additional-referral') && gameState !== previousState) {
    playEffect('paper'); focusId = `paper-${gameState.nextPaperId - 1}`;
    newSheet = `paper-${gameState.nextPaperId - 1}`;
    deskState = moveDeskItem(deskState, newSheet, DEFAULT_DOCUMENT);
    sheetSupply = actual === 'take-additional-referral' ? CABINET_HOTSPOTS.additionalReferralSupply : CABINET_HOTSPOTS.paperSupply;
  }
  else if (actual === 'use-phone') {
    stopPhone();
    if (result.feedback === 'phone-ready') {
      playEffect('phone-tone');
      phoneToneTimer = setTimeout(() => audio.stopSound('phone-tone'), 1200);
    } else playEffect('telephone');
    focusId = 'use-phone';
  } else if ((actual === 'call-specialist' || actual === 'call-employer') && gameState !== previousState && gameState.visit) {
    stopPhone(); playEffect('phone-dial');
    const kind = actual === 'call-specialist' ? 'specialist' : 'employer';
    phoneCall = { kind, valid: gameState.visit.calls[kind] === true, elapsed: 0 };
    const paper = gameState.papers.find(paper => paper.day === gameState.visit!.startedDay && paper.patientId === gameState.visit!.patientId && paper.kind === (kind === 'specialist' ? 'specialist' : 'referral'));
    focusId = paper ? `${actual}-${paper.id}` : 'use-phone';
  } else if (actual === 'accept-bribe' || actual === 'return-bribe') {
    playEffect('paper'); focusId = 'run-general';
  }
  else if (actual === 'write-certificate') { playEffect('paper'); focusId = 'apply-stamp'; }
  else if (actual.startsWith('stamp-') && gameState !== previousState) {
    playEffect('stamp'); focusId = 'return-document';
  } else if (actual === 'return-document' && !gameState.visit) {
    stopPhone();
    if (clinicSpeech?.speaker !== 'cleaner') clinicSpeech = undefined;
    if (previousState.visit) {
      say(previousState.visit.patientId, choosePatientSpeech('departure', {
        day: previousState.day, patientId: previousState.visit.patientId, decision: previousState.visit.decision,
      }), true);
      animatePatient(previousState.visit.patientId, 'exit');
    }
    selectedStamp = null; playEffect('paper'); focusId = canEndDay(gameState) ? 'end-day' : 'call-patient';
    if (gameState.phase === 'home') {
      deskInput.cancel(); reconcileDeskPapers();
      homePageIndex = 0; typingKey = '';
      if (patientMotion || departingPatientId() !== undefined) screen = 'cabinet';
      else { clearPatientMotion(); startTyping(); focusId = 'home-next'; }
    }
  } else if (actual === 'end-day' && screen === 'home') {
    clearPatientMotion(); homePageIndex = 0; typingKey = ''; startTyping(); focusId = 'home-next';
  } else if (actual === 'next-day') {
    stopPhone(); clinicSpeech = undefined;
    clearPatientMotion(); clearInterval(typingTimer); homePageIndex = 0;
    clockMinutes = gameState.clockMinutes; clockTransition = undefined; focusId = 'call-patient';
    if (screen === 'home') { typingKey = ''; startTyping(); focusId = 'home-next'; }
  }
  else if (actual === 'toggle-lamp') focusId = 'lamp';
  else if (actual === 'change-decoration') focusId = 'decoration';
  syncControls(focusId);
  if (newSheet && carryNewSheet) {
    deskInput.pickUp(newSheet, false);
    if (sheetSupply) {
      const anchor = itemAnchor(newSheet, deskRect(newSheet));
      deskState = moveDeskItem(deskState, newSheet, {
        x: sheetSupply.x + Math.floor(sheetSupply.w / 2) - anchor.x,
        y: sheetSupply.y + Math.floor(sheetSupply.h / 2) - anchor.y,
      }, true);
      updateDeskControls();
    }
  }
  document.querySelector('#announcement')!.textContent = feedback;
}

function handleDrawerAction(action: DrawerAction): void {
  if (action.type === 'close') { closeScreen(); return; }
  if (action.type === 'page') {
    drawerPage = action.page;
    syncControls('drawer-close');
    document.querySelector('#announcement')!.textContent = drawerDescription(gameState, locale, drawerPage);
    return;
  }
  const result = performAction(action.type === 'paper'
    ? { type: 'retrieve-paper', paperId: action.id }
    : action.type === 'banknote' ? { type: 'retrieve-banknote', banknoteId: action.id }
    : { type: 'retrieve-drawer-item', item: action.item });
  if (result.feedback === 'visit-interrupted') { syncControls(); return; }
  if (gameState.phase === 'home') {
    deskInput.cancel(); clearPatientMotion(); clinicSpeech = undefined;
    screen = 'home'; homePageIndex = 0; typingKey = '';
    feedback = t().feedback[result.feedback];
    startTyping(); syncControls('home-next');
    document.querySelector('#announcement')!.textContent = feedback;
    return;
  }
  if (!['paper-retrieved', 'item-retrieved'].includes(result.feedback)) return;
  gameState = result.state;
  updateClock(); reconcileDeskPapers();
  const id: DeskItemId = action.type === 'paper' ? `paper-${action.id}` : action.type === 'banknote' ? `banknote-${action.id}` : action.item === 'manual' ? 'manual' : `clip-${nextClipId++}`;
  if (id.startsWith('clip-')) deskState = addDeskItem(deskState, id, { x: 304, y: 155 });
  screen = 'cabinet';
  deskInput.pickUp(id, false);
  document.querySelector('#announcement')!.textContent = t().feedback[result.feedback];
}

function openScreen(next: Screen, trigger = 'start'): void {
  deskInput.cancel();
  panelReturn = screen; returnFocus = trigger; screen = next; status = ''; toast = '';
  clearInterval(typingTimer);
  syncControls(next === 'saves' ? 'import' : 'back');
}
function closeScreen(): void {
  deskInput.cancel();
  if (screen === 'drawer') { screen = 'cabinet'; syncControls('drawer'); return; }
  if (screen === 'cabinet' || screen === 'home') { goToMenu(); return; }
  if (screen === 'break-room') { startShift(); return; }
  if (screen === 'restart') { screen = 'break-room'; syncControls('restart'); return; }
  const isPanel = screen === 'credits' || screen === 'saves';
  screen = isPanel ? panelReturn : 'welcome'; status = ''; toast = '';
  if (screen === 'welcome') clearPatientMotion();
  if (screen === 'intro' || screen === 'home') startTyping();
  syncControls(isPanel ? returnFocus : 'start');
}
function goToMenu(): void {
  deskInput.cancel();
  clearInterval(typingTimer); screen = 'break-room'; toast = ''; syncControls('start');
}

function restartGame(): void {
  deskInput.cancel(); clearPatientMotion(); clearInterval(typingTimer);
  saveReadId++; busy = false;
  typingKey = ''; homePageIndex = 0;
  gameState = createInitialState(crypto.getRandomValues(new Uint32Array(1))[0]); deskState = createDeskState(); deskBeforePickup = deskState;
  clinicClock.reset(performance.now());
  nextClipId = 1; pendingLetters.clear(); stopPhone(); clinicSpeech = undefined; interruptedPatient = undefined;
  heldItem = null; selectedStamp = null; manualOpen = false; manualPage = 0; manualBeforePickup = false;
  clockMinutes = gameState.clockMinutes; clockTransition = undefined;
  status = ''; toast = ''; feedback = ''; panelReturn = 'welcome';
  startShift();
}
async function fullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await app.requestFullscreen();
  } catch { notify(t().fullscreenError); }
}

async function shareCurrentPage(): Promise<void> {
  if (sharing) return;
  sharing = true;
  const control = document.getElementById('control-share');
  control?.setAttribute('aria-busy', 'true');
  control?.setAttribute('aria-disabled', 'true');
  const url = window.location.href;
  try {
    const result = await sharePage({ title: t().sharing.title, text: t().sharing.text, url });
    if (result === 'manual') window.prompt(t().sharing.manual, url);
    else if (result !== 'cancelled') notify(t().sharing[result]);
  } finally {
    sharing = false;
    document.getElementById('control-share')?.removeAttribute('aria-busy');
    document.getElementById('control-share')?.removeAttribute('aria-disabled');
  }
}

function changeTrack(direction: 'previous' | 'next'): void {
  if (!audio.isMuted()) audio.unlock();
  if (direction === 'previous') audio.previousTrack();
  else audio.nextTrack();
}

// Sample audio outside rendering. No randomness or time values enter drawing code.
function updateMusicMeter(): void {
  const playing = audio.isMusicAudible();
  const levels = playing ? (reducedMotion.matches ? [2, 5, 3] : audio.getMusicLevels()) : [0, 0, 0];
  musicLevels = levels;
  const description = audio.isMuted() || audio.getMusicVolume() === 0 ? t().musicMuted : playing ? t().musicPlaying : t().musicStopped;
  const control = document.getElementById('control-sound');
  if (control?.getAttribute('aria-description') !== description) control?.setAttribute('aria-description', description);
  control?.setAttribute('data-muted', String(audio.isMuted()));
  control?.setAttribute('data-playing', String(playing));
  control?.querySelectorAll<HTMLElement>('.music-meter i').forEach((bar, index) => {
    bar.style.height = `${Math.max(1, musicLevels[index]) * 2}px`;
  });
}

function getButtons(): Button[] {
  if (screen === 'cabinet' && gameState.phase === 'home') return [];
  if (screen === 'home') return [{ id: 'home-next', label: introCharacters < typedContent().length ? t().home.reveal : homePage(gameState, locale, homePageIndex).action,
    ...HOME_ACTION, kind: 'text', action: advanceHome }];
  if (screen === 'drawer') return drawerButtons(gameState, locale, drawerPage, handleDrawerAction);
  if (screen === 'intro' || screen === 'cabinet') return shiftButtons(gameState, locale, selectedStamp, handleShiftAction, deskView());
  if (screen === 'credits') return [
    { id: 'github', label: t().creatorGithub, x: 104, y: 137, w: 170, h: 17, href: 'https://github.com/robertchaba', kind: 'text' },
    { id: 'back', label: t().back, x: 227, y: 216, w: 116, h: 24, action: closeScreen },
  ];
  if (screen === 'saves') return [
    { id: 'export', label: t().export, x: 32, y: 195, w: 208, h: 25, action: () => {
      try { downloadSave(gameState); status = t().exported; }
      catch { status = t().errors['invalid-state']; }
      document.querySelector('#announcement')!.textContent = status; render();
    } },
    { id: 'import', label: t().import, x: 32, y: 227, w: 208, h: 25, kind: 'primary', action: () => { if (!busy) fileInput.click(); } },
    { id: 'back', label: t().back, x: 32, y: 265, w: 116, h: 20, kind: 'text', action: closeScreen },
  ];
  if (screen === 'restart') return [
    { id: 'restart-confirm', label: t().restartConfirm, x: 32, y: 191, w: 208, h: 27, kind: 'primary', action: restartGame },
    { id: 'back', label: t().restartCancel, x: 32, y: 225, w: 208, h: 25, action: closeScreen },
    { id: 'saves', label: t().saves, x: 32, y: 264, w: 208, h: 20, kind: 'text', action: () => openScreen('saves', 'saves') },
  ];
  if (screen === 'break-room') return [
    { id: 'start', label: gameState.phase === 'home' ? t().home.resume : t().resume, x: 32, y: 158, w: 208, h: 27, kind: 'primary', action: startShift },
    { id: 'saves', label: t().saves, x: 32, y: 193, w: 208, h: 25, action: () => openScreen('saves', 'saves') },
    { id: 'restart', label: t().restart, x: 32, y: 228, w: 208, h: 25, action: () => { screen = 'restart'; syncControls('back'); } },
    { id: 'credits', label: t().credits, x: 32, y: 264, w: 91, h: 18, kind: 'text', action: () => openScreen('credits', 'credits') },
  ];
  return [
    { id: 'start', label: shiftStarted ? (gameState.phase === 'home' ? t().home.resume : t().resume) : t().start, x: 32, y: 199, w: 208, h: 27, kind: 'primary', action: startShift },
    { id: 'saves', label: t().saves, x: 32, y: 233, w: 208, h: 24, action: () => openScreen('saves', 'saves') },
    { id: 'credits', label: t().credits, x: 32, y: 264, w: 91, h: 18, kind: 'text', action: () => openScreen('credits', 'credits') },
    { id: 'share', label: t().sharing.label, x: 18, y: 296, w: 66, h: 19, kind: 'text', action: () => { void shareCurrentPage(); } },
  ];
}

function utilityButtons(): Omit<Button, 'x' | 'y' | 'w' | 'h'>[] {
  return [
    { id: 'volume', label: t().musicVolume, kind: 'volume' },
    { id: 'previous-track', label: t().previousTrack, kind: 'previous', action: () => changeTrack('previous') },
    { id: 'next-track', label: t().nextTrack, kind: 'next', action: () => changeTrack('next') },
    { id: 'sound', label: audio.isMuted() ? t().unmute : t().mute, kind: 'sound', action: () => {
      audio.setMuted(!audio.isMuted()); persist(); syncControls('sound');
    } },
    { id: 'language-pl', label: t().languagePolish, kind: 'lang', pressed: locale === 'pl', action: () => setLocale('pl') },
    { id: 'language-en', label: t().languageEnglish, kind: 'lang', pressed: locale === 'en', action: () => setLocale('en') },
    { id: 'fullscreen', label: document.fullscreenElement ? t().exitFullscreen : t().fullscreen, kind: 'fullscreen', action: () => { void fullscreen(); } },
  ];
}

// Original pixel-shaped utility icons live in the page, outside the story canvas.
function utilityIcon(kind: Button['kind']): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('aria-hidden', 'true');
  const paths: Partial<Record<NonNullable<Button['kind']>, string>> = {
    previous: 'M4 5h2v10H4zM14 5v10L7 10z',
    next: 'M14 5h2v10h-2zM6 5v10l7-5z',
    sound: 'M3 8h3l4-4v12l-4-4H3z',
    fullscreen: 'M3 8V3h5v2H5v3zM12 3h5v5h-2V5h-3zM3 12h2v3h3v2H3zM15 12h2v5h-5v-2h3z',
  };
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', paths[kind ?? 'text'] ?? '');
  svg.append(path);
  return svg;
}

function syncUtilityControls(modal: boolean): void {
  utilityControls.replaceChildren();
  sessionControls.replaceChildren();
  utilityControls.inert = modal;
  sessionControls.inert = modal;
  if (screen === 'cabinet' || screen === 'home') {
    for (const [id, label, action] of [
      ['menu', t().menu, goToMenu],
      ['saves', t().archive, () => openScreen('saves', 'saves')],
      ...(canEndDay(gameState) && screen === 'cabinet' ? [['end-day-home', t().endDay, () => handleShiftAction('end-day')] as const] : []),
    ] as const) {
      const element = document.createElement('button');
      element.type = 'button'; element.id = `control-${id}`; element.textContent = label;
      element.addEventListener('click', action);
      sessionControls.append(element);
    }
  }
  for (const button of utilityButtons()) {
    const element = document.createElement(button.kind === 'volume' ? 'input' : 'button');
    element.id = `control-${button.id}`;
    element.setAttribute('aria-label', button.label);
    element.title = button.label;
    if (button.pressed !== undefined) element.setAttribute('aria-pressed', String(button.pressed));
    if (element instanceof HTMLInputElement) {
      element.type = 'range'; element.min = '0'; element.max = '100'; element.step = '1';
      element.value = String(Math.round(audio.getMusicVolume() * 100));
      element.title = `${button.label}: ${element.value}%`;
      element.addEventListener('input', () => {
        audio.setMusicVolume(element.valueAsNumber / 100);
        element.title = `${button.label}: ${element.value}%`;
        persist(); updateMusicMeter();
      });
    } else {
      element.type = 'button';
      if (button.kind === 'lang') element.textContent = button.id.slice(-2).toUpperCase();
      else element.append(utilityIcon(button.kind));
      if (button.kind === 'sound') {
        const meter = document.createElement('span');
        meter.className = 'music-meter'; meter.setAttribute('aria-hidden', 'true');
        meter.append(...[0, 1, 2].map(() => document.createElement('i')));
        element.append(meter);
      }
      element.addEventListener('click', () => { startMusic(); button.action?.(); });
    }
    utilityControls.append(element);
  }
}

function syncControls(focusId?: string): void {
  if (screen === 'cabinet' && focusId === 'call-patient' && gameState.inspection) {
    const card = gameState.papers.find(paper => paper.kind === 'inspection-id' && paper.location === 'desk');
    focusId = gameState.inspection.stage === 'identity'
      ? gameState.inspection.idTaken ? card ? `paper-${card.id}` : 'drawer' : 'take-inspection-id'
      : 'talk-inspector';
  }
  sampleClinicClock();
  if (interruptedPatient !== undefined) {
    const patientId = interruptedPatient;
    interruptedPatient = undefined;
    deskInput.cancel();
    heldItem = null; selectedStamp = null; clinicSpeech = undefined;
    clearPatientMotion(); reconcileDeskPapers();
    animatePatient(patientId, 'exit');
    feedback = t().feedback['visit-interrupted'];
    homePageIndex = 0; typingKey = '';
    screen = patientMotion ? 'cabinet' : 'home';
    if (screen === 'home') startTyping();
    focusId = screen === 'home' ? 'home-next' : undefined;
    document.querySelector('#announcement')!.textContent = feedback;
  }
  if (gameState.phase === 'home' && (screen === 'cabinet' || screen === 'drawer') && !patientMotion && departingPatientId() === undefined) {
    deskInput.cancel(); clearPatientMotion(); clinicSpeech = undefined;
    screen = 'home'; homePageIndex = 0; typingKey = ''; startTyping(); focusId = 'home-next';
  }

  // A canceled or rejected drop restores an older carry snapshot. Keep any
  // correspondence delivered meanwhile present in both geometry and controls.
  reconcileDeskPapers();

  // Preparing even while muted cancels pending requests from the previous scene.
  const playlist = playlistForState(gameState);
  if (playlist !== activeMusicPlaylist) {
    activeMusicPlaylist = playlist;
    audio.preparePlaylist(playlist, () => notify(t().audioError));
    startMusic();
  }
  if (desktopActive) {
    document.documentElement.lang = locale;
    document.title = t().documentTitle;
    document.querySelector('meta[name="description"]')!.setAttribute('content', t().description);
  }
  if (screen !== 'cabinet') stopPhone();
  app.dataset.screen = screen;
  stage.dataset.carrying = String(screen === 'cabinet' && heldItem !== null);
  utilityControls.setAttribute('aria-label', t().utilityControls);
  controls.replaceChildren();
  hovered = ''; focused = '';
  buttons = getButtons();
  const heading = document.createElement('h1');
  heading.className = 'sr-only'; heading.id = 'screen-heading';
  heading.textContent = screen === 'home' ? homePage(gameState, locale, homePageIndex).title : screen === 'drawer' ? t().drawer : screen === 'credits' ? t().creditsTitle : screen === 'saves' ? t().savesTitle : screen === 'break-room' ? t().breakRoomTitle : screen === 'restart' ? t().restartTitle : screen === 'intro' ? t().introTitle : screen === 'cabinet' ? t().cabinetTitle : 'Next, Please!';
  const description = document.createElement('p');
  description.className = 'sr-only'; description.id = 'screen-description';
  description.textContent = screen === 'credits'
    ? `${t().creatorName}. ${t().creatorPortrait} ${t().aiSupport}. ${t().creditsFooter}`
    : screen === 'home' ? `${homePage(gameState, locale, homePageIndex).description} ${homePage(gameState, locale, homePageIndex).text}`
    : screen === 'drawer' ? drawerDescription(gameState, locale, drawerPage)
    : screen === 'intro' ? t().intro[gameState.introStep].body
    : screen === 'cabinet' ? `${shiftDescription(gameState, locale, [...pendingLetters.keys()])} ${manualOpen ? manualPageDescription(locale, manualPage, gameState.day) : ''} ${feedback}`
    : screen === 'saves' ? `${t().savesDescription} ${t().savesBody.join(' ')} ${t().sample}. ${t().day}: ${gameState.day}. ${t().patients}: ${gameState.patientsProcessed}. ${t().money}: ${gameState.money}.`
    : screen === 'break-room' ? t().breakRoomDescription
    : screen === 'restart' ? t().restartBody.join(' ')
    : `${t().subtitle} ${t().tagline} ${t().description} ${releaseLabel(locale)}`;
  controls.append(heading, description);
  controls.dataset.homePage = String(homePageIndex);
  controls.dataset.homeKind = screen === 'home' ? homePage(gameState, locale, homePageIndex).kind : '';
  controls.dataset.screen = screen; controls.dataset.introStep = String(gameState.introStep);
  const modal = screen === 'credits' || screen === 'saves' || screen === 'restart' || screen === 'drawer';
  controls.setAttribute('role', modal ? 'dialog' : 'group');
  controls.setAttribute('aria-labelledby', 'screen-heading');
  controls.setAttribute('aria-describedby', 'screen-description');
  if (!modal) controls.removeAttribute('aria-modal');
  else controls.setAttribute('aria-modal', 'true');
  for (const button of buttons) {
    const element = document.createElement(button.kind === 'volume' ? 'input' : button.href ? 'a' : 'button');
    element.className = 'hit-target'; element.id = `control-${button.id}`;
    element.setAttribute('aria-label', button.label);
    if (button.id === 'share') {
      element.setAttribute('aria-description', t().sharing.description);
      if (sharing) { element.setAttribute('aria-busy', 'true'); element.setAttribute('aria-disabled', 'true'); }
    }
    if (screen !== 'cabinet' && screen !== 'drawer') element.title = button.label;
    if (button.item) {
      element.dataset.item = button.item;
      element.dataset.held = String(isHeld(button.item));
      element.setAttribute('aria-description', deskItemHelp(button.item));
      element.setAttribute('aria-keyshortcuts', 'Space ArrowUp ArrowDown ArrowLeft ArrowRight Enter Escape');
    }
    if (button.owner) element.dataset.owner = button.owner;
    element.style.cssText = `left:${button.x}px;top:${button.y}px;width:${button.w}px;height:${button.h}px;`;
    if (button.item) element.style.zIndex = String(deskState.order.indexOf(button.item) * 2 + 2);
    else if (button.owner) element.style.zIndex = String(deskState.order.indexOf(button.owner) * 2 + 3);
    else if (button.id.startsWith('manual-')) element.style.zIndex = String(deskState.order.indexOf('manual') * 2 + 3);
    else if (button.id.startsWith('paper-action-')) element.style.zIndex = String(deskState.order.indexOf(`paper-${Number(button.id.slice(13))}`) * 2 + 3);
    if (button.pressed !== undefined) element.setAttribute('aria-pressed', String(button.pressed));
    if (element instanceof HTMLAnchorElement) { element.href = button.href!; element.target = '_blank'; element.rel = 'noopener noreferrer'; }
    if (element instanceof HTMLButtonElement) { element.type = 'button'; element.disabled = button.disabled ?? false; }
    if (element instanceof HTMLInputElement) {
      element.type = 'range'; element.min = '0'; element.max = '100'; element.step = '1';
      element.value = String(Math.round(audio.getMusicVolume() * 100));
      element.title = `${button.label}: ${element.value}%`;
      element.addEventListener('input', () => {
        audio.setMusicVolume(element.valueAsNumber / 100);
        element.title = `${button.label}: ${element.value}%`;
        persist(); updateMusicMeter(); render();
      });
    }
    element.addEventListener('click', () => { startMusic(); button.action?.(); });
    element.addEventListener('keydown', event => { if (event instanceof KeyboardEvent && screen === 'home' && event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });
    element.addEventListener('mouseenter', () => { hovered = button.id; render(); });
    element.addEventListener('mouseleave', () => { hovered = ''; render(); });
    element.addEventListener('focus', () => { focused = button.id; render(); });
    element.addEventListener('blur', () => { focused = ''; render(); });
    controls.append(element);
  }
  syncUtilityControls(modal);
  if (desktopActive && focusId) {
    const target = document.getElementById(`control-${focusId}`) ?? controls.querySelector<HTMLElement>('.hit-target');
    target?.focus({ preventScroll: true });
  }
  updateMusicMeter();
  render();
}

function drawButton(button: Button): void {
  const active = hovered === button.id || focused === button.id;
  const { x, y, w, h } = button;
  const onPaper = screen === 'credits';
  const ink = onPaper ? colors.ink : colors.bone;
  if (button.kind === 'hotspot') {
    // Objects keep their artwork on hover. Keyboard focus is the DOM indicator.
    return;
  } else if (button.kind === 'fit' || button.kind === 'unfit') {
    const stampColor = button.kind === 'fit' ? '#667b55' : '#a35e49';
    rect(x + 2, y + 3, w, h, '#191e17');
    rect(x, y, w, h, active || button.pressed ? '#d4c49f' : '#b4a683');
    outline(x, y, w, h, stampColor);
    rect(x + 8, y + 5, 10, 11, '#554b35'); rect(x + 4, y + 14, 18, 5, stampColor);
    text(button.kind === 'fit' ? t().fit : t().unfit, x + 28, y + 7, '#303025');
    if (button.pressed) outline(x - 2, y - 2, w + 4, h + 4, '#dec990');
  } else if (button.kind === 'text') {
    text(button.label, x + 2, y + 4, active ? (onPaper ? colors.darkRed : colors.red) : ink);
    if (active) rect(x + 2, y + h - 1, w - 4, 1, onPaper ? colors.darkRed : colors.red);
  } else {
    rect(x + 2, y + 3, w, h, '#0b100d');
    const primary = button.kind === 'primary';
    rect(x, y, w, h, primary ? (active ? '#db906b' : colors.red) : onPaper ? (active ? '#e4ddbb' : '#b5b395') : (active ? '#354033' : '#20291f'));
    outline(x, y, w, h, primary ? '#d7956b' : onPaper ? '#777e66' : colors.line);
    text(button.label, x + w / 2, y + Math.floor((h - 9) / 2), primary ? '#1f231b' : ink, 1, 'center');
    if (primary) text('>', x + 11, y + Math.floor((h - 9) / 2), '#402c22');
    if (active && !primary) rect(x + 4, y + 5, 2, h - 10, onPaper ? colors.darkRed : colors.red);
  }
}

function paper(x: number, y: number, w: number, h: number, title: string, reference: string): void {
  rect(0, 0, WIDTH, HEIGHT, '#080d0bc9');
  rect(x + 5, y + 6, w, h, '#080d0b');
  drawPaper(ctx, x, y, w, h);
  rect(x, y, 4, h, colors.darkRed);
  text(reference, x + 18, y + 11, '#6a705d');
  text(title, x + 18, y + 28, colors.ink);
  rect(x + 18, y + 45, w - 36, 1, '#7b8069');
}

function drawGameTitle(): void {
  t().gameTitleLines.forEach((line, index) => {
    const y = 55 + index * 42;
    text(line, 34, y + 3, '#0a100c', 5);
    text(line, 31, y, index === 0 ? colors.bone : colors.red, 5);
  });
}

function renderSessionScreen(kind: 'saves' | 'break-room' | 'restart'): void {
  drawPanelIllustration(ctx, kind === 'saves' ? 'saves' : 'break-room');
  if (kind === 'break-room') drawGameTitle();
  else {
    text(kind === 'saves' ? t().savesTitle : t().restartTitle, 32, 42, colors.bone, 2);
    rect(32, 74, 30, 2, colors.red);
    const lines = kind === 'saves' ? t().savesBody : t().restartBody;
    lines.forEach((line, index) => text(line, 32, 94 + index * 14, colors.muted));
  }
  if (kind === 'saves') {
    text(`${t().day}: ${gameState.day}`, 32, 146);
    text(`${t().patients}: ${gameState.patientsProcessed}`, 32, 160);
    text(`${t().money}: ${gameState.money}`, 32, 174);
    if (status || busy) {
      rect(10, 291, 550, 22, '#131b16f2');
      text(busy ? t().loading : status, 285, 297, colors.bone, 1, 'center');
    }
  }
  buttons.forEach(drawButton);
  drawToast();
}

function render(): void {
  if (!desktopActive) return;
  ctx.imageSmoothingEnabled = false;
  controls.dataset.clockMinutes = String(gameState.clockMinutes);
  controls.dataset.clockDisplay = String(clockMinutes);
  controls.dataset.clockMoving = String(clockTransition !== undefined);
  const speech = screen === 'cabinet' ? visiblePatientSpeech() : undefined;
  const speechElement = document.getElementById('patient-speech')!;
  const speechText = speech ? `${t().patientNames[speech.patientId]}: ${t().patientSpeech[speech.line]}` : '';
  if (speechElement.textContent !== speechText) speechElement.textContent = speechText;
  const clinicSpeechElement = document.getElementById('clinic-speech')!;
  const clinicText = screen === 'cabinet' ? [clinicSpeech ? `${t().examinationSpeech[clinicSpeech.speaker]}: ${clinicSpeechText()}` : '', phoneCallText() ?? ''].filter(Boolean).join(' ') : '';
  if (clinicSpeechElement.textContent !== clinicText) clinicSpeechElement.textContent = clinicText;
  if (screen === 'home') {
    renderHome(ctx, gameState, locale, homePageIndex, introCharacters);
    if (focused === 'home-next') outline(HOME_ACTION.x, HOME_ACTION.y, HOME_ACTION.w, HOME_ACTION.h, colors.bone);
    drawToast(); return;
  }
  if (screen === 'intro') {
    renderIntro(ctx, gameState, locale, introCharacters); buttons.forEach(drawButton); drawToast(); return;
  }
  if (screen === 'drawer') {
    renderDrawer(ctx, gameState, locale, drawerPage, hovered || focused); buttons.forEach(drawButton); return;
  }
  if (screen === 'cabinet') {
    renderCabinet(ctx, gameState, locale, selectedStamp, deskView());
    controls.dataset.patientMotion = patientMotion?.direction ?? 'idle';
    controls.dataset.patientFrame = String(patientMotion?.frame ?? 0);
    controls.dataset.manualOpen = String(manualOpen);
    controls.dataset.manualPage = String(manualPage);
    buttons.forEach(drawButton); drawToast(); return;
  }
  if (screen === 'saves' || screen === 'break-room' || screen === 'restart') {
    renderSessionScreen(screen); return;
  }
  rect(0, 0, WIDTH, HEIGHT, colors.ink);
  if (art.complete && art.naturalWidth) ctx.drawImage(art, 0, 0, WIDTH, HEIGHT);
  // Solid low-opacity panels preserve the original pixels and quiet the menu area.
  rect(0, 0, WIDTH, 39, '#121a16ee');
  rect(0, 39, 251, 250, '#0d15142e');
  rect(0, 290, WIDTH, 30, '#111a16ee');
  rect(0, 38, WIDTH, 1, '#485140');
  rect(0, 289, WIDTH, 1, '#485140');
  rect(21, 17, 11, 3, colors.red); rect(25, 13, 3, 11, colors.red);
  text(t().clinic, 40, 15, colors.muted);
  drawGameTitle();
  rect(33, 151, 29, 2, colors.red);
  text(t().subtitle, 33, 160, '#bdc1a6');
  text(t().tagline, 33, 177, '#8e9b84');
  text(releaseLabel(locale), 550, 300, '#6f8069', 1, 'right');

  if (screen === 'credits') {
    paper(78, 72, 414, 176, t().creditsTitle, 'NP / 002');
    drawCreatorPortrait(ctx, 358, 70);
    text(t().creatorName, 104, 126, colors.ink);
    text(t().aiSupport, 104, 164, '#6a705d');
    text(t().creditsFooter, 104, 200, '#6a705d');
  }
  buttons.forEach(drawButton);
  drawToast();
}

function drawToast(): void {
  if (toast) {
    const y = screen === 'welcome' ? 5 : 285;
    rect(10, y, 550, 28, colors.ink); outline(10, y, 550, 28, colors.line);
    text(toast, 285, y + 9, colors.bone, 1, 'center');
  }
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file || busy) return;
  const readId = ++saveReadId;
  busy = true; status = '';
  document.querySelector('#announcement')!.textContent = t().loading;
  render();
  try {
    const loadedState = await importSave(file);
    if (readId !== saveReadId) return;
    deskInput.cancel(); clearPatientMotion(); deskState = createDeskState();
    pendingLetters.clear(); stopPhone(); clinicSpeech = undefined; interruptedPatient = undefined;
    gameState = loadedState; homePageIndex = 0; typingKey = ''; shiftStarted = true; selectedStamp = null; feedback = '';
    clinicClock.reset(performance.now());
    nextClipId = 1; reconcileDeskPapers();
    manualOpen = false; manualPage = 0; clockMinutes = gameState.clockMinutes; clockTransition = undefined;
    if (panelReturn === 'intro' || panelReturn === 'cabinet' || panelReturn === 'home') panelReturn = loadedState.phase;
    // File reads can finish after the player closes the archive. Reconcile the
    // active scene as well as the saved data before rebuilding its controls.
    if (screen === 'intro' || screen === 'cabinet' || screen === 'drawer' || screen === 'home') {
      drawerPage = 0; screen = loadedState.phase;
      if (screen === 'intro' || screen === 'home') startTyping();
    }
    status = t().imported;
  } catch (error) {
    if (readId !== saveReadId) return;
    status = error instanceof SaveError ? t().errors[error.code] : t().errors['read-failed'];
  } finally {
    if (readId === saveReadId) {
      busy = false;
      if (screen === 'saves') {
        syncControls('import');
        document.querySelector('#announcement')!.textContent = status;
      } else {
        syncControls(screen === 'intro' ? 'intro-next' : screen === 'cabinet' ? 'call-patient' : screen === 'home' ? 'home-next' : undefined);
        notify(status);
      }
    }
  }
});

function startMusic(): void {
  if (!desktopActive || audio.isMuted()) return;
  audio.unlock();
  audio.playPlaylist(playlistForState(gameState), () => notify(t().audioError));
}

function updateDeskControls(): void {
  buttons = getButtons();
  for (const button of buttons) {
    const element = document.getElementById(`control-${button.id}`);
    if (!element || !button.item) continue;
    element.style.left = `${button.x}px`; element.style.top = `${button.y}px`;
    element.style.width = `${button.w}px`; element.style.height = `${button.h}px`;
    element.style.zIndex = String(deskState.order.indexOf(button.item) * 2 + 2);
    element.dataset.held = String(isHeld(button.item));
    if (button.pressed !== undefined) element.setAttribute('aria-pressed', String(button.pressed));
    element.setAttribute('aria-description', deskItemHelp(button.item));
  }
  controls.querySelectorAll<HTMLElement>('[id^="control-put-away-"]').forEach(element => {
    if (!buttons.some(button => element.id === `control-${button.id}`)) element.remove();
  });
  stage.dataset.carrying = String(heldItem !== null);
  render();
}

const deskInput = installDeskInput(stage, {
  enabled: () => desktopActive && screen === 'cabinet' && gameState.phase === 'cabinet',
  rect: deskRect,
  begin: (id, chargeHandling) => {
    deskBeforePickup = deskState;
    manualBeforePickup = manualOpen;
    heldItem = id;
    if (id === 'manual') manualOpen = false;
    deskState = pickUpDeskItem(deskState, id, gameState.visit?.document === 'tray', manualBeforePickup);
    arrangeDocumentGroup(id, true, true);
    if (id === 'stamp-fit' || id === 'stamp-unfit') selectedStamp = id === 'stamp-fit' ? 'fit' : 'unfit';
    if (chargeHandling) spendTime('handle-item');
    startMusic(); playEffect('paper');
    document.querySelector('#announcement')!.textContent = t().itemPickedUp;
    syncControls(itemControlId(id));
  },
  move: (id, point) => {
    deskState = moveDeskItem(deskState, id, point, true);
    arrangeDocumentGroup(id, true);
    updateDeskControls();
  },
  drop: (id, point, targetItem) => {
    const position = deskState.positions[id];
    const anchor = itemAnchor(id, deskRect(id));
    const target = point ?? { x: position.x + anchor.x, y: position.y + anchor.y };
    const carried = groupItems(id);
    const overDrawer = containsPoint(dropTargetRect('drawer', id, carried), target);
    const overTrash = containsPoint(dropTargetRect('trash', id, carried), target);
    const visibleItems = [...deskState.order].reverse().filter(other => !carried.includes(other)
      && (other !== 'document' || gameState.visit?.certificateTaken)
      && (other !== 'incoming-referral' || gameState.visit?.document === 'tray'));
    const surfaceBounds = (other: DeskItemId): Rect => visiblePaperRect(gameState.papers.find(paper => `paper-${paper.id}` === other), deskRect(other));
    const surfaceAt = (point: Point): DeskItemId | undefined => visibleItems.find(other => containsPoint(surfaceBounds(other), point));
    const clipAt = (): DeskItemId | undefined => {
      if (targetItem) {
        const targetId = documentId(targetItem);
        return targetId !== undefined && isDocumentClipped(gameState, targetId) ? targetItem : undefined;
      }
      for (const other of visibleItems) {
        const record = documentId(other), bounds = surfaceBounds(other);
        if (record !== undefined && visibleDocumentClip(gameState, record, deskView()) && containsPoint(paperClipRect(bounds), target)) return other;
        if (containsPoint(bounds, target)) return undefined;
      }
      return undefined;
    };
    const joinAtClip = (source: DeskItemId): boolean => {
      const sourceId = documentId(source), clip = clipAt();
      if (sourceId === undefined || !clip) return false;
      const targetId = documentId(clip)!;
      const previous = gameState;
      const result = performAction({ type: 'join-documents', documentId: sourceId, targetId });
      if (result.feedback === 'visit-interrupted') { syncControls(); return true; }
      if (result.state === previous) return false;
      const destination = { ...deskState.positions[clip] };
      gameState = result.state;
      heldItem = null;
      deskState = moveDeskItem(deskState, source, destination);
      arrangeDocumentGroup(source, false, true);
      updateClock();
      playEffect('paper');
      announceDesk(t().feedback[result.feedback], itemControlId(source));
      return true;
    };
    if (id === 'banknote' || id.startsWith('banknote-')) {
      const cash = gameState.banknotes.find(note => id === `banknote-${note.id}`);
      if (containsPoint(PATIENT_HANDOFF, target)) {
        if (cash && !canReturnBanknote(gameState, cash)) {
          announceDesk(t().feedback['bribe-missing'], id); return false;
        }
        heldItem = null;
        handleShiftAction(cash ? { type: 'return-banknote', banknoteId: cash.id } : 'return-bribe');
      } else if (overDrawer) {
        heldItem = null;
        handleShiftAction(cash ? { type: 'store-banknote', banknoteId: cash.id } : 'accept-bribe');
      } else {
        heldItem = null;
        if (!cash) handleShiftAction({ type: 'accept-bribe', location: 'desk' });
        else spendTime('handle-item');
        const placed = cash ?? gameState.banknotes.find(note => canReturnBanknote(gameState, note));
        if (placed && gameState.phase === 'cabinet') {
          const placedId = `banknote-${placed.id}` as const;
          deskState = raiseDeskItem(moveDeskItem(deskState, placedId, position), placedId);
          announceDesk(t().itemDropped, placedId);
        }
      }
      return true;
    }
    if (id === 'incoming-referral') {
      heldItem = null;
      if (containsPoint(TRAY, target) || containsPoint(PATIENT_HANDOFF, target)) {
        deskState = deskBeforePickup;
        syncControls('take-document');
        return true;
      }
      handleShiftAction('take-document', false);
      if (gameState.visit?.document !== 'desk') {
        deskState = deskBeforePickup;
        syncControls('take-document');
        return true;
      }
      const paperId: DeskItemId = `paper-${gameState.nextPaperId - 1}`;
      if (overDrawer || overTrash) {
        handleShiftAction({ type: overDrawer ? 'store-paper' : 'trash-paper', paperId: gameState.nextPaperId - 1 });
        return true;
      }
      if (joinAtClip(paperId)) return true;
      if (deskState.positions[paperId]) {
        deskState = moveDeskItem(deskState, paperId, target.x >= RIGHT_DESK_X
          ? { x: Math.max(RIGHT_DESK_X, target.x - 94), y: target.y - 72 }
          : { x: target.x - 30, y: target.y - 40 });
        deskState = raiseDeskItem(deskState, paperId);
      }
      syncControls(paperId);
      return true;
    }
    if (carried.includes('document') && containsPoint(PATIENT_HANDOFF, target)) {
      heldItem = null;
      deskState = deskBeforePickup;
      handleShiftAction('return-document');
      syncControls(gameState.visit ? itemControlId(id) : canEndDay(gameState) ? 'end-day' : 'call-patient');
      return true;
    }
    if (gameState.inspection && id.startsWith('paper-') && containsPoint(PATIENT_HANDOFF, target)) {
      const paperId = Number(id.slice(6));
      const paper = gameState.papers.find(paper => paper.id === paperId);
      heldItem = null;
      // Inspected originals return to their desk position, including a whole clip group.
      deskState = deskBeforePickup;
      handleShiftAction(paper?.kind === 'inspection-id' ? 'return-inspection-id' : { type: 'hand-inspection-paper', paperId });
      reconcileDeskPapers();
      return true;
    }
    if ((id === 'manual' || id.startsWith('clip-')) && overDrawer) {
      const previous = gameState;
      const result = performAction({ type: 'store-drawer-item', item: id === 'manual' ? 'manual' : 'clip' });
      if (result.feedback === 'visit-interrupted') { syncControls(); return true; }
      if (result.state === previous) { announceDesk(t().feedback[result.feedback], itemControlId(id)); return false; }
      gameState = result.state; heldItem = null;
      if (id === 'manual') { manualOpen = false; deskState = { ...deskBeforePickup, order: deskBeforePickup.order.filter(item => item !== id) }; }
      else deskState = removeDeskItem(deskState, id);
      updateClock(); playEffect('paper'); announceDesk(t().feedback[result.feedback], 'drawer');
      return true;
    }
    const referral = carriedAdditionalReferral(gameState, id, carried);
    if (referral && containsPoint(PATIENT_HANDOFF, target)) {
      deskState = deskBeforePickup;
      handleShiftAction({ type: 'hand-additional-referral', paperId: referral.id });
      if (gameState.papers.some(paper => paper.id === referral.id)) {
        heldItem = id;
        deskState = pickUpDeskItem(deskState, id);
        arrangeDocumentGroup(id, true, true);
        syncControls(itemControlId(id));
        return false;
      }
      heldItem = null;
      return true;
    }
    if (id.startsWith('paper-')) {
      const paperId = Number(id.slice(6));
      if (overDrawer || overTrash) {
        heldItem = null;
        handleShiftAction({ type: overDrawer ? 'store-paper' : 'trash-paper', paperId });
        if (gameState.papers.some(paper => paper.id === paperId && paper.location === 'desk')) {
          deskState = deskBeforePickup;
          syncControls(id);
        }
        return true;
      }
      if (joinAtClip(id)) return true;
      heldItem = null;
      deskState = moveDeskItem(deskState, id, target.x >= RIGHT_DESK_X
        ? { x: Math.max(RIGHT_DESK_X, target.x - itemAnchor(id).x), y: target.y - itemAnchor(id).y }
        : { x: target.x - 30, y: target.y - 40 });
      arrangeDocumentGroup(id, false, true);
      spendTime('handle-item'); playEffect('paper');
      announceDesk(t().itemDropped, id);
      return true;
    }
    if (id.startsWith('clip-')) {
      if (overTrash) {
        heldItem = null; deskState = removeDeskItem(deskState, id);
        spendTime('handle-item');
        announceDesk(t().itemDropped, 'take-clip');
        return true;
      }
      const surface = targetItem ?? surfaceAt(target);
      const record = surface ? documentId(surface) : undefined;
      if (record !== undefined) {
        if (isDocumentClipped(gameState, record)) {
          announceDesk(t().clipNoTarget, id);
          return false;
        }
        heldItem = null;
        deskState = removeDeskItem(deskState, id);
        handleShiftAction({ type: 'clip-document', documentId: record });
        return true;
      }
      heldItem = null;
      if (containsPoint(CABINET_HOTSPOTS.clipSupply, target)) {
        deskState = removeDeskItem(deskState, id);
      } else deskState = moveDeskItem(deskState, id, position);
      spendTime('handle-item');
      announceDesk(t().itemDropped, deskState.positions[id] ? id : 'take-clip');
      return true;
    }
    const rest = restRect(id);
    if (rest) {
      if (containsPoint(rest, target)) {
        deskState = moveDeskItem(deskState, id, rest);
        heldItem = null; selectedStamp = null;
        spendTime('handle-item');
        playEffect('paper');
        document.querySelector('#announcement')!.textContent = t().toolPutAway;
        syncControls(itemControlId(id));
        return true;
      }
      const surface = surfaceAt(target);
      if (gameState.visit?.certificateTaken && surface === 'document') {
        selectedStamp = id === 'stamp-fit' ? 'fit' : 'unfit';
        handleShiftAction('apply-stamp');
      } else {
        spendTime('handle-item');
        feedback = t().toolNoTarget;
        document.querySelector('#announcement')!.textContent = feedback;
      }
      // An impression or a missed attempt never puts the stamp down.
      syncControls(itemControlId(id));
      return false;
    }
    heldItem = null;
    let acted = false;
    if (id === 'manual') {
      manualOpen = false;
      deskState = moveDeskItem(deskState, id, target.x >= RIGHT_DESK_X
        ? { x: Math.max(RIGHT_DESK_X, target.x - itemAnchor(id).x), y: target.y - itemAnchor(id).y }
        : { x: target.x - MANUAL_SHELF_SIZE.w / 2, y: target.y - MANUAL_SHELF_SIZE.h / 2 });
      spendTime('handle-item');
      feedback = t().manualClosed;
      playEffect('paper'); document.querySelector('#announcement')!.textContent = feedback;
      acted = true;
    }
    if (id === 'document' && gameState.visit) {
      if (joinAtClip(id)) return true;
      const toPatient = containsPoint(PATIENT_HANDOFF, target);
      if (toPatient) {
        deskState = deskBeforePickup;
        handleShiftAction('return-document');
        if (gameState.visit) deskState = deskBeforePickup;
        acted = true;
      } else {
        const placed = target.x >= RIGHT_DESK_X
          ? { x: Math.max(RIGHT_DESK_X, target.x - itemAnchor(id).x), y: target.y - itemAnchor(id).y }
          : { x: Math.max(5, Math.min(RIGHT_DESK_X - 66, target.x - 30)), y: target.y - 40 };
        deskState = moveDeskItem(deskState, id, placed);
        arrangeDocumentGroup(id, false, true);
      }
    }
    if (!acted) { spendTime('handle-item'); playEffect('paper'); document.querySelector('#announcement')!.textContent = t().itemDropped; }
    syncControls(gameState.visit || id !== 'document' ? itemControlId(id) : canEndDay(gameState) ? 'end-day' : 'call-patient');
    return true;
  },
  cancel: () => {
    const cancelled = heldItem;
    const restoreFocus = controls.contains(document.activeElement);
    deskState = deskBeforePickup;
    manualOpen = manualBeforePickup;
    if (heldItem === 'stamp-fit' || heldItem === 'stamp-unfit') selectedStamp = null;
    heldItem = null;
    document.querySelector('#announcement')!.textContent = t().moveCancelled;
    syncControls(restoreFocus && cancelled ? itemControlId(cancelled) : undefined);
  },
});

// Elapsed work time is independent of actions, rendering and reduced motion.
function updateClinicTime(): void {
  const previous = gameState;
  sampleClinicClock();
  if (previous === gameState) return;
  if (previous.phase !== gameState.phase || canEndDay(previous) !== canEndDay(gameState)
      || (previous.clockMinutes < SHIFT_END_MINUTES && gameState.clockMinutes >= SHIFT_END_MINUTES)) {
    syncControls(document.activeElement?.id.replace(/^control-/, ''));
  } else if (screen === 'cabinet') {
    // Keep keyboard focus, held items and pointer targets intact on ordinary ticks.
    document.querySelector('#screen-description')!.textContent = `${shiftDescription(gameState, locale, [...pendingLetters.keys()])} ${manualOpen ? manualPageDescription(locale, manualPage, gameState.day) : ''} ${feedback}`;
  }
  render();
}
setInterval(updateClinicTime, 100);
document.addEventListener('visibilitychange', updateClinicTime);
window.addEventListener('pagehide', () => {
  updateClinicTime();
  clinicClock.setContext(false, false);
});
window.addEventListener('pageshow', updateClinicTime);

// Patient movement and brief speech advance only while the room is visible.
setInterval(() => {
  if (!desktopActive || screen !== 'cabinet' || document.hidden || (!patientMotion && !patientSpeech && !clinicSpeech && !phoneCall && pendingLetters.size === 0 && gameState.phase !== 'home')) return;
  if (phoneCall) {
    phoneCall.elapsed += 60;
    if (phoneCall.elapsed >= 7500) stopPhone();
  }
  if (clinicSpeech) {
    clinicSpeech.remaining -= 60;
    if (clinicSpeech.remaining <= 0) clinicSpeech = undefined;
  }
  if (patientSpeech && visiblePatientSpeech()) {
    patientSpeech.remaining -= 60;
    if (patientSpeech.remaining <= 0) patientSpeech = undefined;
  }
  if (patientMotion) {
    if (reducedMotion.matches) clearPatientMotion(true);
    else if (patientExitHold > 0) patientExitHold -= 60;
    else if (patientMotion.frame < PATIENT_MOTION_FRAMES - 1) patientMotion = { ...patientMotion, frame: patientMotion.frame + 1 };
    else {
      patientMotion = motionQueue.shift();
      patientExitHold = patientMotion?.direction === 'exit' ? farewellHold(patientMotion.patientId) : 0;
    }
  }
  if (patientSpeech && !patientMotion && !gameState.visit && !departingPatientId()) patientSpeech = undefined;
  let delivered = false;
  for (const [id, delivery] of pendingLetters) {
    delivery.remaining -= 60;
    const leaving = (patientMotion?.direction === 'exit' && patientMotion.patientId === delivery.patientId)
      || (patientSpeech?.departure && patientSpeech.patientId === delivery.patientId);
    if (delivery.remaining <= 0 && !leaving) { pendingLetters.delete(id); delivered = true; }
  }
  if (delivered) { reconcileDeskPapers(); syncControls(focused || undefined); }
  if (gameState.phase === 'home' && !patientMotion && departingPatientId() === undefined) {
    clearPatientMotion(); screen = 'home'; homePageIndex = 0; typingKey = ''; startTyping(); syncControls('home-next'); return;
  }
  render();
}, 60);
setInterval(() => {
  if (!desktopActive || !clockTransition || screen !== 'cabinet' || document.hidden) return;
  clockTransition.elapsed += 40;
  const progress = Math.min(1, clockTransition.elapsed / 800);
  clockMinutes = clockTransition.from + (clockTransition.to - clockTransition.from) * progress;
  if (progress === 1) clockTransition = undefined;
  render();
}, 40);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    clearPatientMotion(true); clockTransition = undefined; clockMinutes = gameState.clockMinutes;
    if (screen === 'intro' || screen === 'home') { startTyping(); syncControls(focused || undefined); }
    else render();
  }
});

// Runs after button actions so enabling audio starts music in the same gesture.
document.addEventListener('click', startMusic);
document.addEventListener('keydown', event => {
  if (!desktopActive) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (!event.repeat) startMusic();
  if (event.key === 'Escape' && screen !== 'welcome') {
    event.preventDefault();
    if (screen === 'cabinet' && manualOpen) handleShiftAction('manual-close');
    else closeScreen();
  }
  if (event.key.toLowerCase() === 'f' && !event.repeat) { event.preventDefault(); void fullscreen(); }
  if (event.key === 'Tab' && (screen === 'credits' || screen === 'saves' || screen === 'restart' || screen === 'drawer')) {
    const elements = [...controls.querySelectorAll<HTMLElement>('.hit-target')];
    const index = elements.indexOf(document.activeElement as HTMLElement);
    if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === elements.length - 1)) {
      event.preventDefault(); elements[event.shiftKey ? elements.length - 1 : 0]?.focus();
    }
  }
});
document.addEventListener('fullscreenchange', () => {
  if (!desktopActive) return;
  const control = document.getElementById('control-fullscreen');
  const label = document.fullscreenElement ? t().exitFullscreen : t().fullscreen;
  control?.setAttribute('aria-label', label);
  control?.setAttribute('title', label);
  buttons = getButtons();
  render();
});
const fitDisplay = installDisplay(app, viewport, stage);
installCursor(stage);
syncControls();
void loadClinicArt().then(() => { stage.dataset.artReady = 'true'; render(); }).catch(() => notify(t().artError));
setInterval(() => {
  if (desktopActive && !document.hidden) updateMusicMeter();
}, 100);

/** Preserve the live desk and pause its presentation while the phone is shown. */
export function setDesktopActive(active: boolean): void {
  if (desktopActive === active) return;
  if (!active) {
    desktopFocus = app.contains(document.activeElement) ? document.activeElement?.id : undefined;
    deskInput.cancel();
    stopPhone();
    desktopActive = false;
    updateClinicTime();
    audio.pauseMusic();
    for (const id of Object.keys(effectsManifest)) audio.stopSound(id);
    return;
  }
  desktopActive = true;
  const preferences = readPreferences();
  const changedLocale = locale !== preferences.locale;
  locale = preferences.locale;
  audio.setMuted(preferences.muted);
  audio.setMusicVolume(preferences.musicVolume);
  if (changedLocale && (screen === 'intro' || screen === 'home')) startTyping();
  syncControls(desktopFocus?.replace(/^control-/, ''));
  fitDisplay();
}
