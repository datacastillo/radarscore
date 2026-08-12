'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import { 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award,
  ArrowLeft,
  Target,
  BarChart2,
  UserPlus,
  UserCheck,
  Users,
  Loader2,
  Edit3,
  X,
  Rocket,
  DollarSign
} from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  yield_rate: number;
  win_rate: number;
  total_picks: number;
  total_profit?: number;
  bio?: string;
  created_at: string;
}

interface Ticket {
  id: string;
  match_title: string;
  league: string;
  selection: string;
  odds: number;
  stake: number;
  potential_payout?: number;
  comment?: string;
  is_dreamer?: boolean;
  status: 'PENDING' | 'WON' | 'LOST' | 'WIN' | 'LOSS' | string;
  created_at: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const usernameParam = params?.username as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'wins' | 'losses'>('all');

  // Estados de Seguimiento y Usuario Activo
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Estados de Edición de Perfil
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (usernameParam) {
      fetchUserProfile();
    }
  }, [usernameParam]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // 1. Obtener datos del usuario logueado
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user ?? null;
      setCurrentUser(sessionUser);

      // 2. Obtener perfil objetivo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', usernameParam)
        .maybeSingle();

      if (profileError || !profileData) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setEditFullName(profileData.full_name || '');
      setEditBio(profileData.bio || '');
      setEditAvatarUrl(profileData.avatar_url || '');

      // 3. Contar Seguidores y Siguiendo
      const { count: fCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileData.id);

      setFollowersCount(fCount || 0);

      const { count: ingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileData.id);

      setFollowingCount(ingCount || 0);

      // 4. Verificar si el usuario actual ya lo sigue
      if (sessionUser) {
        const { data: isFol } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', sessionUser.id)
          .eq('following_id', profileData.id)
          .maybeSingle();

        setIsFollowing(!!isFol);
      }

      // 5. Obtener tickets del usuario
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (!ticketsError && ticketsData) {
        setTickets(ticketsData);
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!profile || currentUser.id === profile.id) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);

        if (!error) {
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const { error } = await supabase
          .from('follows')
          .insert([{ follower_id: currentUser.id, following_id: profile.id }]);

        if (!error) {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error al cambiar estado de seguimiento:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !currentUser) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName,
          bio: editBio,
          avatar_url: editAvatarUrl,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: editFullName, bio: editBio, avatar_url: editAvatarUrl } : null);
      setIsEditOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cargando perfil de @{usernameParam}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-4">
        <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <h2 className="text-xl font-black text-white">Usuario no encontrado</h2>
          <p className="text-xs text-gray-400">
            El tipster <span className="text-emerald-400 font-bold">@{usernameParam}</span> no existe o cambió de nombre de usuario.
          </p>
          <Link
            href="/comunidad"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la Comunidad
          </Link>
        </div>
      </div>
    );
  }

  // 🧠 CÁLCULOS PÚBLICOS ROBUSTOS (Soporte WON / WIN / LOST / LOSS)
  const isPending = (st: string) => st?.toUpperCase() === 'PENDING';
  const isWon = (st: string) => st?.toUpperCase() === 'WON' || st?.toUpperCase() === 'WIN';
  const isLost = (st: string) => st?.toUpperCase() === 'LOST' || st?.toUpperCase() === 'LOSS';

  const historyTickets = tickets.filter(t => !isPending(t.status));
  const wonTickets = tickets.filter(t => isWon(t.status)).length;
  const lostTickets = tickets.filter(t => isLost(t.status)).length;

  // Exclusión de Parlays Soñadores en Yield / Win Rate
  const eligibleYieldTickets = historyTickets.filter(t => (t.odds || 0) < 10.0 && !t.is_dreamer);
  
  let totalStakedYield = 0;
  let totalReturnedYield = 0;

  eligibleYieldTickets.forEach(t => {
    const stake = t.stake || 100;
    totalStakedYield += stake;
    if (isWon(t.status)) {
      totalReturnedYield += t.potential_payout || (stake * t.odds);
    }
  });

  const calculatedProfitYield = totalReturnedYield - totalStakedYield;
  const calculatedYieldRate = totalStakedYield > 0 ? (calculatedProfitYield / totalStakedYield) * 100 : 0;
  
  const eligibleWonCount = eligibleYieldTickets.filter(t => isWon(t.status)).length;
  const calculatedWinRate = eligibleYieldTickets.length > 0 ? (eligibleWonCount / eligibleYieldTickets.length) * 100 : 0;

  const displayYield = eligibleYieldTickets.length > 0 ? calculatedYieldRate.toFixed(2) : (profile.yield_rate || 0);
  const displayWinRate = eligibleYieldTickets.length > 0 ? calculatedWinRate.toFixed(1) : (profile.win_rate || 0);

  // Ganancia Neta Total
  let globalNetProfit = 0;
  historyTickets.forEach(t => {
    const stake = t.stake || 100;
    if (isWon(t.status)) {
      globalNetProfit += (t.potential_payout || (stake * t.odds)) - stake;
    } else if (isLost(t.status)) {
      globalNetProfit -= stake;
    }
  });

  const displayTotalProfit = historyTickets.length > 0 ? globalNetProfit.toFixed(2) : (profile.total_profit || 0);

  const filteredTickets = tickets.filter(t => {
    if (activeTab === 'wins') return isWon(t.status);
    if (activeTab === 'losses') return isLost(t.status);
    return true;
  });

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Botón Volver */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition bg-[#141A23] border border-gray-800/80 px-3.5 py-2 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        {/* Tarjeta Header de Perfil */}
        <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-xl"
            />

            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-white">{profile.full_name || profile.username}</h1>
                    {profile.is_verified && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">@{profile.username}</p>
                </div>

                {/* Botón de Acción: Seguir / Siguiendo o Editar Perfil */}
                {!isOwnProfile ? (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition shadow-lg cursor-pointer ${
                      isFollowing
                        ? 'bg-gray-800 hover:bg-rose-500/20 hover:text-rose-400 border border-gray-700 text-gray-200'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" /> Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Seguir Tipster
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" /> Editar Perfil
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs text-gray-300 max-w-xl italic">{profile.bio}</p>
              )}

              {/* Conteo de Seguidores */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-white">{followersCount}</strong> Seguidores
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white">{followingCount}</strong> Siguiendo
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Estadísticas Públicas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-800/80">
            <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-bold mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Yield
              </div>
              <span className={`text-lg font-black ${Number(displayYield) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {Number(displayYield) > 0 ? `+${displayYield}` : displayYield}%
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-bold mb-1">
                <Target className="w-3.5 h-3.5 text-amber-400" /> Win Rate
              </div>
              <span className="text-lg font-black text-amber-400">
                {displayWinRate}%
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-bold mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Ganancia Neta
              </div>
              <span className={`text-lg font-black ${Number(displayTotalProfit) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                ${displayTotalProfit} MXN
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-bold mb-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> Récord (G-P)
              </div>
              <span className="text-lg font-black text-white">
                <span className="text-emerald-400">{wonTickets}</span> - <span className="text-rose-500">{lostTickets}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Historial de Tickets */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141A23] border border-gray-800 rounded-2xl p-4">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" /> Historial de Pronósticos
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Todos ({tickets.length})
              </button>
              <button
                onClick={() => setActiveTab('wins')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'wins'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Ganados ({wonTickets})
              </button>
              <button
                onClick={() => setActiveTab('losses')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === 'losses'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Perdidos ({lostTickets})
              </button>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-12 text-center text-gray-500 text-xs">
              No hay apuestas registradas en esta categoría.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTickets.map(ticket => {
                const win = isWon(ticket.status);
                const lost = isLost(ticket.status);
                const pending = isPending(ticket.status);
                const isDreamer = ticket.is_dreamer || ticket.odds >= 10.0;

                return (
                  <div
                    key={ticket.id}
                    className="bg-[#141A23] border border-gray-800 rounded-2xl p-4 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {ticket.league || 'Liga General'}
                          </span>
                          {isDreamer && (
                            <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Rocket className="w-2.5 h-2.5" /> SOÑADOR
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">
                          {ticket.match_title}
                        </h4>
                      </div>

                      {win && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> GANADO
                        </span>
                      )}
                      {lost && (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> PERDIDO
                        </span>
                      )}
                      {pending && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> En Juego
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs bg-[#0B0E14] p-2.5 rounded-xl border border-gray-800/60">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Pick:</span>
                        <span className="font-bold text-emerald-400">{ticket.selection}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Cuota:</span>
                        <span className="font-black text-amber-400">@{ticket.odds}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Stake:</span>
                        <span className="font-bold text-white">${ticket.stake} MXN</span>
                      </div>
                    </div>

                    {ticket.comment && (
                      <p className="text-[11px] text-gray-400 italic bg-[#0B0E14]/40 p-2 rounded-lg border border-gray-800/40">
                        "{ticket.comment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Editar Perfil */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#141A23] border border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition bg-gray-800/50 p-2 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white">Editar Perfil</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-gray-300 font-bold">Nombre Completo</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-bold">URL de Avatar (Foto)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-bold">Biografía</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Cuéntanos sobre tu estrategia de apuestas..."
                  rows={3}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => fetchUserProfile()}
      />
    </div>
  );
}