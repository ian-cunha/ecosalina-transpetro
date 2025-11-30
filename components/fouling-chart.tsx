"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface FoulingChartProps {
  data: {
    timestamp: Date
    foulingLevel: number
  }[]
  predictions?: {
    date: Date
    level: number
  }[]
}

export function FoulingChart({ data, predictions }: FoulingChartProps) {
  const chartData = [
    ...data.map((d) => ({
      date: format(d.timestamp, "dd/MM", { locale: ptBR }),
      foulingLevel: d.foulingLevel,
      type: "real",
    })),
    ...(predictions?.map((p) => ({
      date: format(p.date, "dd/MM", { locale: ptBR }),
      predicted: p.level,
      type: "predicted",
    })) || []),
  ]

  return (
    <Card className="shadow-lg border border-border/40">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Evolução da Incrustação</CardTitle>
        <CardDescription className="text-muted-foreground">
          Histórico dos últimos 30 dias e previsão para os próximos 60 dias
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />

            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 5]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Nível de Incrustação",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.6rem",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              }}
              itemStyle={{ fontSize: 13 }}
            />

            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: 13,
              }}
            />

            {/* LINHAS DE REFERÊNCIA MAIS ELEGANTES */}
            <ReferenceLine
              y={3.5}
              stroke="#0099ff"
              strokeWidth={2}
              strokeDasharray="6 6"
              label={{
                value: "Ponto Ideal de Limpeza",
                fill: "#0099ff",
                fontSize: 12,
                position: "right",
              }}
            />

            <ReferenceLine
              y={4.5}
              stroke="#ff5733"
              strokeWidth={2}
              strokeDasharray="6 6"
              label={{
                value: "Limite Crítico",
                fill: "#ff5733",
                fontSize: 12,
                position: "right",
              }}
            />

            {/* LINHA REAL */}
            <Line
              type="monotone"
              dataKey="foulingLevel"
              name="Nível Real"
              stroke="#007bff"
              strokeWidth={3}
              dot={{ r: 4, fill: "#007bff" }}
              activeDot={{ r: 6 }}
            />

            {/* LINHA PREVISTA */}
            <Line
              type="monotone"
              dataKey="predicted"
              name="Previsão ML"
              stroke="#22c55e"
              strokeWidth={3}
              strokeDasharray="6 6"
              dot={{ r: 4, fill: "#22c55e" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
