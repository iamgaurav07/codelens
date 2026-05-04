import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users, accounts } from "@/lib/db/schema";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user user:email" },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));

        if (!user) return null;

        const [account] = await db
          .select()
          .from(accounts)
          .where(eq(accounts.userId, user.id));

        if (!account?.access_token) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          account.access_token,
        );

        if (!valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === "github" && user?.email) {
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email));

        if (!existing) {
          const [newUser] = await db
            .insert(users)
            .values({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
            })
            .returning();
          token.id = newUser.id;
        } else {
          // only update image, NEVER overwrite name the user may have set
          await db
            .update(users)
            .set({
              image: user.image ?? existing.image,
              // name is intentionally NOT updated here
            })
            .where(eq(users.id, existing.id));
          token.id = existing.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
