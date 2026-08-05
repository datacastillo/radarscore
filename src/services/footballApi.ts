import { Match } from '@/data/mockMatches';
import { calculatePoissonPrediction } from '@/lib/poissonEngine';

const getLeagueEmoji = (code?: string): string => {
  switch (code) {
    case 'PL':
      return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    case 'PD':
      return '🇪🇸';
    case 'CL':
      return '🇪🇺';
    case 'BL1':
      return '🇩🇪';
    case 'FL1':
      return '🇫🇷';
    case 'SA':
      return '🇮🇹';
    case 'DED':
      return '🇳🇱';
    case 'PPL':
      return '🇵🇹';
    default:
      return '⚽';
  }
};

export async function fetchRealMatches(): Promise<Match[] | null> {
  try {
    const response = await fetch('/api/matches');
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.matches || !Array.isArray(data.matches)) return null;

    const now = new Date();

    const getLocalDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateStr(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateStr(tomorrow);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateStr(yesterday);

    return data.matches.map((m: any) => {
      const matchDate = new Date(m.utcDate);
      const matchDateStr = getLocalDateStr(matchDate);

      // Categoría exacta según la fecha real de la API
      let dateCategory: 'AYER' | 'HOY' | 'MAÑANA' | 'LIVE' | 'PROXIMOS' = 'PROXIMOS';

      if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
        dateCategory = 'LIVE';
      } else if (matchDateStr === todayStr) {
        dateCategory = 'HOY';
      } else if (matchDateStr === tomorrowStr) {
        dateCategory = 'MAÑANA';
      } else if (matchDateStr === yesterdayStr) {
        dateCategory = 'AYER';
      } else if (matchDate > now) {
        dateCategory = 'PROXIMOS';
      } else {
        dateCategory = 'AYER';
      }

      // Formato exacto de hora local y fecha corta (ej: SÁB 15 AGO - 02:00 P.M.)
      const timeFormatted = matchDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const dayName = matchDate
        .toLocaleDateString('es-ES', { weekday: 'short' })
        .toUpperCase()
        .replace('.', '');

      const dayNum = matchDate.getDate();

      const monthName = matchDate
        .toLocaleDateString('es-ES', { month: 'short' })
        .toUpperCase()
        .replace('.', '');

      const timeLabel =
        matchDateStr === todayStr
          ? `HOY - ${timeFormatted}`
          : matchDateStr === tomorrowStr
          ? `MAÑANA - ${timeFormatted}`
          : `${dayName} ${dayNum} ${monthName} - ${timeFormatted}`;

      const homeTeamName = m.homeTeam?.shortName || m.homeTeam?.name || 'Local';
      const awayTeamName = m.awayTeam?.shortName || m.awayTeam?.name || 'Visitante';

      // 🧠 CÁLCULO DE LA PREDICCIÓN CUANTITATIVA (POISSON + CÓRNERS)
      const prediction = calculatePoissonPrediction(homeTeamName, awayTeamName, {
        homeGoalsScoredAvg: 1.6,
        homeGoalsConcededAvg: 1.0,
        awayGoalsScoredAvg: 1.2,
        awayGoalsConcededAvg: 1.5,
        homeCornersForAvg: 5.8,
        homeCornersAgainstAvg: 4.2,
        awayCornersForAvg: 4.3,
        awayCornersAgainstAvg: 5.6,
      });

      return {
        id: String(m.id),
        league: m.competition?.name
          ? m.competition.name.toUpperCase()
          : 'LIGA OFICIAL',
        flag: getLeagueEmoji(m.competition?.code),
        homeTeam: {
          name: homeTeamName,
          logo: m.homeTeam?.crest || '',
          form: ['V', 'E', 'V'],
        },
        awayTeam: {
          name: awayTeamName,
          logo: m.awayTeam?.crest || '',
          form: ['E', 'V', 'D'],
        },
        score: {
          home: m.score?.fullTime?.home ?? 0,
          away: m.score?.fullTime?.away ?? 0,
        },
        probs: {
          home: prediction.homeWinProb,
          draw: prediction.drawProb,
          away: prediction.awayWinProb,
        },
        probabilities: {
          home: prediction.homeWinProb,
          draw: prediction.drawProb,
          away: prediction.awayWinProb,
        },
        stats: {
          xg: [prediction.lambdaHome, prediction.lambdaAway],
          possession: [52, 48],
          shotsOnTarget: [5, 4],
          corners: [
            Math.round(prediction.corners.expectedCornersHome),
            Math.round(prediction.corners.expectedCornersAway),
          ],
        },
        status:
          m.status === 'IN_PLAY' || m.status === 'PAUSED'
            ? 'LIVE'
            : m.status === 'FINISHED'
            ? 'FT'
            : 'SCHEDULED',
        time: timeLabel,
        dateCategory: dateCategory as any,
        aiPrediction: {
          recommendation: prediction.recommendedPick,
          confidence: prediction.confidence,
          homeWin: prediction.homeWinProb,
          draw: prediction.drawProb,
          awayWin: prediction.awayWinProb,
          reasoning: prediction.recommendedPickReason,
          xGHome: prediction.lambdaHome,
          xGAway: prediction.lambdaAway,
          topCorrectScores: prediction.topCorrectScores,
          corners: prediction.corners,
        },
      };
    });
  } catch (error) {
    console.error('Error al transformar los datos de partidos:', error);
    return null;
  }
}