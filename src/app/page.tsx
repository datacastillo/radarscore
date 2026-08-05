'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/data/mockMatches';
import MatchCard from '@/components/MatchCard';
import MatchModal from '@/components/MatchModal';
import StandingsModal from '@/components/StandingsModal';
import { fetchRealMatches } from '@/services/footballApi';

const LEAGUES_LIST = [
  { id: 'TODAS', label: 'Todas las Ligas', flag: '🌐' },
  { id: 'Premier League', label: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'LaLiga', label: 'LaLiga', flag: '🇪🇸' },
  { id: 'Champions League', label: 'Champions League', flag: '🇪🇺' },
  { id: 'Bundesliga', label: 'Bundesliga', flag: '🇩🇪' },
  { id: 'Serie A', label: 'Serie A', flag: '🇮🇹' },
  { id: 'Eredivisie', label: 'Eredivisie', flag: '🇳🇱' },
  { id: 'Primeira Liga', label: 'Primeira Liga', flag: '🇵🇹' },
];

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedLeagueForTable, setSelectedLeagueForTable] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'EN VIVO' | 'AYER' | 'HOY' | 'MAÑANA' | 'PRÓXIMOS'>('PRÓXIMOS');
  const [selectedLeague, setSelectedLeague] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const realData = await fetchRealMatches();
      if (realData) {
        setMatches(realData);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  const categoryMap: Record<string, string> = {
    'EN VIVO': 'LIVE',
    'AYER': 'AYER',
    'HOY': 'HOY',
    'MAÑANA': 'MAÑANA',
    'PRÓXIMOS': 'PROXIMOS',
  };

  const currentCategoryValue = categoryMap[selectedCategory];

  // Filtrado por fecha
  const matchesByDate = matches.filter((m) => {
    if (selectedCategory === 'PRÓXIMOS') {
      return (m.dateCategory as string) === 'PROXIMOS' || m.dateCategory === 'MAÑANA' || m.dateCategory === 'HOY';
    }
    return m.dateCategory === currentCategoryValue;
  });

  // Función helper para contar partidos por liga
  const getLeagueMatchCount = (leagueId: string) => {
    if (leagueId === 'TODAS') return matchesByDate.length;
    return matchesByDate.filter((m) => {
      const matchLeagueName = m.league.toLowerCase();
      const filterLeague = leagueId.toLowerCase();
      if (filterLeague === 'laliga') return matchLeagueName.includes('laliga') || matchLeagueName.includes('primera');
      if (filterLeague === 'champions league') return matchLeagueName.includes('champions');
      return matchLeagueName.includes(filterLeague);
    }).length;
  };

  // Filtrar por Liga elegida y Buscador
  const filteredMatches = matchesByDate.filter((m) => {
    const matchLeagueName = m.league.toLowerCase();
    const filterLeague = selectedLeague.toLowerCase();

    let matchesLeague = false;

    if (selectedLeague === 'TODAS') {
      matchesLeague = true;
    } else if (filterLeague === 'laliga') {
      matchesLeague = matchLeagueName.includes('laliga') || matchLeagueName.includes('primera');
    } else if (filterLeague === 'champions league') {
      matchesLeague = matchLeagueName.includes('champions');
    } else {
      matchesLeague = matchLeagueName.includes(filterLeague);
    }

    const matchesSearch =
      searchQuery === '' ||
      m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.league.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLeague && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
          <h1 className="text-2xl font-black tracking-wider flex items-center gap-1.5">
            RADARSCORE <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AI</span>
          </h1>
        </div>

        {/* Filtros de Fecha */}
        <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs font-bold overflow-x-auto max-w-full scrollbar-none">
          {(['EN VIVO', 'AYER', 'HOY', 'MAÑANA', 'PRÓXIMOS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat === 'EN VIVO' && <span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-pulse" />}
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid Principal: Sidebar a la izquierda (en PC) + Contenido central */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR DE LIGAS (Visible en pantallas grandes lg) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-6 space-y-4">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-black tracking-wider text-zinc-400 uppercase mb-3 flex items-center justify-between">
              <span>🏆 Ligas Disponibles</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {matchesByDate.length} partidos
              </span>
            </h3>

            <nav className="space-y-1">
              {LEAGUES_LIST.map((league) => {
                const count = getLeagueMatchCount(league.id);
                const isActive = selectedLeague === league.id;

                return (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <span className="text-sm">{league.flag}</span>
                      <span className="truncate">{league.label}</span>
                    </span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          isActive
                            ? 'bg-black/20 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Banner Promocional / Widget Estadístico Breve en Sidebar */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/20 rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <span>🤖</span> RadarScore Intelligence
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Predicciones impulsadas por IA analizando posesión, xG, bajas y rachas oficiales.
            </p>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar equipo o liga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Filtros de Liga en modo Móvil (se ocultan en PC lg:hidden) */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-none">
            {LEAGUES_LIST.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedLeague === league.id
                    ? 'bg-zinc-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {league.flag} {league.label}
              </button>
            ))}
          </div>

          {/* Lista de Partidos */}
          {loading ? (
            <div className="py-20 text-center text-zinc-500 animate-pulse text-sm">
              Cargando partidos reales en tiempo real...
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
            <div className="py-16 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50 p-6">
              <p className="text-zinc-300 font-semibold text-sm">
                No hay partidos programados para la liga seleccionada.
              </p>
              <button
                onClick={() => { setSelectedLeague('TODAS'); setSelectedCategory('PRÓXIMOS'); }}
                className="mt-3 text-xs text-emerald-400 font-bold underline"
              >
                Ver todas las ligas
              </button>
            </div>
          )}
        </section>
      </div>

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