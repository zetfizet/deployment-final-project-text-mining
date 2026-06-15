"use client";
import { useState, useRef, useCallback } from "react";
import { analyzeBatch } from "@/lib/api";
import { AnalyzeResponse, BatchSummary, EMOTION_CONFIG, SENTIMENT_CONFIG, EmotionLabel, SentimentLabel, CHART_COLORS } from "@/lib/types";
import PremiumBatchTable from "@/components/PremiumBatchTable";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MAX_TEXTS = 100;

export default function BatchPage() {
  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [manualText, setManualText] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalyzeResponse[] | null>(null);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getTexts = (): string[] => {
    if (tab === "manual") {
      return manualText.split("\n").map((t) => t.trim()).filter(Boolean);
    }
    return csvPreview;
  };

  const handleCSV = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Hanya file .csv yang didukung.");
      return;
    }
    setCsvFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const header = lines[0].split(",");
      const reviewCol = header.findIndex((h) =>
        h.toLowerCase().includes("review") || h.toLowerCase().includes("ulasan") || h.toLowerCase().includes("text")
      );
      if (reviewCol === -1) {
        setError("Kolom 'Customer Review', 'ulasan', atau 'text' tidak ditemukan di CSV.");
        return;
      }
      const texts = lines.slice(1).map((l) => {
        const cols = l.split(",");
        return (cols[reviewCol] ?? "").replace(/^"|"$/g, "").trim();
      }).filter(Boolean);
      setCsvPreview(texts.slice(0, MAX_TEXTS));
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCSV(file);
  }, []);

  async function handleAnalyze() {
    const texts = getTexts();
    if (texts.length === 0) {
      setError("Tidak ada teks untuk dianalisis.");
      return;
    }
    if (texts.length > MAX_TEXTS) {
      setError(`Maksimal ${MAX_TEXTS} ulasan per batch.`);
      return;
    }
    setError(null);
    setResults(null);
    setSummary(null);
    setLoading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 300);

    try {
      const data = await analyzeBatch(texts);
      clearInterval(interval);
      setProgress(100);
      setResults(data.results);
      setSummary(data.summary);
    } catch (e: unknown) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (!results) return;
    const headers = [
      "ulasan_asli", "emosi", "confidence_emosi", "sentimen", "confidence_sentimen",
      ...Object.keys(results[0].emotion_probs).map((k) => `prob_${k.toLowerCase()}`),
    ];
    const rows = results.map((r) => [
      `"${r.original_text.replace(/"/g, '""')}"`,
      r.emotion,
      r.emotion_confidence,
      r.sentiment,
      r.sentiment_confidence,
      ...Object.values(r.emotion_probs),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil_analisis_batch.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const texts = getTexts();

  return (
    <div className="aurora-bg" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span className="badge" style={{ marginBottom: 32, display: "inline-flex", color: "#a3a3a3", background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            ⊞ Analisis Massal
          </span>
          <h1 className="display-heading animate-fadeUp" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#fff", marginBottom: 8 }}>
            Analisis <span style={{ color: "#fff" }}>Batch</span>
          </h1>
          <p style={{ color: "#737373", fontSize: 15 }}>Analisis hingga {MAX_TEXTS} ulasan sekaligus dalam satu klik.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4, width: "fit-content", marginBottom: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["manual", "csv"] as const).map((t) => {
            const Icon = t === "manual" 
              ? () => <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              : () => <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
            return (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: tab === t ? "#ffffff" : "transparent",
                color: tab === t ? "#000000" : "#737373",
                boxShadow: tab === t ? "0 4px 12px rgba(255,255,255,0.1)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon />
                {t === "manual" ? "Input Manual" : "Upload CSV"}
              </div>
            </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left: Input */}
          <div className="lg:col-span-1">
            <div className="glass" style={{ padding: "24px" }}>
              {tab === "manual" ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Teks Ulasan</label>
                    <span style={{ fontSize: 11, color: "#737373" }}>satu per baris</span>
                  </div>
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={"Barang bagus, pengiriman cepat!\nKecewa sekali, barang rusak.\nNormal aja, sesuai harga."}
                    rows={12}
                    className="premium-textarea focus-ring"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  />
                  <p style={{ marginTop: 8, fontSize: 12, color: texts.length > MAX_TEXTS ? "#f43f5e" : "#737373" }}>
                    {texts.length} ulasan terdeteksi{texts.length > MAX_TEXTS && ` · Maksimal ${MAX_TEXTS}!`}
                  </p>
                </>
              ) : (
                <>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", display: "block", marginBottom: 10 }}>Upload CSV</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragging ? "#818cf8" : "rgba(255,255,255,0.12)"}`,
                      borderRadius: 16,
                      padding: "32px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: dragging ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#a3a3a3"
                      }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>
                      {csvFile ? csvFile.name : "Drag & drop atau klik untuk pilih"}
                    </p>
                    <p style={{ fontSize: 11, color: "#737373", marginTop: 4 }}>Format: .csv · Kolom: Customer Review</p>
                    <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
                      onChange={(e) => { if (e.target.files?.[0]) handleCSV(e.target.files[0]); }} />
                  </div>
                  {csvPreview.length > 0 && (
                    <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#a3a3a3", marginBottom: 8 }}>Preview ({csvPreview.length} ulasan):</p>
                      {csvPreview.slice(0, 3).map((t, i) => (
                        <p key={i} style={{ fontSize: 12, color: "#737373", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                          <span style={{ color: "#fff", marginRight: 6, fontWeight: 600 }}>{i + 1}.</span>{t}
                        </p>
                      ))}
                      {csvPreview.length > 3 && <p style={{ fontSize: 11, color: "#525252" }}>…dan {csvPreview.length - 3} lainnya</p>}
                    </div>
                  )}
                  {csvFile && (
                    <button onClick={() => { setCsvFile(null); setCsvPreview([]); }}
                      style={{ marginTop: 8, fontSize: 12, color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}>
                      × Hapus file
                    </button>
                  )}
                </>
              )}

              {error && (
                <div className="error-alert animate-scaleIn" style={{ marginTop: 12 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                id="batch-analyze-btn"
                onClick={handleAnalyze}
                disabled={loading || texts.length === 0}
                className="btn-primary focus-ring"
                style={{ width: "100%", marginTop: 16 }}
              >
                {loading ? (
                  <><svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menganalisis…</>
                ) : `Analisis ${texts.length} Ulasan`}
              </button>

              {loading && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5b5b7b", marginBottom: 6 }}>
                    <span>Memproses…</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #4f46e5, #06b6d4)" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-2">
            {results && summary && (
              <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Total Dianalisis",        value: String(summary.total) },
                    { label: "Conf. Emosi Rata-rata",   value: `${(summary.avg_emotion_confidence * 100).toFixed(1)}%` },
                    { label: "Conf. Sentimen Rata-rata", value: `${(summary.avg_sentiment_confidence * 100).toFixed(1)}%` },
                    { label: "Emosi Dominan",           value: summary.emotion_distribution[0]?.emotion ?? "-" },
                  ].map((s) => (
                    <div key={s.label} className="glass card-hover" style={{ padding: "16px", textAlign: "center" }}>
                      <p className="stat-number" style={{ fontSize: "1.5rem" }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: "#5b5b7b", marginTop: 4, fontWeight: 500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Pie charts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="glass" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>Distribusi Emosi</h3>
                    <div style={{ flex: 1, minHeight: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.emotion_distribution.map((e) => ({
                              name: e.emotion,
                              value: e.count,
                            }))}
                            cx="50%" cy="45%" innerRadius={45} outerRadius={75}
                            dataKey="value"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={2}
                          >
                            {summary.emotion_distribution.map((e, i) => (
                              <Cell key={i} fill={CHART_COLORS[e.emotion as EmotionLabel] ?? "#6366f1"} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f9fafb", fontSize: 12 }} />
                          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "#a3a3a3" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="glass" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12 }}>Distribusi Sentimen</h3>
                    <div style={{ flex: 1, minHeight: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={summary.sentiment_distribution.map((s) => ({
                              name: s.sentiment,
                              value: s.count,
                            }))}
                            cx="50%" cy="45%" innerRadius={45} outerRadius={75}
                            dataKey="value"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={2}
                          >
                            {summary.sentiment_distribution.map((s, i) => (
                              <Cell key={i} fill={SENTIMENT_CONFIG[s.sentiment as SentimentLabel]?.color ?? "#6366f1"} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f9fafb", fontSize: 12 }} />
                          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "#a3a3a3" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>


              </div>
            )}

            {!results && !loading && (
              <div className="glass" style={{ padding: "64px 32px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#a3a3a3"
                  }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#a3a3a3", lineHeight: 1.6 }}>
                  Masukkan teks ulasan dan klik tombol analisis<br />untuk melihat hasil.
                </p>
              </div>
            )}

            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="skeleton" style={{ height: 100 }} />
                <div className="skeleton" style={{ height: 220 }} />
                <div className="skeleton" style={{ height: 300 }} />
              </div>
            )}
          </div>
        </div>

        {/* FULL WIDTH TABLE SECTION */}
        {results && summary && (
          <div className="animate-fadeUp delay-200" style={{ marginTop: 24 }}>
            <div className="glass" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Tabel Hasil</h3>
                <button
                  id="download-csv-btn"
                  onClick={downloadCSV}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 10,
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: "#c4b5fd", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  ↓ Download CSV
                </button>
              </div>
              <PremiumBatchTable results={results} />
            </div>
          </div>
        )}
      </div>
      <style>{`@media (max-width: 768px) { .batch-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
