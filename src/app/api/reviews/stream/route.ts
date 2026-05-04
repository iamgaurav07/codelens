import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// global event emitter for review updates
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function notifyUser(userId: string, data: unknown) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const message = `data: ${JSON.stringify(data)}\n\n`;
  userClients.forEach(controller => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch {
      userClients.delete(controller);
    }
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  const stream = new ReadableStream({
    start(controller) {
      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }
      clients.get(userId)!.add(controller);

      // send initial ping
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        clients.get(userId)?.delete(controller);
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}