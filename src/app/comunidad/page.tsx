'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
  Flame, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Award,
  Send,
  Loader2,
  X,
  Check,
  TrendingUp,
  PlusCircle
} from 'lucide-react';

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
  status: 'PENDING' | 'WIN' | 'LOSS' | 'pending' | 'won' | 'lost';
  created_at: string;
  reactions_count?: number;
  user_reacted?: boolean;
  comments_count?: number;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
    yield_rate: number;
  };
}

interface TopTipster {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  yield_rate: number;
  total_picks: number;
  win_rate: number;
}

interface CommentItem {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function ComunidadPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [topTipsters, setTopTipsters] = useState<TopTipster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal de Login/Registro
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Estado Modal Crear Ticket
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Campos Nuevo Ticket
  const [matchTitle, setMatchTitle] = useState('');
  const [league, setLeague] = useState('Liga MX 🇲🇽');
  const [selection, setPrediction] = useState('');
  const [odds, setOdds] = useState('');
  const [stake, setStake] = useState('100');
  const [commentText, setCommentText] = useState('');

  // Sugerencias de partidos
  const [matches, setMatches] = useState<any[]>([]);
  const [showMatchSuggestions, setShowMatchSuggestions] = useState(false);

  // Copiado estado
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // COMENTARIOS ESTADOS
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketComments, setTicketComments] = useState<Record<string, CommentItem[]>>({});
  const [loadingComments, setLoadingComments] = useState<string | null>(null);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    checkUserAndInit();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/?openAuth=true');
      } else {
        setCurrentUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const checkUserAndInit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // GUARDIÁN: Si no hay sesión, expulsa al usuario a la Landing Page
    if (!session) {
      router.replace('/?openAuth=true');
      return;
    }

    setCurrentUser(session.user);
    setIsAuthChecking(false);

    // Cargar datos de la app solo para usuarios autenticados
    fetchTickets();
    fetchTopTipsters();
    fetchTodayMatches();
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user ?? null);
  };

  const fetchTodayMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setMatches(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopTipsters = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, yield_rate, total_picks, win_rate')
        .order('yield_rate', { ascending: false })
        .limit(5);

      if (!error && data) {
        setTopTipsters(data);
      }
    } catch (err) {
      console.error('Error al cargar top tipsters:', err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url,
            is_verified,
            yield_rate
          ),
          reactions ( user_id ),
          comments ( id )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets = (data || []).map((t: any) => ({
        ...t,
        reactions_count: t.reactions ? t.reactions.length : 0,
        user_reacted: userId 
          ? t.reactions?.some((r: any) => r.user_id === userId) 
          : false,
        comments_count: t.comments ? t.comments.length : 0,
      }));

      setTickets(formattedTickets);
    } catch (err: any) {
      console.error('Error al cargar tickets:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar comentarios
  const toggleComments = async (ticketId: string) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      return;
    }

    setExpandedTicketId(ticketId);

    if (!ticketComments[ticketId]) {
      setLoadingComments(ticketId);
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setTicketComments(prev => ({
          ...prev,
          [ticketId]: data || []
        }));
      } catch (err: any) {
        console.error('Error al cargar comentarios:', err?.message || err);
      } finally {
        setLoadingComments(null);
      }
    }
  };

  // Agregar comentario
  const handleAddComment = async (ticketId: string) => {
    if (!newCommentInput.trim()) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setPostingComment(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            ticket_id: ticketId,
            user_id: currentUser.id,
            content: newCommentInput.trim(),
          }
        ])
        .select(`
          *,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setTicketComments(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), data]
      }));

      setTickets(prev =>
        prev.map(t =>
          t.id === ticketId
            ? { ...t, comments_count: (t.comments_count || 0) + 1 }
            : t
        )
      );

      setNewCommentInput('');
    } catch (err: any) {
      console.error('Error al enviar comentario:', err?.message || err);
    } finally {
      setPostingComment(false);
    }
  };

  // Reacción Fuego
  const handleReaction = async (ticketId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    const currentTicket = tickets[ticketIndex];
    const isReacted = currentTicket.user_reacted;

    setTickets(prev => {
      const copy = [...prev];
      copy[ticketIndex] = {
        ...currentTicket,
        user_reacted: !isReacted,
        reactions_count: isReacted
          ? (currentTicket.reactions_count || 1) - 1
          : (currentTicket.reactions_count || 0) + 1,
      };
      return copy;
    });

    try {
      if (isReacted) {
        await supabase
          .from('reactions')
          .delete()
          .eq('ticket_id', ticketId)
          .eq('user_id', currentUser.id);
      } else {
        await supabase
          .from('reactions')
          .insert([{ ticket_id: ticketId, user_id: currentUser.id, type: 'FIRE' }]);
      }
    } catch (err) {
      console.error('Error actualizando reacción:', err);
      fetchTickets();
    }
  };

  // Crear Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      const oddsNum = parseFloat(odds);
      const stakeNum = parseFloat(stake);

      const { error } = await supabase.from('tickets').insert([
        {
          user_id: currentUser.id,
          match_title: matchTitle,
          league,
          selection,
          odds: oddsNum,
          stake: stakeNum,
          potential_payout: oddsNum * stakeNum,
          comment: commentText || null,
          status: 'PENDING',
        },
      ]);

      if (error) throw error;

      setIsModalOpen(false);
      setMatchTitle('');
      setPrediction('');
      setOdds('');
      setCommentText('');
      fetchTickets();
      fetchTopTipsters();
    } catch (err: any) {
      alert(err.message || 'Error al crear el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (ticket: Ticket) => {
    const text = `🔥 ¡Apuesta recomendada por @${ticket.profiles?.username || 'RadarScore'}!\n\n⚽ ${ticket.match_title} (${ticket.league})\n🎯 Selección: ${ticket.selection}\n📈 Cuota: @${ticket.odds}\n\nSigue más pronósticos en RadarScore.app`;
    navigator.clipboard.writeText(text);
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusUpper = ticket.status?.toUpperCase();
    if (activeFilter === 'pending') return statusUpper === 'PENDING';
    if (activeFilter === 'verified') return ticket.profiles?.is_verified;
    return true;
  });

  // Pantalla de carga bloqueante durante la comprobación de sesión
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verificando Credenciales...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white">
      {/* Layout Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Banner de Sección y Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#141A23] border border-gray-800/80 rounded-2xl p-4 gap-4">
            <div>
              <h2 className="font-black text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Feed de Apuestas
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                Picks de la comunidad y tipsters verificados en tiempo real
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🌐 Todos
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> En Juego
              </button>
              <button
                onClick={() => setActiveFilter('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === 'verified'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Verificados
              </button>
            </div>
          </div>

          {/* Lista de Tickets */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-[#141A23]/50 border border-gray-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="text-gray-300 font-bold">No hay tickets publicados aquí</h3>
              <p className="text-xs text-gray-500">Sé el primero en compartir un pronóstico con la comunidad</p>
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const statusUpper = ticket.status?.toUpperCase();
              return (
                <div
                  key={ticket.id}
                  className="bg-[#141A23] border border-gray-800 hover:border-gray-700 transition duration-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl relative overflow-hidden group"
                >
                  {/* Tipster Header enlazado a Perfil Público */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/perfil/${ticket.profiles?.username || 'user'}`}
                      className="flex items-center gap-3 group/user hover:opacity-90 transition"
                    >
                      <img
                        src={ticket.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt="Avatar"
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover/user:ring-emerald-400 transition"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-base group-hover/user:text-emerald-400 transition">
                            {ticket.profiles?.full_name || 'RadarScore User'}
                          </span>
                          {ticket.profiles?.is_verified && (
                            <span title="Tipster Verificado">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>@{ticket.profiles?.username || 'user'}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            +{ticket.profiles?.yield_rate || 0}% Yield
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Badge de Estado */}
                    <div>
                      {statusUpper === 'PENDING' && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> En Juego
                        </span>
                      )}
                      {statusUpper === 'WIN' && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> GANADO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cita de comentario */}
                  {ticket.comment && (
                    <div className="bg-[#0B0E14]/60 border border-gray-800/60 rounded-2xl p-3.5 text-xs text-gray-300 italic">
                      "{ticket.comment}"
                    </div>
                  )}

                  {/* Tarjeta de Detalles del Ticket */}
                  <div className="bg-[#0B0E14] border border-gray-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                          {ticket.league}
                        </span>
                        <h4 className="text-base font-black text-white mt-1.5">
                          {ticket.match_title}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-gray-400 block">Stake: ${ticket.stake} MXN</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Selección:</span>
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {ticket.selection}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-gray-400 block text-[11px]">Cuota:</span>
                        <span className="font-black text-amber-400 text-sm">@{ticket.odds}</span>
                      </div>
                    </div>

                    {/* Estimación de Retorno */}
                    <div className="bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-2.5 flex justify-between items-center text-xs">
                      <span className="text-gray-400">Ganancia Potencial:</span>
                      <span className="font-black text-emerald-400">
                        ${(ticket.potential_payout || ticket.stake * ticket.odds).toFixed(2)} MXN
                      </span>
                    </div>
                  </div>

                  {/* Barra de Interacción Social */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {/* Botón Reacción Fuego */}
                      <button
                        onClick={() => handleReaction(ticket.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          ticket.user_reacted
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            : 'bg-[#0B0E14] text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        <Flame className={`w-4 h-4 ${ticket.user_reacted ? 'fill-orange-400 text-orange-400' : ''}`} />
                        <span>{ticket.reactions_count || 0}</span>
                      </button>

                      {/* Botón Desplegar Comentarios */}
                      <button
                        onClick={() => toggleComments(ticket.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                          expandedTicketId === ticket.id
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-[#0B0E14] text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span>{ticket.comments_count || 0}</span>
                      </button>
                    </div>

                    {/* Botón Copiar Apuesta */}
                    <button
                      onClick={() => handleCopy(ticket)}
                      className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      {copiedId === ticket.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Apuesta</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* DESPLEGABLE DE COMENTARIOS */}
                  {expandedTicketId === ticket.id && (
                    <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-4 animate-fadeIn">
                      <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
                        Comentarios y Opiniones
                      </h5>

                      {/* Lista de comentarios */}
                      {loadingComments === ticket.id ? (
                        <div className="flex items-center justify-center py-4 text-gray-400 gap-2 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>Cargando comentarios...</span>
                        </div>
                      ) : !ticketComments[ticket.id] || ticketComments[ticket.id].length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-2">
                          Aún no hay comentarios. ¡Sé el primero en dejar una opinión!
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {ticketComments[ticket.id].map(comment => (
                            <div key={comment.id} className="bg-[#0B0E14] border border-gray-800/60 rounded-xl p-3 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <Link 
                                  href={`/perfil/${comment.profiles?.username || 'user'}`}
                                  className="font-bold text-emerald-400 hover:underline"
                                >
                                  @{comment.profiles?.username || 'usuario'}
                                </Link>
                                <span className="text-[10px] text-gray-500">
                                  {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Input para agregar comentario */}
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={currentUser ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                          disabled={!currentUser || postingComment}
                          value={newCommentInput}
                          onChange={(e) => setNewCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(ticket.id)}
                          className="flex-1 bg-[#0B0E14] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleAddComment(ticket.id)}
                          disabled={!currentUser || postingComment || !newCommentInput.trim()}
                          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
                        >
                          {postingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Ranking Dinámico de Top Tipsters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141A23] border border-gray-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-sm text-white">Top Tipsters del Mes</h3>
            </div>
            
            <div className="space-y-3">
              {topTipsters.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">
                  Cargando clasificación...
                </div>
              ) : (
                topTipsters.map((tipster, i) => (
                  <Link 
                    key={tipster.id} 
                    href={`/perfil/${tipster.username}`}
                    className="flex items-center justify-between p-2.5 bg-[#0B0E14] hover:bg-[#0F141C] border border-gray-800/50 hover:border-emerald-500/30 rounded-2xl text-xs transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-amber-400 w-4 text-center">#{i+1}</span>
                      <img 
                        src={tipster.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                        alt="Avatar"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/20 group-hover:ring-emerald-400 transition"
                      />
                      <div>
                        <span className="font-bold text-white block group-hover:text-emerald-400 transition">{tipster.full_name || tipster.username}</span>
                        <span className="text-[10px] text-gray-500">@{tipster.username}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-extrabold block ${tipster.yield_rate >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {tipster.yield_rate > 0 ? `+${tipster.yield_rate}` : tipster.yield_rate}%
                      </span>
                      <span className="text-[10px] text-gray-500">{tipster.win_rate || 0}% aciertos</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Crear Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#141A23] border border-gray-800 rounded-3xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition bg-gray-800/50 p-2 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Publicar Nuevo Ticket</h3>
              <p className="text-xs text-gray-400">Comparte tu análisis con la comunidad de RadarScore</p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div className="relative">
                <label className="block text-gray-300 font-bold mb-1">Buscar Partido</label>
                <input
                  type="text"
                  placeholder="Ej: Santos Laguna vs Club América"
                  value={matchTitle}
                  onChange={(e) => {
                    setMatchTitle(e.target.value);
                    setShowMatchSuggestions(true);
                  }}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
                
                {showMatchSuggestions && matches.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#141A23] border border-gray-800 rounded-xl max-h-40 overflow-y-auto z-50 shadow-2xl">
                    {matches
                      .filter(m => `${m.home_team} vs ${m.away_team}`.toLowerCase().includes(matchTitle.toLowerCase()))
                      .map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setMatchTitle(`${m.home_team} vs ${m.away_team}`);
                            setLeague(m.league || 'Liga MX 🇲🇽');
                            setShowMatchSuggestions(false);
                          }}
                          className="p-2.5 hover:bg-emerald-500/10 cursor-pointer text-gray-300 hover:text-emerald-400 border-b border-gray-800/50 last:border-none"
                        >
                          <span className="font-bold">{m.home_team} vs {m.away_team}</span>
                          <span className="text-[10px] text-gray-500 block">{m.league}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Liga</label>
                  <input
                    type="text"
                    value={league}
                    onChange={(e) => setLeague(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Selección / Pronóstico</label>
                  <input
                    type="text"
                    placeholder="Ej: Ambos Anotan"
                    value={selection}
                    onChange={(e) => setPrediction(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Cuota (@)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.85"
                    value={odds}
                    onChange={(e) => setOdds(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Stake (Monto MXN)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Análisis o Comentario</label>
                <textarea
                  placeholder="¿Por qué crees que se dará esta apuesta?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0B0E14] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar Apuesta'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          checkUser();
          fetchTickets();
          fetchTopTipsters();
        }}
      />
    </div>
  );
}