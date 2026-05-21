import { NPC } from './types';

interface Props {
  npc: NPC;
  locked: boolean;
  active: boolean;
  onClick: () => void;
}

export default function NpcCard({ npc, locked, active, onClick }: Props) {
  return (
    <div
      className={`border p-4 transition-all ${!locked ? 'cursor-pointer hover:translate-x-1' : 'opacity-50 cursor-not-allowed'}`}
      style={{
        borderColor: active ? npc.factionColor + '70' : locked ? '#ffffff08' : npc.factionColor + '30',
        backgroundColor: active ? npc.factionColor + '08' : 'transparent',
        borderLeftWidth: active ? '3px' : '1px',
      }}
      onClick={() => !locked && onClick()}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{locked ? '🔒' : npc.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron text-sm font-bold text-white">{npc.name}</div>
          <div className="font-mono text-[10px] mt-0.5" style={{ color: npc.factionColor + '90' }}>{npc.title}</div>
          <div className="font-mono text-[9px] text-gray-700 mt-0.5">{npc.location}</div>
        </div>
      </div>
      {locked && (
        <div className="font-mono text-[9px] text-gray-700 mt-2">🔒 Откроется на LVL {npc.unlockLevel}</div>
      )}
      {!locked && (
        <p className="font-rajdhani text-xs text-gray-600 mt-2 leading-snug">{npc.desc}</p>
      )}
    </div>
  );
}
