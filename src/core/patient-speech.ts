import type { Decision } from './game';
import type { translations } from '../i18n';

export type PatientSpeechLine = keyof typeof translations.pl.patientSpeech;
export type SpeechEvent = 'arrival' | 'vision-pass' | 'vision-refer' | 'departure';
export interface SpeechContext {
  day: number;
  patientId: number;
  decision?: Decision | null;
  /** Presentation-only count: the first failed examination is attempt zero. */
  visionAttempt?: number;
}

const greetings = ['greeting', 'hello', 'morning'] as const;
const hesitations = ['hesitate', 'blurred', 'cannotRead', 'unsure', 'again'] as const;
const farewells = ['thanks', 'goodbye', 'allRight', 'bye'] as const;

/** Sparse, contextual lines. Silence is intentional; no clock or random source. */
export function choosePatientSpeech(event: SpeechEvent, context: SpeechContext): PatientSpeechLine | undefined {
  const encounter = context.day - 1 + context.patientId;
  if (event === 'vision-pass') return;
  if (event === 'vision-refer') {
    return hesitations[((context.day - 1) + (context.visionAttempt ?? 0)) % hesitations.length];
  }
  // A refusal does not earn a polite thank-you, regardless of the doctor's score.
  if (event === 'departure' && context.decision !== 'fit') return;
  if (encounter % 3 !== 0) return;
  const lines = event === 'arrival' ? greetings : farewells;
  return lines[Math.floor(encounter / 3) % lines.length];
}
