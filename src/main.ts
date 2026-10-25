import './style.css';
import { detectMobileDevice, isMobileViewport } from './core/device';

// Real phones remain on the reception across rotations. Desktop windows can
// switch both ways, keeping each view and its in-memory state alive.
const mobileDevice = detectMobileDevice();
const wantsReception = () => mobileDevice || isMobileViewport(innerWidth, innerHeight);
const desktopApp = document.querySelector<HTMLElement>('#app')!;
const desktopMarkup = document.createDocumentFragment();
desktopMarkup.append(...desktopApp.childNodes);
desktopApp.hidden = true;
desktopApp.inert = true;
const mobileApp = document.createElement('main');
mobileApp.id = 'mobile-app';
mobileApp.hidden = true;
mobileApp.inert = true;
desktopApp.after(mobileApp);
let desktop: typeof import('./desktop') | undefined;
let mobile: ReturnType<typeof import('./mobile')['startMobileReception']> | undefined;
let showingReception: boolean | undefined;
let switching = false;

async function updateView(): Promise<void> {
  if (switching) return;
  switching = true;
  try {
    while (showingReception !== wantsReception()) {
      const reception = wantsReception();
      showingReception = undefined;
      if (reception) {
        desktop?.setDesktopActive(false);
        if (document.fullscreenElement === desktopApp) await document.exitFullscreen();
        desktopApp.hidden = true; desktopApp.inert = true;
        if (!mobile) {
          const { startMobileReception } = await import('./mobile');
          mobile = startMobileReception(mobileApp);
        }
        if (!wantsReception()) continue;
        mobileApp.hidden = false; mobileApp.inert = false;
        mobile.setActive(true);
      } else {
        mobile?.setActive(false);
        mobileApp.hidden = true; mobileApp.inert = true;
        if (!desktop) {
          desktopApp.append(desktopMarkup);
          desktop = await import('./desktop');
        }
        if (wantsReception()) continue;
        desktopApp.hidden = false; desktopApp.inert = false;
        desktop.setDesktopActive(true);
      }
      showingReception = reception;
    }
  } finally { switching = false; }
}
window.addEventListener('resize', () => { void updateView(); });
await updateView();
