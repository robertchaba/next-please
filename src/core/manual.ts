import { workDayNumber } from './progression';

const SUPPLEMENTS = [
  { id: 'inspection', workDay: 2 },
  { id: 'dates', workDay: 3 },
  { id: 'specialist', workDay: 4 },
  { id: 'authenticity', workDay: 5 },
  { id: 'payments', workDay: 6 },
  { id: 'additionalTests', workDay: 7 },
] as const;

/** Supplements follow working days, including when restoring an older save. */
export function manualSupplementsForDay(day: number): (typeof SUPPLEMENTS[number]['id'])[] {
  const workDay = workDayNumber(day);
  return SUPPLEMENTS.filter(supplement => workDay >= supplement.workDay).map(supplement => supplement.id);
}
