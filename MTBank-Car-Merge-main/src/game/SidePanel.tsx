// SidePanel.tsx - ИСПРАВЛЕННЫЙ
import { canSpawn, getLevelProgress } from './logic';  // getLevelProgress теперь экспортируется
import { MTBANK_THEME, CAR_PROPERTIES } from './types';
import type { GameState } from './types';
import type { GameMessage } from './useGame';

interface SidePanelProps {
  state: GameState;
  messages: GameMessage[];
  onSpawn: () => void;
  onReset: () => void;
  onStateChange: (newState: GameState) => void;
}

function XPBar({ current, needed }: { current: number; needed: number }) {
  const pct = Math.min(1, needed > 0 ? current / needed : 0);
  return (
    <div
      style={{
        position: 'relative',
        height: 28,
        background: MTBANK_THEME.primaryDark,
        borderRadius: 14,
        border: `2px solid ${MTBANK_THEME.cardBorder}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${pct * 100}%`,
          background: `linear-gradient(90deg, ${MTBANK_THEME.primaryLight} 0%, ${MTBANK_THEME.accent} 100%)`,
          borderRadius: 14,
          transition: 'width 0.4s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: MTBANK_THEME.textPrimary,
        }}
      >
        {current} / {needed} XP
      </div>
    </div>
  );
}

export default function SidePanel({ state, messages, onSpawn, onReset, onStateChange: _onStateChange }: SidePanelProps) {
  const { level, current, needed } = getLevelProgress(state.experience);
  const ready = canSpawn(state.grid);

  const lockedCarsCount = Object.keys(CAR_PROPERTIES).filter(
    l => {
      const levelNum = parseInt(l);
      return CAR_PROPERTIES[levelNum].price > 0 && !state.unlockedCars.includes(levelNum);
    }
  ).length;

  return (
    <>
      <div
        style={{
          width: 260,
          padding: 20,
          background: `linear-gradient(180deg, ${MTBANK_THEME.primary} 0%, ${MTBANK_THEME.primaryDark} 100%)`,
          border: `2px solid ${MTBANK_THEME.cardBorder}`,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="16" fill="#0021F3"/>
            <path d="M7 21V11h3l3 5.5 3-5.5h3v10h-3V16l-2.2 4.5h-1.6L13 16v5H7z" fill="white"/>
            <path d="M22 11h3v10h-3V11z" fill="#F84B36"/>
          </svg>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: MTBANK_THEME.textPrimary }}>МТБанк</div>
            <div style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>MERGE &amp; UPGRADE</div>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '8px 12px',
            background: MTBANK_THEME.primaryDark,
            border: `1px solid #F84B36`,
            borderRadius: 30,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 800, color: '#F84B36' }}>{state.mtCoins}</span>
          <span style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>MTC</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onSpawn}
            style={{
              flex: 1,
              padding: '12px 0',
              background: ready ? `linear-gradient(135deg, ${MTBANK_THEME.primaryLight}, ${MTBANK_THEME.accent})` : '#333',
              border: 'none',
              borderRadius: 10,
              color: ready ? '#fff' : '#777',
              fontWeight: 700,
              cursor: ready ? 'pointer' : 'not-allowed',
            }}
          >
            НОВЫЙ БОЛИД
          </button>
        </div>

        {lockedCarsCount > 0 && (
          <div style={{ textAlign: 'center', fontSize: 10, color: '#F84B36' }}>
            {lockedCarsCount} cars locked
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            padding: 6,
            borderRadius: 20,
            fontSize: 11,
            background: ready ? 'rgba(100,181,246,0.15)' : 'rgba(255,100,100,0.15)',
            color: ready ? MTBANK_THEME.accent : '#ff8888',
          }}
        >
          {ready ? 'READY TO DEPLOY' : 'TRACK IS FULL'}
        </div>

        <div style={{ padding: 12, background: MTBANK_THEME.primaryDark, borderRadius: 12 }}>
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#F84B36' }}>
            LEVEL {level}
          </div>
          <XPBar current={current} needed={needed} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: MTBANK_THEME.textSecondary }}>
          Total XP: <span style={{ color: '#F84B36' }}>{state.experience}</span>
        </div>

        <div style={{ padding: 12, background: MTBANK_THEME.primaryDark, borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: MTBANK_THEME.accent }}>L-CLICK</span>
            <span style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>Select &amp; Merge</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: MTBANK_THEME.accent }}>R-CLICK</span>
            <span style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>Sell for XP + MT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: MTBANK_THEME.accent }}>MERGE</span>
            <span style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>Unlock new cars</span>
          </div>
        </div>

        <button
          onClick={onReset}
          style={{
            padding: 8,
            background: 'transparent',
            border: `1px solid ${MTBANK_THEME.cardBorder}`,
            borderRadius: 8,
            color: MTBANK_THEME.textSecondary,
            cursor: 'pointer',
          }}
        >
          RESET GAME
        </button>
      </div>

      <div style={{ position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              padding: '10px 28px',
              background: MTBANK_THEME.primaryDark,
              border: `2px solid #F84B36`,
              borderRadius: 24,
              color: '#F84B36',
              fontWeight: 800,
              animation: 'fadeUp 2s ease forwards',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(12px); }
          15% { opacity: 1; transform: translateY(0); }
          75% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}
