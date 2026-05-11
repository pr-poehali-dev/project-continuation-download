import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import Icon from '@/components/ui/icon';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', login: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, loading } = useGame();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError('');
    let result;
    if (mode === 'login') {
      result = await login(form.login, form.password);
    } else {
      result = await register(form.username, form.email, form.password);
    }
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center relative overflow-hidden cyber-grid scanlines">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyber-magenta/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-orbitron text-5xl font-black mb-1">
            <span className="text-cyber-cyan">CODE</span>
            <span className="text-cyber-magenta">RPG</span>
          </div>
          <div className="text-gray-500 font-mono text-xs tracking-widest">ВОЙДИ В СИСТЕМУ · НАЧНИ ИГРУ</div>
        </div>

        {/* Auth panel */}
        <div className="cyber-panel p-8">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-cyber-cyan/20">
            {([['login', 'ВОЙТИ'], ['register', 'РЕГИСТРАЦИЯ']] as const).map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 font-orbitron text-xs tracking-wider transition-all ${
                  mode === m
                    ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <>
                <CyberInput label="ИМЯ ХАКЕРА" placeholder="nova_7" value={form.username} onChange={v => set('username', v)} />
                <CyberInput label="EMAIL" type="email" placeholder="you@neon.city" value={form.email} onChange={v => set('email', v)} />
              </>
            )}
            {mode === 'login' && (
              <CyberInput label="ЛОГИН ИЛИ EMAIL" placeholder="nova_7 или you@neon.city" value={form.login} onChange={v => set('login', v)} />
            )}
            <CyberInput label="ПАРОЛЬ" type="password" placeholder="••••••••" value={form.password} onChange={v => set('password', v)}
              onEnter={submit} />
          </div>

          {error && (
            <div className="mt-4 border border-red-500/40 bg-red-500/10 p-3 text-red-400 font-mono text-xs">
              ⚠ {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="cyber-btn w-full mt-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border border-cyber-cyan border-t-transparent rounded-full animate-spin" />
                ПОДКЛЮЧЕНИЕ...
              </>
            ) : (
              <>
                <Icon name="Zap" size={14} />
                {mode === 'login' ? 'ВОЙТИ В СИСТЕМУ' : 'СОЗДАТЬ АККАУНТ'}
              </>
            )}
          </button>

          <div className="mt-4 text-center text-gray-600 font-mono text-xs">
            {mode === 'login'
              ? <span>Нет аккаунта? <button onClick={() => setMode('register')} className="text-cyber-cyan hover:underline">Регистрация</button></span>
              : <span>Уже есть аккаунт? <button onClick={() => setMode('login')} className="text-cyber-cyan hover:underline">Войти</button></span>
            }
          </div>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-6 text-gray-700 font-mono text-xs">
          КОРПОРАЦИЯ НОЛЬ НЕ ОДОБРЯЕТ ЭТОТ ВХОД
        </div>
      </div>
    </div>
  );
}

function CyberInput({
  label, type = 'text', placeholder, value, onChange, onEnter
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; onEnter?: () => void;
}) {
  return (
    <div>
      <label className="block text-cyber-cyan font-mono text-xs mb-1 tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        className="w-full bg-black/50 border border-cyber-cyan/30 text-white font-mono text-sm px-4 py-3
          focus:outline-none focus:border-cyber-cyan focus:shadow-[0_0_12px_#00ffff30]
          placeholder:text-gray-700 transition-all duration-200"
      />
    </div>
  );
}
