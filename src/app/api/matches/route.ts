import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY || '';

  if (!API_KEY) {
    return NextResponse.json({ error: 'No se encontró la API Key' }, { status: 500 });
  }

  try {
    // Calculamos el rango de fechas: Ayer, Hoy y Mañana
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateFrom = yesterday.toISOString().split('T')[0];
    const dateTo = tomorrow.toISOString().split('T')[0];

    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: {
          'X-Auth-Token': API_KEY,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `Error API externa: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}