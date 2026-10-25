import { audio } from './core/audio';
import { effectsManifest } from './core/effects';
import { readPreferences, savePreferences, translations, type Locale } from './i18n';
import { drawMobileDialogue, drawMobileLabel, drawMobileNote, mobileStatusLines } from './render/mobile';

const steps = ['tone', 'dialing', 'greeting', 'reply', 'note'] as const;
type Step = typeof steps[number];

/** A reception vignette, independent of gameplay, saves, and the desktop renderer. */
export function startMobileReception(app: HTMLElement): { setActive(active: boolean): void } {
  let preferences = readPreferences();
  let active = false;
  let locale: Locale = preferences.locale;
  let step: Step = 'tone';
  let activeSound: string | undefined;
  let activated = false;
  let noteArt: HTMLImageElement | undefined;
  let balloonArt: HTMLImageElement | undefined;
  app.className = 'mobile-app';
  app.innerHTML = `
    <section id="mobile-reception" data-step="tone">
      <button id="mobile-receiver" type="button"><img id="mobile-handset" alt="" /></button>
      <header class="mobile-toolbar">
        <div id="mobile-settings" role="group">
          <button id="mobile-language-pl" type="button"><canvas aria-hidden="true"></canvas></button>
          <button id="mobile-language-en" type="button"><canvas aria-hidden="true"></canvas></button>
          <button id="mobile-sound" type="button"><img alt="" width="36" height="36" /></button>
        </div>
      </header>
      <div id="mobile-dialogue" class="mobile-overlay" hidden>
        <canvas width="260" height="132" aria-hidden="true"></canvas>
        <p class="sr-only"></p>
      </div>
      <div id="mobile-note" class="mobile-overlay" hidden tabindex="-1" role="region">
        <canvas width="280" height="260" aria-hidden="true"></canvas>
        <p class="sr-only"></p>
      </div>
      <footer class="mobile-footer">
        <p id="mobile-status"><canvas aria-hidden="true"></canvas><span class="sr-only"></span></p>
        <button id="mobile-next" type="button"><canvas aria-hidden="true"></canvas></button>
      </footer>
      <p id="mobile-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
    </section>`;
  const reception = app.querySelector<HTMLElement>('#mobile-reception')!;
  const receiver = app.querySelector<HTMLButtonElement>('#mobile-receiver')!;
  const handset = app.querySelector<HTMLImageElement>('#mobile-handset')!;
  const next = app.querySelector<HTMLButtonElement>('#mobile-next')!;
  const sound = app.querySelector<HTMLButtonElement>('#mobile-sound')!;
  const dialogue = app.querySelector<HTMLElement>('#mobile-dialogue')!;
  const note = app.querySelector<HTMLElement>('#mobile-note')!;
  const announcement = app.querySelector<HTMLElement>('#mobile-announcement')!;
  const status = app.querySelector<HTMLElement>('#mobile-status')!;
  const toolbar = app.querySelector<HTMLElement>('.mobile-toolbar')!;
  const footer = app.querySelector<HTMLElement>('.mobile-footer')!;
  const soundIcon = sound.querySelector('img')!;
  const t = () => translations[locale];
  const persist = () => savePreferences(locale, audio.isMuted(), preferences.musicVolume);
  audio.setMuted(preferences.muted);
  audio.register({ 'phone-tone': effectsManifest['phone-tone'], 'phone-dial': effectsManifest['phone-dial'] });

  function stopPhone(): void {
    audio.stopSound('phone-tone'); audio.stopSound('phone-dial');
    activeSound = undefined;
  }
  function syncAudio(): void {
    const wanted = step === 'tone' ? 'phone-tone' : step === 'dialing' ? 'phone-dial' : undefined;
    if (!active || document.hidden || audio.isMuted() || !activated || !wanted) { stopPhone(); return; }
    if (activeSound === wanted) return;
    stopPhone();
    if (audio.playSound(wanted)) activeSound = wanted;
  }
  function gesture(): void {
    if (active && !audio.isMuted()) { activated = true; audio.unlock(); syncAudio(); }
  }
  function render(): void {
    if (!active) return;
    const labels = t();
    const content = labels.mobile;
    document.documentElement.lang = locale;
    document.title = labels.documentTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', labels.description);
    reception.dataset.step = step;
    reception.setAttribute('aria-label', content.reception);
    app.querySelector('#mobile-settings')!.setAttribute('aria-label', labels.utilityControls);
    receiver.setAttribute('aria-label', content.phoneLabel);
    handset.alt = content.phoneDescription;
    receiver.hidden = step === 'note';
    // Keep the scene image behind the note without an unnecessary focus target.
    reception.style.backgroundImage = step === 'note' ? `url("${handset.src}")` : '';
    sound.setAttribute('aria-label', audio.isMuted() ? labels.unmute : labels.mute);
    sound.setAttribute('aria-pressed', String(!audio.isMuted()));
    soundIcon.src = `${import.meta.env.BASE_URL}assets/art/mobile-sound-${audio.isMuted() ? 'off' : 'on'}.png`;
    for (const value of ['pl', 'en'] as const) {
      const button = app.querySelector<HTMLButtonElement>(`#mobile-language-${value}`)!;
      button.setAttribute('aria-label', value === 'pl' ? labels.languagePolish : labels.languageEnglish);
      button.setAttribute('aria-pressed', String(locale === value));
      drawMobileLabel(button.querySelector('canvas')!, value === 'pl' ? content.languagePolish : content.languageEnglish, 3,
        locale === value ? '#ecdfb3' : '#929c83');
    }
    next.setAttribute('aria-label', labels.next);
    drawMobileLabel(next.querySelector('canvas')!, labels.next, 4);
    next.hidden = step === 'note';
    footer.hidden = step === 'note';
    dialogue.hidden = step !== 'greeting' && step !== 'reply';
    note.hidden = step !== 'note';
    note.setAttribute('aria-label', content.noteLabel);
    const caption = step === 'tone' ? content.tone : step === 'dialing' ? content.dialing : '';
    status.hidden = !audio.isMuted() || !caption;
    status.querySelector('span')!.textContent = caption;
    if (caption) drawMobileLabel(status.querySelector('canvas')!, mobileStatusLines(caption), 3, '#c9c3a1');
    const spoken = step === 'greeting' ? content.greeting : step === 'reply' ? content.reply : '';
    dialogue.querySelector('p')!.textContent = spoken;
    drawMobileDialogue(dialogue.querySelector('canvas')!, balloonArt, spoken);
    note.querySelector('p')!.textContent = `${content.title} ${content.note} ${content.noteHelp}`;
    drawMobileNote(note.querySelector('canvas')!, noteArt, content.title, content.noteLines);
    fit();
  }
  function advance(): void {
    if (!active) return;
    const index = steps.indexOf(step);
    if (index === steps.length - 1) return;
    step = steps[index + 1];
    stopPhone();
    gesture();
    render();
    announcement.textContent = step === 'note' ? '' : step === 'dialing' ? t().mobile.dialing
      : step === 'greeting' ? t().mobile.greeting : t().mobile.reply;
    if (step === 'note') note.focus({ preventScroll: true });
  }
  next.addEventListener('click', advance);
  receiver.addEventListener('click', gesture);
  // Keyboard activation stays with native buttons; held Enter cannot skip the call.
  app.addEventListener('keydown', event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); });
  sound.addEventListener('click', () => {
    stopPhone();
    audio.setMuted(!audio.isMuted());
    persist(); gesture(); render();
  });
  for (const value of ['pl', 'en'] as const) app.querySelector(`#mobile-language-${value}`)!.addEventListener('click', () => {
    locale = value; persist(); gesture(); render();
    announcement.textContent = step === 'greeting' ? t().mobile.greeting : step === 'reply' ? t().mobile.reply
      : step === 'note' ? `${t().mobile.title} ${t().mobile.note} ${t().mobile.noteHelp}` : '';
  });
  document.addEventListener('visibilitychange', syncAudio);
  window.addEventListener('pagehide', stopPhone);
  window.addEventListener('pageshow', syncAudio);
  function fit(): void {
    if (!active) return;
    const width = reception.clientWidth, height = reception.clientHeight;
    const top = toolbar.offsetHeight + 8;
    const bottom = height - (footer.hidden ? 0 : footer.offsetHeight) - 8;
    const fitScale = (nativeWidth: number, nativeHeight: number): number => {
      const available = Math.min((width - 24) / nativeWidth, (bottom - top) / nativeHeight);
      return available >= 1 ? Math.min(2, Math.floor(available)) : Math.max(0.1, available);
    };
    const noteScale = fitScale(280, 260);
    note.style.width = `${280 * noteScale}px`;
    note.style.left = `${Math.round((width - 280 * noteScale) / 2)}px`;
    note.style.top = `${Math.round((top + bottom - 260 * noteScale) / 2)}px`;

    // Follow the actual object-fit rectangle, including crop and landscape offset.
    // The generated tail tip is (67, 0); the handset's upper grille is (128, 92).
    const landscape = width > height;
    const handsetScale = landscape ? Math.min(width / 320, height / 480) : Math.max(width / 320, height / 480);
    const handsetLeft = (width - 320 * handsetScale) * (landscape ? 0.2 : 0.5);
    const handsetTop = (height - 480 * handsetScale) / 2;
    const dialogueScale = fitScale(260, 132);
    const clamp = (value: number, min: number, max: number): number => Math.round(Math.max(min, Math.min(max, value)));
    dialogue.style.width = `${260 * dialogueScale}px`;
    dialogue.style.left = `${clamp(handsetLeft + 128 * handsetScale - 67 * dialogueScale, 12, width - 12 - 260 * dialogueScale)}px`;
    dialogue.style.top = `${clamp(handsetTop + 92 * handsetScale, top, bottom - 132 * dialogueScale)}px`;
  }
  window.addEventListener('resize', fit);
  function load(name: string, accept: (image: HTMLImageElement) => void): void {
    const image = new Image();
    image.onload = () => { accept(image); render(); };
    image.onerror = () => { announcement.textContent = t().artError; };
    image.src = `${import.meta.env.BASE_URL}assets/art/mobile-${name}.png`;
  }
  handset.onerror = () => { announcement.textContent = t().artError; };
  handset.src = `${import.meta.env.BASE_URL}assets/art/mobile-handset.png`;
  load('note', image => { noteArt = image; });
  load('balloon-up', image => { balloonArt = image; });
  return {
    setActive(value: boolean): void {
      if (active === value) return;
      active = value;
      if (!active) { activated = false; stopPhone(); return; }
      preferences = readPreferences();
      locale = preferences.locale;
      audio.setMuted(preferences.muted);
      fit(); render();
      (step === 'note' ? note : next).focus({ preventScroll: true });
    },
  };
}
