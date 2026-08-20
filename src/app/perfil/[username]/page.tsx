'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Trophy, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Rocket, 
  Image as ImageIcon, 
  ExternalLink, 
  X, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2,
  Calendar,
  Filter,
  UserPlus,
  UserMinus,
  Users
} from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

interface ProfileData {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  total_picks: number;
  win_rate: number;
  yield_rate: number;
  total_profit: number;
  rol?: string;
  created_at?: string;
}

interface Ticket {
  id: string;
  user_id: string;
  match_title: string;
  league: string;
  selection: string;
  odds: number;
  stake: number;
  potential_payout?: number;
  comment?: string;
  image_url?: string;
  is_dreamer?: boolean;
  status: string;
  created_at: string;
  resolved_at?: string;
}

type FilterTab = 'ALL' | 'SETTLED' | 'PENDING' | 'WIN' | 'LOSS';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Estado de seguidores/seguidos
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // 1. Cargar información del perfil por username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', username)
        .single();

      if (profileError || !profileData) {
        console.error('Perfil no encontrado:', profileError);
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2. Cargar tickets creados por este usuario
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

      // 3. Saber quién está viendo el perfil (para saber si puede seguir)
      const { data: { session } } = await supabase.auth.getSession();
      const viewerId = session?.user?.id || null;
      setCurrentUserId(viewerId);

      // 4. Contadores de seguidores / seguidos
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', profileData.id),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', profileData.id),
      ]);

      setFollowersCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);

      // 5. Si hay alguien logueado viendo el perfil de otra persona, saber si ya lo sigue
      if (viewerId && viewerId !== profileData.id) {
        const { data: followRow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', viewerId)
          .eq('following_id', profileData.id)
          .maybeSingle();

        setIsFollowing(Boolean(followRow));
      } else {
        setIsFollowing(false);
      }

    } catch (err) {
      console.error('Error al obtener perfil e historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;

    // Sin sesión -> manda a iniciar sesión, mismo patrón que el resto de la app
    if (!currentUserId) {
      router.push('/?openAuth=true');
      return;
    }

    // No te puedes seguir a ti mismo (el botón ni siquiera se muestra en ese caso,
    // esto es solo una segunda barrera de protección)
    if (currentUserId === profile.id) return;

    setFollowLoading(true);
    const wasFollowing = isFollowing;

    // Actualización optimista para que se sienta instantáneo
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => (wasFollowing ? Math.max(0, prev - 1) : prev + 1));

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([{ follower_id: currentUserId, following_id: profile.id }]);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error al actualizar el seguimiento:', err);
      // Revertir la actualización optimista si algo falló
      setIsFollowing(wasFollowing);
      setFollowersCount(prev => (wasFollowing ? prev + 1 : Math.max(0, prev - 1)));
      alert('No se pudo actualizar el seguimiento. Intenta de nuevo.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Contadores de estados
  const wonCount = tickets.filter(t => t.status === 'WIN' || t.status === 'WON').length;
  const lostCount = tickets.filter(t => t.status === 'LOSS' || t.status === 'LOST').length;
  const voidCount = tickets.filter(t => t.status === 'VOID' || t.status === 'void').length;
  const pendingCount = tickets.filter(t => t.status === 'PENDING' || t.status === 'pending').length;

  // Filtrado de tickets según pestaña
  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'SETTLED') return t.status !== 'PENDING' && t.status !== 'pending';
    if (activeTab === 'PENDING') return t.status === 'PENDING' || t.status === 'pending';
    if (activeTab === 'WIN') return t.status === 'WIN' || t.status === 'WON';
    if (activeTab === 'LOSS') return t.status === 'LOSS' || t.status === 'LOST';
    return true; // ALL
  });

  const isOwnProfile = currentUserId === profile?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 bg-[#0c0f17] border border-slate-800 p-6 rounded-2xl shadow-2xl">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-xs font-bold text-slate-300">Cargando perfil de @{username}...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
        <div className="bg-[#0c0f17] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <User className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-black text-white">Perfil no encontrado</h2>
          <p className="text-xs text-slate-400">El usuario <strong className="text-emerald-400">@{username}</strong> no existe o no ha sido registrado aún.</p>
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Ranking</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Botón Volver */}
        <div>
          <Link
            href="/ranking"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition bg-[#0c0f17] border border-slate-800 px-3.5 py-2 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Volver a la Tabla de Posiciones</span>
          </Link>
        </div>

        {/* HEADER DEL PERFIL */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0c0f17] via-[#0f1422] to-[#0c0f17] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
            <img 
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
              alt={profile.username}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-xl shrink-0"
            />

            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
                    @{profile.username}
                    {profile.rol === 'admin' && (
                      <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3 h-3" /> ADMIN
                      </span>
                    )}
                  </h1>

                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {profile.full_name || 'Tipster de la Comunidad'}
                  </p>
                </div>

                {/* Botón Seguir — solo si NO es tu propio perfil */}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 ${
                      isFollowing
                        ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Seguidores / Seguidos */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-white font-black">{followersCount}</strong>
                  <span className="text-slate-500">Seguidores</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <strong className="text-white font-black">{followingCount}</strong>
                  <span className="text-slate-500">Siguiendo</span>
                </span>
              </div>

              {profile.created_at && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-500 font-mono">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Miembro desde {new Date(profile.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* GRID DE MÉTRICAS PRINCIPALES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            
            {/* Yield % */}
            <div className="bg-[#06080e] border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1">
                  YIELD %
                  <InfoTooltip text="Rendimiento sobre el total apostado. Si en total apostaste $100 y terminaste ganando $110 (contando pérdidas y ganancias), tu yield es +10%. Mide qué tan rentables son tus picks, no solo cuántos aciertas." />
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className={`text-xl font-black font-mono ${
                (profile.yield_rate || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(profile.yield_rate || 0) > 0 ? `+${profile.yield_rate}%` : `${profile.yield_rate || 0}%`}
              </p>
            </div>

            {/* Win Rate % */}
            <div className="bg-[#06080e] border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1">
                  WIN RATE %
                  <InfoTooltip text="Porcentaje de picks que resultaron ganadores, sin importar el monto apostado en cada uno. Un win rate alto no siempre significa buen rendimiento — mira el Yield % también." />
                </span>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white font-mono">
                {profile.win_rate || 0}%
              </p>
            </div>

            {/* Total Profit */}
            <div className="bg-[#06080e] border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono font-bold">
                <span>PROFIT EST.</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className={`text-xl font-black font-mono ${
                (profile.total_profit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(profile.total_profit || 0) >= 0 ? `+$${profile.total_profit || 0}` : `-$${Math.abs(profile.total_profit || 0)}`}
              </p>
            </div>

            {/* Total Picks */}
            <div className="bg-[#06080e] border border-slate-800/80 p-4 rounded-2xl space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono font-bold">
                <span>TOTAL PICKS</span>
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xl font-black text-white font-mono">
                {profile.total_picks || 0}
              </p>
            </div>

          </div>

          {/* DESGLOSE RÁPIDO DE BALANCE */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#06080e]/60 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[11px] font-bold">RESUMEN DE RESULTADOS:</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {wonCount} W
              </span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {lostCount} L
              </span>
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <MinusCircle className="w-3.5 h-3.5" /> {voidCount} V
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {pendingCount} P
              </span>
            </div>
          </div>

        </div>

        {/* SECCIÓN HISTORIAL DE PICKS */}
        <div className="space-y-4">
          
          {/* Barra de Filtros */}
          <div className="bg-[#0c0f17] border border-slate-800/90 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'ALL'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({tickets.length})
              </button>

              <button
                onClick={() => setActiveTab('SETTLED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'SETTLED'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resueltos ({wonCount + lostCount + voidCount})
              </button>

              <button
                onClick={() => setActiveTab('WIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'WIN'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ganados ({wonCount})
              </button>

              <button
                onClick={() => setActiveTab('LOSS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'LOSS'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Perdidos ({lostCount})
              </button>

              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'PENDING'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pendientes ({pendingCount})
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono px-2 hidden md:block">
              MOSTRANDO {filteredTickets.length} TICKETS
            </div>
          </div>

          {/* LISTA DE TICKETS */}
          {filteredTickets.length === 0 ? (
            <div className="bg-[#0c0f17] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No hay picks registrados en este filtro</h3>
              <p className="text-xs text-slate-500">Intenta cambiar la pestaña seleccionada arriba.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map(ticket => {
                const isWon = ticket.status === 'WIN' || ticket.status === 'WON';
                const isLost = ticket.status === 'LOSS' || ticket.status === 'LOST';
                const isVoid = ticket.status === 'VOID' || ticket.status === 'void';
                const isPending = ticket.status === 'PENDING' || ticket.status === 'pending';
                const isDreamerTicket = ticket.is_dreamer || ticket.odds >= 10.0;

                return (
                  <div 
                    key={ticket.id}
                    className="bg-[#0c0f17] border border-slate-800/90 hover:border-slate-700 transition rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      
                      {/* Encabezado Liga + Estado */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 uppercase font-mono">
                          {ticket.league || 'General'}
                        </span>

                        {/* Insignia de Estado */}
                        {isWon && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3" /> GANADO
                          </span>
                        )}
                        {isLost && (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 font-mono">
                            <XCircle className="w-3 h-3" /> PERDIDO
                          </span>
                        )}
                        {isVoid && (
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 font-mono">
                            <MinusCircle className="w-3 h-3" /> REEMBOLSO / NULO
                          </span>
                        )}
                        {isPending && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" /> PENDIENTE
                          </span>
                        )}
                      </div>

                      {/* Partido / Evento */}
                      <div>
                        <h3 className="text-sm font-black text-white">{ticket.match_title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {isDreamerTicket && (
                            <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Rocket className="w-2.5 h-2.5" /> SOÑADOR
                              <InfoTooltip text="Pick con cuota @10.00 o más (equivalente a +900 en momio americano) — una apuesta de alto riesgo y alta recompensa. Por su volatilidad, no cuenta para el cálculo del Yield %." />
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(ticket.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Selección y Detalles */}
                      <div className="bg-[#06080e] border border-slate-800/80 p-3 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Selección:</span>
                          <span className="font-extrabold text-amber-400">{ticket.selection}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Cuota / Stake:</span>
                          <span className="font-bold text-white">@{ticket.odds} | ${ticket.stake} MXN</span>
                        </div>
                      </div>

                      {/* Captura Adjunta */}
                      {ticket.image_url && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-emerald-400" /> Captura Adjunta:
                          </span>
                          <div 
                            onClick={() => setSelectedImage(ticket.image_url || null)}
                            className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#06080e] h-28 cursor-pointer group"
                          >
                            <img 
                              src={ticket.image_url} 
                              alt="Boleto" 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-xs font-bold text-white backdrop-blur-[2px]">
                              <ExternalLink className="w-4 h-4 text-emerald-400" />
                              <span>Ampliar Captura</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comentario / Análisis */}
                      {ticket.comment && (
                        <p className="text-[11px] text-slate-300 italic bg-[#06080e]/60 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                          "{ticket.comment}"
                        </p>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Lightbox para imágenes */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-[#0c0f17] border border-emerald-500/30 rounded-3xl p-3 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-2">
                <span className="text-xs font-mono font-bold text-emerald-400">Captura de Boleto (@{profile.username})</span>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded-xl transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img 
                src={selectedImage} 
                alt="Boleto Ampliado" 
                className="max-h-[80vh] w-full object-contain rounded-2xl border border-slate-800"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}