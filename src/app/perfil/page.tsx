'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
  User, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  Award, 
  Edit3, 
  Share2, 
  Check, 
  Loader2, 
  Save, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BarChart2,
  DollarSign,
  LogOut // 👈 Importado LogOut
} from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio?: string;
  is_verified: boolean;
  yield_rate: number;
  win_rate: number;
  total_profit: number;
  total_picks: number;
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
  status: 'PENDING' | 'WIN' | 'LOSS' | 'pending' | 'won' | 'lost';
  created_at: string;
}

export default function MiPerfilPage() {
  const router = useRouter(); // 👈 Inicializado useRouter
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Estados para Edición de Perfil
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  // Estado para copiar enlace de compartir
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal Auth si no está logueado
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchMyProfileData();
  }, []);

  const fetchMyProfileData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // 1. Cargar Perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setUsername(profileData.username || '');
        setAvatarUrl(profileData.avatar_url || '');
        setBio(profileData.bio || '');
      }

      // 2. Cargar Mis Tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ticketsData) setTickets(ticketsData);

    } catch (err) {
      console.error('Error al cargar datos del perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          username: cleanUsername,
          avatar_url: avatarUrl.trim(),
          bio: bio.trim(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName.trim(),
        username: cleanUsername,
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
      } : null);

      setIsEditing(false);
    } catch (err: any) {
      alert('Error al actualizar el perfil: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!profile) return;
    const shareUrl = `${window.location.origin}/perfil/${profile.username}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // 🔴 FUNCIÓN CERRAR SESIÓN
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs text-gray-400">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-4">
        <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-8 max-w-md text-center space-y-4">
          <User className="w-16 h-16 text-gray-600 mx-auto" />
          <h2 className="text-xl font-black text-white">Inicia sesión para ver tu perfil</h2>
          <p className="text-xs text-gray-400">
            Accede a tu cuenta para gestionar tus pronósticos, personalizar tu perfil y seguir tus estadísticas.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            Iniciar Sesión / Registrarse
          </button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => fetchMyProfileData()}
        />
      </div>
    );
  }

  const pendingTickets = tickets.filter(t => t.status?.toUpperCase() === 'PENDING');
  const historyTickets = tickets.filter(t => t.status?.toUpperCase() !== 'PENDING');
  const wonTickets = tickets.filter(t => t.status?.toUpperCase() === 'WIN').length;
  const lostTickets = tickets.filter(t => t.status?.toUpperCase() === 'LOSS').length;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Tarjeta de Perfil Principal */}
        <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Formulario de Edición o Vista Normal */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" /> Editar Perfil
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Nombre de Usuario (@)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. juan_picks"
                    required
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-gray-400 font-bold mb-1">URL Foto de Perfil (Avatar)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div className="text-xs">
                <label className="block text-gray-400 font-bold mb-1">Biografía</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Escribe algo sobre tus deportes o estrategia de apuestas..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <img
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-xl"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-white">{profile.full_name || profile.username}</h1>
                    {profile.is_verified && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-emerald-400">@{profile.username}</p>

                  {profile.bio && (
                    <p className="text-xs text-gray-300 max-w-md italic pt-1">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 sm:flex-initial bg-[#0B0E14] hover:bg-gray-800 text-gray-300 border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Editar Perfil</span>
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="flex-1 sm:flex-initial bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Compartir Perfil</span>
                    </>
                  )}
                </button>

                {/* 🔴 NUEVO: Botón Cerrar Sesión */}
                <button
                  onClick={handleLogout}
                  className="flex-1 sm:flex-initial bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </div>
            </div>
          )}

          {/* Grid de Métricas Oficiales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-800/80">
            <div className="bg-[#0B0E14] border border-gray-800/80 p-3.5 rounded-2xl text-center space-y-0.5">
              <span className="text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Yield %
              </span>
              <span className={`text-xl font-black ${profile.yield_rate >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {profile.yield_rate > 0 ? `+${profile.yield_rate}` : profile.yield_rate}%
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800/80 p-3.5 rounded-2xl text-center space-y-0.5">
              <span className="text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" /> Win Rate
              </span>
              <span className="text-xl font-black text-amber-400">
                {profile.win_rate || 0}%
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800/80 p-3.5 rounded-2xl text-center space-y-0.5">
              <span className="text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Ganancia Neta
              </span>
              <span className={`text-xl font-black ${(profile.total_profit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                ${profile.total_profit || 0} MXN
              </span>
            </div>

            <div className="bg-[#0B0E14] border border-gray-800/80 p-3.5 rounded-2xl text-center space-y-0.5">
              <span className="text-[11px] text-gray-400 font-bold flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" /> Récord (G-P)
              </span>
              <span className="text-xl font-black text-white">
                <span className="text-emerald-400">{wonTickets}</span> - <span className="text-rose-500">{lostTickets}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pestañas para Mis Tickets */}
        <div className="space-y-4">
          <div className="flex border-b border-gray-800 gap-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 text-xs font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'pending'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>En Juego ({pendingTickets.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-xs font-extrabold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Historial Finalizado ({historyTickets.length})</span>
            </button>
          </div>

          {/* Lista de Mis Apuestas */}
          {activeTab === 'pending' ? (
            pendingTickets.length === 0 ? (
              <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-12 text-center text-gray-500 text-xs">
                No tienes apuestas pendientes actualmente en juego.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTickets.map(ticket => (
                  <div key={ticket.id} className="bg-[#141A23] border border-gray-800 rounded-2xl p-5 space-y-3 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {ticket.league}
                        </span>
                        <h3 className="font-bold text-white text-sm mt-1">{ticket.match_title}</h3>
                      </div>
                      <span className="text-amber-400 font-extrabold text-xs">Cuota @{ticket.odds}</span>
                    </div>

                    <div className="bg-[#0B0E14] p-3 rounded-xl flex justify-between items-center text-xs border border-gray-800/60">
                      <div>
                        <span className="text-gray-500 text-[10px] block">Selección:</span>
                        <span className="font-bold text-emerald-400">{ticket.selection}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-[10px] block">Monto:</span>
                        <span className="font-bold text-white">${ticket.stake} MXN</span>
                      </div>
                    </div>

                    {ticket.comment && (
                      <p className="text-[11px] text-gray-400 italic bg-[#0B0E14]/40 p-2 rounded-lg border border-gray-800/40">
                        "{ticket.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            historyTickets.length === 0 ? (
              <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-12 text-center text-gray-500 text-xs">
                Aún no tienes pronósticos en tu historial finalizado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historyTickets.map(ticket => {
                  const isWin = ticket.status?.toUpperCase() === 'WIN';
                  return (
                    <div key={ticket.id} className="bg-[#141A23] border border-gray-800 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white font-bold">{ticket.match_title}</span>
                        {isWin ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> GANADO
                          </span>
                        ) : (
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> PERDIDO
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between text-xs bg-[#0B0E14] p-2.5 rounded-xl border border-gray-800/60">
                        <span className="text-gray-300 font-semibold">{ticket.selection} (@{ticket.odds})</span>
                        <span className={isWin ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                          {isWin ? `+$${((ticket.stake * ticket.odds) - ticket.stake).toFixed(2)} MXN` : `-$${ticket.stake} MXN`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}