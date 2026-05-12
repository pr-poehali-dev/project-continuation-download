import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import Icon from '@/components/ui/icon';

type AuthMode = 'login' | 'register';

interface Props {
  mode: AuthMode;
  onSwitch: (m: AuthMode) => void;
  onBack: () => void;
}

export default function AuthScreen({ mode, onSwitch, onBack }: Props) {
  const [form, setForm] = useState({ username: '', email: '', login: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, loading } = useGame();

  const set = (k: string, v: string) => { setError(''); setForm(f => ({ ...f, [k]: v })); };

  const submit = async () => {
    setError('');
    if (mode === 'login') {
      if (!form.login || !form.password) { setError('Заполни все поля'); return; }
      const r = await login(form.login, form.password);
      if (r.error) setError(r.error);
    } else {
      if (!form.username || !form.email || !form.password) { setError('Заполни все поля'); return; }
      if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return; }
      const r = await register(form.username, form.email, form.password);
      if (r.error) setError(r.error);
    }
  };

  const accent = mode === 'login' ? '#00ffff' : '#ff00ff';
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accent + '05' }} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-5 lg:px-10 py-4 border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-white transition-colors">
          <Icon name="ChevronLeft" size={14} />
          НАЗАД
        </button>
        <div className="font-orbitron text-xl font-black">
          <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
        </div>
        <button
          onClick={() => onSwitch(isLogin ? 'register' : 'login')}
          className="font-mono text-xs px-3 py-1.5 border transition-all"
          style={{ borderColor: accent + '40', color: accent + 'aa', backgroundColor: accent + '06' }}
        >
          {isLogin ? 'РЕГИСТРАЦИЯ →' : '← ВОЙТИ'}
        </button>
      </header>

      {/* Body */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-2">
              {isLogin ? '// ИДЕНТИФИКАЦИЯ АГЕНТА' : '// РЕГИСТРАЦИЯ НОВОГО АГЕНТА'}
            </div>
            <h1 className="font-orbitron text-3xl font-black text-white mb-1">
              {isLogin ? 'ВХОД В' : 'СОЗДАТЬ'}{' '}
              <span style={{ color: accent }}>
                {isLogin ? 'СИСТЕМУ' : 'АККАУНТ'}
              </span>
            </h1>
            <p className="text-gray-600 font-rajdhani text-sm mt-2">
              {isLogin
                ? 'The Archive ждёт тебя. Введи свои данные.'
                : 'Присоединяйся к сопротивлению. CodeGrid-9, 2087.'}
            </p>
          </div>

          {/* Form */}
          <div
            className="p-6 border space-y-4"
            style={{ borderColor: accent + '30', backgroundColor: accent + '04' }}
          >
            {!isLogin && (
              <CField
                label="ИМЯ АГЕНТА"
                placeholder="Nova_7"
                value={form.username}
                onChange={v => set('username', v)}
                accent={accent}
                icon="User"
              />
            )}
            {!isLogin && (
              <CField
                label="EMAIL"
                placeholder="agent@archive.net"
                value={form.email}
                onChange={v => set('email', v)}
                accent={accent}
                icon="Mail"
                type="email"
              />
            )}
            <CField
              label={isLogin ? 'ЛОГИН ИЛИ EMAIL' : 'ЛОГИН'}
              placeholder={isLogin ? 'agent@archive.net' : 'nova_7'}
              value={isLogin ? form.login : form.username}
              onChange={v => set(isLogin ? 'login' : 'username', v)}
              accent={accent}
              icon="Terminal"
            />
            <CField
              label="ПАРОЛЬ"
              placeholder="••••••••"
              value={form.password}
              onChange={v => set('password', v)}
              accent={accent}
              icon="Lock"
              type="password"
            />

            {error && (
              <div className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/5 px-3 py-2">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-4 font-orbitron text-sm tracking-widest border-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                borderColor: accent,
                color: accent,
                backgroundColor: accent + '15',
                boxShadow: `0 0 25px ${accent}20`,
              }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> ПОДКЛЮЧЕНИЕ...</>
                : <><Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={16} /> {isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}</>
              }
            </button>
          </div>

          {/* Switch link */}
          <div className="text-center mt-5">
            <span className="text-gray-600 font-mono text-xs">
              {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            </span>
            <button
              onClick={() => onSwitch(isLogin ? 'register' : 'login')}
              className="font-mono text-xs transition-colors hover:underline"
              style={{ color: accent }}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>

          {/* Lore footnote */}
          <div className="mt-8 text-center font-mono text-[10px] text-gray-800">
            THE ARCHIVE · RESIST · CODEGRID-9 · 2087
          </div>
        </div>
      </div>
    </div>
  );
}

function CField({
  label, placeholder, value, onChange, accent, icon, type = 'text',
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; accent: string; icon: string; type?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon name={icon as 'User'} size={10} style={{ color: accent + '80' }} />
        <label className="font-mono text-[10px] tracking-wider" style={{ color: accent + '80' }}>{label}</label>
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { const btn = document.activeElement?.closest('form')?.querySelector('button[type=submit]') as HTMLElement; btn?.click(); } }}
        className="w-full bg-black/60 border px-3 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none transition-all"
        style={{ borderColor: accent + '30' }}
        onFocus={e => { e.target.style.borderColor = accent + '80'; e.target.style.boxShadow = `0 0 10px ${accent}15`; }}
        onBlur={e => { e.target.style.borderColor = accent + '30'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
