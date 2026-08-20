'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';
import NotificationBell from '@/components/NotificationBell';
import { 
  Users, 
  Trophy, 
  ShieldAlert, 
  User, 
  LogOut, 
  Zap,
  LogIn,
  Calendar
} from 'lucide-react';

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 1. Escuchar sesión de Supabase
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Abrir modal si la URL contiene ?openAuth=true
  useEffect(() => {
    if (searchParams.get('openAuth') === 'true') {
      setIsAuthOpen(true);
    }
  }, [searchParams]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        await fetchProfile(session.user.id);
      }
    } catch (err) {
      console.error('Error al verificar sesión:', err);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, rol')
      .eq('id', userId)
      .single();
    if (data) setUserProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCloseModal = () => {
    setIsAuthOpen(false);
    // Limpiar el parámetro openAuth de la URL si existe
    if (searchParams.get('openAuth')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('openAuth');
      const newQuery = params.toString() ? `?${params.toString()}` : '';
      router.replace(`${pathname}${newQuery}`, { scroll: false });
    }
  };

  // FIX: se agrega "Partidos" — antes no existía ningún link de navegación
  // hacia /partidos, así que esa página (predicciones IA, Pick del Día,
  // tabla de posiciones) era inalcanzable salvo escribiendo la URL a mano.
  const navLinks = [
    { name: 'Partidos', href: '/partidos', icon: Calendar },
    { name: 'Comunidad', href: '/comunidad', icon: Users },
    { name: 'Ranking', href: '/ranking', icon: Trophy },
  ];

  if (userProfile?.rol === 'admin') {
    navLinks.push({ name: 'Admin', href: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* HEADER SUPERIOR GLOBAL ADAPTATIVO */}
      <header className="sticky top-0 z-50 bg-[#07090E]/90 backdrop-blur-md border-b border-gray-800/80 w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-4">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tight leading-none flex items-center gap-1">
                Radar<span className="text-emerald-400">Score</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-gray-500 font-bold uppercase tracking-widest hidden sm:block">
                AI SPORTS RADAR
              </span>
            </div>
          </Link>

          {/* Links Navegación Central (Iconos en celular, Texto completo en PC) */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-[#0c0f17] p-1 rounded-2xl border border-gray-800 shrink-0 overflow-x-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Estado de Usuario / Botón Ingresar */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {currentUser && userProfile ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <NotificationBell />

                <Link
                  href={`/perfil/${userProfile.username || 'usuario'}`}
                  className="flex items-center gap-1.5 sm:gap-2 bg-[#0c0f17] hover:bg-gray-800 border border-gray-800 p-1 sm:p-1.5 sm:pr-3 rounded-2xl transition"
                >
                  <img
                    src={userProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt="User"
                    className="w-6 h-6 rounded-xl object-cover border border-gray-700"
                  />
                  <span className="text-xs font-bold text-gray-200 hidden sm:inline">
                    @{userProfile.username || 'perfil'}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 bg-[#0c0f17] hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-gray-800 hover:border-rose-500/30 rounded-2xl transition cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MODAL DE AUTENTICACIÓN */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={handleCloseModal} 
        onSuccess={() => {
          handleCloseModal();
          checkUser();
        }}
      />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}