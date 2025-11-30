import { type NextRequest, NextResponse } from "next/server"
import { simulateCleaningScenario } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const { vesselId, vesselData, scenario } = await request.json()

    const results = simulateCleaningScenario(vesselData, scenario)

    return NextResponse.json({
      vesselId,
      scenario: scenario.strategy,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error simulating scenario:", error)
    return NextResponse.json({ error: "Failed to simulate scenario" }, { status: 500 })
  }
}
