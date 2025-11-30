"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FuelConsumptionChartProps {
  data: {
    timestamp: Date
    fuelConsumption: number
    dragIncrease: number
  }[]
}

export function FuelConsumptionChart({ data }: FuelConsumptionChartProps) {
  const chartData = data.map((d) => ({
    date: format(d.timestamp, "dd/MM", { locale: ptBR }),
    consumption: d.fuelConsumption,
    baseline: 800,
    increase: d.dragIncrease,
  }))

  return (
    <Card className="shadow-lg border border-border/40">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Consumo de Combustível</CardTitle>
        <CardDescription>Comparação entre consumo base e consumo atual (L/h)</CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />

            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Consumo (L/h)",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.6rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
              itemStyle={{ fontSize: 13 }}
            />

            <Legend wrapperStyle={{ paddingTop: 10, fontSize: 13 }} />

            {/* GRADIENTES ELEGANTES */}
            <defs>
              <linearGradient id="baselineColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9CA3AF" />
                <stop offset="100%" stopColor="#6B7280" />
              </linearGradient>

              <linearGradient id="currentConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* BARRAS */}
            <Bar
              dataKey="baseline"
              fill="url(#baselineColor)"
              name="Base (sem incrustação)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="consumption"
              fill="url(#currentConsumption)"
              name="Consumo Atual"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
