import React from 'react';
import CarDisplay from './CarDisplay';
import { CAR_PROPERTIES, MTBANK_THEME } from './types';

interface GameCellProps {
  level: number;
  selected: boolean;
  onClick: (btn: 'left' | 'right') => void;
}

export default function GameCell({ level, selected, onClick }: GameCellProps) {
  const carProps = level > 0 ? CAR_PROPERTIES[level] : null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick('right');
  };

  const getRarityColor = () => {
    if (!carProps) return MTBANK_THEME.accent;
    switch (carProps.rarity) {
      case 'common': return '#64b5f6';
      case 'rare': return '#7e57c2';
      case 'epic': return '#ffd54f';
      default: return MTBANK_THEME.accent;
    }
  };

  return (
    <div
      style={{
        width: 120,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        background: selected
          ? `linear-gradient(135deg, ${MTBANK_THEME.primary} 0%, ${MTBANK_THEME.primaryDark} 100%)`
          : `linear-gradient(135deg, ${MTBANK_THEME.cardBg} 0%, ${MTBANK_THEME.primaryDark} 100%)`,
        border: selected
          ? `2px solid ${MTBANK_THEME.gold}`
          : `2px solid ${MTBANK_THEME.cardBorder}`,
        borderRadius: 12,
        boxShadow: selected ? `0 0 18px ${MTBANK_THEME.gold}80` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'all 0.15s',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
      onClick={() => onClick('left')}
      onContextMenu={handleContextMenu}
    >
      {level === 0 ? (
        <div
          style={{
            width: 6,
            height: 60,
            background: 'rgba(100,181,246,0.25)',
            borderRadius: 3,
          }}
        />
      ) : (
        <>
          <CarDisplay level={level} size={80} />
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              background: MTBANK_THEME.primaryDark,
              border: `1.5px solid ${getRarityColor()}`,
              borderRadius: 6,
              padding: '1px 7px',
              fontSize: 11,
              fontWeight: 700,
              color: getRarityColor(),
              whiteSpace: 'nowrap',
            }}
          >
            {carProps?.name || `Lv.${level}`}
          </div>
        </>
      )}
    </div>
  );
}