import { NextResponse } from "next/server"
import { mockVessels, generateSensorData } from "@/lib/mock-data"
import { mlModel } from "@/lib/ml-model"

// Endpoint para previsão avançada usando ML
export async function GET(request: Request, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params
  const url = new URL(request.url)
  const daysAhead = Number.parseInt(url.searchParams.get("days") || "60")

  const vessel = mockVessels.find((v) => v.id === vesselId)
  if (!vessel) {
    return NextResponse.json({ error: "Vessel not found" }, { status: 404 })
  }

  const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

  const currentSensor = generateSensorData(vesselId, daysSinceCleaning)

  // Determina tipo de rota
  const routeType =
    vessel.currentRoute.origin.includes("Manaus") || vessel.currentRoute.destination.includes("Manaus")
      ? "river"
      : "coastal"

  // Fator sazonal (verão brasileiro = mais crescimento)
  const month = new Date().getMonth()
  const seasonalFactor = month >= 10 || month <= 2 ? 1.2 : 1.0

  // Previsão atual
  const currentPrediction = mlModel.predict({
    daysSinceCleaning,
    averageSpeed: currentSensor.speed,
    averageWaterTemp: currentSensor.waterTemperature,
    averageSalinity: currentSensor.salinity,
    routeType,
    seasonalFactor,
  })

  // Previsões futuras
  const futurePredictions = []
  for (let i = 7; i <= daysAhead; i += 7) {
    const futureDays = daysSinceCleaning + i
    const prediction = mlModel.predict({
      daysSinceCleaning: futureDays,
      averageSpeed: currentSensor.speed,
      averageWaterTemp: currentSensor.waterTemperature,
      averageSalinity: currentSensor.salinity,
      routeType,
      seasonalFactor,
    })

    futurePredictions.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      foulingLevel: prediction.predictedFoulingLevel,
      confidence: prediction.confidence,
      daysFromNow: i,
    })
  }

  // Calcula ponto ideal de limpeza
  const cleaningPoint = mlModel.calculateOptimalCleaningPoint(
    currentPrediction.predictedFoulingLevel,
    currentPrediction.growthRate,
    120000, // custo médio de limpeza (R$)
    800 * 5.8, // custo diário de combustível (L/dia * R$/L)
  )

  return NextResponse.json({
    vesselId,
    vesselName: vessel.name,
    currentPrediction,
    futurePredictions,
    optimalCleaning: {
      daysUntilOptimal: cleaningPoint.daysUntilOptimal,
      optimalDate: new Date(Date.now() + cleaningPoint.daysUntilOptimal * 24 * 60 * 60 * 1000),
      projectedSavings: cleaningPoint.projectedSavings,
    },
    modelMetrics: mlModel.getModelMetrics(),
    environmentalFactors: {
      routeType,
      seasonalFactor,
      riskFactors: currentPrediction.riskFactors,
    },
  })
}
