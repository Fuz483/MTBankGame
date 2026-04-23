import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { supabase, Profile } from '../lib/supabase';

export function getCarCoefficient(carNumber: number): number {
  return 1 + carNumber * 0.03;
}

export const PLACE_REWARDS = [25, 18, 15, 12, 10, 8, 6, 4];

export function calcCoinsForPlace(place: number, carId: number): number {
  const base = PLACE_REWARDS[Math.min(place - 1, 7)] ?? 4;
  return Math.round(base * getCarCoefficient(carId));
}

interface AppContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loadingAuth: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  mtCoins: number;
  ownedCars: number[];
  selectedCar: number;
  attempts: number;
  toastMsg: string;
  gameModalOpen: boolean;
  carSelectOpen: boolean;
  addCoins: (amount: number) => void;
  decrementAttempts: () => void;
  addCar: (carId: number) => void;
  mergeCarsAction: () => void;
  inviteFriend: () => void;
  showToast: (msg: string) => void;
  openGame: () => void;
  closeGame: () => void;
  openCarSelect: () => void;
  closeCarSelect: () => void;
  selectCar: (carId: number) => void;
  saveRaceResult: (position: number, coinsEarned: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [mtCoins, setMtCoins] = useState(1450);
  const [ownedCars, setOwnedCars] = useState<number[]>([1]);
  const [selectedCar, setSelectedCar] = useState(1);
  const [attempts, setAttempts] = useState(3);
  const [toastMsg, setToastMsg] = useState('');
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [carSelectOpen, setCarSelectOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const syncToSupabase = useCallback((coins: number, cars: number[], car: number) => {
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      if (!user) return;
      await supabase.from('profiles').update({ mt_coins: coins, owned_cars: cars, selected_car: car }).eq('id', user.id);
    }, 1000);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
      setMtCoins(data.mt_coins);
      setOwnedCars(Array.isArray(data.owned_cars) ? data.owned_cars : [1]);
      setSelectedCar(data.selected_car ?? 1);
    }
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email ?? '' });
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) setUser({ id: session.user.id, email: session.user.email ?? '' });
        else { setUser(null); setProfile(null); }
      })();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (user) refreshProfile(); }, [user, refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const addCoins = useCallback((amount: number) => {
    setMtCoins(prev => {
      const next = prev + amount;
      if (user) syncToSupabase(next, ownedCars, selectedCar);
      if (amount > 0) showToast(`+${amount} MTcoin`);
      return next;
    });
  }, [showToast, syncToSupabase, user, ownedCars, selectedCar]);

  const decrementAttempts = useCallback(() => setAttempts(prev => Math.max(0, prev - 1)), []);

  const addCar = useCallback((carId: number) => {
    setOwnedCars(prev => {
      if (prev.includes(carId)) return prev;
      const next = [...prev, carId];
      if (user) syncToSupabase(mtCoins, next, selectedCar);
      return next;
    });
  }, [mtCoins, syncToSupabase, user, selectedCar]);

  const mergeCarsAction = useCallback(() => {
    const counts = new Map<number, number>();
    for (const c of ownedCars) counts.set(c, (counts.get(c) || 0) + 1);
    const newGarage: number[] = [];
    let merged = false;
    let earned = 0;
    for (const [car, cnt] of counts.entries()) {
      if (cnt >= 2) {
        const pairs = Math.floor(cnt / 2);
        for (let i = 0; i < pairs; i++) { newGarage.push(Math.min(car + 1, 17)); earned += 70; }
        if (cnt % 2 === 1) newGarage.push(car);
        merged = true;
      } else { newGarage.push(car); }
    }
    if (merged) {
      setOwnedCars(newGarage);
      const newCoins = mtCoins + earned;
      setMtCoins(newCoins);
      if (user) syncToSupabase(newCoins, newGarage, selectedCar);
      showToast(`Объединение! +${earned} MTcoin`);
    } else showToast('Нет одинаковых болидов');
  }, [ownedCars, mtCoins, showToast, syncToSupabase, user, selectedCar]);

  const inviteFriend = useCallback(async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    if (user) await supabase.from('invite_codes').insert({ code, created_by: user.id });
    const link = `${window.location.origin}?invite=${code}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    addCoins(100);
    showToast('Ссылка скопирована! +100 MTcoin');
  }, [user, addCoins, showToast]);

  const openGame = useCallback(() => {
    if (attempts <= 0) { showToast('Нет попыток! Восстановление через 20 сек.'); return; }
    setCarSelectOpen(true);
  }, [attempts, showToast]);

  const closeGame = useCallback(() => setGameModalOpen(false), []);
  const openCarSelect = useCallback(() => setCarSelectOpen(true), []);
  const closeCarSelect = useCallback(() => setCarSelectOpen(false), []);

  const selectCar = useCallback((carId: number) => {
    setSelectedCar(carId);
    if (user) syncToSupabase(mtCoins, ownedCars, carId);
    setCarSelectOpen(false);
    setGameModalOpen(true);
  }, [mtCoins, ownedCars, syncToSupabase, user]);

  const saveRaceResult = useCallback(async (position: number, coinsEarned: number) => {
    if (!user) return;
    await supabase.from('race_results').insert({
      user_id: user.id, position, car_id: selectedCar, coins_earned: coinsEarned, race_room: 'offline',
    });
    const newCoins = mtCoins + coinsEarned;
    const newCars = ownedCars.includes(1) ? ownedCars : [1, ...ownedCars];
    await supabase.from('profiles').update({
      mt_coins: newCoins,
      total_races: (profile?.total_races ?? 0) + 1,
      races_won: position === 1 ? (profile?.races_won ?? 0) + 1 : (profile?.races_won ?? 0),
      total_coins_earned: (profile?.total_coins_earned ?? 0) + coinsEarned,
      owned_cars: newCars,
    }).eq('id', user.id);
    setMtCoins(newCoins);
    setOwnedCars(newCars);
    await refreshProfile();
  }, [user, selectedCar, mtCoins, ownedCars, profile, refreshProfile]);

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
      user, profile, loadingAuth, signIn, signUp, signOut,
      mtCoins, ownedCars, selectedCar, attempts, toastMsg, gameModalOpen, carSelectOpen,
      addCoins, decrementAttempts, addCar, mergeCarsAction, inviteFriend, showToast,
      openGame, closeGame, openCarSelect, closeCarSelect, selectCar, saveRaceResult, refreshProfile,
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
