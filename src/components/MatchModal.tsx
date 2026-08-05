import { Match } from '@/data/mockMatches';

export default function MatchModal({ match, onClose }: { match: Match | null; onClose: () => void }) {
  if (!match) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase bg-zinc-800 px-3 py-1 rounded-full border border-white/5">
            {match.flag} {match.league}
          </span>
          <h2 className="text-xl font-bold mt-3 text-white">Análisis Avanzado IA</h2>
          <p className="text-xs text-zinc-400">{match.stadium}</p>
        </div>

        {/* Marcador */}
        <div className="flex items-center justify-between my-6 px-4">
          <div className="text-center">
            <div className="text-3xl mb-1">{match.homeTeam.icon}</div>
            <p className="font-bold text-sm">{match.homeTeam.name}</p>
          </div>

          <div className="text-center">
            {match.status !== 'SCHEDULED' ? (
              <span className="text-3xl font-black">{match.homeScore} - {match.awayScore}</span>
            ) : (
              <span className="text-lg font-bold text-emerald-400">{match.time}</span>
            )}
            <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">{match.status}</p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-1">{match.awayTeam.icon}</div>
            <p className="font-bold text-sm">{match.awayTeam.name}</p>
          </div>
        </div>

        {/* Estadísticas Comparativas */}
        {match.stats && (
          <div className="space-y-4 my-6 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-3">Métricas del Partido</h3>
            
            {/* xG */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">{match.stats.xg[0]} xG</span>
                <span className="text-zinc-400">Goles Esperados (xG)</span>
                <span className="text-emerald-400">{match.stats.xg[1]} xG</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full flex overflow-hidden">
                <div className="bg-emerald-500" style={{ width: `${(match.stats.xg[0] / (match.stats.xg[0] + match.stats.xg[1])) * 100}%` }}></div>
                <div className="bg-emerald-400/30" style={{ width: `${(match.stats.xg[1] / (match.stats.xg[0] + match.stats.xg[1])) * 100}%` }}></div>
              </div>
            </div>

            {/* Posesión */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{match.stats.possession[0]}%</span>
                <span className="text-zinc-400">Posesión de Balón</span>
                <span>{match.stats.possession[1]}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full flex overflow-hidden">
                <div className="bg-zinc-400" style={{ width: `${match.stats.possession[0]}%` }}></div>
                <div className="bg-zinc-600" style={{ width: `${match.stats.possession[1]}%` }}></div>
              </div>
            </div>

            {/* Tiros a puerta */}
            <div className="flex justify-between text-xs font-semibold text-zinc-300 pt-2 border-t border-white/5">
              <span>{match.stats.shotsOnTarget[0]}</span>
              <span className="text-zinc-500">Tiros al Arco</span>
              <span>{match.stats.shotsOnTarget[1]}</span>
            </div>
          </div>
        )}

        {/* Conclusión IA */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs">
          <p className="text-emerald-400 font-bold mb-1">🤖 Dictamen del Algoritmo:</p>
          <p className="text-zinc-300 italic">"{match.aiInsight}"</p>
        </div>

      </div>
    </div>
  );
}