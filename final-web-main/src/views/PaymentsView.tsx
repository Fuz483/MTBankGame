import { Smartphone, Zap, Wifi, ShoppingCart, Car, GraduationCap, QrCode, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const categories = [
  { icon: <Smartphone size={22} />, label: 'Мобильная связь', color: 'bg-blue-50 text-blue-600', providers: ['МТС', 'A1', 'life:)', 'Белтелеком'] },
  { icon: <Zap size={22} />, label: 'Коммунальные', color: 'bg-amber-50 text-amber-600', providers: ['Электроэнергия', 'Газ', 'Вода', 'ЖКХ'] },
  { icon: <Wifi size={22} />, label: 'Интернет', color: 'bg-green-50 text-green-600', providers: ['Белтелеком', 'СООО МТС', 'A1 Broadband'] },
  { icon: <ShoppingCart size={22} />, label: 'Онлайн-магазины', color: 'bg-purple-50 text-purple-600', providers: ['Ozon', 'Wildberries', '21vek.by', 'Lamoda'] },
  { icon: <Car size={22} />, label: 'Транспорт', color: 'bg-red-50 text-red-600', providers: ['Белжелдор', 'Минсктранс', 'Такси', 'Парковки'] },
  { icon: <GraduationCap size={22} />, label: 'Образование', color: 'bg-teal-50 text-teal-600', providers: ['БГТУ', 'БГУ', 'БНТУ', 'Онлайн-курсы'] },
];

const recent = [
  { title: 'МТС +375 29 1** **12', amount: '20.00 BYN', date: 'Вчера' },
  { title: 'Электроэнергия — л/с 0182341', amount: '34.80 BYN', date: '16 апр' },
  { title: 'Интернет Белтелеком', amount: '15.00 BYN', date: '14 апр' },
];

export default function PaymentsView() {
  const { showToast } = useApp();

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-gray-800 text-xl">Оплата услуг</h2>

      {/* QR Pay */}
      <button
        onClick={() => showToast('QR-сканер открыт')}
        className="w-full bg-gradient-to-r from-[#1e6fdf] to-[#0a4a8f] rounded-2xl p-4 flex items-center gap-4 text-white hover:opacity-90 transition-opacity"
      >
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <QrCode size={24} />
        </div>
        <div className="text-left">
          <div className="font-bold">Оплата по QR-коду</div>
          <div className="text-white/70 text-sm">Наведите камеру на код или введите номер</div>
        </div>
      </button>

      {/* Categories */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">Категории платежей</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => showToast(`${cat.label}: выберите провайдера`)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-[#1e6fdf] hover:bg-[#f8faff] transition-all cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.color}`}>{cat.icon}</div>
              <span className="text-xs text-gray-600 font-medium text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ERIP */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-[#eef3fc] rounded-lg flex items-center justify-center text-[#1e6fdf] font-black text-xs">ЕР</div>
          <h3 className="font-bold text-gray-700">ЕРИП</h3>
        </div>
        <div className="flex gap-3">
          <input
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1e6fdf] transition-colors"
            placeholder="Код организации или наименование"
          />
          <button
            onClick={() => showToast('Поиск в ЕРИП')}
            className="bg-[#1e6fdf] text-white font-semibold px-5 py-3 rounded-2xl hover:bg-blue-700 transition-colors text-sm"
          >
            Найти
          </button>
        </div>
      </div>

      {/* Recent payments */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-[#1e6fdf]" />
          <h3 className="font-bold text-gray-700">Шаблоны и последние</h3>
        </div>
        <div className="space-y-1">
          {recent.map((r, i) => (
            <div
              key={i}
              onClick={() => showToast(`Повторная оплата: ${r.title}`)}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">{r.title}</div>
                <div className="text-xs text-gray-400">{r.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 font-medium">{r.amount}</span>
                <button className="text-xs bg-[#eef3fc] text-[#1e6fdf] px-3 py-1 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                  Повторить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
