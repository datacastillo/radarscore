'use client';

import React from 'react';
import { Match } from '@/data/mockMatches';

interface MatchModalProps {
  match: Match;
  onClose: () => void;
}

// Auxiliar seguro para parsear arreglos u objetos en TypeScript
function getValue(stat: any, key: 'home' | 'away', index: 0 | 1, fallback: number): number {
  if (!stat) return fallback;
  if (Array.isArray(stat)) {
    return typeof stat[index] === 'number' ? stat[index] : fallback;
  }
  if (typeof stat === 'object' && stat !== null) {
    return typeof stat[key] === 'number' ? stat[key] : fallback;
  }
  return fallback;
}

export default function MatchModal({ match, onClose }: MatchModalProps) {
  // Extracción ultra-segura para TypeScript
  const homeXG = getValue(match.stats?.xg, 'home', 0, 1.5);
  const awayXG = getValue(match.stats?.xg, 'away', 1, 0.9);

  const homePoss = getValue(match.stats?.possession, 'home', 0, 52);
  const awayPoss = getValue(match.stats?.possession, 'away', 1, 48);

  const homeShots = getValue(match.stats?.shotsOnTarget, 'home', 0, 5);
  const awayShots = getValue(match.stats?.shotsOnTarget, 'away', 1, 3);

  const homeCorners = getValue(match.stats?.corners, 'home', 0, 6);
  const awayCorners = getValue(match.stats?.corners, 'away', 1, 4);

  const homeWinProb = match.aiPrediction?.homeWin ?? match.probs?.home ?? 50;
  const drawProb = match.aiPrediction?.draw ?? match.probs?.draw ?? 28;
  const awayWinProb = match.aiPrediction?.awayWin ?? match.probs?.away ?? 22;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-zinc-100 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{match.flag || '⚽'}</span>
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              {match.league}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Enfrentamiento */}
          <div className="grid grid-cols-3 items-center bg-zinc-950/40 p-5 rounded-xl border border-zinc-800/50">
            {/* Local */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center p-2.5 shadow-md">
                {match.homeTeam?.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20" />
                )}
              </div>
              <span className="font-extrabold text-sm">{match.homeTeam?.name || 'Local'}</span>
            </div>

            {/* Marcador / Estado */}
            <div className="flex flex-col items-center justify-center text-center">
              {match.status === 'LIVE' || match.status === 'FT' ? (
                <div className="text-3xl font-black text-white tracking-wider">
                  {match.score?.home ?? 0} - {match.score?.away ?? 0}
                </div>
              ) : (
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black border border-emerald-500/30">
                  VS
                </div>
              )}
              <span className="text-[11px] text-amber-400 font-semibold mt-2">{match.time}</span>
            </div>

            {/* Visitante */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center p-2.5 shadow-md">
                {match.awayTeam?.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-500/20" />
                )}
              </div>
              <span className="font-extrabold text-sm">{match.awayTeam?.name || 'Visitante'}</span>
            </div>
          </div>

          {/* Análisis de IA */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🤖</span> PREDICCIÓN Y ANÁLISIS IA
              </span>
              <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                Confianza: {match.aiPrediction?.confidence ?? 88}%
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "{match.aiPrediction?.reasoning || 'Análisis automatizado generado con métricas avanzadas.'}"
            </p>
          </div>

          {/* Probabilidades de Victoria */}
          <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-400">
              <span>Local {homeWinProb}%</span>
              <span>Empate {drawProb}%</span>
              <span>Visitante {awayWinProb}%</span>
            </div>
            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: `${homeWinProb}%` }} />
              <div className="h-full bg-zinc-500" style={{ width: `${drawProb}%` }} />
              <div className="h-full bg-rose-500" style={{ width: `${awayWinProb}%` }} />
            </div>
          </div>

          {/* Estadísticas de Partido */}
          <div className="space-y-3 bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/50">
            <h4 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase mb-3">
              📊 Estadísticas Avanzadas
            </h4>

            {/* xG */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">{homeXG} xG</span>
                <span className="text-zinc-400">Goles Esperados (xG)</span>
                <span className="text-emerald-400">{awayXG} xG</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(homeXG / (homeXG + awayXG || 1)) * 100}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${(awayXG / (homeXG + awayXG || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Posesión */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">{homePoss}%</span>
                <span className="text-zinc-400">Posesión de Balón</span>
                <span className="text-emerald-400">{awayPoss}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${homePoss}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${awayPoss}%` }} />
              </div>
            </div>

            {/* Tiros al Arco */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">{homeShots}</span>
                <span className="text-zinc-400">Tiros al Arco</span>
                <span className="text-emerald-400">{awayShots}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(homeShots / (homeShots + awayShots || 1)) * 100}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${(awayShots / (homeShots + awayShots || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Córners */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">{homeCorners}</span>
                <span className="text-zinc-400">Tiros de Esquina</span>
                <span className="text-emerald-400">{awayCorners}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(homeCorners / (homeCorners + awayCorners || 1)) * 100}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${(awayCorners / (homeCorners + awayCorners || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}