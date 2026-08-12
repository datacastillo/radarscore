'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';
import { 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  Flame, 
  BrainCircuit, 
  Table, 
  Users,
  Zap, 
  ChevronRight, 
  Activity,
  TrendingUp,
  Terminal,
  Award,
  Copy,
  Check,
  Lock,
  Bell,
  Cpu
} from 'lucide-react';

export default function DefinitiveHomePage() {
  // ESTADO DEL MODAL DE AUTENTICACIÓN Y USUARIO
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // EFECTO BOOTLOADER CON CONTADOR
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootFade, setBootFade] = useState(false);

  // ROTADOR DE FRASES DEL TÍTULO
  const phrases = [
    "Inteligencia Artificial",
    "Ciencia de Datos",
    "Modelos Predictivos",
    "Estadísticas Live"
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // CONSOLA TÁCTICA & COPIADO
  const [activeTab, setActiveTab] = useState<'ai' | 'stats' | 'ranking'>('ai');
  const [copied, setCopied] = useState(false);

  // Verificar estado de la sesión
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Secuencia de Carga Inicial
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setBootProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setBootFade(true), 100);
          setTimeout(() => setBooting(false), 500);
          return 100;
        }
        return prev + 20;
      });
    }, 60);

    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
    };
  }, [phrases.length]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Redirección al autenticarse exitosamente
  const handleAuthSuccess = () => {
    router.push('/comunidad');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white selection:bg-emerald-500 selection:text-black overflow-x-hidden relative font-sans antialiased">
      
      {/* 🚀 1. SECUENCIA DE ARRANQUE ULTRA-PROFESIONAL */}
      {booting && (
        <div 
          className={`fixed inset-0 z-[100] bg-[#07090E] flex flex-col items-center justify-center transition-opacity duration-500 ${
            bootFade ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="space-y-4 text-center max-w-xs px-4">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                Radar<span className="text-emerald-400">Score</span>
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                <span>Cargando Motor Táctico</span>
                <span>{bootProgress}%</span>
              </div>
              <div className="w-full bg-gray-900/80 h-1.5 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-300 h-full transition-all duration-150 rounded-full"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
            </div>

            <span className="text-[10px] font-mono text-gray-500 tracking-wider block pt-1">
              PRO 2026 • ENGINE INITIALIZED
            </span>
          </div>
        </div>
      )}

      {/* 2. ESTILOS DE ANIMACIÓN PREDETERMINADOS */}
      <style jsx>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0.8; }
          50% { opacity: 0.2; }
          100% { top: 95%; opacity: 0.8; }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scanline {
          animation: scanline 4s ease-in-out infinite alternate;
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 32s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .gradient-text {
          background: linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(rgba(52, 211, 153, 0.12) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>

      {/* 3. FONDO TÁCTICO DE LUZ */}
      <div className="fixed inset-0 bg-grid-pattern opacity-50 pointer-events-none -z-10" />
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-emerald-500/15 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* 4. HERO SECTION PRINCIPAL */}
      <section className="relative pt-12 pb-10 sm:pt-20 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Badge Activo con Pulso Neón */}
        <div className="inline-flex items-center gap-2.5 bg-[#121721] border border-emerald-500/40 px-4 py-2 rounded-full shadow-2xl shadow-emerald-500/10 backdrop-blur-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-extrabold text-gray-200 tracking-wide">
            Motor de Inteligencia Deportiva Activo
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
            PRO 2026
          </span>
        </div>

        {/* Titular Cambiante de Alto Impacto */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08]">
            El Futbol Analizado por <br />
            <span className="gradient-text transition-all duration-500 block mt-1">
              {phrases[currentPhraseIndex]}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Predicciones respaldadas por ciencia de datos, marcadores en tiempo real y reputación inalterable en la consola deportiva más avanzada del mercado.
          </p>
        </div>

        {/* BOTONES PRINCIPALES LIMPIOS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => user ? router.push('/comunidad') : setIsAuthOpen(true)}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3 text-sm shadow-xl shadow-emerald-500/20 group relative overflow-hidden active:scale-95 cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-black" />
            <span>{user ? 'Ir a la Comunidad' : 'Explorar RadarApp'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => user ? router.push('/perfil') : setIsAuthOpen(true)}
            className="w-full sm:w-auto bg-[#121721] hover:bg-gray-800 text-gray-200 border border-gray-800 hover:border-emerald-500/30 px-8 py-4 rounded-2xl transition-all duration-300 font-bold flex items-center justify-center gap-3 text-sm backdrop-blur-md active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{user ? 'Ver Mi Perfil' : 'Mi Perfil de Tipster'}</span>
          </button>
        </div>

        {/* CINTA DE SEÑALES EN VIVO (MARQUEE TICKER) */}
        <div className="pt-4 overflow-hidden max-w-5xl mx-auto relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#07090E] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#07090E] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee gap-4">
            {[1, 2].map((loop) => (
              <div key={loop} className="flex gap-4 items-center">
                
                <div className="bg-[#121721] border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 whitespace-nowrap text-xs shadow-lg">
                  <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-gray-400 font-bold">AI SIGNAL:</span>
                  <span className="font-extrabold text-white">América vs Chivas</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Confianza 89% • xG 2.80
                  </span>
                </div>

                <div className="bg-[#121721] border border-cyan-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 whitespace-nowrap text-xs shadow-lg">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-gray-400 font-bold">LIVE DATA:</span>
                  <span className="font-extrabold text-white">Real Madrid 2 - 1 Barcelona</span>
                  <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Posesión 64%
                  </span>
                </div>

                <div className="bg-[#121721] border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 whitespace-nowrap text-xs shadow-lg">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span className="text-gray-400 font-bold">VALUE DETECTED:</span>
                  <span className="font-extrabold text-white">Premier League</span>
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Desviación de Cuota +14.2%
                  </span>
                </div>

                <div className="bg-[#121721] border border-emerald-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 whitespace-nowrap text-xs shadow-lg">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-400 font-bold">TOP TIPSTER:</span>
                  <span className="font-extrabold text-white">@CarlosPicks</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +34.2% Yield Verificado
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 5. CONSOLA TÁCTICA INTERACTIVA DE PREVISUALIZACIÓN */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-20">
        <div className="bg-[#121721] border border-gray-800/90 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden group">
          
          {/* LÍNEA LÁSER ESCÁNER */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scanline z-20 pointer-events-none" />

          {/* Encabezado con Pestañas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-gray-800/80">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> radarscore.console
              </span>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex bg-[#07090E] p-1 rounded-xl border border-gray-800 w-full sm:w-auto justify-center">
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ai' 
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" /> Escáner IA
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'stats' 
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" /> Live Stats
              </button>

              <button
                onClick={() => setActiveTab('ranking')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ranking' 
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Top Tipsters
              </button>
            </div>
          </div>

          {/* CONTENIDO INTERACTIVO DE PESTAÑAS */}
          <div className="mt-5 bg-[#07090E] border border-gray-800/90 rounded-2xl p-5 sm:p-6 space-y-4">
            
            {/* PESTAÑA 1: ESCÁNER IA */}
            {activeTab === 'ai' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white">Análisis Predictivo de Algoritmo</h4>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-2 py-0.5 rounded">
                          91.4% Fiabilidad
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Partido Evaluado: Club América vs Chivas • Liga MX</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                    Cuota Sugerida @2.10
                  </span>
                </div>

                {/* Métricas Visuales Proporcionales */}
                <div className="bg-[#121721]/80 p-4 rounded-xl border border-gray-800 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center border-b border-gray-800 pb-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block">Victoria Local</span>
                      <span className="text-sm font-black text-emerald-400">54%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block">Empate</span>
                      <span className="text-sm font-black text-amber-400">26%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block">Victoria Visita</span>
                      <span className="text-sm font-black text-rose-400">20%</span>
                    </div>
                  </div>

                  {/* Barra de Probabilidad */}
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[54%]" />
                    <div className="bg-amber-400 h-full w-[26%]" />
                    <div className="bg-rose-500 h-full w-[20%]" />
                  </div>

                  <p className="text-xs text-gray-300 font-medium leading-relaxed pt-1">
                    <strong className="text-emerald-400">Sugerencia IA:</strong> Ambos Anotan + Más de 2.5 Goles.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Flame className="w-4 h-4 fill-amber-400" /> 38 Tipsters siguen esta selección
                  </span>

                  <button 
                    onClick={handleCopy}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-4 py-2 rounded-xl transition text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Selección'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: LIVE STATS */}
            {activeTab === 'stats' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-black text-rose-400 uppercase tracking-wide">EN VIVO • Minuto 74'</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Clásico Nacional • Estadio Azteca</span>
                </div>

                <div className="flex items-center justify-around py-2 text-center">
                  <div>
                    <span className="text-lg font-black text-white block">Club América</span>
                    <span className="text-3xl font-black text-emerald-400">2</span>
                  </div>
                  <span className="text-xs font-black text-gray-600">VS</span>
                  <div>
                    <span className="text-lg font-black text-white block">Chivas</span>
                    <span className="text-3xl font-black text-cyan-400">1</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <div className="flex justify-between text-xs text-gray-400 font-semibold">
                    <span>Posesión: 58%</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[58%]" />
                    <div className="bg-cyan-500 h-full w-[42%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-[#121721] p-2.5 rounded-xl border border-gray-800 text-center">
                    <span className="text-gray-400 block text-[10px]">Tiros a Gol</span>
                    <strong className="text-white text-sm">6 - 3</strong>
                  </div>
                  <div className="bg-[#121721] p-2.5 rounded-xl border border-gray-800 text-center">
                    <span className="text-gray-400 block text-[10px]">Goles Esperados (xG)</span>
                    <strong className="text-emerald-400 text-sm">2.41 - 1.12</strong>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: TOP TIPSTERS */}
            {activeTab === 'ranking' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 fill-amber-400" /> Leaderboard Mensual Verificado
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Calculado en Supabase</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-[#121721] p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-[11px]">#1</span>
                      <div>
                        <span className="font-extrabold text-white block">@CarlosPicks</span>
                        <span className="text-[10px] text-gray-400">Win Rate: 78%</span>
                      </div>
                    </div>
                    <span className="font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      +34.2% Yield
                    </span>
                  </div>

                  <div className="bg-[#121721] p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 font-black flex items-center justify-center text-[11px]">#2</span>
                      <div>
                        <span className="font-extrabold text-white block">@FutbolProAnalyst</span>
                        <span className="text-[10px] text-gray-400 font-mono">Win Rate: 71%</span>
                      </div>
                    </div>
                    <span className="font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      +28.9% Yield
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 6. PILARES Y CARACTERÍSTICAS TÉCNICAS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ARQUITECTURA DE DATOS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Diseñado para la máxima ventaja analítica
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Combinamos modelos estadísticos avanzados con un entorno social libre de manipulación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#121721]/80 border border-gray-800/90 p-6 rounded-3xl space-y-4 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Modelado Predictivo xG</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Algoritmos que procesan volumen de tiro, presión ofensiva y momento de forma para calcular probabilidades reales.
            </p>
          </div>

          <div className="bg-[#121721]/80 border border-gray-800/90 p-6 rounded-3xl space-y-4 hover:border-cyan-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Live Data Match Center</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Marcadores al instante, clasificaciones de ligas globales y estadísticas H2H actualizadas segundo a segundo.
            </p>
          </div>

          <div className="bg-[#121721]/80 border border-gray-800/90 p-6 rounded-3xl space-y-4 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Yield Infalsificable</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Historial 100% verificado. Las selecciones pasadas no pueden editarse ni eliminarse, garantizando reputación real.
            </p>
          </div>

          <div className="bg-[#121721]/80 border border-gray-800/90 p-6 rounded-3xl space-y-4 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Alertas de Valor Inmediatas</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Recibe notificaciones en vivo cuando la IA detecta desviaciones en las cuotas o un Tipster Top publica su selección.
            </p>
          </div>

        </div>
      </section>

      {/* 7. ¿CÓMO FUNCIONA? */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-gray-800/80">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            WORKFLOW TÁCTICO
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">¿Cómo operar con RadarScore?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-[#121721] border border-gray-800 p-6 rounded-2xl space-y-3 relative">
            <span className="text-3xl font-black text-emerald-400 font-mono">01</span>
            <h3 className="text-base font-extrabold text-white">Consulta el Escáner</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Abre el módulo de IA para evaluar la fiabilidad de los partidos de la jornada con sus probabilidades calculadas.
            </p>
          </div>

          <div className="bg-[#121721] border border-gray-800 p-6 rounded-2xl space-y-3 relative">
            <span className="text-3xl font-black text-cyan-400 font-mono">02</span>
            <h3 className="text-base font-extrabold text-white">Verifica a los Tipsters</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explora el ranking mensual para seguir a pronosticadores con métricas reales de Yield y Win Rate auditados.
            </p>
          </div>

          <div className="bg-[#121721] border border-gray-800 p-6 rounded-2xl space-y-3 relative">
            <span className="text-3xl font-black text-amber-400 font-mono">03</span>
            <h3 className="text-base font-extrabold text-white">Ejecuta o Publica</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Copia selecciones verificadas con un clic o publica tus propios pronósticos para escalar posiciones en la tabla.
            </p>
          </div>
        </div>
      </section>

      {/* 8. MÉTRICAS GLOBALES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#121721] via-[#1A2230] to-[#121721] border border-gray-800 rounded-3xl p-8 sm:p-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-2xl">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">+1,400</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Partidos Analizados al Día</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400">100%</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Transparencia de Datos</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400">0</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Picks Editables</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white">&lt; 0.5s</div>
            <div className="text-xs text-gray-400 font-semibold mt-1">Latencia Live Stats</div>
          </div>
        </div>
      </section>

      {/* 9. BANNER DE CONVERSIÓN FINAL */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 rounded-3xl p-8 sm:p-14 text-center text-black space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            ¿Listo para apostar con verdadera ventaja?
          </h2>

          <p className="text-sm sm:text-base font-bold text-black/80 max-w-xl mx-auto">
            Únete a la comunidad de RadarScore gratis, consulta el escáner de IA y construye tu reputación verificada.
          </p>

          <div className="pt-2">
            <button
              onClick={() => user ? router.push('/comunidad') : setIsAuthOpen(true)}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-black px-8 py-4 rounded-2xl transition shadow-xl text-sm active:scale-95 cursor-pointer"
            >
              <span>{user ? 'Ir a la Comunidad' : 'Comenzar Ahora Gratis'}</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 py-10 px-4 text-center text-xs text-gray-500 space-y-3">
        <div className="flex items-center justify-center gap-2 font-black text-sm text-white">
          <span>Radar</span>
          <span className="text-emerald-400">Score</span>
        </div>
        <p>© 2026 RadarScore Inc. Inteligencia Artificial & Estadísticas Deportivas.</p>
        <p className="text-[10px] text-gray-600">Juega con responsabilidad (+18). Las decisiones finales son responsabilidad del usuario.</p>
      </footer>

      {/* MODAL DE AUTENTICACIÓN CONECTADO */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
}