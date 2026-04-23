import { useGame } from './game/useGame';
import GameGrid from './game/GameGrid';
import SidePanel from './game/SidePanel';

export default function App() {
  const { state, selected, messages, handleSpawn, handleCellClick, handleReset } = useGame();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0e1018 0%, #111420 50%, #0a0c14 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: '24px 16px',
      }}
    >
      {/* header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '0.18em',
            color: '#fff',
            margin: 0,
            textShadow: '0 0 40px rgba(200,80,140,0.5)',
            lineHeight: 1,
          }}
        >
          CAR MERGE RACING
        </h1>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.22em',
            color: 'rgba(200,210,230,0.4)',
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          COMBINE &bull; UPGRADE &bull; DOMINATE
        </div>
        <div
          style={{
            margin: '12px auto 0',
            width: 200,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #c85090, transparent)',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <GameGrid grid={state.grid} selected={selected} onCellClick={handleCellClick} />
        <SidePanel state={state} messages={messages} onSpawn={handleSpawn} onReset={handleReset} />
      </div>

      <div
        style={{
          marginTop: 20,
          fontSize: 11,
          color: 'rgba(200,210,230,0.2)',
          letterSpacing: '0.08em',
        }}
      >
        Progress auto-saved &bull; Right-click to sell
      </div>

      <style>{`
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(12px); }
          15%  { opacity: 1; transform: translateY(0); }
          75%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
