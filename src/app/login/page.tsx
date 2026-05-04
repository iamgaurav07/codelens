"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  };

  const handleGitHub = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0A0A0F", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff", marginBottom: 48 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5"/>
          <circle cx="14" cy="14" r="5" fill="#6EE7B7"/>
          <line x1="14" y1="1" x2="14" y2="6" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="14" y1="22" x2="14" y2="27" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="1" y1="14" x2="6" y2="14" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="22" y1="14" x2="27" y2="14" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>CodeLens</span>
      </Link>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "40px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px" }}>Welcome back</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px" }}>Sign in to your CodeLens account</p>

        {/* GitHub OAuth */}
        <button
          onClick={handleGitHub}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#fff", color: "#0A0A0F", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 24, fontFamily: "inherit" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0F">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}/>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}/>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#F87171" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: "#6EE7B7", color: "#0A0A0F", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14, cursor: loading ? "wait" : "pointer", marginTop: 4, fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 24, marginBottom: 0 }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#6EE7B7", textDecoration: "none", fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}