import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useGame, XpResult } from '@/lib/GameContext';
import { api } from '@/lib/api';
import { pushNotif } from '@/components/Notifications';
import { progress } from '@/lib/progressStore';
import { NPC, DialogChoice } from './types';

interface DialogEngineProps {
  npc: NPC;
  onClose: () => void;
}

export default function DialogEngine({ npc, onClose }: DialogEngineProps) {
  const { applyXpResult } = useGame();
  const [nodeId, setNodeId] = useState('start');
  const [lineIdx, setLineIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; creds: number; items: string[] }>({ xp: 0, creds: 0, items: [] });
  const [rewardSent, setRewardSent] = useState(false);

  // Записываем NPC в прогресс при первом открытии диалога
  useEffect(() => {
    progress.recordNpcSpoken(npc.id);
  }, [npc.id]);

  const node = npc.dialog.find(n => n.id === nodeId)!;
  const currentLine = node.lines[lineIdx];
  const canAdvance = lineIdx < node.lines.length - 1;
  const showChoices = !canAdvance && node.choices && !node.end;
  const isEnd = !canAdvance && node.end;

  const advance = () => {
    if (canAdvance) setLineIdx(i => i + 1);
  };

  const choose = async (choice: DialogChoice) => {
    let newRewards = rewards;
    if (choice.reward) {
      const r = choice.reward;
      newRewards = {
        xp: rewards.xp + (r.xp ?? 0),
        creds: rewards.creds + (r.creds ?? 0),
        items: r.item ? [...rewards.items, r.item] : rewards.items,
      };
      setRewards(newRewards);
    }
    setNodeId(choice.nextId);
    setLineIdx(0);
    const next = npc.dialog.find(n => n.id === choice.nextId);
    if (next?.end) {
      setFinished(true);
      // Выдаём накопленные награды на сервер (один раз)
      if (!rewardSent && (newRewards.xp > 0 || newRewards.creds > 0)) {
        setRewardSent(true);
        const res = await api.npcReward(npc.id, newRewards.xp, newRewards.creds);
        if (res && !res.error) {
          applyXpResult(res as XpResult);
          if (newRewards.xp > 0)
            pushNotif({ type: 'quest', title: `+${newRewards.xp} XP`, body: `Награда от ${npc.name}`, icon: '📜', color: npc.factionColor });
          if (res.leveled_up)
            pushNotif({ type: 'level', title: `LEVEL UP! → LVL ${res.new_level}`, body: 'Статы улучшены', icon: '⚡', color: '#00ff41' });
        }
      }
    }
  };

  return (
    <div className="border p-5 space-y-4 transition-all"
      style={{ borderColor: npc.factionColor + '40', backgroundColor: npc.factionColor + '05' }}>

      {/* NPC header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/8">
        {npc.img ? (
          <div className="w-14 h-14 overflow-hidden border flex-shrink-0"
            style={{ borderColor: npc.factionColor + '60', clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)' }}>
            <img src={npc.img} alt={npc.name} className="w-full h-full object-cover object-top" />
          </div>
        ) : (
          <div className="text-4xl">{npc.portrait}</div>
        )}
        <div>
          <div className="font-orbitron text-sm font-bold text-white">{npc.name}</div>
          <div className="font-mono text-[10px]" style={{ color: npc.factionColor + '90' }}>
            {npc.title} · {npc.location}
          </div>
        </div>
        <button onClick={onClose} className="ml-auto text-gray-600 hover:text-gray-400 transition-colors">
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Dialog box */}
      <div className="min-h-[120px]">
        {currentLine && (
          <div
            className={`border p-4 transition-all ${currentLine.speaker === 'npc' ? '' : 'ml-8'}`}
            style={{
              borderColor: currentLine.speaker === 'npc' ? npc.factionColor + '40' : '#ffffff20',
              backgroundColor: currentLine.speaker === 'npc' ? npc.factionColor + '08' : '#ffffff06',
            }}
          >
            <div className="font-mono text-[10px] mb-1.5"
              style={{ color: currentLine.speaker === 'npc' ? npc.factionColor : '#888' }}>
              {currentLine.speaker === 'npc' ? npc.name : 'АГЕНТ'}
            </div>
            <p className="font-rajdhani text-sm text-gray-200 leading-relaxed">{currentLine.text}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {canAdvance && (
        <button onClick={advance}
          className="w-full py-2.5 font-orbitron text-xs border transition-all"
          style={{ borderColor: npc.factionColor + '50', color: npc.factionColor, backgroundColor: npc.factionColor + '0a' }}>
          ПРОДОЛЖИТЬ ▶
        </button>
      )}

      {showChoices && (
        <div className="space-y-2">
          <div className="font-mono text-[10px] text-gray-600">// ВЫБЕРИ ОТВЕТ</div>
          {node.choices!.map((c, i) => (
            <button key={i} onClick={() => choose(c)}
              className="w-full text-left p-3 border transition-all hover:translate-x-1"
              style={{ borderColor: '#ffffff15', backgroundColor: 'transparent' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = npc.factionColor + '50'; (e.currentTarget as HTMLElement).style.backgroundColor = npc.factionColor + '08'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ffffff15'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
              <span className="font-mono text-[10px] mr-2" style={{ color: npc.factionColor + '60' }}>[{i + 1}]</span>
              <span className="font-rajdhani text-sm text-gray-300">{c.text}</span>
              {c.reward && (
                <span className="ml-2 font-mono text-[9px] text-cyber-yellow">
                  {c.reward.xp ? `+${c.reward.xp} XP` : ''}{c.reward.creds ? ` +${c.reward.creds}⚡` : ''}{c.reward.item ? ` +${c.reward.item}` : ''}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {(isEnd || finished) && (
        <div>
          {(rewards.xp > 0 || rewards.creds > 0 || rewards.items.length > 0) && (
            <div className="border border-cyber-yellow/30 bg-cyber-yellow/5 p-3 mb-3">
              <div className="font-mono text-[10px] text-gray-600 mb-1">// ПОЛУЧЕНО</div>
              <div className="font-orbitron text-sm text-cyber-yellow">
                {rewards.xp > 0 && `+${rewards.xp} XP `}
                {rewards.creds > 0 && `+${rewards.creds} Creds `}
                {rewards.items.map(i => `${i} `)}
              </div>
            </div>
          )}
          <button onClick={onClose}
            className="w-full py-2.5 font-orbitron text-xs border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all">
            ЗАВЕРШИТЬ РАЗГОВОР
          </button>
        </div>
      )}
    </div>
  );
}
