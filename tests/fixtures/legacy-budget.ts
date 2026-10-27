/** Reproduce the cash-as-opening-balance representation used before save v24. */
export function legacyBudget(state: unknown): unknown {
  if (!state || typeof state !== 'object') return state;
  const old = structuredClone(state) as Record<string, unknown>;
  delete old.bribeIncome;
  const ledger = (value: unknown): unknown => {
    if (!value || typeof value !== 'object') return value;
    const raw = value as Record<string, unknown>;
    if (typeof raw.bribeIncome === 'number') {
      raw.openingBalance = Number(raw.openingBalance) + raw.bribeIncome;
      raw.income = Number(raw.income) - raw.bribeIncome;
    }
    delete raw.bribeIncome;
    return raw;
  };
  if ('settlement' in old) old.settlement = ledger(old.settlement);
  if (Array.isArray(old.budgetHistory)) old.budgetHistory = old.budgetHistory.map(ledger);
  return old;
}
