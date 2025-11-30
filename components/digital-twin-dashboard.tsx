"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Activity, Gauge, Zap, TrendingUp } from "lucide-react"

export function DigitalTwinDashboard({ vesselId }: { vesselId: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/digital-twin/${vesselId}`)
      .then((res) => res.json())
      .then(setData)
  }, [vesselId])

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-pulse">
        Carregando Digital Twin...
      </div>
    )
  }

  const { digitalTwin, virtualSensors } = data

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <header className="pb-4 border-b border-border/40">
        <h2 className="text-3xl font-bold mb-1 tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Digital Twin Hidrodinâmico
        </h2>
        <p className="text-muted-foreground text-sm">
          Monitoramento contínuo do casco e detecção automática de bioincrustação
        </p>
      </header>

      {/* CARDS PRINCIPAIS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ÍNDICE DE BIOINCRUSTAÇÃO */}
        <Card className="p-6 backdrop-blur-md bg-card/60 border border-border/40 shadow-md hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="h-6 w-6 text-primary drop-shadow" />
            <h3 className="font-semibold text-xl">Índice de Bioincrustação</h3>
          </div>

          <div className="space-y-6">
            {/* MÉTRICA PRINCIPAL */}
            <div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-6xl font-bold text-primary drop-shadow">
                  {digitalTwin.biofoulingIndex}
                </span>
                <span className="text-xl text-muted-foreground mb-2">%</span>
              </div>

              {/* BARRA DE NÍVEL */}
              <div className="w-full bg-muted/60 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 transition-all duration-700 ${digitalTwin.biofoulingIndex > 60
                      ? "bg-danger"
                      : digitalTwin.biofoulingIndex > 40
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                  style={{ width: `${digitalTwin.biofoufingIndex}%` }}
                />
              </div>
            </div>

            {/* ARRASTO */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <MetricBox
                label="Arrasto Real"
                value={digitalTwin.actualHull.dragCoefficient.toFixed(4)}
              />
              <MetricBox
                label="Arrasto Ideal"
                value={digitalTwin.idealHull.dragCoefficient.toFixed(4)}
              />
            </div>
          </div>
        </Card>

        {/* DEGRADAÇÃO */}
        <Card className="p-6 backdrop-blur-md bg-card/60 border border-border/40 shadow-md hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-primary drop-shadow" />
            <h3 className="font-semibold text-xl">Degradação de Performance</h3>
          </div>

          <div className="space-y-4 text-sm">
            <Metric label="Perda de Velocidade" value={digitalTwin.performanceDegradation.speedLoss} />
            <Metric label="Aumento Combustível" value={digitalTwin.performanceDegradation.fuelIncrease} />
            <Metric label="Aumento Potência" value={digitalTwin.performanceDegradation.powerIncrease} />
            <Metric label="Perda Eficiência" value={digitalTwin.performanceDegradation.efficiencyLoss} negative />
          </div>
        </Card>
      </section>

      {/* SENSORES VIRTUAIS */}
      <Card className="p-6 backdrop-blur-md bg-card/60 border border-border/40 shadow-md">
        <div className="flex items-center gap-3 mb-5">
          <Activity className="h-6 w-6 text-primary drop-shadow" />
          <h3 className="font-semibold text-xl">Sensores Virtuais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {virtualSensors.map((sensor: any) => (
            <div
              key={sensor.id}
              className="p-5 rounded-xl border bg-secondary/30 hover:bg-secondary/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{sensor.name}</p>
                <Zap className="h-4 w-4 text-primary" />
              </div>

              <p className="text-4xl font-bold mb-1 text-primary drop-shadow">
                {sensor.value.toFixed(2)}
                <span className="text-sm ml-1 text-muted-foreground">
                  {sensor.unit}
                </span>
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Confiança: {(sensor.confidence * 100).toFixed(0)}%</span>
                <span>{sensor.algorithm}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* COMPARAÇÃO */}
      <Card className="p-6 backdrop-blur-md bg-card/60 border border-border/40 shadow-md">
        <h3 className="font-semibold text-xl mb-5">Comparação Ideal vs Real</h3>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <Comparison
            title="Casco Ideal (Limpo)"
            speed={`${digitalTwin.idealHull.expectedSpeed.toFixed(1)} nós`}
            fuel={`${digitalTwin.idealHull.expectedFuelConsumption.toFixed(0)} L/h`}
          />

          <Comparison
            title="Casco Real (Atual)"
            speed={`${digitalTwin.actualHull.actualSpeed.toFixed(1)} nós`}
            fuel={`${digitalTwin.actualHull.actualFuelConsumption.toFixed(0)} L/h`}
          />
        </div>
      </Card>
    </div>
  )
}

/* COMPONENTES AUXILIARES */

function MetricBox({ label, value }: any) {
  return (
    <div className="p-3 rounded-lg bg-secondary/50 border border-border/20 shadow-sm">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold text-primary">{value}</p>
    </div>
  )
}

function Metric({ label, value, negative = false }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-semibold ${negative ? "text-danger" : "text-primary"
          }`}
      >
        {negative ? "-" : "+"}
        {value.toFixed(1)}%
      </span>
    </div>
  )
}

function Comparison({ title, speed, fuel }: any) {
  return (
    <div className="p-4 rounded-lg bg-secondary/50 border border-border/20 shadow-sm">
      <p className="text-sm text-muted-foreground mb-3">{title}</p>

      <div className="space-y-2">
        <ComparisonRow label="Velocidade" value={speed} />
        <ComparisonRow label="Combustível" value={fuel} />
      </div>
    </div>
  )
}

function ComparisonRow({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  )
}