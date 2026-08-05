export interface Match {
  id: string;
  league: string;
  flag: string;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED';
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
}

export const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    league: 'PREMIER LEAGUE · JORNADA 26',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    status: 'LIVE',
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
  },
  {
    id: '2',
    league: 'LALIGA EA SPORTS · JORNADA 24',
    flag: '🇪🇸',
    status: 'SCHEDULED',
    time: '21:00',
    homeTeam: { name: 'Real Madrid', icon: '⚪', form: ['V', 'V', 'V'] },
    awayTeam: { name: 'Barcelona', icon: '🔵🔴', form: ['V', 'E', 'V'] },
    stadium: 'Santiago Bernabéu',
    aiConfidence: 85,
    aiPrediction: 'Empate o Visitante (62%)',
    probs: { home: 38, draw: 30, away: 32 },
    aiInsight: 'Clásico de alta intensidad. Ambos equipos anotan en el 90% de sus últimos 10 enfrentamientos.',
  },
  {
    id: '3',
    league: 'UEFA CHAMPIONS LEAGUE · OCTAVOS',
    flag: '🇪🇺',
    status: 'FINISHED',
    homeTeam: { name: 'Bayern Munich', icon: '🔴', form: ['V', 'D', 'V'] },
    awayTeam: { name: 'PSG', icon: '🔵', form: ['V', 'V', 'E'] },
    homeScore: 3,
    awayScore: 1,
    stadium: 'Allianz Arena',
    aiConfidence: 91,
    aiPrediction: 'Gana Local (Accertado)',
    probs: { home: 65, draw: 20, away: 15 },
    aiInsight: 'Predicción acertada. Dominio absoluto del Bayern en tiros a puerta durante el primer tiempo.',
  },
];