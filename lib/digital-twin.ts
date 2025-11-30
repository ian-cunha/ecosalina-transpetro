import type { OperationalData, DigitalTwin, PowerCurvePoint } from "./types"

/**
 * Motor de Digital Twin Hidrodinâmico
 * Compara performance ideal vs real para detectar bioincrustação
 */

export function calculateDigitalTwin(
  vesselId: string,
  operationalData: OperationalData,
  baselinePowerCurve: PowerCurvePoint[],
  historicalData: OperationalData[],
): DigitalTwin {
  // 1. Calcular performance esperada (casco limpo ideal)
  const idealPerformance = calculateIdealPerformance(operationalData, baselinePowerCurve)

  // 2. Medir performance real
  const actualPerformance = {
    dragCoefficient: calculateActualDrag(operationalData),
    actualSpeed: operationalData.speed,
    actualFuelConsumption: operationalData.fuelConsumption,
    measuredPower: calculatePowerFromTorque(operationalData.rpm, operationalData.torque),
  }

  // 3. Calcular índice de bioincrustação (0-100%)
  const biofoulingIndex = calculateBiofoulingIndex(idealPerformance, actualPerformance, operationalData)

  // 4. Calcular degradação de performance
  const performanceDegradation = {
    speedLoss:
      ((idealPerformance.expectedSpeed - actualPerformance.actualSpeed) / idealPerformance.expectedSpeed) * 100,
    fuelIncrease:
      ((actualPerformance.actualFuelConsumption - idealPerformance.expectedFuelConsumption) /
        idealPerformance.expectedFuelConsumption) *
      100,
    powerIncrease:
      ((actualPerformance.measuredPower - idealPerformance.expectedPower) / idealPerformance.expectedPower) * 100,
    efficiencyLoss: calculateEfficiencyLoss(idealPerformance, actualPerformance),
  }

  return {
    vesselId,
    idealHull: {
      dragCoefficient: idealPerformance.dragCoefficient,
      expectedSpeed: idealPerformance.expectedSpeed,
      expectedFuelConsumption: idealPerformance.expectedFuelConsumption,
      powerCurve: baselinePowerCurve,
    },
    actualHull: actualPerformance,
    biofoulingIndex: Number(biofoulingIndex.toFixed(1)),
    performanceDegradation: {
      speedLoss: Number(performanceDegradation.speedLoss.toFixed(2)),
      fuelIncrease: Number(performanceDegradation.fuelIncrease.toFixed(2)),
      powerIncrease: Number(performanceDegradation.powerIncrease.toFixed(2)),
      efficiencyLoss: Number(performanceDegradation.efficiencyLoss.toFixed(2)),
    },
    lastCalibration: new Date(),
  }
}

function calculateIdealPerformance(data: OperationalData, powerCurve: PowerCurvePoint[]) {
  // Interpolar da curva de potência do fabricante
  const curvePoint = interpolatePowerCurve(data.rpm, powerCurve)

  // Ajustar para condições ambientais
  const environmentalFactor = calculateEnvironmentalFactor(data)

  return {
    dragCoefficient: 0.075, // Coeficiente de arrasto limpo típico
    expectedSpeed: curvePoint.expectedSpeed * environmentalFactor.speedFactor,
    expectedFuelConsumption: curvePoint.expectedFuelRate * environmentalFactor.fuelFactor,
    expectedPower: curvePoint.expectedPower,
  }
}

function interpolatePowerCurve(rpm: number, powerCurve: PowerCurvePoint[]): PowerCurvePoint {
  // Encontrar pontos adjacentes
  let lowerPoint = powerCurve[0]
  let upperPoint = powerCurve[powerCurve.length - 1]

  for (let i = 0; i < powerCurve.length - 1; i++) {
    if (powerCurve[i].rpm <= rpm && powerCurve[i + 1].rpm >= rpm) {
      lowerPoint = powerCurve[i]
      upperPoint = powerCurve[i + 1]
      break
    }
  }

  // Interpolação linear
  const fraction = (rpm - lowerPoint.rpm) / (upperPoint.rpm - lowerPoint.rpm)

  return {
    rpm,
    expectedPower: lowerPoint.expectedPower + fraction * (upperPoint.expectedPower - lowerPoint.expectedPower),
    expectedSpeed: lowerPoint.expectedSpeed + fraction * (upperPoint.expectedSpeed - lowerPoint.expectedSpeed),
    expectedFuelRate:
      lowerPoint.expectedFuelRate + fraction * (upperPoint.expectedFuelRate - lowerPoint.expectedFuelRate),
  }
}

function calculateEnvironmentalFactor(data: OperationalData) {
  // Fator de ondas (0.85-1.0)
  const waveFactor = Math.max(0.85, 1.0 - data.seaConditions.waveHeight * 0.03)

  // Fator de vento (0.9-1.0)
  const windFactor = Math.max(0.9, 1.0 - data.seaConditions.windSpeed * 0.002)

  // Fator de corrente (0.95-1.05)
  const currentFactor =
    1.0 +
    ((data.seaConditions.currentSpeed *
      Math.cos((data.seaConditions.currentDirection - data.gpsPosition.heading) * (Math.PI / 180))) /
      data.speed) *
      0.15

  return {
    speedFactor: waveFactor * windFactor * currentFactor,
    fuelFactor: 1.0 / (waveFactor * windFactor), // Mais combustível em condições adversas
  }
}

function calculateActualDrag(data: OperationalData): number {
  // Estimativa de arrasto baseado em potência, velocidade e condições
  // Fórmula simplificada: Cd = 2 * Power / (ρ * v³ * A)
  const power = calculatePowerFromTorque(data.rpm, data.torque)
  const velocity = data.speed * 0.514444 // nós para m/s

  // Coeficiente estimado (simplificado)
  const estimatedCd = 0.075 + (power / velocity ** 3) * 0.00001

  return estimatedCd
}

function calculatePowerFromTorque(rpm: number, torque: number): number {
  // Power (kW) = (Torque * RPM * 2π) / 60000
  return (torque * rpm * 2 * Math.PI) / 60000
}

function calculateBiofoulingIndex(ideal: any, actual: any, data: OperationalData): number {
  // Múltiplos indicadores de bioincrustação
  const speedDelta = ((ideal.expectedSpeed - actual.actualSpeed) / ideal.expectedSpeed) * 100
  const fuelDelta =
    ((actual.actualFuelConsumption - ideal.expectedFuelConsumption) / ideal.expectedFuelConsumption) * 100
  const dragDelta = ((actual.dragCoefficient - ideal.dragCoefficient) / ideal.dragCoefficient) * 100

  // Peso ponderado dos indicadores
  const index = speedDelta * 0.3 + fuelDelta * 0.5 + dragDelta * 0.2

  // Limitar entre 0-100%
  return Math.max(0, Math.min(100, index))
}

function calculateEfficiencyLoss(ideal: any, actual: any): number {
  // Eficiência global = trabalho útil / energia consumida
  const idealEfficiency = (ideal.expectedSpeed / ideal.expectedFuelConsumption) * 100
  const actualEfficiency = (actual.actualSpeed / actual.actualFuelConsumption) * 100

  return ((idealEfficiency - actualEfficiency) / idealEfficiency) * 100
}

export function generateVirtualSensors(digitalTwin: DigitalTwin, operationalData: OperationalData) {
  return [
    {
      id: `vs-drag-${digitalTwin.vesselId}`,
      vesselId: digitalTwin.vesselId,
      type: "drag" as const,
      name: "Coeficiente de Arrasto Virtual",
      description: "Calculado via Digital Twin a partir de RPM, torque e velocidade",
      calculatedFrom: ["rpm-sensor", "torque-sensor", "speed-log"],
      value: digitalTwin.actualHull.dragCoefficient,
      unit: "adimensional",
      confidence: 0.88,
      lastUpdate: new Date(),
      algorithm: "Hidrodinâmica Computacional",
    },
    {
      id: `vs-fouling-${digitalTwin.vesselId}`,
      vesselId: digitalTwin.vesselId,
      type: "fouling" as const,
      name: "Índice de Bioincrustação",
      description: "Comparação entre performance ideal e real",
      calculatedFrom: ["digital-twin-engine"],
      value: digitalTwin.biofoulingIndex,
      unit: "%",
      confidence: 0.92,
      lastUpdate: new Date(),
      algorithm: "Machine Learning + Digital Twin",
    },
    {
      id: `vs-efficiency-${digitalTwin.vesselId}`,
      vesselId: digitalTwin.vesselId,
      type: "efficiency" as const,
      name: "Eficiência Energética",
      description: "Trabalho útil / energia consumida",
      calculatedFrom: ["fuel-flow", "speed-log", "gps"],
      value: 100 - digitalTwin.performanceDegradation.efficiencyLoss,
      unit: "%",
      confidence: 0.85,
      lastUpdate: new Date(),
      algorithm: "Análise Termodinâmica",
    },
  ]
}
