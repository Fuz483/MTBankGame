import { useEffect, useRef } from 'react';
import { useApp, calcCoinsForPlace } from '../context/AppContext';

interface GS {
  active: boolean;
  playerX: number;
  aiCars: { x: number; prog: number; baseSpd: number }[];
  progress: number;
  speed: number;
  keys: Record<string, boolean>;
  animId: number;
}

const CAR_COLORS = [
  '#0021F3', '#F84B36', '#00d4aa', '#ffb800', '#8b5cf6',
  '#06b6d4', '#ec4899', '#10b981',
];

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, gs: GS, playerCarId: number) {
  // Sky / track background
  ctx.fillStyle = '#010615';
  ctx.fillRect(0, 0, w, h);

  // Road stripes
  ctx.fillStyle = '#1a1f2e';
  ctx.fillRect(w * 0.1, 0, w * 0.8, h);

  // Road edge lines
  ctx.fillStyle = '#0021F3';
  ctx.fillRect(w * 0.1, 0, 4, h);
  ctx.fillRect(w * 0.9 - 4, 0, 4, h);

  // Center dashes
  ctx.fillStyle = '#ffffff22';
  for (let i = 0; i < 8; i++) {
    const y = (gs.progress * 600 + i * 70) % h;
    ctx.fillRect(w * 0.5 - 2, y, 4, 40);
  }

  // AI cars
  for (let i = 0; i < gs.aiCars.length; i++) {
    const ai = gs.aiCars[i];
    const y = (ai.prog - gs.progress) * 520 + h * 0.65;
    if (y > -40 && y < h + 20) {
      const col = CAR_COLORS[(i + 1) % CAR_COLORS.length];
      ctx.fillStyle = col;
      const cx = w * ai.x;
      // Car body
      ctx.beginPath();
      ctx.roundRect(cx - 18, y - 30, 36, 58, 6);
      ctx.fill();
      // Windshield
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.roundRect(cx - 11, y - 22, 22, 16, 3);
      ctx.fill();
      // Wheels
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - 22, y - 20, 6, 10);
      ctx.fillRect(cx + 16, y - 20, 6, 10);
      ctx.fillRect(cx - 22, y + 16, 6, 10);
      ctx.fillRect(cx + 16, y + 16, 6, 10);
      // Number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, cx, y + 8);
    }
  }

  // Player car
  const py = h * 0.72;
  const pcx = w * gs.playerX;
  ctx.fillStyle = '#F84B36';
  ctx.beginPath();
  ctx.roundRect(pcx - 18, py - 30, 36, 58, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.roundRect(pcx - 11, py - 22, 22, 16, 3);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.fillRect(pcx - 22, py - 20, 6, 10);
  ctx.fillRect(pcx + 16, py - 20, 6, 10);
  ctx.fillRect(pcx - 22, py + 16, 6, 10);
  ctx.fillRect(pcx + 16, py + 16, 6, 10);
  ctx.fillStyle = 'white';
  ctx.font = `bold 11px Inter`;
  ctx.textAlign = 'center';
  ctx.fillText(`${playerCarId}`, pcx, py + 8);

  // HUD
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(1,6,21,0.7)';
  ctx.beginPath();
  ctx.roundRect(12, 12, 140, 52, 10);
  ctx.fill();

  ctx.fillStyle = '#0021F3';
  const pct = Math.min(gs.progress, 1);
  ctx.fillRect(16, 50, Math.round(132 * pct), 8);
  ctx.strokeStyle = '#ffffff22';
  ctx.strokeRect(16, 50, 132, 8);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 13px Inter';
  ctx.fillText(`${Math.floor(gs.speed)} km/h`, 20, 38);
  ctx.fillStyle = '#ffffff66';
  ctx.font = '11px Inter';
  ctx.fillText(`${Math.floor(pct * 100)}%`, 20, 62);
}

export default function GameModal() {
  const { gameModalOpen, closeGame, decrementAttempts, showToast, saveRaceResult, selectedCar } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gs = useRef<GS>({ active: false, playerX: 0.5, aiCars: [], progress: 0, speed: 0, keys: {}, animId: 0 });

  const cbRef = useRef({ decrementAttempts, showToast, closeGame, saveRaceResult, selectedCar });
  cbRef.current = { decrementAttempts, showToast, closeGame, saveRaceResult, selectedCar };

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (gs.current.active) gs.current.keys[e.key] = true; };
    const onUp = (e: KeyboardEvent) => { delete gs.current.keys[e.key]; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  useEffect(() => {
    if (!gameModalOpen) {
      gs.current.active = false;
      cancelAnimationFrame(gs.current.animId);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setTimeout(() => {
      canvas.width = canvas.clientWidth || 900;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;
      gs.current = {
        active: true, playerX: 0.5, progress: 0, speed: 0, keys: {},
        animId: 0,
        aiCars: Array.from({ length: 7 }, (_, i) => ({
          x: 0.15 + ((i % 4) * 0.22),
          prog: 0.05 + i * 0.08,
          baseSpd: 100 + Math.random() * 80,
        })),
      };
      const loop = () => {
        const g = gs.current;
        if (!g.active) return;
        if (g.keys['ArrowLeft'] || g.keys['a'] || g.keys['A']) g.playerX -= 0.02;
        if (g.keys['ArrowRight'] || g.keys['d'] || g.keys['D']) g.playerX += 0.02;
        g.playerX = Math.min(Math.max(g.playerX, 0.12), 0.88);
        g.speed += 2.8; if (g.speed > 280) g.speed = 280;
        g.progress += g.speed * 0.0042;
        for (const ai of g.aiCars) {
          ai.prog += ai.baseSpd * 0.0040;
          if (ai.prog > g.progress + 0.3) ai.prog = g.progress - 0.08;
          if (Math.abs(ai.prog - g.progress) < 0.06 && Math.abs(ai.x - g.playerX) < 0.09) {
            g.speed *= 0.6;
            cbRef.current.showToast('Столкновение!');
          }
        }
        if (g.progress >= 1.0) {
          g.active = false;
          cbRef.current.decrementAttempts();
          let pos = 1;
          for (const ai of g.aiCars) if (ai.prog > g.progress) pos++;
          const carId = cbRef.current.selectedCar;
          const earned = calcCoinsForPlace(pos, carId);
          cbRef.current.saveRaceResult(pos, earned);
          cbRef.current.showToast(`Финиш! ${pos} место! +${earned} MTcoin`);
          cbRef.current.closeGame();
          return;
        }
        drawFrame(ctx, canvas.width, canvas.height, g, cbRef.current.selectedCar);
        g.animId = requestAnimationFrame(loop);
      };
      gs.current.animId = requestAnimationFrame(loop);
    }, 60);
  }, [gameModalOpen]);

  const handleClose = () => {
    gs.current.active = false;
    cancelAnimationFrame(gs.current.animId);
    closeGame();
  };

  return (
    <div className={`fixed inset-0 bg-black/95 flex items-center justify-center z-50 transition-all duration-200 ${gameModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      <div className="bg-[#010615] rounded-3xl w-[960px] max-w-[95vw] p-5 border border-[#0021F3]/50 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <circle cx="16" cy="16" r="16" fill="#0021F3"/>
                <path d="M8 22V10h3.5l2.5 5 2.5-5H20v12h-3V16l-2 4h-2l-2-4v6H8z" fill="white"/>
                <path d="M22 10h3v12h-3V10z" fill="#F84B36"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-black text-base">FORMULA 1 · RACING</div>
              <div className="text-white/40 text-xs">Болид #{selectedCar} · пройдите 100% трассы</div>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-2xl block border border-white/5" style={{ height: 480 }} />
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-white/40">Управление: стрелки ← →</span>
          <button onClick={handleClose} className="bg-[#F84B36] text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-600 transition-colors text-sm">
            Завершить гонку
          </button>
        </div>
      </div>
    </div>
  );
}
