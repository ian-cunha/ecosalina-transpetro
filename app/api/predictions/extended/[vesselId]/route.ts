import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params

  // Buscar Digital Twin atual
  const dtResponse = await fetch(`${request.nextUrl.origin}/api/digital-twin/${vesselId}`)
  const dtData = await dtResponse.json()

  const biofoulingIndex = dtData.digitalTwin.biofoulingIndex

  // Calcular previsões multi-período
  const predictions = {
    days7: generatePrediction(7, biofoulingIndex),
    days15: generatePrediction(15, biofoulingIndex),
    days30: generatePrediction(30, biofoulingIndex),
  }

  // Impacto energético detalhado
  const energyImpact = {
    currentFuelIncrease: biofoulingIndex * 15, // L/dia
    currentCostIncrease: biofoulingIndex * 15 * 3.8, // BRL/dia (diesel R$ 3.80/L)
    currentEmissionsIncrease: biofoulingIndex * 15 * 2.64, // kg CO₂/dia
    projectedFuelIncrease7d: predictions.days7.fuelImpact,
    projectedFuelIncrease15d: predictions.days15.fuelImpact,
    projectedFuelIncrease30d: predictions.days30.fuelImpact,
  }

  // Conformidade NORMAM 401
  const normam401Compliance = calculateNORMAM401Compliance(biofoulingIndex)

  const extendedPrediction = {
    vesselId,
    currentLevel: biofoulingIndex / 20, // Converter de 0-100% para escala 0-5
    biofoulingIndex,
    biofoulingIndexTrend: biofoulingIndex > 45 ? "increasing" : biofoulingIndex > 30 ? "stable" : "decreasing",
    predictions,
    energyImpact,
    normam401Compliance,
    optimalCleaningDate: new Date(Date.now() + predictions.days15.date.getTime() - Date.now()),
    estimatedSavings: {
      fuel: 28000,
      cost: 106400,
      ghgReduction: 73.92,
    },
    riskLevel:
      biofoulingIndex > 60 ? "critical" : biofoulingIndex > 45 ? "high" : biofoulingIndex > 30 ? "medium" : "low",
    timestamp: new Date(),
  }

  return NextResponse.json(extendedPrediction)
}

function generatePrediction(days: number, currentIndex: number) {
  // Taxa de crescimento simulada (2-4% por semana)
  const weeklyGrowth = 2.5 + Math.random() * 1.5
  const weeks = days / 7
  const projectedIndex = Math.min(100, currentIndex + weeklyGrowth * weeks)

  return {
    date: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    biofoulingIndex: Number(projectedIndex.toFixed(1)),
    foulingLevel: Number((projectedIndex / 20).toFixed(1)),
    confidence: 92 - weeks * 3, // Confiança diminui com o tempo
    fuelImpact: projectedIndex * 15,
    costImpact: projectedIndex * 15 * 3.8,
    recommendedAction:
      projectedIndex > 70
        ? "Limpeza urgente recomendada"
        : projectedIndex > 50
          ? "Agendar limpeza nas próximas 2 semanas"
          : "Monitoramento contínuo",
  }
}

function calculateNORMAM401Compliance(biofoulingIndex: number) {
  const maxAllowedFouling = 60 // 60% é o limite para conformidade
  const daysUntilViolation =
    biofoulingIndex >= maxAllowedFouling ? 0 : Math.floor(((maxAllowedFouling - biofoulingIndex) / 2.5) * 7)

  return {
    status: biofoulingIndex >= maxAllowedFouling ? "non-compliant" : biofoulingIndex >= 50 ? "warning" : "compliant",
    daysUntilViolation: daysUntilViolation > 0 ? daysUntilViolation : null,
    maxAllowedFouling,
    currentFouling: biofoulingIndex,
    inspectionDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
  }
}