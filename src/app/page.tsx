'use client';

import { useState, useEffect } from 'react';
import { MOCK_MATCHES, Match } from '@/data/mockMatches';
import MatchCard from '@/components/MatchCard';
import MatchModal from '@/components/MatchModal';
import StandingsModal from '@/components/StandingsModal';
import { fetchRealMatches } from '@/services/footballApi';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedLeagueForTable, setSelectedLeagueForTable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'EN VIVO' | 'AYER' | 'HOY' | 'MAÑANA'>('MAÑANA');
  const [selectedLeague, setSelectedLeague] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const realData = await fetchRealMatches();
      if (realData && realData.length > 0) {
        setMatches(realData);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  // Mapeo de categoría a la propiedad dateCategory
  const categoryMap: Record<string, string> = {
    'EN VIVO': 'LIVE',
    'AYER': 'AYER',
    'HOY': 'HOY',
    'MAÑANA': 'MAÑANA',
  };

  const currentCategoryValue = categoryMap[selectedCategory];

  // Comprobar si hay partidos estrictamente para la categoría seleccionada
  const strictMatches = matches.filter((m) => m.dateCategory === currentCategoryValue);

  // Si se selecciona MAÑANA u HOY y no hay partidos estrictos ese día, mostramos los PROXIMOS
  const isShowingUpcomingFallback =
    strictMatches.length === 0 && (selectedCategory === 'MAÑANA' || selectedCategory === 'HOY');

  const matchesToFilter = isShowingUpcomingFallback
    ? matches.filter((m) => (m.dateCategory as string) === 'PROXIMOS' || m.dateCategory === currentCategoryValue)
    : strictMatches;

  // Filtrar por Liga y Búsqueda por texto
  const filteredMatches = matchesToFilter.filter((m) => {
    const matchesLeague =
      selectedLeague === 'TODAS' ||
      m.league.toLowerCase().includes(selectedLeague.toLowerCase());

    const matchesSearch =
      searchQuery === '' ||
      m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.league.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLeague && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
          <h1 className="text-2xl font-black tracking-wider flex items-center gap-1.5">
            RADARSCORE <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AI</span>
          </h1>
        </div>

        {/* Filtros de Fecha */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
          {(['EN VIVO', 'AYER', 'HOY', 'MAÑANA'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat === 'EN VIVO' && <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse" />}
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Buscador */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar equipo o liga real..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3 pl-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {/* Filtros de Liga */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {[
          { id: 'TODAS', label: '🌐 Todas las Ligas' },
          { id: 'Premier League', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' },
          { id: 'LaLiga', label: '🇪🇸 LaLiga' },
          { id: 'Champions League', label: '🇪🇺 Champions League' },
        ].map((league) => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedLeague === league.id
                ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:text-zinc-200'
            }`}
          >
            {league.label}
          </button>
        ))}
      </div>

      {/* Banner Informativo si no hay partidos justo ese día */}
      {isShowingUpcomingFallback && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-3">
          <span className="text-lg">📅</span>
          <div>
            <p className="font-bold">No hay partidos programados para {selectedCategory.toLowerCase()}.</p>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Mostrando los próximos encuentros confirmados en el calendario oficial de la liga:
            </p>
          </div>
        </div>
      )}

      {/* Lista de Partidos */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 animate-pulse text-sm">
          Cargando partidos en tiempo real...
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div key={match.id}>
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-extrabold tracking-wider text-zinc-400 flex items-center gap-2">
                  <span>{match.flag}</span>
                  <span>{match.league}</span>
                </span>
                <button
                  onClick={() => setSelectedLeagueForTable(match.league)}
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Ver Tabla 📊
                </button>
              </div>
              <MatchCard match={match} onSelect={(m) => setSelectedMatch(m)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
          <p className="text-zinc-400 font-medium text-sm">No se encontraron partidos para este filtro.</p>
        </div>
      )}

      {/* Modales */}
      {selectedMatch && (
        <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      {selectedLeagueForTable && (
        <StandingsModal
          leagueName={selectedLeagueForTable}
          onClose={() => setSelectedLeagueForTable(null)}
        />
      )}
    </main>
  );
}