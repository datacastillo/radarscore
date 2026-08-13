'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Search, 
  Loader2, 
  RefreshCw,
  Rocket,
  Image as ImageIcon,
  ExternalLink,
  X
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
          router.push('/?openAuth=true');
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
      console.error('Error al cargar tickets pendientes:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Función de respaldo para actualizar estadísticas del perfil si falla el RPC
  const fallbackUpdateProfile = async (userId: string) => {
    const { data: userTickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['WIN', 'LOSS', 'WON', 'LOST', 'VOID']);

    if (!userTickets) return;

    // Excluir VOID del cómputo de WinRate
    const settledTickets = userTickets.filter(t => t.status !== 'VOID');
    const totalPicks = settledTickets.length;
    const wonPicks = settledTickets.filter(t => t.status === 'WIN' || t.status === 'WON').length;
    const winRate = totalPicks > 0 ? (wonPicks / totalPicks) * 100 : 0;

    // Solo tickets elegibles (cuota < 10.0 y no soñador) para Yield
    const eligibleTickets = settledTickets.filter(t => (t.odds || 0) < 10.0 && !t.is_dreamer);
    let totalStaked = 0;
    let totalReturned = 0;

    eligibleTickets.forEach(t => {
      const stake = t.stake || 100;
      totalStaked += stake;
      if (t.status === 'WIN' || t.status === 'WON') {
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

  const handleResolve = async (ticket: TicketAdmin, newStatus: 'WIN' | 'LOSS' | 'VOID') => {
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

      // Si el RPC falla o no está disponible, se ejecuta la función de respaldo
      if (rpcError) {
        await fallbackUpdateProfile(ticket.user_id);
      }

      // 3. Remover el ticket de la lista activa
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
    } catch (err: any) {
      alert('Error al liquidar el ticket: ' + (err?.message || err));
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
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 bg-[#0c0f17] border border-slate-800 p-6 rounded-2xl shadow-2xl">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-xs font-bold text-slate-300">Verificando credenciales de administrador...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Admin Header */}
        <div className="bg-[#0c0f17] border border-slate-800/90 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">Panel de Verificación de Tickets</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Liquida los resultados oficializados para mantener el ranking y estadísticas de la comunidad al día.
              </p>
            </div>
          </div>

          <button
            onClick={fetchPendingTickets}
            className="bg-[#06080e] hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-800 transition cursor-pointer shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar Lista</span>
          </button>
        </div>

        {/* Bar de Filtros y Contador */}
        <div className="bg-[#0c0f17] border border-slate-800/90 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por partido, usuario, liga o pick..."
              value={filterMatch}
              onChange={(e) => setFilterMatch(e.target.value)}
              className="w-full bg-[#06080e] border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">TICKETS PENDIENTES:</span>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-0.5 rounded-lg font-bold">
              {filteredTickets.length}
            </span>
          </div>
        </div>

        {/* Grid de Tickets Pendientes */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Cargando tickets pendientes...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-[#0c0f17] border border-slate-800/80 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-slate-200">¡Todo al día!</h3>
            <p className="text-xs text-slate-500">No hay apuestas ni capturas pendientes por validar en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map(ticket => {
              const isDreamerTicket = ticket.is_dreamer || ticket.odds >= 10.0;

              return (
                <div 
                  key={ticket.id} 
                  className="bg-[#0c0f17] border border-slate-800/90 hover:border-slate-700 transition duration-200 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Header Usuario */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={ticket.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                        <span className="text-xs font-bold text-slate-200">@{ticket.profiles?.username || 'usuario'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isDreamerTicket && (
                          <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Rocket className="w-2.5 h-2.5" /> SOÑADOR
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(ticket.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Liga y Partido */}
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono">
                        {ticket.league || 'Liga General'}
                      </span>
                      <h3 className="text-sm font-black text-white mt-1.5">{ticket.match_title}</h3>
                    </div>

                    {/* Selección, Cuota y Stake */}
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

                    {/* Captura / Screenshot Adjunto */}
                    {ticket.image_url && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-emerald-400" /> Captura Adjunta:
                        </span>
                        <div 
                          onClick={() => setSelectedImage(ticket.image_url || null)}
                          className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#06080e] h-32 cursor-pointer group"
                        >
                          <img 
                            src={ticket.image_url} 
                            alt="Boleto" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-xs font-bold text-white backdrop-blur-[2px]">
                            <ExternalLink className="w-4 h-4 text-emerald-400" />
                            <span>Ver Captura Completa</span>
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

                  {/* Acciones de Verificación / Resolución */}
                  <div className="pt-3 flex gap-2 border-t border-slate-800/80 mt-2">
                    <button
                      disabled={resolvingId === ticket.id}
                      onClick={() => handleResolve(ticket, 'WIN')}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                      {resolvingId === ticket.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>GANADO</span>
                        </>
                      )}
                    </button>

                    <button
                      disabled={resolvingId === ticket.id}
                      onClick={() => handleResolve(ticket, 'LOSS')}
                      className="flex-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {resolvingId === ticket.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>PERDIDO</span>
                        </>
                      )}
                    </button>

                    <button
                      disabled={resolvingId === ticket.id}
                      onClick={() => handleResolve(ticket, 'VOID')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      title="Marcar como NULO / REEMBOLSO"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox / Modal para Inspeccionar Captura */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-[#0c0f17] border border-emerald-500/30 rounded-3xl p-3 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-2">
                <span className="text-xs font-mono font-bold text-emerald-400">Verificación de Captura</span>
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