import { useState } from 'react';
import { Tag, Clock, ChevronRight, X, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductItem } from '../../../types';

const stocks: ProductItem[] = [
  { name: 'Театральный кешбэк', short: '10% кешбэка на билеты в театры и кино', full: 'При оплате картой МТБанка от 30 BYN в театрах и кинотеатрах Беларуси вы получаете кешбэк 10% на следующие покупки. Максимум 50 BYN в месяц. Начисляется в течение 3 рабочих дней.', btn: 'Подключить', badge: 'Хит', expiry: 'до 31 дек', rate: '10%' },
  { name: 'Spotify Premium', short: 'Музыка без рекламы за 2.99 BYN/мес', full: 'Только для держателей карт МТБанк в возрасте 18–25 лет. Скидка 70% на 3 месяца. Активация — после первой оплаты картой. Автопродление отключено.', btn: 'Активировать', badge: 'Новинка', expiry: 'до 1 апр', rate: '-70%' },
  { name: 'Лояльность 5+ лет', short: 'Повышенный кешбэк до 5% за верность банку', full: 'Клиентам старше 5 лет кешбэк в категориях «Общепит» и «Техника» увеличивается до 5%. Автоматически применяется при каждой покупке. Нет лимита по сумме.', btn: 'Проверить статус', badge: 'VIP', rate: 'до 5%' },
  { name: 'АЗС — топливо дешевле', short: '3% кешбэка на заправках А-100 и Лукойл', full: 'Кешбэк 3% при оплате картой Шоппер или Visa Gold на АЗС-партнёрах. Ежемесячное начисление. Лимит — 30 BYN в месяц.', btn: 'Подключить', expiry: 'до 30 июн', rate: '3%' },
  { name: 'Здоровый образ жизни', short: '5% на спортивные товары и фитнес', full: 'Кешбэк 5% на покупки в FitnessMart, SportMaster и фитнес-клубах с картой МТБанка. Требуется предварительная регистрация в приложении.', btn: 'Активировать', badge: 'Новинка', rate: '5%' },
  { name: 'Ozon — скидка партнёра', short: '200 бонусных рублей при первом заказе', full: 'При первой покупке в Ozon от 50 BYN с картой МТБанка — 200 бонусных рублей Ozon. Начисляются в течение 14 дней. Применимы на следующий заказ.', btn: 'Получить промокод', badge: 'Партнёр', expiry: 'до 15 мар' },
];

function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    'Хит': 'bg-orange-500/20 text-orange-400',
    'Новинка': 'bg-emerald-500/20 text-emerald-400',
    'VIP': 'bg-amber-500/20 text-amber-400',
    'Партнёр': 'bg-[#0021F3]/20 text-[#0021F3]',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[label] || 'bg-white/10 text-white/60'}`}>{label}</span>;
}

export default function StocksTab() {
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const { showToast } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-[#0021F3]" />
        <h2 className="font-bold text-white text-lg">Акции и специальные предложения</h2>
      </div>

      {stocks.map((s, i) => (
        <div
          key={i}
          onClick={() => setSelected(s)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#0021F3] hover:bg-white/10 transition-all duration-200 group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-[#0021F3]/10 rounded-xl flex items-center justify-center text-[#0021F3]">
            <Tag size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{s.name}</span>
              {s.badge && <Badge label={s.badge} />}
            </div>
            <p className="text-sm text-white/60 mt-0.5 truncate">{s.short}</p>
            {s.expiry && (
              <div className="flex items-center gap-1 mt-1 text-xs text-orange-400">
                <Clock size={11} /> {s.expiry}
              </div>
            )}
          </div>
          {s.rate && (
            <div className="flex-shrink-0 text-right">
              <span className="text-[#0021F3] font-bold text-lg">{s.rate}</span>
            </div>
          )}
          <ChevronRight size={18} className="text-white/40 group-hover:text-[#0021F3] transition-colors flex-shrink-0" />
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xl text-white">{selected.name}</h3>
                  {selected.badge && <Badge label={selected.badge} />}
                </div>
                {selected.rate && <div className="text-[#0021F3] font-bold text-2xl mt-1">{selected.rate}</div>}
              </div>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <p className="text-white/60 leading-relaxed mb-6">{selected.full}</p>
            {selected.expiry && (
              <div className="flex items-center gap-1.5 text-sm text-orange-400 mb-4 bg-orange-500/10 px-3 py-2 rounded-xl">
                <Clock size={14} /> Действует {selected.expiry}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { showToast(`${selected.name} — заявка оформлена`); setSelected(null); }}
                className="flex-1 bg-[#0021F3] text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 transition-colors"
              >
                {selected.btn}
              </button>
              <button onClick={() => setSelected(null)} className="px-4 border border-white/10 rounded-2xl text-white/60 hover:bg-white/10 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
