import { useState } from 'react';
import { Tag, Clock, ChevronRight, X, TrendingUp } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductItem } from '../../../types';

const stocks: ProductItem[] = [
  { name: 'Счастливые часы в фастфуде', short: 'Скидка 10% каждую пятницу', full: 'Каждую пятницу с 12:00 до 15:00 при оплате картой МТБанка в фастфуде (Mak.by) — мгновенная скидка 10% от чека. Логика: Привязать карту к конкретному дню и времени, создать привычку платить именно ей в обеденный час пик.', btn: 'Подключить', badge: 'Хит', expiry: 'через 2 месяца', rate: '-10%' },
  { name: 'Кешбэк за фитнес', short: '6% кешбэк на следующую покупку', full: 'При оплате в фитнесклубах (Адреналин, GYM24) на сумму от 150 BYN кешбэк на следующую покупку 6%. Логика: Выйдет примерно в 0 или даже в плюс.', btn: 'Активировать', badge: 'Новинка', expiry: 'через 2 месяца', rate: '6%' },
  { name: 'Скидка на такси', short: '20% скидка на каждый 3-й заказ Яндекс Go', full: 'На каждый третий заказ такси в Яндекс Go по карте МТБанка применяется скидка 20%.', btn: 'Подключить', badge: 'Популярный', rate: '-20%' },
];

function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    'Хит': 'bg-orange-100 text-orange-600',
    'Новинка': 'bg-green-100 text-green-700',
    'Популярный': 'bg-blue-100 text-blue-700',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[label] || 'bg-gray-100 text-gray-600'}`}>{label}</span>;
}

export default function StocksTab() {
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const { showToast } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-[#1e6fdf]" />
        <h2 className="font-bold text-gray-800 text-lg">Акции и специальные предложения</h2>
      </div>

      {stocks.map((s, i) => (
        <div
          key={i}
          onClick={() => setSelected(s)}
          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#1e6fdf] hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-[#eef3fc] rounded-xl flex items-center justify-center text-[#1e6fdf]">
            <Tag size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{s.name}</span>
              {s.badge && <Badge label={s.badge} />}
            </div>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{s.short}</p>
            {s.expiry && (
              <div className="flex items-center gap-1 mt-1 text-xs text-orange-500">
                <Clock size={11} /> {s.expiry}
              </div>
            )}
          </div>
          {s.rate && (
            <div className="flex-shrink-0 text-right">
              <span className="text-[#1e6fdf] font-bold text-lg">{s.rate}</span>
            </div>
          )}
          <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1e6fdf] transition-colors flex-shrink-0" />
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xl text-gray-900">{selected.name}</h3>
                  {selected.badge && <Badge label={selected.badge} />}
                </div>
                {selected.rate && <div className="text-[#1e6fdf] font-bold text-2xl mt-1">{selected.rate}</div>}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{selected.full}</p>
            {selected.expiry && (
              <div className="flex items-center gap-1.5 text-sm text-orange-500 mb-4 bg-orange-50 px-3 py-2 rounded-xl">
                <Clock size={14} /> Действует {selected.expiry}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { showToast(`${selected.name} — заявка оформлена`); setSelected(null); }}
                className="flex-1 bg-[#1e6fdf] text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 transition-colors"
              >
                {selected.btn}
              </button>
              <button onClick={() => setSelected(null)} className="px-4 border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}