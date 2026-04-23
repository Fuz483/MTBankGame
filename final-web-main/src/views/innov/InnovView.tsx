import { useState } from 'react';
import { SubTab } from '../../types';
import GameWidget from './GameWidget';
import StocksTab from './tabs/StocksTab';
import DepositsTab from './tabs/DepositsTab';
import CreditsTab from './tabs/CreditsTab';
import ExchangeTab from './tabs/ExchangeTab';
import PiggyTab from './tabs/PiggyTab';
import EventsTab from './tabs/EventsTab';
import InternTab from './tabs/InternTab';
import QuizTab from './tabs/QuizTab';

const tabs: { id: SubTab; label: string }[] = [
  { id: 'stocks', label: 'Акции' },
  { id: 'deposits', label: 'Вклады' },
  { id: 'credits', label: 'Кредиты' },
  { id: 'exchange', label: 'Бонусы' },
  { id: 'piggy', label: 'Копилка' },
  { id: 'events', label: 'События' },
  { id: 'intern', label: 'Стажировка' },
  { id: 'quiz', label: 'Викторина' },
];

export default function InnovView() {
  const [active, setActive] = useState<SubTab>('stocks');

  return (
    <div>
      <GameWidget />

      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 border-b border-gray-100">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                active === t.id
                  ? 'bg-[#1e6fdf] text-white shadow-md shadow-blue-200'
                  : 'text-gray-500 hover:bg-gray-100'
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
          {active === 'intern' && <InternTab />}
          {active === 'quiz' && <QuizTab />}
        </div>
      </div>
    </div>
  );
}
