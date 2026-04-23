import { useState } from 'react';
import { PiggyBank, ChevronRight, X, Calculator } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductItem } from '../../../types';

const deposits: ProductItem[] = [
  { name: 'Вклад на обучение', short: 'До 9% годовых · от 50 BYN', full: 'Капитализация ежемесячно. Срок от 1 года. Пополнение от 50 BYN в любое время. Дополнительно — скидка 10% на партнёрские образовательные курсы.', btn: 'Открыть вклад', badge: 'Популярный', rate: '9%' },
  { name: 'Стартап-вклад', short: '6.5% годовых · для предпринимателей', full: 'Гибкие условия: снятие без потери процентов раз в квартал. Для ИП и начинающих предпринимателей. Консультация менеджера в подарок.', btn: 'Оформить', rate: '6.5%' },
  { name: 'Вклад-копилка', short: 'До 8% + бонус при достижении цели', full: 'Целевой вклад с персональной целью (машина, путешествие, ноутбук). При достижении цели банк начисляет бонус 2% от суммы вклада дополнительно.', btn: 'Создать цель', badge: 'Новинка', rate: '8%' },
  { name: 'Пенсионный вклад', short: '10% годовых · долгосрочный', full: 'Срок от 3 лет. Страхование АСВ. Ежегодная капитализация. Досрочное расторжение — с сохранением 60% процентов.', btn: 'Узнать условия', rate: '10%' },
  { name: 'Вклад "Семейный"', short: '7.5% · открывается на двух членов семьи', full: 'Особые условия для семейных пар. Возможность совместного пополнения. Повышенный лимит страхования. Бонус +0.5% при рождении ребёнка.', btn: 'Открыть', badge: 'Новинка', rate: '7.5%' },
];

export default function DepositsTab() {
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [calcAmount, setCalcAmount] = useState('1000');
  const [calcPeriod, setCalcPeriod] = useState('12');
  const { showToast } = useApp();

  const rate = selected ? parseFloat(selected.rate || '7') / 100 : 0.07;
  const result = parseFloat(calcAmount || '0') * (1 + rate * parseInt(calcPeriod || '12') / 12);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <PiggyBank size={18} className="text-[#0021F3]" />
        <h2 className="font-bold text-white text-lg">Вклады и накопления</h2>
      </div>

      {deposits.map((d, i) => (
        <div
          key={i}
          onClick={() => setSelected(d)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#0021F3] hover:bg-white/10 transition-all duration-200 group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <PiggyBank size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{d.name}</span>
              {d.badge && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0021F3]/20 text-[#0021F3]">{d.badge}</span>}
            </div>
            <p className="text-sm text-white/60 mt-0.5">{d.short}</p>
          </div>
          {d.rate && <span className="text-emerald-400 font-bold text-lg flex-shrink-0">{d.rate}</span>}
          <ChevronRight size={18} className="text-white/40 group-hover:text-[#0021F3] transition-colors flex-shrink-0" />
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl text-white">{selected.name}</h3>
                <div className="text-emerald-400 font-bold text-2xl mt-1">{selected.rate} годовых</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
            </div>
            <p className="text-white/60 leading-relaxed mb-4">{selected.full}</p>

            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3 text-white font-semibold">
                <Calculator size={16} />
                <span>Калькулятор дохода</span>
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Сумма (BYN)</label>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={e => setCalcAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#0021F3] rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Месяцев</label>
                  <input
                    type="number"
                    value={calcPeriod}
                    onChange={e => setCalcPeriod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#0021F3] rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-white/60">Получите через {calcPeriod} мес.</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{result.toFixed(2)} BYN</div>
                <div className="text-sm text-white/40">+{(result - parseFloat(calcAmount || '0')).toFixed(2)} BYN прибыли</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { showToast(`Заявка на «${selected.name}» принята`); setSelected(null); }}
                className="flex-1 bg-[#0021F3] text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 transition-colors"
              >
                {selected.btn}
              </button>
              <button onClick={() => setSelected(null)} className="px-4 border border-white/10 rounded-2xl text-white/60 hover:bg-white/10 transition-colors">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
