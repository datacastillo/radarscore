'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { fetchRealMatches } from '@/services/footballApi';
import { Match } from '@/data/mockMatches';
import MatchCard from '@/components/MatchCard';
import MatchModal from '@/components/MatchModal';
import PickOfTheDay from '@/components/PickOfTheDay';
import { 
  Bot, 
  Trophy, 
  Calendar, 
  Loader2, 
  Share2,
  ArrowUpRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

interface StandingTeam {
  position: number;
  team: {
    id: number;
    name: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

const LEAGUES = [
  { id: 'PL', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', code: 'PL' },
  { id: 'PD', name: 'LaLiga Santander', flag: '🇪🇸', code: 'PD' },
  { id: 'CL', name: 'Champions League', flag: '🇪🇺', code: 'CL' },
  { id: 'SA', name: 'Serie A', flag: '🇮🇹', code: 'SA' },
  { id: 'BL1', name: 'Bundesliga', flag: '🇩🇪', code: 'BL1' },
];

export default function PartidosPage() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [activeTab, setActiveTab] = useState<'matches' | 'standings'>('matches');

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [loadingStandings, setLoadingStandings] = useState(false);

  const [selectedMatchForAI, setSelectedMatchForAI] = useState<Match | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (activeTab === 'standings') {
      loadStandings(selectedLeague);
    }
  }, [activeTab, selectedLeague]);

  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      const data = await fetchRealMatches();
      if (data) setMatches(data);
    } catch (err) {
      console.error('Error cargando partidos:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadStandings = async (leagueCode: string) => {
    setLoadingStandings(true);
    try {
      const res = await fetch(`/api/standings?league=${leagueCode}`);
      if (res.ok) {
        const data = await res.json();
        // Se filtra explícitamente por type === 'TOTAL': en competiciones
        // con fase de grupos (ej. Champions League) la respuesta trae VARIAS
        // tablas (una por grupo), y standings[0] podía ser cualquier grupo
        // al azar en vez de la tabla general.
        const totalTable = Array.isArray(data.standings)
          ? data.standings.find((s: any) => s.type === 'TOTAL') || data.standings[0]
          : null;

        if (totalTable?.table) {
          setStandings(totalTable.table);
        } else {
          setStandings([]);
        }
      }
    } catch (err) {
      console.error('Error cargando tabla de posiciones:', err);
      setStandings([]);
    } finally {
      setLoadingStandings(false);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (selectedLeague === 'PL') return m.league?.includes('PREMIER') || m.flag === '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
      // Football-data.org llama a La Liga "Primera Division", no "LaLiga".
      if (selectedLeague === 'PD') return m.league?.includes('LALIGA') || m.league?.includes('PRIMERA') || m.flag === '🇪🇸';
      // "Championship" (2da división inglesa) contiene "CHAMPIONS" como
      // substring, por eso se usa "CHAMPIONS LEAGUE" completo para no
      // confundirlas.
      if (selectedLeague === 'CL') return m.league?.includes('CHAMPIONS LEAGUE') || m.flag === '🇪🇺';
      if (selectedLeague === 'SA') return m.league?.includes('SERIE') || m.flag === '🇮🇹';
      if (selectedLeague === 'BL1') return m.league?.includes('BUNDESLIGA') || m.flag === '🇩🇪';
      return true;
    });
  }, [matches, selectedLeague]);

  const currentLeagueObj = LEAGUES.find(l => l.id === selectedLeague) || LEAGUES[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black pb-12">
      
      {/* HEADER PRINCIPAL */}
      <section className="border-b border-slate-800/80 bg-[#0c0f17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">Centro de Partidos & Ligas</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Bot className="w-3 h-3" /> GEMINI AI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Análisis cuantitativo de probabilidad, marcadores y tablas en vivo.
              </p>
            </div>

            <Link
              href="/comunidad"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 self-start sm:self-auto border border-slate-700 cursor-pointer"
            >
              <span>Ir a Comunidad</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>
          </div>

          {/* Selector de Ligas Principal */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-4 text-xs">
            {LEAGUES.map(league => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-2 shrink-0 border cursor-pointer ${
                  selectedLeague === league.id
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-[#06080e] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>{league.flag}</span>
                <span>{league.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENIDO CENTRAL */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">

        {/* NAVEGACIÓN ENTRE SECCIONES: PARTIDOS vs TABLA DE POSICIONES */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Partidos & Señales IA</span>
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'standings'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Tabla de Posiciones</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs font-mono font-bold text-slate-500">
            {currentLeagueObj.flag} {currentLeagueObj.name}
          </span>
        </div>

        {/* VISTA 1: PARTIDOS Y SEÑALES IA */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {loadingMatches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-44 bg-[#0c0f17] border border-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Pick del Día — destaca el mejor partido de TODA la cartelera,
                    sin importar la liga seleccionada arriba */}
                {matches.length > 0 && (
                  <PickOfTheDay matches={matches} onSelectMatch={setSelectedMatchForAI} />
                )}

                {filteredMatches.length === 0 ? (
                  <div className="bg-[#0c0f17] border border-slate-800/80 rounded-2xl p-10 text-center space-y-2">
                    <BarChart3 className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">No hay partidos agendados hoy para {currentLeagueObj.name}.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMatches.map(match => (
                      <div key={match.id} className="space-y-2">
                        <MatchCard match={match} onSelect={setSelectedMatchForAI} />
                        <Link
                          href="/comunidad"
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-800"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Publicar este pick en Comunidad</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* VISTA 2: TABLA DE POSICIONES EN VIVO */}
        {activeTab === 'standings' && (
          <div className="bg-[#0c0f17] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-[#090c14]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span>Tabla Oficial: {currentLeagueObj.name}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                EN VIVO
              </span>
            </div>

            {loadingStandings ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Cargando clasificación oficial...</p>
              </div>
            ) : standings.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <ShieldAlert className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">No se pudo cargar la tabla de posiciones para esta liga.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead className="bg-[#06080e] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Equipo</th>
                      <th className="py-3 px-2 text-center">PJ</th>
                      <th className="py-3 px-2 text-center">G</th>
                      <th className="py-3 px-2 text-center">E</th>
                      <th className="py-3 px-2 text-center">P</th>
                      <th className="py-3 px-2 text-center">DG</th>
                      <th className="py-3 px-4 text-right font-bold text-emerald-400">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {standings.map((row) => (
                      <tr key={row.team.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400 text-[11px]">
                          {row.position}
                        </td>
                        <td className="py-3 px-4 font-bold flex items-center gap-2.5">
                          {row.team.crest && (
                            <img src={row.team.crest} alt="" className="w-4 h-4 object-contain" />
                          )}
                          <span className="truncate max-w-[150px] sm:max-w-[200px]">{row.team.name}</span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-slate-400">{row.playedGames}</td>
                        <td className="py-3 px-2 text-center font-mono text-emerald-400">{row.won}</td>
                        <td className="py-3 px-2 text-center font-mono text-amber-400">{row.draw}</td>
                        <td className="py-3 px-2 text-center font-mono text-rose-400">{row.lost}</td>
                        <td className="py-3 px-2 text-center font-mono text-slate-300">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL DE ANÁLISIS DE IA — componente compartido, ya blindado
          (requiere sesión, sanitiza inputs, rate-limit) */}
      {selectedMatchForAI && (
        <MatchModal match={selectedMatchForAI} onClose={() => setSelectedMatchForAI(null)} />
      )}

    </div>
  );
}