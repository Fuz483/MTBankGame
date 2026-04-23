import React from 'react';
import GameCell from './GameCell';

interface GameGridProps {
  grid: number[][];
  selected: [number, number] | null;
  onCellClick: (row: number, col: number, btn: 'left' | 'right') => void;
}

export default function GameGrid({ grid, selected, onCellClick }: GameGridProps) {
  return (
    <div
      className="relative"
      style={{
        padding: 16,
        background: 'linear-gradient(145deg, #1a1d28 0%, #13151f 100%)',
        border: '2px solid rgba(200,80,140,0.45)',
        borderRadius: 20,
        boxShadow:
          '0 0 40px rgba(200,80,140,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* corner accents */}
      {[
        { top: -1, left: -1, borderTop: '3px solid #c85090', borderLeft: '3px solid #c85090' },
        { top: -1, right: -1, borderTop: '3px solid #c85090', borderRight: '3px solid #c85090' },
        { bottom: -1, left: -1, borderBottom: '3px solid #c85090', borderLeft: '3px solid #c85090' },
        { bottom: -1, right: -1, borderBottom: '3px solid #c85090', borderRight: '3px solid #c85090' },
      ].map((style, i) => (
        <div
          key={i}
          className="absolute"
          style={{ ...style, width: 18, height: 18, borderRadius: 2 }}
        />
      ))}

      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 120px)' }}>
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
