import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EmotionSentimen — Analisis Emosi & Sentimen Ulasan E-Commerce Indonesia",
  description:
    "Analisis emosi (Happy, Anger, Sadness, Love, Fear) dan sentimen (Positif/Negatif) dari teks ulasan produk e-commerce Indonesia menggunakan model IndoBERT yang dilatih pada dataset PRDECT-ID.",
  keywords: ["analisis emosi", "sentimen", "IndoBERT", "NLP", "Indonesia", "e-commerce", "PRDECT-ID"],
  authors: [{ name: "IndoBERT Research Team" }],
  openGraph: {
    title: "EmotionSentimen — Analisis Emosi & Sentimen",
    description: "Analisis teks ulasan produk Indonesia dengan AI — Powered by IndoBERT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${syne.variable}`}>
      <body style={{ background: "var(--bg-base)", color: "#fff", minHeight: "100vh" }}>
        <Navbar />
        <main>{children}</main>

        {/* ── Footer ── */}
        <footer style={{
          position: "relative",
          marginTop: 0,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}>
              {/* Logo mark */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
                color: "#000000",
                boxShadow: "0 0 16px rgba(255,255,255,0.1)",
                fontFamily: "var(--font-syne)",
              }}>
                ES
              </div>

              {/* Paper info */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#a3a3a3", marginBottom: 4 }}>
                  Leveraging IndoBERT and DistilBERT for Indonesian Emotion Classification in E-Commerce Reviews
                </p>
                <p style={{ fontSize: 12, color: "#737373" }}>
                  Procedia Computer Science 269 (2025) 321–330 · ICCSCI 2025
                </p>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {[
                  { label: "IndoBERT" },
                  { label: "PRDECT-ID" },
                  { label: "FastAPI" },
                  { label: "Next.js" },
                ].map((b) => (
                  <span
                    key={b.label}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#a3a3a3",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: 11, color: "#525252" }}>
                © 2025 EmotionSentimen · Text Mining Final Project
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
