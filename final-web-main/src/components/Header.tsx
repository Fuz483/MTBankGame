import { Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { mtCoins } = useApp();
  return (
    <div className="bg-[#0a2b4e] px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-[#1e6fdf] w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl text-white select-none">
          МТ
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-tight">МТБанк</div>
          <div className="text-blue-300 text-xs font-medium">Инновационный пакет</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 bg-[#f5a623]/20 border border-[#f5a623]/30 text-[#f5a623] px-3 py-1.5 rounded-full text-sm font-bold">
          <span>🪙</span>
          <span>{mtCoins.toLocaleString()} MTcoin</span>
        </div>
        <button className="relative bg-[#1e3a5f] w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-[#1e4a7f] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#1e4a7f] transition-colors pl-3 pr-2 py-1.5 rounded-full">
          <div className="bg-[#1e6fdf] w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ИА
          </div>
          <span className="text-white text-sm font-medium hidden sm:block">Илья А.</span>
          <ChevronDown size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}
