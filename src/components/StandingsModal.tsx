'use client';

import { useState, useEffect } from 'react';

interface StandingsModalProps {
  leagueName: string;
  onClose: () => void;
}

// Mapeo inteligente del nombre de la liga al código oficial de la API
const getLeagueCode = (name: string): string => {
  const lower = name.toLowerCase();
  
  if (lower.includes('eredivisie')) return 'DED';
  if (lower.includes('primeira') || lower.includes('portugal')) return 'PPL';
  if (lower.includes('premier')) return 'PL';
  if (lower.includes('laliga') || lower.includes('primera') || lower.includes('españa')) return 'PD';
  if (lower.includes('bundesliga')) return 'BL1';
  if (lower.includes('serie a') || lower.includes('italia')) return 'SA';
  if (lower.includes('champions')) return 'CL';
  if (lower.includes('ligue 1') || lower.includes('francia')) return 'FL1';
  
  return 'PL'; // Default fallback
};

export default function StandingsModal({ leagueName, onClose }: StandingsModalProps) {
  const [table, setTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const leagueCode = getLeagueCode(leagueName);

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/standings?league=${leagueCode}`);
        if (!res.ok) throw new Error('Error al cargar la tabla');
        const data = await res.json();
        
        if (data.standings && data.standings.length > 0) {
          setTable(data.standings[0].table || []);
        } else {
          setTable([]);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la tabla de posiciones.');
      } finally {
        setLoading(false);
      }
    }
    fetchStandings();
  }, [leagueCode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-zinc-100 max-h-[85vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="text-sm font-black tracking-widest text-emerald-400 uppercase">
              TABLA DE POSICIONES - {leagueName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabla */}
        <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {loading ? (
            <div className="py-12 text-center text-zinc-500 animate-pulse text-xs">
              Cargando clasificación oficial de {leagueName}...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-zinc-400 text-xs">{error}</div>
          ) : table.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-extrabold uppercase text-[10px]">
                    <th className="py-2.5 px-2">#</th>
                    <th className="py-2.5 px-2">Equipo</th>
                    <th className="py-2.5 px-2 text-center">PJ</th>
                    <th className="py-2.5 px-2 text-center">G</th>
                    <th className="py-2.5 px-2 text-center">E</th>
                    <th className="py-2.5 px-2 text-center">P</th>
                    <th className="py-2.5 px-2 text-center">DG</th>
                    <th className="py-2.5 px-2 text-center font-black text-emerald-400">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 font-medium">
                  {table.map((row) => (
                    <tr key={row.team?.id || row.position} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-2.5 px-2 font-black text-zinc-400">{row.position}</td>
                      <td className="py-2.5 px-2 flex items-center gap-2">
                        {row.team?.crest && (
                          <img src={row.team.crest} alt={row.team.name} className="w-4 h-4 object-contain" />
                        )}
                        <span className="truncate font-bold text-zinc-200">{row.team?.shortName || row.team?.name}</span>
                      </td>
                      <td className="py-2.5 px-2 text-center text-zinc-400">{row.playedGames}</td>
                      <td className="py-2.5 px-2 text-center text-zinc-400">{row.won}</td>
                      <td className="py-2.5 px-2 text-center text-zinc-400">{row.draw}</td>
                      <td className="py-2.5 px-2 text-center text-zinc-400">{row.lost}</td>
                      <td className="py-2.5 px-2 text-center text-zinc-400">{row.goalDifference}</td>
                      <td className="py-2.5 px-2 text-center font-extrabold text-emerald-400">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No hay datos de tabla disponibles para esta competición.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}