'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  // Estados para toggle de visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de interfaz
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // Iniciar Sesión
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Validación de contraseñas
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden. Verifícalas e intenta de nuevo.');
        }

        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        // Definir la URL de redirección post-confirmación
        const redirectUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback` 
          : undefined;

        // Registro de usuario con redirección de correo
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: username || email.split('@')[0],
              full_name: username || email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        // Si requiere confirmación por correo (session = null)
        if (data.user && !data.session) {
          setSuccessMsg(
            `¡Cuenta registrada! Hemos enviado un correo de verificación a ${email}. Por favor revisa tu bandeja de entrada o SPAM y haz clic en el enlace para activar tu cuenta.`
          );
        } else {
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar. Verifica tus datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      {/* Fondo con Blur de Alta Calidad */}
      <div 
        className="fixed inset-0 bg-[#07090E]/85 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={() => {
          resetForm();
          onClose();
        }}
      />

      {/* Tarjeta del Formulario */}
      <div className="relative w-full max-w-md bg-[#121721] border border-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden animate-fadeIn">
        
        {/* Luz ambient neón */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 blur-[80px] pointer-events-none" />

        {/* Botón Cerrar */}
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Modal */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Comunidad RadarScore
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isLogin ? '¡Bienvenido de Nuevo!' : 'Únete a RadarScore'}
          </h2>
          <p className="text-xs text-gray-400">
            {isLogin
              ? 'Ingresa tus datos para publicar e interactuar'
              : 'Crea tu perfil y empieza a competir con tus pronósticos'}
          </p>
        </div>

        {/* Switch Selector (Tabs) */}
        <div className="flex bg-[#07090E] p-1 rounded-2xl border border-gray-800/80 mb-5">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              resetForm();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              isLogin
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              resetForm();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              !isLogin
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Registrarme
          </button>
        </div>

        {/* Pantalla de Éxito / Confirmación de Email */}
        {successMsg ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-5 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <p className="font-black text-sm text-white">¡Verifica tu correo!</p>
            <p className="text-gray-300 leading-relaxed font-medium">{successMsg}</p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setSuccessMsg(null);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl transition text-xs mt-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleAuth} className="space-y-4">
              
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-300">Nombre de Usuario (@)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ej: TipsterPro"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#07090E] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-300">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#07090E] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-300">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#07090E] border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña (Solo en Registro) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-gray-300">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#07090E] border border-gray-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50 active:scale-95 mt-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Gratis'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Login / Registro alternativo abajo */}
            <div className="text-center pt-4 border-t border-gray-800/80">
              <p className="text-xs text-gray-400">
                {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                  className="ml-1 text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                </button>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}