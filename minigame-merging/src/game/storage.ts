import { SAVE_KEY } from './types';
import type { GameState } from './types';
import { emptyGrid } from './logic';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — silently skip
  }
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GameState;
      if (parsed.grid && parsed.experience !== undefined) return parsed;
    }
  } catch {
    // corrupted save — start fresh
  }
  return { grid: emptyGrid(), experience: 0 };
}
