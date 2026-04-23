import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

const ALL_MODELS = ['F1-Scorpion', 'F1-Viper', 'F1-Thunder', 'F1-Nova', 'F1-Phantom', 'F1-Legend'];

interface AppContextType {
  mtCoins: number;
  attempts: number;
  ownedCars: string[];
  uniqueCars: number;
  activeCar: string;
  setActiveCar: (car: string) => void;
  toastMsg: string;
  gameModalOpen: boolean;
  addCoins: (amount: number) => void;
  decrementAttempts: () => void;
  addCar: (car: string) => void;
  mergeCars: () => void;
  inviteFriend: () => void;
  showToast: (msg: string) => void;
  openGame: () => void;
  closeGame: () => void;
  canStartRace: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mtCoins, setMtCoins] = useState(() => {
    const saved = localStorage.getItem('mtbank_shared_coins');
    return saved ? parseInt(saved, 10) : 1450;
  });

  const [ownedCars, setOwnedCars] = useState<string[]>(() => {
    const savedGarage = localStorage.getItem('mtbank_shared_garage');
    return savedGarage ? JSON.parse(savedGarage) : ['F1-Scorpion', 'F1-Viper', 'F1-Scorpion'];
  });

  // НОВОЕ: Выбранная машина
  const [activeCar, setActiveCar] = useState(() => {
    return localStorage.getItem('mtbank_shared_active_car') || 'F1-Scorpion';
  });

  const [attempts, setAttempts] = useState(3);
  const [toastMsg, setToastMsg] = useState('');
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    localStorage.setItem('mtbank_shared_coins', mtCoins.toString());
  }, [mtCoins]);

  useEffect(() => {
    localStorage.setItem('mtbank_shared_garage', JSON.stringify(ownedCars));
  }, [ownedCars]);

  useEffect(() => {
    localStorage.setItem('mtbank_shared_active_car', activeCar);
  }, [activeCar]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'mtbank_shared_coins' && e.newValue) setMtCoins(parseInt(e.newValue, 10));
      if (e.key === 'mtbank_shared_garage' && e.newValue) setOwnedCars(JSON.parse(e.newValue));
      if (e.key === 'mtbank_shared_active_car' && e.newValue) setActiveCar(e.newValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setMtCoins(prev => prev + amount);
    if (amount > 0) showToast(`+${amount} MTcoin`);
  }, [showToast]);

  const addCar = useCallback((car: string) => {
    setOwnedCars(prev => {
      if (prev.length >= 16) {
        setTimeout(() => {
          setMtCoins(c => c + 200);
          showToast('Гараж полон! Болид конвертирован в 200 MTC');
        }, 50);
        return prev;
      }
      return [...prev, car];
    });
  }, [showToast]);

  const decrementAttempts = useCallback(() => {
    setAttempts(prev => Math.max(0, prev - 1));
  }, []);

  const mergeCars = useCallback(() => {
    const counts = new Map<string, number>();
    for (const c of ownedCars) counts.set(c, (counts.get(c) || 0) + 1);
    const newGarage: string[] = [];
    let merged = false;
    let earned = 0;

    for (const [car, cnt] of counts.entries()) {
      if (cnt >= 2) {
        const pairs = Math.floor(cnt / 2);
        for (let i = 0; i < pairs; i++) {
          const idx = ALL_MODELS.indexOf(car);
          const nextIdx = Math.min(idx + 1, ALL_MODELS.length - 1);
          newGarage.push(ALL_MODELS[nextIdx]);
          earned += 70;
        }
        if (cnt % 2 === 1) newGarage.push(car);
        merged = true;
      } else {
        newGarage.push(car);
      }
    }

    if (merged) {
      setOwnedCars(newGarage);
      setMtCoins(prev => prev + earned);
      showToast(`Объединение! +${earned} MTcoin`);
    } else {
      showToast('Нет одинаковых болидов для объединения');
    }
  }, [ownedCars, showToast]);

  const inviteFriend = useCallback(() => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    setMtCoins(prev => prev + 100);
    showToast('Приглашение отправлено! +100 MTcoin');
  }, [showToast]);

  const openGame = useCallback(() => {
    if (attempts <= 0) {
      showToast('Нет попыток! Восстановление через 20 сек.');
      return;
    }
    decrementAttempts();
    window.open('http://localhost:8000', '_blank');
  }, [attempts, decrementAttempts, showToast]);

  const closeGame = useCallback(() => setGameModalOpen(false), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAttempts(prev => {
        if (prev < 5) { showToast('+1 попытка восстановлена'); return prev + 1; }
        return prev;
      });
    }, 22000);
    return () => clearInterval(interval);
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      mtCoins, attempts, ownedCars,
      uniqueCars: new Set(ownedCars).size,
      activeCar, setActiveCar,
      toastMsg, gameModalOpen, addCoins, decrementAttempts, addCar,
      mergeCars, inviteFriend, showToast, openGame, closeGame,
      canStartRace: attempts > 0,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}