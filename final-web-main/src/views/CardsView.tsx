import { useState } from 'react';
import { CreditCard, Lock, Eye, EyeOff, Settings, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Card {
  name: string;
  number: string;
  expiry: string;
  balance: string;
  gradient: string;
  frozen: boolean;
}

export default function CardsView() {
  const { showToast } = useApp();
  const [cards, setCards] = useState<Card[]>([
    { name: 'ШОППЕР', number: '4*1803', expiry: '01/29', balance: '3.13', gradient: 'from-[#010615] to-[#071D49]', frozen: false },
    { name: 'VISA GOLD', number: '4*7834', expiry: '06/25', balance: '0.00', gradient: 'from-[#010615] to-[#071D49]', frozen: false },
  ]);
  const [showNum, setShowNum] = useState<Record<number, boolean>>({});

  function toggleFreeze(i: number) {
    setCards(prev => prev.map((c, j) => j === i ? { ...c, frozen: !c.frozen } : c));
    showToast(cards[i].frozen ? 'Карта разморожена' : 'Карта заблокирована');
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-white text-xl">Мои карты</h2>

      {cards.map((card, i) => (
        <div key={i} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
          {/* Card visual */}
          <div className={`bg-gradient-to-br ${card.gradient} p-5 text-white relative ${card.frozen ? 'opacity-70' : ''}`}>
            {card.frozen && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-none">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-white font-semibold">
                  <Lock size={18} /> Карта заблокирована
                </div>
              </div>
            )}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-white/70 text-xs mb-1">{card.name}</div>
                <div className="font-mono text-sm tracking-widest">
                  {showNum[i] ? `4000 0000 0000 ${card.number.slice(-4)}` : `${card.number.slice(0,2)}** **** **** ${card.number.slice(-4)}`}
                </div>
              </div>
              <div className="text-xl font-bold italic text-white/80">VISA</div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-white/60 text-xs mb-1">Срок действия</div>
                <div className="font-mono text-sm">{card.expiry}</div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-xs mb-1">Баланс</div>
                <div className="text-2xl font-black">{card.balance} <span className="text-base font-normal opacity-70">BYN</span></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setShowNum(p => ({ ...p, [i]: !p[i] }))}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60"
              >
                {showNum[i] ? <EyeOff size={16} className="text-white/40" /> : <Eye size={16} className="text-white/40" />}
                {showNum[i] ? 'Скрыть' : 'Номер'}
              </button>
              <button
                onClick={() => toggleFreeze(i)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60"
              >
                <Lock size={16} className={card.frozen ? 'text-[#F84B36]' : 'text-white/40'} />
                {card.frozen ? 'Разморозить' : 'Заморозить'}
              </button>
              <button
                onClick={() => showToast('Смена ПИН-кода')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60"
              >
                <Settings size={16} className="text-white/40" />
                ПИН-код
              </button>
              <button
                onClick={() => showToast('Реквизиты карты')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60"
              >
                <CreditCard size={16} className="text-white/40" />
                Реквизиты
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Order new card */}
      <button
        onClick={() => showToast('Заказ новой карты')}
        className="w-full border-2 border-dashed border-white/10 rounded-3xl p-5 flex items-center justify-center gap-3 hover:border-[#0021F3] hover:bg-white/5 transition-all group"
      >
        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#0021F3]/20 transition-colors">
          <Plus size={20} className="text-[#0021F3]" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-white/60 group-hover:text-[#0021F3] transition-colors">Заказать новую карту</div>
          <div className="text-sm text-white/30">Кактус, Шоппер, Visa Gold и другие</div>
        </div>
      </button>
    </div>
  );
}
