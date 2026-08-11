'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  LayoutGrid, 
  User, 
  ShieldAlert, 
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';
  
  // Estado para controlar el modal de autenticación
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Función que se ejecuta al iniciar sesión/registrarse exitosamente
  const handleAuthSuccess = () => {
    router.push('/comunidad');
  };

  const navItems = [
    {
      label: 'Comunidad',
      href: '/comunidad',
      icon: LayoutGrid,
    },
    {
      label: 'Mi Perfil',
      href: '/perfil',
      icon: User,
    },
    {
      label: 'Admin',
      href: '/admin',
      icon: ShieldAlert,
      isAdmin: true,
    },
  ];

  // 1️⃣ NAVBAR LIMPIO PARA LA LANDING PAGE DE BIENVENIDA (RUTA '/')
  if (isHomePage) {
    return (
      <>
        <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
            
            {/* Logo Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1">
                Radar<span className="text-emerald-400">Score</span>
              </span>
            </Link>

            {/* Botón Acción para la Landing (Abre el AuthModal) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
              >
                <span>Entrar a la App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Modal de Autenticación */}
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // 2️⃣ NAVBAR ORIGINAL COMPLETO PARA DENTRO DE LA APP
  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-gray-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <Link href="/comunidad" className="flex items-center gap-2.5 group">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-black text-lg tracking-tight text-white flex items-center gap-1">
              Radar<span className="text-emerald-400">Score</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-[#141A23] p-1.5 rounded-2xl border border-gray-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.isAdmin && (
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/comunidad"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Publicar Pick</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}