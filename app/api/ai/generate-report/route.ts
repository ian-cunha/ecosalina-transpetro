import { type NextRequest, NextResponse } from "next/server"
import { generateAutomatedReport } from "@/lib/ai-services"
import { vessels } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const { period } = await request.json()

    const fleetData = vessels.map((v) => ({
      id: v.id,
      name: v.name,
      cleanings: Math.floor(Math.random() * 3 + 1),
      fuelSaved: Math.floor(Math.random() * 15000 + 8000),
      costSaved: Math.floor(Math.random() * 80000 + 40000),
      ghgReduced: Math.random() * 40 + 20,
    }))

    const report = await generateAutomatedReport(period, fleetData)

    return NextResponse.json({
      id: `report-${Date.now()}`,
      type: "monthly",
      generatedDate: new Date().toISOString(),
      period,
      ...report,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
