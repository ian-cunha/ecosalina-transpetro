import { type NextRequest, NextResponse } from "next/server"
import { generateSensorData, generateBiofoulingPrediction, mockVessels } from "@/lib/mock-data"

export async function GET(request: NextRequest, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params

  const vessel = mockVessels.find((v) => v.id === vesselId)
  if (!vessel) {
    return NextResponse.json({ error: "Vessel not found" }, { status: 404 })
  }

  const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

  const sensorData = generateSensorData(vesselId, daysSinceCleaning)
  const prediction = generateBiofoulingPrediction(vessel, sensorData)

  return NextResponse.json(prediction)
}