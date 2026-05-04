import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, repositories } from "@/lib/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/ratelimit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rateLimit(`api:${session.user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const userId = session.user.id;

    const allReviews = await db
      .select({
        id: reviews.id, prNumber: reviews.prNumber, prTitle: reviews.prTitle,
        prUrl: reviews.prUrl, author: reviews.author, severity: reviews.severity,
        confidence: reviews.confidence, summary: reviews.summary,
        filesChanged: reviews.filesChanged, additions: reviews.additions,
        deletions: reviews.deletions, status: reviews.status,
        createdAt: reviews.createdAt, repoFullName: repositories.fullName,
      })
      .from(reviews)
      .leftJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt))
      .limit(50);

    const statsResult = await db
      .select({ severity: reviews.severity, count: count() })
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .groupBy(reviews.severity);

    const stats = { total: 0, high: 0, medium: 0, low: 0 };
    statsResult.forEach(r => {
      stats.total += Number(r.count);
      if (r.severity === "high") stats.high = Number(r.count);
      if (r.severity === "medium") stats.medium = Number(r.count);
      if (r.severity === "low") stats.low = Number(r.count);
    });

    const trends = await db.execute(sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM reviews
      WHERE created_at >= NOW() - INTERVAL '14 days'
      AND user_id = ${userId}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `) as unknown as unknown[];

    return NextResponse.json({ reviews: allReviews, stats, trends });
  } catch (e) {
    console.error("[API] reviews error:", e);
    return NextResponse.json({ reviews: [], stats: { total: 0, high: 0, medium: 0, low: 0 }, trends: [] });
  }
}