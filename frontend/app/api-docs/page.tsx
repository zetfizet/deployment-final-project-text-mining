"use client";
import { useState } from "react";
import { analyzeText, analyzeBatch, getModelInfo, getPerformance } from "@/lib/api";

interface Endpoint {
  id: string;
  method: "POST" | "GET";
  path: string;
  description: string;
  requestBody?: { param: string; type: string; required: boolean; description: string }[];
  exampleRequest?: object;
  exampleResponse: object;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: "analyze",
    method: "POST",
    path: "/api/analyze",
    description: "Analisis satu teks ulasan produk Indonesia. Mengembalikan prediksi emosi, sentimen, dan probabilitas semua kelas.",
    requestBody: [
      { param: "text", type: "string", required: true, description: "Teks ulasan yang akan dianalisis. Minimal 5 kata." },
    ],
    exampleRequest: { text: "Barang datang dengan cepat, packing aman, sangat puas dengan pembelian ini!" },
    exampleResponse: {
      original_text: "Barang datang dengan cepat, packing aman, sangat puas dengan pembelian ini!",
      preprocessed_text: "barang datang dengan cepat packing aman sangat puas dengan pembelian ini",
      word_count: 12,
      emotion: "Happy",
      emotion_confidence: 0.9423,
      emotion_probs: { Happy: 0.9423, Anger: 0.0201, Sadness: 0.0156, Love: 0.0142, Fear: 0.0078 },
      sentiment: "Positive",
      sentiment_confidence: 0.9871,
    },
  },
  {
    id: "analyze-batch",
    method: "POST",
    path: "/api/analyze/batch",
    description: "Analisis banyak teks ulasan sekaligus (maks 100). Mengembalikan prediksi dan ringkasan statistik.",
    requestBody: [
      { param: "texts", type: "string[]", required: true, description: "Array teks ulasan. Minimal 1, maksimal 100." },
    ],
    exampleRequest: { texts: ["Barang bagus, pengiriman cepat!", "Kecewa, barang tidak sesuai deskripsi."] },
    exampleResponse: {
      results: [
        { original_text: "Barang bagus, pengiriman cepat!", emotion: "Happy", emotion_confidence: 0.8923, sentiment: "Positive", sentiment_confidence: 0.9541 },
        { original_text: "Kecewa, barang tidak sesuai deskripsi.", emotion: "Anger", emotion_confidence: 0.7812, sentiment: "Negative", sentiment_confidence: 0.9102 },
      ],
      summary: {
        total: 2,
        avg_emotion_confidence: 0.8368,
        avg_sentiment_confidence: 0.9322,
        emotion_distribution: [{ emotion: "Happy", count: 1, percentage: 50.0 }, { emotion: "Anger", count: 1, percentage: 50.0 }],
        sentiment_distribution: [{ sentiment: "Positive", count: 1, percentage: 50.0 }, { sentiment: "Negative", count: 1, percentage: 50.0 }],
      },
    },
  },
  {
    id: "model-info",
    method: "GET",
    path: "/api/model-info",
    description: "Informasi model yang sedang aktif — nama model, jumlah kelas, akurasi, dan status loading.",
    exampleResponse: {
      model_name: "indobenchmark/indobert-base-p1",
      num_labels_emotion: 5,
      num_labels_sentiment: 2,
      emotion_labels: { "0": "Happy", "1": "Anger", "2": "Sadness", "3": "Love", "4": "Fear" },
      sentiment_labels: { "0": "Positive", "1": "Negative" },
      emotion_accuracy: 0.7689,
      emotion_f1: 0.7654,
      sentiment_accuracy: 0.8801,
      sentiment_f1: 0.8789,
      model_source: "S3a HP Tuning (cfg3)",
      created_at: "2025-01-01T00:00:00Z",
      device: "cpu",
      status: "loaded",
    },
  },
  {
    id: "performance",
    method: "GET",
    path: "/api/performance",
    description: "Data perbandingan performa semua skenario (S1 → S3) dari file CSV hasil training notebook.",
    exampleResponse: {
      scenarios: [
        { scenario: "S1", description: "Baseline IndoBERT", emotion_accuracy: 0.7241, emotion_f1: 0.7198, sentiment_accuracy: 0.8500, sentiment_f1: 0.8490 },
        { scenario: "S2", description: "Augmentasi Data", emotion_accuracy: 0.7456, emotion_f1: 0.7421, sentiment_accuracy: 0.8623, sentiment_f1: 0.8611 },
        { scenario: "S3a", description: "HP Tuning", emotion_accuracy: 0.7689, emotion_f1: 0.7654, sentiment_accuracy: 0.8801, sentiment_f1: 0.8789 },
      ],
    },
  },
];

const SIDEBAR_GROUPS = [
  {
    title: "PREDICTION API",
    endpoints: ["analyze", "analyze-batch"]
  },
  {
    title: "SYSTEM & STATS",
    endpoints: ["model-info", "performance"]
  }
];

function TerminalHeader({ filename }: { filename: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 18px",
      background: "#08080c",
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{ display: "flex", gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308", opacity: 0.8 }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#52525b", fontWeight: 500 }}>
        {filename}
      </span>
    </div>
  );
}

function CodeBlock({ code, language, filename }: { code: string; language: string; filename?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayFilename = filename || (
    language === "python" ? "example.py" : 
    language === "js" ? "example.js" : 
    language === "json" ? "response.json" : "terminal"
  );

  return (
    <div style={{ 
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
    }}>
      <TerminalHeader filename={displayFilename} />
      <button
        onClick={copy}
        style={{
          position: "absolute",
          top: 48,
          right: 14,
          padding: "5px 10px",
          borderRadius: 6,
          background: copied ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.05)",
          border: copied ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255,255,255,0.1)",
          fontSize: 10.5,
          color: copied ? "#34d399" : "#a3a3a3",
          cursor: "pointer",
          fontWeight: 600,
          transition: "all 0.2s ease",
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          gap: 4
        }}
      >
        {copied ? (
          <>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Disalin
          </>
        ) : (
          <>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Salin
          </>
        )}
      </button>
      <pre style={{
        background: "#030305",
        padding: "18px",
        overflowX: "auto",
        fontSize: 12,
        color: "#e4e4e7",
        lineHeight: 1.7,
        fontFamily: "'JetBrains Mono', monospace",
        margin: 0,
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)",
        maxWidth: "100%",
        whiteSpace: "pre",
      }}>
        <code style={{ fontFamily: "inherit" }}>{code}</code>
      </pre>
    </div>
  );
}

function buildSnippets(ep: Endpoint, baseUrl: string) {
  const python = ep.method === "POST"
    ? `import requests\n\nurl = "${baseUrl}${ep.path}"\npayload = ${JSON.stringify(ep.exampleRequest, null, 2)}\n\nresponse = requests.post(url, json=payload)\ndata = response.json()\nprint(data)`
    : `import requests\n\nurl = "${baseUrl}${ep.path}"\nresponse = requests.get(url)\ndata = response.json()\nprint(data)`;

  const js = ep.method === "POST"
    ? `const response = await fetch("${baseUrl}${ep.path}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${JSON.stringify(ep.exampleRequest, null, 2)}),\n});\nconst data = await response.json();\nconsole.log(data);`
    : `const response = await fetch("${baseUrl}${ep.path}");\nconst data = await response.json();\nconsole.log(data);`;

  const curl = ep.method === "POST"
    ? `curl -X POST "${baseUrl}${ep.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.exampleRequest)}'`
    : `curl "${baseUrl}${ep.path}"`;

  return { python, js, curl };
}

export default function ApiDocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState("analyze");
  const [playgroundText, setPlaygroundText] = useState("");
  const [playgroundResult, setPlaygroundResult] = useState<object | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [codeTabs, setCodeTabs] = useState<Record<string, "python" | "js" | "curl">>({});
  const [activeMobileTab, setActiveMobileTab] = useState<"docs" | "code">("docs");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const current = ENDPOINTS.find((e) => e.id === activeEndpoint)!;
  const snippets = buildSnippets(current, baseUrl);
  const codeTab = codeTabs[activeEndpoint] ?? "python";

  async function runPlayground() {
    setPlaygroundError(null);
    setPlaygroundResult(null);
    setPlaygroundLoading(true);
    try {
      let result: object;
      if (activeEndpoint === "analyze") {
        result = await analyzeText(playgroundText);
      } else if (activeEndpoint === "analyze-batch") {
        const texts = playgroundText.split(/\r?\n|\\n/).map((t) => t.trim()).filter(Boolean);
        result = await analyzeBatch(texts);
      } else if (activeEndpoint === "model-info") {
        result = await getModelInfo();
      } else {
        result = await getPerformance();
      }
      setPlaygroundResult(result);
    } catch (e: unknown) {
      setPlaygroundError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    } finally {
      setPlaygroundLoading(false);
    }
  }

  return (
    <div className="aurora-bg" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "56px 24px 80px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 48 }} className="animate-fadeUp">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="badge badge-cyan" style={{ fontSize: 10, padding: "4px 10px", background: "rgba(6, 182, 212, 0.08)", borderColor: "rgba(6, 182, 212, 0.2)" }}>
              <span className="dot-pulse" style={{ background: "#22d3ee" }} />
              Developer API Live
            </span>
          </div>
          <h1 className="display-heading" style={{ 
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)", 
            fontWeight: 800, 
            color: "#fff", 
            marginBottom: 16,
            letterSpacing: "-0.03em",
            fontFamily: "var(--font-syne)"
          }}>
            Developer <span className="gradient-text">API Docs</span>
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: 15, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", lineHeight: 1.6 }}>
            <span>Integrasikan model klasifikasi emosi &amp; sentimen IndoBERT langsung ke aplikasi Anda.</span>
            <span style={{ color: "rgba(255,255,255,0.15)" }} className="hidden sm:inline">|</span>
            <span>
              Base URL:{" "}
              <code style={{ 
                background: "rgba(255,255,255,0.05)", 
                border: "1px solid rgba(255,255,255,0.1)", 
                padding: "4px 8px", 
                borderRadius: 6, 
                color: "#a5b4fc", 
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                wordBreak: "break-all",
                display: "inline-block",
                maxWidth: "100%"
              }}>
                {baseUrl}
              </code>
            </span>
          </p>
        </div>

        {/* Mobile Endpoint Selector (Sticky Dropdown) */}
        <div className="block lg:hidden sticky top-[64px] z-20 mb-4 animate-fadeUp" style={{ marginBottom: "16px" }}>
          <div className="glass flex items-center justify-between" style={{ borderRadius: 12, border: "1px solid rgba(129, 140, 248, 0.2)", padding: "12px 16px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#737373" }}>
              Pilih Endpoint
            </span>
            <div style={{ position: "relative" }}>
              <select
                value={activeEndpoint}
                onChange={(e) => { setActiveEndpoint(e.target.value); setPlaygroundResult(null); setPlaygroundText(""); }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 28px 6px 12px",
                  color: "#fff",
                  fontSize: 13.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                }}
              >
                {ENDPOINTS.map((ep) => (
                  <option key={ep.id} value={ep.id} style={{ background: "#0c0c0e", color: "#fff" }}>
                    {ep.method} {ep.path.split("/").pop()}
                  </option>
                ))}
              </select>
              <span style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                fontSize: 10,
                color: "#a3a3a3"
              }}>
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Column Toggle Tab Selector */}
        <div className="flex lg:hidden gap-1 p-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl w-full mb-6" style={{ marginBottom: "24px" }}>
          <button
            onClick={() => setActiveMobileTab("docs")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeMobileTab === "docs" ? "rgba(255,255,255,0.08)" : "transparent",
              color: activeMobileTab === "docs" ? "#fff" : "#a1a1aa",
            }}
          >
            📝 Detail &amp; Coba
          </button>
          <button
            onClick={() => setActiveMobileTab("code")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeMobileTab === "code" ? "rgba(255,255,255,0.08)" : "transparent",
              color: activeMobileTab === "code" ? "#fff" : "#a1a1aa",
            }}
          >
            💻 Kode &amp; Contoh
          </button>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full" style={{ gap: "32px" }}>
          
          {/* Sidebar Panel */}
          <div className="hidden lg:block glass z-10 w-full lg:w-[260px] lg:shrink-0" style={{ padding: "20px", borderRadius: 16 }}>
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.title} style={{ marginBottom: 20 }}>
                <p style={{ 
                  fontSize: 10.5, 
                  fontWeight: 700, 
                  textTransform: "uppercase", 
                  letterSpacing: "0.08em", 
                  color: "#52525b", 
                  padding: "0 10px", 
                  marginBottom: 10 
                }}>
                  {group.title}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {group.endpoints.map((id) => {
                    const ep = ENDPOINTS.find((e) => e.id === id)!;
                    const isActive = activeEndpoint === ep.id;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => { setActiveEndpoint(ep.id); setPlaygroundResult(null); setPlaygroundText(""); }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 8,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                          border: "none",
                          transition: "all 0.2s ease",
                          background: isActive ? "rgba(129, 140, 248, 0.08)" : "transparent",
                          color: isActive ? "#a5b4fc" : "#a1a1aa",
                          fontWeight: isActive ? 600 : 400,
                          position: "relative"
                        }}
                        onMouseOver={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            e.currentTarget.style.color = "#fff";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#a1a1aa";
                          }
                        }}
                      >
                        {isActive && (
                          <span style={{
                            position: "absolute",
                            left: 0,
                            top: "20%",
                            bottom: "20%",
                            width: 2.5,
                            background: "linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)",
                            borderRadius: 2
                          }} />
                        )}
                        <span style={{
                          fontSize: 8.5,
                          fontWeight: 800,
                          padding: "2px 5px",
                          borderRadius: 4,
                          background: ep.method === "POST" ? "rgba(168, 85, 247, 0.12)" : "rgba(6, 182, 212, 0.12)",
                          color: ep.method === "POST" ? "#c084fc" : "#22d3ee",
                          border: ep.method === "POST" ? "1px solid rgba(168, 85, 247, 0.2)" : "1px solid rgba(6, 182, 212, 0.2)",
                          minWidth: "42px",
                          textAlign: "center"
                        }}>
                          {ep.method}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                          {ep.path.split("/").pop()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" style={{ gap: "32px" }}>
            
            {/* Column 1: Details & Playground (Left 7/12 parts) */}
            <div className={`flex flex-col gap-6 w-full min-w-0 lg:col-span-7 ${activeMobileTab === "docs" ? "flex" : "hidden lg:flex"}`} style={{ gap: "28px" }}>
              
              {/* Endpoint Header Card */}
              <div className="glass" style={{ padding: "24px", borderRadius: 16, marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    background: current.method === "POST" ? "rgba(168, 85, 247, 0.15)" : "rgba(6, 182, 212, 0.15)",
                    color: current.method === "POST" ? "#c084fc" : "#22d3ee",
                    border: current.method === "POST" ? "1px solid rgba(168, 85, 247, 0.25)" : "1px solid rgba(6, 182, 212, 0.25)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    {current.method}
                  </span>
                  <code style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600, wordBreak: "break-all" }}>
                    {current.path}
                  </code>
                </div>
                <p style={{ color: "#d4d4d8", fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>{current.description}</p>
              </div>

              {/* Request Parameters Table Card */}
              {current.requestBody && (
                <div className="glass" style={{ padding: "24px", borderRadius: 16, marginBottom: 0 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 20px 0" }}>
                    Request Body Parameters
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: "400px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1.5px solid rgba(255,255,255,0.08)" }}>
                          <th style={{ padding: "0 16px 12px 0", textAlign: "left", color: "#52525b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: "25%" }}>Parameter</th>
                          <th style={{ padding: "0 16px 12px 16px", textAlign: "left", color: "#52525b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: "15%" }}>Tipe</th>
                          <th style={{ padding: "0 16px 12px 16px", textAlign: "left", color: "#52525b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: "20%" }}>Status</th>
                          <th style={{ padding: "0 16px 12px 16px", textAlign: "left", color: "#52525b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", width: "40%" }}>Deskripsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {current.requestBody.map((p) => (
                          <tr key={p.param} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ padding: "14px 16px 14px 0", fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 600 }}>{p.param}</td>
                            <td style={{ padding: "14px 16px", color: "#a5b4fc", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{p.type}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                padding: "3px 8px",
                                borderRadius: 6,
                                background: p.required ? "rgba(244, 63, 94, 0.1)" : "rgba(255,255,255,0.05)",
                                color: p.required ? "#fda4af" : "#71717a",
                                border: p.required ? "1px solid rgba(244, 63, 94, 0.15)" : "1px solid rgba(255,255,255,0.08)",
                              }}>
                                {p.required ? "WAJIB" : "OPSIONAL"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", color: "#a1a1aa", lineHeight: 1.6 }}>{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Playground Card */}
              <div className="glass" style={{ padding: "24px", borderRadius: 16, marginBottom: 0 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 20px 0" }}>
                  🧪 Interactive REST Playground
                </h3>
                
                {current.method === "POST" && (
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 10, fontWeight: 500 }}>
                      {current.id === "analyze-batch" ? "Input Ulasan (Masukkan satu teks per baris):" : "Teks Ulasan Produk:"}
                    </label>
                    <textarea
                      value={playgroundText}
                      onChange={(e) => setPlaygroundText(e.target.value)}
                      placeholder={current.id === "analyze-batch"
                        ? "Barang bagus banget, pengirimannya super cepat!\nSaya sangat kecewa, kemasan rusak dan seller lambat respon."
                        : "Barang datang cepat dan sesuai dengan deskripsi!"}
                      rows={4}
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: "14px 16px",
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "var(--font-inter)",
                        resize: "vertical",
                        outline: "none",
                        transition: "all 0.25s ease",
                        lineHeight: 1.6
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(129, 140, 248, 0.4)";
                        e.target.style.boxShadow = "0 0 15px rgba(129, 140, 248, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.08)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                )}
                
                <button
                  onClick={runPlayground}
                  disabled={playgroundLoading || (current.method === "POST" && !playgroundText.trim())}
                  style={{
                    padding: "11px 24px",
                    borderRadius: 10,
                    background: "#fff",
                    color: "#000",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: playgroundLoading || (current.method === "POST" && !playgroundText.trim()) ? "not-allowed" : "pointer",
                    border: "none",
                    opacity: playgroundLoading || (current.method === "POST" && !playgroundText.trim()) ? 0.4 : 1,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                  onMouseOver={(e) => {
                    if (!playgroundLoading && !(current.method === "POST" && !playgroundText.trim())) {
                      e.currentTarget.style.background = "#e5e5e5";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!playgroundLoading && !(current.method === "POST" && !playgroundText.trim())) {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.transform = "none";
                    }
                  }}
                >
                  {playgroundLoading ? (
                    <>
                      <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" opacity="0.3" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim Request…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Jalankan Request
                    </>
                  )}
                </button>

                {playgroundError && (
                  <div style={{ marginTop: 24 }} className="animate-scaleIn">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Error Response</p>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "#f43f5e",
                        fontWeight: 600,
                        background: "rgba(244, 63, 94, 0.1)",
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(244, 63, 94, 0.2)"
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px #f43f5e" }} />
                        500 Error
                      </span>
                    </div>
                    <div className="error-alert" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)", borderRadius: 10, padding: "14px 16px", color: "#fda4af", fontSize: 13.5 }}>
                      {playgroundError}
                    </div>
                  </div>
                )}

                {playgroundResult && (
                  <div style={{ marginTop: 28 }} className="animate-scaleIn">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>Hasil Response</p>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "#34d399",
                        fontWeight: 600,
                        background: "rgba(52, 211, 153, 0.1)",
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(52, 211, 153, 0.2)"
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
                        200 OK
                      </span>
                    </div>
                    <CodeBlock code={JSON.stringify(playgroundResult, null, 2)} language="json" filename="response.json" />
                  </div>
                )}
              </div>

            </div>

            {/* Column 2: Code Snippets & Response Examples (Right 5/12 parts) */}
            <div className={`flex flex-col gap-6 w-full min-w-0 lg:col-span-5 lg:sticky lg:top-[100px] ${activeMobileTab === "code" ? "flex" : "hidden lg:flex"}`} style={{ gap: "28px" }}>
              
              {/* Code Snippets Card */}
              <div className="glass" style={{ padding: "24px", borderRadius: 16, marginBottom: 0 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 20px 0" }}>
                  Integrasi Kode
                </h3>
                
                {/* Code Tabs Picker */}
                <div style={{ 
                  display: "flex", 
                  gap: 6, 
                  background: "rgba(255,255,255,0.03)", 
                  borderRadius: 10, 
                  padding: 4, 
                  maxWidth: "100%", 
                  overflowX: "auto", 
                  marginBottom: 18, 
                  border: "1px solid rgba(255,255,255,0.07)" 
                }} className="scrollbar-none">
                  {(["python", "js", "curl"] as const).map((t) => {
                    const isActive = codeTab === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setCodeTabs((prev) => ({ ...prev, [activeEndpoint]: t }))}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "none",
                          transition: "all 0.2s ease",
                          background: isActive ? "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" : "transparent",
                          color: isActive ? "#fff" : "#71717a",
                          boxShadow: isActive ? "0 4px 12px rgba(124, 58, 237, 0.2)" : "none",
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = "#fff";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.color = "#71717a";
                          }
                        }}
                      >
                        {t === "python" ? "🐍 Python" : t === "js" ? "🌐 JavaScript" : "💻 cURL"}
                      </button>
                    );
                  })}
                </div>
                
                <CodeBlock
                  code={codeTab === "python" ? snippets.python : codeTab === "js" ? snippets.js : snippets.curl}
                  language={codeTab}
                  filename={codeTab === "python" ? "example.py" : codeTab === "js" ? "example.js" : "request.sh"}
                />
              </div>

              {/* Response Example Card */}
              <div className="glass" style={{ padding: "24px", borderRadius: 16, marginBottom: 0 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 20px 0" }}>
                  Contoh Response (JSON)
                </h3>
                <CodeBlock
                  code={JSON.stringify(current.exampleResponse, null, 2)}
                  language="json"
                  filename="example_response.json"
                />
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
