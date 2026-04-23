export const GRID_SIZE = 4;
export const MAX_CAR_LEVEL = 17;
export const BASE_XP_TO_LEVEL_UP = 100;
export const XP_STEP_PER_LEVEL = 10;
export const SAVE_KEY = 'car_merge_save';

export interface GameState {
  grid: number[][];
  experience: number;
}

export interface LevelProgress {
  level: number;
  current: number;
  needed: number;
}

export interface CarProperties {
  name: string;
  primaryColor: string;
  accentColor: string;
  bodyStyle: 'sports' | 'muscle' | 'formula' | 'suv' | 'luxury' | 'concept';
}

export const CAR_PROPERTIES: Record<number, CarProperties> = {
  1:  { name: 'RACING',       primaryColor: '#b83c3c', accentColor: '#e05555', bodyStyle: 'sports'   },
  2:  { name: 'APEX',         primaryColor: '#3c78c8', accentColor: '#5599ee', bodyStyle: 'sports'   },
  3:  { name: 'VELOCITY',     primaryColor: '#32b464', accentColor: '#44dd88', bodyStyle: 'sports'   },
  4:  { name: 'QUANTUM GRIP', primaryColor: '#c8b450', accentColor: '#f0dc78', bodyStyle: 'muscle'   },
  5:  { name: 'KINEXUSDRIVE', primaryColor: '#c87828', accentColor: '#f09a40', bodyStyle: 'muscle'   },
  6:  { name: 'GORIOT',       primaryColor: '#9650b4', accentColor: '#c87ee0', bodyStyle: 'luxury'   },
  7:  { name: 'MTBANK',       primaryColor: '#32b4b4', accentColor: '#44dddd', bodyStyle: 'luxury'   },
  8:  { name: 'SPEED',        primaryColor: '#c86496', accentColor: '#f088b8', bodyStyle: 'formula'  },
  9:  { name: 'FLOW',         primaryColor: '#3c4050', accentColor: '#6878a0', bodyStyle: 'suv'      },
  10: { name: 'QUANTUM',      primaryColor: '#c8a046', accentColor: '#f0c860', bodyStyle: 'concept'  },
  11: { name: 'COSMIC',       primaryColor: '#2878be', accentColor: '#40aaff', bodyStyle: 'formula'  },
  12: { name: 'RUST',         primaryColor: '#825f46', accentColor: '#b08060', bodyStyle: 'muscle'   },
  13: { name: 'MOTORA',       primaryColor: '#1446a0', accentColor: '#2266cc', bodyStyle: 'luxury'   },
  14: { name: 'FLAME',        primaryColor: '#dc6e2d', accentColor: '#ff9040', bodyStyle: 'sports'   },
  15: { name: 'DINOCO',       primaryColor: '#d2d250', accentColor: '#f0f070', bodyStyle: 'concept'  },
  16: { name: 'IGNITR GREEN', primaryColor: '#5ad296', accentColor: '#80ffbb', bodyStyle: 'formula'  },
  17: { name: 'IGNITR GOLD',  primaryColor: '#ebd278', accentColor: '#ffe898', bodyStyle: 'concept'  },
};
