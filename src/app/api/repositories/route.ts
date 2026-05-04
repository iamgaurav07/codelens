import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { repositories, reviews, installations } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
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

    // get repos with review counts
    const repos = await db
      .select({
        id: repositories.id,
        fullName: repositories.fullName,
        owner: repositories.owner,
        name: repositories.name,
        createdAt: repositories.createdAt,
        reviewCount: count(reviews.id),
      })
      .from(repositories)
      .leftJoin(reviews, eq(reviews.repositoryId, repositories.id))
      .where(eq(repositories.userId, userId))
      .groupBy(repositories.id)
      .orderBy(repositories.createdAt);

    // get installations with no repos yet
    const userInstallations = await db
      .select()
      .from(installations)
      .where(eq(installations.userId, userId));

    return NextResponse.json({ repos, installations: userInstallations });
  } catch (e) {
    console.error("[API] repositories error:", e);
    return NextResponse.json({ repos: [], installations: [] });
  }
}
