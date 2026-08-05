import { Match } from '@/data/mockMatches';

export default function MatchCard({ match }: { match: Match }) {
  return (
    <div className="bg-[#121215] border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 transition-all duration-300 ai-glow mb-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 mb-4 border-b border-white/5 pb-2">
        <span className="flex items-center gap-1.5">
          {match.status === 'LIVE' && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-red-500 font-bold">EN VIVO · Min {match.minute}'</span>
            </>
          )}
          {match.status === 'SCHEDULED' && <span className="text-amber-400 font-bold">HOY · {match.time}</span>}
          {match.status === 'FINISHED' && <span className="text-zinc-500 font-bold">FINALIZADO</span>}
        </span>

        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
          🤖 IA Confianza: {match.aiConfidence}%
        </span>
      </div>

      {/* Marcador de Equipos */}
      <div className="grid grid-cols-3 items-center text-center my-4">
        {/* Local */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg">
            {match.homeTeam.icon}
          </div>
          <span className="font-bold text-sm">{match.homeTeam.name}</span>
          <div className="flex gap-1 text-[9px] font-bold">
            {match.homeTeam.form.map((res, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded flex items-center justify-center ${
                  res === 'V' ? 'bg-emerald-500/20 text-emerald-400' : res === 'D' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {res}
              </span>
            ))}
          </div>
        </div>

        {/* Marcador Central */}
        <div className="flex flex-col items-center">
          {match.status !== 'SCHEDULED' ? (
            <div className="text-3xl font-black tracking-widest text-white">
              {match.homeScore} <span className="text-zinc-600">-</span> {match.awayScore}
            </div>
          ) : (
            <div className="text-xl font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              VS
            </div>
          )}
          <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{match.stadium}</span>
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-lg">
            {match.awayTeam.icon}
          </div>
          <span className="font-bold text-sm">{match.awayTeam.name}</span>
          <div className="flex gap-1 text-[9px] font-bold">
            {match.awayTeam.form.map((res, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded flex items-center justify-center ${
                  res === 'V' ? 'bg-emerald-500/20 text-emerald-400' : res === 'D' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {res}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Widget Predictivo IA */}
      <div className="mt-5 pt-4 border-t border-white/5">
        <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1.5">
          <span>PREDICCIÓN IA</span>
          <span className="text-emerald-400 font-bold">{match.aiPrediction}</span>
        </div>

        <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex p-0.5 gap-0.5">
          <div className="h-full bg-emerald-500 rounded-l" style={{ width: `${match.probs.home}%` }}></div>
          <div className="h-full bg-zinc-600" style={{ width: `${match.probs.draw}%` }}></div>
          <div className="h-full bg-zinc-700 rounded-r" style={{ width: `${match.probs.away}%` }}></div>
        </div>

        <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-medium">
          <span>Local {match.probs.home}%</span>
          <span>Empate {match.probs.draw}%</span>
          <span>Visitante {match.probs.away}%</span>
        </div>

        <p className="text-xs text-zinc-400 italic mt-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
          💡 <span className="text-zinc-300">"{match.aiInsight}"</span>
        </p>
      </div>
    </div>
  );
}