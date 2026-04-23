import { Hop as Home, Zap, CreditCard, Send, Menu, Trophy } from 'lucide-react';
import { NavTab } from '../types';

interface NavigationProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const items: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'main', label: 'Главная', icon: <Home size={16} /> },
  { id: 'innov', label: 'Инновации', icon: <Zap size={16} /> },
  { id: 'cards', label: 'Карты', icon: <CreditCard size={16} /> },
  { id: 'payments', label: 'Оплатить', icon: <Send size={16} /> },
  { id: 'leaderboard', label: 'Рейтинг', icon: <Trophy size={16} /> },
  { id: 'more', label: 'Ещё', icon: <Menu size={16} /> },
];

export default function Navigation({ active, onChange }: NavigationProps) {
  return (
    <div className="bg-[#010615] border-b border-white/5 px-1 py-1 flex justify-around gap-0.5">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-semibold transition-all duration-150 min-w-0 ${
            active === item.id
              ? 'bg-[#0021F3] text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
