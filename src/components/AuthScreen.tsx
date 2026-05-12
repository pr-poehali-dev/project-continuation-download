import { useState, useEffect } from 'react';
import { useGame } from '@/lib/GameContext';
import Icon from '@/components/ui/icon';

// GDD: CodeGrid-9, 2087 — Python запрещён, нетраннеры в подполье
const LORE_LINES = [
  '> ПОДКЛЮЧЕНИЕ К UNDERNET_HUB...',
  '> ШИФРОВАНИЕ КАНАЛА... [OK]',
  '> ОБХОД NEXUS-FIREWALL... [OK]',
  '> ВЫ ВОШЛИ В ПОДПОЛЬЕ THE ARCHIVE',
  '> PYTHON НЕ ЗАПРЕЩЁН ЗДЕСЬ',
];

type AuthTab = 'login' | 'register';

export default function AuthScreen() {
  const [tab, setTab] = useState<AuthTab>('login');
  const [form, setForm] = useState({ username: '', email: '', login: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, loading } = useGame();

  const set = (k: string, v: string) => {
    setError('');
    setForm(f => ({ ...f, [k]: v }));
  };

  const submit = async () => {
    setError('');
    let result;
    if (tab === 'login') {
      result = await login(form.login, form.password);
    } else {
      result = await register(form.username, form.email, form.password);
    }
    if (result.error) setError(result.error);
  };

  const [bootLine, setBootLine] = useState(0);
  useEffect(() => {
    if (bootLine < LORE_LINES.length) {
      const t = setTimeout(() => setBootLine(l => l + 1), 320);
      return () => clearTimeout(t);
    }
  }, [bootLine]);

  return (
    <div className="min-h-screen bg-cyber-dark relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute inset-0 scanlines pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyber-cyan/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-magenta/3 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-cyber-cyan/10">
        <div className="flex items-center gap-3">
          <div className="font-orbitron text-2xl font-black tracking-wider">
            <span className="text-cyber-cyan">CODE</span><span className="text-cyber-magenta">RPG</span>
          </div>
          <div className="hidden lg:block font-mono text-[10px] text-gray-700 border border-gray-800 px-2 py-0.5">
            v2.087 · CODEGRID-9
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`px-5 py-2 font-orbitron text-xs tracking-wider transition-all border ${
              tab === 'login'
                ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            ВОЙТИ
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`px-5 py-2 font-orbitron text-xs tracking-wider transition-all border ${
              tab === 'register'
                ? 'border-cyber-magenta text-cyber-magenta bg-cyber-magenta/10'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            РЕГИСТРАЦИЯ
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 flex min-h-[calc(100vh-65px)]">
        {/* Left hero */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-20 py-10">
          {/* Boot terminal */}
          <div className="mb-6 font-mono text-xs space-y-0.5 h-[80px]">
            {LORE_LINES.slice(0, bootLine).map((line, i) => (
              <div key={i} className={i === bootLine - 1 ? 'text-cyber-cyan' : 'text-gray-700'}>{line}</div>
            ))}
          </div>

          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-3 uppercase">
            // 2087 · Мегаполис CodeGrid-9 · Python вне закона
          </div>
          <h1 className="font-orbitron text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
            НАПИШИ КОД.<br />
            <span className="text-cyber-cyan">ИЗМЕНИ</span>{' '}
            <span className="text-cyber-magenta">СИСТЕМУ</span><span className="text-white">.</span>
          </h1>
          <p className="text-gray-500 font-rajdhani text-base lg:text-lg leading-relaxed mb-7 max-w-lg">
            Корпорация NEXUS запретила Python. Но The Archive не сдаётся.
            Стань нетраннером — каждая строка кода это удар по системе.
          </p>

          {/* Factions strip */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { name: 'NEXUS', color: '#ff4060', desc: 'Антагонист' },
              { name: 'THE ARCHIVE', color: '#00ff41', desc: 'Сопротивление' },
              { name: 'BLACK SYNTAX', color: '#aa00ff', desc: 'Синдикат' },
              { name: 'ORDER OF CLEAN CODE', color: '#00ffff', desc: 'Секта' },
            ].map(f => (
              <div key={f.name} className="border px-2.5 py-1 font-mono text-[10px]"
                style={{ borderColor: f.color + '40', color: f.color + 'cc' }}>
                {f.name}
              </div>
            ))}
          </div>

          <div className="flex gap-8 mb-10">
            {[{ label: '4', sub: 'акта сюжета' }, { label: '3', sub: 'класса персонажа' }, { label: '100+', sub: 'предметов' }].map(s => (
              <div key={s.sub}>
                <div className="font-orbitron text-2xl text-cyber-cyan font-black">{s.label}</div>
                <div className="text-gray-700 font-mono text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* 3 class previews */}
          <div className="flex gap-4">
            {[
              { img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/c57f7ff6-a3a7-4783-8f10-0d9d80a09f23.jpg', name: 'Hacker', color: '#00ff41' },
              { img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/2fd8ffba-85dd-4b30-aba1-ceb9dd168a5e.jpg', name: 'Python-Junior', color: '#ff00ff' },
              { img: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ba390b4d-c17b-4e41-933f-463af7aa414a.jpg', name: 'Py-Backend', color: '#6644ff' },
            ].map(c => (
              <div key={c.name} className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-20 lg:w-20 lg:h-24 overflow-hidden border transition-all"
                  style={{ borderColor: c.color + '50', boxShadow: `0 0 16px ${c.color}20` }}>
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover object-top" />
                </div>
                <span className="font-orbitron text-[10px]" style={{ color: c.color }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right form — desktop */}
        <div className="hidden lg:flex items-center justify-center px-12 py-12 w-[460px]">
          <div className="w-full">
            <AuthFormPanel tab={tab} form={form} set={set} error={error} loading={loading} onSubmit={submit} onSwitch={setTab} />
          </div>
        </div>
      </div>

      {/* Mobile form pinned to bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-4 bg-cyber-dark/98 border-t border-white/5">
        <AuthFormPanel tab={tab} form={form} set={set} error={error} loading={loading} onSubmit={submit} onSwitch={setTab} compact />
      </div>
    </div>
  );
}

function AuthFormPanel({
  tab, form, set, error, loading, onSubmit, onSwitch, compact = false,
}: {
  tab: AuthTab;
  form: Record<string, string>;
  set: (k: string, v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: () => void;
  onSwitch: (t: AuthTab) => void;
  compact?: boolean;
}) {
  const accent = tab === 'login' ? '#00ffff' : '#ff00ff';

  return (
    <div className="cyber-panel p-6" style={{ borderColor: accent + '30' }}>
      <div className={`mb-5 ${compact ? 'hidden' : ''}`}>
        <h2 className="font-orbitron text-xl text-white mb-1">
          {tab === 'login' ? 'ВХОД В СИСТЕМУ' : 'РЕГИСТРАЦИЯ'}
        </h2>
        <div className="font-mono text-xs" style={{ color: accent + 'aa' }}>
          {tab === 'login' ? '// введи свои данные' : '// создай аккаунт'}
        </div>
      </div>

      <div className="space-y-3">
        {tab === 'register' && (
          <>
            <CyberField label="ИМЯ ХАКЕРА" placeholder="nova_x1" value={form.username} onChange={v => set('username', v)} accent={accent} />
            <CyberField label="EMAIL" type="email" placeholder="you@neon.city" value={form.email} onChange={v => set('email', v)} accent={accent} />
          </>
        )}
        {tab === 'login' && (
          <CyberField label="ЛОГИН ИЛИ EMAIL" placeholder="nova_x1" value={form.login} onChange={v => set('login', v)} accent={accent} />
        )}
        <CyberField label="ПАРОЛЬ" type="password" placeholder="••••••••" value={form.password}
          onChange={v => set('password', v)} onEnter={onSubmit} accent={accent} />
      </div>

      {error && (
        <div className="mt-3 p-2.5 border border-red-500/40 bg-red-500/8 text-red-400 font-mono text-xs">
          ⚠ {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full mt-4 py-3 font-orbitron text-sm tracking-wider border transition-all
          flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: accent, color: accent, backgroundColor: accent + '15' }}
      >
        {loading
          ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          : <><Icon name="Zap" size={14} />{tab === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'}</>
        }
      </button>

      <div className="mt-3 text-center text-gray-600 font-mono text-xs">
        {tab === 'login'
          ? <span>Нет аккаунта?{' '}<button onClick={() => onSwitch('register')} style={{ color: '#ff00ff' }} className="hover:underline">Регистрация</button></span>
          : <span>Уже есть аккаунт?{' '}<button onClick={() => onSwitch('login')} style={{ color: '#00ffff' }} className="hover:underline">Войти</button></span>
        }
      </div>
    </div>
  );
}

function CyberField({ label, type = 'text', placeholder, value, onChange, onEnter, accent }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  onEnter?: () => void; accent: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-widest mb-1" style={{ color: accent + '99' }}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        onFocus={e => { e.currentTarget.style.borderColor = accent + '80'; e.currentTarget.style.boxShadow = `0 0 10px ${accent}20`; }}
        onBlur={e => { e.currentTarget.style.borderColor = accent + '30'; e.currentTarget.style.boxShadow = 'none'; }}
        className="w-full bg-black/50 border text-white font-mono text-sm px-3 py-2.5
          focus:outline-none placeholder:text-gray-700 transition-all"
        style={{ borderColor: accent + '30' }}
      />
    </div>
  );
}