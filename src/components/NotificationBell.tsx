'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Bell, Trophy, XCircle, MinusCircle, X, PartyPopper } from 'lucide-react';

interface NotificationItem {
  id: string;
  ticket_id: string | null;
  type: 'WIN' | 'LOSS' | 'VOID';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<NotificationItem['type'], React.ReactNode> = {
  WIN: <Trophy className="w-4 h-4 text-emerald-400" />,
  LOSS: <XCircle className="w-4 h-4 text-rose-400" />,
  VOID: <MinusCircle className="w-4 h-4 text-slate-400" />,
};

export default function NotificationBell() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [celebration, setCelebration] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // 1. Detectar sesión activa
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Cargar notificaciones existentes + suscribirse a nuevas en vivo (Realtime)
  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) setNotifications(data);
    };

    fetchNotifications();

    // Escucha notificaciones nuevas EN VIVO mientras el usuario navega
    const channel = supabase
      .channel(`notifications:${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          setNotifications(prev => [newNotif, ...prev]);

          // Si es una victoria, mostramos el pop-up de celebración
          if (newNotif.type === 'WIN') {
            setCelebration(newNotif);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // 3. Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
  };

  const formatTimeAgo = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUserId) return null;

  return (
    <>
      {/* CAMPANITA */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="relative p-1.5 sm:p-2 bg-[#0c0f17] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded-2xl transition cursor-pointer"
          title="Notificaciones"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#07090E]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* DROPDOWN DE HISTORIAL */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-[#0c0f17] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-[#090c13]">
              <span className="text-xs font-bold text-slate-200">Notificaciones</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Aún no tienes notificaciones.
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full text-left p-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition flex items-start gap-2.5 cursor-pointer ${
                      !notif.is_read ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{TYPE_ICON[notif.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">{notif.title}</span>
                        {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{notif.message}</p>
                      <span className="text-[9px] text-slate-600 font-mono mt-1 block">{formatTimeAgo(notif.created_at)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* POP-UP DE CELEBRACIÓN EN VIVO (solo para WIN) */}
      {celebration && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[300] max-w-sm w-[calc(100%-2rem)] sm:w-96 animate-fadeIn">
          <div className="relative bg-gradient-to-br from-emerald-950 via-[#0c0f17] to-amber-950/40 border-2 border-emerald-500/50 rounded-3xl p-5 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden">
            
            {/* Confeti decorativo simple */}
            <div className="absolute -top-4 -left-4 text-2xl animate-bounce">🎉</div>
            <div className="absolute -top-2 right-8 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
            <div className="absolute top-6 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</div>

            <button
              onClick={() => setCelebration(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{celebration.title}</h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Pick Ganador</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">{celebration.message}</p>

            <div className="flex gap-2">
              <Link
                href="/ranking"
                onClick={() => setCelebration(null)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Ver Ranking</span>
              </Link>
              <button
                onClick={() => setCelebration(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}