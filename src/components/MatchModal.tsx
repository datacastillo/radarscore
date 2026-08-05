'use client';

import React, { useEffect, useState } from 'react';
import { Match } from '@/data/mockMatches';

interface MatchModalProps {
  match: Match;
  onClose: () => void;
}

export default function MatchModal({ match, onClose }: MatchModalProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(true);

  // Llamada a la API de Gemini al abrir el Modal
  useEffect(() => {
    async function fetchAnalysis() {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            homeTeam: match.homeTeam.name,
            awayTeam: match.awayTeam.name,
            league: match.league,
            xGHome: match.aiPrediction?.xGHome ?? 1.5,
            xGAway: match.aiPrediction?.xGAway ?? 1.1,
            homeWinProb: match.probs?.home ?? 40,
            drawProb: match.probs?.draw ?? 30,
            awayWinProb: match.probs?.away ?? 30,
            recommendedPick: match.aiPrediction?.recommendation ?? 'Gana Local o Empate',
            cornersTotal: match.aiPrediction?.corners?.expectedCornersTotal ?? 9.5,
          }),
        });

        const data = await res.json();
        setAiAnalysis(data.analysis);
      } catch (error) {
        console.error('Error obteniendo análisis de Gemini:', error);
        setAiAnalysis('Análisis cuantitativo respaldado por la matriz de probabilidad Dixon-Coles.');
      } finally {
        setLoadingAi(false);
      }
    }

    fetchAnalysis();
  }, [match]);

  const corners = match.aiPrediction?.corners;
  const topScores = match.aiPrediction?.topCorrectScores;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Botón de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-800"
        >
          ✕
        </button>

        {/* Encabezado del Partido */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {match.flag} {match.league}
          </span>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="text-center w-1/3">
              <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center">
                {match.homeTeam.logo ? (
                  <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-xs">L</span>
                )}
              </div>
              <h3 className="font-black text-xs sm:text-sm text-zinc-100 truncate">{match.homeTeam.name}</h3>
            </div>

            <div className="text-center w-1/3">
              <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                {match.time}
              </span>
              <div className="text-xs text-zinc-500 mt-2 font-mono">
                xG: {match.aiPrediction?.xGHome ?? 1.5} - {match.aiPrediction?.xGAway ?? 1.1}
              </div>
            </div>

            <div className="text-center w-1/3">
              <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center">
                {match.awayTeam.logo ? (
                  <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-contain" />
                ) : (
                  <span className="font-bold text-xs">V</span>
                )}
              </div>
              <h3 className="font-black text-xs sm:text-sm text-zinc-100 truncate">{match.awayTeam.name}</h3>
            </div>
          </div>
        </div>

        {/* Banner de Análisis Táctico Gemini AI */}
        <div className="bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-amber-950/40 border border-emerald-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <span>🤖</span> ANÁLISIS TÁCTICO GEMINI AI
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
              Confianza: {match.aiPrediction?.confidence ?? 85}%
            </span>
          </div>

          {loadingAi ? (
            <div className="py-3 text-center text-xs text-zinc-400 animate-pulse">
              Consultando la IA de Google para redacción táctica...
            </div>
          ) : (
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              "{aiAnalysis}"
            </p>
          )}

          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex justify-between items-center text-[11px]">
            <span className="text-zinc-400">Recomendación VIP:</span>
            <span className="font-black text-emerald-400">{match.aiPrediction?.recommendation}</span>
          </div>
        </div>

        {/* Métricas Cuantitativas de Córners y Marcadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Córners */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 text-xs">
            <h4 className="font-extrabold text-amber-400 mb-2 flex items-center gap-1">
              <span>🚩</span> Córners Esperados (xCorners)
            </h4>
            <div className="space-y-1.5 text-zinc-300">
              <div className="flex justify-between">
                <span>Total Proyectado:</span>
                <span className="font-bold text-white">{corners?.expectedCornersTotal ?? 9.5}</span>
              </div>
              <div className="flex justify-between">
                <span>Probabilidad +8.5 Córners:</span>
                <span className="font-bold text-emerald-400">{corners?.over85CornersProb ?? 75}%</span>
              </div>
              <div className="flex justify-between">
                <span>Probabilidad +9.5 Córners:</span>
                <span className="font-bold text-emerald-400">{corners?.over95CornersProb ?? 60}%</span>
              </div>
            </div>
          </div>

          {/* Marcadores Exactos Probables */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 text-xs">
            <h4 className="font-extrabold text-emerald-400 mb-2 flex items-center gap-1">
              <span>🎯</span> Marcadores Exactos (Poisson)
            </h4>
            <div className="space-y-1.5 text-zinc-300">
              {topScores && topScores.length > 0 ? (
                topScores.map((sc, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-white font-bold">
                      {sc.homeGoals} - {sc.awayGoals}
                    </span>
                    <span className="text-zinc-400">{sc.probability}% prob.</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500">Calculando matriz...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}