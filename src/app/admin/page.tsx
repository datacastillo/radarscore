'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2, 
  RefreshCw,
  Rocket,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

interface TicketAdmin {
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
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketAdmin[]>([]);
  const [filterMatch, setFilterMatch] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdminAndFetch = async () => {
      try {
        // 1. Verificar si hay usuario activo
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/');
          return;
        }

        // 2. Verificar si el usuario tiene rol de admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', session.user.id)
          .single();

        if (profile?.rol !== 'admin') {
          router.push('/comunidad');
          return;
        }

        // 3. Permisos confirmados -> Cargar tickets pendientes
        setAuthChecking(false);
        fetchPendingTickets();
      } catch (err) {
        console.error('Error al verificar permisos de admin:', err);
        router.push('/comunidad');
      }
    };

    verifyAdminAndFetch();
  }, [router]);

  const fetchPendingTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.error('Error al cargar tickets pendientes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función de respaldo para actualizar perfiles si no existe el RPC
  const fallbackUpdateProfile = async (userId: string) => {
    const { data: userTickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['WON', 'LOST']);

    if (!userTickets) return;

    const totalPicks = userTickets.length;
    const wonPicks = userTickets.filter(t => t.status === 'WON').length;
    const winRate = totalPicks > 0 ? (wonPicks / totalPicks) * 100 : 0;

    // Solo tickets elegibles (odds < 10.0) para Yield
    const eligibleTickets = userTickets.filter(t => (t.odds || 0) < 10.0 && !t.is_dreamer);
    let totalStaked = 0;
    let totalReturned = 0;

    eligibleTickets.forEach(t => {
      const stake = t.stake || 100;
      totalStaked += stake;
      if (t.status === 'WON') {
        totalReturned += t.potential_payout || (stake * t.odds);
      }
    });

    const totalProfit = totalReturned - totalStaked;
    const yieldRate = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    await supabase
      .from('profiles')
      .update({
        total_picks: totalPicks,
        win_rate: parseFloat(winRate.toFixed(1)),
        yield_rate: parseFloat(yieldRate.toFixed(2)),
        total_profit: parseFloat(totalProfit.toFixed(2))
      })
      .eq('id', userId);
  };

  const handleResolve = async (ticket: TicketAdmin, newStatus: 'WON' | 'LOST') => {
    setResolvingId(ticket.id);
    try {
      // 1. Actualizar el estado del ticket en Supabase
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          resolved_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // 2. Intentar llamar al RPC de Supabase para recalcular estadísticas
      const { error: rpcError } = await supabase.rpc('recalculate_user_stats', { target_user_id: ticket.user_id });

      // Si el RPC falla o no está creado aún, usamos el fallback
      if (rpcError) {
        await fallbackUpdateProfile(ticket.user_id);
      }

      // 3. Remover el ticket de la lista local
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
    } catch (err: any) {
      alert('Error al liquidar el ticket: ' + (err.message || err));
    } finally {
      setResolvingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.match_title.toLowerCase().includes(filterMatch.toLowerCase()) ||
    t.selection.toLowerCase().includes(filterMatch.toLowerCase()) ||
    (t.profiles?.username || '').toLowerCase().includes(filterMatch.toLowerCase()) ||
    (t.league || '').toLowerCase().includes(filterMatch.toLowerCase())
  );

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 bg-[#141A23] border border-gray-800 p-6 rounded-2xl shadow-2xl">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-xs font-bold text-gray-300">Verificando credenciales de administrador...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Panel de Verificación de Tickets</h1>
              <p className="text-xs text-gray-400">
                Liquida los resultados oficializados para mantener el ranking y estadísticas al día.
              </p>
            </div>
          </div>

          <button
            onClick={fetchPendingTickets}
            className="bg-[#0B0E14] hover:bg-gray-800 text-gray-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-gray-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Lista
          </button>
        </div>

        {/* Search / Filter Bar */}
        <div className="bg-[#141A23] border border-gray-800 rounded-2xl p-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-500 ml-2" />
          <input
            type="text"
            placeholder="Filtrar por partido, usuario, liga o pronóstico..."
            value={filterMatch}
            onChange={(e) => setFilterMatch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none flex-1"
          />
        </div>

        {/* Pending Tickets Table / Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Cargando tickets pendientes...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
            <h3 className="text-lg font-bold text-gray-200">¡Todo al día!</h3>
            <p className="text-xs text-gray-500">No hay apuestas ni capturas pendientes por validar en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map(ticket => {
              const isDreamerTicket = ticket.is_dreamer || ticket.odds >= 10.0;

              return (
                <div 
                  key={ticket.id} 
                  className="bg-[#141A23] border border-gray-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* User Info & Badges */}
                    <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={ticket.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt="Avatar" 
                          className="w-7 h-7 rounded-full object-cover border border-gray-700"
                        />
                        <span className="text-xs font-bold text-white">@{ticket.profiles?.username || 'usuario'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isDreamerTicket && (
                          <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Rocket className="w-2.5 h-2.5" /> SOÑADOR
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* League & Match Title */}
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {ticket.league || 'Liga General'}
                      </span>
                      <h3 className="text-base font-black text-white mt-1">{ticket.match_title}</h3>
                    </div>

                    {/* Selection, Odds & Stake */}
                    <div className="bg-[#0B0E14] border border-gray-800/80 p-3 rounded-2xl flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Selección:</span>
                        <span className="font-extrabold text-amber-400">{ticket.selection}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Cuota / Stake:</span>
                        <span className="font-bold text-white">@{ticket.odds} | ${ticket.stake} MXN</span>
                      </div>
                    </div>

                    {/* Imagen / Screenshot Adjunto (Si existe) */}
                    {ticket.image_url && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-emerald-400" /> Captura Adjunta:
                        </span>
                        <div 
                          onClick={() => setSelectedImage(ticket.image_url || null)}
                          className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#0B0E14] h-32 cursor-pointer group"
                        >
                          <img 
                            src={ticket.image_url} 
                            alt="Boleto" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 text-xs font-bold text-white">
                            <ExternalLink className="w-4 h-4" /> Ver Captura Completa
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Comentario / Análisis */}
                    {ticket.comment && (
                      <p className="text-[11px] text-gray-400 italic bg-[#0B0E14]/50 p-2.5 rounded-xl border border-gray-800/50">
                        "{ticket.comment}"
                      </p>
                    )}
                  </div>

                  {/* Quick Resolve Actions */}
                  <div className="pt-3 flex gap-2 border-t border-gray-800/80 mt-2">
                    <button
                      disabled={resolvingId === ticket.id}
                      onClick={() => handleResolve(ticket, 'WON')}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {resolvingId === ticket.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprobar GANADA</span>
                        </>
                      )}
                    </button>

                    <button
                      disabled={resolvingId === ticket.id}
                      onClick={() => handleResolve(ticket, 'LOST')}
                      className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {resolvingId === ticket.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Marcar PERDIDA</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Zoom de Captura */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          >
            <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-gray-400 hover:text-white bg-gray-800/60 p-2 rounded-full cursor-pointer"
              >
                ✕ Cerrar
              </button>
              <img 
                src={selectedImage} 
                alt="Boleto Ampliado" 
                className="max-h-[85vh] w-auto rounded-2xl border border-emerald-500/30 shadow-2xl object-contain"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}