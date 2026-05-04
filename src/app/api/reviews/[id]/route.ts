import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, reviewComments, repositories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const [review] = await db
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
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)));

    if (!review) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const comments = await db
      .select()
      .from(reviewComments)
      .where(eq(reviewComments.reviewId, id));

    return NextResponse.json({ ...review, comments });
  } catch (e) {
    console.error("[API] review detail error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}