"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Ship,
  Droplet,
  AlertCircle,
  TrendingDown,
  Leaf,
  Bell,
  Brain,
  Activity,
  AlertTriangle,
  Info
} from "lucide-react"
import { VesselCard } from "@/components/vessel-card"
import { KPICard } from "@/components/kpi-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { AIChatbot } from "@/components/ai-chatbot"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const router = useRouter()
  const { data: fleetData, error } = useSWR("/api/fleet/overview", fetcher, {
    refreshInterval: 10000,
  })

  const { data: performanceData } = useSWR("/api/performance/metrics?period=monthly", fetcher)
  const { data: alertsData } = useSWR("/api/alerts", fetcher)

  // Removida a linha de estado não utilizada [selectedVessel]
  // Removida a lógica de cálculo de alertas pois está no Navbar

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-primary mx-auto" />
          <p className="text-lg font-semibold">Erro ao carregar dados</p>
        </div>
      </div>
    )
  }

  if (!fleetData || !performanceData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-semibold">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-8">
      <main className="container mx-auto px-4 py-0 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Indicadores de Desempenho</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Embarcações Monitoradas"
              value={fleetData.kpis.totalVessels}
              subtitle={`${fleetData.kpis.operatingVessels} em operação`}
              icon={Ship}
              variant="default"
            />

            <KPICard
              title="Economia de Combustível"
              value={`${performanceData.fuelSaved.toLocaleString("pt-BR")} L`}
              subtitle="Último mês"
              icon={Droplet}
              variant="success"
              trend={{ value: 12, label: "vs mês anterior" }}
            />

            <KPICard
              title="Redução de GEE"
              value={`${performanceData.ghgReduced.toFixed(1)} ton`}
              subtitle="CO₂ evitado"
              icon={Leaf}
              variant="success"
            />

            <KPICard
              title="Economia Total"
              value={`R$ ${(performanceData.costSaved / 1000).toFixed(0)}k`}
              subtitle="Último mês"
              icon={TrendingDown}
              variant="success"
              trend={{ value: 8, label: "vs mês anterior" }}
            />
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Frota Transpetro</h2>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Critical Risk */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-danger" />
                <span className="text-muted-foreground">Crítico ({fleetData.kpis.criticalVessels})</span>
              </div>
              {/* High Risk */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-muted-foreground">Alto Risco ({fleetData.kpis.highRiskVessels})</span>
              </div>
              {/* Medium Risk */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-info" />
                <span className="text-muted-foreground">Médio Risco</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fleetData.fleet.map((item: any) => (
              <VesselCard
                key={item.vessel.id}
                vessel={item.vessel}
                foulingLevel={item.currentSensor.foulingLevel}
                riskLevel={item.prediction.riskLevel}
                daysUntilCleaning={item.prediction.daysUntilCleaning}
                onClick={() => router.push(`/vessel/${item.vessel.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Metrics Section: Clean and flat presentation */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-card border rounded-lg hover:shadow-md transition">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Modelo ML
              </h3>
              <p className="text-4xl font-bold text-success mb-1">{performanceData.predictionAccuracy}%</p>
              <p className="text-sm text-muted-foreground">Acurácia de Previsão</p>
            </Card>

            <Card className="p-6 bg-card border rounded-lg hover:shadow-md transition">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-success" />
                Conformidade
              </h3>
              <p className="text-4xl font-bold text-success mb-1">{performanceData.complianceRate}%</p>
              <p className="text-sm text-muted-foreground">NORMAM 401/2016</p>
            </Card>

            <Card className="p-6 bg-card border rounded-lg hover:shadow-md transition">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Limpezas Otimizadas
              </h3>
              <p className="text-4xl font-bold text-primary mb-1">{performanceData.cleaningsOptimized}</p>
              <p className="text-sm text-muted-foreground">Último mês</p>
            </Card>
          </div>
        </section>
      </main>

      <AIChatbot
        context={{
          totalVessels: fleetData.kpis.totalVessels,
          criticalVessels: fleetData.kpis.criticalVessels,
          fuelSaved: performanceData.fuelSaved,
          ghgReduced: performanceData.ghgReduced,
        }}
      />

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2025 EcoSalina - Alpha</p>
            <p>Última atualização: {new Date().toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}