import { useState } from 'react';
import { Flag, Users, GitMerge, Dices, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function GameWidget() {
  const { mtCoins, attempts, uniqueCars, ownedCars, activeCar, setActiveCar, openGame, mergeCars, inviteFriend, showToast, addCoins, addCar } = useApp();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteText, setRouletteText] = useState('🎰 ИСПЫТАЙ УДАЧУ 🎰');

  const handleOpenMerge = () => {
    window.open('http://localhost:3001', '_blank');
  };

  const handleRoulette = (type: string, cost: number, chance: number) => {
    if (isSpinning) return;
    if (mtCoins < cost) {
      showToast('Недостаточно MTcoin для ставки!');
      return;
    }

    addCoins(-cost);
    setIsSpinning(true);

    const roll = Math.random();
    const isWin = roll <= chance;

    let finalMsg = '';
    let winAction = () => {};
    let possibleOutcomes: string[] = [];

    if (type === 'poor') {
      possibleOutcomes = ['💰 1000 MTC 💰', '💀 ПРОИГРЫШ 💀', '💰 1000 MTC 💰', '💸 ПУСТО 💸'];
      if (isWin) { winAction = () => { addCoins(1000); showToast('🎉 ВЫИГРЫШ! +1000 MTcoin'); }; finalMsg = '💰 1000 MTC 💰'; }
    } else if (type === 'mid') {
      possibleOutcomes = ['🏎️ THUNDER 🏎️', '💀 ПРОИГРЫШ 💀', '🏎️ THUNDER 🏎️', '💸 ПУСТО 💸'];
      if (isWin) { winAction = () => { addCar('F1-Thunder'); addCoins(500); showToast('🔥 УСПЕХ! F1-Thunder + 500 MTcoin!'); }; finalMsg = '🏎️ THUNDER + 500 🏎️'; }
    } else {
      possibleOutcomes = ['💎 ДЖЕКПОТ 💎', '💀 ПРОИГРЫШ 💀', '💎 ДЖЕКПОТ 💎', '💸 ПУСТО 💸'];
      if (isWin) { winAction = () => { addCar('F1-Phantom'); addCoins(10000); showToast('💎 ДЖЕКПОТ! F1-Phantom + 10000 MTcoin!'); }; finalMsg = '💎 ДЖЕКПОТ 💎'; }
    }

    if (!isWin) {
      finalMsg = '💀 ПРОИГРЫШ 💀';
      winAction = () => showToast('😢 Увы, ставка не сыграла...');
    }

    let ticks = 0;
    const interval = setInterval(() => {
      setRouletteText(possibleOutcomes[Math.floor(Math.random() * possibleOutcomes.length)]);
      ticks++;
      if (ticks > 20) {
        clearInterval(interval);
        setRouletteText(finalMsg);
        setIsSpinning(false);
        winAction();
      }
    }, 100);
  };

  // Получаем только уникальные машины пользователя для отображения в гараже
  const uniqueOwnedCars = Array.from(new Set(ownedCars));

  return (
    <div className="bg-gradient-to-br from-[#0c2a44] to-[#0a1e30] rounded-3xl p-6 mb-6 relative overflow-hidden">
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
            disabled={attempts === 0 || isSpinning}
            className={`flex items-center gap-2 font-black text-[#0a2b4e] px-8 py-3 rounded-2xl text-lg transition-all duration-200 ${
              attempts > 0 && !isSpinning
                ? 'bg-[#f5a623] hover:bg-amber-400 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
            }`}
          >
            <Flag size={20} />
            НАЧАТЬ ГОНКУ <ExternalLink size={18} className="ml-1" />
          </button>
        </div>

        {/* ВАШ ГАРАЖ - ВЫБОР МАШИНЫ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <div className="text-white font-bold mb-3">Выберите болид для гонки:</div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {uniqueOwnedCars.map(car => (
              <button
                key={car}
                onClick={() => setActiveCar(car)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
                  activeCar === car
                    ? 'bg-[#f5a623] text-[#0a2b4e] shadow-[0_0_10px_rgba(245,166,35,0.5)] scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                🏎️ {car}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0f0c1b] border-2 border-yellow-500/50 rounded-2xl p-5 mb-5 relative overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.15)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-yellow-500/20 blur-2xl"></div>

          <div className="flex items-center justify-center gap-2 text-yellow-500 font-black text-xl uppercase tracking-widest mb-4">
            <Dices size={24} /> MT-CASINO ROYALE <Dices size={24} />
          </div>

          <div className="bg-black border-2 border-yellow-500/30 rounded-xl h-20 mb-5 flex items-center justify-center shadow-inner overflow-hidden relative">
            <div className={`text-3xl sm:text-4xl font-black tracking-widest text-center text-white ${isSpinning ? 'animate-pulse blur-[0.5px]' : ''}`}>
               {rouletteText}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button disabled={isSpinning} onClick={() => handleRoulette('poor', 550, 0.75)} className="bg-gradient-to-b from-gray-700 to-gray-900 border-2 border-gray-500 hover:border-gray-400 text-white p-3 rounded-xl transition flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="font-bold text-gray-200">Рулетка кэшбеков</span><span className="text-xs text-gray-400 mt-1">550 MTC · Шанс 75%</span>
            </button>
            <button disabled={isSpinning} onClick={() => handleRoulette('mid', 500, 0.50)} className="bg-gradient-to-b from-orange-600 to-orange-900 border-2 border-orange-500 hover:border-orange-400 text-white p-3 rounded-xl transition flex flex-col items-center shadow-[0_0_10px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="font-bold text-orange-100">Рулетка скидок</span><span className="text-xs text-orange-300 mt-1">500 MTC · Шанс 50%</span>
            </button>
            <button disabled={isSpinning} onClick={() => handleRoulette('rich', 200, 0.02)} className="bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-300 hover:border-white text-black p-3 rounded-xl transition flex flex-col items-center shadow-[0_0_15px_rgba(234,179,8,0.5)] disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="font-black text-yellow-900">Рулетка купонов</span><span className="text-xs text-yellow-900/80 font-bold mt-1">200 MTC · Шанс 2%</span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={handleOpenMerge} disabled={isSpinning} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/50 text-white hover:brightness-110 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50">
            <GitMerge size={15} /> ИГРА: CAR MERGE <ExternalLink size={14} />
          </button>
          <button onClick={mergeCars} disabled={isSpinning} className="flex items-center gap-2 border border-white/20 text-white/80 hover:border-white/40 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
            <GitMerge size={15} /> Авто-Мердж (гараж)
          </button>
          <button onClick={inviteFriend} disabled={isSpinning} className="flex items-center gap-2 border border-white/20 text-white/80 hover:border-white/40 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
            <Users size={15} /> Пригласить +100
          </button>
        </div>
      </div>
    </div>
  );
}