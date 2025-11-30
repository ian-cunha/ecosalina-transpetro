import { type NextRequest, NextResponse } from "next/server"
import { generateChatResponse } from "@/lib/ai-services"

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const response = await generateChatResponse(messages, context)

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
