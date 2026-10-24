import './style.css';
import { applyAction, type GameAction } from './core/game';
import { effectsManifest } from './core/effects';
import { renderCabinet, renderIntro, shiftButtons, shiftDescription, manualPageDescription, MANUAL_PAGE_COUNT, type SelectedStamp, type ShiftAction } from './scenes/shift';
import type { Button } from './ui';
import { createDeskState, itemRect, moveDeskItem, raiseDeskItem, containsPoint, restRect, itemAnchor, TRAY, TRAY_DOCUMENT, DEFAULT_DOCUMENT, PATIENT_HANDOFF, RIGHT_DESK_X, type DeskItemId } from './core/desk';
import { installDeskInput } from './core/desk-input';
import { drawPaper, loadClinicArt, type CabinetArtOptions } from './render/clinic';
import { drawText } from './render/font';
import { installCursor, installDisplay, WIDTH, HEIGHT } from './core/display';
import { translations, readPreferences, savePreferences, type Locale } from './i18n';
import { audio } from './core/audio';
import { musicManifest, musicPlaylist } from './core/music';
import { createInitialState, downloadSave, importSave, SaveError } from './core/save';

type Screen = 'welcome' | 'intro' | 'cabinet' | 'credits' | 'saves';
const app = document.querySelector<HTMLElement>('#app')!;
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
let typingTimer: ReturnType<typeof setInterval> | undefined;
let gameState = createInitialState();
let deskState = createDeskState();
let heldItem: DeskItemId | null = null;
let deskBeforePickup = deskState;
let manualOpen = false;
let manualPage = 0;
let manualBeforePickup = false;
let clockMinutes = gameState.clockMinutes;
let clockTransition: { from: number; to: number; elapsed: number } | undefined;
let patientMotion: CabinetArtOptions['patientMotion'];
const motionQueue: NonNullable<CabinetArtOptions['patientMotion']>[] = [];
const deskView = () => ({ desk: deskState, held: heldItem, patientMotion, manualOpen, manualPage, clockMinutes });
const deskRect = (id: DeskItemId) => itemRect(deskState, id, gameState.visit?.document === 'tray' && heldItem !== 'document', heldItem === id, manualOpen);
const itemControlId = (id: DeskItemId): string => id === 'document' ? (gameState.visit?.document === 'tray' ? 'take-document' : 'apply-stamp') : id;
let busy = false;
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
audio.playPlaylist(musicPlaylist, () => notify(t().audioError));
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
  if (screen === 'intro') startTyping();
  if (screen === 'cabinet') feedback = '';
  syncControls(`language-${next}`);
}

function playEffect(id: string): void {
  if (!audio.isMuted()) audio.playSound(id);
}

function startTyping(): void {
  clearInterval(typingTimer);
  const body = t().intro[gameState.introStep].body;
  introCharacters = reducedMotion.matches ? body.length : 0;
  if (introCharacters === body.length) return;
  typingTimer = setInterval(() => {
    if (screen !== 'intro') { clearInterval(typingTimer); return; }
    if (document.hidden) return;
    introCharacters = Math.min(body.length, introCharacters + 1);
    if (body[introCharacters - 1]?.trim()) playEffect('typewriter');
    if (introCharacters === body.length) clearInterval(typingTimer);
    render();
  }, 55);
}

function startShift(): void {
  shiftStarted = true; selectedStamp = null;
  screen = gameState.phase; feedback = '';
  if (screen === 'intro') startTyping();
  syncControls(screen === 'intro' ? 'intro-next' : 'call-patient');
}

function clearPatientMotion(): void { patientMotion = undefined; motionQueue.length = 0; }
function animatePatient(patientId: number, direction: 'enter' | 'exit'): void {
  if (reducedMotion.matches) { clearPatientMotion(); return; }
  const next = { patientId, direction, frame: 0 };
  if (patientMotion) motionQueue.push(next);
  else patientMotion = next;
}

function updateClock(): void {
  if (gameState.clockMinutes === clockTransition?.to || gameState.clockMinutes === clockMinutes) return;
  if (reducedMotion.matches || gameState.clockMinutes < clockMinutes) {
    clockMinutes = gameState.clockMinutes; clockTransition = undefined;
  } else clockTransition = { from: clockMinutes, to: gameState.clockMinutes, elapsed: 0 };
}

function spendTime(action: 'handle-item' | 'read-manual'): void {
  gameState = applyAction(gameState, action).state;
  updateClock();
}

function setManualOpen(open: boolean): void {
  manualOpen = open;
  if (open) {
    deskState = raiseDeskItem(moveDeskItem(deskState, 'manual', { x: 222, y: 144 }, false, true), 'manual');
  } else deskState = moveDeskItem(deskState, 'manual', deskState.positions.manual);
}

function handleShiftAction(action: ShiftAction): void {
  if (action === 'put-away-fit' || action === 'put-away-unfit') {
    deskInput.putAway(action === 'put-away-fit' ? 'stamp-fit' : 'stamp-unfit');
    return;
  }
  if (action === 'manual' || action === 'manual-close' || action === 'manual-prev' || action === 'manual-next') {
    if (action === 'manual-prev') manualPage = Math.max(0, manualPage - 1);
    else if (action === 'manual-next') manualPage = Math.min(MANUAL_PAGE_COUNT - 1, manualPage + 1);
    else setManualOpen(action === 'manual' && !manualOpen);
    spendTime('read-manual'); playEffect('paper');
    feedback = manualOpen ? manualPageDescription(locale, manualPage) : t().manualClosed;
    const pageFocus = action === 'manual-next' && manualPage === MANUAL_PAGE_COUNT - 1 ? 'manual-prev'
      : action === 'manual-prev' && manualPage === 0 ? 'manual-next' : action;
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
  const result = applyAction(gameState, actual);
  gameState = result.state; feedback = t().feedback[result.feedback];
  updateClock();
  screen = gameState.phase;
  let focusId: string = action;
  if (actual === 'advance-intro' || actual === 'skip-intro') {
    playEffect('carriage');
    if (screen === 'intro') { startTyping(); focusId = 'intro-next'; }
    else { clearInterval(typingTimer); focusId = 'call-patient'; }
  } else if (actual === 'call-patient' && result.feedback === 'patient-called') {
    selectedStamp = null; playEffect('paper'); focusId = 'take-document';
    deskState = moveDeskItem(deskState, 'document', DEFAULT_DOCUMENT);
    animatePatient(gameState.visit!.patientId, 'enter');
  } else if (actual === 'take-document' && result.feedback === 'document-taken') {
    playEffect('paper'); focusId = 'run-vision';
    if (!heldItem) deskState = raiseDeskItem(moveDeskItem(deskState, 'document', DEFAULT_DOCUMENT), 'document');
  } else if (actual === 'run-vision') focusId = 'run-pressure';
  else if (actual === 'run-pressure') focusId = 'stamp-fit';
  else if (actual.startsWith('stamp-') && gameState !== previousState) {
    playEffect('stamp'); focusId = 'return-document';
  } else if (actual === 'return-document' && !gameState.visit) {
    if (previousState.visit) animatePatient(previousState.visit.patientId, 'exit');
    selectedStamp = null; playEffect('paper'); focusId = gameState.shiftCompleted === 3 ? 'next-day' : 'call-patient';
  } else if (actual === 'next-day') { clearPatientMotion(); focusId = 'call-patient'; }
  else if (actual === 'toggle-lamp') focusId = 'lamp';
  else if (actual === 'change-decoration') focusId = 'decoration';
  syncControls(focusId);
  document.querySelector('#announcement')!.textContent = feedback;
}

function openScreen(next: Screen, trigger = 'start'): void {
  deskInput.cancel();
  panelReturn = screen; returnFocus = trigger; screen = next; status = ''; toast = '';
  clearInterval(typingTimer);
  syncControls(next === 'saves' ? 'import' : 'back');
}
function closeScreen(): void {
  deskInput.cancel();
  const isPanel = screen === 'credits' || screen === 'saves';
  screen = isPanel ? panelReturn : 'welcome'; status = ''; toast = '';
  if (screen === 'welcome') clearPatientMotion();
  if (screen === 'intro') startTyping();
  syncControls(isPanel ? returnFocus : 'start');
}
function goToMenu(): void {
  deskInput.cancel(); clearPatientMotion();
  clearInterval(typingTimer); screen = 'welcome'; toast = ''; syncControls('start');
}
async function fullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await app.requestFullscreen();
  } catch { notify(t().fullscreenError); }
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
  if (screen === 'intro' || screen === 'cabinet') return shiftButtons(gameState, locale, selectedStamp, handleShiftAction, deskView());
  if (screen === 'credits') return [
    { id: 'github', label: 'github.com/robertchaba', x: 104, y: 93, w: 170, h: 17, href: 'https://github.com/robertchaba', kind: 'text' },
    { id: 'back', label: t().back, x: 227, y: 277, w: 116, h: 24, action: closeScreen },
  ];
  if (screen === 'saves') return [
    { id: 'export', label: t().export, x: 106, y: 194, w: 170, h: 25, action: () => {
      try { downloadSave(gameState); status = t().exported; }
      catch { status = t().errors['invalid-state']; }
      document.querySelector('#announcement')!.textContent = status; render();
    } },
    { id: 'import', label: t().import, x: 292, y: 194, w: 170, h: 25, kind: 'primary', action: () => { if (!busy) fileInput.click(); } },
    { id: 'back', label: t().back, x: 227, y: 244, w: 116, h: 23, action: closeScreen },
  ];
  return [
    { id: 'start', label: shiftStarted ? t().resume : t().start, x: 32, y: 199, w: 208, h: 27, kind: 'primary', action: startShift },
    { id: 'saves', label: t().saves, x: 32, y: 233, w: 208, h: 24, action: () => openScreen('saves', 'saves') },
    { id: 'credits', label: t().credits, x: 32, y: 264, w: 91, h: 18, kind: 'text', action: () => openScreen('credits', 'credits') },
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
  if (screen === 'cabinet') {
    for (const [id, label, action] of [
      ['menu', t().menu, goToMenu],
      ['saves', t().archive, () => openScreen('saves', 'saves')],
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
  document.documentElement.lang = locale;
  document.title = t().documentTitle;
  document.querySelector('meta[name="description"]')!.setAttribute('content', t().description);
  app.dataset.screen = screen;
  stage.dataset.carrying = String(screen === 'cabinet' && heldItem !== null);
  utilityControls.setAttribute('aria-label', t().utilityControls);
  controls.replaceChildren();
  hovered = ''; focused = '';
  buttons = getButtons();
  const heading = document.createElement('h1');
  heading.className = 'sr-only'; heading.id = 'screen-heading';
  heading.textContent = screen === 'credits' ? t().creditsTitle : screen === 'saves' ? t().savesTitle : screen === 'intro' ? t().introTitle : screen === 'cabinet' ? t().cabinetTitle : 'Next, Please!';
  const description = document.createElement('p');
  description.className = 'sr-only'; description.id = 'screen-description';
  description.textContent = screen === 'credits'
    ? `${t().creator}: Robert Chaba. ${t().programming}: ${t().programmingName}. ${t().audio}: ${t().musicSource}. ${t().creditsFooter}`
    : screen === 'intro' ? t().intro[gameState.introStep].body
    : screen === 'cabinet' ? `${shiftDescription(gameState, locale)} ${manualOpen ? manualPageDescription(locale, manualPage) : ''} ${feedback}`
    : screen === 'saves' ? `${t().savesBody.join(' ')} ${t().sample}. ${t().day}: ${gameState.day}. ${t().patients}: ${gameState.patientsProcessed}. ${t().money}: ${gameState.money}.`
    : `${t().subtitle} ${t().tagline} ${t().description}`;
  controls.append(heading, description);
  controls.dataset.screen = screen; controls.dataset.introStep = String(gameState.introStep);
  const modal = screen === 'credits' || screen === 'saves';
  controls.setAttribute('role', modal ? 'dialog' : 'group');
  controls.setAttribute('aria-labelledby', 'screen-heading');
  controls.setAttribute('aria-describedby', 'screen-description');
  if (!modal) controls.removeAttribute('aria-modal');
  else controls.setAttribute('aria-modal', 'true');
  for (const button of buttons) {
    const element = document.createElement(button.kind === 'volume' ? 'input' : button.href ? 'a' : 'button');
    element.className = 'hit-target'; element.id = `control-${button.id}`;
    element.setAttribute('aria-label', button.label);
    if (screen !== 'cabinet') element.title = button.label;
    if (button.item) {
      element.dataset.item = button.item;
      element.dataset.held = String(heldItem === button.item);
      element.setAttribute('aria-description', heldItem === button.item ? t().carryingHelp : button.item === 'manual' ? t().manualHelp : t().dragHelp);
      element.setAttribute('aria-keyshortcuts', 'Space ArrowUp ArrowDown ArrowLeft ArrowRight Enter Escape');
    }
    element.style.cssText = `left:${button.x}px;top:${button.y}px;width:${button.w}px;height:${button.h}px;`;
    if (button.item) element.style.zIndex = String(deskState.order.indexOf(button.item) * 2 + 2);
    else if (button.id.startsWith('manual-')) element.style.zIndex = String(deskState.order.indexOf('manual') * 2 + 3);
    if (button.pressed !== undefined) element.setAttribute('aria-pressed', String(button.pressed));
    if (element instanceof HTMLAnchorElement) { element.href = button.href!; element.target = '_blank'; element.rel = 'noopener noreferrer'; }
    if (element instanceof HTMLButtonElement) element.type = 'button';
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
    element.addEventListener('mouseenter', () => { hovered = button.id; render(); });
    element.addEventListener('mouseleave', () => { hovered = ''; render(); });
    element.addEventListener('focus', () => { focused = button.id; render(); });
    element.addEventListener('blur', () => { focused = ''; render(); });
    controls.append(element);
  }
  syncUtilityControls(modal);
  if (focusId) {
    const target = document.getElementById(`control-${focusId}`) ?? controls.querySelector<HTMLElement>('.hit-target');
    target?.focus({ preventScroll: true });
  }
  updateMusicMeter();
  render();
}

function drawButton(button: Button): void {
  const active = hovered === button.id || focused === button.id;
  const { x, y, w, h } = button;
  const onPaper = screen === 'credits' || screen === 'saves';
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

function render(): void {
  ctx.imageSmoothingEnabled = false;
  if (screen === 'intro') {
    renderIntro(ctx, gameState, locale, introCharacters); buttons.forEach(drawButton); drawToast(); return;
  }
  if (screen === 'cabinet') {
    renderCabinet(ctx, gameState, locale, selectedStamp, deskView());
    controls.dataset.patientMotion = patientMotion?.direction ?? 'idle';
    controls.dataset.patientFrame = String(patientMotion?.frame ?? 0);
    controls.dataset.manualOpen = String(manualOpen);
    controls.dataset.manualPage = String(manualPage);
    controls.dataset.clockMinutes = String(gameState.clockMinutes);
    controls.dataset.clockDisplay = String(clockMinutes);
    controls.dataset.clockMoving = String(clockTransition !== undefined);
    buttons.forEach(drawButton); drawToast(); return;
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
  text('NEXT,', 34, 58, '#0a100c', 5); text('NEXT,', 31, 55, colors.bone, 5);
  text('PLEASE!', 34, 100, '#0a100c', 5); text('PLEASE!', 31, 97, colors.red, 5);
  rect(33, 151, 29, 2, colors.red);
  text(t().subtitle, 33, 160, '#bdc1a6');
  text(t().tagline, 33, 177, '#8e9b84');
  // A small enamel department plate on the service window.
  rect(349, 49, 184, 19, '#1c2721'); outline(349, 49, 184, 19, '#5e6853');
  rect(353, 57, 1, 1, colors.bone); rect(528, 57, 1, 1, colors.bone);
  text(t().department, 441, 53, '#c0c4a2', 1, 'center');
  text(t().motto, 20, 300, '#98a58c');
  text(t().build, 550, 300, '#6f8069', 1, 'right');

  if (screen === 'credits') {
    paper(78, 15, 414, 298, t().creditsTitle, 'NP / 002');
    text(t().creator, 104, 65, '#6a705d');
    text('ROBERT CHABA', 104, 78, colors.ink);
    text(t().programming, 104, 136, '#6a705d');
    text(t().programmingName, 104, 151, colors.ink);
    text(t().audio, 104, 197, '#6a705d');
    text(t().musicSource, 104, 212, colors.ink);
    text(t().creditsFooter, 285, 259, '#6a705d', 1, 'center');
  } else if (screen === 'saves') {
    paper(78, 44, 414, 235, t().savesTitle, 'NP / 003');
    t().savesBody.forEach((line, index) => text(line, 103, 101 + index * 14, colors.ink));
    text(t().sample, 103, 139, colors.darkRed);
    text(`${t().day}: ${gameState.day}`, 105, 164, colors.ink);
    text(`${t().patients}: ${gameState.patientsProcessed}`, 209, 164, colors.ink);
    text(`${t().money}: ${gameState.money}`, 461, 164, colors.ink, 1, 'right');
    if (status || busy) text(busy ? t().loading : status, 285, 225, colors.darkRed, 1, 'center');
  }
  buttons.forEach(drawButton);
  drawToast();
}

function drawToast(): void {
  if (toast) {
    rect(10, 285, 550, 28, colors.ink); outline(10, 285, 550, 28, colors.line);
    text(toast, 285, 294, colors.bone, 1, 'center');
  }
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file || busy) return;
  busy = true; status = '';
  document.querySelector('#announcement')!.textContent = t().loading;
  render();
  try {
    const loadedState = await importSave(file);
    deskInput.cancel(); clearPatientMotion(); deskState = createDeskState();
    gameState = loadedState; shiftStarted = true; selectedStamp = null; feedback = '';
    manualOpen = false; manualPage = 0; clockMinutes = gameState.clockMinutes; clockTransition = undefined;
    if (panelReturn === 'intro' || panelReturn === 'cabinet') panelReturn = loadedState.phase;
    // File reads can finish after the player closes the archive. Reconcile the
    // active scene as well as the saved data before rebuilding its controls.
    if (screen === 'intro' || screen === 'cabinet') {
      screen = loadedState.phase;
      if (screen === 'intro') startTyping();
    }
    status = t().imported;
  } catch (error) {
    status = error instanceof SaveError ? t().errors[error.code] : t().errors['read-failed'];
  } finally {
    busy = false;
    if (screen === 'saves') {
      syncControls('import');
      document.querySelector('#announcement')!.textContent = status;
    } else {
      syncControls(screen === 'intro' ? 'intro-next' : screen === 'cabinet' ? 'call-patient' : undefined);
      notify(status);
    }
  }
});

function startMusic(): void {
  if (audio.isMuted()) return;
  audio.unlock();
  audio.playPlaylist(musicPlaylist, () => notify(t().audioError));
}

function updateDeskControls(): void {
  buttons = getButtons();
  for (const button of buttons) {
    const element = document.getElementById(`control-${button.id}`);
    if (!element || !button.item) continue;
    element.style.left = `${button.x}px`; element.style.top = `${button.y}px`;
    element.style.width = `${button.w}px`; element.style.height = `${button.h}px`;
    element.style.zIndex = String(deskState.order.indexOf(button.item) * 2 + 2);
    element.dataset.held = String(heldItem === button.item);
    if (button.pressed !== undefined) element.setAttribute('aria-pressed', String(button.pressed));
    element.setAttribute('aria-description', heldItem === button.item ? t().carryingHelp : button.item === 'manual' ? t().manualHelp : t().dragHelp);
  }
  controls.querySelectorAll<HTMLElement>('[id^="control-put-away-"]').forEach(element => {
    if (!buttons.some(button => element.id === `control-${button.id}`)) element.remove();
  });
  stage.dataset.carrying = String(heldItem !== null);
  render();
}

const deskInput = installDeskInput(stage, {
  enabled: () => screen === 'cabinet',
  rect: deskRect,
  begin: id => {
    deskBeforePickup = deskState;
    manualBeforePickup = manualOpen;
    heldItem = id;
    if (id === 'manual') manualOpen = false;
    const origin = id === 'document' && gameState.visit?.document === 'tray' ? TRAY_DOCUMENT : deskState.positions[id];
    deskState = moveDeskItem(deskState, id, origin, true);
    if (id === 'stamp-fit' || id === 'stamp-unfit') selectedStamp = id === 'stamp-fit' ? 'fit' : 'unfit';
    deskState = raiseDeskItem(deskState, id);
    spendTime('handle-item');
    startMusic(); playEffect('paper');
    document.querySelector('#announcement')!.textContent = t().itemPickedUp;
    syncControls(itemControlId(id));
  },
  move: (id, point) => { deskState = moveDeskItem(deskState, id, point, true); updateDeskControls(); },
  drop: (id, point) => {
    const position = deskState.positions[id];
    const anchor = itemAnchor(id);
    const target = point ?? { x: position.x + anchor.x, y: position.y + anchor.y };
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
      const surface = [...deskState.order].reverse().find(other => other !== id
        && (other !== 'document' || gameState.visit !== null) && containsPoint(deskRect(other), target));
      if (gameState.visit?.document === 'desk' && surface === 'document') {
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
      manualOpen = target.x >= RIGHT_DESK_X;
      deskState = moveDeskItem(deskState, id, manualOpen
        ? { x: Math.max(RIGHT_DESK_X, target.x - 138), y: 144 }
        : { x: Math.max(5, Math.min(RIGHT_DESK_X - 94, target.x - 44)), y: position.y }, false, manualOpen);
      spendTime('read-manual');
      feedback = manualOpen ? manualPageDescription(locale, manualPage) : t().manualClosed;
      playEffect('paper'); document.querySelector('#announcement')!.textContent = feedback;
      acted = true;
    }
    if (id === 'document' && gameState.visit) {
      const onTray = containsPoint(TRAY, target);
      const toPatient = containsPoint(PATIENT_HANDOFF, target);
      if (gameState.visit.document === 'desk' && toPatient) {
        handleShiftAction('return-document');
        if (gameState.visit) deskState = deskBeforePickup;
        acted = true;
      } else if (gameState.visit.document === 'tray' && (onTray || toPatient)) {
        deskState = deskBeforePickup;
      } else {
        const placed = target.x >= RIGHT_DESK_X
          ? { x: Math.max(RIGHT_DESK_X, position.x), y: position.y }
          : { x: Math.max(5, Math.min(RIGHT_DESK_X - 66, target.x - 30)), y: position.y };
        if (gameState.visit.document === 'tray') {
          handleShiftAction('take-document');
          acted = true;
        }
        deskState = moveDeskItem(deskState, id, placed);
      }
    }
    if (!acted) { spendTime('handle-item'); playEffect('paper'); document.querySelector('#announcement')!.textContent = t().itemDropped; }
    syncControls(gameState.visit || id !== 'document' ? itemControlId(id) : gameState.shiftCompleted === 3 ? 'next-day' : 'call-patient');
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

// Six stationary shadow reveals, advanced only by updates.
setInterval(() => {
  if (!patientMotion || screen !== 'cabinet' || document.hidden) return;
  if (reducedMotion.matches) clearPatientMotion();
  else if (patientMotion.frame < 5) patientMotion = { ...patientMotion, frame: patientMotion.frame + 1 };
  else patientMotion = motionQueue.shift();
  render();
}, 140);
setInterval(() => {
  if (!clockTransition || screen !== 'cabinet' || document.hidden) return;
  clockTransition.elapsed += 40;
  const progress = Math.min(1, clockTransition.elapsed / 800);
  clockMinutes = clockTransition.from + (clockTransition.to - clockTransition.from) * progress;
  if (progress === 1) clockTransition = undefined;
  render();
}, 40);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) { clearPatientMotion(); clockTransition = undefined; clockMinutes = gameState.clockMinutes; render(); }
});

// Runs after button actions so enabling audio starts music in the same gesture.
document.addEventListener('click', startMusic);
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (!event.repeat) startMusic();
  if (event.key === 'Escape' && screen !== 'welcome') {
    event.preventDefault();
    if (screen === 'cabinet' && manualOpen) handleShiftAction('manual-close');
    else closeScreen();
  }
  if (event.key.toLowerCase() === 'f' && !event.repeat) { event.preventDefault(); void fullscreen(); }
  if (event.key === 'Tab' && (screen === 'credits' || screen === 'saves')) {
    const elements = [...controls.querySelectorAll<HTMLElement>('.hit-target')];
    const index = elements.indexOf(document.activeElement as HTMLElement);
    if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === elements.length - 1)) {
      event.preventDefault(); elements[event.shiftKey ? elements.length - 1 : 0]?.focus();
    }
  }
});
document.addEventListener('fullscreenchange', () => {
  const control = document.getElementById('control-fullscreen');
  const label = document.fullscreenElement ? t().exitFullscreen : t().fullscreen;
  control?.setAttribute('aria-label', label);
  control?.setAttribute('title', label);
  buttons = getButtons();
  render();
});
installDisplay(app, viewport, stage);
installCursor(stage);
syncControls();
void loadClinicArt().then(() => { stage.dataset.artReady = 'true'; render(); }).catch(() => notify(t().artError));
setInterval(() => {
  if (!document.hidden) updateMusicMeter();
}, 100);
