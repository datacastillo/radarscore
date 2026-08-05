import { MOCK_STANDINGS } from '@/data/mockStandings';

export default function StandingsModal({ leagueKey, onClose }: { leagueKey: string | null; onClose: () => void }) {
  if (!leagueKey || !MOCK_STANDINGS[leagueKey]) return null;

  const data = MOCK_STANDINGS[leagueKey];

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
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">{data.flag}</span>
          <div>
            <h2 className="text-lg font-bold text-white">{data.leagueName}</h2>
            <p className="text-xs text-zinc-400">Tabla de Posiciones Oficial</p>
          </div>
        </div>

        {/* Tabla de clasificación */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-500 font-semibold uppercase text-[10px]">
                <th className="pb-2 pl-2">#</th>
                <th className="pb-2">Equipo</th>
                <th className="pb-2 text-center">PJ</th>
                <th className="pb-2 text-center">G</th>
                <th className="pb-2 text-center">E</th>
                <th className="pb-2 text-center">P</th>
                <th className="pb-2 text-center">DG</th>
                <th className="pb-2 text-right pr-2">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.teams.map((t) => (
                <tr key={t.team} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 pl-2 font-bold text-zinc-400">{t.position}</td>
                  <td className="py-2.5 font-bold flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="text-white">{t.team}</span>
                  </td>
                  <td className="py-2.5 text-center text-zinc-400">{t.played}</td>
                  <td className="py-2.5 text-center text-emerald-400">{t.won}</td>
                  <td className="py-2.5 text-center text-zinc-400">{t.drawn}</td>
                  <td className="py-2.5 text-center text-red-400">{t.lost}</td>
                  <td className="py-2.5 text-center text-zinc-400">{t.gd}</td>
                  <td className="py-2.5 text-right pr-2 font-black text-emerald-400 text-sm">{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}