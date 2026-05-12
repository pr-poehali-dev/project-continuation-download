import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

// ─── Типы ──────────────────────────────────────────────────────────────────

export type NotifType = 'achievement' | 'quest' | 'level' | 'item' | 'system';

export interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  icon: string;
  color: string;
  ts: number;
  read: boolean;
}

// ─── Глобальная шина событий ───────────────────────────────────────────────

type Listener = (n: Notif) => void;
const listeners: Listener[] = [];

export function pushNotif(n: Omit<Notif, 'id' | 'ts' | 'read'>) {
  const full: Notif = { ...n, id: `n_${Date.now()}_${Math.random()}`, ts: Date.now(), read: false };
  listeners.forEach(l => l(full));
}

export function onNotif(fn: Listener) {
  listeners.push(fn);
  return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
}

// ─── Константы ─────────────────────────────────────────────────────────────

const TYPE_META: Record<NotifType, { icon: string; color: string; label: string }> = {
  achievement: { icon: '🏆', color: '#ffff00', label: 'Достижение' },
  quest:       { icon: '📜', color: '#00aaff', label: 'Квест'      },
  level:       { icon: '⚡', color: '#00ff41', label: 'Уровень'    },
  item:        { icon: '💎', color: '#aa00ff', label: 'Предмет'    },
  system:      { icon: '🔔', color: '#00ffff', label: 'Система'    },
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин. назад`;
  return `${Math.floor(s / 3600)} ч. назад`;
}

// ─── Toast — всплывающий попап ─────────────────────────────────────────────

interface ToastProps { notif: Notif; onDone: () => void }

function Toast({ notif, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="flex items-start gap-3 border px-4 py-3 pointer-events-auto animate-fade-in-up shadow-2xl"
      style={{
        borderColor: notif.color + '60',
        backgroundColor: '#050a0efa',
        boxShadow: `0 0 30px ${notif.color}20`,
        minWidth: '300px',
        maxWidth: '380px',
      }}
    >
      <div className="text-2xl flex-shrink-0 mt-0.5">{notif.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[10px]" style={{ color: notif.color }}>
            {TYPE_META[notif.type].label.toUpperCase()}
          </span>
        </div>
        <div className="font-orbitron text-sm text-white font-bold">{notif.title}</div>
        <div className="font-rajdhani text-xs text-gray-400 mt-0.5 leading-tight">{notif.body}</div>
      </div>
      <button onClick={onDone} className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0 mt-0.5">
        <Icon name="X" size={12} />
      </button>
    </div>
  );
}

// ─── Toast container (вставляй в Index) ────────────────────────────────────

export function ToastContainer() {
  const [toasts, setToasts] = useState<Notif[]>([]);

  useEffect(() => {
    return onNotif(n => setToasts(prev => [...prev.slice(-3), n]));
  }, []);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} notif={t} onDone={() => remove(t.id)} />
      ))}
    </div>
  );
}

// ─── NotificationCenter (полный экран) ────────────────────────────────────

const SAMPLE_NOTIFS: Notif[] = [
  { id: '1', type: 'system',      title: 'Добро пожаловать, агент!', body: 'The Archive ждало тебя. Начни с первого урока или изучи карту города.', icon: '🔔', color: '#00ffff', ts: Date.now() - 60000, read: false },
  { id: '2', type: 'quest',       title: 'Новый квест', body: 'Пробуждение агента: The Archive завербовало тебя. Пройди первый урок.', icon: '📜', color: '#00aaff', ts: Date.now() - 120000, read: false },
  { id: '3', type: 'achievement', title: 'Первый вход', body: 'Ты вошёл в CodeGrid-9. Система зарегистрировала нового агента.', icon: '🏆', color: '#ffff00', ts: Date.now() - 300000, read: true },
];

export default function NotificationCenter() {
  const [notifs, setNotifs] = useState<Notif[]>(SAMPLE_NOTIFS);
  const [filter, setFilter] = useState<NotifType | 'all'>('all');

  useEffect(() => {
    return onNotif(n => setNotifs(prev => [n, ...prev]));
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const remove = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const unreadCount = notifs.filter(n => !n.read).length;
  const filtered = notifs.filter(n => filter === 'all' || n.type === filter);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-3xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-5 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">
              // ЦЕНТР УВЕДОМЛЕНИЙ
            </div>
            <h2 className="font-orbitron text-2xl text-white">
              ВХОДЯЩИЕ{' '}
              {unreadCount > 0 && (
                <span className="font-orbitron text-sm text-cyber-green border border-cyber-green/40 px-2 py-0.5 ml-2">
                  {unreadCount} новых
                </span>
              )}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="font-mono text-xs px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all">
              Прочитать все
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          <button onClick={() => setFilter('all')}
            className="font-mono text-[10px] px-3 py-1.5 border transition-all"
            style={{ borderColor: filter === 'all' ? '#00ffff' : '#ffffff12', color: filter === 'all' ? '#00ffff' : '#555', backgroundColor: filter === 'all' ? '#00ffff10' : 'transparent' }}>
            ВСЕ ({notifs.length})
          </button>
          {(Object.keys(TYPE_META) as NotifType[]).map(t => {
            const count = notifs.filter(n => n.type === t).length;
            if (!count) return null;
            return (
              <button key={t} onClick={() => setFilter(t)}
                className="font-mono text-[10px] px-3 py-1.5 border transition-all"
                style={{ borderColor: filter === t ? TYPE_META[t].color : '#ffffff12', color: filter === t ? TYPE_META[t].color : '#555', backgroundColor: filter === t ? TYPE_META[t].color + '10' : 'transparent' }}>
                {TYPE_META[t].icon} {TYPE_META[t].label} ({count})
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="border border-white/5 p-8 text-center font-mono text-xs text-gray-700">
              // Нет уведомлений
            </div>
          )}
          {filtered.map(n => (
            <div
              key={n.id}
              className={`border p-4 flex items-start gap-4 transition-all ${n.read ? 'opacity-60' : ''}`}
              style={{ borderColor: n.read ? '#ffffff10' : n.color + '40', backgroundColor: n.read ? 'transparent' : n.color + '06' }}
              onClick={() => markRead(n.id)}
            >
              {/* Unread dot */}
              {!n.read && (
                <div className="absolute -ml-1 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.color }} />
              )}

              <div className="text-2xl flex-shrink-0">{n.icon}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 border"
                    style={{ color: n.color, borderColor: n.color + '40', backgroundColor: n.color + '08' }}>
                    {TYPE_META[n.type].label}
                  </span>
                  <span className="font-mono text-[10px] text-gray-700">{timeAgo(n.ts)}</span>
                </div>
                <div className="font-orbitron text-sm text-white font-bold">{n.title}</div>
                <div className="font-rajdhani text-sm text-gray-500 mt-0.5 leading-snug">{n.body}</div>
              </div>

              <button
                onClick={e => { e.stopPropagation(); remove(n.id); }}
                className="text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 font-mono text-[10px] text-gray-800 text-center">
          THE ARCHIVE · INCOMING · CODEGRID-9
        </div>
      </div>
    </section>
  );
}
