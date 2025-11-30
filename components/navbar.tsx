"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import useSWR from "swr"
import {
    Ship,
    Bell,
    Brain,
    Activity,
    Lightbulb,
    Menu,
    X,
    FileText,
    Route,
    ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Configuração de Navegação
const navItems = [
    { href: "/", label: "Dashboard", icon: Ship, exact: true },
    { href: "/digital-twin/vessel-001", label: "Digital Twin", icon: Activity },
    { href: "/ai-tools", label: "Análise IA", icon: Brain },
    { href: "/recommendations", label: "Recomendações", icon: Lightbulb },
    { href: "/alerts", label: "Alertas", icon: Bell },
]

// Configuração de Navegação Mobile para AI Tools
const aiToolsItems = [
    { id: "image", title: "Análise de Imagens", icon: ImageIcon, href: "/ai-tools?tab=image" },
    { id: "scenario", title: "Simulador de Cenários", icon: Route, href: "/ai-tools?tab=scenario" },
    { id: "report", title: "Relatórios IA", icon: FileText, href: "/ai-tools?tab=report" },
]

export function Navbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: alertsData } = useSWR("/api/alerts", fetcher, { refreshInterval: 10000 })
    const criticalAlerts = alertsData?.filter((a: any) => a.type === "critical").length || 0
    const totalAlerts = alertsData?.length || 0
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    // Função auxiliar para verificar se o link está ativo
    const isActive = (href: string) => {
        if (href === "/") return pathname === href
        return pathname.startsWith(href)
    }

    // Mapeamento de cores de fundo para o título da página
    const getHeaderTitle = () => {
        const currentItem = navItems.find(item => {
            if (item.exact) return pathname === item.href
            return pathname.startsWith(item.href)
        })

        if (currentItem) return currentItem.label

        if (pathname.includes("/vessel/")) return "Detalhes da Embarcação"
        if (pathname.includes("/digital-twin/")) return "Digital Twin"

        return "EcoSalina"
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 h-16">

                {/* LOGO AND BRAND */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    {/* Imagem da Logo - Usando PNG de tema escuro, como solicitado */}
                    <img
                        src="/icon.svg"
                        alt="EcoSalina"
                        className="h-10 w-10 object-contain"
                    />
                    <span className="text-xl font-bold text-foreground hidden sm:inline">EcoSalina</span>
                    <span className="text-xl font-bold text-foreground inline sm:hidden">{getHeaderTitle()}</span>
                </Link>

                {/* DESKTOP NAVIGATION */}
                <nav className="hidden lg:flex items-center gap-1.5 flex-1 justify-center">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} passHref>
                            <Button
                                variant={isActive(item.href) ? "default" : "ghost"}
                                size="sm"
                                className={isActive(item.href) ? "" : "text-muted-foreground hover:bg-secondary/80"}
                            >
                                <item.icon className="h-4 w-4 mr-2" />
                                {item.label}
                                {item.href === "/alerts" && totalAlerts > 0 && (
                                    <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${criticalAlerts > 0 ? "bg-danger text-danger-foreground" : "bg-primary/20 text-primary"}`}>
                                        {totalAlerts}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    ))}
                </nav>

                {/* RIGHT ALIGNED ACTIONS - DESKTOP */}
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    <Button variant="default" size="sm" onClick={() => router.push("/recommendations")}>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Recomendações
                    </Button>

                    {totalAlerts > 0 && (
                        <Button
                            // CORREÇÃO: "danger" não é uma variante válida, usando "destructive" em seu lugar.
                            variant={criticalAlerts > 0 ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => router.push("/alerts")}
                            className={criticalAlerts > 0 ? "bg-danger text-danger-foreground" : "border-warning text-warning hover:bg-warning/10"}
                        >
                            <Bell className="h-4 w-4 mr-2" />
                            {criticalAlerts > 0 ? `${criticalAlerts} Críticos` : `${totalAlerts} Alertas`}
                        </Button>
                    )}
                </div>

                {/* MOBILE NAVIGATION TRIGGER */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon-sm">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-64 sm:w-80 p-0">
                        {/* MOBILE HEADER */}
                        <div className="flex items-center p-4 border-b bg-secondary">
                            <Ship className="h-6 w-6 text-primary mr-2" />
                            <h3 className="font-semibold text-primary">Navegação</h3>
                        </div>

                        <ScrollArea className="h-[calc(100vh-64px)]">
                            <div className="p-4 space-y-4">

                                {/* PRINCIPAL NAVIGATION */}
                                <nav className="flex flex-col gap-1">
                                    {navItems.map((item) => (
                                        <Link key={item.href} href={item.href} passHref onClick={() => setIsMenuOpen(false)}>
                                            <Button
                                                variant={isActive(item.href) ? "default" : "ghost"}
                                                className={`w-full justify-start ${isActive(item.href) ? "" : "text-foreground hover:bg-secondary/80"}`}
                                                size="lg"
                                            >
                                                <item.icon className="h-5 w-5 mr-3" />
                                                {item.label}
                                                {item.href === "/alerts" && totalAlerts > 0 && (
                                                    <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${criticalAlerts > 0 ? "bg-danger text-danger-foreground" : "bg-primary/20 text-primary"}`}>
                                                        {totalAlerts}
                                                    </span>
                                                )}
                                            </Button>
                                        </Link>
                                    ))}
                                </nav>

                                {/* AI TOOLS SUB-MENU */}
                                <div className="pt-4 border-t border-border/40 space-y-2">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Ferramentas de IA</h4>
                                    {aiToolsItems.map((item) => (
                                        <Link key={item.id} href={item.href} passHref onClick={() => setIsMenuOpen(false)}>
                                            <Button
                                                variant="ghost"
                                                className={`w-full justify-start text-foreground hover:bg-secondary/80`}
                                                size="sm"
                                            >
                                                <item.icon className="h-4 w-4 mr-2" />
                                                {item.title}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>

                                {/* FOOTER ACTION */}
                                <div className="pt-4 border-t border-border/40">
                                    <Button variant="outline" className="w-full justify-center" onClick={() => setIsMenuOpen(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Fechar Menu
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}