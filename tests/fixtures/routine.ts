import { createInitialState as createGame, type GameState } from '../../src/core/game';
import { createStory } from '../../src/core/story';

/** Full current random roster for mechanics isolated from the authored campaign.
 * Narrative integration and migrations are covered by the story suites. */
export function createInitialState(seed?: number): GameState {
  return { ...createGame(seed), story: createStory('legacy-disabled') };
}
