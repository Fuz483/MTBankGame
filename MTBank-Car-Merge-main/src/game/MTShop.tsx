import React from 'react';
import { CAR_PROPERTIES, MTBANK_THEME } from './types';
import CarDisplay from './CarDisplay';
import { purchaseCar } from './logic';
import type { GameState } from './types';

interface MTShopProps {
  state: GameState;
  onPurchase: (newState: GameState) => void;
  onClose: () => void;
}

export default function MTShop({ state, onPurchase, onClose }: MTShopProps) {
  const handlePurchase = (level: number) => {
    const result = purchaseCar(state, level);
    if (result.success) {
      onPurchase(result.state);
    } else {
      alert('Not enough MTCoins or already owned!');
    }
  };
  
  const unlockedCars = state.unlockedCars;
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#64b5f6';
      case 'rare': return '#7e57c2';
      case 'epic': return '#ffd54f';
      default: return MTBANK_THEME.accent;
    }
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 500,
          maxHeight: '80vh',
          background: `linear-gradient(180deg, ${MTBANK_THEME.primary} 0%, ${MTBANK_THEME.primaryDark} 100%)`,
          border: `2px solid ${MTBANK_THEME.gold}`,
          borderRadius: 24,
          padding: 20,
          overflow: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ color: MTBANK_THEME.gold, margin: 0, fontSize: 24 }}>🏪 MTBANK SHOP</h2>
            <div style={{ color: MTBANK_THEME.textSecondary, fontSize: 14 }}>
              Your MTCoins: <span style={{ color: MTBANK_THEME.gold, fontWeight: 700 }}>{state.mtCoins}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: MTBANK_THEME.textPrimary,
              fontSize: 28,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(CAR_PROPERTIES).map(([levelStr, props]) => {
            const level = parseInt(levelStr);
            const isUnlocked = unlockedCars.includes(level);
            const canAfford = state.mtCoins >= props.price;
            const rarityColor = getRarityColor(props.rarity);
            
            if (props.price === 0) return null;
            
            return (
              <div
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 12,
                  background: isUnlocked ? 'rgba(100,181,246,0.1)' : 'rgba(0,0,0,0.4)',
                  border: `2px solid ${isUnlocked ? rarityColor : MTBANK_THEME.cardBorder}`,
                  borderRadius: 16,
                  opacity: isUnlocked ? 0.7 : 1,
                }}
              >
                <div style={{ width: 80 }}>
                  <CarDisplay level={level} size={70} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: MTBANK_THEME.textPrimary }}>
                    {props.name}
                  </span>
                  <div style={{ fontSize: 12, color: MTBANK_THEME.textSecondary }}>Level {level}</div>
                </div>
                
                {!isUnlocked && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: MTBANK_THEME.gold }}>💰 {props.price}</div>
                    <button
                      onClick={() => handlePurchase(level)}
                      disabled={!canAfford}
                      style={{
                        marginTop: 6,
                        padding: '6px 20px',
                        background: canAfford ? `linear-gradient(135deg, ${MTBANK_THEME.gold}, #ffb300)` : '#555',
                        border: 'none',
                        borderRadius: 20,
                        color: canAfford ? MTBANK_THEME.primaryDark : '#888',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                    >
                      BUY
                    </button>
                  </div>
                )}
                
                {isUnlocked && (
                  <div style={{ color: rarityColor, fontSize: 14, fontWeight: 600 }}>✓ OWNED</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}