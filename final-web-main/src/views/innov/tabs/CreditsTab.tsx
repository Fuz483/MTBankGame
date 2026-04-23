import { useState } from 'react';
import { DollarSign, ChevronRight, X, Calculator, CircleCheck as CheckCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductItem } from '../../../types';

const credits: ProductItem[] = [
  { name: 'Кредит на обучение', short: 'Без залога · до 5000 BYN · 4.5% год.', full: 'Сумма до 5000 BYN. Отсрочка платежа до окончания учёбы. Без поручителей и залога. Требования: студенческий билет, паспорт, справка о доходах.', btn: 'Подать заявку', badge: 'Выгодно', rate: '4.5%' },
  { name: 'Микрокредит', short: 'До 1000 BYN · решение за 15 минут', full: 'Для молодёжи от 18 лет. Полностью онлайн. Срок — до 12 месяцев. Без справок о доходах до 500 BYN. Перечисление на карту мгновенно.', btn: 'Получить сейчас', badge: 'Быстро', rate: '7%' },
  { name: 'Кредит молодым семьям', short: '3.9% для пар до 25 лет · до 15 000 BYN', full: 'Льготный период 9–12 месяцев. Сумма до 15 000 BYN. Первый взнос от 10%. Возможность досрочного погашения без штрафов.', btn: 'Оставить заявку', badge: 'Льготный', rate: '3.9%' },
  { name: 'Автокредит', short: '5.9% · новые и б/у авто', full: 'Финансирование покупки авто до 50 000 BYN. Срок до 7 лет. КАСКО включено в первый год. Одобрение за 2 часа.', btn: 'Рассчитать', rate: '5.9%' },
  { name: 'Потребительский', short: '9.9% · до 30 000 BYN на любые цели', full: 'Кредит на любые нужды: ремонт, технику, путешествия. Без обеспечения до 10 000 BYN. Ставка снижается при страховании жизни.', btn: 'Оформить', rate: '9.9%' },
];

const requirements = ['Паспорт гражданина РБ', 'Возраст от 18 лет', 'Постоянная регистрация', 'Стаж от 3 месяцев'];

export default function CreditsTab() {
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [amount, setAmount] = useState('5000');
  const [months, setMonths] = useState('24');
  const { showToast } = useApp();

  const rate = selected ? parseFloat(selected.rate || '9') / 100 / 12 : 0.009 / 12;
  const n = parseInt(months || '12');
  const p = parseFloat(amount || '0');
  const monthly = p > 0 && n > 0 ? (p * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1) : 0;
  const total = monthly * n;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={18} className="text-[#0021F3]" />
        <h2 className="font-bold text-white text-lg">Кредитные продукты</h2>
      </div>

      {credits.map((c, i) => (
        <div
          key={i}
          onClick={() => setSelected(c)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#0021F3] hover:bg-white/10 transition-all duration-200 group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-[#0021F3]/10 rounded-xl flex items-center justify-center text-[#0021F3]">
            <DollarSign size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{c.name}</span>
              {c.badge && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0021F3]/20 text-[#0021F3]">{c.badge}</span>}
            </div>
            <p className="text-sm text-white/60 mt-0.5">{c.short}</p>
          </div>
          {c.rate && <span className="text-[#0021F3] font-bold text-lg flex-shrink-0">{c.rate}</span>}
          <ChevronRight size={18} className="text-white/40 group-hover:text-[#0021F3] transition-colors flex-shrink-0" />
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-xl text-white">{selected.name}</h3>
                <div className="text-[#0021F3] font-bold text-2xl mt-1">{selected.rate} годовых</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
            </div>
            <p className="text-white/60 leading-relaxed mb-4">{selected.full}</p>

            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3 text-white font-semibold">
                <Calculator size={16} />
                <span>Расчёт платежа</span>
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Сумма (BYN)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#0021F3] rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/60 mb-1 block">Срок (мес.)</label>
                  <input type="number" value={months} onChange={e => setMonths(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#0021F3] rounded-xl px-3 py-2 text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-white/40">Ежемесячно</div>
                  <div className="text-xl font-bold text-[#0021F3]">{monthly.toFixed(2)} BYN</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xs text-white/40">Всего с %</div>
                  <div className="text-xl font-bold text-white">{total.toFixed(2)} BYN</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold text-white mb-2">Требования:</div>
              <div className="space-y-1.5">
                {requirements.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    {r}
                  </div>
                ))}
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
