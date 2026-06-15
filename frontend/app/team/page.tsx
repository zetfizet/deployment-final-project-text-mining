"use client";

import React from "react";

const TEAM_MEMBERS = [
  {
    nrp: "5025231119",
    name: "Miskiyah",
    role: "Mahasiswa",
  },
  {
    nrp: "5025231147",
    name: "Hikmia Sofia Nur Izzati",
    role: "Mahasiswa",
  },
  {
    nrp: "5025231245",
    name: "Rafie Zaidan Umara",
    role: "Mahasiswa",
  },
];

const UserIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function TeamPage() {
  return (
    <div className="aurora-bg" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 20px 80px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge" style={{ marginBottom: 16, display: "inline-flex", color: "#a3a3a3", background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Pengembang Platform
            </span>
          </span>
          <h1
            className="display-heading animate-fadeUp"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", marginBottom: 8 }}
          >
            Anggota <span className="gradient-text">Tim</span>
          </h1>
          <p style={{ fontSize: 15, color: "#737373", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            Platform analisis sentimen dan emosi ini dikembangkan sebagai bagian dari proyek akhir Text Mining.
          </p>
        </div>

        {/* Team Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          maxWidth: 960,
          margin: "0 auto"
        }}>
          {TEAM_MEMBERS.map((member, i) => (
            <div
              key={member.nrp}
              className="glass card-hover animate-fadeUp"
              style={{
                padding: "32px",
                borderColor: "rgba(255,255,255,0.08)",
                animationDelay: `${i * 0.1}s`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {/* Avatar Box */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
                marginBottom: 20,
              }}>
                <UserIcon />
              </div>
              
              {/* Details */}
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4,
                fontFamily: "var(--font-inter)",
                letterSpacing: "-0.01em"
              }}>
                {member.name}
              </h3>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#a3a3a3",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "4px 12px",
                  borderRadius: 99,
                  fontFamily: "var(--font-inter)"
                }}>
                  NRP: {member.nrp}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
