import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Calendar, DollarSign, TrendingDown } from "lucide-react"
import type { BiofoulingPrediction } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecommendationCardProps {
  vesselName: string
  prediction: BiofoulingPrediction
}

export function RecommendationCard({ vesselName, prediction }: RecommendationCardProps) {
  // CORREÇÃO E TRATAMENTO DE DATA: Garante que prediction.optimalCleaningDate é um Date object.
  const optimalDate = new Date(prediction.optimalCleaningDate);
  const daysUntil = Math.floor((optimalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  // Usando ?. para evitar o erro se estimatedSavings for undefined
  const cost = prediction.estimatedSavings?.cost ?? 0;
  const ghgReduction = prediction.estimatedSavings?.ghgReduction ?? 0;

  const getUrgencyColor = () => {
    if (daysUntil <= 7) return "bg-danger text-danger-foreground"
    if (daysUntil <= 14) return "bg-warning text-warning-foreground"
    return "bg-info text-info-foreground" // Info (novo primário) para planejado
  }

  const getUrgencyLabel = () => {
    if (daysUntil <= 7) return "URGENTE"
    if (daysUntil <= 14) return "Prioritário"
    return "Planejado"
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{vesselName}</CardTitle>
          </div>
          <Badge className={getUrgencyColor()}>{getUrgencyLabel()}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Nível Atual</p>
            <p className="text-2xl font-bold text-primary">{prediction.currentLevel.toFixed(1)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Risco</p>
            <p className="text-2xl font-bold capitalize text-primary">
              {prediction.riskLevel === "critical"
                ? "Crítico"
                : prediction.riskLevel === "high"
                  ? "Alto"
                  : prediction.riskLevel === "medium"
                    ? "Médio"
                    : "Baixo"}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Data Ideal de Limpeza</p>
              <p className="text-sm text-primary">
                {format(optimalDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} ({daysUntil} dias)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Economia Estimada</p>
              <p className="text-sm text-success">R$ {cost.toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Redução GEE</p>
              <p className="text-sm text-success">{ghgReduction} ton CO₂</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button className="w-full" variant="default">
            Agendar Limpeza
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}