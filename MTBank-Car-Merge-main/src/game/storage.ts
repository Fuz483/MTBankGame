import { SAVE_KEY, STARTING_MTCOINS } from './types';
import type { GameState } from './types';
import { emptyGrid } from './logic';

const ALL_MODELS = ['F1-Scorpion', 'F1-Viper', 'F1-Thunder', 'F1-Nova', 'F1-Phantom', 'F1-Legend'];

export function levelToName(level: number) {
  return ALL_MODELS[Math.min(level - 1, ALL_MODELS.length - 1)] || 'F1-Scorpion';
}

export function nameToLevel(name: string) {
  const idx = ALL_MODELS.indexOf(name);
  return idx >= 0 ? idx + 1 : 1;
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    localStorage.setItem('mtbank_shared_coins', state.mtCoins.toString());

    // ПРЕВРАЩАЕМ СЕТКУ ИГРЫ В СПИСОК ГАРАЖА ДЛЯ ГЛАВНОГО МЕНЮ
    const cars: string[] = [];
    for(let r = 0; r < 4; r++) {
      for(let c = 0; c < 4; c++) {
        if(state.grid[r][c] > 0) cars.push(levelToName(state.grid[r][c]));
      }
    }
    localStorage.setItem('mtbank_shared_garage', JSON.stringify(cars));
  } catch (e) {
    console.warn('Failed to save game', e);
  }
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const sharedCoinsRaw = localStorage.getItem('mtbank_shared_coins');
    const sharedGarageRaw = localStorage.getItem('mtbank_shared_garage');

    const sharedCoins = sharedCoinsRaw ? parseInt(sharedCoinsRaw, 10) : STARTING_MTCOINS;
    let grid = emptyGrid();

    // ЗАГРУЖАЕМ ГАРАЖ ИЗ ГЛАВНОГО МЕНЮ НА СЕТКУ
    if (sharedGarageRaw) {
       const cars: string[] = JSON.parse(sharedGarageRaw);
       let i = 0;
       for(let r = 0; r < 4; r++) {
         for(let c = 0; c < 4; c++) {
           if(i < cars.length) {
             grid[r][c] = nameToLevel(cars[i]);
             i++;
           }
         }
       }
    } else if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.grid) grid = parsed.grid;
    }

    return {
      grid,
      experience: raw ? JSON.parse(raw).experience || 0 : 0,
      mtCoins: sharedCoins,
      unlockedCars: raw ? JSON.parse(raw).unlockedCars || [1] : [1]
    };
  } catch (e) {
    console.warn('Failed to load save', e);
  }
  return { grid: emptyGrid(), experience: 0, mtCoins: STARTING_MTCOINS, unlockedCars: [1] };
}