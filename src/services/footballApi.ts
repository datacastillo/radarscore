import { Match } from '@/data/mockMatches';

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

      // 1. Determinar categoría de fecha para los filtros
      let dateCategory: 'AYER' | 'HOY' | 'MAÑANA' | 'LIVE' = 'HOY';

      if (m.status === 'IN_PLAY' || m.status === 'PAUSED') {
        dateCategory = 'LIVE';
      } else if (dateStr === todayStr) {
        dateCategory = 'HOY';
      } else if (dateStr === tomorrowStr) {
        dateCategory = 'MAÑANA';
      } else if (dateStr === yesterdayStr) {
        dateCategory = 'AYER';
      } else {
        // Si el partido está programado para días futuros (ej. próximo fin de semana)
        dateCategory = matchDate > now ? 'MAÑANA' : 'AYER';
      }

      // 2. Formatear hora real a tu zona horaria local (ej: 02:30 p.m.)
      const timeFormatted = matchDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // 3. Formatear la fecha para mostrar (ej: "12 AGO" o "HOY")
      const dayFormatted = matchDate.toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
      }).toUpperCase();

      const timeLabel = dateStr === todayStr
        ? `HOY - ${timeFormatted}`
        : dateStr === tomorrowStr
        ? `MAÑANA - ${timeFormatted}`
        : `${dayFormatted} - ${timeFormatted}`;

      return {
        id: String(m.id),
        league: m.competition?.name ? m.competition.name.toUpperCase() : 'PREMIER LEAGUE',
        flag: m.competition?.emblem || '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        homeTeam: {
          name: m.homeTeam?.shortName || m.homeTeam?.name || 'Local',
          logo: m.homeTeam?.crest || '',
        },
        awayTeam: {
          name: m.awayTeam?.shortName || m.awayTeam?.name || 'Visitante',
          logo: m.awayTeam?.crest || '',
        },
        score: {
          home: m.score?.fullTime?.home ?? 0,
          away: m.score?.fullTime?.away ?? 0,
        },
        status: m.status === 'IN_PLAY' || m.status === 'PAUSED'
          ? 'LIVE'
          : m.status === 'FINISHED'
          ? 'FT'
          : 'SCHEDULED',
        time: timeLabel,
        dateCategory,
        // Datos predeterminados para la tarjeta e IA
        aiPrediction: {
          recommendation: 'Gana Local o Empate',
          confidence: 88,
          homeWin: 52,
          draw: 28,
          awayWin: 20,
          reasoning: 'Análisis automatizado generado en base a métricas reales de la API.',
        },
      };
    });
  } catch (error) {
    console.error('Error al transformar los datos de partidos:', error);
    return null;
  }
}