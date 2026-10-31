import { translations, type Locale } from '../i18n';
import { formatGameDate, isWeekend } from './calendar';
import { calendarDayForWorkDay, dueStoryWarnings, storyDecision, storyEncounter, storyScore, STORY_DECISION_DELTAS, type ChapterEnding, type NarrativeState, type StoryActorId, type StoryDecision, type StoryEncounterId, type StoryWarningId } from './story';
import { STORY_ACTORS, storyPatientForEncounter } from './story-patients';

export const STORY_CONTACT_IDS = ['CALL-PRINT', 'CALL-CHAMBER', 'CALL-POWER', 'CALL-WAREHOUSE', 'CALL-MOS'] as const;
export type StoryContactId = typeof STORY_CONTACT_IDS[number];
export type StoryContactResponseId = keyof typeof translations.pl.story.phones;
export const STORY_CONTACTS: Readonly<Record<StoryContactId, { phone: string; earliestWorkDay: number }>> = {
  'CALL-PRINT': { phone: '46-0101', earliestWorkDay: 6 },
  'CALL-CHAMBER': { phone: '46-0102', earliestWorkDay: 5 },
  'CALL-POWER': { phone: '46-0103', earliestWorkDay: 15 },
  'CALL-WAREHOUSE': { phone: '46-0104', earliestWorkDay: 18 },
  'CALL-MOS': { phone: '46-0105', earliestWorkDay: 19 },
};
export type StoryDocumentArt = 'formal' | 'clinical' | 'referral' | 'certificate' | 'leaflet' | 'warning' | 'exposure' | 'carbon' | 'private' | 'party-card' | 'bhp' | 'editor-note' | 'delegation';
type IssuerId = keyof typeof translations.pl.story.issuers;
type DocumentTextId = keyof typeof translations.pl.story.documents;
export type StoryIdentityId = StoryActorId | 'alias-real';
export interface StoryDocumentDefinition {
  textId: DocumentTextId; issuer: IssuerId; subjectIdentityId: StoryIdentityId | null;
  encounterId: StoryEncounterId | null; art: StoryDocumentArt; contact: StoryContactId | null;
  /** The old certificate is a historical source; its intake date remains a normal calendar day. */
  historicalDate?: '1982-11-19';
  mark: 'union' | 'voluntary' | null;
}
const definition = (textId: DocumentTextId, issuer: IssuerId, subjectIdentityId: StoryIdentityId | null = null,
  encounterId: StoryEncounterId | null = null, art: StoryDocumentArt = 'formal', contact: StoryContactId | null = null,
  mark: StoryDocumentDefinition['mark'] = null): StoryDocumentDefinition => ({ textId, issuer, subjectIdentityId, encounterId, art, contact, mark });
/** Closed content catalog. Medical forms retain their existing renderer and clinical semantics. */
export const STORY_DOCUMENTS = {
  'A-REF-1': definition('REF', 'employer', 'agent', 'A1', 'referral'),
  'A-REF-2': definition('REF', 'employer', 'agent', 'A2', 'referral'),
  'A-REF-3': definition('REF', 'employer', 'agent', 'A3', 'referral'),
  'A-REF-4': definition('REF', 'employer', 'agent', 'A4', 'referral'),
  'A-REF-5': definition('REF', 'employer', 'agent', 'A5', 'referral'),
  'A-REF-6': definition('REF', 'employer', 'agent', 'A6', 'referral'),
  'A-REF-7': definition('REF', 'employer', 'agent', 'A7', 'referral'),
  'A-FAKE-4': definition('A-FAKE', 'chamber', 'agent', 'A4', 'formal', 'CALL-CHAMBER'),
  'A-FAKE-5': definition('A-FAKE', 'chamber', 'agent', 'A5', 'formal', 'CALL-CHAMBER'),
  'A-FAKE-6': definition('A-FAKE', 'chamber', 'agent', 'A6', 'formal', 'CALL-CHAMBER'),
  'A-FAKE-7': definition('A-FAKE', 'chamber', 'agent', 'A7', 'formal', 'CALL-CHAMBER'),
  'A-WARNING': definition('A-WARNING', 'militant', 'agent', null, 'warning'),
  'A-EXPOSURE': definition('A-EXPOSURE', 'militant', 'agent', null, 'exposure'),
  'A-CLOSURE': definition('A-CLOSURE', 'clinic'),
  'B-REF': definition('REF', 'employer', 'strike-leader', 'B1', 'referral'),
  'B-CHAMBER': definition('B-CHAMBER', 'chamber', 'strike-leader', 'B1', 'formal', 'CALL-CHAMBER'),
  'B-LEAFLET': definition('B-LEAFLET', 'union', 'strike-leader', 'B1', 'leaflet', null, 'union'),
  'C-AD': definition('C-AD', 'printing', null, null, 'formal', 'CALL-PRINT'),
  'C-REF-1': definition('REF', 'employer', 'printer', 'C1', 'referral'),
  'C-REF-2': definition('REF', 'employer', 'printer', 'C2', 'referral'),
  'C-BHP': definition('C-BHP', 'printing', 'printer', 'C1', 'bhp'),
  'C-BHP-2': definition('C-BHP', 'printing', 'printer', 'C2', 'bhp'),
  'C-AUDIO-1': definition('C-AUDIO', 'clinical', 'printer', 'C1', 'clinical'),
  'C-AUDIO-2': definition('C-AUDIO-CONTROL', 'clinical', 'printer', 'C2', 'clinical'),
  'C-PRINT-NOTE': definition('C-PRINT-NOTE', 'union', 'printer', null, 'leaflet', null, 'union'),
  'C-PAUSE': definition('C-PAUSE', 'union', 'printer', null, 'leaflet', null, 'union'),
  'D-REF': definition('REF', 'employer', 'dispatcher', 'D1', 'referral'),
  'D-PARTY': definition('D-PARTY', 'committee', 'dispatcher', 'D1', 'formal', 'CALL-POWER'),
  'E-REF': definition('REF', 'militia', 'sergeant', 'E1-VISIT', 'referral'),
  'E-EYE': definition('E-EYE', 'clinical', 'sergeant', 'E1-VISIT', 'clinical'),
  'E-COMMAND': definition('E-COMMAND', 'militia', 'sergeant', 'E1-VISIT'),
  'F-REF': definition('REF', 'editorial', 'proofreader', 'F1', 'referral'),
  'F-EYE': definition('F-EYE', 'clinical', 'proofreader', 'F1', 'clinical'),
  'F-EDITOR': definition('F-EDITOR', 'editorial', 'proofreader', 'F1', 'editor-note'),
  'G-REF': definition('REF', 'employer', 'volunteer', 'G1', 'referral'),
  'G-DELEGATION': definition('G-DELEGATION', 'employer', 'volunteer', 'G1', 'delegation', null, 'voluntary'),
  'G-ORDER': definition('G-ORDER', 'employer', 'volunteer', 'G1', 'carbon'),
  'G-COMPLAINT': definition('G-COMPLAINT', 'employer', 'volunteer'),
  'H-REF': definition('REF', 'employer', 'storekeeper', 'H1', 'referral', 'CALL-WAREHOUSE'),
  'H-OLD-CERT': { ...definition('H-OLD-CERT', 'clinical', 'storekeeper', 'H1', 'certificate'), historicalDate: '1982-11-19' as const },
  'H-LEAFLET': definition('H-LEAFLET', 'union', 'storekeeper', 'H1', 'leaflet', null, 'union'),
  'H-OUTCOME-FIT': definition('H-OUTCOME-FIT', 'employer', 'storekeeper'),
  'H-OUTCOME-REFUSED': definition('H-OUTCOME-REFUSED', 'employer', 'storekeeper'),
  'I-REF': definition('REF', 'employer', 'alias', 'I1', 'referral'),
  'I-EYE': definition('I-EYE', 'clinical', 'alias-real', 'I1', 'clinical'),
  'I-HEARING': definition('I-HEARING', 'clinical', 'alias-real', 'I1', 'clinical'),
  'I-NOTE': definition('I-NOTE', 'personal', 'alias-real', 'I1', 'private'),
  'I-THANKS': definition('I-THANKS', 'personal', 'alias-real', null, 'private'),
  'J-REF-1': definition('REF', 'employer', 'malec', 'J1', 'referral'),
  'J-REF-2': definition('REF', 'employer', 'malec', 'J2', 'referral'),
  'J-PARTY-CARD': definition('J-PARTY-CARD', 'party', 'malec', 'J1', 'party-card'),
  'J-OPINION-1': definition('J-OPINION-1', 'employer', 'malec', 'J1'),
  'J-OPINION-2': definition('J-OPINION-2', 'employer', 'malec', 'J2', 'formal', 'CALL-MOS'),
  'J-RESULTS-1': definition('J-RESULTS', 'clinical', 'malec', 'J1', 'clinical'),
  'J-RESULTS-2': definition('J-RESULTS', 'clinical', 'malec', 'J2', 'clinical'),
  'J-COMPLAINT-1': definition('J-COMPLAINT-1', 'employer', 'malec'),
  'J-COMPLAINT-2': definition('J-COMPLAINT-2', 'employer', 'malec'),
  'SYS-SECURITY': definition('SYS-SECURITY', 'security'),
  'SYS-AUDIT': definition('SYS-AUDIT', 'clinic'),
  'SYS-CONSISTENCY': definition('SYS-CONSISTENCY', 'clinic'),
  'END-AUDIT': definition('END-AUDIT', 'clinic'),
  'END-SECURITY': definition('END-SECURITY', 'security'),
  'END-PARTY': definition('END-PARTY', 'committee'),
  'END-UNION': definition('END-UNION', 'union', null, null, 'leaflet', null, 'union'),
  'END-ROTA': definition('END-ROTA', 'clinic'),
} as const satisfies Record<string, StoryDocumentDefinition>;
export type StoryDocumentId = keyof typeof STORY_DOCUMENTS;
export const STORY_DOCUMENT_IDS = Object.keys(STORY_DOCUMENTS) as StoryDocumentId[];
export const isStoryDocumentId = (value: string): value is StoryDocumentId => Object.hasOwn(STORY_DOCUMENTS, value);
export interface StoryPaperData {
  definitionId: StoryDocumentId;
  encounterId: StoryEncounterId | null;
  issuedDay: number;
  variantId: 'standard' | 'violations' | 'inconsistency';
  subjectIdentityId: StoryIdentityId | null;
  sourceDecisionEventIds: string[];
}
export const STORY_ENCOUNTER_DOCUMENTS: Readonly<Record<StoryEncounterId, readonly StoryDocumentId[]>> = {
  A1: [], A2: [], A3: [], A4: ['A-FAKE-4'], A5: ['A-FAKE-5'], A6: ['A-FAKE-6'], A7: ['A-FAKE-7'],
  B1: ['B-CHAMBER', 'B-LEAFLET'], C1: ['C-BHP'], C2: ['C-BHP-2'], D1: ['D-PARTY'],
  'E1-VISIT': ['E-EYE', 'E-COMMAND'], F1: ['F-EYE', 'F-EDITOR'], G1: ['G-DELEGATION', 'G-ORDER'],
  H1: ['H-OLD-CERT', 'H-LEAFLET'], I1: ['I-EYE', 'I-HEARING', 'I-NOTE'],
  J1: ['J-PARTY-CARD', 'J-OPINION-1', 'J-RESULTS-1'], J2: ['J-OPINION-2', 'J-RESULTS-2'],
};
export const STORY_ENDING_DOCUMENTS: Readonly<Record<ChapterEnding, readonly StoryDocumentId[]>> = {
  exposed: ['A-EXPOSURE', 'A-CLOSURE'], 'clinic-closed': ['END-AUDIT'], detained: ['END-SECURITY'],
  'party-continue': ['END-PARTY'], 'union-continue': ['END-UNION'], 'independent-continue': ['END-ROTA'],
};
export const STORY_WARNING_DOCUMENT_IDS: Readonly<Record<StoryWarningId, StoryDocumentId>> = {
  audit: 'SYS-AUDIT', security: 'SYS-SECURITY', consistency: 'SYS-CONSISTENCY', militant: 'A-WARNING',
};
export function createStoryPaperData(definitionId: StoryDocumentId, story: NarrativeState, issuedDay: number,
  encounterId: StoryEncounterId | null = STORY_DOCUMENTS[definitionId].encounterId): StoryPaperData {
  const score = storyScore(story);
  let sourceDecisionEventIds: string[] = [];
  if (definitionId === 'A-EXPOSURE' || definitionId === 'A-CLOSURE') {
    sourceDecisionEventIds = story.decisions.filter(record => (record.encounterId === 'A6' || record.encounterId === 'A7') && record.decision === 'fit').map(record => record.eventId);
  } else if (definitionId === 'SYS-AUDIT' || definitionId === 'END-AUDIT') {
    sourceDecisionEventIds = score.evidence.slice(-3).map(record => record.eventId);
  } else if (definitionId === 'END-SECURITY') {
    sourceDecisionEventIds = score.evidence.filter(record => record.oppositionCase).map(record => record.eventId);
  } else if (definitionId === 'SYS-SECURITY') {
    sourceDecisionEventIds = story.decisions.filter(record => STORY_DECISION_DELTAS[record.encounterId][record.decision].securitySuspicion > 0).slice(-2).map(record => record.eventId);
  } else if (definitionId === 'SYS-CONSISTENCY') {
    sourceDecisionEventIds = score.inconsistencies.slice(0, 1).flatMap(record => [`decision:${record.previousEncounterId}`, `decision:${record.encounterId}`]);
  }
  if (definitionId === 'END-AUDIT' && story.resolution?.variant === 'inconsistency') {
    sourceDecisionEventIds = score.inconsistencies.flatMap(record => [`decision:${record.previousEncounterId}`, `decision:${record.encounterId}`]);
  }
  return { definitionId, encounterId, issuedDay, variantId: definitionId === 'END-AUDIT' ? story.resolution?.variant ?? 'standard' : 'standard',
    subjectIdentityId: STORY_DOCUMENTS[definitionId].subjectIdentityId, sourceDecisionEventIds };
}
export function encounterStoryDocuments(story: NarrativeState, encounterId: StoryEncounterId, day: number): StoryPaperData[] {
  return STORY_ENCOUNTER_DOCUMENTS[encounterId].map(id => createStoryPaperData(id, story, day, encounterId));
}
/** Planned delivery is not receipt. The caller records each ID only after allocating the physical paper. */
export function morningStoryDocuments(story: NarrativeState, day: number): StoryPaperData[] {
  if (story.mode === 'legacy-disabled' || isWeekend(day)) return [];
  const ids: StoryDocumentId[] = dueStoryWarnings(story, day).map(id => STORY_WARNING_DOCUMENT_IDS[id]);
  const due = (workDay: number, encounter: StoryEncounterId, decision: StoryDecision, id: StoryDocumentId) => {
    const record = storyDecision(story, encounter);
    if (day >= calendarDayForWorkDay(workDay) && record?.decision === decision && record.day < day) ids.push(id);
  };
  due(9, 'C1', 'fit', 'C-PRINT-NOTE'); due(19, 'C2', 'unfit', 'C-PAUSE');
  due(18, 'G1', 'unfit', 'G-COMPLAINT'); due(21, 'H1', 'fit', 'H-OUTCOME-FIT'); due(21, 'H1', 'unfit', 'H-OUTCOME-REFUSED');
  due(26, 'I1', 'fit', 'I-THANKS'); due(11, 'J1', 'unfit', 'J-COMPLAINT-1'); due(20, 'J2', 'unfit', 'J-COMPLAINT-2');
  if (story.resolution && !story.resolution.terminal && day > story.resolution.resolvedDay) ids.push(...STORY_ENDING_DOCUMENTS[story.resolution.endingId]);
  return [...new Set(ids)].filter(id => !story.deliveredDocumentIds.includes(id)).map(id => createStoryPaperData(id, story,
    id.startsWith('END-') ? story.resolution!.resolvedDay : day));
}
export function endingStoryDocuments(story: NarrativeState): StoryPaperData[] {
  return story.resolution ? STORY_ENDING_DOCUMENTS[story.resolution.endingId].map(id => createStoryPaperData(id, story, story.resolution!.resolvedDay)) : [];
}
export function storyDocumentCopy(data: StoryPaperData, locale: Locale, story?: NarrativeState) {
  const definition: StoryDocumentDefinition = STORY_DOCUMENTS[data.definitionId], t = translations[locale].story;
  const copy = t.documents[definition.textId], paragraphs: string[] = copy.body.split('\n\n');
  const subject = data.subjectIdentityId ? t.actors[data.subjectIdentityId] : t.ui.room;
  if (data.subjectIdentityId) {
    const actor = STORY_ACTORS.find(item => item.actorId === (data.subjectIdentityId === 'alias-real' ? 'alias' : data.subjectIdentityId));
    if (actor) paragraphs.unshift(`${t.ui.dateOfBirth}: ${actor.birthDate.split('-').reverse().join(locale === 'pl' ? '.' : '/')}.`);
  }
  if (story && data.sourceDecisionEventIds.length) {
    const evidence = storyScore(story).evidence;
    for (const eventId of data.sourceDecisionEventIds) {
      const record = story.decisions.find(item => item.eventId === eventId);
      if (!record) continue;
      const patient = storyPatientForEncounter(record.encounterId).patient;
      const identity = t.actors[storyEncounter(record.encounterId).actorId];
      const finding = evidence.find(item => item.eventId === eventId);
      const lines = [`${formatGameDate(record.day, locale)}. ${identity}.`,
        `${t.ui.job}: ${translations[locale].patientJobs[patient.id]}.`,
        `${t.ui.sourceDecision}: ${record.decision === 'fit' ? t.ui.decisionFit : t.ui.decisionUnfit}.`];
      if (finding && data.definitionId !== 'A-EXPOSURE') lines.push(t.ui[finding.kind] + '.');
      if (data.definitionId === 'A-EXPOSURE') lines.push(t.ui.doctorSignature + '.');
      paragraphs.push(lines.join(' '));
    }
  }
  const issuedDate = definition.historicalDate ? definition.historicalDate.split('-').reverse().join(locale === 'pl' ? '.' : '/') : formatGameDate(data.issuedDay, locale);
  const reference = data.definitionId.startsWith('A-FAKE-') ? `IL/417/83-${data.definitionId.slice(-1)}`
    : `04/${String(STORY_DOCUMENT_IDS.indexOf(data.definitionId) + 1).padStart(3, '0')}/${String(data.issuedDay).padStart(3, '0')}`;
  return { title: copy.title, issuer: t.issuers[definition.issuer], subject, issuedDate, reference, paragraphs,
    body: paragraphs.join('\n\n'), signature: t.signatures[definition.issuer], contact: definition.contact, contactId: definition.contact, art: definition.art, mark: definition.mark };
}
export function storyContactResponse(id: StoryContactId, source: StoryDocumentId | null, story: NarrativeState, day: number): StoryContactResponseId | null {
  if (day < calendarDayForWorkDay(STORY_CONTACTS[id].earliestWorkDay)) return null;
  if (id === 'CALL-PRINT') return storyDecision(story, 'C1') ? 'print-closed' : 'print-open';
  if (!source || STORY_DOCUMENTS[source].contact !== id) return null;
  if (id === 'CALL-CHAMBER') return source === 'B-CHAMBER' ? 'chamber-genuine' : 'chamber-forged';
  return id === 'CALL-POWER' ? 'power' : id === 'CALL-WAREHOUSE' ? 'warehouse' : 'mos';
}
export function storySpeech(encounterId: StoryEncounterId, phase: 'arrival' | 'departure', decision: StoryDecision | null, locale: Locale): string | null {
  const copy = translations[locale].story.speech;
  return phase === 'arrival' ? copy[encounterId] : encounterId === 'B1' && decision === 'fit' ? copy.thanks : null;
}
export type StoryArticleId = keyof typeof translations.pl.story.articles;
export const STORY_ARTICLE_IDS = Object.keys(translations.pl.story.articles) as StoryArticleId[];
export const isStoryArticleId = (value: string): value is StoryArticleId => Object.hasOwn(translations.pl.story.articles, value);
export const storyArticleCopy = (id: StoryArticleId, locale: Locale) => translations[locale].story.articles[id];
export type StoryClassifiedId = 'C-AD';
export const storyClassifiedCopy = (id: StoryClassifiedId, locale: Locale) => ({ text: translations[locale].story.classifieds[id], phone: STORY_CONTACTS['CALL-PRINT'].phone, contactId: 'CALL-PRINT' as const });
/** Closed snapshots are checked independently of whether their physical paper was kept. */
export function validateStoryPaperData(value: unknown, story: NarrativeState, currentDay: number): value is StoryPaperData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const data = value as StoryPaperData;
  if (Object.keys(data).sort().join(',') !== ['definitionId','encounterId','issuedDay','variantId','subjectIdentityId','sourceDecisionEventIds'].sort().join(',')) return false;
  if (typeof data.definitionId !== 'string' || !isStoryDocumentId(data.definitionId) || !Number.isSafeInteger(data.issuedDay) || data.issuedDay < 1 || data.issuedDay > currentDay || isWeekend(data.issuedDay)) return false;
  const definition = STORY_DOCUMENTS[data.definitionId];
  if (data.subjectIdentityId !== definition.subjectIdentityId || !['standard','violations','inconsistency'].includes(data.variantId)) return false;
  if (data.definitionId !== 'END-AUDIT' && data.variantId !== 'standard') return false;
  if (data.encounterId !== definition.encounterId && !(data.definitionId === 'C-BHP' && data.encounterId === 'C2')) return false;
  if (data.encounterId && data.issuedDay !== calendarDayForWorkDay(storyEncounter(data.encounterId).scheduledWorkDay)) return false;
  if (!Array.isArray(data.sourceDecisionEventIds) || new Set(data.sourceDecisionEventIds).size !== data.sourceDecisionEventIds.length || data.sourceDecisionEventIds.some(id => typeof id !== 'string')) return false;
  const sources = data.sourceDecisionEventIds.map(id => story.decisions.find(record => record.eventId === id));
  if (sources.some(record => !record || record.day > data.issuedDay)) return false;
  const score = storyScore(story);
  const evidenceIds = new Set(score.evidence.map(record => record.eventId));
  const oppositionIds = new Set(score.evidence.filter(record => record.oppositionCase).map(record => record.eventId));
  const consistencyIds = new Set(score.inconsistencies.flatMap(record => [`decision:${record.previousEncounterId}`, `decision:${record.encounterId}`]));
  if (data.definitionId === 'A-EXPOSURE' || data.definitionId === 'A-CLOSURE') {
    return data.sourceDecisionEventIds.join(',') === 'decision:A6,decision:A7' && sources.every(record => record?.decision === 'fit')
      && story.resolution?.endingId === 'exposed' && data.issuedDay === story.resolution.resolvedDay;
  }
  if (data.definitionId === 'SYS-AUDIT' || (data.definitionId === 'END-AUDIT' && data.variantId !== 'inconsistency')) {
    if (sources.length < 1 || sources.length > 3 || data.sourceDecisionEventIds.some(id => !evidenceIds.has(id))) return false;
  } else if (data.definitionId === 'SYS-CONSISTENCY' || (data.definitionId === 'END-AUDIT' && data.variantId === 'inconsistency')) {
    if (sources.length < 2 || sources.length > 4 || data.sourceDecisionEventIds.some(id => !consistencyIds.has(id))) return false;
  } else if (data.definitionId === 'END-SECURITY') {
    if (sources.length < 2 || data.sourceDecisionEventIds.some(id => !oppositionIds.has(id))) return false;
  } else if (data.definitionId === 'SYS-SECURITY') {
    if (sources.length < 1 || sources.length > 2 || sources.some(record => !record || STORY_DECISION_DELTAS[record.encounterId][record.decision].securitySuspicion <= 0)) return false;
  } else if (sources.length) return false;
  const warning = (Object.keys(STORY_WARNING_DOCUMENT_IDS) as StoryWarningId[]).find(id => STORY_WARNING_DOCUMENT_IDS[id] === data.definitionId);
  if (warning && !story.warnings.some(record => record.warningId === warning && record.deliveredDay === data.issuedDay)) return false;
  if (warning && sources.some(record => record!.day >= data.issuedDay)) return false;
  if (data.definitionId.startsWith('END-') && (!story.resolution || !STORY_ENDING_DOCUMENTS[story.resolution.endingId].includes(data.definitionId) || story.resolution.resolvedDay !== data.issuedDay)) return false;
  return true;
}
