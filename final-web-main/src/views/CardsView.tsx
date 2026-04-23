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
    { name: 'ШОППЕР', number: '4*1803', expiry: '01/29', balance: '3.13', gradient: 'from-[#1e6fdf] to-[#0a4a8f]', frozen: false },
    { name: 'VISA GOLD', number: '4*7834', expiry: '06/25', balance: '0.00', gradient: 'from-[#2a5f8a] to-[#1a3f6e]', frozen: false },
  ]);
  const [showNum, setShowNum] = useState<Record<number, boolean>>({});

  function toggleFreeze(i: number) {
    setCards(prev => prev.map((c, j) => j === i ? { ...c, frozen: !c.frozen } : c));
    showToast(cards[i].frozen ? 'Карта разморожена' : 'Карта заблокирована');
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-gray-800 text-xl">Мои карты</h2>

      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
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
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600"
              >
                {showNum[i] ? <EyeOff size={16} className="text-gray-500" /> : <Eye size={16} className="text-gray-500" />}
                {showNum[i] ? 'Скрыть' : 'Номер'}
              </button>
              <button
                onClick={() => toggleFreeze(i)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600"
              >
                <Lock size={16} className={card.frozen ? 'text-red-500' : 'text-gray-500'} />
                {card.frozen ? 'Разморозить' : 'Заморозить'}
              </button>
              <button
                onClick={() => showToast('Смена ПИН-кода')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600"
              >
                <Settings size={16} className="text-gray-500" />
                ПИН-код
              </button>
              <button
                onClick={() => showToast('Реквизиты карты')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600"
              >
                <CreditCard size={16} className="text-gray-500" />
                Реквизиты
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Order new card */}
      <button
        onClick={() => showToast('Заказ новой карты')}
        className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-5 flex items-center justify-center gap-3 hover:border-[#1e6fdf] hover:bg-[#f8faff] transition-all group"
      >
        <div className="w-10 h-10 bg-[#eef3fc] rounded-full flex items-center justify-center group-hover:bg-[#dce9fc] transition-colors">
          <Plus size={20} className="text-[#1e6fdf]" />
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-700 group-hover:text-[#1e6fdf] transition-colors">Заказать новую карту</div>
          <div className="text-sm text-gray-400">Кактус, Шоппер, Visa Gold и другие</div>
        </div>
      </button>
    </div>
  );
}
