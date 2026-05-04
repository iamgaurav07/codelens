"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [installError, setInstallError] = useState(false);

  // Replace the two useEffects at the top with these three:

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const loadRepos = () => {
    fetch("/api/repositories")
      .then((r) => r.json())
      .then((data) => {
        setRepos(data.repos ?? []);
        setInstallations(data.installations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const params = new URLSearchParams(window.location.search);
    const installationId = params.get("installation_id");
    const installedParam = params.get("installed");
    const errorParam = params.get("error");

    if (errorParam) {
      setTimeout(() => setInstallError(true), 0);
      return;
    }

    if (installedParam) {
      setTimeout(() => setInstalled(true), 0);
      return;
    }

    if (installationId) {
      fetch("/api/github/save-installation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: parseInt(installationId) }),
      })
        .then((r) => r.json())
        .then(() => {
          window.history.replaceState({}, "", "/settings?installed=true");
          setInstalled(true);
          loadRepos();
        })
        .catch(console.error);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadRepos();
  }, [status]);

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

  return (
    <div
      style={{
        fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
        background: "#F7F7F5",
        minHeight: "100vh",
        color: "#1A1A18",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        a{text-decoration:none;color:inherit}
      `}</style>

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
              background: "#F0F0EC",
              color: "#1A1A18",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Settings
          </Link>
        </div>
        <Link href="/profile">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid #E4E4DC",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#F0F0EC",
                border: "1px solid #E4E4DC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#6B6B64",
              }}
            >
              {session.user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </Link>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "0 0 3px",
            }}
          >
            Settings
          </h1>
          <p style={{ color: "#9B9B92", fontSize: 13, margin: 0 }}>
            Manage your connected repositories
          </p>
        </div>

        {/* SUCCESS BANNER */}
        {installed && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 20,
              fontSize: 13,
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            GitHub App installed successfully! Open a PR on your repo to get
            your first AI review.
          </div>
        )}

        {/* ERROR BANNER */}
        {installError && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 20,
              fontSize: 13,
              color: "#DC2626",
            }}
          >
            Installation failed — please try again.
          </div>
        )}

        {/* INSTALL BANNER */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E4DC",
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
              Connect a repository
            </div>
            <div style={{ fontSize: 13, color: "#9B9B92" }}>
              Install CodeLens on your GitHub repos to start getting AI reviews
            </div>
          </div>
          <a
            href="https://github.com/apps/gaurav-ai-reviewer/installations/new"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#1A1A18",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: "nowrap" as const,
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Install on GitHub
          </a>
        </div>

        {/* REPOS TABLE */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E4DC",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 110px",
              padding: "10px 16px",
              borderBottom: "1px solid #E4E4DC",
              background: "#F7F7F5",
            }}
          >
            {["Repository", "Reviews", "Connected"].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9B9B92",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center" as const }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #E4E4DC",
                  borderTop: "2px solid #1A1A18",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 10px",
                }}
              />
              <div style={{ fontSize: 13, color: "#9B9B92" }}>Loading...</div>
            </div>
          ) : repos.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" as const }}>
              {installations.length > 0 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#16A34A",
                        display: "inline-block",
                      }}
                    />
                    <div
                      style={{
                        color: "#16A34A",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      GitHub App connected
                    </div>
                  </div>
                  <div style={{ color: "#9B9B92", fontSize: 13 }}>
                    Open a PR on any connected repo to see your first review
                    here
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9B9B92",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    No repositories connected yet
                  </div>
                  <div style={{ fontSize: 12, color: "#C4C4BC" }}>
                    Click &quot;Install on GitHub&quot; above to get started
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
                  gridTemplateColumns: "1fr 90px 110px",
                  padding: "14px 16px",
                  borderBottom:
                    i < repos.length - 1 ? "1px solid #F0F0EC" : "none",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "#F0F0EC",
                      border: "1px solid #E4E4DC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B6B64"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1A1A18",
                      }}
                    >
                      {repo.fullName}
                    </div>
                    <a
                      href={"https://github.com/" + repo.fullName}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: "#9B9B92" }}
                    >
                      github.com/{repo.fullName} ↗
                    </a>
                  </div>
                </div>
                <div
                  style={{ fontSize: 13, color: "#6B6B64", fontWeight: 500 }}
                >
                  {repo.reviewCount ?? 0} reviews
                </div>
                <div style={{ fontSize: 12, color: "#9B9B92" }}>
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
