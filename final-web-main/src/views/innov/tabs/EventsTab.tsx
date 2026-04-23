import { useState } from 'react';
import { Calendar, MapPin, Users, X, Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductItem } from '../../../types';

const events: (ProductItem & { date: string; location: string; seats: string; type: string })[] = [
  { name: 'Эко-акция МТБанка', short: 'Посадка деревьев · 150 MTcoin', full: '5 июня 2025, Минск, парк Победы. Участники получают 150 MTcoin и скидку 10% на ЗОЖ-питание в течение месяца. Форма одежды — спортивная.', btn: 'Записаться', date: '5 июня', location: 'Минск, парк Победы', seats: '58/100', type: 'Экология' },
  { name: 'Хакатон FinTech 2025', short: 'Призы и оплачиваемая стажировка', full: '28–30 ноября 2025. Команды до 4 человек. Задачи: платёжные сервисы, AI в банкинге. Главный приз — стажировка в МТБанке + MacBook Pro.', btn: 'Зарегистрировать команду', date: '28–30 нояб', location: 'БГУ, корп. 2', seats: '24/60', type: 'IT' },
  { name: 'Лекция: Кибербезопасность', short: 'Онлайн · бонус-код участникам', full: '15 мая 2025, 18:00. Спикер: Андрей Климов, CISO МТБанка. Темы: фишинг, социальная инженерия, безопасность мобильного банка. Всем участникам — промокод на кешбэк 10%.', btn: 'Получить ссылку', date: '15 мая, 18:00', location: 'Онлайн (Zoom)', seats: '312/500', type: 'Обучение' },
  { name: 'Финансовая грамотность', short: 'Мастер-класс для молодёжи', full: '22 мая 2025, 14:00. Темы: бюджетирование, первый вклад, кредитная история. Бесплатно для клиентов МТБанка 18–25 лет. Сертификат участника.', btn: 'Записаться', date: '22 мая, 14:00', location: 'МТБанк, пр. Независимости 87', seats: '40/80', type: 'Обучение' },
  { name: 'День открытых дверей', short: 'Экскурсия в головной офис МТБанка', full: '7 июня 2025. Экскурсия по ЦОД, встреча с командой инноваций. Розыгрыш MacBook и подарков. Для студентов IT-специальностей.', btn: 'Зарегистрироваться', date: '7 июня', location: 'Минск, ул. Притыцкого 31', seats: '15/50', type: 'Карьера' },
];

const typeColors: Record<string, string> = {
  'Экология': 'bg-emerald-500/20 text-emerald-400',
  'IT': 'bg-[#0021F3]/20 text-[#0021F3]',
  'Обучение': 'bg-purple-500/20 text-purple-400',
  'Карьера': 'bg-amber-500/20 text-amber-400',
};

export default function EventsTab() {
  const [selected, setSelected] = useState<typeof events[0] | null>(null);
  const { showToast } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-[#0021F3]" />
        <h2 className="font-bold text-white text-lg">Мероприятия и события</h2>
      </div>

      {events.map((e, i) => (
        <div
          key={i}
          onClick={() => setSelected(e)}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#0021F3] hover:bg-white/10 transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-white">{e.name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[e.type] || 'bg-white/10 text-white/60'}`}>{e.type}</span>
              </div>
              <p className="text-sm text-white/60">{e.short}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                <div className="flex items-center gap-1"><Clock size={11} /> {e.date}</div>
                <div className="flex items-center gap-1"><MapPin size={11} /> {e.location}</div>
                <div className="flex items-center gap-1"><Users size={11} /> {e.seats}</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-12 h-12 bg-[#0021F3]/10 rounded-xl flex items-center justify-center text-[#0021F3]">
              <Calendar size={20} />
            </div>
          </div>
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#010615] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-xl text-white">{selected.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[selected.type] || ''}`}>{selected.type}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white p-1"><X size={20} /></button>
            </div>
            <p className="text-white/60 leading-relaxed mb-4">{selected.full}</p>
            <div className="bg-white/5 rounded-2xl p-4 mb-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div><div className="text-white/40 text-xs mb-1">Дата</div><div className="font-semibold text-white">{selected.date}</div></div>
              <div><div className="text-white/40 text-xs mb-1">Место</div><div className="font-semibold text-white">{selected.location}</div></div>
              <div><div className="text-white/40 text-xs mb-1">Мест</div><div className="font-semibold text-white">{selected.seats}</div></div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { showToast(`Вы записаны: ${selected.name}`); setSelected(null); }}
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
