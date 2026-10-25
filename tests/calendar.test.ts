import { describe, expect, it } from 'vitest';
import { calendarText, formatGameDate, gameDate, isWeekend } from '../src/core/calendar';
import { GAME_LIMITS } from '../src/core/game';
import { measureText } from '../src/render/font';

const firstDay = Date.UTC(1983, 10, 3);
const dayFor = (year: number, month: number, day: number): number => (Date.UTC(year, month - 1, day) - firstDay) / 86_400_000 + 1;

describe('civil game calendar', () => {
  it('identifies Saturday and Sunday across the seven-day cycle', () => {
    expect(Array.from({ length: 9 }, (_, i) => isWeekend(i + 1))).toEqual([false, false, true, true, false, false, false, false, false]);
  });
  it('begins on Thursday 3 November 1983 and advances once per shift', () => {
    expect(gameDate(1)).toEqual({ year: 1983, month: 11, day: 3, weekday: 4 });
    expect(gameDate(2)).toEqual({ year: 1983, month: 11, day: 4, weekday: 5 });
    expect(gameDate(29)).toEqual({ year: 1983, month: 12, day: 1, weekday: 4 });
    expect(gameDate(60)).toEqual({ year: 1984, month: 1, day: 1, weekday: 0 });
  });

  it('handles leap days, century exceptions and the full supported save range', () => {
    for (const [year, month, day] of [[1984, 2, 29], [1984, 3, 1], [2000, 2, 29], [2000, 3, 1], [2100, 2, 28], [2100, 3, 1]]) {
      const date = gameDate(dayFor(year!, month!, day!));
      expect(date).toMatchObject({ year, month, day });
    }
    const last = new Date(firstDay + (GAME_LIMITS.day - 1) * 86_400_000);
    expect(gameDate(GAME_LIMITS.day)).toEqual({ year: last.getUTCFullYear(), month: last.getUTCMonth() + 1, day: last.getUTCDate(), weekday: last.getUTCDay() });
    expect(() => gameDate(0)).toThrow(RangeError);
    expect(() => gameDate(1.5)).toThrow(RangeError);
  });

  it('localizes visible dates and short calendar labels without changing the date', () => {
    expect(formatGameDate(1, 'pl')).toBe('03.11.1983');
    expect(formatGameDate(1, 'en')).toBe('03/11/1983');
    expect(calendarText(1, 'pl')).toMatchObject({ day: '3', month: 'listopada', monthShort: 'LIS', weekday: 'czwartek', weekdayShort: 'CZW', year: '1983' });
    expect(calendarText(1, 'en')).toMatchObject({ day: '3', month: 'November', monthShort: 'NOV', weekday: 'Thursday', weekdayShort: 'THU', year: '1983' });
    for (const locale of ['pl', 'en'] as const) for (let day = 1; day <= 366; day++) {
      const text = calendarText(day, locale);
      expect(measureText(text.monthShort) + 1).toBeLessThanOrEqual(18);
      expect(measureText(text.day, 2)).toBeLessThanOrEqual(22);
    }
  });
});
