import { canSpawn, getLevelProgress } from './logic';
import { MTBANK_THEME } from './types';
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

export default function SidePanel({ state, messages, onSpawn, onReset, onStateChange }: SidePanelProps) {
  const { level, current, needed } = getLevelProgress(state.experience);
  const ready = canSpawn(state.grid);

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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: MTBANK_THEME.textPrimary }}>MTBANK RACE</div>
          <div style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>MERGE & UPGRADE</div>
        </div>

        <button
          onClick={onSpawn}
          style={{
            width: '100%',
            padding: '14px 0',
            background: ready ? `linear-gradient(135deg, ${MTBANK_THEME.primaryLight}, ${MTBANK_THEME.accent})` : '#333',
            border: 'none',
            borderRadius: 10,
            color: ready ? '#fff' : '#777',
            fontWeight: 700,
            cursor: ready ? 'pointer' : 'not-allowed',
          }}
        >
          + NEW CAR
        </button>

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
          <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: MTBANK_THEME.gold }}>
            LEVEL {level}
          </div>
          <XPBar current={current} needed={needed} />
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: MTBANK_THEME.textSecondary }}>
          Total XP: <span style={{ color: MTBANK_THEME.gold }}>{state.experience}</span>
        </div>

        <div style={{ padding: 12, background: MTBANK_THEME.primaryDark, borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: MTBANK_THEME.accent }}>L-CLICK</span>
            <span style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>Select & Merge</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: MTBANK_THEME.accent }}>R-CLICK</span>
            <span style={{ fontSize: 10, color: MTBANK_THEME.textSecondary }}>Sell for XP</span>
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
              border: `2px solid ${MTBANK_THEME.gold}`,
              borderRadius: 24,
              color: MTBANK_THEME.gold,
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