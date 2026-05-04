import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { installations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : "http://localhost:3000");

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = req.nextUrl;
    const installationId = searchParams.get("installation_id");

    console.log("[INSTALL] callback hit, installationId:", installationId);
    console.log("[INSTALL] session:", session?.user?.id);
    console.log("[INSTALL] APP_URL:", APP_URL);

    if (!session?.user?.id) {
      console.log("[INSTALL] no session — redirecting to login");
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=/api/github/callback?installation_id=${installationId}`, APP_URL)
      );
    }

    if (!installationId) {
      return NextResponse.redirect(new URL("/settings?error=no_installation", APP_URL));
    }

    const existing = await db
      .select()
      .from(installations)
      .where(eq(installations.installationId, parseInt(installationId)));

    if (existing.length === 0) {
      await db.insert(installations).values({
        userId: session.user.id,
        installationId: parseInt(installationId),
      });
      console.log(`[INSTALL] linked installationId ${installationId} to user ${session.user.id}`);
    } else {
      console.log(`[INSTALL] installationId ${installationId} already linked`);
    }

    return NextResponse.redirect(new URL("/settings?installed=true", APP_URL));
  } catch (e) {
    console.error("[INSTALL] error:", e);
    return NextResponse.redirect(new URL("/settings?error=install_failed", APP_URL));
  }
}