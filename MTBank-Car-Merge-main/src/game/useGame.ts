import { useState, useCallback, useEffect } from 'react';
import type { GameState } from './types';
import { canSpawn, spawnCar, mergeCars, sellCar } from './logic';
import { saveGame, loadGame } from './storage';

export interface GameMessage {
  text: string;
  id: number;
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => loadGame());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [messages, setMessages] = useState<GameMessage[]>([]);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  // СЛУШАЕМ ГЛАВНОЕ МЕНЮ (Монеты и Рулетки/Гонки)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'mtbank_shared_coins' && e.newValue) {
        setState(s => ({ ...s, mtCoins: parseInt(e.newValue!, 10) }));
      }
      if (e.key === 'mtbank_shared_garage' && e.newValue) {
        const cars: string[] = JSON.parse(e.newValue);
        const ALL_MODELS = ['F1-Scorpion', 'F1-Viper', 'F1-Thunder', 'F1-Nova', 'F1-Phantom', 'F1-Legend'];
        const nameToLevel = (name: string) => { const idx = ALL_MODELS.indexOf(name); return idx >= 0 ? idx + 1 : 1; };

        // Мгновенно перестраиваем сетку
        const newGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
        let i = 0;
        for(let r=0; r<4; r++) {
          for(let c=0; c<4; c++) {
            if(i < cars.length) {
              newGrid[r][c] = nameToLevel(cars[i]);
              i++;
            }
          }
        }
        setState(s => ({ ...s, grid: newGrid }));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const pushMessage = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setMessages(prev => [...prev, { text, id }]);
    setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 2000);
  }, []);

  const handleSpawn = useCallback(() => {
    if (!canSpawn(state.grid)) {
      pushMessage('Track is full!');
      return;
    }
    setState(s => spawnCar(s));
  }, [state.grid, pushMessage]);

  const handleCellClick = useCallback((row: number, col: number, button: 'left' | 'right') => {
    const level = state.grid[row][col];

    if (button === 'right') {
      if (level === 0) return;
      const result = sellCar(state, row, col);
      setState(result.state);
      setSelected(null);
      pushMessage(`💰 SOLD! +${result.xpGained} XP +${result.mtCoinsGained} MT`);
      return;
    }

    if (level === 0) {
      setSelected(null);
      return;
    }

    if (!selected) {
      setSelected([row, col]);
      return;
    }

    const [r1, c1] = selected;
    if (r1 === row && c1 === col) {
      setSelected(null);
      return;
    }

    const result = mergeCars(state, r1, c1, row, col);
    if (result) {
      setState(result.state);
      pushMessage(`✨ MERGE! +${result.xpGained} XP +${result.mtCoinsGained} MT`);
    } else {
      pushMessage(`❌ Cannot merge different cars!`);
    }
    setSelected(null);
  }, [state, selected, pushMessage]);

  const handleReset = useCallback(() => {
    const fresh: GameState = {
      grid: Array.from({ length: 4 }, () => Array(4).fill(0)),
      experience: 0,
      mtCoins: state.mtCoins,
      unlockedCars: [1]
    };
    setState(fresh);
    setSelected(null);
    pushMessage('🔄 Game reset!');
  }, [state.mtCoins, pushMessage]);

  const handleStateChange = useCallback((newState: GameState) => {
    setState(newState);
  }, []);

  return { state, selected, messages, handleSpawn, handleCellClick, handleReset, handleStateChange };
}