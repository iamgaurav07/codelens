"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  author: string;
  severity: string;
  summary: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  status: string;
  createdAt: string;
  repoFullName?: string;
};
type Stats = { total: number; high: number; medium: number; low: number };
type TrendDay = {
  date: string;
  total: number;
  high: number;
  medium: number;
  low: number;
};

const SeverityBadge = ({ s }: { s: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    high: { bg: "rgba(239,68,68,0.12)", color: "#F87171" },
    medium: { bg: "rgba(245,158,11,0.12)", color: "#FCD34D" },
    low: { bg: "rgba(110,231,183,0.12)", color: "#6EE7B7" },
  };
  const c = map[s] ?? map.low;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 100,
        letterSpacing: "0.05em",
        textTransform: "uppercase" as const,
      }}
    >
      {s}
    </span>
  );
};

const TimeAgo = ({ date }: { date: string }) => {
  const [now] = useState(() => Date.now());
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return <>{mins}m ago</>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <>{hrs}h ago</>;
  return <>{Math.floor(hrs / 24)}d ago</>;
};

export default function Dashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [trends, setTrends] = useState<TrendDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setStats(data.stats ?? { total: 0, high: 0, medium: 0, low: 0 });
        setTrends(data.trends ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // unique repos for filter dropdown
  const repos = useMemo(() => {
    const names = [
      ...new Set(reviews.map((r) => r.repoFullName).filter(Boolean)),
    ] as string[];
    return names;
  }, [reviews]);

  // filtered reviews
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        search === "" ||
        r.prTitle.toLowerCase().includes(search.toLowerCase()) ||
        r.summary.toLowerCase().includes(search.toLowerCase()) ||
        r.author.toLowerCase().includes(search.toLowerCase());
      const matchSeverity =
        severityFilter === "all" || r.severity === severityFilter;
      const matchRepo = repoFilter === "all" || r.repoFullName === repoFilter;
      return matchSearch && matchSeverity && matchRepo;
    });
  }, [reviews, search, severityFilter, repoFilter]);

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
      {/* NAV */}
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
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(110,231,183,0.08)",
              border: "1px solid rgba(110,231,183,0.15)",
              borderRadius: 100,
              padding: "6px 14px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#6EE7B7",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, color: "#6EE7B7", fontWeight: 600 }}>
              Live
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(110,231,183,0.08)",
              border: "1px solid rgba(110,231,183,0.15)",
              borderRadius: 100,
              padding: "6px 14px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#6EE7B7",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 12, color: "#6EE7B7", fontWeight: 600 }}>
              Live
            </span>
          </div>
          {session?.user?.name && (
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {session.user.name}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            Reviews
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              marginTop: 6,
              fontSize: 14,
            }}
          >
            All AI code reviews across your repositories
          </p>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Total reviews", value: stats.total, color: "#fff" },
            { label: "High severity", value: stats.high, color: "#F87171" },
            { label: "Medium severity", value: stats.medium, color: "#FCD34D" },
            { label: "Low severity", value: stats.low, color: "#6EE7B7" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "24px",
                cursor: "pointer",
              }}
              onClick={() =>
                setSeverityFilter(
                  i === 0
                    ? "all"
                    : i === 1
                      ? "high"
                      : i === 2
                        ? "medium"
                        : "low",
                )
              }
            >
              <div
                style={{
                  fontSize: 32,
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

        {/* TRENDS CHART */}
        {trends.length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "24px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 20,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
            >
              Reviews over time
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: 80,
              }}
            >
              {trends.map((day, i) => {
                const max = Math.max(...trends.map((d) => Number(d.total)));
                const total = Number(day.total);
                const high = Number(day.high);
                const medium = Number(day.medium);
                const low = Number(day.low);
                const heightPct = max > 0 ? (total / max) * 100 : 0;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 64,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: heightPct + "%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          minHeight: total > 0 ? 4 : 0,
                        }}
                      >
                        {high > 0 && (
                          <div
                            style={{
                              width: "100%",
                              flex: high,
                              background: "#F87171",
                              minHeight: 3,
                            }}
                          />
                        )}
                        {medium > 0 && (
                          <div
                            style={{
                              width: "100%",
                              flex: medium,
                              background: "#FCD34D",
                              minHeight: 3,
                            }}
                          />
                        )}
                        {low > 0 && (
                          <div
                            style={{
                              width: "100%",
                              flex: low,
                              background: "#6EE7B7",
                              minHeight: 3,
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.2)",
                        textAlign: "center" as const,
                      }}
                    >
                      {new Date(day.date).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              {[
                { color: "#F87171", label: "High" },
                { color: "#FCD34D", label: "Medium" },
                { color: "#6EE7B7", label: "Low" },
              ].map((l) => (
                <div
                  key={l.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: l.color,
                    }}
                  />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap" as const,
          }}
        >
          {/* search */}
          <div
            style={{ flex: 1, minWidth: 200, position: "relative" as const }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "10px 12px 10px 34px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box" as const,
              }}
            />
          </div>
          {/* severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "10px 16px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {/* repo filter */}
          {repos.length > 1 && (
            <select
              value={repoFilter}
              onChange={(e) => setRepoFilter(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "10px 16px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All repos</option>
              {repos.map((r) => (
                <option key={r} value={r}>
                  {r.split("/")[1]}
                </option>
              ))}
            </select>
          )}
          {/* clear filters */}
          {(search || severityFilter !== "all" || repoFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSeverityFilter("all");
                setRepoFilter("all");
              }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "10px 16px",
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* RESULTS COUNT */}
        {(search || severityFilter !== "all" || repoFilter !== "all") && (
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 12,
            }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </div>
        )}

        {/* TABLE */}
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
              display: "grid",
              gridTemplateColumns: "1fr 140px 100px 80px 100px",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.3)",
            }}
          >
            <span>Pull request</span>
            <span>Repository</span>
            <span>Severity</span>
            <span>Changes</span>
            <span>Time</span>
          </div>

          {loading ? (
            <div
              style={{
                padding: "60px",
                textAlign: "center" as const,
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  animation: "spin 1s linear infinite",
                  display: "block",
                  margin: "0 auto 12px",
                }}
              >
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeOpacity="0.2"
                />
                <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
              </svg>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: "80px",
                textAlign: "center" as const,
                color: "rgba(255,255,255,0.3)",
                fontSize: 14,
              }}
            >
              {reviews.length === 0
                ? "No reviews yet — open a PR on a repo with CodeLens installed"
                : "No reviews match your filters"}
            </div>
          ) : (
            filtered.map((r, i) => (
              <Link
                key={r.id}
                href={"/review/" + r.id}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 100px 80px 100px",
                  padding: "18px 24px",
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {r.prTitle}
                    </span>
                    <span
                      style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}
                    >
                      #{r.prNumber}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}
                  >
                    {r.summary.slice(0, 80)}
                    {r.summary.length > 80 ? "…" : ""}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "monospace",
                  }}
                >
                  {r.repoFullName?.split("/")[1] ?? "—"}
                </div>
                <div>
                  <SeverityBadge s={r.severity} />
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: "#6EE7B7" }}>+{r.additions}</span>{" "}
                  <span style={{ color: "#F87171" }}>-{r.deletions}</span>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  <TimeAgo date={r.createdAt} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
