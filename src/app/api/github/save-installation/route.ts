import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { installations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { installationId } = await req.json();
    if (!installationId) {
      return NextResponse.json({ error: "Missing installationId" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(installations)
      .where(eq(installations.installationId, installationId));

    if (!existing) {
      await db.insert(installations).values({
        userId: session.user.id,
        installationId,
      });
      console.log(`[INSTALL] saved installationId ${installationId} for user ${session.user.id}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[SAVE-INSTALL] error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}