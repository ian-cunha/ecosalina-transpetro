"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, TrendingUp, AlertTriangle, Droplet, DollarSign, Leaf } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ExtendedPredictions({ vesselId }: { vesselId: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/predictions/extended/${vesselId}`)
      .then((res) => res.json())
      .then(setData)
  }, [vesselId])

  if (!data) {
    return <div className="text-center py-8">Carregando previsões...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-success text-success-foreground"
      case "warning":
        return "bg-warning text-warning-foreground"
      case "non-compliant":
        return "bg-danger text-danger-foreground"
      default:
        return "bg-secondary"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Previsões Multi-Período</h2>
            <p className="text-muted-foreground">Análise preditiva para 7, 15 e 30 dias</p>
          </div>
          <Badge className={getStatusColor(data.normam401Compliance.status)}>
            NORMAM 401: {data.normam401Compliance.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { period: "7 Dias", data: data.predictions.days7, icon: Calendar },
            { period: "15 Dias", data: data.predictions.days15, icon: Calendar },
            { period: "30 Dias", data: data.predictions.days30, icon: Calendar },
          ].map((item) => (
            <Card key={item.period} className="p-4 bg-secondary">
              <div className="flex items-center gap-2 mb-3">
                <item.icon className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{item.period}</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Índice Previsto</p>
                  <p className="text-2xl font-bold">{item.data.biofoulingIndex}%</p>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.data.biofoulingIndex > 60
                        ? "bg-danger"
                        : item.data.biofoulingIndex > 40
                          ? "bg-warning"
                          : "bg-success"
                    }`}
                    style={{ width: `${item.data.biofoulingIndex}%` }}
                  />
                </div>
                <div className="pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confiança</span>
                    <span className="font-semibold">{item.data.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Combustível Extra</span>
                    <span className="font-semibold text-danger">+{item.data.fuelImpact.toFixed(0)} L/dia</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium">{item.data.recommendedAction}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplet className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Impacto Energético Atual</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Droplet className="h-4 w-4 text-danger" />
                <span className="text-sm">Combustível Extra</span>
              </div>
              <span className="font-bold text-danger">+{data.energyImpact.currentFuelIncrease.toFixed(0)} L/dia</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-danger" />
                <span className="text-sm">Custo Extra</span>
              </div>
              <span className="font-bold text-danger">R$ {data.energyImpact.currentCostIncrease.toFixed(2)}/dia</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-danger" />
                <span className="text-sm">Emissões GEE Extra</span>
              </div>
              <span className="font-bold text-danger">
                +{data.energyImpact.currentEmissionsIncrease.toFixed(1)} kg CO₂/dia
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-semibold">Conformidade NORMAM 401/2016</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Status de Conformidade</p>
              <Badge className={getStatusColor(data.normam401Compliance.status)} variant="outline">
                {data.normam401Compliance.status === "compliant"
                  ? "Em Conformidade"
                  : data.normam401Compliance.status === "warning"
                    ? "Atenção Necessária"
                    : "Não Conforme"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Incrustação Atual</span>
                <span className="font-semibold">{data.normam401Compliance.currentFouling}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Limite Máximo</span>
                <span className="font-semibold">{data.normam401Compliance.maxAllowedFouling}%</span>
              </div>
              {data.normam401Compliance.daysUntilViolation && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dias até Violação</span>
                  <span className="font-semibold text-warning">{data.normam401Compliance.daysUntilViolation} dias</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Próxima Inspeção</span>
                <span className="font-semibold">
                  {new Date(data.normam401Compliance.inspectionDue).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-primary/5 border-primary">
        <div className="flex items-start gap-4">
          <TrendingUp className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Recomendação Otimizada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Com base na análise do Digital Twin e previsões de Machine Learning, recomendamos limpeza em{" "}
              <strong>{new Date(data.optimalCleaningDate).toLocaleDateString("pt-BR")}</strong>.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Economia de Combustível</p>
                <p className="text-lg font-bold text-success">{data.estimatedSavings.fuel.toLocaleString("pt-BR")} L</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Economia Financeira</p>
                <p className="text-lg font-bold text-success">
                  R$ {data.estimatedSavings.cost.toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Redução GEE</p>
                <p className="text-lg font-bold text-success">
                  {data.estimatedSavings.ghgReduction.toFixed(1)} ton CO₂
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
