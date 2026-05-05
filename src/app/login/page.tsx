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
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
        background: "#F7F7F5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');*{box-sizing:border-box}`}</style>

      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "#1A1A18",
          marginBottom: 40,
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: "#1A1A18",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" fill="white" />
            <line
              x1="8"
              y1="1"
              x2="8"
              y2="4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="12"
              x2="8"
              y2="15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="1"
              y1="8"
              x2="4"
              y2="8"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="8"
              x2="15"
              y2="8"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        CodeLens
      </Link>

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          border: "1px solid #E4E4DC",
          borderRadius: 14,
          padding: "36px",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            margin: "0 0 6px",
            color: "#1A1A18",
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: "#9B9B92", fontSize: 13, margin: "0 0 28px" }}>
          Sign in to your CodeLens account
        </p>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleCredentials}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#6B6B64",
                display: "block",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                background: "#F7F7F5",
                border: "1px solid #E4E4DC",
                borderRadius: 8,
                padding: "10px 13px",
                color: "#1A1A18",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box" as const,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#6B6B64",
                display: "block",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                background: "#F7F7F5",
                border: "1px solid #E4E4DC",
                borderRadius: 8,
                padding: "10px 13px",
                color: "#1A1A18",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box" as const,
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#1A1A18",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "11px",
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "wait" : "pointer",
              marginTop: 4,
              fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#E4E4DC" }} />
          <span style={{ fontSize: 12, color: "#9B9B92" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#E4E4DC" }} />
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#9B9B92",
            margin: 0,
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            style={{
              color: "#1A1A18",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
