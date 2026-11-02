import { ordinaryWeekendIllustrations } from './weekend';

export const NEW_ARRIVAL_ILLUSTRATIONS = [
  'home-stairwell', 'home-courtyard', 'home-supper', 'home-kettle',
] as const;
export const NEW_BUDGET_ILLUSTRATIONS = [
  'budget-notebook-warm', 'budget-notebook-cool', 'budget-notebook-coins', 'budget-notebook-cash',
] as const;
export const NEW_HOME_ILLUSTRATIONS = [...NEW_ARRIVAL_ILLUSTRATIONS, ...NEW_BUDGET_ILLUSTRATIONS] as const;
export type NewHomeIllustration = typeof NEW_HOME_ILLUSTRATIONS[number];

const INDOOR_ARRIVALS = [
  'homecoming', ...NEW_ARRIVAL_ILLUSTRATIONS,
  'weekend-budget', 'weekend-reading', 'weekend-radio', 'weekend-soup',
] as const;
export type ArrivalIllustration = typeof INDOOR_ARRIVALS[number] | 'weekend-rain-tram';
export const BUDGET_ILLUSTRATIONS = NEW_BUDGET_ILLUSTRATIONS;

export function arrivalIllustrations(day: number): ArrivalIllustration[] {
  // Share the existing in-game season window, including its month boundaries.
  return [...INDOOR_ARRIVALS, ...(ordinaryWeekendIllustrations(day).includes('weekend-rain-tram')
    ? ['weekend-rain-tram' as const] : [])];
}

/** Presentation uses saved entropy only; reading a card never advances the RNG. */
export function arrivalIllustration(day: number, rngState: number): ArrivalIllustration {
  const scenes = arrivalIllustrations(day);
  return scenes[((rngState >>> 8) + day) % scenes.length]!;
}

export function budgetIllustration(day: number, rngState: number, preceding: readonly string[]) {
  // The ledger never repeats the arrival or optional event background.
  const scenes = BUDGET_ILLUSTRATIONS.filter(scene => !preceding.includes(scene));
  return scenes[((rngState >>> 16) + day) % scenes.length]!;
}
