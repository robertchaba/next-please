import { randomStep } from './patients';
import { gameDate } from './calendar';

export const BASE_PAY = 1000;
export const PATIENT_BONUS = 50;
export const BASE_INSURANCE = 300;
export const MODEST_WEEKEND_LIVING = 800;
export type ExpenseKind = 'medicine' | 'car-repair' | 'home-repair' | 'fur-coat' | 'mountain-trip' | 'seaside-trip';
export interface DailyConsequences {
  zusCases: number;
  refusals: number;
  fines: number;
  insuranceIncrease: number;
}
export interface DaySettlement {
  day: number;
  patients: number;
  basePay: number;
  patientBonus: number;
  income: number;
  livingCost: number;
  insuranceCost: number;
  fines: number;
  event: { kind: ExpenseKind; cost: number } | null;
  expenses: number;
  openingBalance: number;
  closingBalance: number;
  /** Saturday reserves Sunday's already chosen cost; null also preserves legacy ledgers. */
  weekend: { modest: boolean; sundayLivingCost: number } | null;
}
export const emptyConsequences = (): DailyConsequences => ({ zusCases: 0, refusals: 0, fines: 0, insuranceIncrease: 0 });

/** No event below the threshold; probability grows to 85% as savings increase. */
export function expenseProbability(savings: number): number {
  return savings > 2000 ? Math.min(0.85, 0.1 + (savings - 2000) / 10000) : 0;
}
export function settleDay(input: {
  day: number; money: number; shiftCompleted: number; insuranceRate: number; daily: DailyConsequences; rngState: number; restDay?: boolean;
  settlement?: DaySettlement | null;
}): { settlement: DaySettlement; insuranceRate: number; rngState: number } {
  let random = randomStep(input.rngState);
  let livingCost = 400 + Math.floor(random.value * 401);
  let weekend: DaySettlement['weekend'] = null;
  if (input.restDay) {
    const affordable = Math.max(0, input.money);
    if (gameDate(input.day).weekday === 6) {
      random = randomStep(random.seed);
      let sundayLivingCost = 400 + Math.floor(random.value * 401);
      const modest = livingCost + sundayLivingCost > affordable;
      if (modest) {
        const fridayCost = input.settlement?.day === input.day - 1 ? input.settlement.livingCost : MODEST_WEEKEND_LIVING;
        // The modest allowance is a required cost, even when it causes bankruptcy.
        const remaining = Math.max(0, MODEST_WEEKEND_LIVING - fridayCost);
        livingCost = Math.floor(remaining / 2);
        sundayLivingCost = remaining - livingCost;
      }
      weekend = { modest, sundayLivingCost };
    } else {
      // Historical Saturday ledgers have already charged at least two ordinary
      // living costs across Friday/Saturday. Do not invent another charge.
      livingCost = input.settlement?.day === input.day - 1 ? input.settlement.weekend?.sundayLivingCost ?? 0 : 0;
      weekend = { modest: input.settlement?.weekend?.modest ?? false, sundayLivingCost: 0 };
    }
  }
  const insuranceRate = input.daily.insuranceIncrease === 0 ? Math.max(BASE_INSURANCE, input.insuranceRate - 50) : input.insuranceRate;
  const insuranceCost = input.restDay ? 0 : insuranceRate;
  const basePay = input.restDay ? 0 : BASE_PAY;
  const patientBonus = input.restDay ? 0 : input.shiftCompleted * PATIENT_BONUS, income = basePay + patientBonus;
  const available = input.money + income - livingCost - insuranceCost - input.daily.fines;
  random = randomStep(random.seed);
  let event: DaySettlement['event'] = null;
  if (random.value < expenseProbability(available)) {
    random = randomStep(random.seed);
    const kinds: ExpenseKind[] = input.restDay
      ? ['medicine', 'car-repair', 'home-repair', 'fur-coat', 'mountain-trip', 'seaside-trip']
      : ['medicine', 'car-repair', 'home-repair', 'fur-coat'];
    const kind = kinds[Math.floor(random.value * kinds.length)]!;
    random = randomStep(random.seed);
    const maximum = Math.min(available - (weekend?.sundayLivingCost ?? 0), 700 + Math.floor((available - 2000) * 0.75));
    event = { kind, cost: 200 + Math.floor(random.value * (maximum - 199)) };
  }
  const expenses = livingCost + insuranceCost + input.daily.fines + (event?.cost ?? 0);
  return { insuranceRate, rngState: random.seed, settlement: {
    day: input.day, patients: input.shiftCompleted, basePay, patientBonus, income,
    livingCost, insuranceCost, fines: input.daily.fines, event, expenses,
    openingBalance: input.money, closingBalance: input.money + income - expenses, weekend,
  } };
}
