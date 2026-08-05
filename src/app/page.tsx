'use client';

import { useState } from 'react';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';
import MatchCard from '@/components/MatchCard';
import MatchModal from '@/components/MatchModal';

export default function Home() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between py-4 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-200 to-emerald-400 bg-clip-text text-transparent">
            RADARSCORE<span className="text-emerald-500 text-xs align-super ml-1">AI</span>
          </h1>
        </div>

        <div className="flex gap-2 text-xs font-semibold bg-zinc-900/80 p-1 rounded-lg border border-white/5">
          <button className="px-3 py-1.5 rounded-md bg-zinc-800 text-white">AYER</button>
          <button className="px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HOY</button>
          <button className="px-3 py-1.5 rounded-md hover:bg-zinc-800/50 text-zinc-400">MAÑANA</button>
        </div>
      </header>

      {/* Feed de Partidos */}
      <section className="space-y-6">
        {MOCK_MATCHES.map((match) => (
          <div key={match.id} onClick={() => setSelectedMatch(match)} className="cursor-pointer">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 tracking-wider uppercase border-l-2 border-emerald-500 pl-3 mb-3">
              <span>{match.flag} {match.league}</span>
              <span className="text-emerald-400 hover:underline">Ver Análisis 📊</span>
            </div>
            <MatchCard match={match} />
          </div>
        ))}
      </section>

      {/* Modal Avanzado */}
      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </main>
  );
}