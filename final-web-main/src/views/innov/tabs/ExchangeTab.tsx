import { useState } from 'react';
import { Gift, Coins } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface Offer { cost: number; reward: string; category: string; icon: string; }
const offers: Offer[] = [
  { cost: 100, reward: 'Купон -5% в продуктах', category: 'Питание', icon: '🛒' },
  { cost: 150, reward: 'Кешбэк 5% на спорт', category: 'Здоровье', icon: '💪' },
  { cost: 200, reward: 'Бесплатная доставка ×3', category: 'Сервисы', icon: '🚚' },
  { cost: 250, reward: 'Скидка 10% в кафе', category: 'Питание', icon: '☕' },
  { cost: 400, reward: 'Билет в кино (1 шт.)', category: 'Досуг', icon: '🎬' },
  { cost: 500, reward: 'Скидка 15% на авиабилеты', category: 'Путешествия', icon: '✈️' },
  { cost: 600, reward: 'Шоппер МТБанка', category: 'Товары', icon: '🛍️' },
  { cost: 800, reward: 'Подписка на сервис 1 мес.', category: 'Сервисы', icon: '📱' },
  { cost: 1000, reward: 'Участие в розыгрыше iPhone 16', category: 'Розыгрыш', icon: '🏆' },
  { cost: 1500, reward: 'Повышенный кешбэк 7% на месяц', category: 'Кешбэк', icon: '💰' },
  { cost: 2000, reward: 'Скидка 20% на первый вклад', category: 'Финансы', icon: '🏦' },
  { cost: 3000, reward: 'Сертификат ресторана 50 BYN', category: 'Досуг', icon: '🍽️' },
];

const categories = ['Все', 'Питание', 'Здоровье', 'Сервисы', 'Досуг', 'Путешествия', 'Финансы'];

export default function ExchangeTab() {
  const { mtCoins, addCoins, showToast } = useApp();
  const [cat, setCat] = useState('Все');

  const filtered = cat === 'Все' ? offers : offers.filter(o => o.category === cat);

  function redeem(offer: Offer) {
    if (mtCoins >= offer.cost) {
      addCoins(-offer.cost);
      showToast(`Получено: ${offer.reward}`);
    } else {
      showToast(`Не хватает ${offer.cost - mtCoins} MTcoin`);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-[#1e6fdf]" />
          <h2 className="font-bold text-gray-800 text-lg">Обменник бонусов</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-sm font-bold">
          <Coins size={14} />
          {mtCoins.toLocaleString()} MTcoin
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              cat === c ? 'bg-[#1e6fdf] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1e6fdf]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((o, i) => {
          const canAfford = mtCoins >= o.cost;
          return (
            <div
              key={i}
              className={`bg-white border rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200 ${
                canAfford ? 'border-gray-100 hover:border-[#1e6fdf] hover:shadow-md cursor-pointer' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="text-3xl">{o.icon}</div>
              <div className="text-xs text-gray-400 font-medium">{o.category}</div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">{o.reward}</div>
              <button
                onClick={() => redeem(o)}
                disabled={!canAfford}
                className={`mt-auto px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  canAfford
                    ? 'bg-[#1e6fdf] text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {o.cost} MTcoin
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
