"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const nameInitialized = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.name || nameInitialized.current) return;
    nameInitialized.current = true;
    setName(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) =>
        setStats(d.stats ?? { total: 0, high: 0, medium: 0, low: 0 }),
      );
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (status === "loading" || !session) {
    return <div style={{ background: "#0A0A0F", minHeight: "100vh" }} />;
  }

  const initials =
    session.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        background: "#0A0A0F",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          background: "rgba(10,10,15,0.9)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="5" fill="#6EE7B7" />
            <line
              x1="14"
              y1="1"
              x2="14"
              y2="6"
              stroke="#6EE7B7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="14"
              y1="22"
              x2="14"
              y2="27"
              stroke="#6EE7B7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="1"
              y1="14"
              x2="6"
              y2="14"
              stroke="#6EE7B7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="14"
              x2="27"
              y2="14"
              stroke="#6EE7B7"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.03em" }}
          >
            CodeLens
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/dashboard"
            style={{
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Reviews
          </Link>
          <Link
            href="/settings"
            style={{
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Settings
          </Link>
          <Link
            href="/profile"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Profile
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 40px" }}>
        {/* Avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "2px solid rgba(110,231,183,0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(110,231,183,0.1)",
                border: "2px solid rgba(110,231,183,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
                color: "#6EE7B7",
              }}
            >
              {initials}
            </div>
          )}
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                margin: "0 0 4px",
              }}
            >
              {session.user?.name ?? "Your profile"}
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                margin: 0,
              }}
            >
              {session.user?.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {[
            { label: "Total reviews", value: stats.total, color: "#fff" },
            {
              label: "Issues found",
              value: stats.high + stats.medium,
              color: "#FCD34D",
            },
            { label: "Clean PRs", value: stats.low, color: "#6EE7B7" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Account settings */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              Account settings
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Update your personal information
            </div>
          </div>
          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Full name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box" as const,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <input
                value={session.user?.email ?? ""}
                disabled
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  padding: "11px 14px",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box" as const,
                  fontFamily: "inherit",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saved ? "rgba(110,231,183,0.1)" : "#6EE7B7",
                color: saved ? "#6EE7B7" : "#0A0A0F",
                border: saved ? "1px solid rgba(110,231,183,0.2)" : "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved" : "Save changes"}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div
          style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.1)",
            borderRadius: 14,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 4,
              color: "#F87171",
            }}
          >
            Sign out
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 16,
            }}
          >
            Sign out of your CodeLens account on this device.
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#F87171",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
