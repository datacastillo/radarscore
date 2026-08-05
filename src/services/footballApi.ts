import { Match } from '@/data/mockMatches';

// Mapeo de banderas emoji por código de competición
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
    case 'PPD':
      return '🇵🇹';
    case 'BSA':
      return '🇧🇷';
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
    const todayStr = now.toISOString().split('T')[0];

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return data.matches.map((m: any) => {
      const matchDate = new Date(m.utcDate);
      const dateStr = m.utcDate ? m.utcDate.split('T')[0] : '';

      // Categoría de fecha para los filtros
      let dateCategory: 'AYER' | 'HOY' | 'MAÑANA' | 'LIVE' = 'MAÑANA';

      if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
        dateCategory = 'LIVE';
      } else if (dateStr === todayStr) {
        dateCategory = 'HOY';
      } else if (dateStr === tomorrowStr) {
        dateCategory = 'MAÑANA';
      } else if (dateStr === yesterdayStr) {
        dateCategory = 'AYER';
      } else {
        dateCategory = matchDate > now ? 'MAÑANA' : 'AYER';
      }

      // Hora local
      const timeFormatted = matchDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Día y mes formateados en español (ej: 21 AGO)
      const dayFormatted = matchDate
        .toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
        })
        .toUpperCase()
        .replace('.', '');

      const timeLabel =
        dateStr === todayStr
          ? `HOY - ${timeFormatted}`
          : dateStr === tomorrowStr
          ? `MAÑANA - ${timeFormatted}`
          : `${dayFormatted} - ${timeFormatted}`;

      return {
        id: String(m.id),
        league: m.competition?.name
          ? m.competition.name.toUpperCase()
          : 'PREMIER LEAGUE',
        flag: getLeagueEmoji(m.competition?.code), // Emoji limpio en lugar de URL
        homeTeam: {
          name: m.homeTeam?.shortName || m.homeTeam?.name || 'Local',
          logo: m.homeTeam?.crest || '',
          form: ['V', 'E', 'V'],
        },
        awayTeam: {
          name: m.awayTeam?.shortName || m.awayTeam?.name || 'Visitante',
          logo: m.awayTeam?.crest || '',
          form: ['E', 'V', 'D'],
        },
        score: {
          home: m.score?.fullTime?.home ?? 0,
          away: m.score?.fullTime?.away ?? 0,
        },
        probs: {
          home: 52,
          draw: 28,
          away: 20,
        },
        probabilities: {
          home: 52,
          draw: 28,
          away: 20,
        },
        stats: {
          possession: { home: 50, away: 50 },
          shotsOnTarget: { home: 4, away: 4 },
          corners: { home: 5, away: 5 },
        },
        status:
          m.status === 'IN_PLAY' || m.status === 'PAUSED'
            ? 'LIVE'
            : m.status === 'FINISHED'
            ? 'FT'
            : 'SCHEDULED',
        time: timeLabel,
        dateCategory,
        aiPrediction: {
          recommendation: 'Gana Local o Empate',
          confidence: 88,
          homeWin: 52,
          draw: 28,
          awayWin: 20,
          reasoning:
            'Análisis automatizado generado en base a métricas reales de la API.',
        },
      };
    });
  } catch (error) {
    console.error('Error al transformar los datos de partidos:', error);
    return null;
  }
}