// ian-cunha/ecosalina/ian-cunha-ecosalina-1c16a846bee5c0577f09932eee2928e2fc98a5aa/app/api/performance/metrics/route.ts

import { NextResponse } from "next/server"
import { mockVessels, generateSensorData } from "@/lib/mock-data"

// Calcula métricas de desempenho do sistema
export async function GET(request: Request) { // CORRIGIDO: Adicionado o tipo 'Request'
  const searchParams = new URL(request.url).searchParams
  const period = searchParams.get("period") || "monthly"

  // Simula economia total da frota
  let totalFuelSaved = 0
  let totalCostSaved = 0
  let totalGHGReduced = 0

  mockVessels.forEach((vessel) => {
    const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

    const sensorData = generateSensorData(vessel.id, daysSinceCleaning)

    // Calcula economia por otimização de limpeza
    const daysOptimized = Math.max(0, daysSinceCleaning - 90) // vs limpeza a cada 90 dias
    const fuelSaved = daysOptimized * 100 * 0.15 // economia estimada
    const costSaved = fuelSaved * 5.8
    const ghgReduced = fuelSaved * 0.0026

    totalFuelSaved += fuelSaved
    totalCostSaved += costSaved
    totalGHGReduced += ghgReduced
  })

  return NextResponse.json({
    period,
    fuelSaved: Number(totalFuelSaved.toFixed(2)),
    costSaved: Number(totalCostSaved.toFixed(2)),
    ghgReduced: Number(totalGHGReduced.toFixed(2)),
    cleaningsOptimized: 3,
    predictionAccuracy: 87.5, // Mock da acurácia do modelo ML
    vesselsMonitored: mockVessels.length,
    alertsGenerated: 12,
    complianceRate: 100, // % embarcações em conformidade com NORMAM 401/2016
  })
}