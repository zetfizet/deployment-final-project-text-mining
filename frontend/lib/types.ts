// TypeScript types untuk semua API response

export interface AnalyzeResponse {
  original_text: string;
  preprocessed_text: string;
  word_count: number;
  emotion: EmotionLabel;
  emotion_confidence: number;
  emotion_probs: Record<EmotionLabel, number>;
  sentiment: SentimentLabel;
  sentiment_confidence: number;
}

export type EmotionLabel = "Happy" | "Anger" | "Sadness" | "Love" | "Fear";
export type SentimentLabel = "Positive" | "Negative";

export interface EmotionDistribution {
  emotion: string;
  count: number;
  percentage: number;
  avg_confidence: number;
}

export interface SentimentDistribution {
  sentiment: string;
  count: number;
  percentage: number;
  avg_confidence: number;
}

export interface BatchSummary {
  total: number;
  avg_emotion_confidence: number;
  avg_sentiment_confidence: number;
  emotion_distribution: EmotionDistribution[];
  sentiment_distribution: SentimentDistribution[];
}

export interface BatchAnalyzeResponse {
  results: AnalyzeResponse[];
  summary: BatchSummary;
}

export interface ModelInfoResponse {
  model_name: string;
  num_labels_emotion: number;
  num_labels_sentiment: number;
  emotion_labels: Record<string, string>;
  sentiment_labels: Record<string, string>;
  emotion_accuracy?: number | null;
  emotion_f1?: number | null;
  sentiment_accuracy?: number | null;
  sentiment_f1?: number | null;
  model_source?: string | null;
  created_at?: string | null;
  device: string;
  status: string;
}

export interface ScenarioPerformance {
  scenario: string;
  description: string;
  emotion_accuracy?: number | null;
  emotion_f1?: number | null;
  sentiment_accuracy?: number | null;
  sentiment_f1?: number | null;
}

export interface PerformanceResponse {
  scenarios: ScenarioPerformance[];
  raw_data?: Record<string, unknown>[] | null;
}

// ── Konstanta UI ──────────────────────────────────────────────────────────────

export const EMOTION_CONFIG: Record<
  EmotionLabel,
  { color: string; bg: string; label: string }
> = {
  Happy: {
    color: "#ffffff",
    bg: "rgba(255,255,255,0.05)",
    label: "Bahagia",
  },
  Anger: {
    color: "#ffffff",
    bg: "rgba(255,255,255,0.05)",
    label: "Marah",
  },
  Sadness: {
    color: "#ffffff",
    bg: "rgba(255,255,255,0.05)",
    label: "Sedih",
  },
  Love: {
    color: "#ffffff",
    bg: "rgba(255,255,255,0.05)",
    label: "Cinta",
  },
  Fear: {
    color: "#ffffff",
    bg: "rgba(255,255,255,0.05)",
    label: "Takut",
  },
};

export const SENTIMENT_CONFIG: Record<
  SentimentLabel,
  { color: string; bg: string; icon: string }
> = {
  Positive: { color: "#ffffff", bg: "rgba(255,255,255,0.05)", icon: "✦" },
  Negative: { color: "#a3a3a3", bg: "rgba(255,255,255,0.02)", icon: "✧" },
};

export const CHART_COLORS: Record<EmotionLabel, string> = {
  Happy: "#ffffff",
  Anger: "#a3a3a3",
  Sadness: "#a3a3a3",
  Love: "#ffffff",
  Fear: "#a3a3a3",
};
