import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectMobileDevice, isMobileViewport, shouldUseMobileReception, type MobileDeviceSignals } from '../src/core/device';

const desktop: MobileDeviceSignals = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36',
  maxTouchPoints: 0,
  screenWidth: 1920,
  screenHeight: 1080,
  coarsePointer: false,
  noHover: false,
};

describe('mobile reception routing', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('also recognizes narrow portrait browser windows, with explicit width and aspect boundaries', () => {
    for (const [width, height] of [[390, 844], [834, 1194], [900, 1200], [850, 1000]]) {
      expect(isMobileViewport(width, height)).toBe(true);
    }
    for (const [width, height] of [[851, 1000], [901, 1200], [1080, 1920], [844, 390], [540, 480], [0, 800], [390, 0], [NaN, 800], [390, Infinity]]) {
      expect(isMobileViewport(width, height)).toBe(false);
    }
  });

  it.each([
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/145.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 15; Tablet) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36',
  ])('recognizes mobile user agents even with a mouse attached: %s', userAgent => {
    expect(shouldUseMobileReception({ ...desktop, userAgent })).toBe(true);
  });

  it('honors a positive browser mobile hint with a generic user agent', () => {
    expect(shouldUseMobileReception({ ...desktop, userAgentDataMobile: true })).toBe(true);
  });

  it('recognizes an iPad reporting a Mac user agent, while keeping an actual Mac on desktop', () => {
    const mac = { ...desktop, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15' };
    expect(shouldUseMobileReception({ ...mac, maxTouchPoints: 5 })).toBe(true);
    expect(shouldUseMobileReception(mac)).toBe(false);
  });

  it('recognizes touch-first tablets from their physical screen and input capabilities in either orientation', () => {
    const tablet = { ...desktop, userAgent: '', maxTouchPoints: 5, coarsePointer: true, noHover: true };
    expect(shouldUseMobileReception({ ...tablet, screenWidth: 1024, screenHeight: 1366 })).toBe(true);
    expect(shouldUseMobileReception({ ...tablet, screenWidth: 1366, screenHeight: 1024 })).toBe(true);
  });

  it('keeps narrow or portrait mouse desktops and touch laptops on the normal interface', () => {
    expect(shouldUseMobileReception({ ...desktop, screenWidth: 390, screenHeight: 844 })).toBe(false);
    expect(shouldUseMobileReception({ ...desktop, screenWidth: 1080, screenHeight: 1920 })).toBe(false);
    expect(shouldUseMobileReception({ ...desktop, screenWidth: 1366, screenHeight: 768, maxTouchPoints: 10 })).toBe(false);
    expect(shouldUseMobileReception({ ...desktop, screenWidth: 1366, screenHeight: 768, maxTouchPoints: 10, noHover: true })).toBe(false);
  });

  it('does not treat missing screen data or a large touch display as a tablet', () => {
    const touch = { ...desktop, maxTouchPoints: 10, coarsePointer: true, noHover: true };
    expect(shouldUseMobileReception(touch)).toBe(false);
    expect(shouldUseMobileReception({ ...touch, screenWidth: 0, screenHeight: 0 })).toBe(false);
    expect(shouldUseMobileReception({ ...touch, screenWidth: Number.NaN })).toBe(false);
  });

  it('collects screen and primary-pointer signals without depending on the viewport size', () => {
    vi.stubGlobal('navigator', { userAgent: '', maxTouchPoints: 5, userAgentData: { mobile: false } });
    vi.stubGlobal('screen', { width: 834, height: 1194 });
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(pointer: coarse)' || query === '(hover: none)' }));
    expect(detectMobileDevice()).toBe(true);
  });

  it('falls back to desktop when browser capability globals are unavailable', () => {
    vi.stubGlobal('navigator', undefined);
    vi.stubGlobal('screen', undefined);
    vi.stubGlobal('matchMedia', undefined);
    expect(detectMobileDevice()).toBe(false);
  });
});
