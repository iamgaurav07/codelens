"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <main style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0A0A0F", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="5" fill="#6EE7B7"/>
            <line x1="14" y1="1" x2="14" y2="6" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="22" x2="14" y2="27" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="14" x2="6" y2="14" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="14" x2="27" y2="14" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>CodeLens</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#features" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>Features</a>
          <a href="#how" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 14 }}>How it works</a>
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{session.user?.name ?? session.user?.email}</span>
              <Link href="/dashboard" style={{ background: "#6EE7B7", color: "#0A0A0F", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Dashboard →
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/login" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}>
                Sign in
              </Link>
              <Link href="/register" style={{ background: "#6EE7B7", color: "#0A0A0F", padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                Get started free
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "120px 48px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 100, padding: "6px 16px", marginBottom: 40 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", display: "inline-block" }}/>
          <span style={{ fontSize: 13, color: "#6EE7B7" }}>AI-powered code review</span>
        </div>
        <h1 style={{ fontSize: "clamp(48px, 7vw, 80px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", margin: "0 0 24px" }}>
          Code review that<br/>
          <span style={{ color: "#6EE7B7" }}>sees everything.</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px" }}>
          Install CodeLens on your GitHub repos and get instant AI reviews on every PR — bugs, security issues, and architecture problems caught before merge.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, background: "#6EE7B7", color: "#0A0A0F", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
                Go to dashboard →
              </Link>
              <Link href="/settings" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.1)" }}>
                Connect a repo
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" style={{ display: "flex", alignItems: "center", gap: 10, background: "#6EE7B7", color: "#0A0A0F", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0F"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Start for free
              </Link>
              <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", color: "#fff", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15, border: "1px solid rgba(255,255,255,0.1)" }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 900, margin: "0 auto 100px", padding: "0 48px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        {[
          { n: "< 30s", label: "Review time per PR" },
          { n: "GPT-4o", label: "Powered by" },
          { n: "3 levels", label: "Severity detection" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#0A0A0F", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", color: "#6EE7B7" }}>{s.n}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: 900, margin: "0 auto 120px", padding: "0 48px" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 48, textAlign: "center" }}>What CodeLens catches</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Security vulnerabilities", desc: "Hardcoded secrets, SQL injection, XSS, and OWASP Top 10 issues caught before merge." },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, title: "Logic errors & bugs", desc: "Off-by-one errors, null pointer issues, incorrect conditionals flagged with explanations." },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: "Performance issues", desc: "N+1 queries, inefficient loops, missing indexes and memory leaks identified." },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, title: "Architecture feedback", desc: "Violations of patterns, separation of concerns, and design principles highlighted." },
          ].map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "28px" }}>
              <div style={{ marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ maxWidth: 900, margin: "0 auto 120px", padding: "0 48px" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 48, textAlign: "center" }}>How it works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { n: "01", title: "Create your account", desc: "Sign up free with GitHub or email. No credit card required." },
            { n: "02", title: "Install the GitHub App", desc: "One-click install on any repo from your settings page." },
            { n: "03", title: "Open a pull request", desc: "CodeLens automatically detects new PRs and reviews them instantly." },
            { n: "04", title: "Get AI feedback", desc: "Structured review with severity rating posted directly on your PR." },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 32, padding: "32px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6EE7B7", minWidth: 32, paddingTop: 2 }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto 120px", padding: "0 48px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(110,231,183,0.1) 0%, rgba(110,231,183,0.03) 100%)", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 20, padding: "64px", textAlign: "center" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 16 }}>Ready to ship safer code?</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 40, fontSize: 16 }}>Free to use. No credit card required.</p>
          {session ? (
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#6EE7B7", color: "#0A0A0F", padding: "16px 36px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 16 }}>
              Go to dashboard →
            </Link>
          ) : (
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#6EE7B7", color: "#0A0A0F", padding: "16px 36px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A0A0F"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Get started free
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5"/><circle cx="14" cy="14" r="5" fill="#6EE7B7"/></svg>
          <span>CodeLens</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Dashboard</Link>
              <Link href="/settings" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Settings</Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Sign in</Link>
              <Link href="/register" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Sign up</Link>
            </>
          )}
        </div>
      </footer>
    </main>
  );
}