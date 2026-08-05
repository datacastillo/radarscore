import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      homeTeam,
      awayTeam,
      league,
      xGHome,
      xGAway,
      homeWinProb,
      drawProb,
      awayWinProb,
      recommendedPick,
      cornersTotal,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Respuestas de contingencia si no se detecta la API key
    if (!apiKey) {
      return NextResponse.json({
        analysis: `El modelo cuantitativo proyecta un xG de ${xGHome ?? 1.5} vs ${xGAway ?? 1.1} con un volumen estimado de ${cornersTotal ?? 9.5} córners, sustentando la selección de "${recommendedPick}".`,
      });
    }

    const prompt = `Actúa como un analista táctico de fútbol profesional y experto en apuestas cuantitativas.
Analiza este partido de la liga ${league}:
- Partido: ${homeTeam} vs ${awayTeam}
- Probabilidades Poisson: ${homeTeam} (${homeWinProb}%), Empate (${drawProb}%), ${awayTeam} (${awayWinProb}%)
- Goles Esperados (xG): ${homeTeam} (${xGHome}) - ${awayTeam} (${xGAway})
- Córners Totales Proyectados: ${cornersTotal}
- Recomendación Algorítmica de Valor: "${recommendedPick}"

Instrucciones estrictas:
Escribe un análisis táctico conciso en español de MÁXIMO 2 ORACIONES (entre 30 y 45 palabras).
Explica de forma técnica y profesional por qué la recomendación ("${recommendedPick}") tiene sentido basándote en el xG y el ritmo proyectado del juego.
Sé directo al grano. No uses saludos ni introducciones como "Como analista".`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 120,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en la llamada a Gemini API: ${response.statusText}`);
    }

    const data = await response.json();
    const textAnalysis = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({
      analysis:
        textAnalysis ||
        `El modelo cuantitativo proyecta un xG de ${xGHome} vs ${xGAway}, justificando tácticamente la selección de ${recommendedPick}.`,
    });
  } catch (error) {
    console.error('Error en Endpoint /api/analyze:', error);
    return NextResponse.json({
      analysis:
        'Análisis táctico basado en la matriz de probabilidad cuantitativa y la ventaja del rendimiento xG proyectado.',
    });
  }
}