"use client"

import { useState } from "react"
import { TrendingUp, Zap, DollarSign, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ScenarioSimulatorProps {
  vesselId: string
  vesselData: any
}

export function ScenarioSimulator({ vesselId, vesselData }: ScenarioSimulatorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("optimal")
  const [results, setResults] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const runSimulation = async () => {
    setIsSimulating(true)

    try {
      const response = await fetch("/api/ai/simulate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vesselId,
          vesselData,
          scenario: {
            strategy: selectedStrategy,
          },
        }),
      })

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error("Error simulating scenario:", error)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Simulador de Cenários</h3>
          <p className="text-sm text-muted-foreground">
            Compare diferentes estratégias de limpeza e veja o impacto em custos e eficiência
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Estratégia de Limpeza:</Label>
          <RadioGroup value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md border border-border/20">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Limpeza Imediata</span>
                    <span className="text-xs text-warning">Urgente, maior custo</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md border border-border/20">
                <RadioGroupItem value="scheduled" id="scheduled" />
                <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Limpeza Programada</span>
                    <span className="text-xs text-muted-foreground">Cronograma fixo mensal</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md border border-border/20">
                <RadioGroupItem value="optimal" id="optimal" />
                <Label htmlFor="optimal" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Limpeza Otimizada (IA)</span>
                    <span className="text-xs text-success">Recomendado</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md border border-border/20">
                <RadioGroupItem value="delayed" id="delayed" />
                <Label htmlFor="delayed" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Limpeza Adiada</span>
                    <span className="text-xs text-danger">Alto risco</span>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={runSimulation} disabled={isSimulating} className="w-full">
          {isSimulating ? "Simulando..." : "Simular Cenário"}
        </Button>

        {results && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Resultados da Simulação:</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-secondary/50 rounded-lg border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Custo Total</span>
                </div>
                <p className="text-lg font-bold text-primary">R$ {(results.totalCost / 1000).toFixed(1)}k</p>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Combustível</span>
                </div>
                <p className="text-lg font-bold text-primary">{(results.fuelConsumption / 1000).toFixed(0)}k L</p>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Emissões GEE</span>
                </div>
                <p className="text-lg font-bold text-primary">{results.ghgEmissions.toFixed(1)} ton</p>
              </div>

              <div className="p-3 bg-secondary/50 rounded-lg border border-border/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tempo Parado</span>
                </div>
                <p className="text-lg font-bold text-primary">{results.downtime}h</p>
              </div>
            </div>

            {results.complianceRisk > 20 && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-danger">Alerta de Conformidade</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Risco de {results.complianceRisk}% de violar NORMAM 401/2016
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}