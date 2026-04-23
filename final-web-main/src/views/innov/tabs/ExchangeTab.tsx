import { useState } from 'react';
import { Gift, Dices, Trophy, X } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface RouletteType {
  id: string;
  name: string;
  cost: number;
  winChance: number;
  color: string;
  description: string;
  prizes: string[];
}

const ROULETTES: RouletteType[] = [
  {
    id: 'budget',
    name: 'Нищая рулетка',
    cost: 550,
    winChance: 75,
    color: '#0021F3',
    description: '550 монет · шанс выигрыша 75%',
    prizes: ['Купон -5% в продуктах', 'Кешбэк 2% на 1 мес.', 'Доставка бесплатно x2', 'Скидка 5% в кафе', '50 MTcoin'],
  },
  {
    id: 'mid',
    name: 'Средняя рулетка',
    cost: 500,
    winChance: 50,
    color: '#F84B36',
    description: '500 монет · шанс выигрыша 50%',
    prizes: ['Кешбэк 5% на спорт', 'Билет в кино', 'Скидка 10% в ресторанах', '250 MTcoin', 'Подписка 1 мес.'],
  },
  {
    id: 'premium',
    name: 'Дорогая рулетка',
    cost: 200,
    winChance: 2,
    color: '#f59e0b',
    description: '200 монет · шанс выигрыша 2%',
    prizes: ['iPhone 16', 'MacBook Pro', '5000 MTcoin', 'Сертификат 500 BYN', 'Кешбэк 15% навсегда'],
  },
];

const STRIP_ITEMS = ['🎁', '💰', '🎫', '🍕', '🚗', '✈️', '💳', '🏆', '🎮', '🛒', '💎', '🏅', '🎯', '🌟', '🎪', '🎲'];

interface RouletteModalProps {
  roulette: RouletteType;
  onClose: () => void;
  mtCoins: number;
  onSpin: (won: boolean, prize: string) => void;
}

function RouletteModal({ roulette, onClose, mtCoins, onSpin }: RouletteModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ won: boolean; prize: string } | null>(null);
  const [highlight, setHighlight] = useState(-1);
  const canAfford = mtCoins >= roulette.cost;

  const spin = () => {
    if (!canAfford || spinning) return;
    setSpinning(true);
    setResult(null);
    const won = Math.random() * 100 < roulette.winChance;
    const prize = won ? roulette.prizes[Math.floor(Math.random() * roulette.prizes.length)] : 'Не повезло...';
    let count = 0;
    const totalTicks = 18 + Math.floor(Math.random() * 10);
    let delay = 55;
    const tick = () => {
      setHighlight(h => (h + 1) % STRIP_ITEMS.length);
      count++;
      if (count < totalTicks) {
        delay = Math.min(delay * 1.13, 380);
        setTimeout(tick, delay);
      } else {
        setSpinning(false);
        setResult({ won, prize });
        onSpin(won, prize);
      }
    };
    setTimeout(tick, delay);
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 animate-fadein" onClick={onClose}>
      <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-white font-black text-xl">{roulette.name}</h3>
            <p className="text-white/40 text-sm mt-0.5">{roulette.description}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1"><X size={18} /></button>
        </div>

        {/* Strip */}
        <div className="relative mb-5 overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-14 rounded-xl border-2 z-10 pointer-events-none"
            style={{ borderColor: roulette.color, boxShadow: `0 0 16px ${roulette.color}50` }} />
          <div className="flex gap-2 justify-center py-2 bg-white/5 rounded-2xl border border-white/5">
            {STRIP_ITEMS.map((item, i) => (
              <div key={i} className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-xl transition-all duration-75 ${
                highlight === i ? 'bg-white/20 scale-110' : 'bg-white/5'
              }`}>{item}</div>
            ))}
          </div>
        </div>

        {result && (
          <div className={`rounded-2xl p-4 mb-4 text-center border ${result.won ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#F84B36]/10 border-[#F84B36]/30'}`}>
            <div className="text-3xl mb-1">{result.won ? '🎉' : '😢'}</div>
            <div className={`font-black text-lg ${result.won ? 'text-emerald-400' : 'text-[#F84B36]'}`}>
              {result.won ? 'Победа!' : 'Не повезло'}
            </div>
            {result.won && <div className="text-white/60 text-sm mt-1">{result.prize}</div>}
          </div>
        )}

        <button onClick={spin} disabled={!canAfford || spinning}
          className={`w-full font-black text-base py-3.5 rounded-2xl transition-all text-white ${canAfford && !spinning ? 'hover:scale-[1.02] active:scale-[0.98]' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
          style={canAfford && !spinning ? { background: `linear-gradient(135deg, ${roulette.color}, #0021F3)` } : {}}>
          {spinning ? 'Крутим...' : !canAfford ? `Нужно ${roulette.cost} MTcoin` : `Крутить за ${roulette.cost} MTcoin`}
        </button>
      </div>
    </div>
  );
}

export default function ExchangeTab() {
  const { mtCoins, addCoins, showToast } = useApp();
  const [openRoulette, setOpenRoulette] = useState<RouletteType | null>(null);

  const handleSpin = (won: boolean, prize: string) => {
    addCoins(-openRoulette!.cost);
    if (won) showToast(`Победа! ${prize}`);
    else showToast('Не повезло... Попробуйте ещё раз!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dices size={18} className="text-[#0021F3]" />
          <h2 className="text-white font-black text-lg">Рулетка бонусов</h2>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-full text-sm font-bold">
          <Trophy size={13} className="text-amber-400" />
          {mtCoins.toLocaleString()} MTcoin
        </div>
      </div>

      <p className="text-white/40 text-sm mb-5">
        Испытайте удачу! Крутите рулетку и выигрывайте ценные призы.
      </p>

      <div className="space-y-3">
        {ROULETTES.map(r => {
          const canAfford = mtCoins >= r.cost;
          return (
            <div key={r.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4"
              style={{ borderLeft: `3px solid ${r.color}` }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${r.color}15` }}>
                <Gift size={22} style={{ color: r.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-black text-sm">{r.name}</div>
                <div className="text-white/40 text-xs mt-0.5">{r.description}</div>
                <div className="flex gap-1 flex-wrap mt-2">
                  {r.prizes.slice(0, 3).map(p => (
                    <span key={p} className="text-[10px] bg-white/5 text-white/30 px-2 py-0.5 rounded-lg border border-white/5">{p}</span>
                  ))}
                  {r.prizes.length > 3 && <span className="text-[10px] text-white/20">+{r.prizes.length - 3} ещё</span>}
                </div>
              </div>
              <button onClick={() => setOpenRoulette(r)} disabled={!canAfford}
                className={`flex-shrink-0 font-black text-xs px-4 py-2.5 rounded-xl transition-all ${canAfford ? 'text-white hover:scale-105' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                style={canAfford ? { background: r.color } : {}}>
                {r.cost} MC
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-white/3 border border-white/5 rounded-2xl p-4">
        <div className="text-white/40 text-xs font-bold mb-2 uppercase tracking-wide">Шансы выигрыша</div>
        <div className="space-y-2">
          {ROULETTES.map(r => (
            <div key={r.id} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="text-white/50 text-xs flex-1">{r.name}</span>
              <span className="text-white/30 text-xs">{r.winChance}%</span>
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${r.winChance}%`, background: r.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {openRoulette && (
        <RouletteModal roulette={openRoulette} onClose={() => setOpenRoulette(null)} mtCoins={mtCoins} onSpin={(won, prize) => { handleSpin(won, prize); }} />
      )}
    </div>
  );
}
