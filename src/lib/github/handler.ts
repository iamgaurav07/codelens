/* eslint-disable @typescript-eslint/no-explicit-any */
import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import OpenAI from "openai";
import { db } from "@/lib/db";
import {
  repositories,
  reviews,
  reviewComments,
  installations,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendHighSeverityAlert } from "@/lib/email";

interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface AIComment {
  filename: string;
  issue: string;
  suggestion: string;
  category: string;
}

interface AIReview {
  summary: string;
  severity: string;
  confidence: string;
  comments: AIComment[];
}

interface PullRequestPayload {
  pull_request: {
    number: number;
    title: string;
    html_url: string;
    additions: number;
    deletions: number;
    head: { sha: string | null };
    user: { login: string };
  };
  repository: {
    full_name: string;
    name: string;
    owner: { login: string };
  };
  installation: { id: number };
  isRereview?: boolean;
}

const EXCLUDED_FILES = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".env.example",
  "drizzle.config.ts",
  "next.config.ts",
  "tailwind.config.ts",
  "tsconfig.json",
  ".eslintrc",
  ".gitignore",
  "README.md",
];

const EXCLUDED_PATTERNS = [
  /\.md$/,
  /\.lock$/,
  /\.json$/,
  /migration/,
  /drizzle\//,
];

// ── Lazy singletons ───────────────────────────────────────────────────────

let _app: App | null = null;
let _openai: OpenAI | null = null;

function getApp(): App {
  if (_app) return _app;

  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY
    ? process.env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n")
    : process.env.GITHUB_APP_PRIVATE_KEY_PATH
    ? fs.readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH, "utf8")
    : "";

  if (!privateKey) throw new Error("[HANDLER] GitHub App private key not configured");
  if (!process.env.GITHUB_APP_ID) throw new Error("[HANDLER] GITHUB_APP_ID not configured");
  if (!process.env.GITHUB_WEBHOOK_SECRET) throw new Error("[HANDLER] GITHUB_WEBHOOK_SECRET not configured");

  _app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey,
    webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET },
  });

  return _app;
}

function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  if (!process.env.OPENAI_API_KEY) throw new Error("[HANDLER] OPENAI_API_KEY not configured");
  _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

// ── Check run helper ──────────────────────────────────────────────────────

async function createCheckRun(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  status: "queued" | "in_progress" | "completed",
  conclusion?: "success" | "failure" | "neutral",
  summary?: string,
) {
  return octokit.rest.checks.create({
    owner,
    repo,
    name: "CodeLens AI Review",
    head_sha: sha,
    status,
    ...(conclusion && {
      conclusion,
      completed_at: new Date().toISOString(),
      output: {
        title:
          conclusion === "success"
            ? "✅ No critical issues found"
            : "🔴 High severity issues detected",
        summary: summary ?? "",
      },
    }),
  });
}

// ── Main handler ──────────────────────────────────────────────────────────

export async function handlePullRequest(payload: PullRequestPayload) {
  const { pull_request, repository, installation } = payload;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[PR] #" + pull_request.number + " — " + pull_request.title);
  console.log("[PR] author: " + pull_request.user.login);
  console.log("[PR] repo: " + repository.full_name);
  console.log("[PR] installationId: " + installation.id);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // lookup userId from installations table
  const [installRecord] = await db
    .select()
    .from(installations)
    .where(eq(installations.installationId, installation.id));

  if (!installRecord) {
    console.log("[PR] no user linked to installationId " + installation.id + " — skipping");
    return;
  }

  const userId = installRecord.userId;
  console.log("[PR] userId: " + userId);

  // upsert repository
  let [repo] = await db
    .select()
    .from(repositories)
    .where(
      and(
        eq(repositories.installationId, installation.id),
        eq(repositories.fullName, repository.full_name),
      ),
    );

  if (!repo) {
    [repo] = await db
      .insert(repositories)
      .values({
        userId,
        installationId: installation.id,
        owner: repository.owner.login,
        name: repository.name,
        fullName: repository.full_name,
      })
      .returning();
  }

  // get octokit client
  const installationOctokit = await getApp().getInstallationOctokit(installation.id);
  const { token } = (await installationOctokit.auth({ type: "installation" })) as any;
  const octokit = new Octokit({ auth: token });

  // fetch diff
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: pull_request.number,
  });
  console.log("[DIFF] " + files.length + " files changed");

  // skip check runs for re-reviews (no valid SHA)
  const sha = pull_request.head.sha;
  const skipChecks = payload.isRereview || !sha;

  if (!skipChecks) {
    await createCheckRun(octokit, repository.owner.login, repository.name, sha!, "in_progress");
  }

  // detect languages
  const languages = [
    ...new Set(
      files
        .map((f: GitHubFile) => {
          const ext = f.filename.split(".").pop()?.toLowerCase();
          const langMap: Record<string, string> = {
            ts: "TypeScript",
            tsx: "TypeScript/React",
            js: "JavaScript",
            py: "Python",
            sql: "SQL",
            prisma: "Prisma Schema",
            json: "JSON",
            md: "Markdown",
            yml: "YAML",
            yaml: "YAML",
          };
          return langMap[ext ?? ""] ?? "Unknown";
        })
        .filter((l: string) => l !== "Unknown"),
    ),
  ].join(", ");
  console.log("[LANG] " + (languages || "unknown"));

  // build diff string
  const diffText = files
    .filter((f: GitHubFile) => {
      if (!f.patch) return false;
      if (EXCLUDED_FILES.includes(f.filename)) return false;
      if (EXCLUDED_PATTERNS.some((p) => p.test(f.filename))) return false;
      return true;
    })
    .map(
      (f: GitHubFile) =>
        `File: ${f.filename}\nStatus: ${f.status}\n+${f.additions} -${f.deletions}\n\`\`\`diff\n${f.patch}\n\`\`\``,
    )
    .join("\n\n");

  if (!diffText) {
    console.log("[AI] no reviewable diff, skipping");
    if (!skipChecks) {
      await createCheckRun(octokit, repository.owner.login, repository.name, sha!, "completed", "neutral", "No reviewable diff found.");
    }
    return;
  }

  // build system prompt
  const systemPrompt = `You are an expert code reviewer specializing in ${languages || "general"} codebases.

Review the PR diff with focus on:

SECURITY (highest priority):
- Hardcoded secrets, API keys, passwords (NOT environment variables — process.env usage is correct)
- SQL injection, XSS, CSRF vulnerabilities
- Insecure authentication or authorization
- Sensitive data exposure in logs or responses

BUGS & LOGIC:
- Null/undefined errors, off-by-one errors
- Incorrect conditionals or edge cases
- Async/await misuse, unhandled promises
- Type mismatches

PERFORMANCE:
- N+1 queries, missing indexes
- Unnecessary re-renders (React)
- Memory leaks, inefficient loops

CODE QUALITY:
- Dead code, unused imports
- Functions doing too many things
- Missing error handling
- Poor naming

Severity rules:
- "high": security vulnerabilities or bugs that will cause crashes
- "medium": bugs that may cause issues or significant code quality problems
- "low": style, minor improvements, suggestions

Respond ONLY in this exact JSON format:
{
  "summary": "one sentence describing what this PR does and its main concern",
  "severity": "low | medium | high",
  "confidence": "high | medium | low",
  "comments": [
    {
      "filename": "path/to/file",
      "issue": "clear description of the problem",
      "suggestion": "specific actionable fix",
      "category": "security | bug | performance | quality"
    }
  ]
}
Return only JSON. No markdown, no explanation.`;

  // run AI review
  console.log("[AI] reviewing...");
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `PR Title: ${pull_request.title}\nAuthor: ${pull_request.user.login}\nLanguages: ${languages}\nFiles changed: ${files.length}\n\nDiff:\n${diffText}`,
      },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";
  const review = JSON.parse(raw) as AIReview;
  console.log(
    "[AI] severity: " + review.severity +
    ", confidence: " + review.confidence +
    ", comments: " + review.comments.length,
  );

  // save to database
  const [savedReview] = await db
    .insert(reviews)
    .values({
      userId,
      repositoryId: repo.id,
      prNumber: pull_request.number,
      prTitle: pull_request.title,
      prUrl: pull_request.html_url,
      author: pull_request.user.login,
      severity: review.severity,
      confidence: review.confidence ?? "high",
      summary: review.summary,
      filesChanged: files.length,
      additions: pull_request.additions ?? 0,
      deletions: pull_request.deletions ?? 0,
      status: "completed",
    })
    .returning();

  if (review.comments.length > 0) {
    await db.insert(reviewComments).values(
      review.comments.map((c: AIComment) => ({
        reviewId: savedReview.id,
        filename: c.filename,
        issue: c.issue,
        suggestion: c.suggestion,
        category: c.category ?? "quality",
      })),
    );
  }

  console.log("[DB] saved review " + savedReview.id);

  // post completed check run
  if (!skipChecks) {
    const conclusion = review.severity === "high" ? "failure" : "success";
    await createCheckRun(octokit, repository.owner.login, repository.name, sha!, "completed", conclusion, review.summary);
  }

  // send email alert for high severity
  const dashboardUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") + "/review/" + savedReview.id;

  if (review.severity === "high") {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (user?.email) {
        await sendHighSeverityAlert({
          to: user.email,
          prTitle: pull_request.title,
          prUrl: pull_request.html_url,
          repoName: repository.full_name,
          summary: review.summary,
          reviewUrl: dashboardUrl,
        });
      }
    } catch (err) {
      console.error("[EMAIL] high severity alert failed:", err);
    }
  }

  // post comment to GitHub PR
  const severityEmoji: Record<string, string> = { low: "🟢", medium: "🟡", high: "🔴" };
  const categoryEmoji: Record<string, string> = { security: "🔒", bug: "🐛", performance: "⚡", quality: "✨" };

  let body = `## CodeLens Review ${severityEmoji[review.severity] ?? "⚪"}\n\n`;
  body += `**Summary:** ${review.summary}\n\n`;
  body += `**Severity:** \`${review.severity.toUpperCase()}\` · **Confidence:** \`${(review.confidence ?? "high").toUpperCase()}\` · **Languages:** ${languages || "unknown"}\n\n`;

  if (review.comments.length === 0) {
    body += `✅ No issues found — looks good to merge!\n`;
  } else {
    body += `### Issues Found\n\n`;
    review.comments.forEach((c: AIComment, i: number) => {
      const emoji = categoryEmoji[c.category] ?? "💬";
      body += `**${i + 1}. ${emoji} \`${c.filename}\`** \`${c.category}\`\n`;
      body += `- **Issue:** ${c.issue}\n`;
      body += `- **Suggestion:** ${c.suggestion}\n\n`;
    });
  }

  body += `---\n*[View full review on CodeLens](${dashboardUrl}) · Powered by CodeLens AI*`;

  await octokit.rest.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: pull_request.number,
    body,
  });

  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
  console.log("[DONE] review posted ✓");
}