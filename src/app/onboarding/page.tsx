"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const STEPS = [
  { n: 1, title: "Create account", desc: "You're signed in and ready to go.", done: true },
  { n: 2, title: "Install GitHub App", desc: "Connect CodeLens to your repositories.", done: false },
  { n: 3, title: "Open a pull request", desc: "Get your first AI review automatically.", done: false },
];

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasInstallation, setHasInstallation] = useState(false);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/repositories")
      .then(r => r.json())
      .then(d => {
        setHasInstallation((d.installations ?? []).length > 0);
        setHasReview((d.repos ?? []).length > 0);
      });
  }, [status]);

  useEffect(() => {
    if (hasReview) router.push("/dashboard");
  }, [hasReview, router]);

  if (status === "loading" || !session) return null;

  const steps = [
    { ...STEPS[0], done: true },
    { ...STEPS[1], done: hasInstallation },
    { ...STEPS[2], done: hasReview },
  ];

  const currentStep = steps.findIndex(s => !s.done);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#0A0A0F", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>

      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#fff", marginBottom: 64 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#6EE7B7" strokeWidth="1.5"/>
          <circle cx="14" cy="14" r="5" fill="#6EE7B7"/>
        </svg>
        <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.03em" }}>CodeLens</span>
      </Link>

      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", margin: "0 0 8px" }}>
            Welcome, {session.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, margin: 0 }}>
            Let&apos;s get you set up in 3 steps
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ background: step.done ? "rgba(110,231,183,0.04)" : currentStep === i ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${step.done ? "rgba(110,231,183,0.15)" : currentStep === i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: step.done ? "rgba(110,231,183,0.15)" : currentStep === i ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {step.done ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: currentStep === i ? "#fff" : "rgba(255,255,255,0.3)" }}>{step.n}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: step.done ? "#6EE7B7" : currentStep === i ? "#fff" : "rgba(255,255,255,0.4)", marginBottom: 2 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
              {currentStep === i && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6EE7B7", animation: "pulse 2s ease-in-out infinite" }}/>
              )}
            </div>
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }`}</style>
        </div>

        {/* CTA for current step */}
        {currentStep === 1 && (
          <a href="https://github.com/apps/gaurav-ai-reviewer/installations/new" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#6EE7B7", color: "#0A0A0F", padding: "14px 28px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A0F"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            Install on GitHub
          </a>
        )}
        {currentStep === 2 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>GitHub App is connected! Now open a PR on any connected repo.</div>
            <Link href="/dashboard" style={{ fontSize: 14, color: "#6EE7B7", textDecoration: "none" }}>Skip to dashboard →</Link>
          </div>
        )}
      </div>
    </div>
  );
}