"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0A0A0F", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.06em", color: "rgba(255,255,255,0.06)", lineHeight: 1, marginBottom: 24 }}>500</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 12px" }}>Something went wrong</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 40, maxWidth: 400, lineHeight: 1.7 }}>
        An unexpected error occurred. We&apos;ve been notified and are looking into it.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{ background: "#6EE7B7", color: "#0A0A0F", padding: "10px 24px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
        >
          Try again
        </button>
        <Link href="/dashboard" style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "10px 24px", borderRadius: 8, textDecoration: "none", fontSize: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}