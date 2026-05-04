import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { installations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", APP_URL));
    }

    const cookieStore = await cookies();
    const pendingId = cookieStore.get("pending_installation_id")?.value;

    if (!pendingId) {
      return NextResponse.redirect(new URL("/settings", APP_URL));
    }

    const [existing] = await db
      .select()
      .from(installations)
      .where(eq(installations.installationId, parseInt(pendingId)));

    if (!existing) {
      await db.insert(installations).values({
        userId: session.user.id,
        installationId: parseInt(pendingId),
      });
      console.log(`[INSTALL] linked pending installationId ${pendingId} to user ${session.user.id}`);
    }

    // clear the cookie
    const response = NextResponse.redirect(new URL("/settings?installed=true", APP_URL));
    response.cookies.delete("pending_installation_id");
    return response;
  } catch (e) {
    console.error("[LINK] error:", e);
    return NextResponse.redirect(new URL("/settings?error=install_failed", APP_URL));
  }
}