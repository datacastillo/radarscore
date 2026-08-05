export interface TeamStanding {
  position: number;
  team: string;
  icon: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  gd: string;
}

export const MOCK_STANDINGS: Record<string, { leagueName: string; flag: string; teams: TeamStanding[] }> = {
  PREMIER: {
    leagueName: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teams: [
      { position: 1, team: 'Arsenal', icon: '🔴', played: 26, won: 18, drawn: 4, lost: 4, points: 58, gd: '+32' },
      { position: 2, team: 'Manchester City', icon: '🩵', played: 26, won: 17, drawn: 5, lost: 4, points: 56, gd: '+30' },
      { position: 3, team: 'Liverpool', icon: '🔴', played: 26, won: 16, drawn: 6, lost: 4, points: 54, gd: '+25' },
      { position: 4, team: 'Chelsea', icon: '🔵', played: 26, won: 12, drawn: 7, lost: 7, points: 43, gd: '+10' },
    ],
  },
  LALIGA: {
    leagueName: 'LaLiga EA Sports',
    flag: '🇪🇸',
    teams: [
      { position: 1, team: 'Real Madrid', icon: '⚪', played: 24, won: 19, drawn: 4, lost: 1, points: 61, gd: '+35' },
      { position: 2, team: 'Girona', icon: '🔴⚪', played: 24, won: 17, drawn: 5, lost: 2, points: 56, gd: '+22' },
      { position: 3, team: 'Barcelona', icon: '🔵🔴', played: 24, won: 16, drawn: 5, lost: 3, points: 53, gd: '+18' },
      { position: 4, team: 'Atlético de Madrid', icon: '🔴⚪', played: 24, won: 15, drawn: 3, lost: 6, points: 48, gd: '+16' },
    ],
  },
  CHAMPIONS: {
    leagueName: 'UEFA Champions League',
    flag: '🇪🇺',
    teams: [
      { position: 1, team: 'Bayern Munich', icon: '🔴', played: 8, won: 7, drawn: 1, lost: 0, points: 22, gd: '+15' },
      { position: 2, team: 'Real Madrid', icon: '⚪', played: 8, won: 7, drawn: 0, lost: 1, points: 21, gd: '+12' },
      { position: 3, team: 'PSG', icon: '🔵', played: 8, won: 5, drawn: 2, lost: 1, points: 17, gd: '+8' },
      { position: 4, team: 'Arsenal', icon: '🔴', played: 8, won: 5, drawn: 1, lost: 2, points: 16, gd: '+7' },
    ],
  },
};