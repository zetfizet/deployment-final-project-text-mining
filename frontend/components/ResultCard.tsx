"use client";
import { useState } from "react";
import { AnalyzeResponse, EMOTION_CONFIG, SENTIMENT_CONFIG, EmotionLabel, SentimentLabel } from "@/lib/types";
import { getEmotionIcon, getSentimentIcon } from "./Icons";
import ProbabilityBar from "./ProbabilityBar";

interface Props {
  result: AnalyzeResponse;
}

export default function ResultCard({ result }: Props) {
  const [showPreprocessed, setShowPreprocessed] = useState(false);

  const emoConfig = EMOTION_CONFIG[result.emotion as EmotionLabel];
  const seConfig  = SENTIMENT_CONFIG[result.sentiment as SentimentLabel];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Emotion + Sentiment Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Emotion Card */}
        <div
          className="glass card-hover"
          style={{
            padding: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow removed */}

          <div style={{ position: "relative" }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Emosi Terdeteksi</p>

            {/* Emoji + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}>
                {getEmotionIcon(result.emotion, 32)}
              </div>
              <div>
                <p style={{
                  fontSize: 24,
                  fontWeight: 800,
                  fontFamily: "var(--font-syne)",
                  letterSpacing: "-0.02em",
                  color: emoConfig?.color ?? "#fff",
                  lineHeight: 1,
                }}>
                  {emoConfig?.label ?? result.emotion}
                </p>
                <p style={{ fontSize: 12, color: "#737373", marginTop: 3 }}>
                  {result.emotion}
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#737373", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Keyakinan
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "rgba(255,255,255,0.1)",
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {(result.emotion_confidence * 100).toFixed(2)}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${result.emotion_confidence * 100}%`,
                    background: "#ffffff",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Card */}
        <div
          className="glass card-hover"
          style={{
            padding: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow removed */}

          <div style={{ position: "relative" }}>
            <p className="section-label" style={{ marginBottom: 14 }}>Sentimen</p>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}>
                {getSentimentIcon(result.sentiment, 32)}
              </div>
              <div>
                <p style={{
                  fontSize: 24,
                  fontWeight: 800,
                  fontFamily: "var(--font-syne)",
                  letterSpacing: "-0.02em",
                  color: seConfig?.color ?? "#fff",
                  lineHeight: 1,
                }}>
                  {result.sentiment === "Positive" ? "Positif" : "Negatif"}
                </p>
                <p style={{ fontSize: 12, color: "#737373", marginTop: 3 }}>
                  {result.sentiment}
                </p>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#737373", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Keyakinan
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "rgba(255,255,255,0.1)",
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {(result.sentiment_confidence * 100).toFixed(2)}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${result.sentiment_confidence * 100}%`,
                    background: "#ffffff",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Probability Distribution ── */}
      <div className="glass" style={{ padding: "24px" }}>
        <ProbabilityBar emotionProbs={result.emotion_probs} />
      </div>

      {/* ── Preprocessed Text Accordion ── */}
      <div className="glass" style={{ overflow: "hidden" }}>
        <button
          id="preprocessed-toggle"
          onClick={() => setShowPreprocessed(!showPreprocessed)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: showPreprocessed ? "#fff" : "#737373",
            transition: "color 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Teks setelah preprocessing</span>
          </div>
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transition: "transform 0.25s ease",
              transform: showPreprocessed ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPreprocessed && (
          <div style={{
            padding: "0 24px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }} className="animate-fadeIn">
            <div className="code-block" style={{ marginTop: 16 }}>
              {result.preprocessed_text}
            </div>
            <p style={{ marginTop: 10, fontSize: 12, color: "#737373", display: "flex", gap: 12 }}>
              <span>
                <span style={{ color: "#fff" }}>●</span> {result.word_count} kata
              </span>
              <span>
                <span style={{ color: "#fff" }}>●</span> Huruf kecil
              </span>
              <span>
                <span style={{ color: "#fff" }}>●</span> Non-alfabetik dihapus
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
