import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { user, signIn, signUp, showToast } = useApp();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return null;
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-[#0021F3] text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        Войти
      </button>
    );
  }

  const submit = async () => {
    if (!email || !password) { showToast('Заполните все поля'); return; }
    setLoading(true);
    let err: string | null;
    if (mode === 'login') {
      err = await signIn(email, password);
    } else {
      if (!username) { showToast('Введите имя'); setLoading(false); return; }
      err = await signUp(email, password, username);
      if (!err) showToast('Аккаунт создан! Добро пожаловать!');
    }
    setLoading(false);
    if (err) showToast(err);
    else setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadein">
      <div className="bg-[#010615] border border-white/10 rounded-3xl p-7 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-white font-black text-xl">{mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</h2>
            <p className="text-white/40 text-xs mt-1">МТБанк · Инновационный пакет</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white p-1"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          {mode === 'register' && (
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-colors"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-colors"
          />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Пароль"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-11 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0021F3] transition-colors"
            />
            <button
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-5 bg-[#0021F3] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition-colors"
        >
          {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>

        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="w-full mt-3 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}
