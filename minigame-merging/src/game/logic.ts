import { GRID_SIZE, MAX_CAR_LEVEL, BASE_XP_TO_LEVEL_UP, XP_STEP_PER_LEVEL } from './types';
import type { GameState, LevelProgress } from './types';

export function emptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  let remaining = totalXp;
  let needed = BASE_XP_TO_LEVEL_UP;

  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = BASE_XP_TO_LEVEL_UP + (level - 1) * XP_STEP_PER_LEVEL;
  }

  return { level, current: remaining, needed };
}

export function getMinSpawnLevel(experience: number): number {
  const { level } = getLevelProgress(experience);
  return Math.min(MAX_CAR_LEVEL, 1 + Math.floor(level / 15));
}

export function canSpawn(grid: number[][]): boolean {
  return grid.some(row => row.some(cell => cell === 0));
}

export function spawnCar(state: GameState): GameState {
  if (!canSpawn(state.grid)) return state;

  const emptyCells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (state.grid[r][c] === 0) emptyCells.push([r, c]);
    }
  }

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = state.grid.map(r => [...r]);
  newGrid[row][col] = getMinSpawnLevel(state.experience);

  return { ...state, grid: newGrid };
}

export function mergeCars(
  state: GameState,
  r1: number, c1: number,
  r2: number, c2: number
): { state: GameState; xpGained: number } | null {
  const level1 = state.grid[r1][c1];
  const level2 = state.grid[r2][c2];

  if (level1 !== level2 || level1 === 0 || level1 >= MAX_CAR_LEVEL) return null;

  const newGrid = state.grid.map(r => [...r]);
  newGrid[r1][c1] = level1 + 1;
  newGrid[r2][c2] = 0;

  const xpGained = level1 * 5;

  return {
    state: { grid: newGrid, experience: state.experience + xpGained },
    xpGained,
  };
}

export function sellCar(
  state: GameState,
  row: number,
  col: number
): { state: GameState; xpGained: number } {
  const level = state.grid[row][col];
  const xpGained = Math.max(1, Math.ceil(level * 5 * 0.1));

  const newGrid = state.grid.map(r => [...r]);
  newGrid[row][col] = 0;

  return {
    state: { grid: newGrid, experience: state.experience + xpGained },
    xpGained,
  };
}
