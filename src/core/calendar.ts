import { translations, type Locale } from '../i18n';

export const GAME_START_DATE = { year: 1983, month: 11, day: 3 } as const;
export type GameDate = { year: number; month: number; day: number; weekday: number };

/** Gregorian civil dates, independent of the wall clock, browser locale and timezone. */
function civilDayNumber(year: number, month: number, day: number): number {
  const adjustedYear = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  return era * 146097 + yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
}

const firstDayNumber = civilDayNumber(GAME_START_DATE.year, GAME_START_DATE.month, GAME_START_DATE.day);

/** Day one is 3 November 1983; each subsequent shift advances one calendar day. */
export function gameDate(shiftDay: number): GameDate {
  if (!Number.isSafeInteger(shiftDay) || shiftDay < 1) throw new RangeError('Invalid game day');
  const dayNumber = firstDayNumber + shiftDay - 1;
  const era = Math.floor(dayNumber / 146097);
  const dayOfEra = dayNumber - era * 146097;
  const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
  const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const marchMonth = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * marchMonth + 2) / 5) + 1;
  const month = marchMonth + (marchMonth < 10 ? 3 : -9);
  return { year: yearOfEra + era * 400 + (month <= 2 ? 1 : 0), month, day, weekday: (shiftDay + 3) % 7 };
}

export function formatGameDate(shiftDay: number, locale: Locale): string {
  const date = gameDate(shiftDay), separator = locale === 'pl' ? '.' : '/';
  return [String(date.day).padStart(2, '0'), String(date.month).padStart(2, '0'), String(date.year)].join(separator);
}

export function calendarText(shiftDay: number, locale: Locale): {
  date: string; day: string; month: string; monthShort: string; year: string; weekday: string; weekdayShort: string;
} {
  const date = gameDate(shiftDay), t = translations[locale].calendar;
  return {
    date: formatGameDate(shiftDay, locale), day: String(date.day), month: t.months[date.month - 1]!,
    monthShort: t.monthsShort[date.month - 1]!, year: String(date.year),
    weekday: t.weekdays[date.weekday]!, weekdayShort: t.weekdaysShort[date.weekday]!,
  };
}
