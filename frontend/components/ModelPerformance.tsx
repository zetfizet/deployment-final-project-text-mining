"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { ScenarioPerformance } from "@/lib/types";

interface Props {
  scenarios: ScenarioPerformance[];
  type: "emotion" | "sentiment";
}

export default function ModelPerformance({ scenarios, type }: Props) {
  const data = scenarios.map((s) => ({
    name: s.scenario,
    description: s.description,
    Accuracy:
      type === "emotion"
        ? s.emotion_accuracy != null ? Math.round(s.emotion_accuracy * 10000) / 100 : null
        : s.sentiment_accuracy != null ? Math.round(s.sentiment_accuracy * 10000) / 100 : null,
    "F1-Score":
      type === "emotion"
        ? s.emotion_f1 != null ? Math.round(s.emotion_f1 * 10000) / 100 : null
        : s.sentiment_f1 != null ? Math.round(s.sentiment_f1 * 10000) / 100 : null,
  }));

  const title = type === "emotion" ? "Emosi (5 Kelas)" : "Sentimen (2 Kelas)";

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-300 mb-4">
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[60, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [`${Number(v)?.toFixed(2)}%`]}
            contentStyle={{
              background: "#1f2937",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f9fafb",
              fontSize: 13,
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#9ca3af" }}
          />
          <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32}>
            <LabelList
              dataKey="Accuracy"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => (v ? `${Number(v).toFixed(1)}%` : "")}
              style={{ fill: "#a5b4fc", fontSize: 10 }}
            />
          </Bar>
          <Bar dataKey="F1-Score" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32}>
            <LabelList
              dataKey="F1-Score"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => (v ? `${Number(v).toFixed(1)}%` : "")}
              style={{ fill: "#6ee7b7", fontSize: 10 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
