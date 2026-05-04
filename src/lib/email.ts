import nodemailer from "nodemailer";

const isConfigured =
  !!process.env.EMAIL_SERVER_HOST &&
  !!process.env.EMAIL_SERVER_USER &&
  !!process.env.EMAIL_SERVER_PASSWORD;

if (!isConfigured) {
  console.warn("[EMAIL] SMTP not configured — email alerts disabled");
}

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
  : null;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendHighSeverityAlert({
  to,
  prTitle,
  prUrl,
  repoName,
  summary,
  reviewUrl,
}: {
  to: string;
  prTitle: string;
  prUrl: string;
  repoName: string;
  summary: string;
  reviewUrl: string;
}): Promise<void> {
  if (!isConfigured || !transporter) {
    console.log("[EMAIL] skipping — SMTP not configured");
    return;
  }

  if (!isValidEmail(to)) {
    console.error("[EMAIL] invalid recipient address:", to);
    return;
  }

  try {
    await transporter.sendMail({
      from: `CodeLens <${process.env.EMAIL_FROM ?? process.env.EMAIL_SERVER_USER}>`,
      to,
      subject: `🔴 High severity issue found in ${repoName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #0A0A0F; color: #fff;">
          <div style="margin-bottom: 32px;">
            <span style="background: rgba(239,68,68,0.1); color: #F87171; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;">HIGH SEVERITY</span>
          </div>
          <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.03em;">Critical issue detected</h1>
          <p style="color: rgba(255,255,255,0.5); margin: 0 0 32px; font-size: 15px; line-height: 1.6;">CodeLens found a high severity issue in a pull request on <strong style="color: #fff;">${repoName}</strong>.</p>
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <div style="font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 8px;">Pull request</div>
            <div style="font-size: 15px; font-weight: 600; margin-bottom: 16px;">${prTitle}</div>
            <div style="font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 8px;">Summary</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">${summary}</div>
          </div>
          <div>
            <a href="${reviewUrl}" style="background: #6EE7B7; color: #0A0A0F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; margin-right: 12px;">View full review</a>
            <a href="${prUrl}" style="background: rgba(255,255,255,0.06); color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; border: 1px solid rgba(255,255,255,0.1); display: inline-block;">View PR on GitHub</a>
          </div>
          <p style="color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 40px;">You're receiving this because you have high severity alerts enabled on CodeLens.</p>
        </div>
      `,
    });
    console.log("[EMAIL] sent high severity alert to:", to);
  } catch (err) {
    console.error("[EMAIL] failed to send alert:", err);
    throw err;
  }
}