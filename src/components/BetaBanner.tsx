import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  version?: string;
}

export default function BetaBanner({ version = '0.1.0' }: Props) {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('coderp_beta_dismissed') === version
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'idea' | 'praise'>('idea');
  const [sent, setSent] = useState(false);

  const dismiss = () => {
    localStorage.setItem('coderp_beta_dismissed', version);
    setDismissed(true);
  };

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    // Открываем Telegram с сообщением
    const msg = encodeURIComponent(`[CodeRPG Beta ${version}] [${feedbackType.toUpperCase()}] ${feedback}`);
    window.open(`https://t.me/+QgiLIa1gFRY4Y2Iy`, '_blank');
    setSent(true);
    setTimeout(() => { setShowFeedback(false); setSent(false); setFeedback(''); }, 2000);
  };

  if (dismissed) {
    // Мини-кнопка фидбека в углу
    return (
      <>
        <button
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 font-mono text-[10px] px-3 py-2 border border-cyber-cyan/40 bg-black/80 text-cyber-cyan hover:border-cyber-cyan transition-all backdrop-blur-sm"
          title="Оставить отзыв о бета-версии">
          <Icon name="MessageSquare" size={12} />
          BETA {version}
        </button>
        {showFeedback && <FeedbackModal version={version} onClose={() => setShowFeedback(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-cyber-cyan/30 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              <span className="font-orbitron text-[10px] text-cyber-cyan tracking-widest">BETA {version}</span>
            </div>
            <span className="text-gray-700 font-mono text-[10px]">·</span>
            <span className="font-mono text-[10px] text-gray-500 hidden sm:block">
              Закрытое бета-тестирование CodeRPG. Нашёл баг или есть идея?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFeedback(true)}
              className="font-mono text-[10px] px-3 py-1 border border-cyber-cyan/50 text-cyber-cyan hover:border-cyber-cyan hover:bg-cyber-cyan/10 transition-all">
              ✉ ОБРАТНАЯ СВЯЗЬ
            </button>
            <button onClick={dismiss} className="text-gray-600 hover:text-gray-400 transition-colors p-1">
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>
      </div>

      {showFeedback && <FeedbackModal version={version} onClose={() => setShowFeedback(false)} />}
    </>
  );
}

function FeedbackModal({ version, onClose }: { version: string; onClose: () => void }) {
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState<'bug' | 'idea' | 'praise'>('idea');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!feedback.trim()) return;
    const msg = encodeURIComponent(`[CodeRPG Beta ${version}]\nТип: ${type === 'bug' ? '🐛 Баг' : type === 'idea' ? '💡 Идея' : '🌟 Похвала'}\n\n${feedback}`);
    window.open(`https://t.me/+QgiLIa1gFRY4Y2Iy`, '_blank');
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-cyber-cyan/40 bg-[#050a0e] p-6 animate-fade-in-up"
        style={{ boxShadow: '0 0 40px #00ffff15' }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-mono text-[10px] text-gray-600 mb-0.5">// БЕТА {version}</div>
            <h3 className="font-orbitron text-lg text-white">ОБРАТНАЯ СВЯЗЬ</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-4">
          {([
            { id: 'bug', label: '🐛 Баг', color: '#ff4060' },
            { id: 'idea', label: '💡 Идея', color: '#00ffff' },
            { id: 'praise', label: '🌟 Хорошо', color: '#00ff41' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className="flex-1 py-2 font-mono text-[10px] border transition-all"
              style={{
                borderColor: type === t.id ? t.color : '#333',
                color: type === t.id ? t.color : '#555',
                backgroundColor: type === t.id ? t.color + '12' : 'transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder={
            type === 'bug' ? 'Опиши что произошло и как воспроизвести...' :
            type === 'idea' ? 'Что бы ты добавил или улучшил?' :
            'Что понравилось? Что работает хорошо?'
          }
          rows={4}
          className="w-full bg-black/60 border border-white/10 px-4 py-3 font-mono text-xs text-white placeholder-gray-700 outline-none resize-none focus:border-cyber-cyan/50 transition-colors mb-4"
        />

        {sent ? (
          <div className="text-center font-orbitron text-cyber-green text-sm py-2">
            ✓ Открываем Telegram сообщество...
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={send}
              className="flex-1 py-3 font-orbitron text-xs border border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 transition-all">
              ОТПРАВИТЬ В TELEGRAM
            </button>
            <button onClick={onClose}
              className="px-4 py-3 font-mono text-xs border border-white/10 text-gray-600 hover:text-gray-400 transition-colors">
              ОТМЕНА
            </button>
          </div>
        )}

        <div className="mt-3 text-center font-mono text-[10px] text-gray-700">
          Сообщество: t.me/+QgiLIa1gFRY4Y2Iy · Поддержка: poehali.dev/help
        </div>
      </div>
    </div>
  );
}
