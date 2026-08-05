import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') || 'PL';

  const API_KEY =
    process.env.FOOTBALL_DATA_KEY ||
    process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY ||
    '';

  if (!API_KEY) {
    return NextResponse.json(
      { standings: [], error: 'No hay API Key configurada' },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${league}/standings`,
      {
        headers: { 'X-Auth-Token': API_KEY },
        next: { revalidate: 3600 }, // Caché de 1 hora
      }
    );

    if (!res.ok) {
      console.error(`Error standings API (${league}):`, res.status, res.statusText);
      return NextResponse.json(
        { standings: [], error: `No se pudo obtener la tabla (${res.status})` },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en api/standings:', error);
    return NextResponse.json(
      { standings: [], error: 'Error del servidor' },
      { status: 200 }
    );
  }
}