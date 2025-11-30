"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  context?: any
}

export function AIChatbot({ context }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o assistente IA do EcoSalina. Posso ajudar com previsões, economia de combustível, relatórios e qualquer dúvida sobre a frota!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context,
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  /* BOTÃO FLUTUANTE */
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="
          fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50
          bg-gradient-to-br from-primary to-primary/80 text-primary-foreground
          hover:scale-105 transition-transform cursor-pointer
        "
      >
        <Bot className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div
      className="
        fixed bottom-6 right-6 w-96 h-[600px] rounded-2xl shadow-2xl z-50
        border border-border/40
        bg-card/70 backdrop-blur-xl
        flex flex-col
      "
    >
      {/* HEADER PREMIUM */}
      <div
        className="
          flex items-center justify-between p-4 rounded-t-2xl
          bg-gradient-to-r from-primary to-primary/90
          text-primary-foreground
          border-b border-primary/40
        "
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary-foreground/20 backdrop-blur-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Assistente IA EcoSalina</h3>
            <p className="text-xs opacity-80">Online agora</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/10">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* ÁREA DAS MENSAGENS */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`
                  max-w-[78%] p-3 rounded-xl shadow-sm backdrop-blur-sm
                  ${message.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-none"
                    : "bg-secondary border border-border/40 text-foreground rounded-bl-none"
                  }
                `}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-[11px] opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* ANIMAÇÃO DE CARREGAMENTO */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-border/40 rounded-xl p-3 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* INPUT */}
      <div className="p-4 border-t bg-card/60 backdrop-blur-md border-border/40 rounded-b-2xl">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta..."
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="border-border/60 bg-card focus-visible:ring-primary"
          />

          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="
              bg-gradient-to-br from-primary to-primary/80 text-primary-foreground
              hover:scale-105 transition-transform cursor-pointer
            "
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}