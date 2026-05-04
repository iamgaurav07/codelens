"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Repo = {
  id: string;
  fullName: string;
  owner: string;
  name: string;
  createdAt: string;
  reviewCount?: number;
};

type Installation = {
  id: string;
  installationId: number;
  createdAt: string;
};

export default function Settings() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [installations, setInstallations] = useState<Installation[]>([]);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/repositories")
      .then((r) => r.json())
      .then((data) => {
        setRepos(data.repos ?? []);
        setInstallations(data.installations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  const [searchParams] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams(),
  );
  const installed = searchParams.get("installed");
  const installError = searchParams.get("error");

  if (status === "loading") {
    return (
      <div
        style={{
          background: "#0A0A0F",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) return null;

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
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Settings
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            Settings
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              marginTop: 6,
              fontSize: 14,
            }}
          >
            Manage your connected repositories
          </p>
        </div>

        {installed && (
          <div
            style={{
              background: "rgba(110,231,183,0.08)",
              border: "1px solid rgba(110,231,183,0.15)",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 24,
              fontSize: 14,
              color: "#6EE7B7",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            GitHub App installed successfully! Open a PR on your repo to start
            getting AI reviews.
          </div>
        )}
        {installError && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: 10,
              padding: "14px 20px",
              marginBottom: 24,
              fontSize: 14,
              color: "#F87171",
            }}
          >
            Installation failed — please try again.
          </div>
        )}

        {/* INSTALL BANNER */}
        <div
          style={{
            background: "rgba(110,231,183,0.05)",
            border: "1px solid rgba(110,231,183,0.12)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              Add more repositories
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              Install CodeLens on additional repos from GitHub
            </div>
          </div>
          <a
            href="https://github.com/apps/gaurav-ai-reviewer/installations/new"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#6EE7B7",
              color: "#0A0A0F",
              padding: "10px 20px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A0F">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Install on GitHub
          </a>
        </div>

        {/* CONNECTED REPOS */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.3)",
              display: "grid",
              gridTemplateColumns: "1fr 100px 120px",
            }}
          >
            <span>Repository</span>
            <span>Reviews</span>
            <span>Connected</span>
          </div>

          {loading ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: 14,
              }}
            >
              Loading...
            </div>
          ) : repos.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" as const }}>
              {installations.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#6EE7B7",
                        display: "inline-block",
                      }}
                    />
                    <div
                      style={{
                        color: "#6EE7B7",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      GitHub App connected
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                    Open a PR on any connected repo to see your first review
                    here
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    {installations.map((inst) => (
                      <div
                        key={inst.id}
                        style={{
                          background: "rgba(110,231,183,0.06)",
                          border: "1px solid rgba(110,231,183,0.12)",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontSize: 12,
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        Installation #{inst.installationId}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1"
                    style={{ display: "block", margin: "0 auto 12px" }}
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </svg>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    No repositories connected yet
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    Install CodeLens on a repo to get started
                  </div>
                </>
              )}
            </div>
          ) : (
            repos.map((repo, i) => (
              <div
                key={repo.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 120px",
                  padding: "18px 24px",
                  borderBottom:
                    i < repos.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(110,231,183,0.08)",
                      border: "1px solid rgba(110,231,183,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6EE7B7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {repo.fullName}
                    </div>
                    <a
                      href={"https://github.com/" + repo.fullName}
                      target="_blank"
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.3)",
                        textDecoration: "none",
                      }}
                    >
                      github.com/{repo.fullName} ↗
                    </a>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  {repo.reviewCount ?? 0} reviews
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {new Date(repo.createdAt).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
