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
      pushMessage(`SOLD! +${result.xpGained} XP`);
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
      pushMessage(`+${result.xpGained} XP!`);
    }
    setSelected(null);
  }, [state, selected, pushMessage]);

  const handleReset = useCallback(() => {
    const fresh: GameState = { grid: Array.from({ length: 4 }, () => Array(4).fill(0)), experience: 0 };
    setState(fresh);
    setSelected(null);
  }, []);

  return { state, selected, messages, handleSpawn, handleCellClick, handleReset };
}
