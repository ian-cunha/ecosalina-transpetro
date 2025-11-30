"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
  BellOff,
} from "lucide-react"
import type { Alert } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AlertPanel() {
  const { data: alerts, mutate } = useSWR<Alert[]>("/api/alerts", fetcher, {
    refreshInterval: 5000,
  })

  const [filter, setFilter] =
    useState<"all" | "critical" | "warning" | "info">("all")
  const [showRead, setShowRead] = useState(false)

  if (!alerts) {
    return (
      <Card className="border-border/40 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (!showRead && alert.isRead) return false
    if (filter === "all") return true
    return alert.type === filter
  })

  // Novo: Mapeamento para cores semânticas (danger, warning, info)
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-danger" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      default:
        return <Info className="h-5 w-5 text-info" />
    }
  }

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-danger text-danger-foreground"
      case "warning":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-info text-info-foreground"
    }
  }

  const getAlertBorderColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-danger/40"
      case "warning":
        return "border-warning/40"
      default:
        return "border-info/40"
    }
  }

  return (
    <Card className="shadow-lg border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-5 w-5 text-primary" />
            Central de Alertas
            {filteredAlerts.length > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {filteredAlerts.length}
              </Badge>
            )}
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRead(!showRead)}
          >
            {showRead ? (
              <BellOff className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todos
          </Button>
          {/* Botão Críticos - usa danger */}
          <Button
            variant={filter === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("critical")}
            className={filter === "critical" ? "bg-danger text-danger-foreground hover:bg-danger/90" : "hover:bg-danger/10 hover:text-danger"}
          >
            Críticos
          </Button>
          {/* Botão Avisos - usa warning */}
          <Button
            variant={filter === "warning" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("warning")}
            className={filter === "warning" ? "bg-warning text-warning-foreground hover:bg-warning/90" : "hover:bg-warning/10 hover:text-warning"}
          >
            Avisos
          </Button>
          {/* Botão Informativos - usa info */}
          <Button
            variant={filter === "info" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("info")}
            className={filter === "info" ? "bg-info text-info-foreground hover:bg-info/90" : "hover:bg-info/10 hover:text-info"}
          >
            Informativos
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg transition-all shadow-sm ${getAlertBorderColor(
                  alert.type,
                )} ${alert.isRead
                    ? "bg-muted/40 opacity-70"
                    : "bg-card hover:bg-secondary/30"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-base">
                          {alert.title}
                        </p>
                        <Badge
                          className={`${getAlertBadgeColor(alert.type)}`}
                          variant="secondary"
                        >
                          {alert.type === "critical"
                            ? "Crítico"
                            : alert.type === "warning"
                              ? "Aviso"
                              : "Info"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.message}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(alert.timestamp),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR },
                        )}
                      </p>
                    </div>
                  </div>

                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        alert.isRead = true
                        mutate()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}