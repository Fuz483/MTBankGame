import React from 'react';
import { CAR_PROPERTIES, MTBANK_THEME } from './types';

interface CarDisplayProps {
  level: number;
  size?: number;
}

export default function CarDisplay({ level, size = 88 }: CarDisplayProps) {
  const car = CAR_PROPERTIES[level];
  
  if (!car) {
    return (
      <div style={{ width: size, height: size * 0.7, background: '#333', borderRadius: 12 }} />
    );
  }
  
  return (
    <div
      style={{
        width: size,
        height: size * 0.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${MTBANK_THEME.primaryDark}, ${MTBANK_THEME.primary})`,
        borderRadius: 12,
        padding: 6,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <img
        src={`/cars/${car.imageFile}`}
        alt={car.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.style.background = MTBANK_THEME.primaryDark;
            parent.innerHTML = `<div style="color:${MTBANK_THEME.textSecondary}; font-size:12px; text-align:center;">${car.name}<br/>Lv.${level}</div>`;
          }
        }}
      />
    </div>
  );
}