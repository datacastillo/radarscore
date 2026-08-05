'use client';

import { useState } from 'react';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';
import MatchCard from '@/components/MatchCard';
import MatchModal from '@/components/MatchModal';

type FilterType = 'AYER' | 'HOY' | 'MAÑANA' | 'LIVE';

export default function Home() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('HOY');

  // Filtrado reactivo de partidos
  const filteredMatches = MOCK_MATCHES.filter((match) => {
    if (activeFilter === 'LIVE') return match.status === 'LIVE';
    return match.dateCategory === activeFilter;
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-200 to-emerald-400 bg-clip-text text-transparent">
            RADARSCORE<span className="text-emerald-500 text-xs align-super ml-1">AI</span>
          </h1>
        </div>

        {/* Filtros Activos */}
        <div className="flex gap-1.5 text-xs font-semibold bg-zinc-900/80 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveFilter('LIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'LIVE'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            EN VIVO
          </button>

          {(['AYER', 'HOY', 'MAÑANA'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === tab
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Feed de Partidos */}
      <section className="space-y-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div key={match.id} onClick={() => setSelectedMatch(match)} className="cursor-pointer">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 tracking-wider uppercase border-l-2 border-emerald-500 pl-3 mb-3">
                <span>{match.flag} {match.league}</span>
                <span className="text-emerald-400 hover:underline">Ver Análisis 📊</span>
              </div>
              <MatchCard match={match} />
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-white/5">
            <p className="text-zinc-400 text-sm">No hay partidos programados para esta categoría.</p>
          </div>
        )}
      </section>

      {/* Modal Avanzado */}
      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </main>
  );
}