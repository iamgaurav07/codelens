import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    console.log("[REGISTER] body:", { name, email, password: !!password });

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // check existing user
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // hash password
    const hashed = await bcrypt.hash(password, 12);

    // create user
    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        emailVerified: new Date(),
      })
      .returning();

    // store hashed password as credentials account
    await db.insert(accounts).values({
      userId: user.id,
      type: "email" as const,
      provider: "credentials",
      providerAccountId: user.id,
      access_token: hashed,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[REGISTER]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
