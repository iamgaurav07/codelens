import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { installations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://codelens-production-e6c5.up.railway.app";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const installationId = searchParams.get("installation_id");

    console.log("[INSTALL] callback hit, installationId:", installationId);

    if (!installationId) {
      return NextResponse.redirect(new URL("/settings?error=no_installation", APP_URL));
    }

    const session = await getServerSession(authOptions);
    console.log("[INSTALL] session userId:", session?.user?.id ?? "none");

    if (!session?.user?.id) {
      const returnUrl = `/settings?installation_id=${installationId}`;
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`, APP_URL)
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
      console.log(`[INSTALL] saved installationId ${installationId} for user ${session.user.id}`);
    } else if (existing.userId !== session.user.id) {
      await db.update(installations)
        .set({ userId: session.user.id })
        .where(eq(installations.installationId, parseInt(installationId)));
      console.log(`[INSTALL] reassigned installationId ${installationId} to user ${session.user.id}`);
    } else {
      console.log(`[INSTALL] already linked to current user`);
    }

    return NextResponse.redirect(new URL("/settings?installed=true", APP_URL));
  } catch (e) {
    console.error("[INSTALL] error:", e);
    return NextResponse.redirect(new URL("/settings?error=install_failed", APP_URL));
  }
}