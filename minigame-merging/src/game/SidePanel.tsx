import React from 'react';
import { canSpawn } from './logic';
import { getLevelProgress } from './logic';
import type { GameState } from './types';
import type { GameMessage } from './useGame';

interface SidePanelProps {
  state: GameState;
  messages: GameMessage[];
  onSpawn: () => void;
  onReset: () => void;
}

function XPBar({ current, needed }: { current: number; needed: number }) {
  const pct = Math.min(1, needed > 0 ? current / needed : 0);
  return (
    <div
      style={{
        position: 'relative',
        height: 28,
        background: '#0d0f18',
        borderRadius: 14,
        border: '2px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${pct * 100}%`,
          background: 'linear-gradient(90deg, #c85090 0%, #e070b0 100%)',
          borderRadius: 14,
          transition: 'width 0.4s ease',
          boxShadow: '0 0 10px rgba(200,80,140,0.5)',
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
          color: '#fff',
          letterSpacing: '0.05em',
          textShadow: '0 1px 3px #000',
        }}
      >
        {current} / {needed} XP
      </div>
    </div>
  );
}

export default function SidePanel({ state, messages, onSpawn, onReset }: SidePanelProps) {
  const { level, current, needed } = getLevelProgress(state.experience);
  const ready = canSpawn(state.grid);

  return (
    <div
      className="flex flex-col gap-4"
      style={{
        width: 200,
        padding: 20,
        background: 'linear-gradient(180deg, #181c28 0%, #12141e 100%)',
        border: '2px solid rgba(55,60,80,0.8)',
        borderRadius: 16,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* top accent stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #c85090 0%, #e070b0 50%, #c85090 100%)',
        }}
      />

      {/* title */}
      <div style={{ textAlign: 'center', paddingTop: 4 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#fff',
            textShadow: '0 0 20px rgba(200,80,140,0.4)',
          }}
        >
          RACE GARAGE
        </div>
        <div style={{ fontSize: 11, color: 'rgba(200,210,230,0.5)', letterSpacing: '0.06em', marginTop: 2 }}>
          MERGE &amp; CONQUER
        </div>
      </div>

      {/* spawn button */}
      <button
        onClick={onSpawn}
        style={{
          padding: '12px 0',
          background: ready
            ? 'linear-gradient(135deg, #c85090 0%, #e070b0 100%)'
            : 'linear-gradient(135deg, #333 0%, #222 100%)',
          border: ready ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid #333',
          borderRadius: 10,
          color: ready ? '#fff' : '#555',
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: '0.1em',
          cursor: ready ? 'pointer' : 'not-allowed',
          boxShadow: ready ? '0 0 20px rgba(200,80,140,0.3), 0 3px 8px rgba(0,0,0,0.4)' : 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => ready && ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)')}
      >
        + NEW CAR
      </button>

      {/* status pill */}
      <div
        style={{
          textAlign: 'center',
          padding: '5px 10px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          background: ready ? 'rgba(50,180,100,0.12)' : 'rgba(180,60,60,0.12)',
          border: ready ? '1px solid rgba(50,180,100,0.4)' : '1px solid rgba(180,60,60,0.4)',
          color: ready ? '#44dd88' : '#ee5555',
        }}
      >
        {ready ? 'READY TO DEPLOY' : 'TRACK IS FULL'}
      </div>

      {/* profile level card */}
      <div
        style={{
          padding: '14px 12px 12px',
          background: 'rgba(13,15,24,0.7)',
          border: '1px solid rgba(88,95,115,0.5)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#c8a046',
              letterSpacing: '0.06em',
              textShadow: '0 0 16px rgba(200,160,70,0.5)',
            }}
          >
            LEVEL {level}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(200,210,230,0.4)', letterSpacing: '0.06em' }}>
            PROFILE
          </div>
        </div>
        <XPBar current={current} needed={needed} />
        <div style={{ fontSize: 10, color: 'rgba(200,210,230,0.4)', textAlign: 'center', marginTop: 5 }}>
          next level: {needed} XP
        </div>
      </div>

      {/* total XP */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(200,210,230,0.55)',
          letterSpacing: '0.04em',
        }}
      >
        Total XP: <span style={{ color: '#c8a046', fontWeight: 700 }}>{state.experience.toLocaleString()}</span>
      </div>

      {/* instructions */}
      <div
        style={{
          padding: '12px 10px',
          background: 'rgba(13,15,24,0.5)',
          border: '1px solid rgba(88,95,115,0.3)',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
        }}
      >
        {[
          ['L-CLICK', 'Select & Merge'],
          ['R-CLICK', 'Sell for XP'],
          ['XP/LVL', '+10 per level'],
        ].map(([key, desc]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'rgba(200,80,140,0.8)',
                background: 'rgba(200,80,140,0.1)',
                border: '1px solid rgba(200,80,140,0.25)',
                borderRadius: 4,
                padding: '1px 5px',
              }}
            >
              {key}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(200,210,230,0.55)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* reset button */}
      <button
        onClick={onReset}
        style={{
          padding: '7px 0',
          background: 'transparent',
          border: '1px solid rgba(180,60,60,0.3)',
          borderRadius: 8,
          color: 'rgba(180,60,60,0.6)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = 'rgba(180,60,60,0.7)';
          el.style.color = '#ee5555';
          el.style.background = 'rgba(180,60,60,0.08)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = 'rgba(180,60,60,0.3)';
          el.style.color = 'rgba(180,60,60,0.6)';
          el.style.background = 'transparent';
        }}
      >
        RESET GAME
      </button>

      {/* floating toast messages */}
      <div
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              padding: '10px 28px',
              background: '#0d0f18',
              border: '2px solid rgba(200,80,140,0.7)',
              borderRadius: 24,
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textShadow: '0 0 12px rgba(200,80,140,0.8)',
              boxShadow: '0 0 24px rgba(200,80,140,0.3)',
              animation: 'fadeUp 2s ease forwards',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
