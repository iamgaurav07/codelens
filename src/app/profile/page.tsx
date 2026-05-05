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

  if (status === "loading" || !session)
    return (
      <div
        style={{
          background: "#F7F7F5",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: "2px solid #E4E4DC",
            borderTop: "2px solid #1A1A18",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );

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
        fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
        background: "#F7F7F5",
        minHeight: "100vh",
        color: "#1A1A18",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');*{box-sizing:border-box}a{text-decoration:none;color:inherit}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* NAV */}
      <nav
        style={{
          height: 52,
          background: "#fff",
          borderBottom: "1px solid #E4E4DC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
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
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link
            href="/dashboard"
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              color: "#6B6B64",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Reviews
          </Link>
          <Link
            href="/settings"
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              color: "#6B6B64",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Settings
          </Link>
          <Link
            href="/profile"
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              background: "#F0F0EC",
              color: "#1A1A18",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Profile
          </Link>
        </div>
        <div style={{ width: 28 }} />
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 32,
            padding: "24px",
            background: "#fff",
            border: "1px solid #E4E4DC",
            borderRadius: 14,
          }}
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #E4E4DC",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#F0F0EC",
                border: "2px solid #E4E4DC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#6B6B64",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1A1A18",
                letterSpacing: "-0.02em",
                marginBottom: 3,
              }}
            >
              {session.user?.name ?? "Your profile"}
            </div>
            <div style={{ fontSize: 13, color: "#9B9B92" }}>
              {session.user?.email}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Total reviews", value: stats.total, color: "#1A1A18" },
            {
              label: "Issues found",
              value: stats.high + stats.medium,
              color: "#D97706",
            },
            { label: "Clean PRs", value: stats.low, color: "#16A34A" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #E4E4DC",
                borderRadius: 10,
                padding: "16px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9B9B92",
                  marginTop: 4,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ACCOUNT SETTINGS */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E4DC",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #E4E4DC",
              background: "#F7F7F5",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1A1A18" }}>
              Account settings
            </div>
            <div style={{ fontSize: 12, color: "#9B9B92", marginTop: 2 }}>
              Update your personal information
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#6B6B64",
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
            <div style={{ marginBottom: 20 }}>
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
                value={session.user?.email ?? ""}
                disabled
                style={{
                  width: "100%",
                  background: "#F0F0EC",
                  border: "1px solid #E4E4DC",
                  borderRadius: 8,
                  padding: "10px 13px",
                  color: "#9B9B92",
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
                background: saved ? "#F0FDF4" : "#1A1A18",
                color: saved ? "#16A34A" : "#fff",
                border: saved ? "1px solid #BBF7D0" : "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved" : "Save changes"}
            </button>
          </div>
        </div>

        {/* SIGN OUT */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #FECACA",
            borderRadius: 12,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: "#DC2626",
              marginBottom: 3,
            }}
          >
            Sign out
          </div>
          <div style={{ fontSize: 13, color: "#9B9B92", marginBottom: 14 }}>
            Sign out of your CodeLens account on this device.
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FECACA",
              borderRadius: 8,
              padding: "9px 20px",
              fontWeight: 600,
              fontSize: 13,
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
