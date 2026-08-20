'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, BrainCircuit, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

type Status = 'loading' | 'success' | 'error' | 'needs_terms';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const finishLogin = () => {
      if (!isMounted) return;
      setStatus('success');
      setTimeout(() => {
        router.push('/comunidad');
      }, 1500);
    };

    // Revisa si el usuario ya aceptó Términos/Privacidad/edad. Los usuarios
    // que se registraron por correo ya lo aceptaron en AuthModal antes de
    // registrarse (y AuthModal ya marcó terms_accepted_at). Los que entran
    // por primera vez vía Google nunca vieron ese checkbox, así que se les
    // pide aquí, una sola vez.
    const checkTermsAndProceed = async (userId: string) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('terms_accepted_at')
        .eq('id', userId)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        // Si no se pudo verificar, por seguridad pedimos el checkpoint
        // en vez de dejar pasar sin confirmar.
        setPendingUserId(userId);
        setStatus('needs_terms');
        return;
      }

      if (profile?.terms_accepted_at) {
        finishLogin();
      } else {
        setPendingUserId(userId);
        setStatus('needs_terms');
      }
    };

    const handleEmailConfirmation = async () => {
      try {
        // 1. Detectar si la URL contiene errores de Supabase (ej: enlace expirado o denegado)
        const fullUrl = window.location.href;
        if (fullUrl.includes('error_code=otp_expired') || fullUrl.includes('error=access_denied')) {
          if (isMounted) {
            setStatus('error');
            setErrorMessage('Este enlace de verificación ya expiró o ya fue utilizado. Por favor, solicita uno nuevo.');
          }
          return;
        }

        // 2. Si viene un código PKCE en los parámetros de la URL (?code=...)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        // 3. Escuchar evento de inicio de sesión de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if ((event === 'SIGNED_IN' || session) && isMounted && session?.user) {
            checkTermsAndProceed(session.user.id);
          }
        });

        // 4. Verificación manual por si la sesión ya fue establecida
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          await checkTermsAndProceed(session.user.id);
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

  const handleAcceptTerms = async () => {
    if (!acceptedTerms || !pendingUserId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('id', pendingUserId);

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        router.push('/comunidad');
      }, 1200);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'No se pudo confirmar tu aceptación. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* ESTADO: FALTA ACEPTAR TÉRMINOS (típico de primer login con Google) */}
        {status === 'needs_terms' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1 text-left sm:text-center">
              <h2 className="text-xl font-black text-white">Un último paso</h2>
              <p className="text-xs text-gray-400">
                Antes de continuar, confirma lo siguiente:
              </p>
            </div>

            <label className="flex items-start gap-2.5 bg-[#07090E] border border-gray-800 rounded-xl p-3 cursor-pointer select-none text-left">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded bg-[#0c0f17] border-gray-700 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 shrink-0"
              />
              <span className="text-[11px] text-gray-400 leading-relaxed">
                Confirmo que soy <strong className="text-gray-200">mayor de 18 años</strong> y acepto los{' '}
                <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                  Términos de Servicio
                </a>{' '}
                y el{' '}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">
                  Aviso de Privacidad
                </a>
                . Entiendo que el contenido de esta plataforma es informativo y que debo{' '}
                <span className="text-amber-400 font-bold">jugar con responsabilidad</span>.
              </span>
            </label>

            <button
              onClick={handleAcceptTerms}
              disabled={!acceptedTerms || submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continuar a RadarScore</span>}
            </button>
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
              onClick={() => router.push('/')}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition text-xs shadow-lg shadow-emerald-500/20 mt-2 cursor-pointer"
            >
              Volver al Inicio
            </button>
          </>
        )}

      </div>
    </div>
  );
}