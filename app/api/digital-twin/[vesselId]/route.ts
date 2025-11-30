import { type NextRequest, NextResponse } from "next/server"
import { calculateDigitalTwin, generateVirtualSensors } from "@/lib/digital-twin"

export async function GET(request: NextRequest, context: { params: Promise<{ vesselId: string }> }) {
  const { vesselId } = await context.params

  // Simular dados operacionais em tempo real
  const operationalData = {
    vesselId,
    timestamp: new Date(),
    speed: 14.2,
    rpm: 78,
    torque: 125000,
    gpsPosition: {
      lat: -23.5,
      lon: -45.2,
      heading: 135,
    },
    fuelConsumption: 1850,
    seaConditions: {
      waveHeight: 1.8,
      windSpeed: 12,
      windDirection: 90,
      currentSpeed: 1.2,
      currentDirection: 180,
    },
    environmentalConditions: {
      waterTemperature: 24.5,
      salinity: 35.2,
      chlorophyll: 0.8,
      oxygenLevel: 7.2,
    },
    operationalProfile: {
      loadStatus: "laden" as const,
      cargoType: "Petróleo Cru",
      draftForward: 12.5,
      draftAft: 13.2,
    },
  }

  // Curva de potência do fabricante (baseline)
  const baselinePowerCurve = [
    { rpm: 60, expectedPower: 8500, expectedSpeed: 12.0, expectedFuelRate: 1450 },
    { rpm: 70, expectedPower: 11200, expectedSpeed: 13.5, expectedFuelRate: 1680 },
    { rpm: 80, expectedPower: 14500, expectedSpeed: 15.0, expectedFuelRate: 1950 },
    { rpm: 90, expectedPower: 18200, expectedSpeed: 16.2, expectedFuelRate: 2280 },
  ]

  // Dados históricos (simplificado)
  const historicalData = [operationalData]

  // Calcular Digital Twin
  const digitalTwin = calculateDigitalTwin(vesselId, operationalData, baselinePowerCurve, historicalData)

  // Gerar sensores virtuais
  const virtualSensors = generateVirtualSensors(digitalTwin, operationalData)

  return NextResponse.json({
    digitalTwin,
    operationalData,
    virtualSensors,
    timestamp: new Date(),
  })
}