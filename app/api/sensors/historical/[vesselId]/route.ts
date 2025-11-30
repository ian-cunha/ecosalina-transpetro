import { NextResponse } from "next/server"
import { generateSensorData, mockVessels } from "@/lib/mock-data"

// Retorna histórico de dados dos sensores (últimos 30 dias)
export async function GET(request: Request, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params

  const vessel = mockVessels.find((v) => v.id === vesselId)
  if (!vessel) {
    return NextResponse.json({ error: "Vessel not found" }, { status: 404 })
  }

  const historicalData = []
  const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

  // Gera dados históricos para os últimos 30 dias
  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const daysAtTime = Math.max(0, daysSinceCleaning - i)

    const sensorData = generateSensorData(vesselId, daysAtTime)
    sensorData.timestamp = timestamp

    historicalData.push(sensorData)
  }

  return NextResponse.json(historicalData)
}
