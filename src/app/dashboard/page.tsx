"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Review = {
  id: string; prNumber: number; prTitle: string; prUrl: string;
  author: string; severity: string; summary: string; filesChanged: number;
  additions: number; deletions: number; status: string; createdAt: string;
  repoFullName?: string;
};
type Stats = { total: number; high: number; medium: number; low: number };
type TrendDay = { date: string; total: number; high: number; medium: number; low: number };

const SEV = {
  high:   { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", dot: "#EF4444" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", dot: "#F59E0B" },
  low:    { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0", dot: "#22C55E" },
};

function Badge({ s }: { s: string }) {
  const c = SEV[s as keyof typeof SEV] ?? SEV.low;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase" as const, letterSpacing: "0.04em", whiteSpace: "nowrap" as const }}>
      {s}
    </span>
  );
}

function TimeAgo({ date }: { date: string }) {
  const [now] = useState(() => Date.now());
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return <>just now</>;
  if (mins < 60) return <>{mins}m ago</>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <>{hrs}h ago</>;
  return <>{Math.floor(hrs / 24)}d ago</>;
}

function Toast({ review, onDone }: { review: Review; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1A1A18", color: "#fff", borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 200, animation: "toastIn 0.3s ease" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      New review on <strong style={{ color: "#fff" }}>{review.repoFullName?.split("/")[1]}</strong> — {review.severity}
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, high: 0, medium: 0, low: 0 });
  const [trends, setTrends] = useState<TrendDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [repoFilter, setRepoFilter] = useState("all");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<Review | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/reviews")
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews ?? []);
        setStats(data.stats ?? { total: 0, high: 0, medium: 0, low: 0 });
        setTrends(data.trends ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const es = new EventSource("/api/reviews/stream");
    esRef.current = es;
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "connected") { setConnected(true); return; }
        if (data.type === "review_complete") {
          const review = data.review as Review;
          setReviews(prev => [review, ...prev]);
          setStats(prev => ({
            total: prev.total + 1,
            high: review.severity === "high" ? prev.high + 1 : prev.high,
            medium: review.severity === "medium" ? prev.medium + 1 : prev.medium,
            low: review.severity === "low" ? prev.low + 1 : prev.low,
          }));
          setNewIds(prev => new Set([...prev, review.id]));
          setToast(review);
          setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(review.id); return n; }), 5000);
        }
      } catch {}
    };
    return () => { es.close(); setConnected(false); };
  }, [status]);

  const repos = useMemo(() => [...new Set(reviews.map(r => r.repoFullName).filter(Boolean))] as string[], [reviews]);
  const filtered = useMemo(() => reviews.filter(r => {
    const ms = search === "" || r.prTitle.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase());
    const mv = severityFilter === "all" || r.severity === severityFilter;
    const mr = repoFilter === "all" || r.repoFullName === repoFilter;
    return ms && mv && mr;
  }), [reviews, search, severityFilter, repoFilter]);

  const maxTrend = Math.max(...trends.map(d => Number(d.total)), 1);

  if (status === "loading" || !session) return (
    <div style={{ background: "#F7F7F5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid #E4E4DC", borderTop: "2px solid #1A1A18", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif", background: "#F7F7F5", minHeight: "100vh", color: "#1A1A18" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input,select,button{font-family:inherit}
        select option{background:#fff}
        a{text-decoration:none;color:inherit}
      `}</style>

      {/* NAV */}
      <nav style={{ height: 52, background: "#fff", borderBottom: "1px solid #E4E4DC", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 15, color: "#1A1A18" }}>
          <div style={{ width: 28, height: 28, background: "#1A1A18", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white"/>
              <line x1="8" y1="1" x2="8" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="8" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="8" x2="4" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          CodeLens
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/dashboard" style={{ padding: "5px 12px", borderRadius: 6, background: "#F0F0EC", color: "#1A1A18", fontSize: 13, fontWeight: 500 }}>Reviews</Link>
          <Link href="/settings" style={{ padding: "5px 12px", borderRadius: 6, color: "#6B6B64", fontSize: 13, fontWeight: 500 }}>Settings</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: connected ? "#16A34A" : "#9B9B92", background: connected ? "#F0FDF4" : "#F7F7F5", border: `1px solid ${connected ? "#BBF7D0" : "#E4E4DC"}`, borderRadius: 100, padding: "4px 10px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: connected ? "#16A34A" : "#D4D4CC", display: "inline-block", animation: connected ? "pulse 2s ease-in-out infinite" : "none" }}/>
            {connected ? "Live" : "Connecting"}
          </div>
          <Link href="/profile">
            {session.user?.image ? (
              <img src={session.user.image} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid #E4E4DC", display: "block" }}/>
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F0F0EC", border: "1px solid #E4E4DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#6B6B64" }}>
                {session.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 20px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 3px", color: "#1A1A18" }}>Code Reviews</h1>
          <p style={{ color: "#9B9B92", fontSize: 13, margin: 0 }}>
            AI-powered reviews across your repositories
            {!loading && ` · ${stats.total} total`}
          </p>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Total", value: stats.total, color: "#1A1A18", filter: "all" },
            { label: "High", value: stats.high, color: "#DC2626", filter: "high" },
            { label: "Medium", value: stats.medium, color: "#D97706", filter: "medium" },
            { label: "Low", value: stats.low, color: "#16A34A", filter: "low" },
          ].map(s => (
            <div key={s.filter} onClick={() => setSeverityFilter(s.filter)}
              style={{ background: "#fff", border: `1px solid ${severityFilter === s.filter ? "#1A1A18" : "#E4E4DC"}`, borderRadius: 10, padding: "14px", cursor: "pointer", transition: "all 0.12s" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{loading ? "—" : s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9B9B92", marginTop: 4, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CHART */}
        {trends.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #E4E4DC", borderRadius: 10, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>Activity</span>
              <div style={{ display: "flex", gap: 14 }}>
                {[["#EF4444","High"],["#F59E0B","Medium"],["#22C55E","Low"]].map(([c,l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9B9B92", fontWeight: 500 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
              {trends.map((day, i) => {
                const total = Number(day.total);
                const high = Number(day.high);
                const medium = Number(day.medium);
                const low = Number(day.low);
                const h = total > 0 ? Math.max(4, (total / maxTrend) * 44) : 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", height: h, borderRadius: "3px 3px 0 0", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      {!total && <div style={{ width: "100%", height: 2, background: "#F0F0EC", borderRadius: 1 }}/>}
                      {high > 0 && <div style={{ width: "100%", flex: high, background: "#EF4444", minHeight: 2 }}/>}
                      {medium > 0 && <div style={{ width: "100%", flex: medium, background: "#F59E0B", minHeight: 2 }}/>}
                      {low > 0 && <div style={{ width: "100%", flex: low, background: "#22C55E", minHeight: 2 }}/>}
                    </div>
                    <div style={{ fontSize: 9, color: "#C4C4BC", fontFamily: "monospace", textAlign: "center" as const }}>
                      {new Date(day.date).toLocaleDateString("en", { day: "numeric" })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" as const }}>
          <div style={{ flex: 1, minWidth: 160, position: "relative" as const }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9B9B92" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search reviews, repos, authors..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", background: "#fff", border: "1px solid #E4E4DC", borderRadius: 8, padding: "8px 10px 8px 28px", color: "#1A1A18", fontSize: 13, outline: "none" }}/>
          </div>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            style={{ background: "#fff", border: "1px solid #E4E4DC", borderRadius: 8, padding: "8px 12px", color: "#1A1A18", fontSize: 13, outline: "none", cursor: "pointer", fontWeight: 500 }}>
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {repos.length > 1 && (
            <select value={repoFilter} onChange={e => setRepoFilter(e.target.value)}
              style={{ background: "#fff", border: "1px solid #E4E4DC", borderRadius: 8, padding: "8px 12px", color: "#1A1A18", fontSize: 13, outline: "none", cursor: "pointer", fontWeight: 500 }}>
              <option value="all">All repos</option>
              {repos.map(r => <option key={r} value={r}>{r.split("/")[1]}</option>)}
            </select>
          )}
          {(search || severityFilter !== "all" || repoFilter !== "all") && (
            <button onClick={() => { setSearch(""); setSeverityFilter("all"); setRepoFilter("all"); }}
              style={{ background: "#fff", border: "1px solid #E4E4DC", borderRadius: 8, padding: "8px 12px", color: "#6B6B64", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
              Clear
            </button>
          )}
        </div>

        {(search || severityFilter !== "all" || repoFilter !== "all") && (
          <div style={{ fontSize: 12, color: "#9B9B92", marginBottom: 8, fontWeight: 500 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        )}

        {/* TABLE */}
        <div style={{ background: "#fff", border: "1px solid #E4E4DC", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 80px 72px", padding: "10px 16px", borderBottom: "1px solid #E4E4DC", background: "#F7F7F5" }}>
            {["Pull request","Repository","Severity","Changes","Time"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9B9B92", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center" as const }}>
              <div style={{ width: 18, height: 18, border: "2px solid #E4E4DC", borderTop: "2px solid #1A1A18", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }}/>
              <div style={{ fontSize: 13, color: "#9B9B92" }}>Loading reviews...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center" as const }}>
              <div style={{ fontSize: 13, color: "#9B9B92", fontWeight: 500 }}>
                {reviews.length === 0 ? "No reviews yet — open a PR to get started" : "No reviews match your filters"}
              </div>
            </div>
          ) : (
            filtered.map((r, i) => {
              const isNew = newIds.has(r.id);
              const c = SEV[r.severity as keyof typeof SEV] ?? SEV.low;
              return (
                <Link key={r.id} href={`/review/${r.id}`}
                  style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 80px 72px", padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F0F0EC" : "none", alignItems: "center", transition: "background 0.1s", background: isNew ? "#F0FDF4" : "transparent", borderLeft: isNew ? "3px solid #22C55E" : "3px solid transparent", animation: isNew ? "slideIn 0.3s ease" : "none" }}
                  onMouseEnter={e => { if (!isNew) e.currentTarget.style.background = "#F7F7F5"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isNew ? "#F0FDF4" : "transparent"; }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }}/>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{r.prTitle}</span>
                      <span style={{ fontSize: 11, color: "#9B9B92", flexShrink: 0 }}>#{r.prNumber}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9B9B92", paddingLeft: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{r.summary}</div>
                  </div>
                  <div>
                    {r.repoFullName && (
                      <span style={{ fontSize: 11, color: "#6B6B64", background: "#F0F0EC", border: "1px solid #E4E4DC", borderRadius: 4, padding: "2px 6px", fontFamily: "monospace" }}>
                        {r.repoFullName.split("/")[1]}
                      </span>
                    )}
                  </div>
                  <div><Badge s={r.severity}/></div>
                  <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                    <span style={{ color: "#16A34A" }}>+{r.additions}</span>{" "}
                    <span style={{ color: "#DC2626" }}>-{r.deletions}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9B9B92", fontFamily: "monospace" }}><TimeAgo date={r.createdAt}/></div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {toast && <Toast review={toast} onDone={() => setToast(null)}/>}
    </div>
  );
}