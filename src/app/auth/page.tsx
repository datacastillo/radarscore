'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleEmailConfirmation = async () => {
      try {
        // Escuchamos el evento de autenticación cuando Supabase procesa el token de la URL
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' || session) {
            if (isMounted) {
              setStatus('success');
              // Redirige a la comunidad tras 1.5 segundos para mostrar el mensaje de éxito
              setTimeout(() => {
                router.push('/comunidad');
              }, 1500);
            }
          }
        });

        // Verificación manual por si la sesión ya fue establecida al cargar la página
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session && isMounted) {
          setStatus('success');
          setTimeout(() => {
            router.push('/comunidad');
          }, 1500);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err?.message || 'No se pudo verificar el enlace. Es posible que haya expirado.');
        }
      }
    };

    handleEmailConfirmation();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Luz ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-sm bg-[#121721] border border-gray-800/90 p-8 rounded-3xl shadow-2xl text-center space-y-5 animate-fadeIn z-10">
        
        {/* ESTADO: CARGANDO */}
        {status === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <BrainCircuit className="w-7 h-7 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Confirmando Cuenta...</h2>
              <p className="text-xs text-gray-400">
                Verificando tu enlace de correo. En breve ingresarás a la comunidad.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          </>
        )}

        {/* ESTADO: ÉXITO */}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">¡Cuenta Verificada!</h2>
              <p className="text-xs text-emerald-400 font-semibold">
                Redirigiéndote a la comunidad...
              </p>
            </div>
          </>
        )}

        {/* ESTADO: ERROR */}
        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/20">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Enlace no válido</h2>
              <p className="text-xs text-rose-400">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => router.push('/comunidad')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition text-xs shadow-lg shadow-emerald-500/20 mt-2"
            >
              Volver a la Comunidad
            </button>
          </>
        )}

      </div>
    </div>
  );
}