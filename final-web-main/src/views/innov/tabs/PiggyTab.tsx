import { useState } from 'react';
import { Target, Plus, Minus, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const GOAL_AMOUNT_DEFAULT = 2500;

export default function PiggyTab() {
  const { showToast } = useApp();
  const [balance, setBalance] = useState(0);
  const [goalName, setGoalName] = useState('Новый MacBook Pro');
  const [goalAmount, setGoalAmount] = useState(GOAL_AMOUNT_DEFAULT);
  const [editGoal, setEditGoal] = useState(false);
  const [tmpGoalName, setTmpGoalName] = useState(goalName);
  const [tmpGoalAmt, setTmpGoalAmt] = useState(String(goalAmount));
  const [customAmt, setCustomAmt] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const percent = Math.min(100, Math.round((balance / goalAmount) * 100));
  const deposits = Math.floor(balance / 25);
  const interest = (balance * 0.03).toFixed(2);

  function add(amount: number) {
    const newBal = balance + amount;
    setBalance(newBal);
    showToast(`+${amount} BYN добавлено`);
    if (newBal >= goalAmount) showToast(`Цель «${goalName}» достигнута! Бонус +5% от банка`);
  }

  function saveGoal() {
    setGoalName(tmpGoalName || goalName);
    const n = parseInt(tmpGoalAmt);
    if (n > 0) setGoalAmount(n);
    setEditGoal(false);
    showToast('Цель обновлена');
  }

  function withdraw() {
    if (balance === 0) { showToast('Копилка пуста'); return; }
    const penalty = (balance * 0.08).toFixed(2);
    showToast(`Снято ${balance.toFixed(2)} BYN. Комиссия 8%: -${penalty} BYN`);
    setBalance(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={18} className="text-[#0021F3]" />
        <h2 className="font-bold text-white text-lg">Интернет-копилка</h2>
      </div>

      {/* Goal card */}
      <div className="bg-gradient-to-br from-[#0a2b4e] to-[#0021F3] rounded-3xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-white/70 text-sm mb-1">Цель накопления</div>
            {editGoal ? (
              <div className="flex flex-col gap-2">
                <input value={tmpGoalName} onChange={e => setTmpGoalName(e.target.value)} className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm w-48" />
                <input value={tmpGoalAmt} onChange={e => setTmpGoalAmt(e.target.value)} type="number" className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white text-sm w-32" placeholder="Сумма BYN" />
                <div className="flex gap-2">
                  <button onClick={saveGoal} className="bg-white text-[#0021F3] font-semibold px-4 py-1 rounded-xl text-sm">Сохранить</button>
                  <button onClick={() => setEditGoal(false)} className="text-white/60 text-sm">Отмена</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setEditGoal(true); setTmpGoalName(goalName); setTmpGoalAmt(String(goalAmount)); }} className="font-bold text-xl hover:opacity-80 transition-opacity text-left">
                {goalName} ✏️
              </button>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">{balance.toFixed(0)} <span className="text-lg font-normal">BYN</span></div>
            <div className="text-white/60 text-sm">из {goalAmount} BYN</div>
          </div>
        </div>

        <div className="bg-white/20 rounded-full h-3 mb-2">
          <div
            className="bg-[#f5a623] h-3 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span>{percent}% накоплено</span>
          <span>Осталось {Math.max(0, goalAmount - balance).toFixed(0)} BYN</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-xs text-white/40 mb-1">Доходность</div>
          <div className="font-bold text-emerald-400">3% / мес</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-xs text-white/40 mb-1">Начислено %</div>
          <div className="font-bold text-[#0021F3]">{interest} BYN</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-xs text-white/40 mb-1">Пополнений</div>
          <div className="font-bold text-white">{deposits}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 text-white font-semibold">
          <TrendingUp size={16} />
          <span>Пополнение</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-3">
          {[25, 50, 100, 200].map(a => (
            <button key={a} onClick={() => add(a)} className="flex items-center gap-1 bg-[#0021F3]/10 text-[#0021F3] font-semibold px-4 py-2 rounded-xl hover:bg-[#0021F3]/20 transition-colors text-sm">
              <Plus size={14} /> {a} BYN
            </button>
          ))}
          <button onClick={() => setShowCustom(!showCustom)} className="flex items-center gap-1 border border-white/10 text-white/60 font-semibold px-4 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm">
            Другая сумма
          </button>
        </div>
        {showCustom && (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={customAmt}
              onChange={e => setCustomAmt(e.target.value)}
              placeholder="Введите сумму BYN"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#0021F3] rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={() => { const v = parseFloat(customAmt); if (v > 0) { add(v); setCustomAmt(''); setShowCustom(false); } else showToast('Введите корректную сумму'); }}
              className="bg-[#0021F3] text-white font-semibold px-4 py-2 rounded-xl text-sm"
            >
              Добавить
            </button>
          </div>
        )}
        <button onClick={withdraw} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
          <Minus size={14} /> Досрочное снятие (комиссия 8%)
        </button>
      </div>
    </div>
  );
}
