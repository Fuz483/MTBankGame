import { useEffect, useRef, useState } from 'react';
import { X, Users, Wifi } from 'lucide-react';
import { useApp, calcCoinsForPlace } from '../context/AppContext';

const WS_URL = import.meta.env.VITE_RACE_SERVER_URL ?? 'ws://localhost:8080';

interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  carId: number;
  x: number;
  progress: number;
  speed: number;
  finished: boolean;
  place: number | null;
}

interface GS {
  playerX: number;
  progress: number;
  speed: number;
  keys: Record<string, boolean>;
  animId: number;
  active: boolean;
}

function drawGame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  gs: GS,
  players: PlayerState[],
  bots: PlayerState[],
  myId: string,
  myCarId: number,
) {
  ctx.fillStyle = '#010615';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#0a0f1e';
  ctx.fillRect(w * 0.1, 0, w * 0.8, h);
  ctx.fillStyle = '#0021F3';
  ctx.fillRect(w * 0.1, 0, 3, h);
  ctx.fillRect(w * 0.9 - 3, 0, 3, h);

  ctx.fillStyle = '#ffffff10';
  for (let i = 0; i < 8; i++) {
    const y = (gs.progress * 600 + i * 70) % h;
    ctx.fillRect(w * 0.5 - 2, y, 4, 40);
  }

  const colors = ['#F84B36', '#0021F3', '#00d4aa', '#ffb800', '#8b5cf6', '#06b6d4', '#ec4899'];

  const others = [...players.filter(p => p.id !== myId), ...bots];
  others.forEach((p, i) => {
    const relProg = p.progress - gs.progress;
    const y = relProg * 520 + h * 0.65;
    if (y < -40 || y > h + 30) return;
    const cx = w * p.x;
    const col = colors[i % colors.length];
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(cx - 16, y - 28, 32, 52, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(cx - 9, y - 20, 18, 12);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(p.isBot ? 'BOT' : p.name?.slice(0, 4) ?? '?', cx, y + 6);
  });

  // Player car
  const py = h * 0.72;
  const pcx = w * gs.playerX;
  ctx.fillStyle = '#F84B36';
  ctx.beginPath();
  ctx.roundRect(pcx - 16, py - 28, 32, 52, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(pcx - 9, py - 20, 18, 12);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`#${myCarId}`, pcx, py + 6);

  // HUD
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(1,6,21,0.8)';
  ctx.beginPath();
  ctx.roundRect(12, 12, 150, 55, 10);
  ctx.fill();
  ctx.fillStyle = '#0021F3';
  ctx.fillRect(16, 50, Math.round(142 * Math.min(gs.progress, 1)), 7);
  ctx.strokeStyle = '#ffffff22';
  ctx.strokeRect(16, 50, 142, 7);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 13px Inter';
  ctx.fillText(`${Math.floor(gs.speed)} km/h`, 20, 38);
  ctx.fillStyle = '#ffffff60';
  ctx.font = '11px Inter';
  ctx.fillText(`${Math.floor(Math.min(gs.progress, 1) * 100)}%`, 20, 62);
}

export default function OnlineGameModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { selectedCar, profile, decrementAttempts, saveRaceResult, showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const gsRef = useRef<GS>({ playerX: 0.5, progress: 0, speed: 0, keys: {}, animId: 0, active: false });
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'countdown' | 'racing' | 'finished'>('connecting');
  const [countdown, setCountdown] = useState(3);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [bots, setBots] = useState<PlayerState[]>([]);
  const [myId, setMyId] = useState('');
  const [result, setResult] = useState<{ place: number; coins: number } | null>(null);

  const cbRef = useRef({ decrementAttempts, saveRaceResult, showToast, selectedCar, profile });
  cbRef.current = { decrementAttempts, saveRaceResult, showToast, selectedCar, profile };

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { gsRef.current.keys[e.key] = true; };
    const onUp = (e: KeyboardEvent) => { delete gsRef.current.keys[e.key]; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  useEffect(() => {
    if (!open) {
      gsRef.current.active = false;
      cancelAnimationFrame(gsRef.current.animId);
      wsRef.current?.close();
      return;
    }

    setStatus('connecting');
    setResult(null);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        carId: cbRef.current.selectedCar,
        username: cbRef.current.profile?.username ?? 'Player',
      }));
    };

    ws.onerror = () => {
      showToast('Нет соединения с сервером');
      onClose();
    };

    ws.onmessage = (e) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(e.data); } catch { return; }

      switch (msg.type) {
        case 'connected':
          setMyId(msg.playerId as string);
          break;
        case 'room_joined':
          setStatus('waiting');
          setPlayers(Object.values(msg.players as Record<string, PlayerState>));
          setBots((msg.bots as PlayerState[]) ?? []);
          break;
        case 'player_joined':
          setPlayers(prev => [...prev.filter(p => p.id !== (msg.playerId as string)),
            { id: msg.playerId as string, name: msg.username as string, isBot: false, carId: msg.carId as number, x: 0.5, progress: 0, speed: 0, finished: false, place: null }]);
          break;
        case 'player_left':
          setPlayers(prev => prev.filter(p => p.id !== msg.playerId));
          break;
        case 'race_start': {
          setBots((msg.bots as PlayerState[]) ?? []);
          setStatus('countdown');
          let c = (msg.countdown as number) ?? 3;
          setCountdown(c);
          const timer = setInterval(() => {
            c--;
            setCountdown(c);
            if (c <= 0) {
              clearInterval(timer);
              setStatus('racing');
              startGameLoop();
            }
          }, 1000);
          break;
        }
        case 'tick':
          setPlayers(Object.values(msg.players as Record<string, PlayerState>));
          setBots((msg.bots as PlayerState[]) ?? []);
          break;
        case 'finished': {
          const place = msg.place as number;
          const coins = msg.coinsEarned as number;
          setResult({ place, coins });
          setStatus('finished');
          gsRef.current.active = false;
          cbRef.current.decrementAttempts();
          cbRef.current.saveRaceResult(place, coins);
          cbRef.current.showToast(`Финиш! ${place} место! +${coins} MTcoin`);
          break;
        }
      }
    };

    return () => { ws.close(); };
  }, [open]);

  const startGameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth || 860;
    canvas.height = 440;
    const ctx = canvas.getContext('2d')!;
    const gs = gsRef.current;
    gs.active = true;
    gs.playerX = 0.5;
    gs.progress = 0;
    gs.speed = 0;

    const loop = () => {
      if (!gs.active) return;
      if (gs.keys['ArrowLeft'] || gs.keys['a']) gs.playerX -= 0.02;
      if (gs.keys['ArrowRight'] || gs.keys['d']) gs.playerX += 0.02;
      gs.playerX = Math.min(Math.max(gs.playerX, 0.12), 0.88);
      gs.speed += 2.5; if (gs.speed > 270) gs.speed = 270;
      gs.progress += gs.speed * 0.0038;
      if (gs.progress > 1) gs.progress = 1;

      wsRef.current?.send(JSON.stringify({
        type: 'update',
        x: gs.playerX,
        progress: gs.progress,
        speed: gs.speed / 270,
      }));

      setPlayers(p => p);
      setBots(b => b);
      drawGame(ctx, canvas.width, canvas.height, gs,
        players, bots, myId, cbRef.current.selectedCar);
      gs.animId = requestAnimationFrame(loop);
    };
    gs.animId = requestAnimationFrame(loop);
  };

  const handleClose = () => {
    gsRef.current.active = false;
    cancelAnimationFrame(gsRef.current.animId);
    wsRef.current?.close();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fadein">
      <div className="bg-[#010615] rounded-3xl w-[920px] max-w-[95vw] p-5 border border-[#0021F3]/40 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Wifi size={18} className="text-[#0021F3]" />
            <div>
              <div className="text-white font-black text-base">ОНЛАЙН ГОНКА</div>
              <div className="text-white/40 text-xs">
                {status === 'waiting' && `Ожидание игроков (${players.length}/8)...`}
                {status === 'countdown' && `Старт через ${countdown}...`}
                {status === 'racing' && 'Гонка идёт'}
                {status === 'finished' && 'Гонка завершена'}
                {status === 'connecting' && 'Подключение...'}
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/40 hover:text-white p-1"><X size={18} /></button>
        </div>

        {(status === 'connecting' || status === 'waiting') && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-10 h-10 border-2 border-[#0021F3] border-t-transparent rounded-full animate-spin" />
            <div className="text-white/60 text-sm">
              {status === 'connecting' ? 'Подключаемся к серверу...' : 'Ожидаем других игроков...'}
            </div>
            {status === 'waiting' && (
              <div className="flex gap-2 flex-wrap justify-center">
                {players.map(p => (
                  <span key={p.id} className="text-xs bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded-full">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
            {status === 'waiting' && players.length >= 2 && (
              <button
                onClick={() => wsRef.current?.send(JSON.stringify({ type: 'ready' }))}
                className="bg-[#0021F3] text-white font-bold px-8 py-2.5 rounded-full hover:bg-blue-700 transition-colors text-sm"
              >
                Начать с ботами
              </button>
            )}
          </div>
        )}

        {status === 'countdown' && (
          <div className="flex items-center justify-center py-12">
            <div className="text-white font-black text-8xl" style={{ color: countdown === 0 ? '#00d4aa' : '#F84B36' }}>
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </div>
        )}

        {(status === 'racing' || status === 'finished') && (
          <>
            <canvas ref={canvasRef} className="w-full rounded-2xl block border border-white/5" style={{ height: 440 }} />
            {result && (
              <div className="mt-3 bg-[#0021F3]/10 border border-[#0021F3]/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-black text-xl">{result.place} место!</div>
                  <div className="text-white/60 text-sm">+{result.coins} MTcoin</div>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-white/40" />
                  <span className="text-white/40 text-sm">{players.length + bots.length} участников</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between items-center mt-3">
          <span className="text-white/30 text-sm">Стрелки ← → для управления</span>
          <button onClick={handleClose} className="bg-[#F84B36] text-white font-bold px-5 py-2 rounded-full hover:bg-red-600 transition-colors text-sm">
            {status === 'finished' ? 'Закрыть' : 'Выйти из гонки'}
          </button>
        </div>
      </div>
    </div>
  );
}
