import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const ALL_MODELS = ['F1-Scorpion', 'F1-Viper', 'F1-Thunder', 'F1-Nova', 'F1-Phantom'];

interface GS {
  active: boolean;
  playerX: number;
  aiCars: { x: number; prog: number; baseSpd: number }[];
  progress: number;
  speed: number;
  keys: Record<string, boolean>;
  animId: number;
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, gs: GS) {
  ctx.fillStyle = '#0c2a44'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#d4af37';
  for (let i = 0; i < 12; i++) {
    const y = (gs.progress * 450 + i * 55) % h;
    ctx.fillRect(0, y, w, 3);
  }
  ctx.fillStyle = '#2f3e5e'; ctx.fillRect(w * 0.12, 0, w * 0.76, h);
  for (const ai of gs.aiCars) {
    const y = (ai.prog - gs.progress) * 480 + h * 0.65;
    if (y > 0 && y < h - 30) {
      ctx.fillStyle = '#e67e22'; ctx.fillRect(w * (ai.x - 0.06), y - 14, w * 0.12, 28);
      ctx.fillStyle = '#000'; ctx.fillRect(w * (ai.x - 0.04), y - 6, w * 0.08, 12);
    }
  }
  const py = h * 0.72;
  ctx.fillStyle = '#f5a623'; ctx.fillRect(w * (gs.playerX - 0.06), py - 12, w * 0.12, 28);
  ctx.fillStyle = '#2c3e50'; ctx.fillRect(w * (gs.playerX - 0.04), py - 4, w * 0.08, 14);
  ctx.fillStyle = 'white'; ctx.font = 'bold 16px Inter';
  ctx.fillText(`${Math.floor(gs.speed)} km/h`, w - 100, 38);
  const pct = Math.floor(gs.progress * 100);
  ctx.fillText(`${pct}%`, 20, 38);
}

export default function GameModal() {
  const { gameModalOpen, closeGame, addCoins, decrementAttempts, addCar, showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gs = useRef<GS>({ active: false, playerX: 0.5, aiCars: [], progress: 0, speed: 0, keys: {}, animId: 0 });

  // callbacks via refs to avoid stale closures in rAF
  const cbRef = useRef({ addCoins, decrementAttempts, addCar, showToast, closeGame });
  cbRef.current = { addCoins, decrementAttempts, addCar, showToast, closeGame };

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
        aiCars: Array.from({ length: 4 }, (_, i) => ({
          x: 0.2 + Math.random() * 0.6,
          prog: 0.1 + i * 0.12,
          baseSpd: 120 + Math.random() * 70,
        })),
      };
      const loop = () => {
        const g = gs.current;
        if (!g.active) return;
        if (g.keys['ArrowLeft']) g.playerX -= 0.022;
        if (g.keys['ArrowRight']) g.playerX += 0.022;
        g.playerX = Math.min(Math.max(g.playerX, 0.12), 0.88);
        g.speed += 3.4; if (g.speed > 270) g.speed = 270;
        g.progress += g.speed * 0.0045;
        for (const ai of g.aiCars) {
          ai.prog += ai.baseSpd * 0.0042;
          if (ai.prog > g.progress + 0.25) ai.prog = g.progress - 0.1;
          if (Math.abs(ai.prog - g.progress) < 0.07 && Math.abs(ai.x - g.playerX) < 0.1 && ai.prog > g.progress) {
            g.speed *= 0.65;
            cbRef.current.showToast('Столкновение!');
          }
        }
        if (g.progress >= 1.0) {
          g.active = false;
          cbRef.current.decrementAttempts();
          let pos = 1;
          for (const ai of g.aiCars) if (ai.prog > g.progress) pos++;
          const earn = 80 + (5 - pos) * 15;
          const car = ALL_MODELS[Math.floor(Math.random() * ALL_MODELS.length)];
          cbRef.current.addCar(car);
          cbRef.current.addCoins(earn);
          cbRef.current.showToast(`Финиш! ${pos} место! +${earn} MTcoin · ${car}`);
          cbRef.current.closeGame();
          return;
        }
        drawFrame(ctx, canvas.width, canvas.height, g);
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
      <div className="bg-[#0c1a2b] rounded-3xl w-[960px] max-w-[95vw] p-5 border-2 border-[#f5a623] shadow-2xl">
        <div className="text-[#f5a623] font-bold text-lg mb-3 flex items-center gap-2">
          <span>FORMULA 1 · RACING</span>
          <span className="text-white/40 text-sm font-normal">· пройдите 100% трассы</span>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-2xl block" style={{ height: 480 }} />
        <div className="flex justify-between items-center mt-4 text-white">
          <span className="text-sm text-white/60">Управление: ← → стрелки | Избегайте оранжевых болидов</span>
          <button onClick={handleClose} className="bg-[#f5a623] text-[#0a2b4e] font-bold px-6 py-2 rounded-full hover:bg-amber-400 transition-colors">
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}
