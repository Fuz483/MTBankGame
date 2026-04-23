import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import GameModal from './components/GameModal';
import AIAssistant from './components/AIAssistant';
import HomeView from './views/HomeView';
import InnovView from './views/innov/InnovView';
import CardsView from './views/CardsView';
import PaymentsView from './views/PaymentsView';
import MoreView from './views/MoreView';
import { NavTab } from './types';

function AppContent() {
  const [activeNav, setActiveNav] = useState<NavTab>('innov');

  return (
    <div className="min-h-screen bg-[#eef2f8] flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-5xl bg-white rounded-[28px] shadow-2xl shadow-black/10 overflow-hidden">
        <Header />
        <Navigation active={activeNav} onChange={setActiveNav} />
        <div className="bg-[#f8fafd] p-5 min-h-[600px]">
          {activeNav === 'main' && <HomeView />}
          {activeNav === 'innov' && <InnovView />}
          {activeNav === 'cards' && <CardsView />}
          {activeNav === 'payments' && <PaymentsView />}
          {activeNav === 'more' && <MoreView />}
        </div>
      </div>
      <Toast />
      <GameModal />
      <AIAssistant />
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