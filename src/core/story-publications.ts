import { isWeekend } from './calendar';
import { calendarDayForWorkDay, storyDecision, storyWorkDay, type NarrativeState, type StoryDecision, type StoryEncounterId } from './story';
import { isStoryArticleId, type StoryArticleId, type StoryClassifiedId } from './story-content';

export interface StoryPublicationIssue { id: string; publication: 'glos'; day: number; issueNumber: number; articleIds: StoryArticleId[] }
export interface PreparedStoryPublications {
  story: NarrativeState;
  dailyArticleIds: StoryArticleId[];
  unionIssue: StoryPublicationIssue | null;
  guaranteedClassifiedIds: StoryClassifiedId[];
}
interface DailyArticle { id: StoryArticleId; workDay: number; encounter?: StoryEncounterId; decision?: StoryDecision; missing?: true; requiresPromotion?: true }
export const STORY_DAILY_ARTICLES: readonly DailyArticle[] = [
  { id: 'K-A1', workDay: 3, encounter: 'A1', decision: 'fit' },
  { id: 'K-B-STRIKE', workDay: 4 },
  { id: 'K-A2', workDay: 6, encounter: 'A2', decision: 'fit' },
  { id: 'K-J-STADIUM', workDay: 8 },
  { id: 'K-A3', workDay: 9, encounter: 'A3', decision: 'fit' },
  { id: 'K-E-HERO', workDay: 12 }, { id: 'K-A4', workDay: 12, encounter: 'A4', decision: 'fit' },
  { id: 'K-E-RETURN', workDay: 13, encounter: 'E1-VISIT', decision: 'fit' },
  { id: 'K-E-BLOCKED', workDay: 13, encounter: 'E1-VISIT', decision: 'unfit' },
  { id: 'K-E-PENDING', workDay: 13, encounter: 'E1-VISIT', missing: true },
  { id: 'K-D-STRIKE', workDay: 14 },
  { id: 'K-A5', workDay: 15, encounter: 'A5', decision: 'fit' },
  { id: 'K-J-POOL', workDay: 15, encounter: 'J1', decision: 'fit' },
  { id: 'K-D-HEAT', workDay: 16, encounter: 'D1', decision: 'fit' },
  { id: 'K-D-COLD', workDay: 16, encounter: 'D1', decision: 'unfit' },
  { id: 'K-D-PENDING', workDay: 16, encounter: 'D1', missing: true },
  { id: 'K-G-BRIGADES', workDay: 16 },
  { id: 'K-E-CORRECTION', workDay: 16, encounter: 'E1-VISIT', decision: 'unfit' },
  { id: 'K-G-NAMES', workDay: 18, encounter: 'G1', decision: 'fit' },
  { id: 'K-F-QUESTION', workDay: 19 }, { id: 'K-F-ERRATUM', workDay: 20 },
  { id: 'K-A6', workDay: 21, encounter: 'A6', decision: 'fit' },
  { id: 'K-F-SECOND', workDay: 23, encounter: 'F1', decision: 'fit' },
  { id: 'K-F-QUALITY', workDay: 23, encounter: 'F1', decision: 'unfit' },
  { id: 'K-J-CHIEF', workDay: 24, requiresPromotion: true },
  { id: 'K-J-DIRECTOR', workDay: 29, requiresPromotion: true },
];
const priorDecision = (story: NarrativeState, id: StoryEncounterId, day: number) => {
  const record = storyDecision(story, id); return record && record.day < day ? record : undefined;
};
function dailyArticleAvailable(article: DailyArticle, story: NarrativeState, day: number): boolean {
  if (article.workDay !== storyWorkDay(day)) return false;
  if (article.requiresPromotion) {
    if (priorDecision(story, 'J1', day)?.decision !== 'fit' || priorDecision(story, 'J2', day)?.decision !== 'fit') return false;
    if (article.workDay > 26 && (!story.resolution || story.resolution.terminal)) return false;
  }
  if (!article.encounter) return true;
  const record = priorDecision(story, article.encounter, day);
  return article.missing ? !record : record?.decision === article.decision;
}
export function storyDailyArticleIds(story: NarrativeState, day: number): StoryArticleId[] {
  if (story.mode === 'legacy-disabled' || isWeekend(day)) return [];
  return STORY_DAILY_ARTICLES.filter(article => dailyArticleAvailable(article, story, day)).map(article => article.id).slice(0, 4);
}
export const UNION_BACKGROUND_ARTICLES = ['W-BG-HELP', 'W-BG-BOOKS', 'W-BG-CLOTHES'] as const;
interface UnionArticle { id: StoryArticleId; priority: number; earliestWorkDay: number; encounter?: StoryEncounterId; decision?: StoryDecision; needsArticles?: readonly StoryArticleId[] }
export const STORY_UNION_ARTICLES: readonly UnionArticle[] = [
  { id: 'W-F-QUESTION', priority: 100, earliestWorkDay: 21, needsArticles: ['K-F-QUESTION', 'K-F-ERRATUM'] },
  { id: 'W-F-STAYS', priority: 95, earliestWorkDay: 24, encounter: 'F1', decision: 'fit', needsArticles: ['K-F-SECOND'] },
  { id: 'W-F-FIRED', priority: 95, earliestWorkDay: 22, encounter: 'F1', decision: 'unfit' },
  { id: 'W-A-STOP', priority: 90, earliestWorkDay: 6 },
  { id: 'W-H-STAYS', priority: 85, earliestWorkDay: 19, encounter: 'H1', decision: 'fit' },
  { id: 'W-H-FIRED', priority: 85, earliestWorkDay: 19, encounter: 'H1', decision: 'unfit' },
  { id: 'W-G-REFUSED', priority: 80, earliestWorkDay: 18, encounter: 'G1', decision: 'unfit' },
  { id: 'W-G-SENT', priority: 80, earliestWorkDay: 18, encounter: 'G1', decision: 'fit' },
  { id: 'W-D-HEAT', priority: 75, earliestWorkDay: 16, encounter: 'D1', decision: 'fit' },
  { id: 'W-D-STRIKE', priority: 75, earliestWorkDay: 16, encounter: 'D1', decision: 'unfit' },
  { id: 'W-E-PREDICTED', priority: 70, earliestWorkDay: 13, encounter: 'E1-VISIT', decision: 'unfit' },
  { id: 'W-B-FIT', priority: 65, earliestWorkDay: 6, encounter: 'B1', decision: 'fit' },
  { id: 'W-B-REFUSED', priority: 65, earliestWorkDay: 6, encounter: 'B1', decision: 'unfit' },
];
const historyArticleDay = (story: NarrativeState, id: StoryArticleId): number | undefined => {
  const entry = story.publicationHistory.find(item => item.startsWith(`${id}@`));
  return entry ? Number(entry.slice(entry.lastIndexOf('@') + 1)) : undefined;
};
const nextWorkingDay = (day: number): number => { let result = day + 1; while (isWeekend(result)) result++; return result; };
export function unionArticleAvailableDay(article: UnionArticle, story: NarrativeState): number | null {
  let day = calendarDayForWorkDay(article.earliestWorkDay);
  if (article.id === 'W-A-STOP') {
    const stopped = story.decisions.find(record => /^A[2-7]$/.test(record.encounterId) && record.decision === 'unfit');
    if (!stopped) return null;
    day = Math.max(day, nextWorkingDay(stopped.day));
  }
  if (article.encounter) {
    const record = storyDecision(story, article.encounter);
    if (!record || record.decision !== article.decision) return null;
    day = Math.max(day, nextWorkingDay(record.day));
  }
  for (const required of article.needsArticles ?? []) {
    const published = historyArticleDay(story, required);
    if (published === undefined) return null;
    day = Math.max(day, nextWorkingDay(published));
  }
  return day;
}
function availableUnionQueue(story: NarrativeState, day: number): StoryArticleId[] {
  return STORY_UNION_ARTICLES.map(article => ({ article, available: unionArticleAvailableDay(article, story) }))
    .filter((item): item is { article: UnionArticle; available: number } => item.available !== null && item.available <= day && historyArticleDay(story, item.article.id) === undefined)
    .sort((a, b) => b.article.priority - a.article.priority || a.available - b.available || a.article.id.localeCompare(b.article.id))
    .map(item => item.article.id);
}
/** Selection is pure. Commit this proposed state only after all matching physical copies can be created. */
export function prepareStoryPublications(story: NarrativeState, day: number): PreparedStoryPublications {
  const unchanged = { story, dailyArticleIds: [], unionIssue: null, guaranteedClassifiedIds: [] } satisfies PreparedStoryPublications;
  if (story.mode === 'legacy-disabled' || isWeekend(day)) return unchanged;
  const dailyMarker = `issue:kurier:${day}`, hadDaily = story.publicationHistory.includes(dailyMarker);
  const dailyArticleIds = hadDaily ? [] : storyDailyArticleIds(story, day);
  const guaranteedClassifiedIds: StoryClassifiedId[] = !hadDaily && storyWorkDay(day) === 6 ? ['C-AD'] : [];
  const history = [...story.publicationHistory];
  // No endless empty markers after this finite chapter: ordinary background needs no narrative journal.
  if (!hadDaily && (dailyArticleIds.length || guaranteedClassifiedIds.length)) {
    history.push(dailyMarker, ...dailyArticleIds.map(id => `${id}@${day}`));
  }
  // The weekly edition was prepared before this morning's Courier: use prior history here.
  const queue = availableUnionQueue(story, day);
  let unionIssue: StoryPublicationIssue | null = null;
  const first = story.unionPress.firstIssueCalendarDay;
  const issueDue = first !== null && day >= first && (day - first) % 7 === 0 && !story.unionPress.skippedCalendarDays.includes(day)
    && !story.publicationHistory.includes(`issue:glos:${day}`);
  let printedIssueCount = story.unionPress.printedIssueCount;
  if (issueDue) {
    const opening: StoryArticleId[] = printedIssueCount === 0 ? [first === 13 ? 'W-C-EARLY' : 'W-C-LATE'] : [];
    const comments = queue.slice(0, 4 - opening.length), articleIds = [...opening, ...comments];
    for (const id of UNION_BACKGROUND_ARTICLES) if (articleIds.length < 3) articleIds.push(id);
    printedIssueCount++;
    unionIssue = { id: `glos:${day}`, publication: 'glos', day, issueNumber: printedIssueCount, articleIds };
    history.push(`issue:glos:${day}`, ...[...opening, ...comments].map(id => `${id}@${day}`));
  }
  const selected = new Set(unionIssue?.articleIds ?? []);
  const pendingUnionArticleIds = queue.filter(id => !selected.has(id));
  const next = { ...story, publicationHistory: history, pendingUnionArticleIds, unionPress: { ...story.unionPress, printedIssueCount } };
  return { story: next, dailyArticleIds, unionIssue, guaranteedClassifiedIds };
}
/** Reconstruct an immutable weekly copy from the journal, without consulting later choices. */
export function expectedStoryUnionArticleIds(story: NarrativeState, day: number): StoryArticleId[] {
  const earlier = story.publicationHistory.filter(entry => {
    const issue = /^issue:(?:glos|kurier):(\d+)$/.exec(entry);
    const printedDay = issue ? Number(issue[1]) : Number(entry.slice(entry.lastIndexOf('@') + 1));
    return printedDay < day;
  });
  const prior = { ...story, publicationHistory: earlier };
  const issueNumber = earlier.filter(entry => entry.startsWith('issue:glos:')).length + 1;
  const opening: StoryArticleId[] = issueNumber === 1 ? [story.unionPress.firstIssueCalendarDay === 13 ? 'W-C-EARLY' : 'W-C-LATE'] : [];
  const result = [...opening, ...availableUnionQueue(prior, day).slice(0, 4 - opening.length)];
  for (const id of UNION_BACKGROUND_ARTICLES) if (result.length < 3) result.push(id);
  return result;
}

/** Validate finite authored history independently of physical copies that can be discarded. */
export function validateStoryPublicationState(story: NarrativeState, currentDay: number): boolean {
  if (!Array.isArray(story.publicationHistory) || new Set(story.publicationHistory).size !== story.publicationHistory.length) return false;
  const seenArticles = new Set<StoryArticleId>(), issueDays: number[] = [], dailyDays: number[] = [];
  for (const entry of story.publicationHistory) {
    const issue = /^issue:(glos|kurier):(\d+)$/.exec(entry);
    if (issue) {
      const day = Number(issue[2]);
      if (!Number.isSafeInteger(day) || day < 1 || day > currentDay || isWeekend(day)) return false;
      if (issue[1] === 'glos') {
        const first = story.unionPress.firstIssueCalendarDay;
        if (first === null || day < first || (day - first) % 7 !== 0 || story.unionPress.skippedCalendarDays.includes(day)) return false;
        issueDays.push(day);
      } else {
        if (!storyDailyArticleIds(story, day).length && storyWorkDay(day) !== 6) return false;
        dailyDays.push(day);
      }
      continue;
    }
    const article = /^([^@]+)@(\d+)$/.exec(entry);
    if (!article || !isStoryArticleId(article[1]!)) return false;
    const id = article[1]!, day = Number(article[2]);
    if (seenArticles.has(id) || day < 1 || day > currentDay || isWeekend(day)) return false;
    seenArticles.add(id);
    if (id.startsWith('K-')) {
      if (!storyDailyArticleIds(story, day).includes(id) || !story.publicationHistory.includes(`issue:kurier:${day}`)) return false;
    } else {
      if (!story.publicationHistory.includes(`issue:glos:${day}`)) return false;
      if (id === 'W-C-EARLY' || id === 'W-C-LATE') {
        if ((id === 'W-C-EARLY') !== (story.unionPress.firstIssueCalendarDay === 13) || day !== Math.min(...story.publicationHistory.filter(item => item.startsWith('issue:glos:')).map(item => Number(item.slice(11))))) return false;
      } else {
        const definition = STORY_UNION_ARTICLES.find(item => item.id === id);
        if (!definition) return false;
        const available = unionArticleAvailableDay(definition, story);
        if (available === null || available > day) return false;
      }
    }
  }
  if (issueDays.length !== story.unionPress.printedIssueCount || issueDays.some((day, index) => index > 0 && day <= issueDays[index - 1]!)) return false;
  if (dailyDays.some((day, index) => index > 0 && day <= dailyDays[index - 1]!)) return false;
  for (const day of dailyDays) {
    const expected = storyDailyArticleIds(story, day);
    const printed = story.publicationHistory.filter(item => item.endsWith(`@${day}`) && item.startsWith('K-')).map(item => item.slice(0, item.lastIndexOf('@')));
    if (expected.join(',') !== printed.join(',')) return false;
  }
  for (const day of issueDays) {
    const printed = story.publicationHistory.filter(item => item.endsWith(`@${day}`) && item.startsWith('W-')).map(item => item.slice(0, item.lastIndexOf('@')));
    const expected = expectedStoryUnionArticleIds(story, day).filter(id => !UNION_BACKGROUND_ARTICLES.some(background => background === id));
    if (printed.join(',') !== expected.join(',')) return false;
  }
  if (!Array.isArray(story.pendingUnionArticleIds) || new Set(story.pendingUnionArticleIds).size !== story.pendingUnionArticleIds.length) return false;
  for (const id of story.pendingUnionArticleIds) {
    const definition = STORY_UNION_ARTICLES.find(item => item.id === id);
    if (!definition || seenArticles.has(definition.id)) return false;
    const available = unionArticleAvailableDay(definition, story);
    if (available === null || available > currentDay) return false;
  }
  if (story.mode === 'legacy-disabled') return story.publicationHistory.length === 0 && story.pendingUnionArticleIds.length === 0;
  // Morning creation is atomic: discarding a paper cannot erase its publication.
  const requiredDailyDays = [...new Set([...STORY_DAILY_ARTICLES.map(article => calendarDayForWorkDay(article.workDay)), calendarDayForWorkDay(6)])]
    .filter(day => day <= currentDay && (storyDailyArticleIds(story, day).length || storyWorkDay(day) === 6));
  if (requiredDailyDays.some(day => !dailyDays.includes(day))) return false;
  const first = story.unionPress.firstIssueCalendarDay;
  const scheduledCount = first !== null && currentDay >= first ? Math.floor((currentDay - first) / 7) + 1 : 0;
  const skippedCount = story.unionPress.skippedCalendarDays.filter(day => day <= currentDay).length;
  if (scheduledCount - skippedCount !== issueDays.length) return false;
  if (first !== null) for (let i = 0; i < scheduledCount; i++) {
    const day = first + i * 7;
    if (!story.unionPress.skippedCalendarDays.includes(day) && !issueDays.includes(day)) return false;
  }
  // Newly decided cases become eligible on a later working day, so this is also
  // the exact queue for a save taken after today's appointments or on a weekend.
  if (story.pendingUnionArticleIds.join(',') !== availableUnionQueue(story, currentDay).join(',')) return false;
  return true;
}
