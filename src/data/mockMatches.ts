export interface Team {
  name: string;
  logo: string;
  form: string[];
}

export interface MatchStats {
  xg?: number[];
  possession?: number[] | { home: number; away: number };
  shotsOnTarget?: number[] | { home: number; away: number };
  corners?: number[] | { home: number; away: number };
  fouls?: number[];
}

export interface Match {
  id: string;
  league: string;
  flag: string;
  homeTeam: Team;
  awayTeam: Team;
  score?: {
    home: number;
    away: number;
  };
  probs?: {
    home: number;
    draw: number;
    away: number;
  };
  probabilities?: {
    home: number;
    draw: number;
    away: number;
  };
  stats?: MatchStats;
  status: 'LIVE' | 'FT' | 'SCHEDULED';
  time: string;
  dateCategory: 'EN VIVO' | 'AYER' | 'HOY' | 'MAÑANA' | 'PROXIMOS' | 'LIVE';
  aiPrediction?: {
    recommendation: string;
    confidence: number;
    homeWin: number;
    draw: number;
    awayWin: number;
    reasoning: string;
  };
}

export const MOCK_MATCHES: Match[] = [
  {
    id: 'mock-1',
    league: 'PREMIER LEAGUE',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: {
      name: 'Arsenal',
      logo: 'https://crests.football-data.org/57.png',
      form: ['V', 'V', 'E'],
    },
    awayTeam: {
      name: 'Chelsea',
      logo: 'https://crests.football-data.org/61.png',
      form: ['D', 'V', 'E'],
    },
    score: { home: 2, away: 1 },
    probs: { home: 58, draw: 24, away: 18 },
    probabilities: { home: 58, draw: 24, away: 18 },
    stats: { xg: [1.8, 0.9], possession: [58, 42], shotsOnTarget: [6, 3], corners: [7, 4] },
    status: 'LIVE',
    time: 'EN VIVO - 68\'',
    dateCategory: 'PROXIMOS',
    aiPrediction: {
      recommendation: 'Gana Local o Empate',
      confidence: 88,
      homeWin: 58,
      draw: 24,
      awayWin: 18,
      reasoning: 'Racha local implacable y dominio de posesión en zona ofensiva.',
    },
  },
  {
    id: 'mock-2',
    league: 'LALIGA',
    flag: '🇪🇸',
    homeTeam: {
      name: 'Real Madrid',
      logo: 'https://crests.football-data.org/86.png',
      form: ['V', 'V', 'V'],
    },
    awayTeam: {
      name: 'FC Barcelona',
      logo: 'https://crests.football-data.org/81.png',
      form: ['V', 'E', 'V'],
    },
    score: { home: 0, away: 0 },
    probs: { home: 50, draw: 28, away: 22 },
    probabilities: { home: 50, draw: 28, away: 22 },
    stats: { xg: [2.1, 1.4], possession: [52, 48], shotsOnTarget: [8, 5], corners: [6, 5] },
    status: 'SCHEDULED',
    time: '21:00',
    dateCategory: 'PROXIMOS',
    aiPrediction: {
      recommendation: 'Ambos Anotan / Gana Local',
      confidence: 85,
      homeWin: 50,
      draw: 28,
      awayWin: 22,
      reasoning: 'Elevado rendimiento en remates a puerta de ambos ataques en clásicos.',
    },
  },
  {
    id: 'mock-3',
    league: 'CHAMPIONS LEAGUE',
    flag: '🇪🇺',
    homeTeam: {
      name: 'Bayern München',
      logo: 'https://crests.football-data.org/5.png',
      form: ['V', 'V', 'D'],
    },
    awayTeam: {
      name: 'Paris Saint-Germain',
      logo: 'https://crests.football-data.org/524.png',
      form: ['V', 'V', 'V'],
    },
    score: { home: 0, away: 0 },
    probs: { home: 45, draw: 30, away: 25 },
    probabilities: { home: 45, draw: 30, away: 25 },
    stats: { xg: [1.6, 1.2], possession: [50, 50], shotsOnTarget: [5, 4], corners: [5, 4] },
    status: 'SCHEDULED',
    time: 'PRÓXIMO MARTES - 20:00',
    dateCategory: 'PROXIMOS',
    aiPrediction: {
      recommendation: 'Over 2.5 Goles',
      confidence: 82,
      homeWin: 45,
      draw: 30,
      awayWin: 25,
      reasoning: 'Enfrentamiento directo de alto ritmo con promedio superior a 3 goles por juego.',
    },
  },
  {
    id: 'mock-4',
    league: 'SERIE A',
    flag: '🇮🇹',
    homeTeam: {
      name: 'Inter Milan',
      logo: 'https://crests.football-data.org/108.png',
      form: ['V', 'V', 'E'],
    },
    awayTeam: {
      name: 'AC Milan',
      logo: 'https://crests.football-data.org/98.png',
      form: ['E', 'V', 'V'],
    },
    score: { home: 0, away: 0 },
    probs: { home: 48, draw: 30, away: 22 },
    probabilities: { home: 48, draw: 30, away: 22 },
    stats: { xg: [1.5, 1.1], possession: [53, 47], shotsOnTarget: [5, 3], corners: [6, 4] },
    status: 'SCHEDULED',
    time: 'DOMINGO - 18:00',
    dateCategory: 'PROXIMOS',
    aiPrediction: {
      recommendation: 'Gana Inter o Empate',
      confidence: 86,
      homeWin: 48,
      draw: 30,
      awayWin: 22,
      reasoning: 'Solidez defensiva local como factor determinante en partidos de alta presión.',
    },
  },
];