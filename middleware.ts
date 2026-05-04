import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth", "/api/webhook"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // log all cookies to debug
  const allCookies = req.cookies.getAll();
  console.log("[MW] path:", pathname, "cookies:", allCookies.map(c => c.name));

  const sessionToken = allCookies.find(c =>
    c.name === "next-auth.session-token" ||
    c.name === "__Secure-next-auth.session-token" ||
    c.name.startsWith("next-auth.session-token")
  )?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)",],
};