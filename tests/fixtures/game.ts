import { createInitialState as createGame, type GameState } from '../../src/core/game';
import { createStory } from '../../src/core/story';

/** Frozen v9 queue for tests about original case details and legacy imports. */
export function createInitialState(seed?: number): GameState {
  if (seed !== undefined) return { ...createGame(seed), story: createStory('legacy-disabled') };
  return { ...createGame(0x4e505301), story: createStory('legacy-disabled'), rngState: 3477621340,
    roster: [0, 1, 2, 62, 49, 75, 81, 66, 98, 4, 67, 43, 34, 28, 42, 58, 15, 21, 89, 26, 93, 52, 100, 8, 72, 86, 14, 38] };
}
