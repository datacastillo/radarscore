import { NextResponse } from 'next/server';

// Caché en memoria para evitar solicitudes duplicadas a Google API
const analysisCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos de vigencia

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const homeTeam = body.homeTeam || 'Local';
    const awayTeam = body.awayTeam || 'Visitante';
    const league = body.league || 'Liga';
    const xGHome = body.xGHome ?? 1.5;
    const xGAway = body.xGAway ?? 1.1;
    const homeWinProb = body.homeWinProb ?? 40;
    const drawProb = body.drawProb ?? 30;
    const awayWinProb = body.awayWinProb ?? 30;
    const recommendedPick = body.recommendedPick || 'Gana Local o Empate';
    const cornersTotal = body.cornersTotal ?? 9.5;

    // Generar una clave única para el partido
    const cacheKey = `${homeTeam}-${awayTeam}-${league}`;
    const cachedEntry = analysisCache.get(cacheKey);

    // Si el análisis ya fue generado hace menos de 30 minutos, se sirve desde caché
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      return NextResponse.json({ analysis: cachedEntry.text });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({
        analysis: `El modelo cuantitativo proyecta un xG de ${xGHome} vs ${xGAway} con ${cornersTotal} córners esperados, sustentando la selección de "${recommendedPick}".`,
      });
    }

    const promptText = `Actúa como un analista táctico de fútbol profesional.
Analiza este partido de la liga ${league}:
- Partido: ${homeTeam} vs ${awayTeam}
- Probabilidades Poisson: ${homeTeam} (${homeWinProb}%), Empate (${drawProb}%), ${awayTeam} (${awayWinProb}%)
- Goles Esperados (xG): ${homeTeam} (${xGHome}) - ${awayTeam} (${xGAway})
- Córners Totales Proyectados: ${cornersTotal}
- Recomendación Algorítmica de Valor: "${recommendedPick}"

Instrucciones estrictas:
Escribe un análisis táctico conciso en español de MÁXIMO 2 ORACIONES (entre 30 y 45 palabras).
Explica de forma técnica y profesional por qué la recomendación ("${recommendedPick}") tiene sentido basándote en el xG y el ritmo proyectado del juego.
Sé directo al grano. No uses saludos ni introducciones.`;

    const modelsToTry = [
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent',
    ];

    let response: Response | null = null;

    for (const url of modelsToTry) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      });

      if (response.ok) break;
    }

    if (!response || !response.ok) {
      const fallbackAnalysis = `El modelo cuantitativo proyecta un xG de ${xGHome} vs ${xGAway}, respaldando la recomendación de "${recommendedPick}".`;
      return NextResponse.json({ analysis: fallbackAnalysis });
    }

    const data = await response.json();
    const textAnalysis =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      `El modelo cuantitativo proyecta un xG de ${xGHome} vs ${xGAway}, justificando tácticamente la selección de "${recommendedPick}".`;

    // Guardar en la caché
    analysisCache.set(cacheKey, { text: textAnalysis, timestamp: Date.now() });

    return NextResponse.json({ analysis: textAnalysis });
  } catch (error) {
    console.error('❌ Error general en Endpoint /api/analyze:', error);
    return NextResponse.json({
      analysis:
        'Análisis táctico basado en la matriz de probabilidad cuantitativa y la ventaja del rendimiento xG proyectado.',
    });
  }
}