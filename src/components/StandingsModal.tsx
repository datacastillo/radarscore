'use client';

import React, { useState } from 'react';

interface StandingsModalProps {
  leagueName: string;
  onClose: () => void;
}

const MOCK_TABLES: Record<string, Array<any>> = {
  'PREMIER LEAGUE': [
    { pos: 1, team: 'Arsenal', pj: 38, pg: 28, pe: 5, pp: 5, gf: 91, gc: 29, pts: 89, form: ['V', 'V', 'V'] },
    { pos: 2, team: 'Manchester City', pj: 38, pg: 28, pe: 4, pp: 6, gf: 96, gc: 34, pts: 88, form: ['V', 'E', 'V'] },
    { pos: 3, team: 'Liverpool', pj: 38, pg: 24, pe: 10, pp: 4, gf: 86, gc: 41, pts: 82, form: ['E', 'V', 'D'] },
    { pos: 4, team: 'Aston Villa', pj: 38, pg: 20, pe: 8, pp: 10, gf: 76, gc: 61, pts: 68, form: ['V', 'D', 'V'] },
    { pos: 5, team: 'Tottenham', pj: 38, pg: 20, pe: 6, pp: 12, gf: 74, gc: 61, pts: 66, form: ['D', 'V', 'V'] },
    { pos: 6, team: 'Chelsea', pj: 38, pg: 18, pe: 9, pp: 11, gf: 77, gc: 63, pts: 63, form: ['V', 'V', 'E'] },
    { pos: 7, team: 'Newcastle', pj: 38, pg: 18, pe: 6, pp: 14, gf: 85, gc: 62, pts: 60, form: ['E', 'D', 'V'] },
    { pos: 18, team: 'Luton Town', pj: 38, pg: 6, pe: 8, pp: 24, gf: 52, gc: 85, pts: 26, form: ['D', 'D', 'D'] },
    { pos: 19, team: 'Burnley', pj: 38, pg: 5, pe: 9, pp: 24, gf: 41, gc: 78, pts: 24, form: ['D', 'E', 'D'] },
    { pos: 20, team: 'Sheffield Utd', pj: 38, pg: 3, pe: 7, pp: 28, gf: 35, gc: 104, pts: 16, form: ['D', 'D', 'D'] },
  ],
  LALIGA: [
    { pos: 1, team: 'Real Madrid', pj: 38, pg: 29, pe: 8, pp: 1, gf: 87, gc: 26, pts: 95, form: ['V', 'V', 'V'] },
    { pos: 2, team: 'FC Barcelona', pj: 38, pg: 26, pe: 7, pp: 5, gf: 79, gc: 44, pts: 85, form: ['V', 'V', 'E'] },
    { pos: 3, team: 'Girona FC', pj: 38, pg: 25, pe: 6, pp: 7, gf: 85, gc: 46, pts: 81, form: ['V', 'D', 'V'] },
    { pos: 4, team: 'Atlético de Madrid', pj: 38, pg: 24, pe: 4, pp: 10, gf: 70, gc: 43, pts: 76, form: ['V', 'V', 'D'] },
    { pos: 5, team: 'Athletic Club', pj: 38, pg: 19, pe: 11, pp: 8, gf: 61, gc: 37, pts: 68, form: ['E', 'V', 'V'] },
  ],
};

export default function StandingsModal({ leagueName, onClose }: StandingsModalProps) {
  const [activeTab, setActiveTab] = useState<string>(
    leagueName.toUpperCase().includes('LALIGA') ? 'LALIGA' : 'PREMIER LEAGUE'
  );

  const standings = MOCK_TABLES[activeTab] || MOCK_TABLES['PREMIER LEAGUE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h3 className="text-lg font-black tracking-wider flex items-center gap-2">
              📊 TABLA OFICIAL DE POSICIONES
            </h3>
            <p className="text-xs text-zinc-400">Temporada Oficial 2025/2026</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-3 bg-zinc-950/40 border-b border-zinc-800/60">
          {['PREMIER LEAGUE', 'LALIGA'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'PREMIER LEAGUE' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League' : '🇪🇸 LaLiga'}
            </button>
          ))}
        </div>

        {/* Standings Table */}
        <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800 uppercase font-black tracking-wider">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Equipo</th>
                <th className="py-2.5 px-2 text-center">PJ</th>
                <th className="py-2.5 px-2 text-center">PG</th>
                <th className="py-2.5 px-2 text-center">PE</th>
                <th className="py-2.5 px-2 text-center">PP</th>
                <th className="py-2.5 px-2 text-center">DG</th>
                <th className="py-2.5 px-2 text-center font-bold text-emerald-400">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {standings.map((row) => {
                const isChampions = row.pos <= 4;
                const isRelegation = row.pos >= 18;

                return (
                  <tr
                    key={row.team}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      isChampions
                        ? 'bg-emerald-500/5'
                        : isRelegation
                        ? 'bg-rose-500/5'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-2 font-black">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                          isChampions
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isRelegation
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'text-zinc-400'
                        }`}
                      >
                        {row.pos}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-zinc-100">{row.team}</td>
                    <td className="py-3 px-2 text-center text-zinc-400">{row.pj}</td>
                    <td className="py-3 px-2 text-center text-zinc-400">{row.pg}</td>
                    <td className="py-3 px-2 text-center text-zinc-400">{row.pe}</td>
                    <td className="py-3 px-2 text-center text-zinc-400">{row.pp}</td>
                    <td className="py-3 px-2 text-center font-semibold text-zinc-300">
                      {row.gf - row.gc > 0 ? `+${row.gf - row.gc}` : row.gf - row.gc}
                    </td>
                    <td className="py-3 px-2 text-center font-black text-sm text-emerald-400">
                      {row.pts}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-zinc-950/60 border-t border-zinc-800 text-[10px] text-zinc-500 flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-emerald-500" /> Champions League
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-rose-500" /> Zona de Descenso
          </span>
        </div>
      </div>
    </div>
  );
}