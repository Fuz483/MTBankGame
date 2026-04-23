export const GRID_SIZE = 4;
export const MAX_CAR_LEVEL = 6;
export const BASE_XP_TO_LEVEL_UP = 100;
export const XP_STEP_PER_LEVEL = 10;
export const SAVE_KEY = 'car_merge_save';

export const STARTING_MTCOINS = 100;
export const SELL_MTCOIN_MULTIPLIER = 2;

export interface GameState {
  grid: number[][];
  experience: number;
  mtCoins: number;
  unlockedCars: number[];
}

export interface LevelProgress {
  level: number;
  current: number;
  needed: number;
}

export interface CarProperties {
  name: string;
  price: number;
  imageFile: string;
  rarity: 'common' | 'rare' | 'epic';
}

export const CAR_PROPERTIES: Record<number, CarProperties> = {
  1: { name: 'MTBank', price: 0, imageFile: 'car1.png', rarity: 'common' },
  2: { name: 'GORIOT', price: 300, imageFile: 'car2.png', rarity: 'common' },
  3: { name: 'QUANTUM GRIP', price: 600, imageFile: 'car3.png', rarity: 'rare' },
  4: { name: 'KINEXUSDRIVE', price: 1200, imageFile: 'car4.png', rarity: 'rare' },
  5: { name: 'SPEED', price: 2000, imageFile: 'car5.png', rarity: 'epic' },
  6: { name: 'FLOW', price: 3500, imageFile: 'car6.png', rarity: 'epic' },
};

export const MTBANK_THEME = {
  primary: '#071D49',
  primaryLight: '#0021F3',
  primaryDark: '#010615',
  accent: '#0021F3',
  gold: '#F84B36',
  bgGradient: 'linear-gradient(135deg, #010615 0%, #071D49 50%, #010615 100%)',
  cardBg: '#0a0f1e',
  cardBorder: '#0021F3',
  textPrimary: '#ffffff',
  textSecondary: '#8899cc',
};

export function getLevelProgress(experience: number): LevelProgress {
  let level = 1;
  let remaining = experience;
  let needed = BASE_XP_TO_LEVEL_UP;

  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = BASE_XP_TO_LEVEL_UP + (level - 1) * XP_STEP_PER_LEVEL;
  }

  return { level, current: remaining, needed };
}