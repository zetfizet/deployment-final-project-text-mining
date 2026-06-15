"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { CHART_COLORS, EmotionLabel } from "@/lib/types";

interface Props {
  emotionProbs: Record<EmotionLabel, number>;
}

export default function ProbabilityBar({ emotionProbs }: Props) {
  const data = Object.entries(emotionProbs)
    .map(([emotion, prob]) => ({
      emotion,
      probability: Math.round(prob * 10000) / 100, // Convert to percentage with 2 decimal
      fill: CHART_COLORS[emotion as EmotionLabel] ?? "#6366f1",
    }))
    .sort((a, b) => b.probability - a.probability);

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Distribusi Probabilitas Emosi
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 60, left: 16, bottom: 4 }}
        >
          <CartesianGrid
            horizontal={false}
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="emotion"
            width={72}
            tick={({ x, y, payload }) => (
              <text x={x} y={y} dy={4} textAnchor="end" fill="#d1d5db" fontSize={13}>
                {payload.value}
              </text>
            )}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Probabilitas"]}
            contentStyle={{
              background: "#1f2937",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f9fafb",
              fontSize: 13,
            }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="probability" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill="#ffffff" />
            ))}
            <LabelList
              dataKey="probability"
              position="right"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${Number(v).toFixed(1)}%`}
              style={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

