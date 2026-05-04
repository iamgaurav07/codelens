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
    const { searchParams } = req.nextUrl;
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");

    console.log("[INSTALL] callback hit, installationId:", installationId);

    // if no installation_id, just redirect to settings
    if (!installationId) {
      return NextResponse.redirect(new URL("/settings?error=no_installation", APP_URL));
    }

    const session = await getServerSession(authOptions);
    console.log("[INSTALL] session userId:", session?.user?.id ?? "none");

    // not logged in — redirect to login then back here
    if (!session?.user?.id) {
      const returnUrl = encodeURIComponent(
        `/api/github/callback?installation_id=${installationId}&setup_action=${setupAction ?? "install"}`
      );
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${returnUrl}`, APP_URL)
      );
    }

    const [existing] = await db
      .select()
      .from(installations)
      .where(eq(installations.installationId, parseInt(installationId)));

    if (!existing) {
      await db.insert(installations).values({
        userId: session.user.id,
        installationId: parseInt(installationId),
      });
      console.log(`[INSTALL] linked installationId ${installationId} to user ${session.user.id}`);
    } else if (existing.userId !== session.user.id) {
      console.log(`[INSTALL] reassigning installationId ${installationId} to user ${session.user.id}`);
    } else {
      console.log(`[INSTALL] installationId ${installationId} already linked`);
    }

    return NextResponse.redirect(new URL("/settings?installed=true", APP_URL));
  } catch (e) {
    console.error("[INSTALL] error:", e);
    return NextResponse.redirect(new URL("/settings?error=install_failed", APP_URL));
  }
}