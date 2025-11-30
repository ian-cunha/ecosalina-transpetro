"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip)

interface MiniSparklineProps {
  data: number[]
}

export function MiniSparkline({ data }: MiniSparklineProps) {
  return (
    <div className="w-full h-10">
      <Line
        data={{
          labels: data.map((_, i) => i.toString()),
          datasets: [
            {
              data,
              borderWidth: 2,
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        }}
      />
    </div>
  )
}
