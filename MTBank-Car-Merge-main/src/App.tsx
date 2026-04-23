import { useGame } from './game/useGame';
import GameGrid from './game/GameGrid';
import SidePanel from './game/SidePanel';
import { MTBANK_THEME } from './game/types';

export default function App() {
  const { state, selected, messages, handleSpawn, handleCellClick, handleReset, handleStateChange } = useGame();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MTBANK_THEME.bgGradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: '24px 16px',
      }}
    >
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            letterSpacing: '0.12em',
            color: MTBANK_THEME.textPrimary,
            margin: 0,
            textShadow: `0 0 40px ${MTBANK_THEME.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <svg viewBox="0 0 32 32" width="48" height="48">
            <circle cx="16" cy="16" r="16" fill="#0021F3"/>
            <path d="M7 21V11h3l3 5.5 3-5.5h3v10h-3V16l-2.2 4.5h-1.6L13 16v5H7z" fill="white"/>
            <path d="M22 11h3v10h-3V11z" fill="#F84B36"/>
          </svg>
          MTBANK RACING
        </h1>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.22em',
            color: MTBANK_THEME.textSecondary,
            marginTop: 8,
          }}
        >
          MERGE • UPGRADE • COLLECT
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <GameGrid grid={state.grid} selected={selected} onCellClick={handleCellClick} />
        <SidePanel 
          state={state} 
          messages={messages} 
          onSpawn={handleSpawn} 
          onReset={handleReset}
          onStateChange={handleStateChange}
        />
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: MTBANK_THEME.textSecondary, opacity: 0.5 }}>
        ⚡ Merge cars to unlock new models • Buy exclusive cars in SHOP
      </div>
    </div>
  );
}