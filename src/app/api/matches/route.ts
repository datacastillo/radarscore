import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'Falta FOOTBALL_DATA_KEY',
        message: 'Agrega FOOTBALL_DATA_KEY=tu_clave en .env.local' 
      },
      { status: 400 }
    );
  }

  try {
    // 📅 Obtener fecha local EXACTA en formato YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateFrom = `${year}-${month}-${day}`;

    // Ventana de 7 días hacia adelante
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 7);
    const fYear = futureDate.getFullYear();
    const fMonth = String(futureDate.getMonth() + 1).padStart(2, '0');
    const fDay = String(futureDate.getDate()).padStart(2, '0');
    const dateTo = `${fYear}-${fMonth}-${fDay}`;

    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: { 'X-Auth-Token': apiKey },
        next: { revalidate: 300 }, // Caché 5 min
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Error en API de Football-Data', details: errorData }, 
        { status: res.status }
      );
    }

    const data = await res.json();

    // Filtrar solo partidos de HOY EN ADELANTE que no hayan finalizado
    const activeMatches = (data.matches || []).filter((m: any) => {
      const matchTime = new Date(m.utcDate).getTime();
      // Permitir partidos programados o en vivo desde la hora actual menos 2 horas
      return m.status !== 'FINISHED' && m.status !== 'CANCELLED' && matchTime >= (now.getTime() - 2 * 60 * 60 * 1000);
    });

    // Ordenar cronológicamente
    activeMatches.sort((a: any, b: any) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    const realMatches = activeMatches.map((m: any) => ({
      id: String(m.id),
      league: m.competition?.name || 'LIGA INTERNACIONAL',
      match: `${m.homeTeam?.name || 'Local'} vs ${m.awayTeam?.name || 'Visitante'}`,
      homeTeam: {
        name: m.homeTeam?.name || 'Local',
        shortName: m.homeTeam?.shortName || m.homeTeam?.name,
        crest: m.homeTeam?.crest || '',
      },
      awayTeam: {
        name: m.awayTeam?.name || 'Visitante',
        shortName: m.awayTeam?.shortName || m.awayTeam?.name,
        crest: m.awayTeam?.crest || '',
      },
      score: {
        home: m.score?.fullTime?.home ?? 0,
        away: m.score?.fullTime?.away ?? 0,
      },
      status: m.status,
      utcDate: m.utcDate,
    }));

    return NextResponse.json(realMatches);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error?.message }, 
      { status: 500 }
    );
  }
}