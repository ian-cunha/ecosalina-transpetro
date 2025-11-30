"use client"

import { useState } from "react"
import useSWR from "swr"
import { Brain, ImageIcon, Route, FileText, Ship } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageAnalyzer } from "@/components/image-analyzer"
import { ScenarioSimulator } from "@/components/scenario-simulator"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AIToolsPage() {
  const router = useRouter()
  const { data: vessels, isValidating } = useSWR("/api/vessels", fetcher)
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"image" | "scenario" | "report">("image")
  const [isGenerating, setIsGenerating] = useState(false)

  const tabs = [
    {
      id: "image",
      title: "Análise de Imagens",
      subtitle: "Detecção automática de bioincrustação",
      icon: <ImageIcon className="h-7 w-7" />,
    },
    {
      id: "scenario",
      title: "Simulador de Cenários",
      subtitle: "Comparar estratégias e custos",
      icon: <Route className="h-7 w-7" />,
    },
    {
      id: "report",
      title: "Relatórios IA",
      subtitle: "Relatórios automatizados e exportáveis",
      icon: <FileText className="h-7 w-7" />,
    },
  ] as const

  const handleGenerateReport = async (period: "monthly" | "quarterly" = "monthly") => {
    try {
      setIsGenerating(true)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - (period === "monthly" ? 1 : 3))

      const res = await fetch("/api/ai/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: { start: startDate.toISOString(), end: endDate.toISOString() },
          scope: selectedVessel ? { vesselId: selectedVessel } : { fleet: true },
        }),
      })
      const json = await res.json()
      console.log("Relatório:", json)
      // Substituindo alert por console.log, conforme a boa prática
      console.log("Relatório gerado — ver console para detalhes.")
    } catch (err) {
      console.error(err)
      console.log("Erro ao gerar relatório.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER DE CONTEÚDO */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Sistema de Análise IA</h1>
            <p className="text-sm text-muted-foreground">Análises, simulações e relatórios inteligentes</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-0">
        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {tabs.map((t) => (
            <TabCard
              key={t.id}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id as any)}
              icon={t.icon}
              title={t.title}
              subtitle={t.subtitle}
            />
          ))}
        </div>

        {/* Vessel selector */}
        {activeTab !== "report" && (
          <Card className="p-4 mb-6 bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Selecione uma Embarcação</h3>
              <div className="text-sm text-muted-foreground">{isValidating ? "Atualizando..." : ""}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vessels?.length ? (
                vessels.map((v: any) => (
                  <VesselButton
                    key={v.id}
                    vessel={v}
                    selected={selectedVessel === v.id}
                    onClick={() => setSelectedVessel(selectedVessel === v.id ? null : v.id)}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </Card>
        )}

        {/* Content Area with animated transitions */}
        <div>
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === "image" && (
              <motion.div
                key="image"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}
                className="space-y-4"
              >
                {!selectedVessel ? (
                  <Card className="p-6 rounded-xl bg-card/70">
                    <p className="text-sm text-muted-foreground">Selecione uma embarcação para iniciar a análise de imagens.</p>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-semibold">Análise de Imagens — {vessels?.find((x: any) => x.id === selectedVessel)?.name}</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedVessel(null)}>← Trocar</Button>
                        <Button onClick={() => setActiveTab("report")} className="hidden sm:inline-flex">Gerar resumo</Button>
                      </div>
                    </div>

                    <Card className="p-4 rounded-xl border">
                      <ImageAnalyzer vesselId={selectedVessel} vesselName={vessels?.find((x: any) => x.id === selectedVessel)?.name || ""} />
                    </Card>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "scenario" && (
              <motion.div
                key="scenario"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}
              >
                {!selectedVessel ? (
                  <Card className="p-6 rounded-xl bg-card/70">
                    <p className="text-sm text-muted-foreground">Escolha uma embarcação para simular cenários operacionais e custos.</p>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-semibold">Simulador — {vessels?.find((x: any) => x.id === selectedVessel)?.name}</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedVessel(null)}>← Trocar</Button>
                      </div>
                    </div>

                    <Card className="p-4 rounded-xl border">
                      <ScenarioSimulator
                        vesselId={selectedVessel}
                        vesselData={{ projectedCost: 50000, projectedFuel: 120000 }}
                      />
                    </Card>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "report" && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}
              >
                <Card className="p-6 rounded-xl border bg-card/60 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Gerador de Relatórios</h2>
                      <p className="text-sm text-muted-foreground">Relatórios automáticos com insights e download em PDF</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="ghost" onClick={() => handleGenerateReport("monthly")} disabled={isGenerating}>
                        {isGenerating ? "Gerando..." : "Gerar Mensal"}
                      </Button>
                      <Button onClick={() => handleGenerateReport("quarterly")} disabled={isGenerating}>
                        {isGenerating ? "Gerando..." : "Gerar Trimestral"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/40">
                      <h4 className="font-semibold mb-2">Resumo</h4>
                      <p className="text-sm text-muted-foreground">Relatório com KPI's da frota e recomendações de limpeza preditiva.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/40">
                      <h4 className="font-semibold mb-2">Opções</h4>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded border" /> Incluir gráficos históricos
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded border" defaultChecked /> Incluir recomendações IA
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded border" /> Incluir comparativo econômico
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

/* ---------------------- small helper components ---------------------- */

function TabCard({ active, icon, title, subtitle, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer select-none rounded-xl p-4 flex items-center gap-4 transition
        ${active ? "ring-2 ring-primary bg-secondary/50 shadow-md" : "bg-card hover:bg-accent/50"}
      `}
    >
      <div className={active ? "p-2 rounded-lg bg-primary text-primary-foreground shadow" : "p-2 rounded-lg bg-secondary text-primary"}>
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  )
}

function VesselButton({ vessel, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-xl border transition
        ${selected ? "bg-primary/10 border-primary/50 shadow-sm" : "bg-card/40 hover:bg-secondary/50"}
      `}
    >
      <div className={`p-2 rounded-md ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
        <Ship className="h-5 w-5" />
      </div>
      <div className="text-sm font-medium">{vessel.name}</div>
      <div className="text-xs text-muted-foreground">{vessel.type}</div>
    </button>
  )
}

function EmptyState() {
  return (
    <div className="col-span-2 md:col-span-4 p-6 rounded-xl bg-card/40 border-dashed border border-border/40 text-center">
      <p className="font-semibold mb-2">Nenhuma embarcação encontrada</p>
      <p className="text-sm text-muted-foreground">Verifique a conexão com a API ou cadastre embarcações para testar as ferramentas.</p>
    </div>
  )
}