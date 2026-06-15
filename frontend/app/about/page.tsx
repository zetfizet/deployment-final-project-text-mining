"use client";
import { useState, useEffect } from "react";
import { getModelInfo, getPerformance } from "@/lib/api";
import { ModelInfoResponse, PerformanceResponse, EMOTION_CONFIG, EmotionLabel } from "@/lib/types";
import { getEmotionIcon, getSentimentIcon } from "@/components/Icons";
import ModelPerformance from "@/components/ModelPerformance";

const emotions: { key: EmotionLabel; desc: string }[] = [
  { key: "Happy",   desc: "Ekspresi kepuasan, kesenangan, dan rasa gembira terhadap produk." },
  { key: "Anger",   desc: "Ekspresi kekecewaan, kemarahan, dan rasa frustrasi." },
  { key: "Sadness", desc: "Ekspresi kesedihan, kekecewaan mendalam, dan penyesalan." },
  { key: "Love",    desc: "Ekspresi kecintaan, keterikatan, dan apresiasi tinggi." },
  { key: "Fear",    desc: "Ekspresi kekhawatiran, ketidakpastian, dan rasa was-was." },
];

const researchCards = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Dataset PRDECT-ID",
    desc: "5.400 ulasan produk e-commerce Indonesia yang divalidasi oleh ahli psikologi klinis.",
    color: "#ffffff",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Base Model IndoBERT",
    desc: "indobenchmark/indobert-base-p1 — model Bahasa Indonesia pre-trained dengan BERT architecture.",
    color: "#ffffff",
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: "Landasan Teori",
    desc: "Shaver's Emotion Theory (1987) — klasifikasi emosi dasar manusia sebagai fondasi label.",
    color: "#ffffff",
  },
];

export default function AboutPage() {
  const [modelInfo, setModelInfo]   = useState<ModelInfoResponse | null>(null);
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  useEffect(() => {
    Promise.all([getModelInfo(), getPerformance()])
      .then(([info, perf]) => {
        setModelInfo(info);
        setPerformance(perf);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const bestScenario = performance?.scenarios.reduce((best, s) => {
    const acc    = s.emotion_accuracy ?? 0;
    const bestAcc = best?.emotion_accuracy ?? 0;
    return acc > bestAcc ? s : best;
  }, performance.scenarios[0]);

  return (
    <div className="aurora-bg" style={{ minHeight: "100vh" }}>
      {/* Decorative Orbs Removed for cleaner look */}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 80px" }}>

        {/* ── Section 1: Research Summary ── */}
        <div style={{ marginBottom: 64 }}>
          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <span className="badge" style={{ marginBottom: 16, display: "inline-flex", color: "#a3a3a3", background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Research Paper · ICCSCI 2025
              </span>
            </span>
            <h1
              className="display-heading animate-fadeUp"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginBottom: 8 }}
            >
              Tentang <span className="gradient-text">Model</span>
            </h1>
            <p style={{ fontSize: 15, color: "#737373", lineHeight: 1.7 }}>
              Leveraging IndoBERT and DistilBERT for Indonesian Emotion Classification in E-Commerce Reviews
            </p>
            <p style={{ fontSize: 13, color: "#525252", marginTop: 4 }}>
              Procedia Computer Science 269 (2025) 321–330
            </p>
          </div>

          {/* Research info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {researchCards.map((c, i) => (
              <div
                key={c.title}
                className="glass card-hover animate-fadeUp"
                style={{
                  padding: "24px",
                  animationDelay: `${i * 0.08}s`,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.color,
                  marginBottom: 14,
                }}>
                  {c.icon}
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  {c.title}
                </p>
                <p style={{ fontSize: 13, color: "#a3a3a3", lineHeight: 1.65 }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Emotion Labels ── */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div className="divider" style={{ flex: 0, width: 32 }} />
            <h2 style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: 22,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}>
              Label yang Didukung
            </h2>
          </div>

          {/* Emotion grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
            marginBottom: 12,
          }}>
            {emotions.map(({ key, desc }, i) => {
              const cfg = EMOTION_CONFIG[key];
              return (
                <div
                  key={key}
                  className="glass card-hover animate-fadeUp"
                  style={{
                    padding: "20px",
                    borderColor: "rgba(255,255,255,0.08)",
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}>
                      {getEmotionIcon(key)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{key}</p>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                        background: "rgba(255,255,255,0.1)",
                        padding: "2px 10px",
                        borderRadius: 99,
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6 }}>{desc}</p>
                </div>
              );
            })}
          </div>

          {/* Sentiment labels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Positive", labelId: "Positif", color: "#10b981", desc: "Ulasan dengan sentimen positif — kepuasan dan pengalaman menyenangkan." },
              { label: "Negative", labelId: "Negatif", color: "#f43f5e", desc: "Ulasan dengan sentimen negatif — ketidakpuasan dan pengalaman buruk." },
            ].map((s) => (
              <div
                key={s.label}
                className="glass card-hover"
                style={{ padding: "20px", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {getSentimentIcon(s.label, 22, s.color)}
                  </span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.labelId}</p>
                    <p style={{ fontSize: 11, color: "#737373" }}>{s.label}</p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#a3a3a3", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Model Performance ── */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: 22,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}>
            Performa Model
          </h2>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="skeleton" style={{ height: 56 }} />
              <div className="skeleton" style={{ height: 260 }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="skeleton" style={{ height: 200 }} />
                <div className="skeleton" style={{ height: 200 }} />
              </div>
            </div>
          )}

          {error && (
            <div className="glass" style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <svg width="32" height="32" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <p style={{ fontSize: 14, color: "#a3a3a3", fontWeight: 600 }}>Backend tidak terhubung</p>
              <p style={{ fontSize: 13, color: "#737373", marginTop: 4 }}>
                Jalankan server FastAPI untuk melihat data performa model.
              </p>
            </div>
          )}

          {performance && !loading && (
            <>
              {/* Performance table */}
              <div className="glass" style={{ overflow: "hidden", marginBottom: 16 }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="premium-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>Tahap</th>
                        <th>Deskripsi</th>
                        <th style={{ textAlign: "right" }}>Acc. Emosi</th>
                        <th style={{ textAlign: "right" }}>F1 Emosi</th>
                        <th style={{ textAlign: "right" }}>Acc. Sentimen</th>
                        <th style={{ textAlign: "right" }}>F1 Sentimen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.scenarios.map((s, i) => {
                        const isBest = s.scenario === bestScenario?.scenario;
                        return (
                          <tr
                            key={i}
                            style={{
                              background: isBest ? "rgba(129, 140, 248, 0.08)" : undefined,
                            }}
                          >
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontWeight: 700, color: "#818cf8" }}>{s.scenario}</span>
                                {isBest && (
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: "rgba(255,255,255,0.1)",
                                    color: "#fff",
                                    letterSpacing: "0.06em",
                                  }}>
                                    BEST
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{s.description}</td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#e2e8f0" }}>
                              {s.emotion_accuracy != null ? `${(s.emotion_accuracy * 100).toFixed(2)}%` : "—"}
                            </td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#e2e8f0" }}>
                              {s.emotion_f1 != null ? `${(s.emotion_f1 * 100).toFixed(2)}%` : "—"}
                            </td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#e2e8f0" }}>
                              {s.sentiment_accuracy != null ? `${(s.sentiment_accuracy * 100).toFixed(2)}%` : "—"}
                            </td>
                            <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#e2e8f0" }}>
                              {s.sentiment_f1 != null ? `${(s.sentiment_f1 * 100).toFixed(2)}%` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="glass" style={{ padding: "20px" }}>
                  <ModelPerformance scenarios={performance.scenarios} type="emotion" />
                </div>
                <div className="glass" style={{ padding: "20px" }}>
                  <ModelPerformance scenarios={performance.scenarios} type="sentiment" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Section 4: Model Info ── */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: 22,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}>
            Informasi Model Aktif
          </h2>

          {loading ? (
            <div className="skeleton" style={{ height: 140 }} />
          ) : error ? (
            <div className="glass" style={{ padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#737373", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="16" height="16" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                Backend tidak terhubung.
              </p>
            </div>
          ) : modelInfo ? (
            <div className="glass" style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {[
                  { label: "Base Model",       value: modelInfo.model_name },
                  { label: "Device",           value: modelInfo.device.toUpperCase() },
                  { label: "Status",           value: modelInfo.status === "loaded" ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16, 185, 129, 0.4)" }} />Loaded</span> : "Offline" },
                  { label: "Akurasi Emosi",    value: modelInfo.emotion_accuracy != null ? `${(modelInfo.emotion_accuracy * 100).toFixed(2)}%` : "—" },
                  { label: "F1 Emosi",         value: modelInfo.emotion_f1 != null ? `${(modelInfo.emotion_f1 * 100).toFixed(2)}%` : "—" },
                  { label: "Akurasi Sentimen", value: modelInfo.sentiment_accuracy != null ? `${(modelInfo.sentiment_accuracy * 100).toFixed(2)}%` : "—" },
                  { label: "Sumber Model",     value: modelInfo.model_source ?? "—" },
                  { label: "Dibuat Pada",      value: modelInfo.created_at ? new Date(modelInfo.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                      padding: "16px 18px",
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#737373", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", wordBreak: "break-all" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Section 5: Methodology ── */}
        <div>
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: 22,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}>
            Metodologi
          </h2>

          <div className="glass" style={{ padding: "28px" }}>
            {/* Preprocessing pipeline */}
            <div style={{ marginBottom: 28 }}>
              <p className="section-label" style={{ marginBottom: 14 }}>
                Pipeline Preprocessing
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Lowercase", "Hapus angka & simbol", "Normalisasi spasi", "Tokenisasi IndoBERT", "max_length=128"].map((s) => (
                  <span key={s} className="pill-tag">{s}</span>
                ))}
              </div>
            </div>

            <div className="divider" style={{ marginBottom: 28 }} />

            {/* Research scenarios */}
            <div>
              <p className="section-label" style={{ marginBottom: 14 }}>
                Alur Skenario Penelitian
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                {[
                  { label: "S1", title: "Baseline",    desc: "IndoBERT fine-tune dasar" },
                  { label: "S2", title: "Augmentasi",  desc: "Easy Data Augmentation" },
                  { label: "S3a", title: "HP Tuning",  desc: "Grid search hyperparameter" },
                  { label: "S3b", title: "Ensemble",   desc: "Kombinasi model terbaik" },
                ].map((s, i, arr) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      padding: "16px",
                      background: "rgba(129, 140, 248, 0.08)",
                      border: "1px solid rgba(129, 140, 248, 0.2)",
                      borderRadius: 12,
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: "#818cf8", letterSpacing: "0.06em", marginBottom: 2 }}>{s.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.title}</p>
                      <p style={{ fontSize: 11, color: "#a3a3a3", lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <svg width="20" height="20" fill="none" stroke="#525252" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
