'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import { 
  Flame, 
  MessageSquare, 
  ShieldCheck, 
  Send,
  Loader2,
  X,
  Check,
  Zap,
  Search,
  Rocket,
  Snowflake,
  Camera,
  Upload,
  Maximize2,
  ImageIcon,
  Smile,
  Sparkles,
  Share2,
  Target
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
  image_url?: string;
  is_dreamer?: boolean;
  status: 'PENDING' | 'WIN' | 'LOSS' | 'pending' | 'won' | 'lost' | 'VOID' | string;
  created_at: string;
  reactions_count?: number;
  rockets_count?: number;
  fades_count?: number;
  user_reacted?: boolean;
  user_rocket?: boolean;
  user_fade?: boolean;
  comments_count?: number;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
    yield_rate: number;
    win_rate?: number;
  };
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
  const [loading, setLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'live' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    
    if (!session) {
      router.replace('/?openAuth=true');
      return;
    }

    setCurrentUser(session.user);
    setIsAuthChecking(false);
    fetchTickets();
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
            yield_rate,
            win_rate
          ),
          reactions ( user_id, type ),
          comments ( id )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets = (data || []).map((t: any) => {
        const fireReactions = t.reactions?.filter((r: any) => r.type === 'FIRE' || !r.type) || [];
        const rocketReactions = t.reactions?.filter((r: any) => r.type === 'ROCKET') || [];
        const fadeReactions = t.reactions?.filter((r: any) => r.type === 'FADE') || [];

        return {
          ...t,
          reactions_count: fireReactions.length,
          rockets_count: rocketReactions.length,
          fades_count: fadeReactions.length,
          user_reacted: userId ? fireReactions.some((r: any) => r.user_id === userId) : false,
          user_rocket: userId ? rocketReactions.some((r: any) => r.user_id === userId) : false,
          user_fade: userId ? fadeReactions.some((r: any) => r.user_id === userId) : false,
          comments_count: t.comments ? t.comments.length : 0,
        };
      });

      setTickets(formattedTickets);
    } catch (err: any) {
      console.error('Error al cargar tickets:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleReaction = async (ticketId: string, reactionType: 'FIRE' | 'ROCKET' | 'FADE') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return;

    const ticket = tickets[index];

    const currentActiveReaction: 'FIRE' | 'ROCKET' | 'FADE' | null = 
      ticket.user_reacted ? 'FIRE' :
      ticket.user_rocket ? 'ROCKET' :
      ticket.user_fade ? 'FADE' : null;

    const isClickingSame = currentActiveReaction === reactionType;

    setTickets(prev => {
      const copy = [...prev];
      const updatedTicket = { ...ticket };

      if (currentActiveReaction === 'FIRE') {
        updatedTicket.user_reacted = false;
        updatedTicket.reactions_count = Math.max(0, (updatedTicket.reactions_count || 1) - 1);
      } else if (currentActiveReaction === 'ROCKET') {
        updatedTicket.user_rocket = false;
        updatedTicket.rockets_count = Math.max(0, (updatedTicket.rockets_count || 1) - 1);
      } else if (currentActiveReaction === 'FADE') {
        updatedTicket.user_fade = false;
        updatedTicket.fades_count = Math.max(0, (updatedTicket.fades_count || 1) - 1);
      }

      if (!isClickingSame) {
        if (reactionType === 'FIRE') {
          updatedTicket.user_reacted = true;
          updatedTicket.reactions_count = (updatedTicket.reactions_count || 0) + 1;
        } else if (reactionType === 'ROCKET') {
          updatedTicket.user_rocket = true;
          updatedTicket.rockets_count = (updatedTicket.rockets_count || 0) + 1;
        } else if (reactionType === 'FADE') {
          updatedTicket.user_fade = true;
          updatedTicket.fades_count = (updatedTicket.fades_count || 0) + 1;
        }
      }

      copy[index] = updatedTicket;
      return copy;
    });

    try {
      if (currentActiveReaction) {
        await supabase
          .from('reactions')
          .delete()
          .eq('ticket_id', ticketId)
          .eq('user_id', currentUser.id);
      }

      if (!isClickingSame) {
        await supabase
          .from('reactions')
          .insert([
            {
              ticket_id: ticketId,
              user_id: currentUser.id,
              type: reactionType
            }
          ]);
      }
    } catch (err) {
      console.error('Error al actualizar reacción:', err);
    }
  };

  const handleCopy = (ticket: Ticket) => {
    const text = `🎯 ¡Ticket Real de @${ticket.profiles?.username || 'user'}!\n\n💬 ${ticket.comment || ticket.match_title}\n\n👉 Míralo en RadarScore.app`;
    navigator.clipboard.writeText(text);
    setCopiedId(ticket.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredTickets = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();

    return tickets.filter(t => {
      const statusUpper = t.status?.toUpperCase();

      if (cleanQuery.length >= 2) {
        const matchTitle = t.match_title?.toLowerCase() || '';
        const comment = t.comment?.toLowerCase() || '';
        const username = t.profiles?.username?.toLowerCase() || '';

        const matchesSearch = 
          matchTitle.includes(cleanQuery) || 
          username.includes(cleanQuery) || 
          comment.includes(cleanQuery);

        if (!matchesSearch) return false;
      }

      if (activeTab === 'live' || activeTab === 'trending') return statusUpper === 'PENDING';
      if (activeTab === 'verified') return t.profiles?.is_verified;
      return true;
    });
  }, [tickets, activeTab, searchQuery]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center space-y-3">
        <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
          <Zap className="w-5 h-5 fill-emerald-400" />
        </div>
        <p className="text-[11px] text-slate-400 font-mono tracking-wider">Cargando RadarScore Feed...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER PRINCIPAL */}
      <section className="border-b border-slate-800/80 bg-[#0c0f17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">Muro de Pronósticos</h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                  PHOTO-FIRST
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Capturas reales compartidas por la comunidad.</p>
            </div>

            <button
              onClick={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else setIsCreateModalOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>Subir Captura</span>
            </button>
          </div>
        </div>
      </section>

      {/* CONTENEDOR CENTRAL */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-4">
        
        {/* WIDGET RÁPIDO */}
        <div 
          onClick={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setIsCreateModalOpen(true);
          }}
          className="bg-[#0c0f17] border border-slate-800/90 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:border-slate-700 transition shadow-sm group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
            {currentUser?.user_metadata?.avatar_url ? (
              <img src={currentUser.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
            ) : (
              <Smile className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 text-xs text-slate-400 font-medium">
            ¿Qué jugaste hoy? Comparte tu captura aquí...
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="bg-[#0c0f17] border border-slate-800/90 rounded-2xl p-3 space-y-2.5 shadow-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por comentario o @tipster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#06080e] border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-24 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-medium"
            />

            {searchQuery.trim().length >= 2 && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
            )}

            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar text-xs border-t border-slate-800/60 pt-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition font-medium shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Todos
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1 rounded-lg transition font-medium shrink-0 cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-slate-800 text-orange-400 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              🔥 Tendencias
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1 rounded-lg transition font-medium shrink-0 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-slate-800 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              En Juego
            </button>

            <button
              onClick={() => setActiveTab('verified')}
              className={`px-3 py-1 rounded-lg transition font-medium shrink-0 cursor-pointer ${
                activeTab === 'verified'
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Verificados
            </button>
          </div>
        </div>

        {/* FEED DE TICKETS */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-80 bg-[#0c0f17]/60 border border-slate-800/80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-[#0c0f17] border border-slate-800/80 rounded-2xl p-8 text-center space-y-2">
            <Search className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">No hay capturas publicadas en esta categoría.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const statusUpper = ticket.status?.toUpperCase();
            const isDreamer = ticket.is_dreamer || (ticket.odds && ticket.odds >= 10.0);

            let statusBorderColor = 'border-l-amber-500';
            if (statusUpper === 'WIN' || statusUpper === 'WON') statusBorderColor = 'border-l-emerald-500';
            if (statusUpper === 'LOSS' || statusUpper === 'LOST') statusBorderColor = 'border-l-rose-500';

            return (
              <div
                key={ticket.id}
                className={`bg-[#0c0f17] border-l-4 ${statusBorderColor} border-y border-r border-slate-800/90 hover:border-slate-700 transition-all rounded-2xl p-4 space-y-3 shadow-md`}
              >
                {/* Header del Tipster & Badges */}
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/perfil/${ticket.profiles?.username || 'user'}`}
                    className="flex items-center gap-2.5 hover:opacity-80 transition"
                  >
                    <img
                      src={ticket.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">@{ticket.profiles?.username || 'user'}</span>
                        {ticket.profiles?.is_verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(ticket.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {/* Insignia Parlay Soñador */}
                    {isDreamer && (
                      <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Rocket className="w-2.5 h-2.5" /> SOÑADOR
                      </span>
                    )}

                    {statusUpper === 'PENDING' && (
                      <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> PENDIENTE
                      </span>
                    )}
                    {(statusUpper === 'WIN' || statusUpper === 'WON') && (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" /> GANADO
                      </span>
                    )}
                    {(statusUpper === 'LOSS' || statusUpper === 'LOST') && (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <X className="w-3 h-3" /> PERDIDO
                      </span>
                    )}
                  </div>
                </div>

                {/* Comentario / Leyenda Principal */}
                {ticket.comment && (
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {ticket.comment}
                  </p>
                )}

                {/* Información de Selección/Cuota (Si aplica) */}
                {ticket.selection && ticket.selection !== 'Ver Ticket' && (
                  <div className="bg-[#06080e] border border-slate-800/80 rounded-xl p-2.5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-slate-200">{ticket.selection}</span>
                    </div>
                    {ticket.odds > 1 && (
                      <span className="font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        @{ticket.odds}
                      </span>
                    )}
                  </div>
                )}

                {/* 📸 CAPTURA PRINCIPAL DEL TICKET */}
                <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-[#06080e]">
                  {ticket.image_url ? (
                    <div 
                      onClick={() => setSelectedImage(ticket.image_url!)}
                      className="cursor-pointer relative overflow-hidden"
                    >
                      <img
                        src={ticket.image_url}
                        alt="Captura de Apuesta"
                        className="w-full h-auto max-h-[450px] object-cover sm:object-contain bg-black/40 group-hover:scale-[1.01] transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs backdrop-blur-[2px]">
                        <Maximize2 className="w-4 h-4 text-emerald-400" />
                        <span>Ver imagen completa</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-2 bg-gradient-to-b from-[#090d16] to-[#06080e]">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono">Sin captura adjunta</p>
                    </div>
                  )}
                </div>

                {/* Reacciones + Comentarios */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReaction(ticket.id, 'FIRE')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                        ticket.user_reacted
                          ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                          : 'bg-[#06080e] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${ticket.user_reacted ? 'fill-orange-400 text-orange-400' : ''}`} />
                      <span>{ticket.reactions_count || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(ticket.id, 'ROCKET')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                        ticket.user_rocket
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-[#06080e] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Rocket className={`w-3.5 h-3.5 ${ticket.user_rocket ? 'fill-purple-400 text-purple-300' : ''}`} />
                      <span>{ticket.rockets_count || 0}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(ticket.id, 'FADE')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                        ticket.user_fade
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-[#06080e] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Snowflake className={`w-3.5 h-3.5 ${ticket.user_fade ? 'text-cyan-300' : ''}`} />
                      <span>{ticket.fades_count || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(ticket.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                        expandedTicketId === ticket.id
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#06080e] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ticket.comments_count || 0}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(ticket)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {copiedId === ticket.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Compartir</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Comentarios desplegables */}
                {expandedTicketId === ticket.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5 animate-fadeIn">
                    {loadingComments === ticket.id ? (
                      <div className="flex items-center justify-center py-2 text-slate-400 text-xs gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Cargando comentarios...</span>
                      </div>
                    ) : !ticketComments[ticket.id] || ticketComments[ticket.id].length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">Sé el primero en comentar esta jugada.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                        {ticketComments[ticket.id].map(comment => (
                          <div key={comment.id} className="bg-[#06080e] border border-slate-800/80 rounded-xl p-2.5 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-400 text-[11px]">@{comment.profiles?.username || 'usuario'}</span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder={currentUser ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                        disabled={!currentUser || postingComment}
                        value={newCommentInput}
                        onChange={(e) => setNewCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(ticket.id)}
                        className="flex-1 bg-[#06080e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleAddComment(ticket.id)}
                        disabled={!currentUser || postingComment || !newCommentInput.trim()}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition text-xs flex items-center justify-center cursor-pointer"
                      >
                        {postingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}

      </main>

      {/* LIGHTBOX AMPLIFICADOR */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl w-full bg-[#0c0f17] border border-emerald-500/30 rounded-3xl overflow-hidden p-3 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Captura de Ticket Ampliada</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img
              src={selectedImage}
              alt="Ticket Real Ampliado"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* MODAL DE PUBLICACIÓN CLEAN */}
      <CreatePickModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchTickets();
        }}
      />

      {/* MODAL DE AUTENTICACIÓN */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          checkUserAndInit();
        }}
      />

    </div>
  );
}

{/* MODAL DE PUBLICACIÓN MINIMALISTA & ULTRA CLEAN */}
function CreatePickModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>('🎯 Pick del Día');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const QUICK_TAGS = ['🎯 Pick del Día', '🔥 All-In', '🚀 Confiado', '💎 Cuota Alta', '⚡ En Vivo'];

  const resetForm = () => {
    setComment('');
    setImageFile(null);
    setImagePreview(null);
    setSelectedTag('🎯 Pick del Día');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile && !imagePreview) {
      alert('Por favor selecciona una captura de tu ticket.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Debes iniciar sesión para publicar.');
        setLoading(false);
        return;
      }

      let imageUrl: string | null = null;

      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}.${fileExt}`;
          const filePath = `ticket-screenshots/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('ticket-screenshots')
            .upload(filePath, imageFile);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('ticket-screenshots')
              .getPublicUrl(filePath);
            imageUrl = publicUrlData.publicUrl;
          } else {
            imageUrl = imagePreview;
          }
        } catch {
          imageUrl = imagePreview;
        }
      } else if (imagePreview) {
        imageUrl = imagePreview;
      }

      const finalComment = selectedTag ? `[${selectedTag}] ${comment.trim()}`.trim() : comment.trim();

      const { error } = await supabase.from('tickets').insert([
        {
          user_id: user.id,
          league: 'Captura Comunidad',
          match_title: 'Ticket de Apuesta',
          selection: selectedTag || 'Ver Ticket',
          odds: 1.00,
          stake: 100,
          potential_payout: 100,
          comment: finalComment || null,
          image_url: imageUrl,
          status: 'PENDING'
        }
      ]);

      if (error) throw error;

      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error al publicar captura: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-[#0B0E14] border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl relative text-white">
        
        {/* Header Limpio */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Publicar Ticket</span>
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué jugaste hoy? Agrega un comentario opcional..."
            className="w-full bg-[#06080e] border border-slate-800/90 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 resize-none text-xs font-medium"
          />

          <div className="border border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-xl p-3 bg-[#06080e] text-center cursor-pointer transition relative group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            
            {imagePreview ? (
              <div className="relative inline-block w-full">
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg border border-slate-800 mx-auto object-contain" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                  className="absolute top-1.5 right-1.5 bg-rose-500/90 text-white rounded-full p-1 hover:bg-rose-600 transition z-20 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2.5 py-3 text-slate-400">
                <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-slate-300">Haz clic para adjuntar la imagen del ticket</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 block font-semibold uppercase">Etiqueta opcional</span>
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 border cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-bold'
                      : 'bg-[#06080e] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || (!imageFile && !imagePreview)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-md shadow-emerald-500/20"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Publicar Ticket</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}