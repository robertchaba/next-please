import { describe, expect, it } from 'vitest';
import { gameDate, isWeekend } from '../src/core/calendar';
import {
  STORY_DECISION_DELTAS, STORY_ENCOUNTERS, activateStoryEncounter, calendarDayForWorkDay, completeStoryEncounter, createStory,
  deliverStoryWarning, dueStoryWarnings, eligibleStoryEncounters, finishStoryDay, isUnionIssueDue, presentStoryEnding,
  recordUnionIssue, resolveStory, storyDecision, storyScore, validateStoryState,
  type ChapterEnding, type NarrativeState, type StoryDecision, type StoryEncounterId,
} from '../src/core/story';

const fit = 'fit', unfit = 'unfit';
type Route = Partial<Record<StoryEncounterId, StoryDecision>>;
function runRoute(route: Route, through = 36): NarrativeState {
  let story = createStory();
  let paperId = 1;
  for (let day = 1; day <= through; day++) {
    if (isWeekend(day)) continue;
    for (const id of dueStoryWarnings(story, day)) story = deliverStoryWarning(story, id, day, paperId++);
    story = resolveStory(story, day, 'morning');
    if (story.resolution) break;
    for (const definition of eligibleStoryEncounters(story, day)) {
      const decision = route[definition.id];
      if (decision) story = completeStoryEncounter(activateStoryEncounter(story, definition.id, day), definition.id, decision, day);
    }
    if (isUnionIssueDue(story, day)) story = recordUnionIssue(story, day);
    story = finishStoryDay(story, day);
    story = resolveStory(story, day, 'evening');
  }
  return story;
}
const common: Route = { A1: fit, A2: fit, A3: fit, J1: fit, J2: fit, G1: fit, H1: unfit, I1: unfit };
const routes: { name: string; route: Route; score: number[]; ending: ChapterEnding; variant?: string }[] = [
  { name: 'Party', route: { ...common, B1: unfit, C1: unfit, A4: unfit, 'E1-VISIT': fit, D1: fit, F1: unfit }, score: [14, -7, 2, 0, 0, 0], ending: 'party-continue' },
  { name: 'Mutuality', route: { ...common, B1: fit, C1: fit, C2: fit, A4: unfit, 'E1-VISIT': unfit, D1: unfit, F1: fit }, score: [-9, 18, 10, 0, 0, 0], ending: 'union-continue' },
  { name: 'Independent', route: { ...common, B1: fit, C1: unfit, A4: unfit, 'E1-VISIT': fit, D1: fit, F1: fit }, score: [7, 2, 4, 0, 0, 0], ending: 'independent-continue' },
  { name: 'Detained', route: { ...common, B1: fit, C1: fit, C2: fit, A4: unfit, 'E1-VISIT': unfit, D1: unfit, G1: unfit, H1: fit, F1: fit, I1: fit }, score: [-18, 30, 16, 5, 0, 3], ending: 'detained' },
  { name: 'Audit', route: { ...common, B1: unfit, C1: unfit, A4: fit, A5: fit, A6: fit, A7: unfit, 'E1-VISIT': fit, D1: fit, H1: fit, F1: unfit, I1: fit }, score: [16, -8, 5, 6, 0, 2], ending: 'clinic-closed', variant: 'violations' },
  { name: 'Exposure', route: { ...common, B1: unfit, C1: unfit, A4: fit, A5: fit, A6: fit, A7: fit, 'E1-VISIT': fit, D1: fit, F1: unfit }, score: [26, -23, 0, 4, 0, 0], ending: 'exposed' },
  { name: 'Inconsistency', route: { ...common, B1: unfit, C1: fit, C2: unfit, J2: unfit, A4: unfit, 'E1-VISIT': fit, D1: fit, F1: unfit }, score: [6, -9, 8, 1, 2, 0], ending: 'clinic-closed', variant: 'inconsistency' },
];
describe('chapter one authored decisions', () => {
  it('maps all 26 workdays to civil dates, leaving the bribe shift empty', () => {
    expect(calendarDayForWorkDay(7)).toBe(9);
    expect(calendarDayForWorkDay(26)).toBe(36);
    expect(calendarDayForWorkDay(27)).toBe(37);
    expect(gameDate(36)).toMatchObject({ year: 1983, month: 12, day: 8 });
    expect(STORY_ENCOUNTERS).toHaveLength(18);
    expect(STORY_ENCOUNTERS.filter(item => item.scheduledWorkDay === 6)).toEqual([]);
    expect(STORY_ENCOUNTERS.find(item => item.id === 'C2')!.scheduledWorkDay - STORY_ENCOUNTERS.find(item => item.id === 'C1')!.scheduledWorkDay).toBe(10);
    for (const day of [3, 4, 10, 11]) expect(eligibleStoryEncounters(createStory(), day)).toEqual([]);
  });
  it.each(routes)('$name reproduces every expected score and ending', ({ route, score, ending, variant }) => {
    const story = runRoute(route), result = storyScore(story);
    expect([result.partyTrust, result.unionTrust, result.securitySuspicion, result.negligence, result.inconsistency, result.oppositionCases]).toEqual(score);
    expect(story.resolution?.endingId).toBe(ending);
    if (variant) expect(story.resolution?.variant).toBe(variant);
    expect(validateStoryState(story, 36)).toBe(true);
    expect(resolveStory(story, 36, 'evening')).toBe(story);
    const presented = presentStoryEnding(story);
    expect(presented.resolution?.presented).toBe(true);
    expect(validateStoryState(presented, 36)).toBe(true);
  });
  it('replays all 9216 timely choice combinations on the implemented transition functions', () => {
    const counts: Record<ChapterEnding, number> = { exposed: 0, 'clinic-closed': 0, detained: 0, 'party-continue': 0, 'union-continue': 0, 'independent-continue': 0 };
    const others: StoryEncounterId[] = ['B1', 'D1', 'E1-VISIT', 'F1', 'G1', 'H1', 'I1'];
    for (let agentPath = 0; agentPath < 8; agentPath++) for (let printerPath = 0; printerPath < 3; printerPath++)
      for (let malecPath = 0; malecPath < 3; malecPath++) for (let bits = 0; bits < 128; bits++) {
        const route: Route = {};
        for (let index = 0; index < 7; index++) route[`A${index + 1}` as StoryEncounterId] = index < agentPath ? fit : unfit;
        route.C1 = printerPath ? fit : unfit; route.C2 = printerPath === 2 ? fit : unfit;
        route.J1 = malecPath ? fit : unfit; route.J2 = malecPath === 2 ? fit : unfit;
        for (let index = 0; index < others.length; index++) route[others[index]!] = bits & (1 << index) ? fit : unfit;
        const story = runRoute(route);
        counts[story.resolution!.endingId]++;
        const score = storyScore(story);
        if (score.firstAuditThresholdSequence !== null) expect(story.warnings.find(item => item.warningId === 'audit')!.deliveredSequence).toBeLessThan(score.firstAuditThresholdSequence);
        if (score.firstSecurityThresholdSequence !== null) expect(story.warnings.find(item => item.warningId === 'security')!.deliveredSequence).toBeLessThan(score.firstSecurityThresholdSequence);
      }
    expect(counts).toEqual({ exposed: 1152, 'clinic-closed': 2176, detained: 407, 'party-continue': 211, 'union-continue': 1744, 'independent-continue': 3526 });
  });
  it('has explicit deltas for all visits and counts each completed handoff once', () => {
    expect(Object.keys(STORY_DECISION_DELTAS)).toHaveLength(18);
    const initial = createStory();
    expect(storyScore(initial).negligence).toBe(0);
    expect(completeStoryEncounter(initial, 'A1', fit, 1)).toBe(initial);
    const first = completeStoryEncounter(initial, 'A1', fit, 2);
    expect(first.decisions).toHaveLength(1);
    expect(completeStoryEncounter(first, 'A1', unfit, 2)).toBe(first);
    expect(completeStoryEncounter(first, 'A3', fit, 12)).toBe(first);
  });
  it('cancels conditional visitors, collapses a remaining visitor to the first slot and never fabricates a refusal', () => {
    let story = completeStoryEncounter(createStory(), 'A1', unfit, 2);
    expect(eligibleStoryEncounters(story, 7).map(item => [item.id, item.slot])).toEqual([['B1', 0]]);
    expect(story.encounterStatus.A7).toBe('cancelled');
    story = finishStoryDay(story, 12);
    expect(story.encounterStatus.C1).toBe('missed');
    expect(story.encounterStatus.C2).toBe('cancelled');
    expect(storyDecision(story, 'C1')).toBeUndefined();
    expect(story.unionPress.firstIssueCalendarDay).toBe(20);
    expect(storyScore(story).negligence).toBe(1);
  });
  it('cannot admit A7 or trigger exposure before the warning physically arrives', () => {
    let story = runRoute(routes[5]!.route, 28);
    expect(dueStoryWarnings(story, 29)).toContain('militant');
    expect(eligibleStoryEncounters(story, 34).some(item => item.id === 'A7')).toBe(false);
    const blocked = completeStoryEncounter(story, 'A7', fit, 34);
    expect(blocked).toBe(story);
    story = deliverStoryWarning(story, 'militant', 29, 120);
    expect(story.warnings.find(item => item.warningId === 'militant')?.documentInstanceId).toBe(120);
    expect(deliverStoryWarning(story, 'militant', 29, 121)).toBe(story);
    story = completeStoryEncounter(story, 'A7', fit, 34);
    expect(resolveStory(story, 35, 'morning')).toBe(story);
    expect(resolveStory(story, 36, 'morning').resolution?.endingId).toBe('exposed');
    for (const ending of ['assault-pending', 'hospital', 'bankruptcy']) expect(resolveStory(story, 36, 'morning', ending)).toBe(story);
  });
  it('keeps a seven-calendar-day printing rhythm and skips exactly one actual issue', () => {
    const early = runRoute({ C1: fit, C2: unfit }, 34);
    expect(early.publicationHistory.filter(id => id.startsWith('issue:glos:'))).toEqual(['issue:glos:13', 'issue:glos:20', 'issue:glos:34']);
    expect(early.unionPress).toEqual({ firstIssueCalendarDay: 13, skippedCalendarDays: [27], printedIssueCount: 3 });
    const late = runRoute({ C1: unfit }, 34);
    expect(late.publicationHistory.filter(id => id.startsWith('issue:glos:'))).toEqual(['issue:glos:20', 'issue:glos:27', 'issue:glos:34']);
    expect(recordUnionIssue(late, 34)).toBe(late);
    expect(isUnionIssueDue(early, 41)).toBe(true);
  });
  it('validates causal records, warning order and derived resolution instead of trusting forged results', () => {
    const original = runRoute(routes[4]!.route);
    const mutations = [
      (story: NarrativeState) => { story.decisions.find(item => item.encounterId === 'A4')!.decision = unfit; },
      (story: NarrativeState) => { story.decisions[0]!.day = 3; },
      (story: NarrativeState) => { story.warnings[0]!.deliveredDay = 37; },
      (story: NarrativeState) => { story.warnings[0]!.deliveredSequence = 1; },
      (story: NarrativeState) => { story.encounterStatus.A1 = 'missed'; },
      (story: NarrativeState) => { story.resolution!.endingId = 'independent-continue'; },
      (story: NarrativeState) => { story.unionPress.printedIssueCount++; },
    ];
    for (const mutate of mutations) { const invalid = structuredClone(original); mutate(invalid); expect(validateStoryState(invalid, 36)).toBe(false); }
    expect(validateStoryState(createStory('legacy-disabled'), 100)).toBe(true);
  });
  it('recognizes overshot thresholds and refuses to use a warning delivered after the deciding violation', () => {
    const jumpedN = runRoute({ A1: unfit, B1: unfit, C1: fit, C2: unfit, J1: fit, J2: unfit,
      'E1-VISIT': fit, D1: fit, G1: unfit, H1: fit, F1: unfit, I1: fit });
    expect(storyScore(jumpedN).negligence).toBe(7);
    expect(jumpedN.resolution).toMatchObject({ endingId: 'clinic-closed', variant: 'violations' });
    const jumpedS = runRoute({ ...routes[3]!.route, F1: unfit });
    expect(storyScore(jumpedS).securitySuspicion).toBe(15);
    expect(jumpedS.resolution?.endingId).toBe('detained');
    let late = createStory();
    for (let day = 1; day <= 35; day++) {
      if (isWeekend(day)) continue;
      if (dueStoryWarnings(late, day).includes('militant')) late = deliverStoryWarning(late, 'militant', day, 1);
      for (const definition of eligibleStoryEncounters(late, day)) {
        const decision = routes[4]!.route[definition.id];
        if (decision) late = completeStoryEncounter(late, definition.id, decision, day);
      }
      late = finishStoryDay(late, day);
    }
    expect(storyScore(late).negligence).toBe(6);
    late = deliverStoryWarning(late, 'audit', 36, 2);
    expect(resolveStory(late, 36, 'evening').resolution?.endingId).toBe('party-continue');
  });
});
