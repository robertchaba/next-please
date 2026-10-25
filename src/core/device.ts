export interface MobileDeviceSignals {
  userAgent: string;
  userAgentDataMobile?: boolean;
  maxTouchPoints: number;
  screenWidth: number;
  screenHeight: number;
  coarsePointer: boolean;
  noHover: boolean;
}

/** A phone/tablet-shaped browser window also uses the telephone reception. */
export function isMobileViewport(width: number, height: number): boolean {
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
    && width <= 900 && width * 20 <= height * 17;
}

/** Classify the device at startup, independently of window size or orientation. */
export function shouldUseMobileReception(device: MobileDeviceSignals): boolean {
  if (device.userAgentDataMobile || /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(device.userAgent)) return true;
  // iPadOS can identify itself as desktop Safari even in its default browsing mode.
  if (/Macintosh|Mac OS X/i.test(device.userAgent) && device.maxTouchPoints > 1) return true;

  const shortSide = Math.min(device.screenWidth, device.screenHeight);
  const longSide = Math.max(device.screenWidth, device.screenHeight);
  return device.coarsePointer && device.noHover
    && shortSide > 0 && shortSide <= 1100 && longSide <= 1500;
}

/** Read only device capabilities; callers keep this startup decision across rotations. */
export function detectMobileDevice(): boolean {
  const browser = typeof navigator === 'undefined' ? undefined
    : navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  const display = typeof screen === 'undefined' ? undefined : screen;
  const matches = (query: string): boolean => typeof matchMedia === 'function' && matchMedia(query).matches;
  return shouldUseMobileReception({
    userAgent: browser?.userAgent ?? '',
    userAgentDataMobile: browser?.userAgentData?.mobile,
    maxTouchPoints: browser?.maxTouchPoints ?? 0,
    screenWidth: display?.width ?? 0,
    screenHeight: display?.height ?? 0,
    coarsePointer: matches('(pointer: coarse)'),
    noHover: matches('(hover: none)'),
  });
}
