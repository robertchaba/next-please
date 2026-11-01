import { isWeekend } from '../../src/core/calendar';
import { createNewspaper, newspaperCopy } from '../../src/core/newspaper';
import { createStory } from '../../src/core/story';

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
  if (version < 36 && Array.isArray(old.papers)) for (const paper of old.papers) delete paper.concern;
  if (version < 35) {
    delete old.story;
    if (Array.isArray(old.newspaperCopies)) for (const copy of old.newspaperCopies) {
      for (const key of ['id', 'publication', 'issueNumber', 'storyArticleIds', 'storyClassifiedIds']) delete copy[key];
    }
  }
  if (version < 34) {
    if (old.newspaper && typeof old.newspaper === 'object') delete (old.newspaper as Record<string, unknown>).classifiedIds;
    if (Array.isArray(old.newspaperCopies)) for (const copy of old.newspaperCopies) delete copy.classifiedIds;
  }
  if (version < 33) delete old.newspaperCopies;
  if (version < 32) delete old.newspaper;
  if (version < 29) delete old.portraitHistory;
  if (version < 31 && old.drawerItems && typeof old.drawerItems === 'object' && 'drawer' in old.drawerItems) {
    old.drawerItems = old.drawerItems.drawer;
  }
  return old;
}

/** Pre-v32 files have no recoverable press pool; migration starts one deterministically. */
export function withMigratedNewspaper(state: unknown): unknown {
  if (!state || typeof state !== 'object' || !('rngState' in state) || typeof state.rngState !== 'number'
    || !('day' in state) || typeof state.day !== 'number') throw new Error('Expected complete migrated fixture');
  const newspaper = { ...createNewspaper((state.rngState ^ state.day) >>> 0), classifiedIds: [] };
  let day = state.day;
  while (isWeekend(day)) day--;
  const papers = 'papers' in state && Array.isArray(state.papers) ? state.papers.map(paper => {
    const { concern: _concern, ...old } = paper;
    return old;
  }) : undefined;
  return { ...state, ...(papers ? { papers } : {}), story: createStory('legacy-disabled'), newspaper, newspaperCopies: day === 1 ? [] : [newspaperCopy(newspaper, day)] };
}
