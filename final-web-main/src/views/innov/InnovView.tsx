import { useState } from 'react';
import { SubTab } from '../../types';
import GameWidget from './GameWidget';
import StocksTab from './tabs/StocksTab';
import DepositsTab from './tabs/DepositsTab';
import CreditsTab from './tabs/CreditsTab';
import ExchangeTab from './tabs/ExchangeTab';
import PiggyTab from './tabs/PiggyTab';
import EventsTab from './tabs/EventsTab';
import VacanciesTab from './tabs/VacanciesTab';
import QuizTab from './tabs/QuizTab';

const tabs: { id: SubTab; label: string }[] = [
  { id: 'stocks', label: 'Акции' },
  { id: 'deposits', label: 'Вклады' },
  { id: 'credits', label: 'Кредиты' },
  { id: 'exchange', label: 'Бонусы' },
  { id: 'piggy', label: 'Копилка' },
  { id: 'events', label: 'События' },
  { id: 'vacancies', label: 'Вакансии' },
  { id: 'quiz', label: 'Викторина' },
];

export default function InnovView({ onOpenOnline }: { onOpenOnline: () => void }) {
  const [active, setActive] = useState<SubTab>('stocks');

  return (
    <div>
      <GameWidget onOpenOnline={onOpenOnline} />

      <div
        className="rounded-3xl p-5 border border-white/5"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 border-b border-white/5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                active === t.id
                  ? 'bg-[#0021F3] text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div key={active} className="animate-fadein">
          {active === 'stocks' && <StocksTab />}
          {active === 'deposits' && <DepositsTab />}
          {active === 'credits' && <CreditsTab />}
          {active === 'exchange' && <ExchangeTab />}
          {active === 'piggy' && <PiggyTab />}
          {active === 'events' && <EventsTab />}
          {active === 'vacancies' && <VacanciesTab />}
          {active === 'quiz' && <QuizTab />}
        </div>
      </div>
    </div>
  );
}
