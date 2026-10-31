/** Reproduce the cash-as-opening-balance representation used before save v24. */
export function legacyBudget(state: unknown): unknown {
  if (!state || typeof state !== 'object') return state;
  const old = structuredClone(historicalState(state, 23)) as Record<string, unknown>;
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

/** Reproduce exact old fields from current fixture builders. */
export function historicalState(state: unknown, version: number): unknown {
  if (!state || typeof state !== 'object') return state;
  const old = structuredClone(state) as Record<string, unknown>;
  if (version < 29) delete old.portraitHistory;
  if (version < 31 && old.drawerItems && typeof old.drawerItems === 'object' && 'drawer' in old.drawerItems) {
    old.drawerItems = old.drawerItems.drawer;
  }
  return old;
}
