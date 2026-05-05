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

const SEV = {
  high: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  low: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};

const CAT = {
  security: { emoji: "🔒", bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
  bug: { emoji: "🐛", bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  performance: {
    emoji: "⚡",
    bg: "#EFF6FF",
    text: "#2563EB",
    border: "#BFDBFE",
  },
  quality: { emoji: "✨", bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};

export default function ReviewDetail() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [rereviewing, setRereviewing] = useState(false);
  const [rereviewed, setRereviewed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
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

  const comments = review?.comments ?? [];
  const sev = SEV[review?.severity as keyof typeof SEV] ?? SEV.low;
  const grouped = comments.reduce(
    (acc, c) => {
      const cat = c.category ?? "quality";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(c);
      return acc;
    },
    {} as Record<string, typeof comments>,
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
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          gap: 8,
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
            flexShrink: 0,
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
        <span style={{ color: "#C4C4BC", fontSize: 14 }}>/</span>
        <Link
          href="/dashboard"
          style={{ fontSize: 13, color: "#9B9B92", fontWeight: 500 }}
        >
          Reviews
        </Link>
        <span style={{ color: "#C4C4BC", fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, color: "#6B6B64", fontWeight: 500 }}>
          PR #{review?.prNumber ?? "..."}
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
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
        </div>
      </nav>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              border: "2px solid #E4E4DC",
              borderTop: "2px solid #1A1A18",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      ) : !review ? (
        <div
          style={{
            textAlign: "center",
            padding: "100px 40px",
            color: "#9B9B92",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 500 }}>Review not found</div>
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              color: "#1A1A18",
              fontWeight: 600,
              marginTop: 12,
              display: "inline-block",
            }}
          >
            ← Back to reviews
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>
          {/* HEADER */}
          <div style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                margin: "0 0 10px",
                color: "#1A1A18",
              }}
            >
              {review.prTitle}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap" as const,
              }}
            >
              {review.repoFullName && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#6B6B64",
                    background: "#F0F0EC",
                    border: "1px solid #E4E4DC",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontFamily: "monospace",
                  }}
                >
                  {review.repoFullName}
                </span>
              )}
              <span style={{ fontSize: 13, color: "#9B9B92" }}>
                #{review.prNumber}
              </span>
              <span style={{ fontSize: 13, color: "#9B9B92" }}>
                by {review.author}
              </span>
              <span style={{ fontSize: 13, color: "#9B9B92" }}>
                {review.filesChanged} files ·{" "}
                <span style={{ color: "#16A34A" }}>+{review.additions}</span>{" "}
                <span style={{ color: "#DC2626" }}>-{review.deletions}</span>
              </span>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <a
                  href={review.prUrl}
                  target="_blank"
                  style={{
                    fontSize: 13,
                    color: "#1A1A18",
                    fontWeight: 600,
                    background: "#F0F0EC",
                    border: "1px solid #E4E4DC",
                    borderRadius: 7,
                    padding: "6px 12px",
                  }}
                >
                  View on GitHub ↗
                </a>
                <button
                  onClick={triggerRereview}
                  disabled={rereviewing || rereviewed}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: rereviewed ? "#F0FDF4" : "#fff",
                    border: `1px solid ${rereviewed ? "#BBF7D0" : "#E4E4DC"}`,
                    borderRadius: 7,
                    padding: "6px 12px",
                    color: rereviewed ? "#16A34A" : "#6B6B64",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: rereviewing ? "wait" : "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                >
                  {rereviewing ? (
                    <>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          border: "1.5px solid #E4E4DC",
                          borderTop: "1.5px solid #1A1A18",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Reviewing...
                    </>
                  ) : rereviewed ? (
                    <>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Queued!
                    </>
                  ) : (
                    <>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                      </svg>
                      Re-review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SUMMARY CARD */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E4E4DC",
              borderRadius: 12,
              padding: "20px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
                flexWrap: "wrap" as const,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.04em",
                  background: sev.bg,
                  color: sev.text,
                  border: `1px solid ${sev.border}`,
                  padding: "3px 10px",
                  borderRadius: 100,
                }}
              >
                {review.severity} severity
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.04em",
                  background: "#F7F7F5",
                  color: "#6B6B64",
                  border: "1px solid #E4E4DC",
                  padding: "3px 10px",
                  borderRadius: 100,
                }}
              >
                {review.confidence ?? "high"} confidence
              </span>
              {comments.length > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.04em",
                    background: "#F7F7F5",
                    color: "#6B6B64",
                    border: "1px solid #E4E4DC",
                    padding: "3px 10px",
                    borderRadius: 100,
                  }}
                >
                  {comments.length} issue{comments.length > 1 ? "s" : ""}
                </span>
              )}
              <span
                style={{ fontSize: 12, color: "#9B9B92", marginLeft: "auto" }}
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
                fontSize: 14,
                lineHeight: 1.7,
                color: "#1A1A18",
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
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {(["security", "bug", "performance", "quality"] as const).map(
                (cat) => {
                  const count = grouped[cat]?.length ?? 0;
                  const c = CAT[cat];
                  return (
                    <div
                      key={cat}
                      style={{
                        background: count > 0 ? c.bg : "#fff",
                        border: `1px solid ${count > 0 ? c.border : "#E4E4DC"}`,
                        borderRadius: 10,
                        padding: "14px",
                        textAlign: "center" as const,
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 4 }}>
                        {c.emoji}
                      </div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: count > 0 ? c.text : "#C4C4BC",
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {count}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#9B9B92",
                          textTransform: "capitalize" as const,
                          marginTop: 2,
                          fontWeight: 500,
                        }}
                      >
                        {cat}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}

          {/* ISSUES */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#9B9B92",
                textTransform: "uppercase" as const,
                letterSpacing: "0.07em",
                marginBottom: 12,
              }}
            >
              {comments.length === 0
                ? "No issues found"
                : `Issues · ${comments.length}`}
            </div>

            {comments.length === 0 ? (
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: 12,
                  padding: "40px",
                  textAlign: "center" as const,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                <div
                  style={{ color: "#16A34A", fontWeight: 700, fontSize: 15 }}
                >
                  LGTM — no issues found
                </div>
                <div style={{ color: "#9B9B92", fontSize: 13, marginTop: 4 }}>
                  This PR looks good to merge
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {comments.map((c, i) => {
                  const cat =
                    CAT[c.category as keyof typeof CAT] ?? CAT.quality;
                  return (
                    <div
                      key={c.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #E4E4DC",
                        borderRadius: 12,
                        padding: "18px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 12,
                          flexWrap: "wrap" as const,
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                        <code
                          style={{
                            fontSize: 12,
                            color: "#1A1A18",
                            background: "#F0F0EC",
                            border: "1px solid #E4E4DC",
                            padding: "2px 8px",
                            borderRadius: 5,
                          }}
                        >
                          {c.filename}
                        </code>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: cat.text,
                            background: cat.bg,
                            border: `1px solid ${cat.border}`,
                            padding: "2px 8px",
                            borderRadius: 5,
                            textTransform: "capitalize" as const,
                          }}
                        >
                          {c.category}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#C4C4BC",
                            marginLeft: "auto",
                          }}
                        >
                          #{i + 1}
                        </span>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#9B9B92",
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.06em",
                            marginBottom: 5,
                          }}
                        >
                          Issue
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#1A1A18",
                            lineHeight: 1.7,
                          }}
                        >
                          {c.issue}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#F0FDF4",
                          borderLeft: "3px solid #BBF7D0",
                          borderRadius: "0 8px 8px 0",
                          padding: "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#16A34A",
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.06em",
                            marginBottom: 5,
                          }}
                        >
                          Suggestion
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#1A1A18",
                            lineHeight: 1.7,
                          }}
                        >
                          {c.suggestion}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
