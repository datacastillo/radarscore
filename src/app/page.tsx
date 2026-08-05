'use client';

import { useState } from 'react';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';
import MatchCard from '@/components/MatchCard';
import MatchModal from '@/components/MatchModal';

type FilterType = 'AYER' | 'HOY' | 'MAÑANA' | 'LIVE';

const LEAGUES = [
  { id: 'ALL', name: 'Todas las Ligas', flag: '🌍' },
  { id: 'PREMIER', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'LALIGA', name: 'LaLiga', flag: '🇪🇸' },
  { id: 'CHAMPIONS', name: 'Champions League', flag: '🇪🇺' },
];

export default function Home() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('HOY');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtrado combinado: Fecha/Estado + Liga + Búsqueda por texto
  const filteredMatches = MOCK_MATCHES.filter((match) => {
    // 1. Filtro por Estado/Fecha
    const matchesDate = activeFilter === 'LIVE' ? match.status === 'LIVE' : match.dateCategory === activeFilter;

    // 2. Filtro por Liga
    const matchesLeague =
      selectedLeague === 'ALL' ||
      (selectedLeague === 'PREMIER' && match.league.includes('PREMIER')) ||
      (selectedLeague === 'LALIGA' && match.league.includes('LALIGA')) ||
      (selectedLeague === 'CHAMPIONS' && match.league.includes('CHAMPIONS'));

    // 3. Filtro por Búsqueda (Equipo o Liga)
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(query) ||
      match.awayTeam.name.toLowerCase().includes(query) ||
      match.league.toLowerCase().includes(query);

    return matchesDate && matchesLeague && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header Principal */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-200 to-emerald-400 bg-clip-text text-transparent">
            RADARSCORE<span className="text-emerald-500 text-xs align-super ml-1">AI</span>
          </h1>
        </div>

        {/* Filtros por Tiempo */}
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

      {/* Controles de Búsqueda y Ligas */}
      <div className="space-y-4 mb-8">
        {/* Input de Búsqueda */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar equipo (ej. Arsenal, Madrid, PSG)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Chips de Selección de Liga */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedLeague === league.id
                  ? 'bg-zinc-800 text-white border-emerald-500/50'
                  : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:border-white/20'
              }`}
            >
              {league.flag} {league.name}
            </button>
          ))}
        </div>
      </div>

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
            <p className="text-zinc-400 text-sm font-medium">No se encontraron partidos para esta búsqueda.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLeague('ALL');
                setActiveFilter('HOY');
              }}
              className="mt-3 text-xs text-emerald-400 hover:underline font-semibold"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </section>

      {/* Modal Avanzado */}
      <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </main>
  );
}