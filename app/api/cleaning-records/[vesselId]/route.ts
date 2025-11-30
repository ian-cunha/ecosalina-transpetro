import { NextResponse } from "next/server"
import { mockCleaningRecords } from "@/lib/mock-data"

// Retorna histórico de limpezas de uma embarcação
export async function GET(request: Request, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params

  const records = mockCleaningRecords
    .filter((record) => record.vesselId === vesselId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return NextResponse.json(records)
}

// Adiciona novo registro de limpeza
export async function POST(request: Request, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params
  const body = await request.json()

  const newRecord = {
    id: `c${Date.now()}`,
    vesselId,
    date: new Date(body.date),
    foulingLevelBefore: body.foulingLevelBefore,
    duration: body.duration,
    cost: body.cost,
    method: body.method,
    location: body.location,
  }

  mockCleaningRecords.push(newRecord)

  return NextResponse.json(newRecord, { status: 201 })
}
