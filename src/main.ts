import './style.css';
import { drawText } from './render/font';
import { installCursor, installDisplay, WIDTH, HEIGHT } from './core/display';
import { translations, readPreferences, savePreferences, type Locale } from './i18n';
import { audio } from './core/audio';
import { musicManifest, musicPlaylist } from './core/music';
import { createInitialState, downloadSave, importSave, SaveError } from './core/save';

type Screen = 'welcome' | 'start' | 'credits' | 'saves';
type Button = { id: string; label: string; x: number; y: number; w: number; h: number; action?: () => void; href?: string; kind?: 'primary' | 'text' | 'lang' | 'sound' | 'volume' | 'previous' | 'next' | 'fullscreen'; pressed?: boolean };
const app = document.querySelector<HTMLElement>('#app')!;
const viewport = document.querySelector<HTMLElement>('#viewport')!;
const stage = document.querySelector<HTMLElement>('#stage')!;
const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const controls = document.querySelector<HTMLElement>('#controls')!;
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
let gameState = createInitialState();
let busy = false;
let status = '';
let toast = '';
let toastTimer: ReturnType<typeof setTimeout>;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let musicPlaying = false;
let musicLevels: readonly number[] = [0, 0, 0];
audio.setMuted(preferences.muted);
audio.setMusicVolume(preferences.musicVolume);
audio.register(musicManifest);
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
  locale = next; persist(); status = ''; toast = '';
  syncControls(`language-${next}`);
}

function openScreen(next: Screen, trigger = 'start'): void {
  returnFocus = trigger; screen = next; status = ''; toast = '';
  syncControls(next === 'saves' ? 'import' : 'back');
}
function closeScreen(): void { screen = 'welcome'; status = ''; syncControls(returnFocus); }
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
function updateMusicMeter(): boolean {
  const playing = audio.isMusicAudible();
  const levels = playing ? (reducedMotion.matches ? [2, 5, 3] : audio.getMusicLevels()) : [0, 0, 0];
  const changed = playing !== musicPlaying || levels.some((level, index) => level !== musicLevels[index]);
  musicPlaying = playing;
  musicLevels = levels;
  const description = audio.isMuted() || audio.getMusicVolume() === 0 ? t().musicMuted : playing ? t().musicPlaying : t().musicStopped;
  const control = document.getElementById('control-sound');
  if (control?.getAttribute('aria-description') !== description) control?.setAttribute('aria-description', description);
  return changed;
}

function getButtons(): Button[] {
  if (screen === 'start') return [{ id: 'back', label: t().back, x: 227, y: 235, w: 116, h: 24, action: closeScreen }];
  if (screen === 'credits') return [
    { id: 'github', label: 'github.com/robertchaba', x: 104, y: 106, w: 170, h: 17, href: 'https://github.com/robertchaba', kind: 'text' },
    { id: 'back', label: t().back, x: 227, y: 267, w: 116, h: 24, action: closeScreen },
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
    { id: 'start', label: t().start, x: 32, y: 199, w: 208, h: 27, kind: 'primary', action: () => openScreen('start') },
    { id: 'saves', label: t().saves, x: 32, y: 233, w: 208, h: 24, action: () => openScreen('saves', 'saves') },
    { id: 'credits', label: t().credits, x: 32, y: 264, w: 91, h: 18, kind: 'text', action: () => openScreen('credits', 'credits') },
    { id: 'volume', label: t().musicVolume, x: 322, y: 12, w: 50, h: 20, kind: 'volume' },
    { id: 'previous-track', label: t().previousTrack, x: 382, y: 12, w: 23, h: 20, kind: 'previous', action: () => changeTrack('previous') },
    { id: 'next-track', label: t().nextTrack, x: 408, y: 12, w: 23, h: 20, kind: 'next', action: () => changeTrack('next') },
    { id: 'sound', label: audio.isMuted() ? t().unmute : t().mute, x: 434, y: 12, w: 23, h: 20, kind: 'sound', action: () => {
      audio.setMuted(!audio.isMuted()); persist(); syncControls('sound');
    } },
    { id: 'language-pl', label: 'Polski', x: 471, y: 12, w: 25, h: 20, kind: 'lang', pressed: locale === 'pl', action: () => setLocale('pl') },
    { id: 'language-en', label: 'English', x: 502, y: 12, w: 25, h: 20, kind: 'lang', pressed: locale === 'en', action: () => setLocale('en') },
    { id: 'fullscreen', label: document.fullscreenElement ? t().exitFullscreen : t().fullscreen, x: 536, y: 12, w: 22, h: 20, kind: 'fullscreen', action: () => { void fullscreen(); } },
  ];
}

function syncControls(focusId?: string): void {
  document.documentElement.lang = locale;
  document.title = t().documentTitle;
  document.querySelector('meta[name="description"]')!.setAttribute('content', t().description);
  document.querySelector('#outer-label')!.textContent = t().outer;
  document.querySelector('#screen-note')!.textContent = t().screenNote;
  document.querySelector('#keyboard-note')!.textContent = t().keyboard;
  controls.replaceChildren();
  hovered = ''; focused = '';
  buttons = getButtons();
  const heading = document.createElement('h1');
  heading.className = 'sr-only'; heading.id = 'screen-heading';
  heading.textContent = screen === 'credits' ? t().creditsTitle : screen === 'saves' ? t().savesTitle : screen === 'start' ? t().prototypeTitle : 'Next, Please!';
  const description = document.createElement('p');
  description.className = 'sr-only'; description.id = 'screen-description';
  description.textContent = screen === 'credits'
    ? `${t().creator}: Robert Chaba. ${t().art}: ${t().artName}. ${t().font}. ${t().audio}: ${t().musicSource}. ${t().musicTracks.join(', ')}. ${t().creditsFooter}`
    : screen === 'start' ? `${t().prototypeBody.join(' ')} ${t().prototypeNote}`
    : screen === 'saves' ? `${t().savesBody.join(' ')} ${t().sample}. ${t().day}: ${gameState.day}. ${t().patients}: ${gameState.patientsProcessed}. ${t().money}: ${gameState.money}.`
    : `${t().subtitle} ${t().tagline} ${t().description}`;
  controls.append(heading, description);
  controls.setAttribute('role', screen === 'welcome' ? 'group' : 'dialog');
  controls.setAttribute('aria-labelledby', 'screen-heading');
  controls.setAttribute('aria-describedby', 'screen-description');
  if (screen === 'welcome') controls.removeAttribute('aria-modal');
  else controls.setAttribute('aria-modal', 'true');
  for (const button of buttons) {
    const element = document.createElement(button.kind === 'volume' ? 'input' : button.href ? 'a' : 'button');
    element.className = 'hit-target'; element.id = `control-${button.id}`;
    element.setAttribute('aria-label', button.label);
    element.title = button.label;
    element.style.cssText = `left:${button.x}px;top:${button.y}px;width:${button.w}px;height:${button.h}px;`;
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
    element.addEventListener('click', () => { button.action?.(); });
    element.addEventListener('mouseenter', () => { hovered = button.id; render(); });
    element.addEventListener('mouseleave', () => { hovered = ''; render(); });
    element.addEventListener('focus', () => { focused = button.id; render(); });
    element.addEventListener('blur', () => { focused = ''; render(); });
    controls.append(element);
  }
  if (focusId) document.getElementById(`control-${focusId}`)?.focus({ preventScroll: true });
  updateMusicMeter();
  render();
}

function drawButton(button: Button): void {
  const active = hovered === button.id || focused === button.id;
  const { x, y, w, h } = button;
  const onPaper = screen !== 'welcome';
  const ink = onPaper ? colors.ink : colors.bone;
  if (button.kind === 'lang') {
    if (button.pressed) { rect(x, y + 1, w, h - 2, '#353e31'); rect(x + 5, y + h - 1, w - 10, 1, colors.red); }
    text(button.id.slice(-2), x + w / 2, y + 4, button.pressed || active ? colors.bone : '#818f78', 1, 'center');
  } else if (button.kind === 'volume') {
    const position = Math.round(audio.getMusicVolume() * (w - 4));
    rect(x + 2, y + 10, w - 4, 1, '#3c4939');
    rect(x + 2, y + 10, position, 1, active ? '#a5ab91' : '#65765d');
    rect(x + position, y + 7, 4, 6, active ? colors.bone : '#7b886f');
  } else if (button.kind === 'sound') {
    const color = active ? colors.bone : '#7b886f';
    rect(x + 5, y + 9, 2, 3, color); rect(x + 7, y + 8, 1, 5, color); rect(x + 8, y + 7, 1, 7, color);
    if (audio.isMuted()) { for (let i = 0; i < 3; i++) { rect(x + 13 + i, y + 9 + i, 1, 1, '#966550'); rect(x + 15 - i, y + 9 + i, 1, 1, '#966550'); } }
    else musicLevels.forEach((level, index) => rect(x + 12 + index * 3, y + 14 - Math.max(1, level), 1, Math.max(1, level), musicPlaying ? color : '#46533f'));
  } else if (button.kind === 'previous' || button.kind === 'next') {
    const color = active ? colors.bone : '#7b886f';
    const previous = button.kind === 'previous';
    rect(x + (previous ? 8 : 14), y + 7, 1, 7, color);
    for (let column = 0; column < 4; column++) {
      rect(x + (previous ? 14 - column : 8 + column), y + 7 + column, 1, 7 - column * 2, color);
    }
  } else if (button.kind === 'fullscreen') {
    const color = active ? colors.bone : colors.muted;
    for (const [dx, dy] of [[3, 5], [13, 5], [3, 13], [13, 13]]) {
      rect(x + dx, y + dy, 5, 1, color); rect(x + dx + (dx === 3 ? 0 : 4), y + dy + (dy === 5 ? 0 : -3), 1, 4, color);
    }
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
  rect(x, y, w, h, colors.paper);
  rect(x + 1, y + 1, w - 2, 2, '#e6dfbd');
  // Subtle ruled-paper grain; deterministic at native pixel coordinates.
  for (let row = y + 36; row < y + h - 4; row += 12) rect(x + 8, row, w - 16, 1, '#c4c09f');
  rect(x, y, 4, h, colors.darkRed);
  text(reference, x + 18, y + 11, '#6a705d');
  text(title, x + 18, y + 28, colors.ink);
  rect(x + 18, y + 45, w - 36, 1, '#7b8069');
}

function render(): void {
  ctx.imageSmoothingEnabled = false;
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

  if (screen === 'start') {
    paper(78, 57, 414, 219, t().prototypeTitle, 'NP / 001');
    t().prototypeBody.forEach((line, index) => text(line, 103, 120 + index * 18, colors.ink));
    rect(103, 184, 363, 1, '#96997e');
    text(t().prototypeNote, 103, 196, colors.darkRed);
  } else if (screen === 'credits') {
    paper(78, 25, 414, 278, t().creditsTitle, 'NP / 002');
    text(t().creator, 104, 78, '#6a705d');
    text('ROBERT CHABA', 104, 91, colors.ink);
    text(t().art, 104, 126, '#6a705d');
    text(t().artName, 104, 138, colors.ink);
    text(t().font, 104, 150, colors.ink);
    text(t().audio, 104, 164, '#6a705d');
    text(t().musicSource, 104, 177, colors.ink);
    const musicRows = Math.ceil(t().musicTracks.length / 2);
    t().musicTracks.forEach((track, index) => text(track, 104 + Math.floor(index / musicRows) * 192, 190 + (index % musicRows) * 12, colors.ink));
    text(t().creditsFooter, 285, 251, '#6a705d', 1, 'center');
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
  if (toast) {
    rect(10, 285, 550, 28, colors.ink); outline(10, 285, 550, 28, colors.line);
    text(toast, 285, 294, colors.bone, 1, 'center');
  }
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file || busy) return;
  busy = true; status = ''; render();
  try {
    const loadedState = await importSave(file);
    gameState = loadedState;
    status = t().imported;
  } catch (error) {
    status = error instanceof SaveError ? t().errors[error.code] : t().errors['read-failed'];
  } finally {
    busy = false;
    if (screen === 'saves') {
      syncControls('import');
      document.querySelector('#announcement')!.textContent = status;
    } else notify(status);
  }
});

function startMusic(): void {
  if (audio.isMuted()) return;
  audio.unlock();
  audio.playPlaylist(musicPlaylist, () => notify(t().audioError));
}

// Runs after button actions so enabling audio starts music in the same gesture.
document.addEventListener('click', startMusic);
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (!event.repeat) startMusic();
  if (event.key === 'Escape' && screen !== 'welcome') { event.preventDefault(); closeScreen(); }
  if (event.key.toLowerCase() === 'f' && !event.repeat) { event.preventDefault(); void fullscreen(); }
  if (event.key === 'Tab' && screen !== 'welcome') {
    const elements = [...controls.querySelectorAll<HTMLElement>('.hit-target')];
    const index = elements.indexOf(document.activeElement as HTMLElement);
    if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === elements.length - 1)) {
      event.preventDefault(); elements[event.shiftKey ? elements.length - 1 : 0]?.focus();
    }
  }
});
document.addEventListener('fullscreenchange', () => {
  document.getElementById('control-fullscreen')?.setAttribute('aria-label', document.fullscreenElement ? t().exitFullscreen : t().fullscreen);
  buttons = getButtons();
  render();
});
installDisplay(app, viewport, stage);
installCursor(stage);
syncControls();
setInterval(() => {
  if (screen === 'welcome' && !document.hidden && updateMusicMeter()) render();
}, 100);
