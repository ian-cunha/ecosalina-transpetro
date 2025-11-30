// Funções de análise e cálculo de KPIs

import type { SensorData, Vessel, BiofoulingPrediction } from "./types"

export interface AnalyticsReport {
  fuelEfficiency: {
    baseline: number // consumo base (L/h)
    current: number // consumo atual (L/h)
    increase: number // % de aumento
    extraCostPerDay: number // custo extra por dia (R$)
  }
  ghgEmissions: {
    baseline: number // emissões base (kg CO2/dia)
    current: number // emissões atuais (kg CO2/dia)
    increase: number // % de aumento
    extraEmissionsPerDay: number // emissões extras (kg CO2/dia)
  }
  compliance: {
    normam401: boolean // conformidade com NORMAM 401/2016
    riskLevel: "compliant" | "warning" | "violation"
    daysUntilViolation: number
  }
  recommendations: string[]
}

export class BiofoulingAnalytics {
  /**
   * Calcula relatório completo de análise para uma embarcação
   */
  static generateReport(vessel: Vessel, sensorData: SensorData, prediction: BiofoulingPrediction): AnalyticsReport {
    // Consumo base vs atual
    const baselineFuel = 800 // L/h
    const currentFuel = sensorData.fuelConsumption
    const fuelIncrease = ((currentFuel - baselineFuel) / baselineFuel) * 100
    const extraCostPerDay = (currentFuel - baselineFuel) * 24 * 5.8 // R$/dia

    // Emissões GEE (2.6 kg CO2 por litro de diesel)
    const baselineGHG = baselineFuel * 24 * 2.6
    const currentGHG = currentFuel * 24 * 2.6
    const ghgIncrease = ((currentGHG - baselineGHG) / baselineGHG) * 100
    const extraGHG = currentGHG - baselineGHG

    // Conformidade NORMAM 401/2016 (limite de fouling = 4.5)
    const normam401Compliant = sensorData.foulingLevel < 4.5
    let complianceRisk: "compliant" | "warning" | "violation" = "compliant"
    let daysUntilViolation = 999

    if (sensorData.foulingLevel >= 4.5) {
      complianceRisk = "violation"
      daysUntilViolation = 0
    } else if (sensorData.foulingLevel >= 3.5) {
      complianceRisk = "warning"
      daysUntilViolation = Math.floor((4.5 - sensorData.foulingLevel) / 0.016)
    } else {
      daysUntilViolation = Math.floor((4.5 - sensorData.foulingLevel) / 0.016)
    }

    // Gera recomendações
    const recommendations = this.generateRecommendations(sensorData, prediction, complianceRisk)

    return {
      fuelEfficiency: {
        baseline: baselineFuel,
        current: Number(currentFuel.toFixed(2)),
        increase: Number(fuelIncrease.toFixed(2)),
        extraCostPerDay: Number(extraCostPerDay.toFixed(2)),
      },
      ghgEmissions: {
        baseline: Number(baselineGHG.toFixed(2)),
        current: Number(currentGHG.toFixed(2)),
        increase: Number(ghgIncrease.toFixed(2)),
        extraEmissionsPerDay: Number(extraGHG.toFixed(2)),
      },
      compliance: {
        normam401: normam401Compliant,
        riskLevel: complianceRisk,
        daysUntilViolation,
      },
      recommendations,
    }
  }

  /**
   * Gera recomendações baseadas em dados e previsões
   */
  private static generateRecommendations(
    sensorData: SensorData,
    prediction: BiofoulingPrediction,
    complianceRisk: "compliant" | "warning" | "violation",
  ): string[] {
    const recommendations: string[] = []

    if (complianceRisk === "violation") {
      recommendations.push("URGENTE: Programar limpeza imediata para evitar multas NORMAM 401/2016")
    } else if (complianceRisk === "warning") {
      recommendations.push(
        `Programar limpeza preventiva nas próximas ${prediction.optimalCleaningDate.toLocaleDateString("pt-BR")}`,
      )
    }

    if (sensorData.dragIncrease > 40) {
      recommendations.push(`Arrasto elevado (${sensorData.dragIncrease.toFixed(1)}%) - considerar otimização de rota`)
    }

    if (sensorData.waterTemperature > 26) {
      recommendations.push("Temperatura da água favorece crescimento acelerado - monitorar frequentemente")
    }

    if (prediction.estimatedSavings.cost > 50000) {
      recommendations.push(
        `Economia potencial de R$ ${prediction.estimatedSavings.cost.toLocaleString("pt-BR")} ao otimizar limpeza`,
      )
    }

    if (sensorData.foulingLevel < 2.0) {
      recommendations.push("Nível de incrustação baixo - manter monitoramento regular")
    }

    return recommendations
  }

  /**
   * Calcula ROI do sistema SIMP-Bio
   */
  static calculateROI(
    implementationCost: number,
    monthlyOperationalCost: number,
    monthlySavings: number,
    months: number,
  ): {
    totalCost: number
    totalSavings: number
    netBenefit: number
    roi: number // %
    paybackPeriod: number // meses
  } {
    const totalCost = implementationCost + monthlyOperationalCost * months
    const totalSavings = monthlySavings * months
    const netBenefit = totalSavings - totalCost
    const roi = (netBenefit / totalCost) * 100
    const paybackPeriod = implementationCost / (monthlySavings - monthlyOperationalCost)

    return {
      totalCost: Number(totalCost.toFixed(2)),
      totalSavings: Number(totalSavings.toFixed(2)),
      netBenefit: Number(netBenefit.toFixed(2)),
      roi: Number(roi.toFixed(2)),
      paybackPeriod: Number(paybackPeriod.toFixed(1)),
    }
  }
}
