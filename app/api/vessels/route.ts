import { NextResponse } from "next/server"
import { mockVessels } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockVessels)
}
