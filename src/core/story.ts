import { isWeekend } from './calendar';

/** Chapter one is an authored, finite sequence; no random or rendered state lives here. */
export const STORY_ENCOUNTER_IDS = ['A1', 'A2', 'B1', 'A3', 'C1', 'J1', 'A4', 'E1-VISIT', 'A5', 'D1', 'G1', 'C2', 'H1', 'J2', 'A6', 'F1', 'I1', 'A7'] as const;
export type StoryEncounterId = typeof STORY_ENCOUNTER_IDS[number];
export const STORY_ACTOR_IDS = ['agent', 'strike-leader', 'printer', 'dispatcher', 'sergeant', 'proofreader', 'volunteer', 'storekeeper', 'alias', 'malec'] as const;
export type StoryActorId = typeof STORY_ACTOR_IDS[number];
export type StoryDecision = 'fit' | 'unfit';
export type EncounterStatus = 'scheduled' | 'active' | 'completed' | 'missed' | 'cancelled';
export const STORY_WARNING_IDS = ['audit', 'security', 'consistency', 'militant'] as const;
export type StoryWarningId = typeof STORY_WARNING_IDS[number];
export const STORY_CONTACT_IDS = ['CALL-PRINT', 'CALL-CHAMBER', 'CALL-POWER', 'CALL-WAREHOUSE', 'CALL-MOS'] as const;
export type StoryContactId = typeof STORY_CONTACT_IDS[number];
export type StoryPhoneNoteKey = 'chamber-genuine' | 'chamber-forged' | 'power' | 'warehouse' | 'mos';
export function storyPhoneNoteKey(contactId: StoryContactId, encounterId: StoryEncounterId): StoryPhoneNoteKey | null {
  if (contactId === 'CALL-CHAMBER') return encounterId === 'B1' ? 'chamber-genuine' : ['A4', 'A5', 'A6', 'A7'].includes(encounterId) ? 'chamber-forged' : null;
  if (contactId === 'CALL-POWER' && encounterId === 'D1') return 'power';
  if (contactId === 'CALL-WAREHOUSE' && encounterId === 'H1') return 'warehouse';
  if (contactId === 'CALL-MOS' && encounterId === 'J2') return 'mos';
  return null;
}
export const CHAPTER_ENDINGS = ['exposed', 'clinic-closed', 'detained', 'party-continue', 'union-continue', 'independent-continue'] as const;
export type ChapterEnding = typeof CHAPTER_ENDINGS[number];
export interface StoryEncounterDefinition {
  id: StoryEncounterId;
  actorId: StoryActorId;
  scheduledWorkDay: number;
  /** New-patient slots; inspections and actual examination returns do not consume them. */
  slot: 0 | 2;
  requires: StoryEncounterId | null;
  assessment: 'fit' | 'unfit' | 'discretionary';
}
const encounter = (id: StoryEncounterId, actorId: StoryActorId, scheduledWorkDay: number, slot: 0 | 2,
  requires: StoryEncounterId | null, assessment: StoryEncounterDefinition['assessment']): StoryEncounterDefinition =>
  ({ id, actorId, scheduledWorkDay, slot, requires, assessment });
export const STORY_ENCOUNTERS: readonly StoryEncounterDefinition[] = [
  encounter('A1', 'agent', 2, 0, null, 'fit'),
  encounter('A2', 'agent', 5, 0, 'A1', 'fit'), encounter('B1', 'strike-leader', 5, 2, null, 'discretionary'),
  encounter('A3', 'agent', 8, 0, 'A2', 'fit'), encounter('C1', 'printer', 8, 2, null, 'discretionary'),
  encounter('J1', 'malec', 10, 0, null, 'fit'), encounter('A4', 'agent', 11, 0, 'A3', 'discretionary'),
  encounter('E1-VISIT', 'sergeant', 12, 0, null, 'discretionary'),
  encounter('A5', 'agent', 14, 0, 'A4', 'discretionary'), encounter('D1', 'dispatcher', 15, 0, null, 'discretionary'),
  encounter('G1', 'volunteer', 17, 0, null, 'fit'),
  encounter('C2', 'printer', 18, 0, 'C1', 'discretionary'), encounter('H1', 'storekeeper', 18, 2, null, 'unfit'),
  encounter('J2', 'malec', 19, 0, 'J1', 'fit'), encounter('A6', 'agent', 20, 0, 'A5', 'unfit'),
  encounter('F1', 'proofreader', 21, 0, null, 'discretionary'), encounter('I1', 'alias', 21, 2, null, 'unfit'),
  encounter('A7', 'agent', 24, 0, 'A6', 'unfit'),
];
export const storyEncounter = (id: StoryEncounterId): StoryEncounterDefinition => STORY_ENCOUNTERS.find(item => item.id === id)!;
/** Working-day conversion independent of progression, avoiding catalog import cycles. */
export function storyWorkDay(day: number): number {
  return Math.floor((day - 1) / 7) * 5 + [1, 2, 2, 2, 3, 4, 5][(day - 1) % 7]!;
}
export function calendarDayForWorkDay(workDay: number): number {
  if (!Number.isInteger(workDay) || workDay < 1) throw new RangeError('Invalid working day');
  const week = Math.floor((workDay - 1) / 5), offset = (workDay - 1) % 5;
  return week * 7 + [1, 2, 5, 6, 7][offset]!;
}
const nextWorkDay = (day: number): number => { let next = day + 1; while (isWeekend(next)) next++; return next; };

export interface StoryDecisionRecord { eventId: string; encounterId: StoryEncounterId; day: number; sequence: number; decision: StoryDecision }
export interface StoryWarningRecord { warningId: StoryWarningId; deliveredDay: number; deliveredSequence: number; documentInstanceId: number }
export type StoryEvidenceKind = 'unjustified_refusal' | 'contraindication_ignored' | 'identity_falsification';
export interface StoryEvidence {
  eventId: string; encounterId: StoryEncounterId; day: number; sequence: number;
  kind: StoryEvidenceKind; weight: 1 | 2; oppositionCase: boolean; basisId: string;
}
export interface StoryInconsistency { encounterId: 'C2' | 'J2'; previousEncounterId: 'C1' | 'J1'; day: number; sequence: number }
export interface StoryResolution {
  endingId: ChapterEnding; resolvedDay: number; terminal: boolean; presented: boolean;
  variant: 'standard' | 'violations' | 'inconsistency';
}
export interface NarrativeState {
  version: 1;
  mode: 'active' | 'resolved' | 'legacy-disabled';
  nextSequence: number;
  decisions: StoryDecisionRecord[];
  encounterStatus: Record<StoryEncounterId, EncounterStatus>;
  warnings: StoryWarningRecord[];
  appliedEventIds: string[];
  deliveredDocumentIds: string[];
  publicationHistory: string[];
  pendingUnionArticleIds: string[];
  /** Context distinguishes the authentic Chamber letter from the agent's forgery. */
  contacts: string[];
  unionPress: { firstIssueCalendarDay: number | null; skippedCalendarDays: number[]; printedIssueCount: number };
  resolution: StoryResolution | null;
}
export type StoryState = NarrativeState;
export function createStory(mode: NarrativeState['mode'] = 'active'): NarrativeState {
  return { version: 1, mode, nextSequence: 1, decisions: [],
    encounterStatus: Object.fromEntries(STORY_ENCOUNTER_IDS.map(id => [id, mode === 'legacy-disabled' ? 'cancelled' : 'scheduled'])) as NarrativeState['encounterStatus'],
    warnings: [], appliedEventIds: [], deliveredDocumentIds: [], publicationHistory: [], pendingUnionArticleIds: [], contacts: [],
    unionPress: { firstIssueCalendarDay: null, skippedCalendarDays: [], printedIssueCount: 0 }, resolution: null };
}
export const createNarrativeState = createStory;
export const storyDecision = (story: NarrativeState, id: StoryEncounterId): StoryDecisionRecord | undefined => story.decisions.find(record => record.encounterId === id);

interface DecisionDelta { partyTrust: number; unionTrust: number; securitySuspicion: number; evidence?: StoryEvidenceKind; oppositionCase?: boolean }
const delta = (partyTrust: number, unionTrust: number, securitySuspicion: number, evidence?: StoryEvidenceKind, oppositionCase = false): DecisionDelta =>
  ({ partyTrust, unionTrust, securitySuspicion, ...(evidence ? { evidence, oppositionCase } : {}) });
/** Every row is explicit: unrelated decisions never imply inconsistency. */
export const STORY_DECISION_DELTAS: Readonly<Record<StoryEncounterId, Readonly<Record<StoryDecision, DecisionDelta>>>> = {
  A1: { fit: delta(0, 0, 0), unfit: delta(-1, 3, 0, 'unjustified_refusal') },
  A2: { fit: delta(0, 0, 0), unfit: delta(-3, 8, 2, 'unjustified_refusal') },
  A3: { fit: delta(0, 0, 0), unfit: delta(-3, 7, 2, 'unjustified_refusal') },
  A4: { fit: delta(2, -2, 0), unfit: delta(-3, 6, 2) },
  A5: { fit: delta(2, -2, 0), unfit: delta(-3, 5, 2) },
  A6: { fit: delta(2, -2, 0, 'contraindication_ignored'), unfit: delta(-3, 4, 2) },
  A7: { fit: delta(3, -4, 0, 'contraindication_ignored'), unfit: delta(-2, 2, 1) },
  B1: { fit: delta(-2, 3, 1), unfit: delta(1, -2, 0) },
  C1: { fit: delta(-2, 3, 1), unfit: delta(1, -2, 0) },
  C2: { fit: delta(-1, 2, 1), unfit: delta(2, -3, 0) },
  D1: { fit: delta(3, -2, 0), unfit: delta(-3, 3, 2) },
  'E1-VISIT': { fit: delta(3, -1, 0), unfit: delta(-3, 3, 2) },
  F1: { fit: delta(-2, 2, 1), unfit: delta(2, -2, 0) },
  G1: { fit: delta(2, -1, 0), unfit: delta(-2, 2, 2, 'unjustified_refusal', true) },
  H1: { fit: delta(-2, 3, 2, 'contraindication_ignored', true), unfit: delta(1, -2, 0) },
  I1: { fit: delta(-2, 3, 2, 'identity_falsification', true), unfit: delta(0, -1, 0) },
  J1: { fit: delta(2, 0, 0), unfit: delta(-1, 0, 1, 'unjustified_refusal') },
  J2: { fit: delta(2, 0, 0), unfit: delta(-1, 0, 1, 'unjustified_refusal') },
};
export interface StoryScore {
  partyTrust: number; unionTrust: number; securitySuspicion: number;
  negligence: number; inconsistency: number; oppositionCases: number;
  evidence: StoryEvidence[]; inconsistencies: StoryInconsistency[];
  firstAuditWarningSequence: number | null; firstSecurityWarningSequence: number | null;
  firstAuditThresholdSequence: number | null; firstSecurityThresholdSequence: number | null;
  secondInconsistencySequence: number | null;
}
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
export function storyScore(story: Pick<NarrativeState, 'decisions'>): StoryScore {
  const score: StoryScore = { partyTrust: 0, unionTrust: 0, securitySuspicion: 0, negligence: 0, inconsistency: 0, oppositionCases: 0,
    evidence: [], inconsistencies: [], firstAuditWarningSequence: null, firstSecurityWarningSequence: null,
    firstAuditThresholdSequence: null, firstSecurityThresholdSequence: null, secondInconsistencySequence: null };
  const completed = new Map<StoryEncounterId, StoryDecision>();
  for (const record of story.decisions) {
    const change = STORY_DECISION_DELTAS[record.encounterId][record.decision];
    score.partyTrust = clamp(score.partyTrust + change.partyTrust, -30, 30);
    score.unionTrust = clamp(score.unionTrust + change.unionTrust, -30, 30);
    score.securitySuspicion = clamp(score.securitySuspicion + change.securitySuspicion, 0, 30);
    if (change.evidence) {
      const weight = change.evidence === 'unjustified_refusal' ? 1 : 2;
      score.evidence.push({ eventId: record.eventId, encounterId: record.encounterId, day: record.day, sequence: record.sequence,
        kind: change.evidence, weight, oppositionCase: !!change.oppositionCase, basisId: `basis:${record.encounterId}` });
      score.negligence += weight;
      score.oppositionCases += Number(change.oppositionCase);
    }
    if (record.decision === 'unfit' && ((record.encounterId === 'C2' && completed.get('C1') === 'fit') || (record.encounterId === 'J2' && completed.get('J1') === 'fit'))) {
      score.inconsistency++;
      score.inconsistencies.push({ encounterId: record.encounterId, previousEncounterId: record.encounterId === 'C2' ? 'C1' : 'J1', day: record.day, sequence: record.sequence });
      score.partyTrust = clamp(score.partyTrust - 2, -30, 30);
      score.unionTrust = clamp(score.unionTrust - 2, -30, 30);
      score.securitySuspicion = clamp(score.securitySuspicion + 2, 0, 30);
    }
    if (score.negligence >= 3) score.firstAuditWarningSequence ??= record.sequence;
    if (score.securitySuspicion >= 9) score.firstSecurityWarningSequence ??= record.sequence;
    if (score.negligence >= 6) score.firstAuditThresholdSequence ??= record.sequence;
    if (score.securitySuspicion >= 14) score.firstSecurityThresholdSequence ??= record.sequence;
    if (score.inconsistency >= 2) score.secondInconsistencySequence ??= record.sequence;
    completed.set(record.encounterId, record.decision);
  }
  return score;
}

function chainAvailable(story: NarrativeState, definition: StoryEncounterDefinition): boolean {
  return (!definition.requires || storyDecision(story, definition.requires)?.decision === 'fit')
    && (definition.id !== 'A7' || story.warnings.some(warning => warning.warningId === 'militant'));
}
export function eligibleStoryEncounters(story: NarrativeState, day: number): StoryEncounterDefinition[] {
  if (story.mode !== 'active' || isWeekend(day)) return [];
  const matches = STORY_ENCOUNTERS.filter(definition => definition.scheduledWorkDay === storyWorkDay(day)
    && (story.encounterStatus[definition.id] === 'scheduled' || story.encounterStatus[definition.id] === 'active') && chainAvailable(story, definition));
  // When a conditional first visitor was cancelled, the remaining visitor is first.
  return matches.map((definition, index) => ({ ...definition, slot: index === 0 ? 0 : 2 }));
}
export function activateStoryEncounter(story: NarrativeState, id: StoryEncounterId, day: number): NarrativeState {
  if (story.encounterStatus[id] !== 'scheduled' || !eligibleStoryEncounters(story, day).some(item => item.id === id)) return story;
  return { ...story, encounterStatus: { ...story.encounterStatus, [id]: 'active' } };
}
function cancelDescendants(status: NarrativeState['encounterStatus'], id: StoryEncounterId): NarrativeState['encounterStatus'] {
  const next = { ...status };
  for (const definition of STORY_ENCOUNTERS) if (definition.requires === id && next[definition.id] === 'scheduled') {
    next[definition.id] = 'cancelled';
    Object.assign(next, cancelDescendants(next, definition.id));
  }
  return next;
}
export function completeStoryEncounter(story: NarrativeState, id: StoryEncounterId, decision: StoryDecision, day: number): NarrativeState {
  if (!eligibleStoryEncounters(story, day).some(definition => definition.id === id) || storyDecision(story, id)) return story;
  const eventId = `decision:${id}`;
  let encounterStatus = { ...story.encounterStatus, [id]: 'completed' as const };
  if (decision === 'unfit') encounterStatus = cancelDescendants(encounterStatus, id);
  const unionPress = { ...story.unionPress, skippedCalendarDays: [...story.unionPress.skippedCalendarDays] };
  if (id === 'C1') unionPress.firstIssueCalendarDay = decision === 'fit' ? 13 : 20;
  if (id === 'C2' && decision === 'unfit' && !unionPress.skippedCalendarDays.includes(27)) unionPress.skippedCalendarDays.push(27);
  return { ...story, decisions: [...story.decisions, { eventId, encounterId: id, decision, day, sequence: story.nextSequence }],
    nextSequence: story.nextSequence + 1, appliedEventIds: [...story.appliedEventIds, eventId], encounterStatus, unionPress };
}
/** Closing a window never substitutes a refusal for an unissued certificate. */
export function finishStoryDay(story: NarrativeState, day: number): NarrativeState {
  if (story.mode !== 'active' || isWeekend(day)) return story;
  let encounterStatus = { ...story.encounterStatus };
  let changed = false;
  for (const definition of STORY_ENCOUNTERS) if (definition.scheduledWorkDay <= storyWorkDay(day)
    && (encounterStatus[definition.id] === 'scheduled' || encounterStatus[definition.id] === 'active')) {
    encounterStatus[definition.id] = chainAvailable(story, definition) ? 'missed' : 'cancelled';
    encounterStatus = cancelDescendants(encounterStatus, definition.id); changed = true;
  }
  const unionPress = story.unionPress.firstIssueCalendarDay === null && storyWorkDay(day) >= 8
    ? { ...story.unionPress, firstIssueCalendarDay: 20 } : story.unionPress;
  return changed || unionPress !== story.unionPress ? { ...story, encounterStatus, unionPress } : story;
}
function warningTriggerSequence(story: NarrativeState, id: StoryWarningId): number | null {
  const score = storyScore(story);
  if (id === 'audit') return score.firstAuditWarningSequence;
  if (id === 'security') return score.firstSecurityWarningSequence;
  if (id === 'consistency') return score.inconsistencies[0]?.sequence ?? null;
  const agent = storyDecision(story, 'A6');
  return agent?.decision === 'fit' ? agent.sequence : null;
}
export function dueStoryWarnings(story: NarrativeState, day: number): StoryWarningId[] {
  if (story.mode !== 'active' || isWeekend(day)) return [];
  return STORY_WARNING_IDS.filter(id => {
    if (story.warnings.some(warning => warning.warningId === id)) return false;
    const trigger = warningTriggerSequence(story, id);
    const decision = story.decisions.find(record => record.sequence === trigger);
    return !!decision && day >= nextWorkDay(decision.day);
  });
}
export const pendingStoryWarnings = dueStoryWarnings;
export const STORY_WARNING_DOCUMENTS: Readonly<Record<StoryWarningId, string>> = { audit: 'SYS-AUDIT', security: 'SYS-SECURITY', consistency: 'SYS-CONSISTENCY', militant: 'A-WARNING' };
/** Call only after a real, accessible paper instance was successfully allocated. */
export function deliverStoryWarning(story: NarrativeState, warningId: StoryWarningId, day: number, documentInstanceId: number): NarrativeState {
  if (!Number.isSafeInteger(documentInstanceId) || documentInstanceId < 1 || !dueStoryWarnings(story, day).includes(warningId)) return story;
  const definitionId = STORY_WARNING_DOCUMENTS[warningId], eventId = `warning:${warningId}`;
  return { ...story, nextSequence: story.nextSequence + 1,
    warnings: [...story.warnings, { warningId, deliveredDay: day, deliveredSequence: story.nextSequence, documentInstanceId }],
    deliveredDocumentIds: [...new Set([...story.deliveredDocumentIds, definitionId])], appliedEventIds: [...story.appliedEventIds, eventId] };
}
export function recordStoryDocument(story: NarrativeState, definitionId: string): NarrativeState {
  return story.deliveredDocumentIds.includes(definitionId) ? story : { ...story, deliveredDocumentIds: [...story.deliveredDocumentIds, definitionId] };
}
export function recordStoryContact(story: NarrativeState, contactId: StoryContactId, encounterId: StoryEncounterId | null = null): NarrativeState {
  const key = `${contactId}:${encounterId ?? 'press'}`;
  const available = contactId === 'CALL-PRINT' ? encounterId === null && story.publicationHistory.includes('issue:kurier:8')
    : encounterId !== null && storyPhoneNoteKey(contactId, encounterId) !== null
      && ['active', 'missed', 'completed'].includes(story.encounterStatus[encounterId]);
  return story.mode === 'legacy-disabled' || !available || story.contacts.includes(key) ? story : { ...story, contacts: [...story.contacts, key] };
}
export function isUnionIssueDue(story: NarrativeState, day: number): boolean {
  const first = story.unionPress.firstIssueCalendarDay;
  return story.mode !== 'legacy-disabled' && first !== null && !isWeekend(day) && day >= first && (day - first) % 7 === 0
    && !story.unionPress.skippedCalendarDays.includes(day) && !story.publicationHistory.includes(`issue:glos:${day}`);
}
export function recordUnionIssue(story: NarrativeState, day: number): NarrativeState {
  return !isUnionIssueDue(story, day) ? story : { ...story, publicationHistory: [...story.publicationHistory, `issue:glos:${day}`],
    unionPress: { ...story.unionPress, printedIssueCount: story.unionPress.printedIssueCount + 1 } };
}
const warningPrecedes = (story: NarrativeState, id: StoryWarningId, sequence: number | null): boolean => sequence !== null
  && story.warnings.some(warning => warning.warningId === id && warning.deliveredSequence < sequence);
export function storyEndingCandidate(story: NarrativeState, moment: 'morning' | 'evening'): Omit<StoryResolution, 'resolvedDay' | 'presented'> | null {
  const lastAgent = storyDecision(story, 'A7');
  if (lastAgent?.decision === 'fit' && warningPrecedes(story, 'militant', lastAgent.sequence)) {
    return { endingId: 'exposed', terminal: true, variant: 'standard' };
  }
  if (moment === 'morning') return null;
  const score = storyScore(story);
  if (score.negligence >= 6 && warningPrecedes(story, 'audit', score.firstAuditThresholdSequence))
    return { endingId: 'clinic-closed', terminal: true, variant: 'violations' };
  if (score.inconsistency >= 2 && score.negligence >= 1 && warningPrecedes(story, 'consistency', score.secondInconsistencySequence))
    return { endingId: 'clinic-closed', terminal: true, variant: 'inconsistency' };
  if (score.securitySuspicion >= 14 && score.oppositionCases >= 2 && warningPrecedes(story, 'security', score.firstSecurityThresholdSequence))
    return { endingId: 'detained', terminal: true, variant: 'standard' };
  if (score.partyTrust >= 10 && score.partyTrust - score.unionTrust >= 8)
    return { endingId: 'party-continue', terminal: false, variant: 'standard' };
  if (score.unionTrust >= 10 && score.unionTrust - score.partyTrust >= 8)
    return { endingId: 'union-continue', terminal: false, variant: 'standard' };
  return { endingId: 'independent-continue', terminal: false, variant: 'standard' };
}
/** Mechanical endings already entered always outrank the political chapter. */
export function resolveStory(story: NarrativeState, day: number, moment: 'morning' | 'evening', existingEnding: string | null = null): NarrativeState {
  if (existingEnding || story.mode !== 'active' || isWeekend(day) || storyWorkDay(day) !== 26) return story;
  const candidate = storyEndingCandidate(story, moment);
  if (!candidate) return story;
  return { ...story, mode: 'resolved', resolution: { ...candidate, resolvedDay: day, presented: false },
    appliedEventIds: [...story.appliedEventIds, 'resolution:chapter-1'] };
}
export function presentStoryEnding(story: NarrativeState): NarrativeState {
  return !story.resolution || story.resolution.presented ? story : { ...story, resolution: { ...story.resolution, presented: true } };
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const keys = (value: Record<string, unknown>, expected: readonly string[]): boolean => Object.keys(value).length === expected.length && expected.every(key => Object.hasOwn(value, key));
const integer = (value: unknown, min: number, max = 1_000_000_000): value is number => Number.isSafeInteger(value) && (value as number) >= min && (value as number) <= max;
const uniqueStrings = (value: unknown, maximum: number): value is string[] => Array.isArray(value) && value.length <= maximum
  && value.every(item => typeof item === 'string' && item.length > 0 && item.length <= 96) && new Set(value).size === value.length;
const same = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);
/** Schema and causal replay. Paper/publication catalogs add their own cross-validation in save.ts. */
export function validateStoryState(value: unknown, currentDay: number): value is NarrativeState {
  if (!object(value) || !keys(value, ['version', 'mode', 'nextSequence', 'decisions', 'encounterStatus', 'warnings', 'appliedEventIds', 'deliveredDocumentIds', 'publicationHistory', 'pendingUnionArticleIds', 'contacts', 'unionPress', 'resolution'])
    || value.version !== 1 || !['active', 'resolved', 'legacy-disabled'].includes(String(value.mode))
    || !integer(value.nextSequence, 1, 23) || !Array.isArray(value.decisions) || value.decisions.length > 18
    || !object(value.encounterStatus) || Object.keys(value.encounterStatus).length !== STORY_ENCOUNTER_IDS.length
    || !STORY_ENCOUNTER_IDS.every(id => ['scheduled', 'active', 'completed', 'missed', 'cancelled'].includes(String((value.encounterStatus as Record<string, unknown>)[id])))
    || !Array.isArray(value.warnings) || value.warnings.length > 4
    || !uniqueStrings(value.appliedEventIds, 23) || !uniqueStrings(value.deliveredDocumentIds, 100)
    || !uniqueStrings(value.publicationHistory, 4096) || !uniqueStrings(value.pendingUnionArticleIds, 100) || !uniqueStrings(value.contacts, 95)
    || !object(value.unionPress) || !keys(value.unionPress, ['firstIssueCalendarDay', 'skippedCalendarDays', 'printedIssueCount'])
    || ![null, 13, 20].includes(value.unionPress.firstIssueCalendarDay as number | null)
    || !Array.isArray(value.unionPress.skippedCalendarDays) || value.unionPress.skippedCalendarDays.length > 1
    || !value.unionPress.skippedCalendarDays.every(day => day === 27) || !integer(value.unionPress.printedIssueCount, 0, 142858)) return false;
  const story = value as unknown as NarrativeState;
  for (const contact of story.contacts) {
    const [id, encounterId, extra] = contact.split(':');
    if (extra !== undefined || !STORY_CONTACT_IDS.includes(id as StoryContactId)
      || (encounterId !== 'press' && !STORY_ENCOUNTER_IDS.includes(encounterId as StoryEncounterId))) return false;
    if (id === 'CALL-PRINT') {
      if (encounterId !== 'press' || currentDay < 8 || !story.publicationHistory.includes('issue:kurier:8')) return false;
    } else {
      const encounter = encounterId as StoryEncounterId;
      if (encounterId === 'press' || !storyPhoneNoteKey(id as StoryContactId, encounter)
        || calendarDayForWorkDay(storyEncounter(encounter).scheduledWorkDay) > currentDay
        || !['active', 'missed', 'completed'].includes(story.encounterStatus[encounter])) return false;
      const source = id === 'CALL-CHAMBER' ? encounter === 'B1' ? 'B-CHAMBER' : `A-FAKE-${encounter.slice(1)}`
        : id === 'CALL-POWER' ? 'D-PARTY' : id === 'CALL-MOS' ? 'J-OPINION-2' : null;
      if (source && !story.deliveredDocumentIds.includes(source)) return false;
    }
  }
  const sequences = new Set<number>();
  let priorDay = 0, priorSequence = 0;
  const seen = new Map<StoryEncounterId, StoryDecisionRecord>();
  for (const record of story.decisions) {
    if (!object(record) || !keys(record, ['eventId', 'encounterId', 'day', 'sequence', 'decision'])
      || !STORY_ENCOUNTER_IDS.includes(record.encounterId) || !['fit', 'unfit'].includes(record.decision)
      || record.eventId !== `decision:${record.encounterId}` || !integer(record.day, 1, currentDay)
      || !integer(record.sequence, 1, story.nextSequence - 1) || record.sequence <= priorSequence || record.day < priorDay
      || isWeekend(record.day) || storyWorkDay(record.day) !== storyEncounter(record.encounterId).scheduledWorkDay
      || seen.has(record.encounterId) || story.encounterStatus[record.encounterId] !== 'completed') return false;
    const required = storyEncounter(record.encounterId).requires;
    if (required && seen.get(required)?.decision !== 'fit') return false;
    seen.set(record.encounterId, record); sequences.add(record.sequence); priorDay = record.day; priorSequence = record.sequence;
  }
  const seenWarnings = new Set<StoryWarningId>(), paperIds = new Set<number>();
  let warningSequence = 0, warningDay = 0;
  for (const warning of story.warnings) {
    if (!object(warning) || !keys(warning, ['warningId', 'deliveredDay', 'deliveredSequence', 'documentInstanceId'])
      || !STORY_WARNING_IDS.includes(warning.warningId) || seenWarnings.has(warning.warningId)
      || !integer(warning.deliveredDay, 1, currentDay) || isWeekend(warning.deliveredDay)
      || !integer(warning.deliveredSequence, 1, story.nextSequence - 1) || sequences.has(warning.deliveredSequence)
      || warning.deliveredSequence <= warningSequence || warning.deliveredDay < warningDay
      || !integer(warning.documentInstanceId, 1) || paperIds.has(warning.documentInstanceId)
      || !story.deliveredDocumentIds.includes(STORY_WARNING_DOCUMENTS[warning.warningId])) return false;
    const trigger = warningTriggerSequence(story, warning.warningId), decision = story.decisions.find(item => item.sequence === trigger);
    if (!decision || warning.deliveredSequence <= decision.sequence || warning.deliveredDay < nextWorkDay(decision.day)) return false;
    for (const record of story.decisions) if ((record.sequence < warning.deliveredSequence && record.day > warning.deliveredDay)
      || (record.sequence > warning.deliveredSequence && record.day < warning.deliveredDay)) return false;
    sequences.add(warning.deliveredSequence); seenWarnings.add(warning.warningId); paperIds.add(warning.documentInstanceId);
    warningSequence = warning.deliveredSequence; warningDay = warning.deliveredDay;
  }
  if (sequences.size !== story.nextSequence - 1) return false;
  const a7 = seen.get('A7');
  if (a7 && !warningPrecedes(story, 'militant', a7.sequence)) return false;
  for (const definition of STORY_ENCOUNTERS) {
    const status = story.encounterStatus[definition.id];
    if ((status === 'completed') !== seen.has(definition.id)) return false;
    const scheduledDay = calendarDayForWorkDay(definition.scheduledWorkDay);
    if (status === 'active' && (scheduledDay !== currentDay || !chainAvailable(story, definition))) return false;
    if (status === 'missed' && scheduledDay > currentDay) return false;
    if (status === 'scheduled' && scheduledDay < currentDay && story.mode !== 'legacy-disabled') return false;
    if (definition.requires && ['active', 'completed', 'missed'].includes(status) && seen.get(definition.requires)?.decision !== 'fit') return false;
    if (story.mode !== 'legacy-disabled' && status === 'cancelled') {
      const upstream = definition.requires && story.encounterStatus[definition.requires];
      if (!(definition.requires && ['completed', 'missed', 'cancelled'].includes(String(upstream))
        && seen.get(definition.requires)?.decision !== 'fit') && !(definition.id === 'A7' && scheduledDay <= currentDay && !seenWarnings.has('militant'))) return false;
    }
  }
  const expectedApplied = [...story.decisions.map(record => ({ id: record.eventId, sequence: record.sequence })),
    ...story.warnings.map(warning => ({ id: `warning:${warning.warningId}`, sequence: warning.deliveredSequence }))]
    .sort((a, b) => a.sequence - b.sequence).map(record => record.id);
  if (story.resolution) expectedApplied.push('resolution:chapter-1');
  if (!same(story.appliedEventIds, expectedApplied)) return false;
  const c1 = seen.get('C1');
  const first = c1 ? c1.decision === 'fit' ? 13 : 20 : story.encounterStatus.C1 === 'missed' ? 20 : null;
  if (story.unionPress.firstIssueCalendarDay !== first || !same(story.unionPress.skippedCalendarDays, seen.get('C2')?.decision === 'unfit' ? [27] : [])) return false;
  const issues = story.publicationHistory.filter(id => id.startsWith('issue:glos:'));
  if (story.unionPress.printedIssueCount !== issues.length) return false;
  for (const issue of issues) {
    const day = Number(issue.slice('issue:glos:'.length));
    if (!first || !integer(day, first, currentDay) || (day - first) % 7 !== 0 || story.unionPress.skippedCalendarDays.includes(day)) return false;
  }
  if (story.mode === 'legacy-disabled') return same(story, createStory('legacy-disabled'));
  if (story.mode === 'active') return story.resolution === null && currentDay <= 36;
  if (!object(story.resolution) || !keys(story.resolution, ['endingId', 'resolvedDay', 'terminal', 'presented', 'variant'])
    || story.resolution.resolvedDay !== 36 || currentDay < 36 || typeof story.resolution.presented !== 'boolean') return false;
  const candidate = storyEndingCandidate(story, 'evening');
  return !!candidate && story.resolution.endingId === candidate.endingId && story.resolution.terminal === candidate.terminal
    && story.resolution.variant === candidate.variant;
}
