import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0A0A0F", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
      <svg width="48" height="48" viewBox="0 0 28 28" fill="none" style={{ marginBottom: 32, opacity: 0.3 }}>
        <circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5"/>
        <circle cx="14" cy="14" r="5" fill="#6EE7B7"/>
      </svg>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.06em", color: "rgba(255,255,255,0.06)", lineHeight: 1, marginBottom: 24 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 12px" }}>Page not found</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, marginBottom: 40, maxWidth: 400, lineHeight: 1.7 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/dashboard" style={{ background: "#6EE7B7", color: "#0A0A0F", padding: "10px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
          Go to dashboard
        </Link>
        <Link href="/" style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "10px 24px", borderRadius: 8, textDecoration: "none", fontSize: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
          Home
        </Link>
      </div>
    </div>
  );
}