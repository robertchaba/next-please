/** Reproduce the cash-as-opening-balance representation used before save v24. */
export function legacyBudget(state: unknown): unknown {
  if (!state || typeof state !== 'object') return state;
  const old = structuredClone(state) as Record<string, unknown>;
  delete old.portraitHistory;
  delete old.recentVisits; delete old.inspection; delete old.inspectionCheckedAt; delete old.inspectionFines;
  if (Array.isArray(old.banknotes)) old.money = Number(old.money) + old.banknotes.filter(note => !note.credited).length * 100;
  delete old.banknotes;
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

/** v29 adds admission recency; earlier files have no such top-level field. */
export function historicalState(state: unknown, version: number): unknown {
  if (version >= 29 || !state || typeof state !== 'object') return state;
  const { portraitHistory: _history, ...old } = state as Record<string, unknown>;
  return old;
}
