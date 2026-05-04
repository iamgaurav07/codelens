"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

type ReviewDetail = {
  id: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  author: string;
  severity: string;
  confidence: string;
  summary: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  status: string;
  createdAt: string;
  repoFullName?: string;
  comments?: {
    id: string;
    filename: string;
    issue: string;
    suggestion: string;
    category: string;
  }[];
};

const categoryEmoji: Record<string, string> = {
  security: "🔒",
  bug: "🐛",
  performance: "⚡",
  quality: "✨",
};
const categoryColor: Record<string, string> = {
  security: "#F87171",
  bug: "#FCD34D",
  performance: "#A78BFA",
  quality: "#6EE7B7",
};
const severityColor: Record<string, string> = {
  high: "#F87171",
  medium: "#FCD34D",
  low: "#6EE7B7",
};
const confidenceColor: Record<string, string> = {
  high: "#6EE7B7",
  medium: "#FCD34D",
  low: "#F87171",
};

export default function ReviewDetail() {
  const { id } = useParams();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rereviewing, setRereviewing] = useState(false);
  const [rereviewed, setRereviewed] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/reviews/" + id)
      .then((r) => r.json())
      .then((data) => {
        setReview(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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

  const comments = review?.comments ?? [];
  const color = severityColor[review?.severity ?? "low"];

  // group comments by category
  const grouped = comments.reduce(
    (acc, c) => {
      const cat = c.category ?? "quality";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(c);
      return acc;
    },
    {} as Record<string, typeof comments>,
  );

  const triggerRereview = async () => {
    setRereviewing(true);
    try {
      await fetch("/api/reviews/rereview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id }),
      });
      setRereviewed(true);
      setTimeout(() => setRereviewed(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setRereviewing(false);
    }
  };

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
          gap: 16,
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
            gap: 8,
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="5" fill="#6EE7B7" />
          </svg>
          <span
            style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em" }}
          >
            CodeLens
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
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
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          PR #{review?.prNumber}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
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
        </div>
      </nav>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2" />
            <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
          </svg>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !review ? (
        <div
          style={{
            textAlign: "center",
            padding: "100px 40px",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Review not found
        </div>
      ) : (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px" }}>
          {/* HEADER */}
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: "0 0 12px",
              }}
            >
              {review.prTitle}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap" as const,
              }}
            >
              {review.repoFullName && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                  </svg>
                  {review.repoFullName}
                </span>
              )}
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                #{review.prNumber}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                by {review.author}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                {review.filesChanged} files ·{" "}
                <span style={{ color: "#6EE7B7" }}>+{review.additions}</span>{" "}
                <span style={{ color: "#F87171" }}>-{review.deletions}</span>
              </span>
              <a
                href={review.prUrl}
                target="_blank"
                style={{
                  fontSize: 13,
                  color: "#6EE7B7",
                  textDecoration: "none",
                  marginLeft: "auto",
                }}
              >
                View on GitHub →
              </a>
              <button
                onClick={triggerRereview}
                disabled={rereviewing || rereviewed}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: rereviewed
                    ? "rgba(110,231,183,0.1)"
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${rereviewed ? "rgba(110,231,183,0.2)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: rereviewed ? "#6EE7B7" : "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  cursor: rereviewing ? "wait" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {rereviewing ? (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeOpacity="0.2"
                      />
                      <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
                    </svg>
                    Reviewing...
                  </>
                ) : rereviewed ? (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Queued!
                  </>
                ) : (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                    </svg>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Re-review
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SUMMARY CARD */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: 14,
              padding: "24px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap" as const,
              }}
            >
              {/* severity */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  background: `rgba(${review.severity === "high" ? "239,68,68" : review.severity === "medium" ? "245,158,11" : "110,231,183"},0.1)`,
                  color,
                  padding: "4px 12px",
                  borderRadius: 100,
                }}
              >
                {review.severity} severity
              </span>
              {/* confidence */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  background: "rgba(255,255,255,0.05)",
                  color: confidenceColor[review.confidence ?? "high"],
                  padding: "4px 12px",
                  borderRadius: 100,
                }}
              >
                {review.confidence ?? "high"} confidence
              </span>
              {/* issue count */}
              {comments.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.5)",
                    padding: "4px 12px",
                    borderRadius: 100,
                  }}
                >
                  {comments.length} issue{comments.length > 1 ? "s" : ""}
                </span>
              )}
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  marginLeft: "auto",
                }}
              >
                {new Date(review.createdAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {review.summary}
            </p>
          </div>

          {/* CATEGORY BREAKDOWN */}
          {comments.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {["security", "bug", "performance", "quality"].map((cat) => {
                const count = grouped[cat]?.length ?? 0;
                return (
                  <div
                    key={cat}
                    style={{
                      background:
                        count > 0
                          ? `rgba(${cat === "security" ? "239,68,68" : cat === "bug" ? "245,158,11" : cat === "performance" ? "167,139,250" : "110,231,183"},0.06)`
                          : "rgba(255,255,255,0.02)",
                      border: `1px solid rgba(255,255,255,${count > 0 ? "0.08" : "0.04"})`,
                      borderRadius: 10,
                      padding: "14px",
                      textAlign: "center" as const,
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 4 }}>
                      {categoryEmoji[cat]}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color:
                          count > 0
                            ? categoryColor[cat]
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.3)",
                        textTransform: "capitalize" as const,
                      }}
                    >
                      {cat}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* COMMENTS */}
          <div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 16,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
              }}
            >
              {comments.length === 0 ? "No issues found" : "Issues"}
            </h2>
            {comments.length === 0 ? (
              <div
                style={{
                  background: "rgba(110,231,183,0.04)",
                  border: "1px solid rgba(110,231,183,0.1)",
                  borderRadius: 12,
                  padding: "40px",
                  textAlign: "center" as const,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                <div
                  style={{ color: "#6EE7B7", fontWeight: 700, fontSize: 16 }}
                >
                  LGTM — no issues found
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  This PR looks good to merge
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {comments.map((c, i) => (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                      padding: "20px 24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>
                        {categoryEmoji[c.category] ?? "💬"}
                      </span>
                      <code
                        style={{
                          fontSize: 12,
                          color: "#6EE7B7",
                          background: "rgba(110,231,183,0.08)",
                          padding: "3px 10px",
                          borderRadius: 6,
                        }}
                      >
                        {c.filename}
                      </code>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: categoryColor[c.category] ?? "#6EE7B7",
                          background: `rgba(${c.category === "security" ? "239,68,68" : c.category === "bug" ? "245,158,11" : c.category === "performance" ? "167,139,250" : "110,231,183"},0.08)`,
                          padding: "2px 8px",
                          borderRadius: 6,
                          textTransform: "capitalize" as const,
                        }}
                      >
                        {c.category}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.25)",
                          marginLeft: "auto",
                        }}
                      >
                        #{i + 1}
                      </span>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          color: "rgba(255,255,255,0.3)",
                          marginBottom: 6,
                        }}
                      >
                        Issue
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.8)",
                          lineHeight: 1.7,
                        }}
                      >
                        {c.issue}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(110,231,183,0.04)",
                        borderLeft: "3px solid rgba(110,231,183,0.25)",
                        borderRadius: "0 8px 8px 0",
                        padding: "12px 16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase" as const,
                          color: "#6EE7B7",
                          marginBottom: 6,
                        }}
                      >
                        Suggestion
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.7)",
                          lineHeight: 1.7,
                        }}
                      >
                        {c.suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
