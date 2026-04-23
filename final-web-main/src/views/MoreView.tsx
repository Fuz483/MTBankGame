import { Shield, Bell, Circle as HelpCircle, FileText, LogOut, ChevronRight, User, Smartphone, Lock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

const menuSections = [
  {
    title: 'Профиль',
    items: [
      { icon: <User size={18} />, label: 'Личные данные', sub: 'Илья Александрович', color: 'text-[#0021F3] bg-[#0021F3]/10' },
      { icon: <Smartphone size={18} />, label: 'Смарт-код', sub: 'Вход по биометрии', color: 'text-emerald-400 bg-emerald-500/10' },
    ],
  },
  {
    title: 'Безопасность',
    items: [
      { icon: <Lock size={18} />, label: 'Пароль и PIN', sub: 'Последнее изменение: 3 мес. назад', color: 'text-amber-400 bg-amber-500/10' },
      { icon: <Shield size={18} />, label: 'Антифишинг', sub: 'Защита активна', color: 'text-[#F84B36] bg-[#F84B36]/10' },
      { icon: <Bell size={18} />, label: 'Уведомления', sub: 'Push, SMS, E-mail', color: 'text-purple-400 bg-purple-500/10' },
    ],
  },
  {
    title: 'Информация',
    items: [
      { icon: <Globe size={18} />, label: 'Отделения и банкоматы', sub: '47 в Минске · GPS', color: 'text-teal-400 bg-teal-500/10' },
      { icon: <HelpCircle size={18} />, label: 'Поддержка', sub: '8 (017) 309-30-40 · 24/7', color: 'text-[#0021F3] bg-[#0021F3]/10' },
      { icon: <FileText size={18} />, label: 'Документы и договоры', sub: 'Выписки, тарифы', color: 'text-white/40 bg-white/5' },
    ],
  },
];

export default function MoreView() {
  const { showToast } = useApp();

  return (
    <div className="space-y-4">
      {/* User banner */}
      <div className="bg-gradient-to-r from-[#010615] to-[#071D49] border border-white/10 rounded-3xl p-5 flex items-center gap-4 text-white">
        <div className="w-14 h-14 bg-[#0021F3] rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0">ИА</div>
        <div>
          <div className="font-bold text-lg">Илья Александрович</div>
          <div className="text-white/60 text-sm">Клиент с 2019 · Пакет «Инновации»</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-emerald-400 text-xs font-medium">Профиль подтверждён</span>
          </div>
        </div>
      </div>

      {menuSections.map((section, si) => (
        <div key={si} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <span className="text-xs text-white/30 font-semibold uppercase tracking-wide">{section.title}</span>
          </div>
          <div className="divide-y divide-white/5">
            {section.items.map((item, i) => (
              <button
                key={i}
                onClick={() => showToast(item.label)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">{item.label}</div>
                  <div className="text-xs text-white/40 truncate">{item.sub}</div>
                </div>
                <ChevronRight size={16} className="text-white/30 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
        <button
          onClick={() => showToast('Выход из аккаунта')}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F84B36]/10 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F84B36]/10 text-[#F84B36] flex-shrink-0">
            <LogOut size={18} />
          </div>
          <span className="font-medium text-[#F84B36]">Выйти из приложения</span>
        </button>
      </div>

      <div className="text-center text-xs text-white/30 pb-2">МТБанк · Версия 1.0.190 · © 2025</div>
    </div>
  );
}
