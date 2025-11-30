import { NextResponse } from "next/server"
import { mockCleaningRecords } from "@/lib/mock-data"

// Simula processo de re-treinamento do modelo ML
export async function POST(request: Request) {
  const body = await request.json()
  const { includeNewData } = body

  // Simula processo de treinamento
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Resultados do treinamento simulado
  const trainingResults = {
    status: "success",
    timestamp: new Date(),
    trainingDuration: 2.3, // segundos
    dataPoints: {
      historical: mockCleaningRecords.length * 30, // 30 pontos por registro
      new: includeNewData ? 450 : 0,
      total: mockCleaningRecords.length * 30 + (includeNewData ? 450 : 0),
    },
    modelPerformance: {
      accuracy: 0.878,
      precision: 0.891,
      recall: 0.865,
      f1Score: 0.877,
      mse: 0.234, // Mean Squared Error
    },
    improvements: {
      accuracyImprovement: includeNewData ? 0.003 : 0,
      predictionSpeedUp: 1.15,
      newFeaturesAdded: includeNewData ? ["port_idle_time", "coating_age"] : [],
    },
    validation: {
      crossValidationScore: 0.872,
      testSetAccuracy: 0.881,
      overfit: false,
    },
  }

  return NextResponse.json(trainingResults)
}

// Retorna status do modelo atual
export async function GET() {
  return NextResponse.json({
    modelVersion: "1.2.0",
    lastTrainingDate: "2024-10-15T14:30:00Z",
    status: "active",
    accuracy: 87.8,
    totalPredictions: 15847,
    successfulPredictions: 13914,
    nextScheduledTraining: "2024-12-15T00:00:00Z",
    dataPoints: 15420,
  })
}
