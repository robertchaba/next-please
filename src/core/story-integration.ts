import { GAME_LIMITS, type GameState, type Paper } from './game';
import { additionalNoteEntry } from './additional-tests';
import { activateStoryEncounter, completeStoryEncounter, eligibleStoryEncounters, finishStoryDay, resolveStory,
  recordStoryDocument, deliverStoryWarning, STORY_WARNING_DOCUMENTS, STORY_WARNING_IDS, type NarrativeState } from './story';
import { storyPatientForEncounter, storyPatientForId } from './story-patients';
import { encounterStoryDocuments, morningStoryDocuments, endingStoryDocuments, type StoryPaperData } from './story-content';
import { prepareStoryPublications } from './story-publications';
import type { NewspaperCopy } from './newspaper';

/** Reserved patients replace ordinary slots. Returns and inspectors retain priority. */
export function arrangeStoryRoster(state: Pick<GameState, 'story' | 'day' | 'pendingReferrals'>, roster: number[]): number[] {
  const result = [...roster];
  // Random rosters contain only ordinary portraits. Keep a clinical return even
  // after its narrative window has closed, without opening another story slot.
  let returnSlot = result.length - 1;
  for (const pending of state.pendingReferrals) {
    if (storyPatientForId(pending.visit.patientId) && !result.includes(pending.visit.patientId)) {
      result[returnSlot--] = pending.visit.patientId;
    }
  }
  for (const definition of eligibleStoryEncounters(state.story, state.day)) {
    const patient = storyPatientForEncounter(definition.id).patient;
    // An unresolved earlier clinical appointment owns its face until it returns.
    if (state.pendingReferrals.some(pending => storyPatientForId(pending.visit.patientId)?.actorId === definition.actorId)) continue;
    result[definition.slot] = patient.id;
  }
  return result;
}

export function deliverStoryPapers(state: GameState, data: readonly StoryPaperData[], opened = false): GameState | null {
  const fresh = data.filter(item => !state.story.deliveredDocumentIds.includes(item.definitionId));
  if (fresh.length === 0) return state;
  if (state.papers.length + fresh.length > GAME_LIMITS.papers || state.nextPaperId + fresh.length > GAME_LIMITS.paperId + 1) return null;
  let story = state.story;
  const papers: Paper[] = fresh.map((data, index) => {
    const id = state.nextPaperId + index;
    const warning = STORY_WARNING_IDS.find(warningId => STORY_WARNING_DOCUMENTS[warningId] === data.definitionId);
    story = warning ? deliverStoryWarning(story, warning, state.day, id) : recordStoryDocument(story, data.definitionId);
    return { id, kind: 'story-document', patientId: data.encounterId ? storyPatientForEncounter(data.encounterId).patient.id : null,
      day: data.issuedDay, location: 'desk', opened, data };
  });
  return { ...state, story, papers: [...state.papers, ...papers], nextPaperId: state.nextPaperId + fresh.length };
}

export function startStoryVisit(state: GameState): GameState | null {
  const visit = state.visit;
  const definition = visit && storyPatientForId(visit.patientId);
  if (!visit || !definition || state.story.mode !== 'active') return state;
  let next = deliverStoryPapers({ ...state, story: activateStoryEncounter(state.story, definition.encounterId, state.day) },
    encounterStoryDocuments(state.story, definition.encounterId, state.day), true);
  if (!next) return null;
  const provided = definition.providedResult;
  if (provided) {
    if (next.papers.length >= GAME_LIMITS.papers || next.nextPaperId > GAME_LIMITS.paperId) return null;
    next = { ...next, visit: { ...visit, additionalResult: { ...provided }, additionalTests: [provided.test], noteOrder: [additionalNoteEntry(provided)] },
      papers: [...next.papers, { id: next.nextPaperId, kind: 'additional-result', patientId: visit.patientId, day: state.day,
        location: 'desk', test: provided.test, fit: provided.fit }], nextPaperId: next.nextPaperId + 1 };
  }
  return next;
}

export function completedStoryVisit(state: GameState): NarrativeState {
  const visit = state.visit, definition = visit && storyPatientForId(visit.patientId);
  return visit?.decision && definition ? completeStoryEncounter(state.story, definition.encounterId, visit.decision, state.day) : state.story;
}

/** Called only after an actual settlement; existing mechanical endings win. */
export function finishStoryShift(state: GameState): GameState | null {
  const story = resolveStory(finishStoryDay(state.story, state.day), state.day, 'evening', state.ending);
  if (!story.resolution || state.story.resolution) return story === state.story ? state : { ...state, story };
  return deliverStoryPapers({ ...state, story, phase: 'epilogue' }, endingStoryDocuments(story), true);
}

/** Morning exposure bypasses salary, settlement, deliveries and admissions. */
export function storyMorningEnding(state: GameState, day: number): GameState | null | undefined {
  const story = resolveStory(state.story, day, 'morning', state.ending);
  if (!story.resolution || state.story.resolution) return undefined;
  return deliverStoryPapers({ ...state, day, story, phase: 'epilogue' }, endingStoryDocuments(story), true);
}

export function deliverStoryMorning(state: GameState): GameState | null {
  if (state.story.mode === 'legacy-disabled') return state;
  const delivered = deliverStoryPapers(state, morningStoryDocuments(state.story, state.day));
  if (!delivered) return null;
  const publication = prepareStoryPublications(delivered.story, state.day);
  const dailyIndex = delivered.newspaperCopies.findIndex(copy => copy.day === state.day && (copy.publication ?? 'kurier') === 'kurier');
  const copies: NewspaperCopy[] = [...delivered.newspaperCopies];
  if (dailyIndex >= 0) {
    const daily = copies[dailyIndex]!;
    // Authored material consumes existing editorial slots, including the ad page.
    const storyCount = publication.dailyArticleIds.length;
    const classifiedIds = publication.guaranteedClassifiedIds.length
      ? (daily.classifiedIds.length ? daily.classifiedIds.slice(0, 2) : ['books', 'jars'] as const) : daily.classifiedIds;
    copies[dailyIndex] = { ...daily, id: `kurier:${state.day}`, publication: 'kurier',
      storyArticleIds: [...publication.dailyArticleIds], articleIds: daily.articleIds.slice(0, Math.max(0, daily.articleIds.length - storyCount)),
      storyClassifiedIds: [...publication.guaranteedClassifiedIds], classifiedIds: [...classifiedIds] };
  }
  if (publication.unionIssue) {
    if (copies.length >= GAME_LIMITS.papers) return null;
    const issue = publication.unionIssue;
    copies.push({ id: issue.id, publication: 'glos', day: issue.day, issueNumber: issue.issueNumber,
      articleIds: [], classifiedIds: [], storyArticleIds: [...issue.articleIds], location: 'desk' });
  }
  return { ...delivered, story: publication.story, newspaperCopies: copies };
}
