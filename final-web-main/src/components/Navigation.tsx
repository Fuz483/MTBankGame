import { Home, Zap, CreditCard, Send, Menu } from 'lucide-react';
import { NavTab } from '../types';

interface NavigationProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const items: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'main', label: 'Главная', icon: <Home size={18} /> },
  { id: 'innov', label: 'Инновации', icon: <Zap size={18} /> },
  { id: 'cards', label: 'Карты', icon: <CreditCard size={18} /> },
  { id: 'payments', label: 'Оплатить', icon: <Send size={18} /> },
  { id: 'more', label: 'Ещё', icon: <Menu size={18} /> },
];

export default function Navigation({ active, onChange }: NavigationProps) {
  return (
    <div className="bg-white border-b border-gray-100 px-2 py-1.5 flex justify-around gap-1">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-150 ${
            active === item.id
              ? 'bg-[#eef3fc] text-[#1e6fdf]'
              : 'text-[#5c7a9a] hover:bg-gray-50'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
