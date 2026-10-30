import { gameDate } from '../core/calendar';

export const NEW_WEEKEND_ILLUSTRATIONS = [
  'weekend-autumn-park', 'weekend-rain-tram', 'weekend-winter-park',
  'weekend-winter-seaside', 'weekend-spring-park',
  'weekend-summer-garden', 'weekend-reading', 'weekend-radio', 'weekend-soup',
] as const;
export type NewWeekendIllustration = typeof NEW_WEEKEND_ILLUSTRATIONS[number];

/** Presentation only: civil dates and existing save entropy, never a new draw. */
export function ordinaryWeekendIllustrations(day: number): ('weekend-budget' | NewWeekendIllustration)[] {
  const date = gameDate(day);
  const scenes: ('weekend-budget' | NewWeekendIllustration)[] = [
    'weekend-budget', 'weekend-reading', 'weekend-radio', 'weekend-soup',
  ];
  if (date.month === 10 || (date.month === 11 && date.day <= 15)) scenes.push('weekend-autumn-park');
  if ([3, 4, 9, 10, 11].includes(date.month)) scenes.push('weekend-rain-tram');
  if (date.month === 12 || date.month <= 2) scenes.push('weekend-winter-park');
  if (date.month >= 3 && date.month <= 5) scenes.push('weekend-spring-park');
  if (date.month >= 6 && date.month <= 8) scenes.push('weekend-summer-garden');
  return scenes;
}

export function ordinaryWeekendIllustration(day: number, rngState: number): 'weekend-budget' | NewWeekendIllustration {
  const scenes = ordinaryWeekendIllustrations(day);
  return scenes[((rngState >>> 8) + Math.floor(day / 7)) % scenes.length]!;
}

export function weekendTripIllustration(day: number, trip: 'mountain-trip' | 'seaside-trip'):
  'weekend-mountain-resort' | 'weekend-seaside-resort' | 'weekend-winter-seaside' {
  // A single neutral mountain view; the sea retains its distinct winter variant.
  if (trip === 'mountain-trip') return 'weekend-mountain-resort';
  const { month } = gameDate(day);
  const winter = month === 12 || month <= 2;
  return winter ? 'weekend-winter-seaside' : 'weekend-seaside-resort';
}
