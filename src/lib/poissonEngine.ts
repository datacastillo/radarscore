// src/lib/poissonEngine.ts

export interface TeamStatsInput {
  // Goles
  homeGoalsScoredAvg?: number;   // Promedio goles anotados local
  homeGoalsConcededAvg?: number; // Promedio goles recibidos local
  awayGoalsScoredAvg?: number;   // Promedio goles anotados visitante
  awayGoalsConcededAvg?: number; // Promedio goles recibidos visitante
  
  // Córners
  homeCornersForAvg?: number;     // Promedio córners a favor local (ej: 5.8)
  homeCornersAgainstAvg?: number; // Promedio córners en contra local (ej: 4.1)
  awayCornersForAvg?: number;     // Promedio córners a favor visitante (ej: 4.2)
  awayCornersAgainstAvg?: number; // Promedio córners en contra visitante (ej: 5.9)

  // Rachas
  recentFormHome?: number[];     // Puntos en últimos partidos (ej: [3, 3, 1, 3, 0])
  recentFormAway?: number[];     // Puntos en últimos partidos (ej: [1, 0, 3, 1, 0])
}

export interface CorrectScore {
  homeGoals: number;
  awayGoals: number;
  probability: number; // Porcentaje de probabilidad (ej: 14.2%)
}

export interface CornerStats {
  expectedCornersHome: number;  // Córners proyectados Local
  expectedCornersAway: number;  // Córners proyectados Visitante
  expectedCornersTotal: number; // Córners proyectados Total
  over85CornersProb: number;    // % Más de 8.5 córners
  over95CornersProb: number;    // % Más de 9.5 córners
  over105CornersProb: number;   // % Más de 10.5 córners
  mostCornersHomeProb: number;  // % Local gana en córners
  mostCornersDrawProb: number;  // % Empate en córners
  mostCornersAwayProb: number;  // % Visitante gana en córners
}

export interface PoissonPrediction {
  lambdaHome: number;             // Goles esperados Local (xG)
  lambdaAway: number;             // Goles esperados Visitante (xG)
  homeWinProb: number;            // % Victoria Local
  drawProb: number;               // % Empate
  awayWinProb: number;            // % Victoria Visitante
  bttsProb: number;               // % Ambos Equipos Anotan
  over25Prob: number;             // % Más de 2.5 Goles
  under25Prob: number;            // % Menos de 2.5 Goles
  confidence: number;             // % Índice de Confianza
  recommendedPick: string;        // Selección de Mayor Valor
  recommendedPickReason: string;    // Explicación cuantitativa
  topCorrectScores: CorrectScore[];// Marcadores exactos más probables
  corners: CornerStats;           // Métricas cuantitativas de Córners
}

// Función auxiliar Factorial
function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Función densidad de probabilidad de Poisson
function poissonProb(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// Corrección Dixon-Coles para marcadores bajos de goles
function dixonColesAdjustment(
  x: number,
  y: number,
  lambdaH: number,
  lambdaA: number,
  rho: number = 0.06
): number {
  if (x === 0 && y === 0) return 1 - lambdaH * lambdaA * rho;
  if (x === 1 && y === 0) return 1 + lambdaA * rho;
  if (x === 0 && y === 1) return 1 + lambdaH * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

/**
 * Cálculo cuantitativo completo: Goles (xG), Marcadores, Probabilidades y Córners (xCorners)
 */
export function calculatePoissonPrediction(
  homeTeamName: string,
  awayTeamName: string,
  stats?: TeamStatsInput
): PoissonPrediction {
  // -------------------------------------------------------------
  // 1. CÁLCULO DE GOLES (xG)
  // -------------------------------------------------------------
  const leagueAvgHomeScored = 1.45;
  const leagueAvgAwayScored = 1.15;

  const homeScored = stats?.homeGoalsScoredAvg ?? 1.6;
  const homeConceded = stats?.homeGoalsConcededAvg ?? 1.0;
  const awayScored = stats?.awayGoalsScoredAvg ?? 1.2;
  const awayConceded = stats?.awayGoalsConcededAvg ?? 1.5;

  const homeAttack = homeScored / leagueAvgHomeScored;
  const homeDefense = homeConceded / leagueAvgAwayScored;
  const awayAttack = awayScored / leagueAvgAwayScored;
  const awayDefense = awayConceded / leagueAvgHomeScored;

  let homeFormMod = 1.0;
  let awayFormMod = 1.0;
  if (stats?.recentFormHome && stats.recentFormHome.length > 0) {
    const avgPts = stats.recentFormHome.reduce((a, b) => a + b, 0) / stats.recentFormHome.length;
    homeFormMod = 0.85 + (avgPts / 3.0) * 0.3;
  }
  if (stats?.recentFormAway && stats.recentFormAway.length > 0) {
    const avgPts = stats.recentFormAway.reduce((a, b) => a + b, 0) / stats.recentFormAway.length;
    awayFormMod = 0.85 + (avgPts / 3.0) * 0.3;
  }

  let lambdaHome = homeAttack * awayDefense * leagueAvgHomeScored * homeFormMod;
  let lambdaAway = awayAttack * homeDefense * leagueAvgAwayScored * awayFormMod;

  lambdaHome = Math.max(0.25, Math.min(4.2, lambdaHome));
  lambdaAway = Math.max(0.25, Math.min(4.2, lambdaAway));

  // Simulación Matriz 7x7 Goles
  const maxGoals = 6;
  let rawHomeWin = 0;
  let rawDraw = 0;
  let rawAwayWin = 0;
  let rawBtts = 0;
  let rawOver25 = 0;

  const scoreMatrix: { x: number; y: number; prob: number }[] = [];

  for (let x = 0; x <= maxGoals; x++) {
    const pX = poissonProb(x, lambdaHome);
    for (let y = 0; y <= maxGoals; y++) {
      const pY = poissonProb(y, lambdaAway);
      const adj = dixonColesAdjustment(x, y, lambdaHome, lambdaAway);
      const cellProb = Math.max(0, pX * pY * adj);

      scoreMatrix.push({ x, y, prob: cellProb });

      if (x > y) rawHomeWin += cellProb;
      else if (x === y) rawDraw += cellProb;
      else rawAwayWin += cellProb;

      if (x > 0 && y > 0) rawBtts += cellProb;
      if (x + y > 2.5) rawOver25 += cellProb;
    }
  }

  const totalSum = rawHomeWin + rawDraw + rawAwayWin;
  const homeWinProb = Math.round((rawHomeWin / totalSum) * 100);
  const drawProb = Math.round((rawDraw / totalSum) * 100);
  // FIX: antes "100 - homeWinProb - drawProb" podía dar negativo cuando el
  // redondeo independiente de cada probabilidad sumaba más de 100.
  const awayWinProb = Math.max(0, 100 - homeWinProb - drawProb);

  const bttsProb = Math.min(95, Math.max(10, Math.round((rawBtts / totalSum) * 100)));
  const over25Prob = Math.min(95, Math.max(10, Math.round((rawOver25 / totalSum) * 100)));
  const under25Prob = 100 - over25Prob;

  const topCorrectScores: CorrectScore[] = scoreMatrix
    .map((s) => ({
      homeGoals: s.x,
      awayGoals: s.y,
      probability: Math.round((s.prob / totalSum) * 1000) / 10,
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  // -------------------------------------------------------------
  // 2. CÁLCULO DE CÓRNERS (xCorners)
  // -------------------------------------------------------------
  // football-data.org no expone estadísticas de córners por equipo, así
  // que antes esto usaba valores por defecto SIEMPRE iguales — por eso
  // todos los partidos mostraban la misma proyección de córners. Ahora
  // se deriva de homeAttack/awayAttack/homeDefense/awayDefense (la misma
  // fuerza real de ataque/defensa que ya calcula el modelo de goles), así
  // que si hay datos reales del equipo, el número de córners también varía
  // de verdad — sin inventar una fuente de datos que no existe.
  const leagueAvgHomeCorners = 5.2;
  const leagueAvgAwayCorners = 4.4;

  let lambdaCornerHome = leagueAvgHomeCorners * homeAttack * awayDefense;
  let lambdaCornerAway = leagueAvgAwayCorners * awayAttack * homeDefense;

  lambdaCornerHome = Math.max(2.5, Math.min(9.0, lambdaCornerHome));
  lambdaCornerAway = Math.max(2.0, Math.min(8.0, lambdaCornerAway));

  const lambdaTotalCorners = lambdaCornerHome + lambdaCornerAway;

  // Calculo de probabilidades acumuladas para córners
  const cumulativePoissonCorners = (threshold: number): number => {
    let sum = 0;
    for (let k = 0; k <= threshold; k++) {
      sum += poissonProb(k, lambdaTotalCorners);
    }
    return Math.max(5, Math.min(95, Math.round((1 - sum) * 100)));
  };

  const over85CornersProb = cumulativePoissonCorners(8);
  const over95CornersProb = cumulativePoissonCorners(9);
  const over105CornersProb = cumulativePoissonCorners(10);

  // Simulación Matriz Córners (Local vs Visitante)
  let rawMostHome = 0;
  let rawMostDraw = 0;
  let rawMostAway = 0;
  const maxCornersSim = 15;

  for (let ch = 0; ch <= maxCornersSim; ch++) {
    const pCH = poissonProb(ch, lambdaCornerHome);
    for (let ca = 0; ca <= maxCornersSim; ca++) {
      const pCA = poissonProb(ca, lambdaCornerAway);
      const pCell = pCH * pCA;
      if (ch > ca) rawMostHome += pCell;
      else if (ch === ca) rawMostDraw += pCell;
      else rawMostAway += pCell;
    }
  }

  const cornerSum = rawMostHome + rawMostDraw + rawMostAway;
  const mostCornersHomeProb = Math.round((rawMostHome / cornerSum) * 100);
  const mostCornersDrawProb = Math.round((rawMostDraw / cornerSum) * 100);
  // FIX: mismo problema de redondeo que awayWinProb — se protege contra negativos.
  const mostCornersAwayProb = Math.max(0, 100 - mostCornersHomeProb - mostCornersDrawProb);

  const cornerStats: CornerStats = {
    expectedCornersHome: Number(lambdaCornerHome.toFixed(1)),
    expectedCornersAway: Number(lambdaCornerAway.toFixed(1)),
    expectedCornersTotal: Number(lambdaTotalCorners.toFixed(1)),
    over85CornersProb,
    over95CornersProb,
    over105CornersProb,
    mostCornersHomeProb,
    mostCornersDrawProb,
    mostCornersAwayProb,
  };

  // -------------------------------------------------------------
  // 3. SELECCIÓN INTELIGENTE DEL PICK VIP
  // -------------------------------------------------------------
  const maxProb = Math.max(homeWinProb, drawProb, awayWinProb);

  // FIX: antes había un piso artificial de 68%, así que un partido
  // prácticamente parejo (33/33/34) igual mostraba "68% de confianza".
  // Como maxProb nunca puede bajar de ~33.3 (es el máximo de 3 valores que
  // suman 100), la fórmula ya tiene un piso NATURAL de 55% sin necesidad de
  // forzarlo — así la confianza mostrada refleja honestamente qué tan
  // parejo o decidido está el partido, sin perder el techo de 93% que evita
  // sonar sobreconfiado en un evento probabilístico.
  const confidence = Math.min(93, Math.round(55 + (maxProb - 33.3) * 0.9));

  let recommendedPick = '';
  let recommendedPickReason = '';

  if (homeWinProb >= 58) {
    recommendedPick = `Gana ${homeTeamName}`;
    recommendedPickReason = `El modelo Poisson proyecta un xG de ${lambdaHome.toFixed(2)} vs ${lambdaAway.toFixed(2)} (${homeWinProb}% de victoria local), con un empate cubriendo solo el ${drawProb}% de los escenarios simulados.`;
  } else if (awayWinProb >= 55) {
    recommendedPick = `Gana ${awayTeamName}`;
    recommendedPickReason = `${awayTeamName} registra un xG proyectado superior (${lambdaAway.toFixed(2)} vs ${lambdaHome.toFixed(2)}) y una probabilidad de victoria del ${awayWinProb}%, por encima del local.`;
  } else if (homeWinProb + drawProb >= 74) {
    recommendedPick = `Doble Oportunidad: ${homeTeamName} o Empate`;
    recommendedPickReason = `Cubre el ${homeWinProb + drawProb}% de los escenarios simulados en la matriz Dixon-Coles (${homeWinProb}% victoria + ${drawProb}% empate), dejando solo ${awayWinProb}% de probabilidad a la visita.`;
  } else if (over85CornersProb >= 75) {
    recommendedPick = `Más de 8.5 Córners`;
    recommendedPickReason = `Ambos equipos promedian ${lambdaTotalCorners.toFixed(1)} saques de esquina combinados proyectados, con ${over85CornersProb}% de probabilidad de superar el umbral y ${over95CornersProb}% de superar 9.5.`;
  } else if (over25Prob >= 62) {
    recommendedPick = `Más de 2.5 Goles`;
    recommendedPickReason = `Expectativa de goles acumulada de ${(lambdaHome + lambdaAway).toFixed(2)} (${over25Prob}% de probabilidad de Over 2.5), con ambos equipos anotando en el ${bttsProb}% de los escenarios simulados.`;
  } else if (bttsProb >= 60) {
    recommendedPick = `Ambos Equipos Anotan (Sí)`;
    recommendedPickReason = `Defensas con tasa de concesión superior al promedio proyectado — ${bttsProb}% de probabilidad de BTTS, con un xG combinado de ${(lambdaHome + lambdaAway).toFixed(2)}.`;
  } else {
    recommendedPick = `Menos de 3.5 Goles`;
    recommendedPickReason = `Partido de tendencia táctica cerrada con bajo xG acumulado (${(lambdaHome + lambdaAway).toFixed(2)}) y ${under25Prob}% de probabilidad de Under 2.5 goles.`;
  }

  return {
    lambdaHome: Number(lambdaHome.toFixed(2)),
    lambdaAway: Number(lambdaAway.toFixed(2)),
    homeWinProb,
    drawProb,
    awayWinProb,
    bttsProb,
    over25Prob,
    under25Prob,
    confidence,
    recommendedPick,
    recommendedPickReason,
    topCorrectScores,
    corners: cornerStats,
  };
}