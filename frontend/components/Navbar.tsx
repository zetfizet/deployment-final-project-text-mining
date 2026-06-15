"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/",         label: "Analisis",      icon: "✦" },
  { href: "/batch",    label: "Batch",          icon: "⊞" },
  { href: "/about",    label: "Tentang Model",  icon: "◎" },
  { href: "/api-docs", label: "API Docs",       icon: "⌥" },
  { href: "/team",     label: "Team",           icon: "⚇" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        background: scrolled
          ? "rgba(0,0,0,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.4)" : "none",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}>

          {/* Logo */}
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#000000",
              boxShadow: "0 0 16px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
              fontFamily: "var(--font-syne)",
              letterSpacing: "-0.02em",
              flexShrink: 0,
            }}>
              ES
            </div>
            <span style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: "#fff",
            }}>
              Emosi<span style={{ color: "#818cf8" }}>Sentimen</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{
            alignItems: "center",
            gap: 2,
          }} className="hidden md:flex">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: isActive ? "#a5b4fc" : "#a3a3a3",
                    background: isActive ? "rgba(129, 140, 248, 0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(129, 140, 248, 0.2)" : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    letterSpacing: "0.01em",
                  }}
                  className="nav-link-item"
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right side — Status badge */}
          <div style={{ alignItems: "center", gap: 12 }} className="hidden md:flex">
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 99,
              background: "rgba(129, 140, 248, 0.1)",
              border: "1px solid rgba(129, 140, 248, 0.25)",
              fontSize: 12,
              fontWeight: 600,
              color: "#a5b4fc",
              letterSpacing: "0.04em",
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#818cf8",
                display: "inline-block",
                animation: "beaconPulse 2.5s ease-in-out infinite",
              }} />
              IndoBERT Live
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            id="navbar-menu-toggle"
            onClick={() => setOpen(!open)}
            style={{
              padding: "8px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#a1a1c2",
              cursor: "pointer",
            }}
            className="md:hidden flex items-center justify-center"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            className="md:hidden"
            style={{
              paddingBottom: 16,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginTop: 4,
            }}
          >
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? "#a5b4fc" : "#a3a3a3",
                    background: isActive ? "rgba(129, 140, 248, 0.1)" : "transparent",
                    textDecoration: "none",
                    marginTop: 4,
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .nav-link-item:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </nav>
  );
}
