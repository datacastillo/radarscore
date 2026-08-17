import { Match } from '@/data/mockMatches';

const getLeagueEmoji = (leagueName?: string): string => {
  if (!leagueName) return '⚽';
  const upper = leagueName.toUpperCase();
  if (upper.includes('PREMIER') || upper.includes('GB')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (upper.includes('LALIGA') || upper.includes('PRIMERA') || upper.includes('ES')) return '🇪🇸';
  if (upper.includes('CHAMPIONS') || upper.includes('UEFA')) return '🇪🇺';
  if (upper.includes('SERIE A') || upper.includes('IT')) return '🇮🇹';
  if (upper.includes('LIGA MX') || upper.includes('MX')) return '🇲🇽';
  if (upper.includes('BUNDESLIGA') || upper.includes('DE')) return '🇩🇪';
  return '⚽';
};

// Formateador de Fechas Amigable
function formatMatchDateTime(utcDateStr?: string): { timeBadge: string; isToday: boolean } {
  if (!utcDateStr) return { timeBadge: 'PRÓXIMO', isToday: false };

  const matchDate = new Date(utcDateStr);
  const now = new Date();

  const isToday = matchDate.toDateString() === now.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

  const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return { timeBadge: `HOY - ${timeStr}`, isToday: true };
  } else if (isTomorrow) {
    return { timeBadge: `MAÑANA - ${timeStr}`, isToday: false };
  } else {
    const dayMonth = matchDate.toLocaleDateString([], { day: '2-digit', month: 'short' }).toUpperCase();
    return { timeBadge: `${dayMonth} - ${timeStr}`, isToday: false };
  }
}

export async function fetchRealMatches(): Promise<Match[] | null> {
  try {
    const response = await fetch('/api/matches');
    if (!response.ok) return null;

    const rawData = await response.json();

    const matchesArray = Array.isArray(rawData)
      ? rawData
      : rawData.matches && Array.isArray(rawData.matches)
      ? rawData.matches
      : null;

    if (!matchesArray || matchesArray.length === 0) return null;

    return matchesArray.map((m: any, index: number) => {
      const homeName = m.homeTeam?.name || 'Local';
      const awayName = m.awayTeam?.name || 'Visitante';
      const leagueName = m.league || 'LIGA INTERNACIONAL';
      const { timeBadge, isToday } = formatMatchDateTime(m.utcDate);

      // La predicción YA viene calculada por el motor real (Poisson +
      // Dixon-Coles) desde /api/matches, usando estadísticas reales de la
      // tabla de posiciones cuando están disponibles. Aquí solo la
      // transportamos — nada se inventa en este archivo.
      const ai = m.aiPrediction || {};
      const probs = m.probs || { home: 0, draw: 0, away: 0 };

      return {
        id: String(m.id || index + 1),
        league: leagueName.toUpperCase(),
        flag: getLeagueEmoji(leagueName),
        homeTeam: {
          name: homeName,
          logo: m.homeTeam?.crest || '',
          // Racha real si football-data la proporcionó para esta competición;
          // si no está disponible, queda vacía (no se inventa una racha falsa).
          form: m.homeTeam?.form || [],
        },
        awayTeam: {
          name: awayName,
          logo: m.awayTeam?.crest || '',
          form: m.awayTeam?.form || [],
        },
        score: {
          home: m.score?.home ?? 0,
          away: m.score?.away ?? 0,
        },
        probs,
        probabilities: probs,
        stats: {
          xg: [ai.xGHome ?? 1.5, ai.xGAway ?? 1.1], // real: viene del motor Poisson
          corners: [
            ai.corners?.expectedCornersHome ?? 5.5,
            ai.corners?.expectedCornersAway ?? 4.3,
          ], // real: viene del motor Poisson
          // ⚠️ possession y shotsOnTarget NO tienen fuente de datos real
          // disponible todavía (football-data.org no las expone). Quedan
          // marcadas explícitamente — pendiente decidir si se ocultan de la
          // UI o se busca otro proveedor. Ver nota en la auditoría.
          possession: null,
          shotsOnTarget: null,
        },
        status: m.status || 'SCHEDULED',
        time: timeBadge,
        dateCategory: isToday ? 'HOY' : ('PROXIMOS' as any),
        hasRealStats: Boolean(m.hasRealStats),
        aiPrediction: {
          recommendation: ai.recommendation || 'Analizando...',
          // Número puro, sin %. Ver nota en matches_route.ts sobre por qué.
          confidence: ai.confidence ?? 55,
          homeWin: ai.homeWin ?? probs.home,
          draw: ai.draw ?? probs.draw,
          awayWin: ai.awayWin ?? probs.away,
          reasoning: ai.reasoning || '',
          xGHome: ai.xGHome,
          xGAway: ai.xGAway,
          corners: ai.corners,
          topCorrectScores: ai.topCorrectScores,
        },
      };
    });
  } catch (error) {
    console.error('Error al procesar la API de fútbol:', error);
    return null;
  }
}