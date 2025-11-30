import type { Vessel, SensorData, BiofoulingPrediction, Alert, CleaningRecord } from "./types"

// Frota da Transpetro (dados simulados)
export const mockVessels: Vessel[] = [
  {
    id: "v001",
    name: "Transpetro Navigator",
    type: "tanker",
    imo: "IMO9234567",
    length: 274,
    beam: 48,
    draft: 16.5,
    lastCleaning: new Date("2024-08-15"),
    status: "operating",
    currentRoute: {
      origin: "Santos, SP",
      destination: "Vitória, ES",
      departureDate: new Date("2024-11-25"),
      estimatedArrival: new Date("2024-11-30"),
      currentPosition: { lat: -23.9608, lon: -46.3334 },
    },
  },
  {
    id: "v002",
    name: "Atlântico Sul",
    type: "tanker",
    imo: "IMO9234568",
    length: 290,
    beam: 50,
    draft: 17.2,
    lastCleaning: new Date("2024-10-01"),
    status: "operating",
    currentRoute: {
      origin: "Rio de Janeiro, RJ",
      destination: "Salvador, BA",
      departureDate: new Date("2024-11-26"),
      estimatedArrival: new Date("2024-11-29"),
      currentPosition: { lat: -22.9068, lon: -43.1729 },
    },
  },
  {
    id: "v003",
    name: "Petrobras 58",
    type: "tanker",
    imo: "IMO9234569",
    length: 265,
    beam: 46,
    draft: 15.8,
    lastCleaning: new Date("2024-06-20"),
    status: "operating",
    currentRoute: {
      origin: "Manaus, AM",
      destination: "Belém, PA",
      departureDate: new Date("2024-11-24"),
      estimatedArrival: new Date("2024-11-30"),
      currentPosition: { lat: -3.119, lon: -60.0217 },
    },
  },
  {
    id: "v004",
    name: "Oceano Azul",
    type: "cargo",
    imo: "IMO9234570",
    length: 250,
    beam: 44,
    draft: 14.5,
    lastCleaning: new Date("2024-09-10"),
    status: "docked",
    currentRoute: {
      origin: "Suape, PE",
      destination: "Suape, PE",
      departureDate: new Date("2024-11-20"),
      estimatedArrival: new Date("2024-11-20"),
      currentPosition: { lat: -8.3889, lon: -34.9544 },
    },
  },
]

export const vessels = mockVessels

// Gera dados de sensores em tempo real (simulados)
export function generateSensorData(vesselId: string, daysSinceCleaning: number): SensorData {
  // Simula crescimento de incrustação ao longo do tempo
  const baseFouling = Math.min(5, (daysSinceCleaning / 30) * 0.5)
  const randomVariation = Math.random() * 0.3
  const foulingLevel = Math.min(5, baseFouling + randomVariation)

  // Arrasto aumenta com a incrustação
  const baseDrag = 0.2 + (foulingLevel / 5) * 0.4
  const dragIncrease = ((baseDrag - 0.2) / 0.2) * 100

  // Consumo de combustível aumenta com arrasto
  const baseFuel = 800
  const fuelConsumption = baseFuel * (1 + dragIncrease / 100)

  return {
    vesselId,
    timestamp: new Date(),
    dragCoefficient: Number(baseDrag.toFixed(3)),
    hullPressure: 101325 + Math.random() * 5000,
    speed: 12 + Math.random() * 3,
    fuelConsumption: Number(fuelConsumption.toFixed(2)),
    waterTemperature: 22 + Math.random() * 6,
    salinity: 34 + Math.random() * 2,
    foulingLevel: Number(foulingLevel.toFixed(2)),
    dragIncrease: Number(dragIncrease.toFixed(2)),
  }
}

// Mock de previsões de ML
export function generateBiofoulingPrediction(vessel: Vessel, currentSensor: SensorData): BiofoulingPrediction {
  const daysSinceCleaning = Math.floor((Date.now() - vessel.lastCleaning.getTime()) / (1000 * 60 * 60 * 24))

  // Gera previsões para os próximos 60 dias
  const predictedLevels = []
  for (let i = 7; i <= 60; i += 7) {
    const futureDays = daysSinceCleaning + i
    const predictedLevel = Math.min(5, (futureDays / 30) * 0.5 + Math.random() * 0.2)
    predictedLevels.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      level: Number(predictedLevel.toFixed(2)),
      confidence: 0.85 + Math.random() * 0.1,
    })
  }

  // Calcula data ideal de limpeza (quando fouling atinge 3.5-4.0)
  const daysUntilCleaning = Math.max(0, Math.floor(((3.8 - currentSensor.foulingLevel) * 30) / 0.5))
  const optimalCleaningDate = new Date(Date.now() + daysUntilCleaning * 24 * 60 * 60 * 1000)

  // Calcula economia estimada
  const fuelSavings = currentSensor.dragIncrease * 50 * daysUntilCleaning // litros
  const costSavings = fuelSavings * 5.8 // R$ por litro
  const ghgReduction = fuelSavings * 0.0026 // toneladas CO2 por litro

  // Determina nível de risco
  let riskLevel: "low" | "medium" | "high" | "critical" = "low"
  if (currentSensor.foulingLevel >= 4.5) riskLevel = "critical"
  else if (currentSensor.foulingLevel >= 3.5) riskLevel = "high"
  else if (currentSensor.foulingLevel >= 2.5) riskLevel = "medium"

  return {
    vesselId: vessel.id,
    currentLevel: currentSensor.foulingLevel,
    predictedLevels,
    optimalCleaningDate,
    estimatedSavings: {
      fuel: Number(fuelSavings.toFixed(2)),
      cost: Number(costSavings.toFixed(2)),
      ghgReduction: Number(ghgReduction.toFixed(2)),
    },
    riskLevel,
  }
}

// Histórico de limpezas
export const mockCleaningRecords: CleaningRecord[] = [
  {
    id: "c001",
    vesselId: "v001",
    date: new Date("2024-08-15"),
    foulingLevelBefore: 3.8,
    duration: 48,
    cost: 180000,
    method: "dry-dock",
    location: "Santos, SP",
  },
  {
    id: "c002",
    vesselId: "v002",
    date: new Date("2024-10-01"),
    foulingLevelBefore: 3.2,
    duration: 24,
    cost: 95000,
    method: "underwater",
    location: "Rio de Janeiro, RJ",
  },
  {
    id: "c003",
    vesselId: "v003",
    date: new Date("2024-06-20"),
    foulingLevelBefore: 4.5,
    duration: 36,
    cost: 150000,
    method: "dry-dock",
    location: "Manaus, AM",
  },
]

// Gera alertas baseados no nível de incrustação
export function generateAlerts(vessels: Vessel[], sensorData: Map<string, SensorData>): Alert[] {
  const alerts: Alert[] = []

  vessels.forEach((vessel) => {
    const sensor = sensorData.get(vessel.id)
    if (!sensor) return

    if (sensor.foulingLevel >= 4.5) {
      alerts.push({
        id: `alert-${vessel.id}-critical`,
        vesselId: vessel.id,
        type: "critical",
        title: "Nível Crítico de Incrustação",
        message: `${vessel.name}: Nível ${sensor.foulingLevel.toFixed(1)} detectado. Limpeza urgente recomendada. Violação NORMAM 401/2016 iminente.`,
        timestamp: new Date(),
        isRead: false,
        priority: 1,
      })
    } else if (sensor.foulingLevel >= 3.5) {
      alerts.push({
        id: `alert-${vessel.id}-warning`,
        vesselId: vessel.id,
        type: "warning",
        title: "Ponto de Limpeza Ideal Aproximando",
        message: `${vessel.name}: Nível ${sensor.foulingLevel.toFixed(1)}. Programar limpeza nas próximas 2-3 semanas.`,
        timestamp: new Date(),
        isRead: false,
        priority: 2,
      })
    }

    if (sensor.dragIncrease > 50) {
      alerts.push({
        id: `alert-${vessel.id}-fuel`,
        vesselId: vessel.id,
        type: "warning",
        title: "Consumo de Combustível Elevado",
        message: `${vessel.name}: Arrasto aumentou ${sensor.dragIncrease.toFixed(1)}%, causando consumo adicional de ${(sensor.fuelConsumption - 800).toFixed(0)}L/h.`,
        timestamp: new Date(),
        isRead: false,
        priority: 3,
      })
    }
  })

  return alerts.sort((a, b) => a.priority - b.priority)
}
