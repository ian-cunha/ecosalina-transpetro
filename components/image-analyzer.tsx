"use client"

import { useState } from "react"
import { Camera, Upload, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ImageAnalyzerProps {
  vesselId: string
  vesselName: string
}

export function ImageAnalyzer({ vesselId, vesselName }: ImageAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true)
    setSelectedImage(URL.createObjectURL(file))

    await new Promise((resolve) => setTimeout(resolve, 1600))

    try {
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: "/underwater-hull-with-barnacles.jpg",
          vesselId,
          location: "port",
        }),
      })

      const data = await response.json()
      setAnalysis(data.aiAnalysis)
    } catch (error) {
      console.error("Error analyzing image:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="p-6 backdrop-blur-md bg-background/60 border border-border/40 shadow-xl rounded-2xl">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary">Análise de Imagem Subaquática</h3>
            <p className="text-sm text-muted-foreground">
              Envie uma imagem do casco — {vesselName}
            </p>
          </div>
          <Camera className="h-9 w-9 text-primary" />
        </div>

        {/* UPLOAD */}
        <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center 
                        transition hover:border-primary/60 hover:bg-primary/5">
          {!selectedImage ? (
            <div className="space-y-4">
              <Upload className="h-14 w-14 text-primary mx-auto opacity-80" />

              <div>
                <p className="text-sm font-medium mb-1">Arraste ou clique para enviar</p>
                <p className="text-xs text-muted-foreground">Aceita PNG e JPG até 10MB</p>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) handleImageUpload(file)
                  }
                  input.click()
                }}
              >
                Selecionar Imagem
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              {/* Preview */}
              <img
                src={selectedImage}
                alt="Hull"
                className="max-h-72 mx-auto rounded-xl border shadow-md"
              />

              {/* Loader */}
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2 text-primary mt-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm font-medium">Analisando com IA...</span>
                </div>
              ) : analysis ? (
                <div className="space-y-6">

                  {/* STATUS */}
                  <div className="flex items-center justify-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Análise concluída — {analysis.processingTime}ms
                    </span>
                  </div>

                  {/* MÉTRICAS */}
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/40">
                      <p className="text-xs text-muted-foreground mb-1">Nível de Incrustação</p>
                      <p className="text-3xl font-bold text-danger">{analysis.foulingLevel}/5</p>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/40">
                      <p className="text-xs text-muted-foreground mb-1">Confiança da IA</p>
                      <p className="text-3xl font-bold text-primary">
                        {(analysis.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* ORGANISMOS */}
                  <div className="text-left space-y-3">
                    <p className="text-sm font-semibold">Cobertura de Organismos</p>
                    <div className="space-y-2">
                      {Object.entries(analysis.organismTypes as Record<string, number>).map(([type, percentage]) => (
                        <div key={type} className="text-sm flex items-center justify-between">
                          {/* label */}
                          <span className="capitalize">
                            {type === "barnacles"
                              ? "Cracas"
                              : type === "algae"
                                ? "Algas"
                                : type === "mussels"
                                  ? "Mexilhões"
                                  : "Outros"}
                          </span>

                          {/* barra */}
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-300/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${Number(percentage)}%` }}
                              />
                            </div>
                            <span className="font-medium w-10 text-right">{Number(percentage)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => {
                      setSelectedImage(null)
                      setAnalysis(null)
                    }}
                  >
                    Analisar Nova Imagem
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}