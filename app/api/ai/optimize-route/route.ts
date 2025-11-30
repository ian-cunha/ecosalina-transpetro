import { type NextRequest, NextResponse } from "next/server"
import { optimizeRouteForBiofouling } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const { vesselId, currentRoute, weatherData, historicalData } = await request.json()

    const optimization = optimizeRouteForBiofouling(currentRoute, weatherData, historicalData)

    return NextResponse.json({
      vesselId,
      optimization,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error optimizing route:", error)
    return NextResponse.json({ error: "Failed to optimize route" }, { status: 500 })
  }
}
