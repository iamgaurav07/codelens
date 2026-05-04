import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/github/verify";
import { handlePullRequest } from "@/lib/github/handler";

export async function POST(req: NextRequest) {
  console.log("[WEBHOOK] received");

  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  const event = req.headers.get("x-github-event") ?? "";

  console.log("[WEBHOOK] event:", event);

  const isValid = await verifyWebhookSignature(body, signature);
  console.log("[WEBHOOK] signature valid:", isValid);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  console.log("[WEBHOOK] action:", payload.action);

  if (
    event === "pull_request" &&
    ["opened", "synchronize", "reopened"].includes(payload.action)
  ) {
    console.log("[WEBHOOK] firing handlePullRequest...");
    handlePullRequest(payload).catch((err) => {
      console.error("[WEBHOOK] handlePullRequest error:", err);
    });
  }

  return NextResponse.json({ ok: true });
}
