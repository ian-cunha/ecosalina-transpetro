"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ship, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { Vessel } from "@/lib/types"
import { useEffect, useState } from "react"

interface VesselCardProps {
  vessel: Vessel
  foulingLevel: number
  riskLevel: "low" | "medium" | "high" | "critical"
  daysUntilCleaning: number
  onClick?: () => void
}

export function VesselCard({ vessel, foulingLevel, riskLevel, daysUntilCleaning, onClick }: VesselCardProps) {
  const [animateWidth, setAnimateWidth] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimateWidth((foulingLevel / 5) * 100)
    }, 150)
    return () => clearTimeout(timeout)
  }, [foulingLevel])

  // Mapeamento de Risco para Cores Semânticas (baseado no novo tema)
  const getRiskColor = () => {
    switch (riskLevel) {
      case "critical":
        return "bg-danger text-danger-foreground shadow-sm" // Vermelho para Crítico
      case "high":
        return "bg-warning text-warning-foreground shadow-sm" // Amarelo/Laranja para Alto
      case "medium":
        return "bg-info text-info-foreground shadow-sm" // Cor Principal/Info para Médio
      default:
        return "bg-success text-success-foreground shadow-sm" // Verde para Baixo
    }
  }

  const getRiskLabel = () => {
    switch (riskLevel) {
      case "critical":
        return "Crítico"
      case "high":
        return "Alto"
      case "medium":
        return "Médio"
      default:
        return "Baixo"
    }
  }

  // Mapeamento do Nível de Incrustação para a Cor da Barra
  const getBarColor = () => {
    if (foulingLevel >= 4.5) return "bg-danger"
    if (foulingLevel >= 3.5) return "bg-warning"
    if (foulingLevel >= 2.5) return "bg-info"
    return "bg-success"
  }

  return (
    <Card
      className="
        group cursor-pointer transition-all 
        hover:shadow-xl hover:shadow-primary/20 
        hover:border-primary/70 
        rounded-xl 
        bg-card/80 backdrop-blur-sm
      "
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent transition">
              <Ship className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">{vessel.name}</CardTitle>
          </div>

          <Badge className={`${getRiskColor()} text-xs px-2 py-1 rounded-md`}>
            {getRiskLabel()}
          </Badge>
        </div>

        <CardDescription className="text-sm opacity-80">
          {vessel.imo} • {vessel.type === "tanker" ? "Navio-Tanque" : "Cargueiro"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Nível de Incrustação</span>
          <span className="font-semibold text-primary">{foulingLevel.toFixed(1)} / 5.0</span>
        </div>

        {/* Barra */}
        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ease-out ${getBarColor()}`}
            style={{ width: `${animateWidth}%` }}
          />
        </div>

        {/* Limpeza */}
        <div className="flex items-center gap-2 text-sm pt-3 border-t">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            Limpeza ideal em <span className="text-primary font-semibold">{daysUntilCleaning} dias</span>
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          {vessel.status === "operating" ? (
            <>
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="font-medium text-success">Operando</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="font-medium text-warning">Atracado</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}