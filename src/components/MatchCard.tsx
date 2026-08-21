'use client';

import React from 'react';
import { Match } from '@/data/mockMatches';
import InfoTooltip from '@/components/InfoTooltip';

interface MatchCardProps {
  match: Match;
  onSelect?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onSelect }) => {
  // 🛡️ Datos con fallbacks por defecto para garantizar cero errores de renderizado
  const homeForm = match.homeTeam?.form || ['V', 'E', 'V'];
  const awayForm = match.awayTeam?.form || ['E', 'V', 'D'];
  
  const homeProb = match.probs?.home ?? match.aiPrediction?.homeWin ?? 34;
  const drawProb = match.probs?.draw ?? match.aiPrediction?.draw ?? 33;
  const awayProb = match.probs?.away ?? match.aiPrediction?.awayWin ?? 33;

  const getFormBg = (val: string) => {
    switch (val.toUpperCase()) {
      case 'V':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'E':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'D':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(match)}
      className="bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 rounded-xl p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-950/20 group relative overflow-hidden"
    >
      {/* Cabecera: Hora/Estado y Confianza de IA */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {match.status === 'LIVE' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              EN VIVO
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-400/90 tracking-wide uppercase">
              {match.time || 'PROGRAMADO'}
            </span>
          )}
        </div>

        {match.aiPrediction?.confidence && (
          <span
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            🤖 IA Confianza: {match.aiPrediction.confidence}%
            <InfoTooltip text="Qué tan clara es la ventaja de un equipo sobre el otro según el modelo. No es una garantía de resultado." side="bottom" />
          </span>
        )}
      </div>

      {/* Aviso honesto cuando no hay estadísticas reales de temporada para
          este partido (típico en copas sin tabla de posiciones) — evita
          que una predicción genérica por defecto parezca un análisis
          completo */}
      {match.hasRealStats === false && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-3 flex items-center gap-1.5 text-[10px] text-amber-400/90 bg-amber-500/5 border border-amber-500/20 rounded-lg px-2.5 py-1.5"
        >
          <span>⚠️ Datos limitados para este partido</span>
          <InfoTooltip text="No encontramos estadísticas de temporada de ambos equipos (común en partidos de copa sin tabla de posiciones). La predicción usa valores neutros en vez de datos específicos del equipo." side="bottom" />
        </div>
      )}

      {/* Enfrentamiento principal de Equipos */}
      <div className="grid grid-cols-3 items-center my-4">
        {/* Local */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
            {match.homeTeam?.logo ? (
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20" />
            )}
          </div>
          <span className="font-bold text-sm text-zinc-100 line-clamp-1">
            {match.homeTeam?.name || 'Local'}
          </span>
          <div className="flex gap-1 text-[9px] font-bold">
            {homeForm.map((res, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded flex items-center justify-center ${getFormBg(res)}`}
              >
                {res}
              </span>
            ))}
          </div>
        </div>

        {/* Marcador o VS */}
        <div className="flex flex-col items-center justify-center">
          {match.status === 'LIVE' || match.status === 'FT' ? (
            <div className="flex items-center gap-2 text-2xl font-black text-white">
              <span>{match.score?.home ?? 0}</span>
              <span className="text-zinc-600 text-lg font-normal">-</span>
              <span>{match.score?.away ?? 0}</span>
            </div>
          ) : (
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black border border-emerald-500/20">
              VS
            </div>
          )}
          <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
            {match.league || 'LIGA'}
          </span>
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
            {match.awayTeam?.logo ? (
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500/20" />
            )}
          </div>
          <span className="font-bold text-sm text-zinc-100 line-clamp-1">
            {match.awayTeam?.name || 'Visitante'}
          </span>
          <div className="flex gap-1 text-[9px] font-bold">
            {awayForm.map((res, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded flex items-center justify-center ${getFormBg(res)}`}
              >
                {res}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sección Predicción e IA (Totalmente protegida) */}
      <div className="mt-5 pt-4 border-t border-zinc-800/60">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-zinc-400 font-medium">PREDICCIÓN IA</span>
          <span className="text-emerald-400 font-bold">
            {match.aiPrediction?.recommendation || 'Gana Local o Empate'}
          </span>
        </div>

        {/* Barra de Probabilidades */}
        <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex my-2">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${homeProb}%` }}
            title={`Local: ${homeProb}%`}
          />
          <div
            className="h-full bg-zinc-500 transition-all duration-500"
            style={{ width: `${drawProb}%` }}
            title={`Empate: ${drawProb}%`}
          />
          <div
            className="h-full bg-zinc-700 transition-all duration-500"
            style={{ width: `${awayProb}%` }}
            title={`Visitante: ${awayProb}%`}
          />
        </div>

        <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-0.5">
          <span>Local {homeProb}%</span>
          <span>Empate {drawProb}%</span>
          <span>Visitante {awayProb}%</span>
        </div>

        {/* Reasoning Note */}
        {match.aiPrediction?.reasoning && (
          <div className="mt-3 p-2.5 bg-zinc-800/40 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-300 italic flex items-start gap-2">
            <span>💡</span>
            <span>"{match.aiPrediction.reasoning}"</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default MatchCard;