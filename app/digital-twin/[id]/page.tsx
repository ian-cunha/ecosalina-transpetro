import { DigitalTwinDashboard } from "@/components/digital-twin-dashboard"
import { ExtendedPredictions } from "@/components/extended-predictions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DigitalTwinPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      {/* HEADER DE CONTEÚDO */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Digital Twin & Previsões Avançadas</h1>
            <p className="text-sm text-muted-foreground">Análise hidrodinâmica e predições multi-período</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-0 space-y-8">
        <DigitalTwinDashboard vesselId={params.id} />
        <ExtendedPredictions vesselId={params.id} />
      </main>
    </div>
  )
}