export default function Home() {
  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-4 md:p-8 max-w-5xl mx-auto">
      {/* 1. HEADER / BARRA DE NAVEGACIÓN */}
      <header className="flex items-center justify-between py-4 border-b border-white/10 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-200 to-emerald-400 bg-clip-text text-transparent">
            RADARSCORE<span className="text-emerald-500 text-xs align-super ml-1">AI</span>
          </h1>
        </div>

        <div className="flex gap-2 text-xs font-semibold bg-zinc-900/80 p-1 rounded-lg border border-white/5">
          <button className="px-3 py-1.5 rounded-md bg-zinc-800 text-white">AYER</button>
          <button className="px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HOY</button>
          <button className="px-3 py-1.5 rounded-md hover:bg-zinc-800/50 text-zinc-400">MAÑANA</button>
        </div>
      </header>

      {/* 2. FEED DE PARTIDOS - AGRUPADO POR LIGA */}
      <section className="space-y-6">
        {/* Encabezado de Liga */}
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 tracking-wider uppercase border-l-2 border-emerald-500 pl-3">
          <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 PREMIER LEAGUE · JORNADA 26</span>
          <span className="text-emerald-400 hover:underline cursor-pointer">Ver Tabla 📊</span>
        </div>

        {/* TARJETA DE PARTIDO (MATCH CARD ATÓMICA) */}
        <div className="bg-[#121215] border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all duration-300 ai-glow">
          
          {/* Top Bar de la Tarjeta */}
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-4 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              EN VIVO · Min 68'
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
              🤖 IA Confianza: 78%
            </span>
          </div>

          {/* Enfrentamiento de Equipos */}
          <div className="grid grid-cols-3 items-center text-center my-4">
            {/* Equipo Local */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg">
                🔴
              </div>
              <span className="font-bold text-sm">Arsenal</span>
              <div className="flex gap-1 text-[9px] font-bold">
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">V</span>
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">V</span>
                <span className="w-4 h-4 rounded bg-zinc-700 text-zinc-300 flex items-center justify-center">E</span>
              </div>
            </div>

            {/* Marcador */}
            <div className="flex flex-col items-center">
              <div className="text-3xl font-black tracking-widest text-white">
                2 <span className="text-zinc-600">-</span> 1
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Emirates Stadium</span>
            </div>

            {/* Equipo Visitante */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg">
                🔵
              </div>
              <span className="font-bold text-sm">Chelsea</span>
              <div className="flex gap-1 text-[9px] font-bold">
                <span className="w-4 h-4 rounded bg-red-500/20 text-red-400 flex items-center justify-center">D</span>
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">V</span>
                <span className="w-4 h-4 rounded bg-zinc-700 text-zinc-300 flex items-center justify-center">E</span>
              </div>
            </div>
          </div>

          {/* WIDGET PREDICTIVO IA (Probabilidades 1x2) */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1.5">
              <span>PREDICCIÓN IA</span>
              <span className="text-emerald-400 font-bold">Gana Local (58%)</span>
            </div>

            {/* Barra de Probabilidad Segmentada */}
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              <div className="h-full bg-emerald-500 rounded-l" style={{ width: '58%' }}></div>
              <div className="h-full bg-zinc-600" style={{ width: '24%' }}></div>
              <div className="h-full bg-zinc-700 rounded-r" style={{ width: '18%' }}></div>
            </div>

            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-medium">
              <span>Local 58%</span>
              <span>Empate 24%</span>
              <span>Visitante 18%</span>
            </div>

            {/* Micro-Insight AI */}
            <p className="text-xs text-zinc-400 italic mt-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
              💡 <span className="text-zinc-300">"Arsenal invicto en casa (8/8). Chelsea concede un promedio de 1.8 goles jugando fuera."</span>
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}