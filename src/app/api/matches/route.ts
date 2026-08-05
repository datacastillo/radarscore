import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_DATA_KEY || '';

  if (!API_KEY) {
    return NextResponse.json({ error: 'No se encontró la API Key' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': API_KEY,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Error API externa: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
  }
}