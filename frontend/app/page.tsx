"use client";
import { useState } from "react";
import { analyzeText } from "@/lib/api";
import { AnalyzeResponse } from "@/lib/types";
import ResultCard from "@/components/ResultCard";

const EXAMPLES = [
  "Barang cepat sampai, packing aman, seller responsif, sangat puas dengan pembelian ini!",
  "Kecewa, barang tidak sesuai foto, warna beda, kualitas jelek sekali. Minta refund!",
  "Biasa saja sih, tidak terlalu bagus tapi juga tidak mengecewakan. Lumayan lah buat harga segini.",
];

const MAX_CHARS = 500;
const MIN_WORDS = 5;

const STATS = [
  { value: "5.400",  label: "Data Latih",       sub: "ulasan PRDECT-ID" },
  { value: "5",      label: "Kelas Emosi",       sub: "Happy · Anger · Sadness · Love · Fear" },
  { value: "2",      label: "Kelas Sentimen",    sub: "Positif & Negatif" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tulis Ulasan",
    desc: "Masukkan teks ulasan produk dalam Bahasa Indonesia",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Preprocessing",
    desc: "Tokenisasi dan normalisasi teks secara otomatis",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "IndoBERT Inference",
    desc: "Model BERT bahasa Indonesia menganalisis teks",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Hasil & Probabilitas",
    desc: "Tampil prediksi emosi & sentimen dengan skor keyakinan",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < MIN_WORDS) {
      setError(`Minimal ${MIN_WORDS} kata. Sekarang: ${wordCount} kata.`);
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await analyzeText(text);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Pastikan server backend berjalan.");
    } finally {
      setLoading(false);
    }
  }

  function useExample(ex: string) {
    setText(ex);
    setResult(null);
    setError(null);
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charRatio = text.length / MAX_CHARS;

  return (
    <div className="aurora-bg" style={{ minHeight: "100vh" }}>
      {/* Decorative Orbs Removed for cleaner look */}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "60px 20px 80px", position: "relative" }}>

        {/* ── Hero Section ── */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          {/* Live badge */}
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <span className="badge" style={{ cursor: "default", color: "#a3a3a3", background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              <span className="dot-pulse" style={{ flexShrink: 0, background: "#fff" }} />
              Powered by IndoBERT · PRDECT-ID Dataset
            </span>
          </div>

          {/* Headline */}
          <h1
            className="display-heading animate-fadeUp"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Analisis
            <br />
            <span className="gradient-text">Emosi &amp; Sentimen</span>
            <br />
            <span style={{ color: "#737373", fontSize: "0.65em", fontWeight: 500 }}>
              Ulasan E-Commerce Indonesia
            </span>
          </h1>

          <p
            className="animate-fadeUp delay-100"
            style={{
              color: "#a3a3a3",
              fontSize: 16,
              lineHeight: 1.75,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Deteksi emosi &amp; sentimen dari teks ulasan produk Indonesia secara{" "}
            <strong style={{ color: "#fff", fontWeight: 600 }}>real-time</strong> menggunakan model IndoBERT
            yang dilatih pada 5.400 ulasan tervalidasi.
          </p>
        </div>

        {/* ── Stats Row ── */}
        <div
          className="animate-fadeUp delay-200 grid grid-cols-1 sm:grid-cols-3"
          style={{ gap: 16, marginBottom: 40 }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="glass card-hover animate-fadeUp"
              style={{
                padding: "20px 16px",
                textAlign: "center",
                animationDelay: `${0.2 + i * 0.08}s`,
              }}
            >
              <p className="stat-number">{s.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginTop: 4 }}>
                {s.label}
              </p>
              <p style={{ fontSize: 11, color: "#737373", marginTop: 2, lineHeight: 1.4 }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Input Card ── */}
        <div
          className="glass animate-fadeUp delay-300"
          style={{ padding: "clamp(20px, 4vw, 28px)", marginBottom: 32 }}
        >
          {/* Label */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", letterSpacing: "0.01em" }}>
              Teks Ulasan
            </label>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: wordCount >= MIN_WORDS ? "#34d399" : "#737373",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {wordCount} kata{wordCount < MIN_WORDS ? ` / min ${MIN_WORDS}` : " ✓"}
            </span>
          </div>

          {/* Textarea */}
          <div style={{ position: "relative" }}>
            <textarea
              id="review-textarea"
              value={text}
              onChange={(e) => {
                setText(e.target.value.slice(0, MAX_CHARS));
                setError(null);
              }}
              placeholder="Contoh: Barang datang dengan cepat dan sesuai deskripsi. Penjual sangat ramah dan responsif. Highly recommended!"
              rows={5}
              className="premium-textarea focus-ring"
            />
            {/* Char counter */}
            <span
              style={{
                position: "absolute",
                bottom: 12,
                right: 14,
                fontSize: 11,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
                color: charRatio >= 1 ? "#f43f5e" : charRatio >= 0.85 ? "#f59e0b" : "#737373",
                letterSpacing: "0.02em",
              }}
            >
              {text.length}/{MAX_CHARS}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="error-alert animate-scaleIn" style={{ marginTop: 12 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Examples */}
          <div style={{ marginTop: 24 }}>
            <p className="section-label" style={{ marginBottom: 12 }}>Contoh ulasan</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  id={`example-btn-${i}`}
                  onClick={() => useExample(ex)}
                  className="example-btn"
                  title={ex}
                >
                  <span style={{ color: "#fff", fontWeight: 600, marginRight: 6 }}>{i + 1}.</span>
                  {ex.length > 90 ? ex.slice(0, 90) + "…" : ex}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="btn-primary focus-ring"
            style={{ width: "100%", marginTop: 28 }}
          >
            {loading ? (
              <>
                <svg className="spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" opacity="0.3" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menganalisis…
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analisis Sekarang
              </>
            )}
          </button>
        </div>

        {/* ── Skeleton Loader ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="skeleton" style={{ height: 160 }} />
              <div className="skeleton" style={{ height: 160 }} />
            </div>
            <div className="skeleton" style={{ height: 200 }} />
            <div className="skeleton" style={{ height: 80 }} />
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div className="animate-fadeUp">
            <ResultCard result={result} />
          </div>
        )}

        {/* ── How It Works ── */}
        {!result && !loading && (
          <div style={{ marginTop: 56 }}>
            {/* Divider with label */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div className="divider" style={{ flex: 1 }} />
              <p className="section-label" style={{ color: "#a3a3a3", letterSpacing: "0.1em" }}>CARA KERJA</p>
              <div className="divider" style={{ flex: 1 }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.step}
                  className="glass card-hover animate-fadeUp"
                  style={{
                    padding: "24px",
                    animationDelay: `${i * 0.07}s`,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Step number + icon */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      color: "#818cf8",
                      fontFamily: "var(--font-syne)",
                    }}>
                      {step.step}
                    </span>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}>
                      {step.icon}
                    </div>
                  </div>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                    {step.title}
                  </p>
                  <p style={{ fontSize: 14, color: "#a3a3a3", lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom model tags */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              marginTop: 28,
            }}>
              {[
                "IndoBERT Base P1",
                "HuggingFace Transformers",
                "FastAPI Backend",
                "PRDECT-ID Dataset",
                "Shaver Emotion Theory",
              ].map((tag) => (
                <span key={tag} className="pill-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
