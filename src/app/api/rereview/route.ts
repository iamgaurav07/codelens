import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, repositories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { handlePullRequest } from "@/lib/github/handler";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!rateLimit(`api:${session.user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const userId = session.user.id;
    const { reviewId } = await req.json();

    const [review] = await db
      .select({
        prNumber: reviews.prNumber,
        prTitle: reviews.prTitle,
        prUrl: reviews.prUrl,
        author: reviews.author,
        installationId: repositories.installationId,
        fullName: repositories.fullName,
        owner: repositories.owner,
        name: repositories.name,
      })
      .from(reviews)
      .leftJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(and(eq(reviews.id, reviewId), eq(reviews.userId, userId)));

    if (!review) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const payload = {
      pull_request: {
        number: review.prNumber,
        title: review.prTitle,
        html_url: review.prUrl,
        additions: 0,
        deletions: 0,
        head: { sha: null },
        user: { login: review.author },
      },
      repository: {
        full_name: review.fullName!,
        name: review.name!,
        owner: { login: review.owner! },
      },
      installation: { id: review.installationId! },
      isRereview: true,
    };

    handlePullRequest(payload).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[API] rereview error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
