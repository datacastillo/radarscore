import { NextResponse } from 'next/server';

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

    // Obtención de la clave de entorno limpia
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY no encontrada en las variables de entorno.');
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

    // Endpoint REST de Gemini
    const googleApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey, // 👈 Envío seguro mediante cabecera HTTP
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Error en respuesta de Google API (${response.status}):`, errorBody);

      return NextResponse.json({
        analysis: `El modelo cuantitativo proyecta un xG de ${xGHome} vs ${xGAway}, respaldando la recomendación de "${recommendedPick}".`,
      });
    }

    const data = await response.json();
    const textAnalysis = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({
      analysis:
        textAnalysis ||
        `El modelo cuantitativo proyecta un xG de ${xGHome} vs ${xGAway}, justificando tácticamente la selección de "${recommendedPick}".`,
    });
  } catch (error) {
    console.error('❌ Error general en Endpoint /api/analyze:', error);
    return NextResponse.json({
      analysis:
        'Análisis táctico basado en la matriz de probabilidad cuantitativa y la ventaja del rendimiento xG proyectado.',
    });
  }
}