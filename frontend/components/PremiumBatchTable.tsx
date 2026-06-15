"use client";
import { useState, useMemo } from "react";
import { AnalyzeResponse, EMOTION_CONFIG, SENTIMENT_CONFIG, EmotionLabel, SentimentLabel } from "@/lib/types";
import { getEmotionIcon, getSentimentIcon } from "./Icons";

interface Props {
  results: AnalyzeResponse[];
}

const PAGE_SIZE = 10;

export default function PremiumBatchTable({ results }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"emotion" | "sentiment" | "emotion_confidence" | "sentiment_confidence">("emotion_confidence");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter((r) => r.original_text.toLowerCase().includes(q));
  }, [results, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function SortIcon({ k }: { k: typeof sortKey }) {
    if (sortKey !== k) return <span style={{ color: '#6b7280', marginLeft: '6px', opacity: 0.7 }}>↕</span>;
    return <span style={{ color: '#818cf8', marginLeft: '6px' }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Premium Search Box Area */}
      <div style={{ 
        display: 'flex', alignItems: 'center', marginBottom: '32px', padding: '8px',
        backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px' 
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari ulasan secara spesifik..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '16px 16px 16px 48px', color: '#ffffff', fontSize: '14px',
              outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </div>

      {/* Premium Table Container */}
      <div style={{ overflowX: 'auto', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0a0a0f', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', width: '70px' }}>#</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '320px' }}>Ulasan</th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', width: '160px' }} onClick={() => toggleSort("emotion")}>
                Emosi <SortIcon k="emotion" />
              </th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', width: '160px' }} onClick={() => toggleSort("emotion_confidence")}>
                Conf. Emosi <SortIcon k="emotion_confidence" />
              </th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', width: '160px' }} onClick={() => toggleSort("sentiment")}>
                Sentimen <SortIcon k="sentiment" />
              </th>
              <th style={{ padding: '18px 24px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', width: '160px' }} onClick={() => toggleSort("sentiment_confidence")}>
                Conf. Sentimen <SortIcon k="sentiment_confidence" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, i) => {
              const emoConf = EMOTION_CONFIG[r.emotion as EmotionLabel];
              const seConf = SENTIMENT_CONFIG[r.sentiment as SentimentLabel];
              const globalIdx = (page - 1) * PAGE_SIZE + i + 1;
              return (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background-color 0.2s', cursor: 'default' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: '#6b7280', fontWeight: 500, verticalAlign: 'middle' }}>{globalIdx}</td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                    <div style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#d1d5db', fontSize: '14px', lineHeight: 1.6 }} title={r.original_text}>
                      {r.original_text}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px',
                      fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                      color: emoConf?.color, backgroundColor: `${emoConf?.color}15`, border: `1px solid ${emoConf?.color}40`
                    }}>
                      {getEmotionIcon(r.emotion, 14)} {r.emotion}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#e5e7eb', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {(r.emotion_confidence * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '999px',
                      fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                      color: seConf?.color, backgroundColor: `${seConf?.color}15`, border: `1px solid ${seConf?.color}40`
                    }}>
                      {getSentimentIcon(r.sentiment, 14)} {r.sentiment}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', verticalAlign: 'middle' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', borderRadius: '8px',
                      backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#e5e7eb', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      {(r.sentiment_confidence * 100).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '64px 24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  Tidak ada ulasan yang sesuai dengan pencarian Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#9ca3af', fontWeight: 500 }}>
            Menampilkan <span style={{ color: '#ffffff' }}>{sorted.length}</span> ulasan
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{
                padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#d1d5db', fontWeight: 500, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.3 : 1
              }}
            >
              Sebelumnya
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: isActive ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                      color: isActive ? '#ffffff' : '#9ca3af',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: isActive ? '0 4px 14px 0 rgba(79, 70, 229, 0.39)' : 'none'
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              style={{
                padding: '8px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#d1d5db', fontWeight: 500, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.3 : 1
              }}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
