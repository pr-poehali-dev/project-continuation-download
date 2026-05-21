import { useState } from 'react';
import { useGame } from '@/lib/GameContext';
import { NPC, NPCS } from './npc-dialog/types';
import NpcCard from './npc-dialog/NpcCard';
import DialogEngine from './npc-dialog/DialogEngine';

// ─── Главный экран NPC ───────────────────────────────────────────────────────

export default function NpcDialog() {
  const { character } = useGame();
  const playerLevel = character?.level || 1;
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);

  return (
    <section className="py-8 px-4 lg:px-6 min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">

        <div className="mb-5">
          <div className="font-mono text-[10px] text-gray-600 tracking-widest mb-1">// NPC · АГЕНТЫ CODEGRID-9</div>
          <h2 className="font-orbitron text-2xl text-white">
            КОНТАКТЫ <span className="text-cyber-cyan">THE ARCHIVE</span>
          </h2>
          <p className="text-gray-600 font-mono text-xs mt-1">Говори с агентами, узнавай лор, получай квесты и награды</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* NPC list */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
            {NPCS.map(npc => (
              <NpcCard
                key={npc.id}
                npc={npc}
                locked={playerLevel < npc.unlockLevel}
                active={activeNpc?.id === npc.id}
                onClick={() => setActiveNpc(npc)}
              />
            ))}
          </div>

          {/* Dialog panel */}
          <div className="flex-1 min-w-0">
            {activeNpc ? (
              <DialogEngine
                key={activeNpc.id}
                npc={activeNpc}
                onClose={() => setActiveNpc(null)}
              />
            ) : (
              <div className="border border-white/8 p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '400px' }}>
                <div className="text-5xl mb-4">💬</div>
                <div className="font-orbitron text-lg text-gray-600 mb-2">ВЫБЕРИ АГЕНТА</div>
                <p className="text-gray-700 font-mono text-xs max-w-xs leading-relaxed">
                  Кликни на персонажа слева, чтобы начать разговор. Диалоги дают XP, Creds и лор мира.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
