import { randomStep } from './patients';
import type { StorageLocation } from './game';

/** Physical copies retain their publication date and content independently of the editorial pool. */
export interface NewspaperCopy {
  day: number;
  articleIds: PressArticleId[];
  location: StorageLocation;
}

export const newspaperCopy = (state: Pick<NewspaperState, 'articleIds'>, day: number): NewspaperCopy =>
  ({ day, articleIds: [...state.articleIds], location: 'desk' });

/** Append stable IDs; copy lives in both dictionaries, never in saves. */
export const PRESS_ARTICLES = [
  { id: 'reading-circle', topic: 'culture', reusable: false },
  { id: 'choir', topic: 'culture', reusable: false },
  { id: 'film-club', topic: 'culture', reusable: false },
  { id: 'theatre', topic: 'craft', reusable: false },
  { id: 'chess', topic: 'sport', reusable: false },
  { id: 'table-tennis', topic: 'sport', reusable: false },
  { id: 'stamps', topic: 'hobby', reusable: true },
  { id: 'cassette', topic: 'technology', reusable: true },
  { id: 'knitting', topic: 'household', reusable: true },
  { id: 'darning', topic: 'craft', reusable: true },
  { id: 'plants', topic: 'home', reusable: true },
  { id: 'bread', topic: 'kitchen', reusable: true },
  { id: 'station-clock', topic: 'transport', reusable: true },
  { id: 'lost-scarf', topic: 'everyday', reusable: false },
  { id: 'handwriting', topic: 'education', reusable: false },
  { id: 'aquarium', topic: 'hobby', reusable: false },
  { id: 'bookbinding', topic: 'craft', reusable: true },
  { id: 'starlight', topic: 'science', reusable: true },
  { id: 'noticeboard', topic: 'community', reusable: false },
  { id: 'bicycle', topic: 'technology', reusable: true },
] as const;
export type PressArticleId = typeof PRESS_ARTICLES[number]['id'];
export type PressTopic = typeof PRESS_ARTICLES[number]['topic'];
export interface NewspaperState {
  articleIds: PressArticleId[];
  usedArticleIds: PressArticleId[];
  /** Independent stream: reading and editorial choices cannot reroll patients. */
  rngState: number;
}

/** Priority articles reserve slots for future story copy, including a whole issue.
 * Fresh background copy always precedes repeats. Never duplicate an article in
 * one issue; prefer different topics and avoid yesterday's repeats where possible.
 */
export function nextNewspaper(seed: number, previous?: NewspaperState, priorityIds: readonly PressArticleId[] = []): NewspaperState {
  if (priorityIds.length > 4 || new Set(priorityIds).size !== priorityIds.length
    || priorityIds.some(id => !PRESS_ARTICLES.some(article => article.id === id))) throw new RangeError('Invalid editorial selection');
  let rngState = seed >>> 0;
  const draw = () => { const next = randomStep(rngState); rngState = next.seed; return next.value; };
  const count = Math.max(priorityIds.length, 3 + Math.floor(draw() * 2));
  const articleIds = [...priorityIds];
  const used = new Set(previous?.usedArticleIds ?? []);
  const topic = (id: PressArticleId): PressTopic => PRESS_ARTICLES.find(article => article.id === id)!.topic;
  while (articleIds.length < count) {
    const available = PRESS_ARTICLES.filter(article => !articleIds.includes(article.id));
    const fresh = available.filter(article => !used.has(article.id));
    let pool = fresh.length ? fresh : available.filter(article => article.reusable);
    if (!fresh.length) {
      const notYesterday = pool.filter(article => !previous?.articleIds.includes(article.id));
      if (notYesterday.length) pool = notYesterday;
    }
    const topics = new Set(articleIds.map(topic));
    const diverse = pool.filter(article => !topics.has(article.topic));
    if (diverse.length) pool = diverse;
    if (!pool.length) throw new RangeError('Insufficient newspaper material');
    articleIds.push(pool[Math.floor(draw() * pool.length)]!.id);
  }
  return { articleIds, usedArticleIds: [...new Set([...used, ...articleIds])], rngState };
}

export function createNewspaper(seed: number): NewspaperState {
  return nextNewspaper((seed ^ 0x4b555249) >>> 0);
}
