import { NextResponse } from 'next/server';
import { calculatePoissonPrediction, TeamStatsInput } from '@/lib/poissonEngine';

// Protege el límite de 10 peticiones/min del plan gratuito de football-data.org:
// como máximo consultamos standings de N competiciones distintas por request.
const MAX_STANDINGS_LOOKUPS = 8;

interface TeamSeasonStats {
  goalsScoredAvg: number;
  goalsConcededAvg: number;
  recentFormPoints?: number[];   // [3,1,0,3,3] = W,D,L,W,W en puntos, para el motor
  recentFormLetters?: string[];  // ['V','E','D','V','V'], para mostrar en UI
}

// Trae la tabla de posiciones REAL de una competición y arma un mapa
// team.id -> estadísticas reales (nada inventado). Si la petición falla,
// regresa un mapa vacío — el motor simplemente usará sus valores neutros
// por defecto para esos equipos, nunca datos falsos.
async function fetchStandingsMap(
  competitionCode: string,
  apiKey: string
): Promise<Map<number, TeamSeasonStats>> {
  const statsMap = new Map<number, TeamSeasonStats>();

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${competitionCode}/standings`,
      {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 3600 }, // Caché 1 hora — igual que api/standings
      }
    );

    if (!res.ok) return statsMap;

    const data = await res.json();
    const totalTable = (data.standings || []).find((s: any) => s.type === 'TOTAL');
    const table = totalTable?.table || [];

    for (const row of table) {
      const played = row.playedGames || 0;
      if (played <= 0 || !row.team?.id) continue;

      let recentFormPoints: number[] | undefined;
      let recentFormLetters: string[] | undefined;

      if (typeof row.form === 'string' && row.form.trim().length > 0) {
        const results = row.form.split(',').map((r: string) => r.trim().toUpperCase());
        recentFormPoints = results.map((r: string) => (r === 'W' ? 3 : r === 'D' ? 1 : 0));
        recentFormLetters = results.map((r: string) => (r === 'W' ? 'V' : r === 'D' ? 'E' : 'D'));
      }

      statsMap.set(row.team.id, {
        goalsScoredAvg: (row.goalsFor ?? 0) / played,
        goalsConcededAvg: (row.goalsAgainst ?? 0) / played,
        recentFormPoints,
        recentFormLetters,
      });
    }
  } catch (err) {
    console.error(`Error al obtener standings de ${competitionCode}:`, err);
  }

  return statsMap;
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Falta FOOTBALL_DATA_KEY',
        message: 'Agrega FOOTBALL_DATA_KEY=tu_clave en .env.local',
      },
      { status: 400 }
    );
  }

  try {
    // 📅 Obtener fecha local EXACTA en formato YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateFrom = `${year}-${month}-${day}`;

    // Ventana de 7 días hacia adelante
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 7);
    const fYear = futureDate.getFullYear();
    const fMonth = String(futureDate.getMonth() + 1).padStart(2, '0');
    const fDay = String(futureDate.getDate()).padStart(2, '0');
    const dateTo = `${fYear}-${fMonth}-${fDay}`;

    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 300 }, // Caché 5 min
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Error en API de Football-Data', details: errorData },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Filtrar solo partidos de HOY EN ADELANTE que no hayan finalizado
    const activeMatches = (data.matches || []).filter((m: any) => {
      const matchTime = new Date(m.utcDate).getTime();
      return (
        m.status !== 'FINISHED' &&
        m.status !== 'CANCELLED' &&
        matchTime >= now.getTime() - 2 * 60 * 60 * 1000
      );
    });

    // Ordenar cronológicamente
    activeMatches.sort(
      (a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    );

    // 1. Competiciones únicas presentes en los partidos (limitado para
    //    proteger el rate limit del plan gratuito)
    const rawCodes: (string | undefined)[] = activeMatches.map(
      (m: any) => m.competition?.code as string | undefined
    );
    const validCodes: string[] = rawCodes.filter(
      (code: string | undefined): code is string => Boolean(code)
    );
    const uniqueCodes: string[] = Array.from(new Set<string>(validCodes)).slice(
      0,
      MAX_STANDINGS_LOOKUPS
    );

    // 2. Traer standings reales de cada competición UNA sola vez, en paralelo
    const standingsEntries: [string, Map<number, TeamSeasonStats>][] = await Promise.all(
      uniqueCodes.map(async (code: string): Promise<[string, Map<number, TeamSeasonStats>]> => {
        const map = await fetchStandingsMap(code, apiKey);
        return [code, map];
      })
    );
    const standingsByCompetition = new Map<string, Map<number, TeamSeasonStats>>(standingsEntries);

    // 3. Armar cada partido con predicción REAL (Poisson + Dixon-Coles),
    //    usando goles a favor/en contra y racha reciente de la tabla oficial.
    const realMatches = activeMatches.map((m: any) => {
      const homeName = m.homeTeam?.name || 'Local';
      const awayName = m.awayTeam?.name || 'Visitante';
      const competitionCode = m.competition?.code;

      const teamStatsMap = competitionCode ? standingsByCompetition.get(competitionCode) : undefined;
      const homeStats = teamStatsMap?.get(m.homeTeam?.id);
      const awayStats = teamStatsMap?.get(m.awayTeam?.id);

      const statsInput: TeamStatsInput | undefined =
        homeStats || awayStats
          ? {
              homeGoalsScoredAvg: homeStats?.goalsScoredAvg,
              homeGoalsConcededAvg: homeStats?.goalsConcededAvg,
              awayGoalsScoredAvg: awayStats?.goalsScoredAvg,
              awayGoalsConcededAvg: awayStats?.goalsConcededAvg,
              recentFormHome: homeStats?.recentFormPoints,
              recentFormAway: awayStats?.recentFormPoints,
            }
          : undefined;

      // Si no hay stats reales disponibles para ninguno de los dos equipos
      // (ej. partido amistoso, copa sin standings), el motor usa sus valores
      // neutros por defecto — nunca inventa una ventaja inexistente, y la
      // confianza sale honestamente más baja.
      const prediction = calculatePoissonPrediction(homeName, awayName, statsInput);

      return {
        id: String(m.id),
        league: m.competition?.name || 'LIGA INTERNACIONAL',
        competitionCode: competitionCode || null,
        match: `${homeName} vs ${awayName}`,
        homeTeam: {
          name: homeName,
          shortName: m.homeTeam?.shortName || homeName,
          crest: m.homeTeam?.crest || '',
          form: homeStats?.recentFormLetters || null,
        },
        awayTeam: {
          name: awayName,
          shortName: m.awayTeam?.shortName || awayName,
          crest: m.awayTeam?.crest || '',
          form: awayStats?.recentFormLetters || null,
        },
        score: {
          home: m.score?.fullTime?.home ?? 0,
          away: m.score?.fullTime?.away ?? 0,
        },
        status: m.status,
        utcDate: m.utcDate,
        hasRealStats: Boolean(homeStats && awayStats),
        probs: {
          home: prediction.homeWinProb,
          draw: prediction.drawProb,
          away: prediction.awayWinProb,
        },
        aiPrediction: {
          recommendation: prediction.recommendedPick,
          reasoning: prediction.recommendedPickReason,
          confidence: `${prediction.confidence}%`,
          homeWin: prediction.homeWinProb,
          draw: prediction.drawProb,
          awayWin: prediction.awayWinProb,
          xGHome: prediction.lambdaHome,
          xGAway: prediction.lambdaAway,
          corners: prediction.corners,
          topCorrectScores: prediction.topCorrectScores,
        },
      };
    });

    return NextResponse.json(realMatches);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error?.message },
      { status: 500 }
    );
  }
}