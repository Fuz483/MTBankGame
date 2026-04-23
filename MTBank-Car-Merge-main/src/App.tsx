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
          }}
        >
          🏦 MTBANK RACING
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