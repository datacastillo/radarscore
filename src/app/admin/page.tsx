'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  Award
} from 'lucide-react';

interface TicketAdmin {
  id: string;
  user_id: string;
  match_title: string;
  league: string;
  selection: string;
  odds: number;
  stake: number;
  comment?: string;
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

        // 3. Permisos confirmados -> Desactivar bloqueo y cargar tickets
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

  const handleResolve = async (ticket: TicketAdmin, newStatus: 'WIN' | 'LOSS') => {
    setResolvingId(ticket.id);
    try {
      // 1. Actualizar el estado del ticket
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // 2. Recalcular las estadísticas de Yield y Aciertos del usuario
      await supabase.rpc('recalculate_user_stats', { target_user_id: ticket.user_id });

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
    (t.profiles?.username || '').toLowerCase().includes(filterMatch.toLowerCase())
  );

  // Pantalla de verificación previa
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
                Liquida los resultados oficializados para mantener las estadísticas y Yields actualizados.
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
            placeholder="Filtrar por partido, usuario o pronóstico..."
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
            <p className="text-xs text-gray-500">No hay apuestas pendientes por validar en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="bg-[#141A23] border border-gray-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* User info */}
                  <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={ticket.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt="Avatar" 
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white">@{ticket.profiles?.username || 'usuario'}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Match & Pick */}
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ticket.league}
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{ticket.match_title}</h3>
                  </div>

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

                  {ticket.comment && (
                    <p className="text-[11px] text-gray-400 italic bg-[#0B0E14]/50 p-2.5 rounded-xl border border-gray-800/50">
                      "{ticket.comment}"
                    </p>
                  )}
                </div>

                {/* Quick Resolve Actions */}
                <div className="pt-2 flex gap-2 border-t border-gray-800/80">
                  <button
                    disabled={resolvingId === ticket.id}
                    onClick={() => handleResolve(ticket, 'WIN')}
                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer"
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
                    onClick={() => handleResolve(ticket, 'LOSS')}
                    className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer"
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
            ))}
          </div>
        )}

      </div>
    </div>
  );
}