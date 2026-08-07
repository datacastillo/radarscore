import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

  // Si no hay API key configurada o estamos en desarrollo sin API externa activa,
  // devolvemos una lista de partidos reales de alta relevancia como fallback.
  if (!API_KEY || API_KEY === 'tu_clave_de_futbol_aqui') {
    const mockMatches = [
      { id: '1', league: 'Liga MX 🇲🇽', match: 'Santos Laguna vs Club América', defaultOdds: 1.85 },
      { id: '2', league: 'Liga MX 🇲🇽', match: 'Chivas vs Cruz Azul', defaultOdds: 2.10 },
      { id: '3', league: 'La Liga 🇪🇸', match: 'Real Madrid vs FC Barcelona', defaultOdds: 2.05 },
      { id: '4', league: 'Champions League 🏆', match: 'Bayern München vs PSG', defaultOdds: 1.95 },
      { id: '5', league: 'Premier League 🇬🇧', match: 'Manchester City vs Arsenal', defaultOdds: 1.90 },
      { id: '6', league: 'Serie A 🇮🇹', match: 'Inter Milan vs Juventus', defaultOdds: 2.20 },
    ];

    const filtered = mockMatches.filter(m => 
      m.match.toLowerCase().includes(query.toLowerCase()) || 
      m.league.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json(filtered);
  }

  try {
    // Consulta a API-Football / Sports API real
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?live=all`, {
      headers: {
        'x-apisports-key': API_KEY,
      },
    });
    const data = await res.json();

    const matches = data.response?.map((item: any) => ({
      id: item.fixture.id.toString(),
      league: `${item.league.name} ${item.league.country}`,
      match: `${item.teams.home.name} vs ${item.teams.away.name}`,
      defaultOdds: 1.85
    })) || [];

    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: 'Error consultando partidos' }, { status: 500 });
  }
}