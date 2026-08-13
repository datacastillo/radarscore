'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  TrendingUp, 
  Flame, 
  Target, 
  Crown, 
  Search, 
  Loader2, 
  Medal,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart3,
  User
} from 'lucide-react';

interface TipsterProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  total_picks: number;
  win_rate: number;
  yield_rate: number;
  total_profit: number;
  streak?: number;
  rol?: string;
}

type SortOption = 'yield_rate' | 'win_rate' | 'total_profit' | 'total_picks';

export default function RankingPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<TipsterProfile[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('yield_rate');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPicksOnly, setMinPicksOnly] = useState(true); // Filtro para requerir mínimo 3 picks para el ranking oficial

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Consultar perfiles ordenados por la métrica seleccionada
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gt('total_picks', 0) // Solo usuarios con al menos 1 pick publicado
        .order(sortBy, { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error al cargar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por término de búsqueda y filtro de cualificación (ej: min 3 picks)
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (minPicksOnly) {
      return matchesSearch && (p.total_picks || 0) >= 3;
    }
    return matchesSearch;
  });

  const top3 = filteredProfiles.slice(0, 3);
  const remainingTipsters = filteredProfiles.slice(3);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return { color: 'from-amber-400 to-yellow-600', text: 'text-amber-400', border: 'border-amber-500/40', icon: Trophy, label: '1er Lugar' };
      case 1:
        return { color: 'from-slate-300 to-slate-500', text: 'text-slate-300', border: 'border-slate-400/40', icon: Medal, label: '2do Lugar' };
      case 2:
        return { color: 'from-amber-700 to-amber-900', text: 'text-amber-600', border: 'border-amber-700/40', icon: Award, label: '3er Lugar' };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Encabezado del Leaderboard */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0c0f17] via-[#0f1422] to-[#0c0f17] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold font-mono">
                <Trophy className="w-3.5 h-3.5" />
                <span>LEADERBOARD OFICIAL DE RADAR SCORE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ranking de Tipsters
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Compite con los mejores analistas de la comunidad. Las métricas de <strong className="text-emerald-400">Yield %</strong> y <strong className="text-emerald-400">Win Rate %</strong> se recalculan automáticamente con cada ticket verificado.
              </p>
            </div>

            {/* Selector de Criterio de Ordenamiento */}
            <div className="bg-[#06080e] p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1 shrink-0 w-full md:w-auto">
              <button
                onClick={() => setSortBy('yield_rate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sortBy === 'yield_rate'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Yield %</span>
              </button>

              <button
                onClick={() => setSortBy('win_rate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sortBy === 'win_rate'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Win Rate %</span>
              </button>

              <button
                onClick={() => setSortBy('total_profit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sortBy === 'total_profit'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Profit MXN</span>
              </button>

              <button
                onClick={() => setSortBy('total_picks')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  sortBy === 'total_picks'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Total Picks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Buscador y Filtro de Cualificación */}
        <div className="bg-[#0c0f17] border border-slate-800/90 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tipster por usuario o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#06080e] border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-medium"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer self-end sm:self-auto select-none">
            <input
              type="checkbox"
              checked={minPicksOnly}
              onChange={(e) => setMinPicksOnly(e.target.checked)}
              className="rounded bg-[#06080e] border-slate-800 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4"
            />
            <span>Mostrar solo tipsters con <strong className="text-slate-200">3+ picks</strong> verificado(s)</span>
          </label>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span>Cargando tabla de clasificación...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="bg-[#0c0f17] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <User className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No hay tipsters para mostrar</h3>
            <p className="text-xs text-slate-500">Intenta cambiar los filtros de búsqueda o desmarcar el requisito de picks mínimos.</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* SECCIÓN PODIO: TOP 3 TIPSTERS */}
            {top3.length > 0 && !searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
                {/* 2do Lugar (Izquierda en desktop) */}
                {top3[1] && (
                  <div className="order-2 md:order-1 bg-[#0c0f17] border border-slate-800/90 hover:border-slate-700 transition rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-3 right-3 bg-slate-400/10 border border-slate-400/30 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono flex items-center gap-1">
                      <Medal className="w-3 h-3 text-slate-300" /> #2 LUGAR
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 pt-2">
                      <div className="relative">
                        <img 
                          src={top3[1].avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={top3[1].username}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-400 shadow-md"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1 justify-center">
                          @{top3[1].username}
                          {top3[1].rol === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">{top3[1].full_name || 'Tipster Pro'}</p>
                      </div>
                    </div>

                    {/* Stats de #2 */}
                    <div className="grid grid-cols-2 gap-2 bg-[#06080e] p-3 rounded-2xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">YIELD</span>
                        <span className={`font-black ${top3[1].yield_rate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {top3[1].yield_rate > 0 ? `+${top3[1].yield_rate}%` : `${top3[1].yield_rate}%`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">WIN RATE</span>
                        <span className="font-bold text-white">{top3[1].win_rate}%</span>
                      </div>
                    </div>

                    <Link 
                      href={`/perfil/${top3[1].username}`}
                      className="bg-slate-800/60 hover:bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>Ver Historial</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* 1er Lugar (Centro - Destacado Oro) */}
                {top3[0] && (
                  <div className="order-1 md:order-2 bg-gradient-to-b from-[#141b2d] to-[#0c0f17] border-2 border-amber-500/50 hover:border-amber-400 transition rounded-3xl p-6 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden md:-translate-y-3">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
                    
                    <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-0.5 rounded-full text-[10px] font-black font-mono flex items-center gap-1 shadow-sm">
                      <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> #1 LIDER
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 pt-2">
                      <div className="relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Crown className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        </div>
                        <img 
                          src={top3[0].avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={top3[0].username}
                          className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl mt-2"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-1 justify-center">
                          @{top3[0].username}
                          {top3[0].rol === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{top3[0].full_name || 'Líder del Ranking'}</p>
                      </div>
                    </div>

                    {/* Stats de #1 */}
                    <div className="grid grid-cols-3 gap-2 bg-[#06080e] p-3 rounded-2xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono">YIELD</span>
                        <span className={`font-black text-sm ${top3[0].yield_rate >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {top3[0].yield_rate > 0 ? `+${top3[0].yield_rate}%` : `${top3[0].yield_rate}%`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono">WIN RATE</span>
                        <span className="font-extrabold text-xs text-white">{top3[0].win_rate}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-mono">PICKS</span>
                        <span className="font-extrabold text-xs text-slate-300">{top3[0].total_picks}</span>
                      </div>
                    </div>

                    <Link 
                      href={`/perfil/${top3[0].username}`}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-lg shadow-amber-500/20"
                    >
                      <span>Ver Perfil Completo</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* 3er Lugar (Derecha en desktop) */}
                {top3[2] && (
                  <div className="order-3 bg-[#0c0f17] border border-slate-800/90 hover:border-slate-700 transition rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-3 right-3 bg-amber-700/20 border border-amber-700/40 text-amber-500 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" /> #3 LUGAR
                    </div>

                    <div className="flex flex-col items-center text-center space-y-3 pt-2">
                      <div className="relative">
                        <img 
                          src={top3[2].avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={top3[2].username}
                          className="w-16 h-16 rounded-full object-cover border-2 border-amber-700 shadow-md"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1 justify-center">
                          @{top3[2].username}
                          {top3[2].rol === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">{top3[2].full_name || 'Tipster Pro'}</p>
                      </div>
                    </div>

                    {/* Stats de #3 */}
                    <div className="grid grid-cols-2 gap-2 bg-[#06080e] p-3 rounded-2xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">YIELD</span>
                        <span className={`font-black ${top3[2].yield_rate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {top3[2].yield_rate > 0 ? `+${top3[2].yield_rate}%` : `${top3[2].yield_rate}%`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-mono">WIN RATE</span>
                        <span className="font-bold text-white">{top3[2].win_rate}%</span>
                      </div>
                    </div>

                    <Link 
                      href={`/perfil/${top3[2].username}`}
                      className="bg-slate-800/60 hover:bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      <span>Ver Historial</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TABLA GENERAL DE TIPSTERS (#4 EN ADELANTE) */}
            <div className="bg-[#0c0f17] border border-slate-800/90 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800/80 bg-[#090c13] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  TABLA GENERAL DE CLASIFICACIÓN
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {filteredProfiles.length} TIPSTERS ACTIVOS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500 font-mono text-[10px] uppercase bg-[#06080e]/50">
                      <th className="py-3 px-4 text-center">Pos</th>
                      <th className="py-3 px-4">Tipster</th>
                      <th className="py-3 px-4 text-center">Picks</th>
                      <th className="py-3 px-4 text-center">Win Rate %</th>
                      <th className="py-3 px-4 text-center">Yield %</th>
                      <th className="py-3 px-4 text-right">Profit Est.</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                    {filteredProfiles.map((profile, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3 && !searchQuery;

                      return (
                        <tr 
                          key={profile.id}
                          className={`hover:bg-slate-800/30 transition ${isTop3 ? 'bg-slate-900/20' : ''}`}
                        >
                          {/* Posición */}
                          <td className="py-3.5 px-4 text-center font-bold font-mono">
                            {rank === 1 ? (
                              <span className="text-amber-400">🥇 #1</span>
                            ) : rank === 2 ? (
                              <span className="text-slate-300">🥈 #2</span>
                            ) : rank === 3 ? (
                              <span className="text-amber-600">🥉 #3</span>
                            ) : (
                              <span className="text-slate-500">#{rank}</span>
                            )}
                          </td>

                          {/* Avatar + Usuario */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                                alt={profile.username} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white text-xs flex items-center gap-1">
                                  <span>@{profile.username}</span>
                                  {profile.rol === 'admin' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                                </div>
                                <div className="text-[10px] text-slate-500">{profile.full_name || 'Tipster'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Total Picks */}
                          <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                            {profile.total_picks || 0}
                          </td>

                          {/* Win Rate */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                            {profile.win_rate || 0}%
                          </td>

                          {/* Yield % */}
                          <td className="py-3.5 px-4 text-center font-mono font-black">
                            <span className={`px-2 py-0.5 rounded ${
                              (profile.yield_rate || 0) > 0 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : (profile.yield_rate || 0) < 0 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'text-slate-400'
                            }`}>
                              {(profile.yield_rate || 0) > 0 ? `+${profile.yield_rate}%` : `${profile.yield_rate || 0}%`}
                            </span>
                          </td>

                          {/* Profit Estimate */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            <span className={(profile.total_profit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {(profile.total_profit || 0) >= 0 ? `+$${profile.total_profit || 0}` : `-$${Math.abs(profile.total_profit || 0)}`} MXN
                            </span>
                          </td>

                          {/* Enlace Perfil */}
                          <td className="py-3.5 px-4 text-center">
                            <Link 
                              href={`/perfil/${profile.username}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}