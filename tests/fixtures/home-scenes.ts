import { createInitialState } from './routine';
import { applyAction, type GameState } from '../../src/core/game';
import { homePage } from '../../src/scenes/home';

/** Real settled saves, with no expense or ending, for visual presentation checks. */
export function homeSceneState(scene: string, kind: 'arrival' | 'budget'): GameState {
  for (let seed = 1; seed <= 1000; seed++) {
    const cabinet = applyAction(createInitialState(seed), 'skip-intro').state;
    const state = applyAction({ ...cabinet, money: 200, clockMinutes: 840 }, 'end-day').state;
    if (homePage(state, 'pl', kind === 'arrival' ? 0 : 1).illustration === scene) return state;
  }
  throw new Error(`No settled ${kind} save for ${scene}`);
}
