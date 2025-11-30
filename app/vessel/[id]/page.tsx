"use client"

import { use } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { ArrowLeft, Ship, MapPin, Calendar, AlertCircle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FoulingChart } from "@/components/fouling-chart"
import { FuelConsumptionChart } from "@/components/fuel-consumption-chart"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function VesselDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const vesselId = resolvedParams.id

  const { data: analyticsData } = useSWR(`/api/analytics/vessel/${vesselId}`, fetcher)
  const { data: historicalData } = useSWR(`/api/sensors/historical/${vesselId}`, fetcher)
  const { data: predictionData } = useSWR(`/api/predictions/${vesselId}`, fetcher)

  if (!analyticsData || !historicalData || !predictionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { vessel, sensorData, prediction, analysis } = analyticsData

  // CORREÇÃO DO BUG: Convertendo a string de data em objeto Date para usar getTime()
  const optimalCleaningDate = new Date(prediction.optimalCleaningDate)
  const daysUntilOptimalCleaning = Math.floor((optimalCleaningDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))


  // Mapeamento de Risco para a cor do Badge
  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-danger text-danger-foreground"
      case "high":
        return "bg-warning text-warning-foreground"
      case "medium":
        return "bg-info text-info-foreground"
      default:
        return "bg-success text-success-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4 text-primary hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary rounded-lg">
                <Ship className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{vessel.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {vessel.imo} • {vessel.length}m x {vessel.beam}m
                </p>
              </div>
            </div>

            {/* BADGE DE RISCO */}
            <Badge className={getRiskBadgeColor(prediction.riskLevel)}>
              Risco:{" "}
              {prediction.riskLevel === "critical"
                ? "Crítico"
                : prediction.riskLevel === "high"
                  ? "Alto"
                  : prediction.riskLevel === "medium"
                    ? "Médio"
                    : "Baixo"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Nível de Incrustação</p>
              <p className="text-3xl font-bold text-primary">{sensorData.foulingLevel.toFixed(1)} / 5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Arrasto Adicional</p>
              <p className="text-3xl font-bold text-warning">+{sensorData.dragIncrease.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Consumo Extra</p>
              <p className="text-3xl font-bold text-primary">
                +{(sensorData.fuelConsumption - 800).toFixed(0)} L/h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Limpeza Ideal</p>
              <p className="text-3xl font-bold text-info">
                {daysUntilOptimalCleaning} dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FoulingChart data={historicalData} predictions={predictionData.predictedLevels} />
          <FuelConsumptionChart data={historicalData} />
        </div>

        {/* Analysis & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Eficiência</CardTitle>
              <CardDescription>Impacto da incrustação no desempenho</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Combustível */}
              <div>
                <p className="text-sm font-semibold mb-2">Combustível</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base:</span>
                    <span>{analysis.fuelEfficiency.baseline} L/h</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atual:</span>
                    <span className="font-semibold">{analysis.fuelEfficiency.current} L/h</span>
                  </div>

                  <div className="flex justify-between text-primary">
                    <span>Aumento:</span>
                    <span className="font-semibold">+{analysis.fuelEfficiency.increase}%</span>
                  </div>

                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="text-muted-foreground">Custo Extra/Dia:</span>
                    <span className="font-semibold">
                      R$ {analysis.fuelEfficiency.extraCostPerDay.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emissões */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Emissões GEE</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base:</span>
                    <span>{(analysis.ghgEmissions.baseline / 1000).toFixed(1)} ton CO₂/dia</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atual:</span>
                    <span className="font-semibold">
                      {(analysis.ghgEmissions.current / 1000).toFixed(1)} ton CO₂/dia
                    </span>
                  </div>

                  <div className="flex justify-between text-primary">
                    <span>Aumento:</span>
                    <span className="font-semibold">+{analysis.ghgEmissions.increase.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Compliance */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-2">Conformidade NORMAM 401/2016</p>
                <div className="flex items-center gap-2">
                  {analysis.compliance.normam401 ? (
                    <>
                      <div className="h-3 w-3 rounded-full bg-success" />
                      <span className="text-sm text-success">Conforme</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 rounded-full bg-danger" />
                      <span className="text-sm text-danger">Violação Iminente</span>
                    </>
                  )}
                </div>

                {analysis.compliance.riskLevel === "warning" && (
                  <p className="text-sm text-warning mt-2">
                    Risco de violação em {analysis.compliance.daysUntilViolation} dias
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
              <CardDescription>Ações sugeridas pelo sistema</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-secondary rounded-lg border border-border/20">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-success/10 border border-success rounded-lg">
                <p className="font-semibold text-success mb-2">Economia Projetada</p>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Combustível:</span>
                    <span className="font-semibold text-success">{prediction.estimatedSavings.fuel.toLocaleString("pt-BR")} L</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-semibold text-success">
                      R$ {prediction.estimatedSavings.cost.toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Redução GEE:</span>
                    <span className="font-semibold text-success">{prediction.estimatedSavings.ghgReduction} ton CO₂</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}