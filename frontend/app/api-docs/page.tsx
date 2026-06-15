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

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={copy}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "4px 10px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.1)",
          border: "none",
          fontSize: 12,
          color: "#a3a3a3",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
      >
        {copied ? "✓ Disalin" : "Salin"}
      </button>
      <pre style={{
        background: "#050505",
        borderRadius: 12,
        padding: "16px",
        overflowX: "auto",
        fontSize: 12,
        color: "#d4d4d8",
        lineHeight: 1.6,
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "'JetBrains Mono', monospace",
        margin: 0,
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
        const texts = playgroundText.split("\\n").map((t) => t.trim()).filter(Boolean);
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 80px" }}>
        
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ 
            fontSize: "clamp(2rem, 4vw, 2.6rem)", 
            fontWeight: 700, 
            color: "#fff", 
            marginBottom: 12,
            fontFamily: "var(--font-syne)",
            letterSpacing: "-0.02em"
          }}>
            API Documentation
          </h1>
          <p style={{ color: "#a3a3a3", fontSize: 15 }}>
            Base URL:{" "}
            <code style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid rgba(255,255,255,0.1)", 
              padding: "4px 8px", 
              borderRadius: 6, 
              color: "#d4d4d8", 
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              {baseUrl}
            </code>
          </p>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="glass w-full md:w-60 relative md:sticky top-auto md:top-[100px] z-10" style={{ padding: 16, borderRadius: 16, flexShrink: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#737373", padding: "0 8px", marginBottom: 12 }}>
              Endpoints
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ENDPOINTS.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => { setActiveEndpoint(ep.id); setPlaygroundResult(null); setPlaygroundText(""); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s",
                    background: activeEndpoint === ep.id ? "rgba(255,255,255,0.1)" : "transparent",
                    color: activeEndpoint === ep.id ? "#fff" : "#a3a3a3",
                    fontWeight: activeEndpoint === ep.id ? 600 : 400,
                  }}
                  onMouseOver={(e) => {
                    if (activeEndpoint !== ep.id) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeEndpoint !== ep.id) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#a3a3a3";
                    }
                  }}
                >
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: ep.method === "POST" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                    color: "#fff",
                  }}>
                    {ep.method}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                    {ep.path.split("/").pop()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Endpoint header */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                }}>
                  {current.method}
                </span>
                <code style={{ color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                  {current.path}
                </code>
              </div>
              <p style={{ color: "#d4d4d8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{current.description}</p>
            </div>

            {/* Request body */}
            {current.requestBody && (
              <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#d4d4d8", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 16px 0" }}>
                  Request Body
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ paddingBottom: 12, textAlign: "left", color: "#737373", fontWeight: 500 }}>Parameter</th>
                        <th style={{ paddingBottom: 12, textAlign: "left", color: "#737373", fontWeight: 500 }}>Tipe</th>
                        <th style={{ paddingBottom: 12, textAlign: "left", color: "#737373", fontWeight: 500 }}>Wajib</th>
                        <th style={{ paddingBottom: 12, textAlign: "left", color: "#737373", fontWeight: 500 }}>Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.requestBody.map((p) => (
                        <tr key={p.param} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <td style={{ padding: "12px 16px 12px 0", fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>{p.param}</td>
                          <td style={{ padding: "12px 16px 12px 0", color: "#a3a3a3" }}>{p.type}</td>
                          <td style={{ padding: "12px 16px 12px 0" }}>
                            <span style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 6,
                              background: p.required ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                              color: p.required ? "#fff" : "#a3a3a3",
                            }}>
                              {p.required ? "Wajib" : "Opsional"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 0", color: "#a3a3a3", lineHeight: 1.5 }}>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Response example */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#d4d4d8", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 16px 0" }}>
                Contoh Response
              </h3>
              <CodeBlock
                code={JSON.stringify(current.exampleResponse, null, 2)}
                language="json"
              />
            </div>

            {/* Code snippets */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#d4d4d8", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 16px 0" }}>
                Code Snippet
              </h3>
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                {(["python", "js", "curl"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCodeTabs((prev) => ({ ...prev, [activeEndpoint]: t }))}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.2s",
                      background: codeTab === t ? "#fff" : "transparent",
                      color: codeTab === t ? "#000" : "#a3a3a3",
                    }}
                  >
                    {t === "python" ? "🐍 Python" : t === "js" ? "🌐 JavaScript" : "💻 cURL"}
                  </button>
                ))}
              </div>
              <CodeBlock
                code={codeTab === "python" ? snippets.python : codeTab === "js" ? snippets.js : snippets.curl}
                language={codeTab}
              />
            </div>

            {/* Playground */}
            <div className="glass" style={{ padding: 24, borderRadius: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#d4d4d8", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 16px 0" }}>
                🧪 Playground — Coba Sekarang
              </h3>
              {current.method === "POST" && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#a3a3a3", marginBottom: 8 }}>
                    {current.id === "analyze-batch" ? "Teks (satu per baris):" : "Teks ulasan:"}
                  </label>
                  <textarea
                    value={playgroundText}
                    onChange={(e) => setPlaygroundText(e.target.value)}
                    placeholder={current.id === "analyze-batch"
                      ? "Barang bagus!\\nKecewa sekali."
                      : "Barang datang cepat dan sesuai deskripsi!"}
                    rows={4}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "#fff",
                      fontFamily: "var(--font-inter)",
                      resize: "vertical",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                </div>
              )}
              <button
                onClick={runPlayground}
                disabled={playgroundLoading || (current.method === "POST" && !playgroundText.trim())}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#000",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: playgroundLoading || (current.method === "POST" && !playgroundText.trim()) ? "not-allowed" : "pointer",
                  border: "none",
                  opacity: playgroundLoading || (current.method === "POST" && !playgroundText.trim()) ? 0.5 : 1,
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!playgroundLoading && !(current.method === "POST" && !playgroundText.trim())) {
                    e.currentTarget.style.background = "#e5e5e5";
                  }
                }}
                onMouseOut={(e) => {
                  if (!playgroundLoading && !(current.method === "POST" && !playgroundText.trim())) {
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                {playgroundLoading ? "Mengirim…" : "▶ Kirim Request"}
              </button>

              {playgroundError && (
                <div style={{ marginTop: 16, color: "#d4d4d8", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px" }}>
                  {playgroundError}
                </div>
              )}

              {playgroundResult && (
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 12, color: "#a3a3a3", marginBottom: 8, margin: 0 }}>Response:</p>
                  <CodeBlock code={JSON.stringify(playgroundResult, null, 2)} language="json" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
