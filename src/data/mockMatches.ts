export interface Match {
  id: string;
  league: string;
  flag: string;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
  dateCategory: 'AYER' | 'HOY' | 'MAÑANA';
  minute?: number;
  time?: string;
  homeTeam: { name: string; icon: string; form: string[] };
  awayTeam: { name: string; icon: string; form: string[] };
  homeScore?: number;
  awayScore?: number;
  stadium: string;
  aiConfidence: number;
  aiPrediction: string;
  probs: { home: number; draw: number; away: number };
  aiInsight: string;
  stats?: {
    xg: [number, number];
    possession: [number, number];
    shotsOnTarget: [number, number];
    fouls: [number, number];
  };
}

export const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    league: 'PREMIER LEAGUE · JORNADA 26',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    status: 'LIVE',
    dateCategory: 'HOY',
    minute: 68,
    homeTeam: { name: 'Arsenal', icon: '🔴', form: ['V', 'V', 'E'] },
    awayTeam: { name: 'Chelsea', icon: '🔵', form: ['D', 'V', 'E'] },
    homeScore: 2,
    awayScore: 1,
    stadium: 'Emirates Stadium',
    aiConfidence: 78,
    aiPrediction: 'Gana Local (58%)',
    probs: { home: 58, draw: 24, away: 18 },
    aiInsight: 'Arsenal invicto en casa (8/8). Chelsea concede un promedio de 1.8 goles jugando fuera.',
    stats: { xg: [2.1, 0.9], possession: [62, 38], shotsOnTarget: [7, 3], fouls: [9, 14] }
  },
  {
    id: '2',
    league: 'LALIGA EA SPORTS · JORNADA 24',
    flag: '🇪🇸',
    status: 'SCHEDULED',
    dateCategory: 'HOY',
    time: '21:00',
    homeTeam: { name: 'Real Madrid', icon: '⚪', form: ['V', 'V', 'V'] },
    awayTeam: { name: 'Barcelona', icon: '🔵🔴', form: ['V', 'E', 'V'] },
    stadium: 'Santiago Bernabéu',
    aiConfidence: 85,
    aiPrediction: 'Empate o Visitante (62%)',
    probs: { home: 38, draw: 30, away: 32 },
    aiInsight: 'Clásico de alta intensidad. Ambos equipos anotan en el 90% de sus últimos 10 enfrentamientos.',
    stats: { xg: [1.8, 1.7], possession: [50, 50], shotsOnTarget: [5, 6], fouls: [11, 10] }
  },
  {
    id: '3',
    league: 'UEFA CHAMPIONS LEAGUE · OCTAVOS',
    flag: '🇪🇺',
    status: 'FINISHED',
    dateCategory: 'AYER',
    homeTeam: { name: 'Bayern Munich', icon: '🔴', form: ['V', 'D', 'V'] },
    awayTeam: { name: 'PSG', icon: '🔵', form: ['V', 'V', 'E'] },
    homeScore: 3,
    awayScore: 1,
    stadium: 'Allianz Arena',
    aiConfidence: 91,
    aiPrediction: 'Gana Local (Acertado)',
    probs: { home: 65, draw: 20, away: 15 },
    aiInsight: 'Predicción acertada. Dominio absoluto del Bayern en tiros a puerta durante el primer tiempo.',
    stats: { xg: [3.4, 1.1], possession: [58, 42], shotsOnTarget: [10, 4], fouls: [8, 12] }
  },
  {
    id: '4',
    league: 'PREMIER LEAGUE · JORNADA 27',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    status: 'SCHEDULED',
    dateCategory: 'MAÑANA',
    time: '17:30',
    homeTeam: { name: 'Manchester City', icon: '🩵', form: ['V', 'V', 'V'] },
    awayTeam: { name: 'Liverpool', icon: '🔴', form: ['V', 'E', 'V'] },
    stadium: 'Etihad Stadium',
    aiConfidence: 82,
    aiPrediction: 'Gana Local o Empate (75%)',
    probs: { home: 52, draw: 28, away: 20 },
    aiInsight: 'Duelo por el liderato. City promedia 2.8 goles como local esta temporada.',
    stats: { xg: [2.0, 1.5], possession: [55, 45], shotsOnTarget: [6, 5], fouls: [7, 9] }
  }
];