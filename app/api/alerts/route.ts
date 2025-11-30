import { NextResponse } from "next/server"
import { mockVessels, generateSensorData, generateAlerts } from "@/lib/mock-data"

export async function GET() {
  const sensorDataMap = new Map()

  mockVessels.forEach((vessel) => {
    const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))
    const sensorData = generateSensorData(vessel.id, daysSinceCleaning)
    sensorDataMap.set(vessel.id, sensorData)
  })

  const alerts = generateAlerts(mockVessels, sensorDataMap)

  return NextResponse.json(alerts)
}
