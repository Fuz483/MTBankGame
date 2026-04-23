import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import GameModal from './components/GameModal';
import CarSelectModal from './components/CarSelectModal';
import OnlineGameModal from './components/OnlineGameModal';
import AIAssistant from './components/AIAssistant';
import AuthModal from './components/AuthModal';
import HomeView from './views/HomeView';
import InnovView from './views/innov/InnovView';
import CardsView from './views/CardsView';
import PaymentsView from './views/PaymentsView';
import MoreView from './views/MoreView';
import LeaderboardView from './views/LeaderboardView';
import { NavTab } from './types';

function AppContent() {
  const [activeNav, setActiveNav] = useState<NavTab>('innov');
  const [onlineOpen, setOnlineOpen] = useState(false);
  const { loadingAuth } = useApp();

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#010615] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg viewBox="0 0 56 56" fill="none" className="w-14 h-14 animate-pulse">
            <circle cx="28" cy="28" r="28" fill="#0021F3"/>
            <path d="M13 35V21h5.5l4.5 8.5 4.5-8.5H33v14h-4.5V27l-3.5 7h-3l-3.5-7v8H13z" fill="white"/>
            <path d="M36 21h4.5v14H36V21z" fill="#F84B36"/>
          </svg>
          <div className="text-white/40 text-sm">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-5xl bg-[#010615] rounded-[24px] shadow-2xl overflow-hidden border border-white/5">
        <Header />
        <Navigation active={activeNav} onChange={setActiveNav} />
        <div className="bg-[#0a0f1e] p-5 min-h-[600px]">
          {activeNav === 'main' && <HomeView />}
          {activeNav === 'innov' && <InnovView onOpenOnline={() => setOnlineOpen(true)} />}
          {activeNav === 'cards' && <CardsView />}
          {activeNav === 'payments' && <PaymentsView />}
          {activeNav === 'more' && <MoreView />}
          {activeNav === 'leaderboard' && <LeaderboardView />}
        </div>
      </div>
      <Toast />
      <CarSelectModal />
      <GameModal />
      <OnlineGameModal open={onlineOpen} onClose={() => setOnlineOpen(false)} />
      <AIAssistant />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
