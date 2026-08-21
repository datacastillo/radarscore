'use client';

import React from 'react';
import { Match } from '@/data/mockMatches';
import InfoTooltip from '@/components/InfoTooltip';

interface PickOfTheDayProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

// Jerarquía de Ligas para ponderar importancia.
// Usa coincidencia por substring en mayúsculas (mismo patrón que
// getLeagueEmoji en footballApi.ts) porque el nombre real que entrega
// football-data.org no siempre coincide exacto con el nombre "bonito"
// (ej. Champions League se llama "UEFA Champions League", La Liga se
// llama "Primera Division"), y footballApi.ts guarda la liga en
// MAYÚSCULAS — un lookup exacto por objeto nunca hacía match.
function getLeaguePriority(leagueName?: string): number {
  if (!leagueName) return 50;
  const upper = leagueName.toUpperCase();
  // "Championship" (2da división inglesa) contiene "CHAMPIONS" como
  // substring — se revisa antes para no confundirla con Champions League.
  if (upper.includes('CHAMPIONSHIP')) return 60;
  if (upper.includes('CHAMPIONS LEAGUE') || upper.includes('UEFA CHAMPIONS')) return 100;
  if (upper.includes('PREMIER')) return 90;
  if (upper.includes('PRIMERA') || upper.includes('LALIGA') || upper.includes('LA LIGA')) return 85;
  if (upper.includes('BUNDESLIGA')) return 80;
  if (upper.includes('SERIE A')) return 80;
  if (upper.includes('EREDIVISIE')) return 70;
  if (upper.includes('PRIMEIRA LIGA')) return 70;
  return 50;
}

export default function PickOfTheDay({ matches, onSelectMatch }: PickOfTheDayProps) {
  if (!matches || matches.length === 0) return null;

  // 1. Filtrar partidos no finalizados (casting seguro a string para TypeScript)
  const pendingMatches = matches.filter((m) => {
    const status = (m.status as string) || '';
    return status !== 'FT' && status !== 'FINISHED' && status !== 'POSTPONED' && status !== 'CANCELLED';
  });

  const pool = pendingMatches.length > 0 ? pendingMatches : matches;

  // Si hay partidos con estadísticas reales de equipo disponibles, se
  // prioriza ese grupo — evita destacar como "Pick del Día" un partido
  // cuya predicción salió de los valores neutros por defecto (que se ven
  // genéricos/repetidos entre distintos partidos sin datos).
  const withRealStats = pool.filter((m: any) => m.hasRealStats);
  const finalPool = withRealStats.length > 0 ? withRealStats : pool;

  // 2. Selección algorítmica del mejor partido
  const bestMatch = [...finalPool].sort((a, b) => {
    const confA = a.aiPrediction?.confidence ?? 75;
    const confB = b.aiPrediction?.confidence ?? 75;

    const homeA = a.aiPrediction?.homeWin ?? a.probs?.home ?? 33;
    const awayA = a.aiPrediction?.awayWin ?? a.probs?.away ?? 33;
    const marginA = Math.abs(homeA - awayA);

    const homeB = b.aiPrediction?.homeWin ?? b.probs?.home ?? 33;
    const awayB = b.aiPrediction?.awayWin ?? b.probs?.away ?? 33;
    const marginB = Math.abs(homeB - awayB);

    const prioA = getLeaguePriority(a.league);
    const prioB = getLeaguePriority(b.league);

    const scoreA = confA * 1.5 + marginA * 0.5 + prioA;
    const scoreB = confB * 1.5 + marginB * 0.5 + prioB;

    return scoreB - scoreA;
  })[0];

  if (!bestMatch) return null;

  // Extracción de métricas
  const homeWin = bestMatch.aiPrediction?.homeWin ?? bestMatch.probs?.home ?? 50;
  const awayWin = bestMatch.aiPrediction?.awayWin ?? bestMatch.probs?.away ?? 30;
  const confidence = bestMatch.aiPrediction?.confidence ?? 88;

  // Determinación inteligente de la recomendación de apuesta
  let recommendation = 'Victoria Directa';
  const targetTeam = homeWin >= awayWin ? bestMatch.homeTeam?.name : bestMatch.awayTeam?.name;
  const maxWin = Math.max(homeWin, awayWin);

  if (maxWin >= 62) {
    recommendation = `Gana ${targetTeam}`;
  } else if (maxWin >= 45) {
    recommendation = `Doble Oportunidad: ${targetTeam} o Empate`;
  } else {
    recommendation = 'Más de 1.5 Goles en el Partido';
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-emerald-950/40 border border-amber-500/40 p-5 shadow-2xl mb-6 group hover:border-amber-500/70 transition-all duration-300">
      {/* Luces de Neón de Fondo */}
      <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
      <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

      {/* Cabecera VIP */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
            👑 PICK DEL DÍA - RECOMENDACIÓN IA
          </span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
            Confianza IA
            <InfoTooltip text="Qué tan clara es la ventaja de un equipo sobre el otro según el modelo estadístico. No es una garantía de resultado." side="bottom" />
          </span>
          <span className="text-xs font-black text-emerald-400">{confidence}%</span>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Enfrentamiento */}
        <div className="md:col-span-7 flex items-center justify-between bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/60">
          {/* Local */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700/60 flex items-center justify-center p-1.5 shadow-sm">
              {bestMatch.homeTeam?.logo ? (
                <img src={bestMatch.homeTeam.logo} alt={bestMatch.homeTeam.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-bold">L</span>
              )}
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-zinc-100 max-w-[100px] truncate">
              {bestMatch.homeTeam?.name}
            </span>
          </div>

          {/* VS & Liga */}
          <div className="text-center px-2">
            <span className="text-[9px] font-black text-amber-400 block uppercase tracking-wider">
              {bestMatch.league}
            </span>
            <span className="text-xs font-bold text-zinc-400">{bestMatch.time}</span>
          </div>

          {/* Visitante */}
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-xs sm:text-sm text-zinc-100 max-w-[100px] truncate text-right">
              {bestMatch.awayTeam?.name}
            </span>
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700/60 flex items-center justify-center p-1.5 shadow-sm">
              {bestMatch.awayTeam?.logo ? (
                <img src={bestMatch.awayTeam.logo} alt={bestMatch.awayTeam.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-bold">V</span>
              )}
            </div>
          </div>
        </div>

        {/* Pronóstico Recomendado & CTA */}
        <div className="md:col-span-5 flex flex-col justify-between h-full gap-2.5 bg-gradient-to-br from-zinc-950/80 to-zinc-900/80 p-3.5 rounded-xl border border-zinc-800/80">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              🎯 Selección Recomendada
            </span>
            <p className="text-xs font-black text-emerald-400 mt-0.5 truncate">
              {recommendation}
            </p>
          </div>

          <button
            onClick={() => onSelectMatch(bestMatch)}
            className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-black text-xs rounded-lg transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
          >
            <span>VER ANÁLISIS DETALLADO</span>
            <span className="text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}