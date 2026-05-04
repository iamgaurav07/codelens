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

    console.log("[INSTALL] callback hit, installationId:", installationId, "action:", setupAction);

    if (!installationId) {
      return NextResponse.redirect(new URL("/settings?error=no_installation", APP_URL));
    }

    const session = await getServerSession(authOptions);
    console.log("[INSTALL] session userId:", session?.user?.id ?? "none");

    if (!session?.user?.id) {
      // store installation_id in a cookie and redirect to login
      const response = NextResponse.redirect(
        new URL("/login?reason=install", APP_URL)
      );
      response.cookies.set("pending_installation_id", installationId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
      });
      return response;
    }

    // save installation
    await saveInstallation(session.user.id, installationId);

    return NextResponse.redirect(new URL("/settings?installed=true", APP_URL));
  } catch (e) {
    console.error("[INSTALL] error:", e);
    return NextResponse.redirect(new URL("/settings?error=install_failed", APP_URL));
  }
}

async function saveInstallation(userId: string, installationId: string) {
  const [existing] = await db
    .select()
    .from(installations)
    .where(eq(installations.installationId, parseInt(installationId)));

  if (!existing) {
    await db.insert(installations).values({
      userId,
      installationId: parseInt(installationId),
    });
    console.log(`[INSTALL] linked installationId ${installationId} to user ${userId}`);
  } else {
    console.log(`[INSTALL] installationId ${installationId} already linked`);
  }
}