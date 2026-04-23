import React from 'react';
import CarSVG from './CarSVG';
import { CAR_PROPERTIES } from './types';

interface GameCellProps {
  level: number;
  selected: boolean;
  onClick: (btn: 'left' | 'right') => void;
}

export default function GameCell({ level, selected, onClick }: GameCellProps) {
  const props = level > 0 ? CAR_PROPERTIES[level] : null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick('right');
  };

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{
        width: 120,
        height: 120,
        background: selected
          ? 'linear-gradient(135deg, #2a2e1a 0%, #1e2218 100%)'
          : 'linear-gradient(135deg, #1e2232 0%, #181c28 100%)',
        border: selected
          ? '2px solid #c8a046'
          : '2px solid rgba(72,78,100,0.8)',
        borderRadius: 12,
        boxShadow: selected
          ? '0 0 18px rgba(200,160,70,0.45), inset 0 0 8px rgba(200,160,70,0.1)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
      }}
      onClick={() => onClick('left')}
      onContextMenu={handleContextMenu}
    >
      {level === 0 ? (
        /* empty cell lane marker */
        <div
          style={{
            width: 6,
            height: 60,
            background: 'rgba(120,128,155,0.25)',
            borderRadius: 3,
          }}
        />
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          <CarSVG level={level} size={88} shadow={false} />
          {/* level badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0d0f15',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 6,
              padding: '1px 7px',
              fontSize: 12,
              fontWeight: 700,
              color: props?.accentColor ?? '#fff',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              lineHeight: '1.4',
              textShadow: `0 0 6px ${props?.accentColor ?? '#fff'}88`,
            }}
          >
            {level}
          </div>
        </div>
      )}

      {/* hover glow overlay */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)',
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
