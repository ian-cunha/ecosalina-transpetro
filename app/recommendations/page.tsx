"use client"

import useSWR from "swr"
import { ArrowLeft, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecommendationCard } from "@/components/recommendation-card"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function RecommendationsPage() {
  const { data: fleetData } = useSWR("/api/fleet/overview", fetcher)
  const { data: comparisonData } = useSWR("/api/ml/compare", fetcher)
  if (!fleetData || !comparisonData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Ordena por prioridade (critico → alto → medio → baixo)
  const sortedFleet = [...fleetData.fleet].sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return (
      riskOrder[a.prediction.riskLevel as keyof typeof riskOrder] -
      riskOrder[b.prediction.riskLevel as keyof typeof riskOrder]
    )
  })

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER DE CONTEÚDO */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-secondary">
            <Lightbulb className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Recomendações Inteligentes</h1>
            <p className="text-muted-foreground mt-1">
              Sugestões otimizadas por Machine Learning
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-0 space-y-8">

        {/* CARD — BENEFÍCIOS */}
        <Card className="bg-secondary/50 border-primary/50 shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary">Impacto da Otimização por ML</CardTitle>
            <CardDescription>
              Comparação entre limpeza tradicional vs limpeza preditiva
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Economia Total Projetada</p>
                <p className="text-3xl font-bold text-primary animate-fadeIn">
                  R$ {(comparisonData.fleetSummary.totalFinancialImpact / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground mt-1">vs limpeza a cada 90 dias</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Economia Média/Embarcação</p>
                <p className="text-3xl font-bold text-primary animate-fadeIn">
                  R$ {(comparisonData.fleetSummary.averageSavingsPerVessel / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-muted-foreground mt-1">por ciclo</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Método Recomendado</p>
                <p className="text-lg font-bold text-primary">
                  {comparisonData.fleetSummary.recommendedApproach === "ML-optimized predictive cleaning"
                    ? "Limpeza Preditiva ML"
                    : "Limpeza Programada"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">baseado em dados reais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE RECOMENDAÇÕES */}
        <section>
          <h2 className="text-xl font-semibold text-primary mb-4">Recomendações por Embarcação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedFleet.map((item: any) => {
              // VERIFICAÇÃO DE SEGURANÇA: Se prediction ou currentSensor estiverem faltando, pular o item
              if (!item.prediction || !item.currentSensor) return null;

              return (
                <RecommendationCard
                  key={item.vessel.id}
                  vesselName={item.vessel.name}
                  // Os dados são mapeados aqui, mas o RecommendationCard espera o objeto prediction completo
                  prediction={item.prediction}
                />
              )
            })}
          </div>
        </section>

        {/* TABELA COMPARATIVA */}
        <section>
          <h2 className="text-xl font-semibold text-primary mb-4">Análise Comparativa Detalhada</h2>

          <Card className="rounded-xl shadow-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-primary">Limpeza Tradicional vs ML</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-secondary">
                      <th className="text-left p-3 font-semibold text-primary">Embarcação</th>
                      <th className="text-left p-3">Tradicional</th>
                      <th className="text-left p-3">ML Otimizado</th>
                      <th className="text-left p-3">Diferença</th>
                      <th className="text-left p-3">Impacto R$</th>
                      <th className="text-left p-3">Recomendação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {comparisonData.comparisons.map((comp: any) => (
                      <tr key={comp.vesselId} className="border-b hover:bg-secondary/40 transition">
                        <td className="p-3 font-semibold">{comp.vesselName}</td>
                        <td className="p-3">{comp.scheduled.daysUntilCleaning}</td>
                        <td className="p-3">{comp.mlOptimized.daysUntilCleaning}</td>

                        <td
                          className={`p-3 font-medium ${comp.difference.daysDifference > 0
                            ? "text-success"
                            : "text-danger"
                            }`}
                        >
                          {comp.difference.daysDifference > 0 ? "+" : ""}
                          {comp.difference.daysDifference} dias
                        </td>

                        <td
                          className={`p-3 font-semibold ${comp.difference.financialImpact > 0
                            ? "text-success"
                            : "text-danger"
                            }`}
                        >
                          R$ {comp.difference.financialImpact.toLocaleString("pt-BR")}
                        </td>

                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${comp.difference.recommendation === "Postpone cleaning"
                              ? "bg-success/20 text-success"
                              : "bg-danger/20 text-danger"
                              }`}
                          >
                            {comp.difference.recommendation === "Postpone cleaning"
                              ? "Adiar"
                              : "Antecipar"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}