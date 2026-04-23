import { Flag, Users, GitMerge, Car, Wifi } from 'lucide-react';
import { useApp, getCarCoefficient } from '../../context/AppContext';

const CAR_NAMES: Record<number, string> = {
  1: 'MTBank', 2: 'GORIOT', 3: 'Quantum Grip', 4: 'Kinexus Drive', 5: 'Speed',
  6: 'Flow', 7: 'Racing', 8: 'Apex', 9: 'Velocity', 10: 'Cosmic',
  11: 'Rust', 12: 'Motora', 13: 'Flame', 14: 'Dinoco', 15: 'Ignitr Green',
  16: 'Ignitr Gold', 17: 'Ultimate',
};

export default function GameWidget({ onOpenOnline }: { onOpenOnline: () => void }) {
  const { mtCoins, attempts, ownedCars, selectedCar, openGame, mergeCarsAction, inviteFriend, openCarSelect } = useApp();
  const uniqueCount = new Set(ownedCars).size;
  const coef = getCarCoefficient(selectedCar);

  return (
    <div
      className="rounded-3xl p-6 mb-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #010615 0%, #071D49 50%, #010615 100%)' }}
    >
      {/* Decorative stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0021F3] to-[#F84B36]" />
      <div className="absolute inset-0 opacity-[0.03]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${15 + i * 15}%` }} />
        ))}
      </div>

      <div className="relative">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <div className="text-[#0021F3] text-[10px] font-black tracking-widest uppercase mb-1">МТБанк · Exclusive</div>
            <div className="text-white font-black text-2xl sm:text-3xl leading-tight">FORMULA 1<br />ULTIMATE RACING</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-[#F84B36]" />
              {mtCoins.toLocaleString()} MTcoin
            </div>
          </div>
        </div>

        {/* Selected car preview */}
        <div className="flex items-center gap-3 bg-[#0021F3]/10 border border-[#0021F3]/30 rounded-2xl px-4 py-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0021F3, #F84B36)' }}>
            <Car size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">#{selectedCar} {CAR_NAMES[selectedCar] ?? 'Болид'}</div>
            <div className="text-white/40 text-xs">Коэффициент наград: x{coef.toFixed(2)}</div>
          </div>
          <button
            onClick={openCarSelect}
            className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-xl transition-colors font-medium"
          >
            Сменить
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={openGame}
            disabled={attempts === 0}
            className={`flex items-center gap-2 font-black text-white px-8 py-3 rounded-2xl text-base transition-all duration-200 ${
              attempts > 0
                ? 'hover:scale-105 active:scale-95 shadow-lg'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={attempts > 0 ? { background: 'linear-gradient(135deg, #0021F3, #F84B36)' } : { background: '#333' }}
          >
            <Flag size={18} />
            ГОНКА
          </button>
          <button
            onClick={onOpenOnline}
            disabled={attempts === 0}
            className={`flex items-center gap-2 font-semibold text-white px-5 py-3 rounded-2xl text-sm transition-all duration-200 border ${
              attempts > 0
                ? 'border-[#0021F3]/50 hover:border-[#0021F3] hover:bg-[#0021F3]/20'
                : 'border-white/10 opacity-40 cursor-not-allowed'
            }`}
          >
            <Wifi size={16} />
            ОНЛАЙН
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-white/40 text-xs mb-1">Попытки</div>
            <div className="text-white font-black text-xl">{attempts}<span className="text-white/20">/5</span></div>
            <div className="flex justify-center gap-0.5 mt-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < attempts ? 'bg-[#0021F3]' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-white/40 text-xs mb-1">Гараж</div>
            <div className="text-white font-black text-xl">{ownedCars.length}</div>
            <div className="text-white/30 text-xs">болидов</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <div className="text-white/40 text-xs mb-1">Уникальных</div>
            <div className="text-white font-black text-xl">{uniqueCount}</div>
            <div className="text-white/30 text-xs">моделей</div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={mergeCarsAction}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#0021F3]/50 hover:bg-[#0021F3]/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <GitMerge size={14} /> Объединить болиды
          </button>
          <button
            onClick={inviteFriend}
            className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#F84B36]/50 hover:bg-[#F84B36]/10 text-white/70 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <Users size={14} /> Пригласить друга +100
          </button>
        </div>
      </div>
    </div>
  );
}
