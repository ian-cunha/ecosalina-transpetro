import { type NextRequest, NextResponse } from "next/server"
import { analyzeUnderwaterImage } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, vesselId, location } = await request.json()

    const analysis = await analyzeUnderwaterImage(imageUrl)

    return NextResponse.json({
      vesselId,
      location,
      imageUrl,
      timestamp: new Date().toISOString(),
      aiAnalysis: analysis,
    })
  } catch (error) {
    console.error("Error analyzing image:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
