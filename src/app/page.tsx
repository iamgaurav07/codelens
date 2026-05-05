"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <main style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif", background: "#F7F7F5", minHeight: "100vh", color: "#1A1A18", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        a{text-decoration:none;color:inherit}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
      `}</style>

      {/* NAV */}
      <nav style={{ height: 56, background: "#fff", borderBottom: "1px solid #E4E4DC", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16 }}>
          <div style={{ width: 30, height: 30, background: "#1A1A18", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white"/>
              <line x1="8" y1="1" x2="8" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="8" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="8" x2="4" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          CodeLens
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a href="#features" style={{ padding: "5px 12px", borderRadius: 6, color: "#6B6B64", fontSize: 13, fontWeight: 500 }}>Features</a>
          <a href="#how" style={{ padding: "5px 12px", borderRadius: 6, color: "#6B6B64", fontSize: 13, fontWeight: 500 }}>How it works</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {session ? (
            <>
              <span style={{ fontSize: 13, color: "#9B9B92" }}>{session.user?.name ?? session.user?.email}</span>
              <Link href="/dashboard" style={{ background: "#1A1A18", color: "#fff", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Dashboard →</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} style={{ fontSize: 13, color: "#9B9B92", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ padding: "7px 14px", borderRadius: 8, color: "#6B6B64", fontSize: 13, fontWeight: 500 }}>Sign in</Link>
              <Link href="/register" style={{ background: "#1A1A18", color: "#fff", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Get started free</Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "96px 32px 80px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 100, padding: "5px 14px", marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", display: "inline-block", animation: "pulse 2s ease-in-out infinite" }}/>
          <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>AI-powered code review</span>
        </div>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.04em", margin: "0 0 20px", color: "#1A1A18" }}>
          Code review that<br/>
          <span style={{ color: "#16A34A" }}>sees everything.</span>
        </h1>
        <p style={{ fontSize: 17, color: "#6B6B64", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
          Install CodeLens on your GitHub repos and get instant AI reviews on every PR — bugs, security issues, and architecture problems caught before merge.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" as const }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{ background: "#1A1A18", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Go to dashboard →</Link>
              <Link href="/settings" style={{ background: "#fff", color: "#1A1A18", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid #E4E4DC" }}>Connect a repo</Link>
            </>
          ) : (
            <>
              <Link href="/register" style={{ background: "#1A1A18", color: "#fff", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Start for free
              </Link>
              <Link href="/login" style={{ background: "#fff", color: "#1A1A18", padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "1px solid #E4E4DC" }}>Sign in</Link>
            </>
          )}
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 820, margin: "0 auto 80px", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "#E4E4DC", borderRadius: 14, overflow: "hidden", border: "1px solid #E4E4DC" }}>
          {[
            { n: "< 30s", label: "Review time per PR" },
            { n: "GPT-4o", label: "Powered by" },
            { n: "4 types", label: "Issue categories" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", padding: "28px 24px", textAlign: "center" as const }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: "#1A1A18" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "#9B9B92", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: 820, margin: "0 auto 80px", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px", color: "#1A1A18" }}>What CodeLens catches</h2>
          <p style={{ fontSize: 14, color: "#9B9B92", margin: 0 }}>Every PR reviewed across four critical dimensions</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {[
            { icon: "🔒", title: "Security vulnerabilities", desc: "Hardcoded secrets, SQL injection, XSS, and OWASP Top 10 issues caught before merge.", color: "#FEF2F2", border: "#FECACA" },
            { icon: "🐛", title: "Logic errors & bugs", desc: "Off-by-one errors, null pointer issues, async misuse, and incorrect conditionals flagged.", color: "#FFFBEB", border: "#FDE68A" },
            { icon: "⚡", title: "Performance issues", desc: "N+1 queries, inefficient loops, missing indexes, and memory leaks identified.", color: "#EFF6FF", border: "#BFDBFE" },
            { icon: "✨", title: "Code quality", desc: "Dead code, unused imports, missing error handling, and poor naming highlighted.", color: "#F0FDF4", border: "#BBF7D0" },
          ].map((f, i) => (
            <div key={i} style={{ background: f.color, border: `1px solid ${f.border}`, borderRadius: 12, padding: "24px" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: "#1A1A18" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#6B6B64", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ maxWidth: 820, margin: "0 auto 80px", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px", color: "#1A1A18" }}>How it works</h2>
          <p style={{ fontSize: 14, color: "#9B9B92", margin: 0 }}>Up and running in under 60 seconds</p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E4E4DC", borderRadius: 14, overflow: "hidden" }}>
          {[
            { n: "01", title: "Create your account", desc: "Sign up free with email. No credit card required." },
            { n: "02", title: "Install the GitHub App", desc: "One-click install on any public or private repo from your settings page." },
            { n: "03", title: "Open a pull request", desc: "CodeLens automatically detects new PRs and reviews them instantly." },
            { n: "04", title: "Get AI feedback", desc: "Structured review with severity, confidence score, and fix suggestions posted on your PR." },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 20, padding: "20px 24px", borderBottom: i < 3 ? "1px solid #F0F0EC" : "none", alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F0F0EC", border: "1px solid #E4E4DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6B6B64", flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, color: "#1A1A18" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#9B9B92", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 820, margin: "0 auto 80px", padding: "0 32px" }}>
        <div style={{ background: "#1A1A18", borderRadius: 16, padding: "56px 48px", textAlign: "center" as const }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 12, color: "#fff" }}>Ready to ship safer code?</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 32, fontSize: 15 }}>Free to use. Works on public and private repos.</p>
          {session ? (
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#1A1A18", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
              Go to dashboard →
            </Link>
          ) : (
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "#1A1A18", padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A1A18"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
              Get started free
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #E4E4DC", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9B9B92", fontSize: 13, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "#1A1A18" }}>
          <div style={{ width: 22, height: 22, background: "#1A1A18", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white"/>
              <line x1="8" y1="1" x2="8" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="8" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="8" x2="4" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          CodeLens
        </div>
        <span>Built by Gaurav Kumar · Berlin</span>
        <div style={{ display: "flex", gap: 20 }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{ color: "#9B9B92" }}>Dashboard</Link>
              <Link href="/settings" style={{ color: "#9B9B92" }}>Settings</Link>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: "#9B9B92" }}>Sign in</Link>
              <Link href="/register" style={{ color: "#9B9B92" }}>Sign up</Link>
            </>
          )}
        </div>
      </footer>
    </main>
  );
}