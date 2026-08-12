'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Loader2,
  DollarSign,
  ArrowUpRight,
  Zap
} from 'lucide-react';

interface Tipster {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  yield_rate: number;
  win_rate: number;
  total_profit: number;
  total_picks: number;
}

export default function RankingPage() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_verified, yield_rate, win_rate, total_profit, total_picks')
        .order('yield_rate', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTipsters(data || []);
    } catch (err) {
      console.error('Error al cargar la tabla de líderes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTipsters = tipsters.filter(t => 
    (t.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = filteredTipsters[0];
  const top2 = filteredTipsters[1];
  const top3 = filteredTipsters[2];
  const restTipsters = filteredTipsters.slice(3);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-mono font-bold">
            <Trophy className="w-3.5 h-3.5" /> TABLA DE LÍDERES OFICIAL
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Top Tipsters de <span className="text-emerald-400">Radar Score</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Liderazgo basado exclusivamente en <strong>Yield % justo</strong> (sin la distorsión de Parlays Soñadores) y transparencia total.
          </p>
        </div>

        {/* BUSCADOR */}
        <div className="bg-[#0c0f17] border border-slate-800/90 rounded-2xl p-3 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tipster por @nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-xs text-slate-400 font-mono">Calculando posicionales del Ranking...</span>
          </div>
        ) : filteredTipsters.length === 0 ? (
          <div className="bg-[#0c0f17] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
            No se encontraron tipsters registrados o coincidentes.
          </div>
        ) : (
          <>
            {/* PODIO (TOP 3) - Solo se muestra si no hay búsqueda activa o si hay al menos 3 resultados */}
            {!searchQuery && tipsters.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6 pb-2">
                
                {/* 🥈 SEGUNDO LUGAR */}
                {top2 && (
                  <Link 
                    href={`/perfil/${top2.username}`}
                    className="bg-[#0c0f17] border border-slate-800 hover:border-slate-700 rounded-3xl p-4 sm:p-5 text-center space-y-3 relative group transition shadow-lg"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-700 text-slate-200 border border-slate-600 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Medal className="w-3 h-3 text-slate-300" /> #2
                    </div>
                    
                    <img 
                      src={top2.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={top2.username}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto ring-2 ring-slate-400/40"
                    />

                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm truncate">@{top2.username}</h3>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {top2.yield_rate > 0 ? `+${top2.yield_rate}` : top2.yield_rate}% Yield
                      </span>
                    </div>

                    <div className="bg-[#06080e] p-2 rounded-xl text-[10px] text-slate-400 flex justify-around font-mono">
                      <span>WR: {top2.win_rate || 0}%</span>
                      <span>Picks: {top2.total_picks || 0}</span>
                    </div>
                  </Link>
                )}

                {/* 🥇 PRIMER LUGAR (DESTACADO) */}
                {top1 && (
                  <Link 
                    href={`/perfil/${top1.username}`}
                    className="bg-gradient-to-b from-[#141b26] to-[#0c0f17] border-2 border-amber-500/40 hover:border-amber-500/70 rounded-3xl p-5 sm:p-6 text-center space-y-3 relative group transition shadow-[0_0_30px_rgba(245,158,11,0.15)] -translate-y-2"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30">
                      <Trophy className="w-3.5 h-3.5 fill-slate-950" /> #1 LÍDER
                    </div>
                    
                    <img 
                      src={top1.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={top1.username}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover mx-auto ring-4 ring-amber-500/50 shadow-xl"
                    />

                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <h3 className="font-black text-white text-sm sm:text-base truncate">@{top1.username}</h3>
                        {top1.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <span className="text-xs sm:text-sm text-emerald-400 font-mono font-black block mt-0.5">
                        {top1.yield_rate > 0 ? `+${top1.yield_rate}` : top1.yield_rate}% Yield
                      </span>
                    </div>

                    <div className="bg-[#06080e] p-2.5 rounded-xl text-xs text-slate-300 flex justify-around font-mono border border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Win Rate</span>
                        <span className="font-bold text-amber-400">{top1.win_rate || 0}%</span>
                      </div>
                      <div className="border-l border-slate-800 pl-3">
                        <span className="text-[9px] text-slate-500 block">Ganancia</span>
                        <span className="font-bold text-emerald-400">${top1.total_profit || 0}</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* 🥉 TERCER LUGAR */}
                {top3 && (
                  <Link 
                    href={`/perfil/${top3.username}`}
                    className="bg-[#0c0f17] border border-slate-800 hover:border-slate-700 rounded-3xl p-4 sm:p-5 text-center space-y-3 relative group transition shadow-lg"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 border border-amber-600 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Award className="w-3 h-3 text-amber-300" /> #3
                    </div>
                    
                    <img 
                      src={top3.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={top3.username}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto ring-2 ring-amber-700/40"
                    />

                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm truncate">@{top3.username}</h3>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {top3.yield_rate > 0 ? `+${top3.yield_rate}` : top3.yield_rate}% Yield
                      </span>
                    </div>

                    <div className="bg-[#06080e] p-2 rounded-xl text-[10px] text-slate-400 flex justify-around font-mono">
                      <span>WR: {top3.win_rate || 0}%</span>
                      <span>Picks: {top3.total_picks || 0}</span>
                    </div>
                  </Link>
                )}

              </div>
            )}

            {/* TABLA RESTO DE POSICIONES (#4 EN ADELANTE) */}
            <div className="bg-[#0c0f17] border border-slate-800/90 rounded-3xl p-4 sm:p-6 space-y-3 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider px-2">
                Clasificación General
              </h3>

              <div className="space-y-2">
                {(searchQuery ? filteredTipsters : restTipsters).map((tipster, idx) => {
                  const rankIndex = searchQuery ? idx + 1 : idx + 4;

                  return (
                    <Link
                      key={tipster.id}
                      href={`/perfil/${tipster.username}`}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#06080e] border border-slate-800/80 hover:border-emerald-500/40 transition group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="font-mono text-xs font-bold text-slate-500 w-6 text-center">
                          #{rankIndex}
                        </span>

                        <img 
                          src={tipster.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt={tipster.username}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                        />

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition">
                              @{tipster.username}
                            </span>
                            {tipster.is_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {tipster.total_picks || 0} pronósticos publicados
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 text-right">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">Win Rate</span>
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {tipster.win_rate || 0}%
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">Yield %</span>
                          <span className={`text-xs sm:text-sm font-black font-mono ${tipster.yield_rate >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {tipster.yield_rate > 0 ? `+${tipster.yield_rate}` : tipster.yield_rate}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}