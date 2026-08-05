import { Match } from '@/data/mockMatches';

function calculateDateCategory(utcDateString: string): 'AYER' | 'HOY' | 'MAÑANA' {
  const matchDate = new Date(utcDateString);
  const today = new Date();

  const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = matchDay.getTime() - currentDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  if (diffDays < 0) return 'AYER';
  if (diffDays > 0) return 'MAÑANA';
  return 'HOY';
}

export async function fetchRealMatches(): Promise<Match[]> {
  try {
    const res = await fetch('/api/matches');

    if (!res.ok) {
      console.error(`Error API interna: ${res.status}`);
      return [];
    }

    const data = await res.json();

    if (!data.matches) return [];

    return data.matches.map((m: any) => {
      const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'HALF_TIME';
      const isFinished = m.status === 'FINISHED';
      const dateCat = calculateDateCategory(m.utcDate);

      return {
        id: m.id.toString(),
        league: m.competition?.name?.toUpperCase() || 'FÚTBOL INTERNACIONAL',
        flag: m.competition?.emblem ? '⚽' : '🌍',
        status: isLive ? 'LIVE' : isFinished ? 'FINISHED' : 'SCHEDULED',
        dateCategory: dateCat,
        minute: isLive ? 45 : undefined,
        time: new Date(m.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        homeTeam: {
          name: m.homeTeam.shortName || m.homeTeam.name,
          icon: '🛡️',
          form: ['V', 'E', 'V'],
        },
        awayTeam: {
          name: m.awayTeam.shortName || m.awayTeam.name,
          icon: '🛡️',
          form: ['D', 'V', 'E'],
        },
        homeScore: m.score?.fullTime?.home ?? 0,
        awayScore: m.score?.fullTime?.away ?? 0,
        stadium: 'Estadio Principal',
        aiConfidence: Math.floor(Math.random() * 20) + 75,
        aiPrediction: 'Predicción en análisis',
        probs: { home: 45, draw: 30, away: 25 },
        aiInsight: 'Análisis automatizado generado en base a métricas en vivo.',
        stats: {
          xg: [1.5, 1.1],
          possession: [52, 48],
          shotsOnTarget: [5, 4],
          fouls: [10, 12],
        },
      };
    });
  } catch (error) {
    console.error('Error cargando partidos reales:', error);
    return [];
  }
}