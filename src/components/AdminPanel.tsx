import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { adminApi } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  total_users: number; new_today: number; total_characters: number;
  active_sessions: number; battles_today: number; total_lessons_done: number;
  avg_level: number; max_level: number; min_level: number;
  class_distribution: { class: string; count: number }[];
  registrations_7d: { date: string; count: number }[];
}

interface Player {
  user_id: number; username: string; email: string;
  is_admin: boolean; created_at: string;
  char_name: string | null; char_class: string | null;
  char_level: number | null; char_xp: number | null;
  char_coins: number | null; char_chapter: number | null;
}

interface Item {
  id: number; name: string; description: string | null;
  type: string; rarity: string; stat_bonus: Record<string, number>;
  price: number; drop_weight: number;
}

const RARITY_COLOR: Record<string, string> = {
  common: '#aaa', uncommon: '#00ff41', rare: '#00aaff', epic: '#aa00ff', legendary: '#ffaa00',
};
const CLASS_COLOR: Record<string, string> = {
  cipher: '#00ff41', data_ghost: '#00aaff', neural_architect: '#aa00ff',
  hacker: '#00ff41', netrunner: '#00aaff', street_samurai: '#aa00ff',
};

// ─── Auth gate ────────────────────────────────────────────────────────────────

function AdminAuthGate({ onAuth }: { onAuth: (secret: string) => void }) {
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    if (!secret.trim()) return;
    setLoading(true);
    setError('');
    const res = await adminApi.stats(secret.trim());
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      sessionStorage.setItem('admin_secret', secret.trim());
      onAuth(secret.trim());
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm p-8 border border-red-500/30"
        style={{ backgroundColor: '#050a0e', boxShadow: '0 0 60px rgba(255,0,0,0.08)' }}>
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] text-red-500/60 tracking-widest mb-2">// RESTRICTED ACCESS</div>
          <h1 className="font-orbitron text-2xl text-white font-black">
            ADMIN <span className="text-red-500">PANEL</span>
          </h1>
          <div className="font-mono text-[10px] text-gray-600 mt-1">CodeRPG · Only for administrators</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-mono text-[10px] text-gray-600 mb-2 tracking-widest">// СЕКРЕТНЫЙ КЛЮЧ</div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full bg-black/60 border border-red-500/30 px-4 py-3 font-mono text-sm text-white placeholder-gray-700 outline-none focus:border-red-500/60 transition-colors"
            />
          </div>

          {error && (
            <div className="font-mono text-xs text-red-400 border border-red-500/30 bg-red-500/5 px-3 py-2">
              ⚠ {error}
            </div>
          )}

          <button onClick={login} disabled={loading}
            className="w-full py-3 font-orbitron text-sm border border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50 tracking-widest">
            {loading ? 'ПРОВЕРКА...' : 'ВОЙТИ В СИСТЕМУ'}
          </button>
        </div>

        <div className="mt-6 text-center font-mono text-[9px] text-gray-700">
          Несанкционированный доступ запрещён
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

type AdminTab = 'stats' | 'players' | 'items';

export default function AdminPanel() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem('admin_secret') || '');
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<AdminTab>('stats');

  // Stats
  const [stats, setStats]         = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Players
  const [players, setPlayers]     = useState<Player[]>([]);
  const [playersTotal, setPlayersTotal] = useState(0);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  // Items
  const [items, setItems]         = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editItem, setEditItem]   = useState<Item | null>(null);
  const [newItem, setNewItem]     = useState(false);
  const [itemForm, setItemForm]   = useState<Partial<Item & { stat_bonus_str: string }>>({});

  // Toast
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Initial check ──
  useEffect(() => {
    if (secret) {
      adminApi.stats(secret).then(res => {
        if (!res.error) setAuthed(true);
      });
    }
  }, []);

  // ── Load data on tab change ──
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await adminApi.stats(secret);
    setStatsLoading(false);
    if (!res.error) setStats({
      ...res,
      class_distribution: res.class_distribution || [],
      registrations_7d: res.registrations_7d || [],
    });
  }, [secret]);

  const loadPlayers = useCallback(async (search = '') => {
    setPlayersLoading(true);
    const res = await adminApi.players(secret, { search, limit: 50 });
    setPlayersLoading(false);
    if (!res.error) { setPlayers(res.players || []); setPlayersTotal(res.total || 0); }
  }, [secret]);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    const res = await adminApi.items(secret);
    setItemsLoading(false);
    if (!res.error) setItems(res.items || []);
  }, [secret]);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'stats')   loadStats();
    if (tab === 'players') loadPlayers();
    if (tab === 'items')   loadItems();
  }, [tab, authed]);

  if (!authed) {
    return <AdminAuthGate onAuth={s => { setSecret(s); setAuthed(true); }} />;
  }

  // ── Actions ──

  const handleBanPlayer = async (p: Player) => {
    if (!confirm(`Завершить все сессии для ${p.username}?`)) return;
    const res = await adminApi.playerBan(secret, p.user_id);
    if (res.ok) { showToast(`Сессии ${p.username} завершены`); loadPlayers(playerSearch); }
    else showToast(res.error, false);
  };

  const handleSavePlayerEdit = async () => {
    if (!editPlayer) return;
    const numFields: Record<string, unknown> = {};
    Object.entries(editFields).forEach(([k, v]) => {
      numFields[k] = isNaN(Number(v)) ? v : Number(v);
    });
    const res = await adminApi.playerEdit(secret, editPlayer.user_id, numFields);
    if (res.ok) {
      showToast('Персонаж обновлён');
      setEditPlayer(null);
      loadPlayers(playerSearch);
    } else showToast(res.error, false);
  };

  const handleDeleteItem = async (item: Item) => {
    if (!confirm(`Удалить "${item.name}"? Предмет снимется со всех персонажей.`)) return;
    const res = await adminApi.itemDelete(secret, item.id);
    if (res.ok) { showToast(`${item.name} удалён`); loadItems(); }
    else showToast(res.error, false);
  };

  const handleSaveItem = async () => {
    let bonusObj: Record<string, number> = {};
    try {
      if (itemForm.stat_bonus_str) bonusObj = JSON.parse(itemForm.stat_bonus_str);
    } catch {
      showToast('Неверный JSON бонусов', false); return;
    }

    const data = {
      name:        itemForm.name,
      description: itemForm.description || '',
      type:        itemForm.type,
      rarity:      itemForm.rarity,
      price:       Number(itemForm.price || 0),
      drop_weight: Number(itemForm.drop_weight || 100),
      stat_bonus:  bonusObj,
    };

    let res;
    if (newItem) {
      res = await adminApi.itemCreate(secret, data);
    } else {
      res = await adminApi.itemUpdate(secret, { id: editItem!.id, ...data });
    }

    if (res.ok || res.id) {
      showToast(newItem ? 'Предмет создан' : 'Предмет обновлён');
      setEditItem(null); setNewItem(false); setItemForm({});
      loadItems();
    } else showToast(res.error || 'Ошибка', false);
  };

  const openEditItem = (item: Item) => {
    setNewItem(false);
    setEditItem(item);
    setItemForm({
      ...item,
      stat_bonus_str: JSON.stringify(item.stat_bonus, null, 2),
    });
  };

  const openNewItem = () => {
    setEditItem(null);
    setNewItem(true);
    setItemForm({ name: '', type: 'weapon', rarity: 'common', price: 100, drop_weight: 100, stat_bonus_str: '{}' });
  };

  const logout = () => {
    sessionStorage.removeItem('admin_secret');
    setAuthed(false);
    setSecret('');
  };

  return (
    <div className="min-h-screen bg-[#030608] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 border font-mono text-sm animate-fade-in-up
          ${toast.ok ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-red-500/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-mono text-[9px] text-red-500/50 tracking-widest">// ADMIN PANEL</div>
            <h1 className="font-orbitron text-xl font-black">
              CODE<span className="text-red-500">RPG</span> ADMIN
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 border border-green-500/30 bg-green-500/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[9px] text-green-500">ONLINE</span>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 font-mono text-xs text-red-500/60 hover:text-red-500 transition-colors border border-red-500/20 hover:border-red-500/50 px-3 py-1.5">
          <Icon name="LogOut" size={12} />
          ВЫЙТИ
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/5 px-6">
        <div className="flex gap-0">
          {([
            { id: 'stats',   label: 'Дашборд',   icon: 'BarChart2' },
            { id: 'players', label: 'Игроки',     icon: 'Users' },
            { id: 'items',   label: 'Предметы',   icon: 'Package' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-3 font-mono text-xs transition-all border-b-2"
              style={{
                color: tab === t.id ? '#ff4060' : '#555',
                borderBottomColor: tab === t.id ? '#ff4060' : 'transparent',
                backgroundColor: tab === t.id ? '#ff406008' : 'transparent',
              }}>
              <Icon name={t.icon} size={13} />
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* ══ TAB: STATS ══ */}
        {tab === 'stats' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-orbitron text-lg text-white">ОБЩАЯ СТАТИСТИКА</h2>
              <button onClick={loadStats} disabled={statsLoading}
                className="flex items-center gap-2 font-mono text-xs border border-white/10 px-3 py-1.5 text-gray-500 hover:text-white transition-colors">
                <Icon name="RefreshCw" size={12} className={statsLoading ? 'animate-spin' : ''} />
                ОБНОВИТЬ
              </button>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* KPI grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Всего юзеров',  value: stats.total_users,        color: '#00aaff', icon: '👥' },
                    { label: 'Новых сегодня', value: stats.new_today,           color: '#00ff41', icon: '🆕' },
                    { label: 'Персонажей',    value: stats.total_characters,    color: '#aa00ff', icon: '🎮' },
                    { label: 'Акт. сессий',   value: stats.active_sessions,     color: '#ffaa00', icon: '🔗' },
                    { label: 'Боёв сегодня',  value: stats.battles_today,       color: '#ff4060', icon: '⚔️' },
                    { label: 'Уроков всего',  value: stats.total_lessons_done,  color: '#00ff41', icon: '📚' },
                  ].map(s => (
                    <div key={s.label}
                      className="border p-4 text-center"
                      style={{ borderColor: s.color + '25', backgroundColor: s.color + '06' }}>
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="font-orbitron text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                      <div className="font-mono text-[9px] text-gray-600 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Level stats */}
                  <div className="border border-white/8 p-5">
                    <div className="font-mono text-[10px] text-gray-600 mb-4 tracking-widest">// УРОВНИ ИГРОКОВ</div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Средний', value: stats.avg_level, color: '#00ffff' },
                        { label: 'Максимум', value: stats.max_level, color: '#00ff41' },
                        { label: 'Минимум', value: stats.min_level, color: '#ff4060' },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <div className="font-orbitron text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                          <div className="font-mono text-[9px] text-gray-600 mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Class distribution */}
                  <div className="border border-white/8 p-5">
                    <div className="font-mono text-[10px] text-gray-600 mb-4 tracking-widest">// КЛАССЫ ПЕРСОНАЖЕЙ</div>
                    <div className="space-y-2">
                      {stats.class_distribution.map(c => {
                        const total = stats.class_distribution.reduce((a, b) => a + b.count, 0);
                        const pct = total ? Math.round((c.count / total) * 100) : 0;
                        const col = CLASS_COLOR[c.class] || '#aaa';
                        return (
                          <div key={c.class} className="flex items-center gap-3">
                            <div className="font-mono text-[10px] w-36 text-gray-400 truncate">{c.class}</div>
                            <div className="flex-1 h-2 bg-black/60">
                              <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: col }} />
                            </div>
                            <div className="font-orbitron text-xs w-8 text-right" style={{ color: col }}>{c.count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Reg chart */}
                {stats.registrations_7d.length > 0 && (
                  <div className="border border-white/8 p-5">
                    <div className="font-mono text-[10px] text-gray-600 mb-4 tracking-widest">// РЕГИСТРАЦИИ ЗА 7 ДНЕЙ</div>
                    <div className="flex items-end gap-2 h-24">
                      {stats.registrations_7d.map(r => {
                        const maxVal = Math.max(...stats.registrations_7d.map(x => x.count), 1);
                        const h = Math.max(4, Math.round((r.count / maxVal) * 96));
                        return (
                          <div key={r.date} className="flex-1 flex flex-col items-center gap-1">
                            <div className="font-orbitron text-[9px] text-green-400">{r.count}</div>
                            <div className="w-full bg-green-500/30 hover:bg-green-500/50 transition-colors"
                              style={{ height: `${h}px` }} title={`${r.date}: ${r.count}`} />
                            <div className="font-mono text-[8px] text-gray-700">{r.date.slice(5)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 font-mono text-gray-600">Нет данных</div>
            )}
          </div>
        )}

        {/* ══ TAB: PLAYERS ══ */}
        {tab === 'players' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-orbitron text-lg text-white">
                ИГРОКИ <span className="text-gray-600 font-mono text-sm">{playersTotal}</span>
              </h2>
              <div className="flex items-center gap-2">
                <input
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadPlayers(playerSearch)}
                  placeholder="Поиск по нику/email..."
                  className="bg-black/60 border border-white/10 px-3 py-2 font-mono text-xs text-white placeholder-gray-700 outline-none focus:border-white/30 w-48"
                />
                <button onClick={() => loadPlayers(playerSearch)}
                  className="font-mono text-xs border border-white/15 px-3 py-2 text-gray-500 hover:text-white transition-colors">
                  НАЙТИ
                </button>
                <button onClick={() => loadPlayers('')}
                  className="font-mono text-xs border border-white/10 px-3 py-2 text-gray-600 hover:text-gray-400 transition-colors">
                  СБРОС
                </button>
              </div>
            </div>

            {playersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="border border-white/5 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_1fr_80px_80px_100px_120px] gap-px bg-white/5 text-[9px] font-mono text-gray-600 tracking-widest">
                  {['ПОЛЬЗОВАТЕЛЬ', 'ПЕРСОНАЖ', 'УРОВЕНЬ', 'МОНЕТЫ', 'ДАТА', 'ДЕЙСТВИЯ'].map(h => (
                    <div key={h} className="bg-black/80 px-3 py-2">{h}</div>
                  ))}
                </div>

                {players.map((p, i) => (
                  <div key={p.user_id}
                    className="grid grid-cols-[1fr_1fr_80px_80px_100px_120px] gap-px bg-white/3"
                    style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#ffffff03' }}>

                    {/* User */}
                    <div className="bg-[#030608] px-3 py-3">
                      <div className="flex items-center gap-2">
                        {p.is_admin && <span className="text-[9px] text-red-500 font-mono border border-red-500/30 px-1">ADM</span>}
                        <span className="font-mono text-xs text-white truncate">{p.username}</span>
                      </div>
                      <div className="font-mono text-[9px] text-gray-600 truncate mt-0.5">{p.email}</div>
                    </div>

                    {/* Character */}
                    <div className="bg-[#030608] px-3 py-3">
                      {p.char_name ? (
                        <>
                          <div className="font-mono text-xs text-white truncate">{p.char_name}</div>
                          <div className="font-mono text-[9px] mt-0.5" style={{ color: CLASS_COLOR[p.char_class || ''] || '#aaa' }}>
                            {p.char_class}
                          </div>
                        </>
                      ) : (
                        <span className="font-mono text-[9px] text-gray-700">нет персонажа</span>
                      )}
                    </div>

                    {/* Level */}
                    <div className="bg-[#030608] px-3 py-3 font-orbitron text-sm text-yellow-400">
                      {p.char_level ?? '—'}
                    </div>

                    {/* Coins */}
                    <div className="bg-[#030608] px-3 py-3 font-mono text-xs text-gray-400">
                      {p.char_coins ?? '—'}
                    </div>

                    {/* Date */}
                    <div className="bg-[#030608] px-3 py-3 font-mono text-[9px] text-gray-600">
                      {p.created_at.slice(0, 10)}
                    </div>

                    {/* Actions */}
                    <div className="bg-[#030608] px-2 py-2 flex items-center gap-1.5">
                      <button
                        onClick={() => { setEditPlayer(p); setEditFields({ level: String(p.char_level ?? 1), xp: '0', coins: String(p.char_coins ?? 0) }); }}
                        className="p-1.5 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Редактировать">
                        <Icon name="Edit2" size={11} />
                      </button>
                      <button
                        onClick={() => setSelectedPlayer(p)}
                        className="p-1.5 border border-white/10 text-gray-500 hover:text-white transition-colors"
                        title="Детали">
                        <Icon name="Eye" size={11} />
                      </button>
                      {!p.is_admin && (
                        <button
                          onClick={() => handleBanPlayer(p)}
                          className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Завершить сессии">
                          <Icon name="UserX" size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {players.length === 0 && (
                  <div className="text-center py-12 font-mono text-gray-600 text-sm">
                    Игроки не найдены
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: ITEMS ══ */}
        {tab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-lg text-white">
                ПРЕДМЕТЫ <span className="text-gray-600 font-mono text-sm">{items.length}</span>
              </h2>
              <button onClick={openNewItem}
                className="flex items-center gap-2 font-mono text-xs border border-green-500/50 text-green-500 hover:bg-green-500/10 px-4 py-2 transition-colors">
                <Icon name="Plus" size={13} />
                СОЗДАТЬ ПРЕДМЕТ
              </button>
            </div>

            {itemsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(item => {
                  const col = RARITY_COLOR[item.rarity] || '#aaa';
                  return (
                    <div key={item.id}
                      className="border p-4 transition-all group"
                      style={{ borderColor: col + '30', backgroundColor: col + '05' }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-rajdhani text-sm font-semibold" style={{ color: col }}>{item.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[9px] px-1.5 py-0.5 border"
                              style={{ color: col, borderColor: col + '40' }}>{item.rarity.toUpperCase()}</span>
                            <span className="font-mono text-[9px] text-gray-600">{item.type.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="font-orbitron text-xs text-yellow-400">#{item.id}</div>
                      </div>

                      {item.description && (
                        <div className="font-mono text-[9px] text-gray-600 mb-2 leading-relaxed">{item.description}</div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(item.stat_bonus).filter(([,v]) => v).map(([k,v]) => (
                          <span key={k} className="font-mono text-[9px] text-gray-500">+{v} {k}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="font-mono text-[9px] text-gray-600">
                          💰 {item.price} · вес {item.drop_weight}
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditItem(item)}
                            className="p-1.5 border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                            <Icon name="Edit2" size={11} />
                          </button>
                          <button onClick={() => handleDeleteItem(item)}
                            className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors">
                            <Icon name="Trash2" size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ MODAL: Edit Player ══ */}
      {editPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-blue-500/30 bg-[#030608] p-6"
            style={{ boxShadow: '0 0 40px #0088ff15' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-orbitron text-white">РЕДАКТИРОВАТЬ ИГРОКА</h3>
              <button onClick={() => setEditPlayer(null)} className="text-gray-600 hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 border border-white/5 bg-white/2">
              <div className="font-mono text-xs text-white">{editPlayer.username}</div>
              <div className="font-mono text-[10px] text-gray-600">{editPlayer.char_name} · {editPlayer.char_class}</div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { key: 'level',   label: 'Уровень', type: 'number' },
                { key: 'xp',      label: 'XP',      type: 'number' },
                { key: 'coins',   label: 'Монеты',  type: 'number' },
                { key: 'hp',      label: 'HP',      type: 'number' },
                { key: 'max_hp',  label: 'Макс HP', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <div className="font-mono text-[10px] text-gray-600 mb-1">{f.label}</div>
                  <input
                    type={f.type}
                    value={editFields[f.key] ?? ''}
                    onChange={e => setEditFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-black/60 border border-white/10 px-3 py-2 font-mono text-sm text-white outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleSavePlayerEdit}
                className="flex-1 py-2.5 font-orbitron text-xs border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-all">
                СОХРАНИТЬ
              </button>
              <button onClick={() => setEditPlayer(null)}
                className="px-4 py-2.5 font-mono text-xs border border-white/10 text-gray-600 hover:text-gray-400 transition-colors">
                ОТМЕНА
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Player detail ══ */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-white/10 bg-[#030608] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-orbitron text-white">ПРОФИЛЬ ИГРОКА</h3>
              <button onClick={() => setSelectedPlayer(null)} className="text-gray-600 hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between"><span className="text-gray-600">ID</span><span className="text-white">{selectedPlayer.user_id}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Ник</span><span className="text-white">{selectedPlayer.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="text-white text-xs truncate">{selectedPlayer.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Персонаж</span><span className="text-white">{selectedPlayer.char_name ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Класс</span><span style={{ color: CLASS_COLOR[selectedPlayer.char_class || ''] || '#aaa' }}>{selectedPlayer.char_class ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Уровень</span><span className="text-yellow-400 font-black">{selectedPlayer.char_level ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">XP</span><span className="text-cyan-400">{selectedPlayer.char_xp ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Монеты</span><span className="text-yellow-400">{selectedPlayer.char_coins ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Глава</span><span className="text-white">{selectedPlayer.char_chapter ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Регистрация</span><span className="text-gray-400 text-xs">{selectedPlayer.created_at.slice(0, 10)}</span></div>
              {selectedPlayer.is_admin && <div className="text-center font-orbitron text-red-500 text-xs border border-red-500/30 py-1">АДМИНИСТРАТОР</div>}
            </div>
            <button onClick={() => setSelectedPlayer(null)}
              className="mt-5 w-full font-mono text-xs border border-white/10 py-2 text-gray-600 hover:text-gray-400 transition-colors">
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      )}

      {/* ══ MODAL: Item form ══ */}
      {(editItem || newItem) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg border border-green-500/30 bg-[#030608] p-6 my-4"
            style={{ boxShadow: '0 0 40px #00ff4108' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-orbitron text-white">{newItem ? 'СОЗДАТЬ ПРЕДМЕТ' : 'РЕДАКТИРОВАТЬ ПРЕДМЕТ'}</h3>
              <button onClick={() => { setEditItem(null); setNewItem(false); }} className="text-gray-600 hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'name',        label: 'Название',     type: 'text' },
                { key: 'description', label: 'Описание',     type: 'text' },
                { key: 'price',       label: 'Цена',         type: 'number' },
                { key: 'drop_weight', label: 'Вес дропа',    type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <div className="font-mono text-[10px] text-gray-600 mb-1">{f.label}</div>
                  <input type={f.type}
                    value={(itemForm as Record<string, unknown>)[f.key] as string ?? ''}
                    onChange={e => setItemForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-black/60 border border-white/10 px-3 py-2 font-mono text-sm text-white outline-none focus:border-green-500/40"
                  />
                </div>
              ))}

              {/* Type select */}
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-1">Слот</div>
                <select value={itemForm.type ?? 'weapon'}
                  onChange={e => setItemForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-black border border-white/10 px-3 py-2 font-mono text-sm text-white outline-none focus:border-green-500/40">
                  {['head','body','weapon','gloves','boots','implant'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Rarity select */}
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-1">Редкость</div>
                <select value={itemForm.rarity ?? 'common'}
                  onChange={e => setItemForm(p => ({ ...p, rarity: e.target.value }))}
                  className="w-full bg-black border border-white/10 px-3 py-2 font-mono text-sm text-white outline-none focus:border-green-500/40"
                  style={{ color: RARITY_COLOR[itemForm.rarity || 'common'] }}>
                  {['common','uncommon','rare','epic','legendary'].map(r => (
                    <option key={r} value={r} style={{ color: RARITY_COLOR[r] }}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Stat bonus JSON */}
              <div>
                <div className="font-mono text-[10px] text-gray-600 mb-1">
                  Бонусы к статам (JSON) — пример: {`{"strength":5,"intelligence":3}`}
                </div>
                <textarea
                  value={itemForm.stat_bonus_str ?? '{}'}
                  onChange={e => setItemForm(p => ({ ...p, stat_bonus_str: e.target.value }))}
                  rows={3}
                  className="w-full bg-black/60 border border-white/10 px-3 py-2 font-mono text-xs text-green-400 outline-none focus:border-green-500/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveItem}
                className="flex-1 py-2.5 font-orbitron text-xs border border-green-500 text-green-400 hover:bg-green-500/10 transition-all">
                {newItem ? 'СОЗДАТЬ' : 'СОХРАНИТЬ'}
              </button>
              <button onClick={() => { setEditItem(null); setNewItem(false); }}
                className="px-4 py-2.5 font-mono text-xs border border-white/10 text-gray-600 hover:text-gray-400 transition-colors">
                ОТМЕНА
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}