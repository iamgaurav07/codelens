export function Skeleton({ width, height, borderRadius = 6 }: { width?: string | number; height?: string | number; borderRadius?: number }) {
  return (
    <div style={{
      width: width ?? "100%",
      height: height ?? 16,
      borderRadius,
      background: "rgba(255,255,255,0.06)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export function ReviewRowSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 100px", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton width="60%" height={14}/>
        <Skeleton width="80%" height={12}/>
      </div>
      <Skeleton width={80} height={14}/>
      <Skeleton width={60} height={24} borderRadius={100}/>
      <Skeleton width={60} height={14}/>
      <Skeleton width={50} height={14}/>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "24px" }}>
      <Skeleton width={48} height={36} borderRadius={6}/>
      <div style={{ marginTop: 8 }}><Skeleton width={100} height={12}/></div>
    </div>
  );
}