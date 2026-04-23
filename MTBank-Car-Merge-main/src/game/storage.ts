import { SAVE_KEY, STARTING_MTCOINS } from './types';
import type { GameState } from './types';
import { emptyGrid } from './logic';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game', e);
  }
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.grid && parsed.experience !== undefined) {
        return {
          grid: parsed.grid,
          experience: parsed.experience,
          mtCoins: parsed.mtCoins ?? STARTING_MTCOINS,
          unlockedCars: parsed.unlockedCars ?? [1]
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load save', e);
  }
  return { 
    grid: emptyGrid(), 
    experience: 0, 
    mtCoins: STARTING_MTCOINS,
    unlockedCars: [1]
  };
}