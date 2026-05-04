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

const SEV: Record<string, { bg: string; text: string; dot: string }> = {
  high:   { bg: "rgba(239,68,68,0.12)",   text: "#F87171", dot: "#EF4444" },
  medium: { bg: "rgba(245,158,11,0.12)",  text: "#FCD34D", dot: "#F59E0B" },
  low:    { bg: "rgba(16,185,129,0.12)",  text: "#6EE7B7", dot: "#10B981" },
};

function SeverityBadge({ s }: { s: string }) {
  const c = SEV[s] ?? SEV.low;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, letterSpacing: "0.04em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
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

function LiveDot({ connected }: { connected: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: connected ? "#10B981" : "rgba(255,255,255,0.3)", background: connected ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${connected ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)"}`, borderRadius: 100, padding: "5px 12px" }}>
      <span style={{ position: "relative" as const, display: "inline-flex", width: 6, height: 6 }}>
        {connected && <span style={{ position: "absolute" as const, inset: 0, borderRadius: "50%", background: "#10B981", animation: "ping 1.5s ease-in-out infinite", opacity: 0.6 }}/>}
        <span style={{ position: "relative" as const, width: 6, height: 6, borderRadius: "50%", background: connected ? "#10B981" : "rgba(255,255,255,0.2)", display: "block" }}/>
      </span>
      {connected ? "Live" : "Connecting"}
    </span>
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
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

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

  // SSE real-time
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
          setTimeout(() => setNewIds(prev => { const n = new Set(prev); n.delete(review.id); return n; }), 5000);
        }
      } catch {}
    };
    return () => { es.close(); setConnected(false); };
  }, [status]);

  const repos = useMemo(() => [...new Set(reviews.map(r => r.repoFullName).filter(Boolean))] as string[], [reviews]);

  const filtered = useMemo(() => reviews.filter(r => {
    const matchSearch = search === "" || r.prTitle.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === "all" || r.severity === severityFilter;
    const matchRepo = repoFilter === "all" || r.repoFullName === repoFilter;
    return matchSearch && matchSev && matchRepo;
  }), [reviews, search, severityFilter, repoFilter]);

  if (status === "loading" || !session) return (
    <div style={{ background: "#080810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.08)", borderTop: "2px solid #10B981", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif", background: "#080810", minHeight: "100vh", color: "#E8E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        input,select,button{font-family:inherit}
        select option{background:#0F0F1A}
      `}</style>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: 52, borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#10B981" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="5" fill="#10B981"/>
            <line x1="14" y1="1" x2="14" y2="6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="22" x2="14" y2="27" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="1" y1="14" x2="6" y2="14" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="22" y1="14" x2="27" y2="14" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#F0F0F8", letterSpacing: "-0.02em" }}>CodeLens</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/dashboard" style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "#F0F0F8", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>Reviews</Link>
          <Link href="/settings" style={{ padding: "5px 10px", borderRadius: 6, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>Settings</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LiveDot connected={connected}/>
          <Link href="/profile" style={{ textDecoration: "none" }}>
            {session.user?.image ? (
              <img src={session.user.image} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.1)", display: "block" }}/>
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#10B981" }}>
                {session.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "20px 16px" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 2px", color: "#F0F0F8" }}>Reviews</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>AI code reviews across your repositories</p>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Total", value: stats.total, color: "#F0F0F8", filter: "all" },
            { label: "High", value: stats.high, color: "#F87171", filter: "high" },
            { label: "Medium", value: stats.medium, color: "#FCD34D", filter: "medium" },
            { label: "Low", value: stats.low, color: "#6EE7B7", filter: "low" },
          ].map((s) => (
            <div key={s.filter} onClick={() => setSeverityFilter(s.filter)}
              style={{ background: severityFilter === s.filter ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${severityFilter === s.filter ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10, padding: "14px 12px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.04em", lineHeight: 1 }}>{loading ? "—" : s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3, fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TRENDS */}
        {trends.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", marginBottom: 10, letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Activity — last 14 days</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
              {trends.map((day, i) => {
                const max = Math.max(...trends.map(d => Number(d.total)));
                const total = Number(day.total);
                const heightPct = max > 0 ? (total / max) * 100 : 0;
                const c = Number(day.high) > 0 ? "#EF4444" : Number(day.medium) > 0 ? "#F59E0B" : "#10B981";
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", height: 32, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{ width: "100%", height: `${heightPct}%`, minHeight: total > 0 ? 2 : 0, background: c, borderRadius: 2, opacity: 0.7, transition: "height 0.3s" }}/>
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", textAlign: "center" as const }}>
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 10px 8px 28px", color: "#E8E8F0", fontSize: 13, outline: "none" }}/>
          </div>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 12px", color: "#E8E8F0", fontSize: 13, outline: "none", cursor: "pointer" }}>
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {repos.length > 1 && (
            <select value={repoFilter} onChange={e => setRepoFilter(e.target.value)}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 12px", color: "#E8E8F0", fontSize: 13, outline: "none", cursor: "pointer" }}>
              <option value="all">All repos</option>
              {repos.map(r => <option key={r} value={r}>{r.split("/")[1]}</option>)}
            </select>
          )}
          {(search || severityFilter !== "all" || repoFilter !== "all") && (
            <button onClick={() => { setSearch(""); setSeverityFilter("all"); setRepoFilter("all"); }}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 12px", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>

        {(search || severityFilter !== "all" || repoFilter !== "all") && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
        )}

        {/* REVIEWS */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "48px", textAlign: "center" as const }}>
              <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.08)", borderTop: "2px solid #10B981", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }}/>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Loading reviews...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center" as const }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
                {reviews.length === 0 ? "No reviews yet — open a PR to get started" : "No reviews match your filters"}
              </div>
            </div>
          ) : (
            filtered.map((r, i) => {
              const isNew = newIds.has(r.id);
              const c = SEV[r.severity] ?? SEV.low;
              return (
                <Link key={r.id} href={`/review/${r.id}`}
                  style={{ display: "flex", flexDirection: "column" as const, padding: "14px 16px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", textDecoration: "none", color: "inherit", transition: "background 0.1s", background: isNew ? "rgba(16,185,129,0.04)" : "transparent", position: "relative" as const, animation: isNew ? "slideIn 0.3s ease" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = isNew ? "rgba(16,185,129,0.04)" : "transparent")}
                >
                  {isNew && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#10B981", borderRadius: "0 1px 1px 0" }}/>}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#F0F0F8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{r.prTitle}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>#{r.prNumber}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8, paddingLeft: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {r.summary}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 14, flexWrap: "wrap" as const }}>
                    <SeverityBadge s={r.severity}/>
                    {r.repoFullName && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{r.repoFullName.split("/")[1]}</span>}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}><TimeAgo date={r.createdAt}/></span>
                    <span style={{ fontSize: 11 }}><span style={{ color: "#6EE7B7" }}>+{r.additions}</span> <span style={{ color: "#F87171" }}>-{r.deletions}</span></span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}