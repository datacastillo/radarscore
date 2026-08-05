import { NextResponse } from 'next/server';

// Fuerza a Vercel a calcular las fechas en cada petición y no durante el build
export const dynamic = 'force-dynamic';

export async function GET() {
  // Prioriza la clave privada del servidor y usa la pública como respaldo
  const API_KEY =
    process.env.FOOTBALL_DATA_KEY ||
    process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY ||
    '';

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'No se encontró la API Key en las variables de entorno' },
      { status: 500 }
    );
  }

  // Rango óptimo de 10 días (Límite del plan gratuito):
  // 2 días hacia el pasado + 8 días hacia el futuro
  const today = new Date();

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 2);

  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 8);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const dateFrom = formatDate(pastDate);
  const dateTo = formatDate(futureDate);

  // Ligas principales habilitadas en la API
  const competitions = 'PL,PD,CL,BL1,SA,DED,PPL';

  try {
    const url = `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&competitions=${competitions}`;

    const res = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
      },
      next: { revalidate: 300 }, // Caché interna de 5 minutos
    });

    if (!res.ok) {
      console.error('Error desde football-data:', res.status, res.statusText);
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