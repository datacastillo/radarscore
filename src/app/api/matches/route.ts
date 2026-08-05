import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY || '';

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'No se encontró la API Key' },
      { status: 500 }
    );
  }

  // Rango óptimo de 10 días (Límite máximo exacto del plan gratuito):
  // 2 días hacia el pasado + 8 días hacia el futuro
  const today = new Date();

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 2);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 8);

  const dateFrom = pastDate.toISOString().split('T')[0];
  const dateTo = futureDate.toISOString().split('T')[0];

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: {
          'X-Auth-Token': API_KEY,
        },
        next: { revalidate: 300 }, // Caché de 5 minutos
      }
    );

    if (!res.ok) {
      console.error('Error respuesta API:', res.status, res.statusText);
      return NextResponse.json({ matches: [] });
    }

    const data = await res.json();
    return NextResponse.json({ matches: data.matches || [] });
  } catch (error) {
    console.error('Error de servidor en API matches:', error);
    return NextResponse.json(
      { error: 'Error al obtener partidos' },
      { status: 500 }
    );
  }
}