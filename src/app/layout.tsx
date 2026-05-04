import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CodeLens — AI Code Review",
  description: "AI-powered code review for every pull request",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
        
      </body>
    </html>
  );
}