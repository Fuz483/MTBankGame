import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { mtCoins, profile, user, signOut, showToast } = useApp();
  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? 'ГС';
  const displayName = profile?.username ?? user?.email?.split('@')[0] ?? 'Гость';

  return (
    <div className="bg-[#010615] px-6 py-3 flex justify-between items-center border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex-shrink-0">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <circle cx="20" cy="20" r="20" fill="#0021F3"/>
            <path d="M10 26V14h4l3.5 6.5 3.5-6.5h4v12h-3.5V20l-2.8 5.5h-2.4L13.5 20v6H10z" fill="white"/>
            <path d="M27 14h3.5v12H27V14z" fill="#F84B36"/>
          </svg>
        </div>
        <div>
          <div className="text-white font-black text-lg leading-tight">МТБанк</div>
          <div className="text-[#0021F3] text-[9px] font-bold tracking-widest uppercase">Инновационный пакет</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-full text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-[#F84B36] flex-shrink-0" />
          <span>{mtCoins.toLocaleString()} MTcoin</span>
        </div>
        <button className="relative bg-white/5 w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/10">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F84B36] rounded-full" />
        </button>
        <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors pl-2.5 pr-2 py-1.5 rounded-full border border-white/10">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black"
            style={{ background: 'linear-gradient(135deg, #0021F3 0%, #F84B36 100%)' }}>
            {initials}
          </div>
          <span className="text-white text-sm font-medium hidden sm:block">{displayName}</span>
          <ChevronDown size={12} className="text-white/40" />
        </div>
        {user && (
          <button
            onClick={() => { signOut(); showToast('Выход выполнен'); }}
            className="bg-white/5 hover:bg-red-500/20 w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-[#F84B36] transition-all border border-white/10"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
