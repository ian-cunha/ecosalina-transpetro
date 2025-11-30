import { NextResponse } from "next/server"
import { mockVessels, generateSensorData } from "@/lib/mock-data"
import { mlModel } from "@/lib/ml-model"

// Compara estratégias: Limpeza Programada vs Limpeza Otimizada por ML
export async function GET() {
  const comparisons = mockVessels.map((vessel) => {
    const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

    const currentSensor = generateSensorData(vessel.id, daysSinceCleaning)

    const routeType =
      vessel.currentRoute.origin.includes("Manaus") || vessel.currentRoute.destination.includes("Manaus")
        ? "river"
        : "coastal"

    const month = new Date().getMonth()
    const seasonalFactor = month >= 10 || month <= 2 ? 1.2 : 1.0

    const prediction = mlModel.predict({
      daysSinceCleaning,
      averageSpeed: currentSensor.speed,
      averageWaterTemp: currentSensor.waterTemperature,
      averageSalinity: currentSensor.salinity,
      routeType,
      seasonalFactor,
    })

    const cleaningPoint = mlModel.calculateOptimalCleaningPoint(
      prediction.predictedFoulingLevel,
      prediction.growthRate,
      120000,
      800 * 5.8,
    )

    // Estratégia 1: Limpeza a cada 90 dias (programada)
    const scheduledDaysUntil = 90 - (daysSinceCleaning % 90)
    const scheduledWaste = daysSinceCleaning < 90 ? (90 - daysSinceCleaning) * 800 * 5.8 * 0.05 : 0

    // Estratégia 2: Limpeza otimizada por ML
    const mlDaysUntil = cleaningPoint.daysUntilOptimal
    const mlSavings = cleaningPoint.projectedSavings

    return {
      vesselId: vessel.id,
      vesselName: vessel.name,
      scheduled: {
        daysUntilCleaning: scheduledDaysUntil,
        nextCleaningDate: new Date(Date.now() + scheduledDaysUntil * 24 * 60 * 60 * 1000),
        estimatedWaste: Number(scheduledWaste.toFixed(2)),
        approach: "fixed-interval",
      },
      mlOptimized: {
        daysUntilCleaning: mlDaysUntil,
        nextCleaningDate: new Date(Date.now() + mlDaysUntil * 24 * 60 * 60 * 1000),
        estimatedSavings: Number(mlSavings.toFixed(2)),
        approach: "predictive",
      },
      difference: {
        daysDifference: mlDaysUntil - scheduledDaysUntil,
        financialImpact: Number((mlSavings - scheduledWaste).toFixed(2)),
        recommendation: mlDaysUntil > scheduledDaysUntil ? "Postpone cleaning" : "Advance cleaning",
      },
    }
  })

  // Calcula economia total da frota
  const totalSavings = comparisons.reduce((sum, c) => sum + c.mlOptimized.estimatedSavings, 0)
  const totalWaste = comparisons.reduce((sum, c) => sum + c.scheduled.estimatedWaste, 0)

  return NextResponse.json({
    comparisons,
    fleetSummary: {
      totalVessels: mockVessels.length,
      totalFinancialImpact: Number((totalSavings - totalWaste).toFixed(2)),
      averageSavingsPerVessel: Number((totalSavings / mockVessels.length).toFixed(2)),
      recommendedApproach: "ML-optimized predictive cleaning",
    },
  })
}
