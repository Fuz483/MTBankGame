import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { supabase, LeaderboardEntry } from '../lib/supabase';
import { useApp } from '../context/AppContext';

export default function LeaderboardView() {
  const { user } = useApp();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'coins' | 'wins'>('coins');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const orderCol = tab === 'coins' ? 'total_coins_earned' : 'races_won';
      const { data } = await supabase
        .from('profiles')
        .select('id, username, mt_coins, total_coins_earned, races_won, total_races')
        .order(orderCol, { ascending: false })
        .limit(50);
      setEntries((data as LeaderboardEntry[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [tab]);

  const medalIcon = (pos: number) => {
    if (pos === 1) return <Crown size={18} className="text-yellow-400" />;
    if (pos === 2) return <Medal size={18} className="text-gray-300" />;
    if (pos === 3) return <Medal size={18} className="text-amber-600" />;
    return <span className="text-white/30 font-bold text-sm w-[18px] text-center">{pos}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Trophy size={22} className="text-[#0021F3]" />
        <h2 className="text-white font-black text-xl">Таблица лидеров</h2>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'coins', label: 'По монетам' },
          { id: 'wins', label: 'По победам' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'coins' | 'wins')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-[#0021F3] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#0021F3] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Trophy size={40} className="mx-auto mb-3 opacity-20" />
          <p>Пока нет данных</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e, i) => {
            const isMe = user?.id === e.id;
            return (
              <div
                key={e.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-[#0021F3]/15 border-[#0021F3]/50'
                    : i < 3
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/3 border-white/5'
                }`}
              >
                <div className="w-7 flex items-center justify-center flex-shrink-0">
                  {medalIcon(i + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${isMe ? 'text-[#0021F3]' : 'text-white'}`}>
                      {e.username || 'Игрок'}
                    </span>
                    {isMe && <span className="text-[9px] bg-[#0021F3] text-white px-2 py-0.5 rounded-full font-bold">ВЫ</span>}
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">
                    {e.total_races} гонок · {e.races_won} побед
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-black text-base">
                    {tab === 'coins' ? e.total_coins_earned.toLocaleString() : e.races_won}
                  </div>
                  <div className="text-white/30 text-xs">
                    {tab === 'coins' ? 'MTcoin заработано' : 'побед'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
