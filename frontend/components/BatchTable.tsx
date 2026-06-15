"use client";
import { useState, useMemo } from "react";
import { AnalyzeResponse, EMOTION_CONFIG, SENTIMENT_CONFIG, EmotionLabel, SentimentLabel } from "@/lib/types";
import { getEmotionIcon, getSentimentIcon } from "./Icons";

interface Props {
  results: AnalyzeResponse[];
}

const PAGE_SIZE = 10;

export default function BatchTable({ results }: Props) {
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
    if (sortKey !== k) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-indigo-400 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="flex flex-col" style={{ gap: '24px', width: '100%' }}>
      {/* Search */}
      <div className="relative z-10" style={{ marginBottom: '24px' }}>
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Cari teks ulasan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ paddingBottom: '16px' }}>
        <table className="w-full text-sm" style={{ minWidth: '900px' }}>
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="px-5 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap" style={{ width: '70px' }}>#</th>
              <th className="px-5 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ minWidth: '300px' }}>Ulasan</th>
              <th className="px-5 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-white whitespace-nowrap transition-colors" style={{ width: '150px' }} onClick={() => toggleSort("emotion")}>
                Emosi <SortIcon k="emotion" />
              </th>
              <th className="px-5 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-white whitespace-nowrap transition-colors" style={{ width: '150px' }} onClick={() => toggleSort("emotion_confidence")}>
                Conf. Emosi <SortIcon k="emotion_confidence" />
              </th>
              <th className="px-5 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-white whitespace-nowrap transition-colors" style={{ width: '150px' }} onClick={() => toggleSort("sentiment")}>
                Sentimen <SortIcon k="sentiment" />
              </th>
              <th className="px-5 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-white whitespace-nowrap transition-colors" style={{ width: '160px' }} onClick={() => toggleSort("sentiment_confidence")}>
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
                  className="border-b border-white/5 hover:bg-white/5 transition-colors align-top"
                  style={{ background: `${emoConf?.color}0a` }}
                >
                  <td className="px-5 py-5 text-gray-500 text-sm font-medium whitespace-nowrap">{globalIdx}</td>
                  <td className="px-5 py-5 text-gray-300">
                    <div title={r.original_text} className="cursor-help line-clamp-3 leading-relaxed text-sm">
                      {r.original_text}
                    </div>
                  </td>
                  <td className="px-5 py-5 whitespace-nowrap">
                    <span
                      className="inline-flex w-fit flex-shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm"
                      style={{ color: emoConf?.color, backgroundColor: `${emoConf?.color}15`, border: `1px solid ${emoConf?.color}40` }}
                    >
                      {getEmotionIcon(r.emotion, 14)} <span>{r.emotion}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 whitespace-nowrap">
                    <span className="inline-block font-mono text-xs font-semibold text-white bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
                      {(r.emotion_confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-5 whitespace-nowrap">
                    <span
                      className="inline-flex w-fit flex-shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm"
                      style={{ color: seConf?.color, backgroundColor: `${seConf?.color}15`, border: `1px solid ${seConf?.color}40` }}
                    >
                      {getSentimentIcon(r.sentiment, 14)} <span>{r.sentiment}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 whitespace-nowrap">
                    <span className="inline-block font-mono text-xs font-semibold text-white bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
                      {(r.sentiment_confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  Tidak ada data yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {sorted.length} hasil · Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all"
            >
              ← Sebelum
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 disabled:opacity-30 hover:bg-white/10 hover:text-white transition-all"
            >
              Berikut →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
