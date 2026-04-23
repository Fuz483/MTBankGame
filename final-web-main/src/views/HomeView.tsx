import { ArrowUpRight, ArrowDownLeft, Plus, Send, QrCode, History, TrendingUp, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const transactions = [
  { title: 'Яндекс Маркет', sub: 'Шоппинг', amount: '-47.30 BYN', pos: false, date: 'Сег., 14:12' },
  { title: 'Зарплата ноябрь', sub: 'Поступление', amount: '+1850.00 BYN', pos: true, date: 'Сег., 09:00' },
  { title: 'Суши-бар Sapporo', sub: 'Питание', amount: '-22.80 BYN', pos: false, date: 'Вчера, 20:14' },
  { title: 'Перевод от Ивана К.', sub: 'Перевод', amount: '+50.00 BYN', pos: true, date: 'Вчера, 17:32' },
  { title: 'Velcom · MTS', sub: 'Мобильная связь', amount: '-20.00 BYN', pos: false, date: '18 апр' },
  { title: 'Sportmaster', sub: 'Спорт', amount: '-89.99 BYN', pos: false, date: '16 апр' },
];

const rates = [
  { cur: 'USD', buy: '3.2110', sell: '3.2450', change: '+0.12%' },
  { cur: 'EUR', buy: '3.5020', sell: '3.5400', change: '-0.05%' },
  { cur: 'RUB', buy: '0.0328', sell: '0.0342', change: '+0.02%' },
];

export default function HomeView() {
  const { showToast } = useApp();

  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="flex gap-4 overflow-x-auto pb-1">
        <div className="flex-shrink-0 w-72 bg-gradient-to-br from-[#1e6fdf] to-[#0a4a8f] rounded-3xl p-5 text-white shadow-lg shadow-blue-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">ШОППЕР · BYN</div>
              <div className="text-sm tracking-widest font-mono">4*** **** **** 1803</div>
            </div>
            <div className="text-white/80 text-lg font-bold italic">VISA</div>
          </div>
          <div className="text-3xl font-black mb-4">3.13 <span className="text-lg font-normal opacity-70">BYN</span></div>
          <div className="flex gap-2">
            <button onClick={() => showToast('Пополнение карты')} className="flex-1 bg-white/15 hover:bg-white/25 transition-colors text-sm font-medium py-2 rounded-xl">Пополнить</button>
            <button onClick={() => showToast('Перевод')} className="flex-1 bg-white/15 hover:bg-white/25 transition-colors text-sm font-medium py-2 rounded-xl">Перевести</button>
          </div>
        </div>

        <div className="flex-shrink-0 w-72 bg-gradient-to-br from-[#2a5f8a] to-[#1a3f6e] rounded-3xl p-5 text-white shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">VISA GOLD</div>
              <div className="text-sm tracking-widest font-mono">4*** **** **** 7834</div>
            </div>
            <div className="text-white/80 text-lg font-bold italic">VISA</div>
          </div>
          <div className="text-3xl font-black mb-4">0.00 <span className="text-lg font-normal opacity-70">BYN</span></div>
          <button onClick={() => showToast('Пополнение карты')} className="w-full bg-white/15 hover:bg-white/25 transition-colors text-sm font-medium py-2 rounded-xl">Пополнить</button>
        </div>

        <div className="flex-shrink-0 w-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1e6fdf] hover:bg-[#f8faff] transition-all" onClick={() => showToast('Оформить новую карту')}>
          <div className="w-10 h-10 bg-[#eef3fc] rounded-full flex items-center justify-center text-[#1e6fdf]"><Plus size={20} /></div>
          <span className="text-sm text-gray-500 font-medium text-center">Новая карта</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: <Plus size={20} />, label: 'Пополнить', color: 'bg-blue-50 text-[#1e6fdf]' },
            { icon: <Send size={20} />, label: 'Перевести', color: 'bg-green-50 text-green-600' },
            { icon: <QrCode size={20} />, label: 'QR-оплата', color: 'bg-amber-50 text-amber-600' },
            { icon: <History size={20} />, label: 'История', color: 'bg-purple-50 text-purple-600' },
          ].map((a, i) => (
            <button key={i} onClick={() => showToast(a.label)} className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.color}`}>{a.icon}</div>
              <span className="text-xs text-gray-600 font-medium">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Exchange rates */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#1e6fdf]" />
            <span className="font-bold text-gray-800">Курсы МТБанка</span>
          </div>
          <span className="text-xs text-gray-400">Обновлено 15:30</span>
        </div>
        <div className="space-y-2">
          {rates.map(r => (
            <div key={r.cur} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">{r.cur}</div>
                <span className="text-gray-700 font-medium text-sm">{r.cur} / BYN</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">Купить <strong className="text-gray-800">{r.buy}</strong></span>
                <span className="text-gray-500">Продать <strong className="text-gray-800">{r.sell}</strong></span>
                <span className={`font-medium text-xs ${r.change.startsWith('+') ? 'text-green-500' : 'text-red-400'}`}>{r.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-[#1e6fdf]" />
            <span className="font-bold text-gray-800">Последние операции</span>
          </div>
          <button className="flex items-center gap-1 text-[#1e6fdf] text-sm font-medium hover:underline">
            Все <ArrowRight size={13} />
          </button>
        </div>
        <div className="space-y-1">
          {transactions.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 hover:bg-gray-50 rounded-xl px-1 cursor-pointer transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.pos ? 'bg-green-50' : 'bg-gray-50'}`}>
                {t.pos ? <ArrowDownLeft size={18} className="text-green-500" /> : <ArrowUpRight size={18} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{t.title}</div>
                <div className="text-xs text-gray-400">{t.sub} · {t.date}</div>
              </div>
              <div className={`font-semibold text-sm flex-shrink-0 ${t.pos ? 'text-green-600' : 'text-gray-800'}`}>{t.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
