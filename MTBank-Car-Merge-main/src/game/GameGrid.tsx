import React from 'react';
import GameCell from './GameCell';
import { MTBANK_THEME } from './types';

interface GameGridProps {
  grid: number[][];
  selected: [number, number] | null;
  onCellClick: (row: number, col: number, btn: 'left' | 'right') => void;
}

export default function GameGrid({ grid, selected, onCellClick }: GameGridProps) {
  return (
    <div
      style={{
        padding: 16,
        background: `linear-gradient(145deg, ${MTBANK_THEME.primaryDark} 0%, ${MTBANK_THEME.primary} 100%)`,
        border: `2px solid ${MTBANK_THEME.accent}`,
        borderRadius: 20,
      }}
    >
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(4, 120px)' }}>
        {grid.map((row, r) =>
          row.map((level, c) => (
            <GameCell
              key={`${r}-${c}`}
              level={level}
              selected={selected !== null && selected[0] === r && selected[1] === c}
              onClick={btn => onCellClick(r, c, btn)}
            />
          ))
        )}
      </div>
    </div>
  );
}