import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

const ALL_MODELS = ['F1-Scorpion', 'F1-Viper', 'F1-Thunder', 'F1-Nova', 'F1-Phantom'];

interface AppContextType {
  mtCoins: number;
  attempts: number;
  ownedCars: string[];
  uniqueCars: number;
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
  const [mtCoins, setMtCoins] = useState(1450);
  const [attempts, setAttempts] = useState(3);
  const [ownedCars, setOwnedCars] = useState(['F1-Scorpion', 'F1-Viper', 'F1-Scorpion']);
  const [toastMsg, setToastMsg] = useState('');
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const addCoins = useCallback((amount: number) => {
    setMtCoins(prev => prev + amount);
    showToast(`+${amount} MTcoin`);
  }, [showToast]);

  const decrementAttempts = useCallback(() => {
    setAttempts(prev => Math.max(0, prev - 1));
  }, []);

  const addCar = useCallback((car: string) => {
    setOwnedCars(prev => [...prev, car]);
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
          newGarage.push(ALL_MODELS[(idx + 1) % ALL_MODELS.length]);
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
    setMtCoins(prev => prev + 100);
    showToast('Друг приглашён! +100 MTcoin');
  }, [showToast]);

  const openGame = useCallback(() => {
    if (attempts <= 0) {
      showToast('Нет попыток! Восстановление через 20 сек.');
      return;
    }
    setGameModalOpen(true);
  }, [attempts, showToast]);

  const closeGame = useCallback(() => {
    setGameModalOpen(false);
  }, []);

  // Attempt recovery timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAttempts(prev => {
        if (prev < 5) {
          showToast('+1 попытка гонки восстановлена');
          return prev + 1;
        }
        return prev;
      });
    }, 22000);
    return () => clearInterval(interval);
  }, [showToast]);

  return (
    <AppContext.Provider value={{
      mtCoins, attempts, ownedCars,
      uniqueCars: new Set(ownedCars).size,
      toastMsg, gameModalOpen,
      addCoins, decrementAttempts, addCar,
      mergeCars, inviteFriend, showToast,
      openGame, closeGame,
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
