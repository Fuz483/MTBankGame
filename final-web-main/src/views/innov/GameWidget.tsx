import { Flag, Users, GitMerge } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function GameWidget() {
  const { mtCoins, attempts, uniqueCars, ownedCars, openGame, mergeCars, inviteFriend } = useApp();

  return (
    <div className="bg-gradient-to-br from-[#0c2a44] to-[#0a1e30] rounded-3xl p-6 mb-6 relative overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-[#f5a623]" style={{ top: `${12 + i * 12}%` }} />
        ))}
      </div>

      <div className="relative">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <div className="text-[#f5a623] text-xs font-bold tracking-widest uppercase mb-1">МТБанк · Exclusive</div>
            <div className="text-white font-black text-2xl sm:text-3xl leading-tight">FORMULA 1<br />ULTIMATE RACING</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-[#f5a623] px-4 py-2 rounded-full font-bold text-sm">
              🪙 {mtCoins.toLocaleString()} MTcoin
            </div>
            <div className="text-white/50 text-xs">Зарабатывайте монеты на гонках</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={openGame}
            disabled={attempts === 0}
            className={`flex items-center gap-2 font-black text-[#0a2b4e] px-8 py-3 rounded-2xl text-lg transition-all duration-200 ${
              attempts > 0
                ? 'bg-[#f5a623] hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
            }`}
          >
            <Flag size={20} />
            НАЧАТЬ ГОНКУ
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-white/60 text-xs mb-1">Попытки</div>
            <div className="text-white font-bold text-xl">{attempts}<span className="text-white/40">/5</span></div>
            <div className="flex justify-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < attempts ? 'bg-[#f5a623]' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-white/60 text-xs mb-1">Гараж</div>
            <div className="text-white font-bold text-xl">{ownedCars.length}</div>
            <div className="text-white/40 text-xs">болидов</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center">
            <div className="text-white/60 text-xs mb-1">Уникальных</div>
            <div className="text-white font-bold text-xl">{uniqueCars}</div>
            <div className="text-white/40 text-xs">из 5</div>
          </div>
        </div>

        {ownedCars.length > 0 && (
          <div className="mb-4">
            <div className="text-white/50 text-xs mb-2">Ваши болиды:</div>
            <div className="flex gap-2 flex-wrap">
              {[...new Set(ownedCars)].map(car => (
                <span key={car} className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/10">
                  🏎 {car}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={mergeCars}
            className="flex items-center gap-2 border border-white/20 text-white/80 hover:border-white/40 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <GitMerge size={15} /> Объединить болиды
          </button>
          <button
            onClick={inviteFriend}
            className="flex items-center gap-2 border border-white/20 text-white/80 hover:border-white/40 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <Users size={15} /> Пригласить друга +100
          </button>
        </div>
      </div>
    </div>
  );
}

