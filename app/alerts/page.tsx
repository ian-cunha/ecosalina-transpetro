"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertPanel } from "@/components/alert-panel"

export default function AlertsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER DE CONTEÚDO */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <h1 className="text-3xl font-bold">Central de Alertas</h1>
        <p className="text-muted-foreground mt-1">Monitore notificações críticas e avisos do sistema</p>
      </div>

      <main className="container mx-auto px-4 py-0">
        <AlertPanel />
      </main>
    </div>
  )
}