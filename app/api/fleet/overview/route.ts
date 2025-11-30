import { NextResponse } from "next/server"
import { mockVessels, generateSensorData, generateBiofoulingPrediction } from "@/lib/mock-data"

// Retorna visão geral de toda a frota
export async function GET() {
  const fleetOverview = mockVessels.map((vessel) => {
    const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

    const sensorData = generateSensorData(vessel.id, daysSinceCleaning)
    const prediction = generateBiofoulingPrediction(vessel, sensorData)

    return {
      vessel,
      currentSensor: sensorData,
      prediction: {
        currentLevel: prediction.currentLevel,
        riskLevel: prediction.riskLevel,
        optimalCleaningDate: prediction.optimalCleaningDate,
        daysUntilCleaning: Math.floor((prediction.optimalCleaningDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      },
    }
  })

  // Calcula KPIs da frota
  const kpis = {
    totalVessels: mockVessels.length,
    operatingVessels: mockVessels.filter((v) => v.status === "operating").length,
    criticalVessels: fleetOverview.filter((v) => v.prediction.riskLevel === "critical").length,
    highRiskVessels: fleetOverview.filter((v) => v.prediction.riskLevel === "high").length,
    averageFoulingLevel: Number(
      (fleetOverview.reduce((sum, v) => sum + v.currentSensor.foulingLevel, 0) / fleetOverview.length).toFixed(2),
    ),
    totalDragIncrease: Number(fleetOverview.reduce((sum, v) => sum + v.currentSensor.dragIncrease, 0).toFixed(2)),
  }

  return NextResponse.json({
    fleet: fleetOverview,
    kpis,
  })
}
