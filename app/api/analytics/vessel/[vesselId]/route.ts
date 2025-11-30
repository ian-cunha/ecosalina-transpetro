import { NextResponse } from "next/server"
import { mockVessels, generateSensorData, generateBiofoulingPrediction } from "@/lib/mock-data"
import { BiofoulingAnalytics } from "@/lib/analytics"

// Retorna análise completa de uma embarcação
export async function GET(request: Request, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params

  const vessel = mockVessels.find((v) => v.id === vesselId)
  if (!vessel) {
    return NextResponse.json({ error: "Vessel not found" }, { status: 404 })
  }

  const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

  const sensorData = generateSensorData(vesselId, daysSinceCleaning)
  const prediction = generateBiofoulingPrediction(vessel, sensorData)
  const report = BiofoulingAnalytics.generateReport(vessel, sensorData, prediction)

  return NextResponse.json({
    vessel,
    sensorData,
    prediction,
    analysis: report,
    timestamp: new Date(),
  })
}
