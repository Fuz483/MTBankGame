// src/game/logic.ts - ПОЛНОСТЬЮ

import { 
  GRID_SIZE, 
  MAX_CAR_LEVEL, 
  SELL_MTCOIN_MULTIPLIER,
  CAR_PROPERTIES,
  getLevelProgress  // <- импортируем из types.ts
} from './types';
import type { GameState } from './types';

// ЭКСПОРТИРУЕМ getLevelProgress ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ
export { getLevelProgress };  // <--- ЭТО ВАЖНО!

export function emptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

export function canSpawn(grid: number[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true;
    }
  }
  return false;
}

function getMinSpawnLevel(experience: number): number {
  const { level } = getLevelProgress(experience);
  return Math.min(MAX_CAR_LEVEL, 1 + Math.floor(level / 15));
}

export function spawnCar(state: GameState): GameState {
  if (!canSpawn(state.grid)) return state;

  const emptyCells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (state.grid[r][c] === 0) emptyCells.push([r, c]);
    }
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const [row, col] = emptyCells[randomIndex];
  const newGrid = state.grid.map(row => [...row]);
  
  const availableLevels = state.unlockedCars.filter(l => l <= MAX_CAR_LEVEL);
  const minLevel = getMinSpawnLevel(state.experience);
  const possibleLevels = availableLevels.filter(l => l >= minLevel);
  
  if (possibleLevels.length === 0) {
    newGrid[row][col] = 1;
  } else {
    const idx = Math.floor(Math.random() * possibleLevels.length);
    newGrid[row][col] = possibleLevels[idx];
  }

  return { ...state, grid: newGrid };
}

export function mergeCars(
  state: GameState,
  r1: number, c1: number,
  r2: number, c2: number
): { state: GameState; xpGained: number; mtCoinsGained: number } | null {
  const level1 = state.grid[r1][c1];
  const level2 = state.grid[r2][c2];

  if (level1 !== level2 || level1 === 0 || level1 >= MAX_CAR_LEVEL) return null;

  const newGrid = state.grid.map(row => [...row]);
  const newLevel = level1 + 1;
  newGrid[r1][c1] = newLevel;
  newGrid[r2][c2] = 0;

  const xpGained = level1 * 8;
  const mtCoinsGained = Math.floor(xpGained * 0.5);
  
  const newUnlockedCars = [...state.unlockedCars];
  if (!newUnlockedCars.includes(newLevel) && newLevel <= MAX_CAR_LEVEL) {
    newUnlockedCars.push(newLevel);
    newUnlockedCars.sort((a, b) => a - b);
  }

  return {
    state: { 
      grid: newGrid, 
      experience: state.experience + xpGained,
      mtCoins: state.mtCoins + mtCoinsGained,
      unlockedCars: newUnlockedCars
    },
    xpGained,
    mtCoinsGained,
  };
}

export function sellCar(
  state: GameState,
  row: number,
  col: number
): { state: GameState; xpGained: number; mtCoinsGained: number } {
  const level = state.grid[row][col];
  const xpGained = Math.max(2, Math.ceil(level * 4));
  const mtCoinsGained = xpGained * SELL_MTCOIN_MULTIPLIER;

  const newGrid = state.grid.map(row => [...row]);
  newGrid[row][col] = 0;

  return {
    state: { 
      grid: newGrid, 
      experience: state.experience + xpGained,
      mtCoins: state.mtCoins + mtCoinsGained,
      unlockedCars: state.unlockedCars
    },
    xpGained,
    mtCoinsGained,
  };
}

export function purchaseCar(state: GameState, level: number): { state: GameState; success: boolean } {
  const carProps = CAR_PROPERTIES[level];
  
  if (!carProps) return { state, success: false };
  if (carProps.price === 0) return { state, success: false };
  
  if (state.mtCoins >= carProps.price && !state.unlockedCars.includes(level)) {
    const newUnlockedCars = [...state.unlockedCars, level];
    newUnlockedCars.sort((a, b) => a - b);
    return {
      state: {
        ...state,
        mtCoins: state.mtCoins - carProps.price,
        unlockedCars: newUnlockedCars
      },
      success: true
    };
  }
  return { state, success: false };
}