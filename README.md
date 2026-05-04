# CodeLens

> AI-powered code review that sees everything.

CodeLens is a production-ready GitHub App that automatically reviews every pull request using GPT-4o — catching bugs, security vulnerabilities, and architecture issues before they merge. Multi-tenant, auth-protected, and built for real teams.

---

## Features

- **Instant AI reviews** — every PR gets reviewed in under 30 seconds
- **Language-aware** — detects TypeScript, Python, SQL, and more for context-specific feedback
- **4 issue categories** — Security 🔒, Bugs 🐛, Performance ⚡, Quality ✨
- **GitHub status checks** — blocks merges on high severity issues
- **Severity + confidence scoring** — Low, Medium, High with AI confidence level
- **Re-review** — trigger a fresh AI review on any PR from the dashboard
- **Multi-tenant** — each user sees only their own repos and reviews
- **Auth** — GitHub OAuth + email/password sign in
- **Onboarding flow** — guided setup from register → install → first review
- **Live dashboard** — track all reviews, trends chart, severity stats
- **Email alerts** — get notified on high severity issues
- **Rate limiting** — API protection built in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| AI | OpenAI GPT-4o-mini |
| Auth | NextAuth.js v4 (GitHub OAuth + Credentials) |
| GitHub | Octokit + GitHub Apps API |
| Email | Nodemailer |
| Hosting | Railway |

---

## How It Works

```
User registers / signs in
       ↓
Installs CodeLens GitHub App on their repos
       ↓
GitHub links installationId → userId via callback
       ↓
Developer opens a PR
       ↓
GitHub sends webhook to CodeLens
       ↓
CodeLens fetches the diff via GitHub API
       ↓
GPT-4o reviews the diff (language-aware prompt)
       ↓
Structured JSON: summary, severity, confidence, comments
       ↓
Review saved to Postgres (scoped to userId)
       ↓
Posted as PR comment + GitHub status check updated
       ↓
Email alert sent if high severity
       ↓
Full review visible on user's CodeLens dashboard
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (or Docker)
- OpenAI API key
- GitHub account

### 1. Clone the repo

```bash
git clone https://github.com/iamgaurav07/codelens.git
cd codelens
npm install
```

### 2. Create a GitHub App

1. Go to [github.com/settings/apps/new](https://github.com/settings/apps/new)
2. Set permissions:
   - **Pull requests** → Read & Write
   - **Contents** → Read only
   - **Checks** → Read & Write
   - **Metadata** → Read only
3. Subscribe to **Pull request** events
4. Set **Setup URL** to `https://your-domain.com/api/github/callback`
5. Generate and download a private key

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codelens

# Auth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional)
EMAIL_FROM=noreply@codelens.dev
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
```

### 4. Set up the database

```bash
# with Docker:
docker run --name codelens-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=codelens \
  -p 5432:5432 -d postgres:15

# run migrations:
npx dotenv-cli -e .env.local -- npx drizzle-kit push
```

### 5. Start the webhook tunnel (development)

```bash
npx smee -u https://smee.io/your-channel -t http://localhost:3000/api/webhook/github
```

### 6. Run the app

```bash
npm run dev
```

### 7. Install the GitHub App

Go to `http://localhost:3000/register` → create account → follow the onboarding flow.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Landing page (auth-aware)
│   ├── login/page.tsx                # Sign in
│   ├── register/page.tsx             # Sign up
│   ├── onboarding/page.tsx           # New user onboarding
│   ├── dashboard/page.tsx            # Reviews dashboard
│   ├── review/[id]/page.tsx          # Review detail
│   ├── settings/page.tsx             # Repo settings
│   ├── profile/page.tsx              # User profile
│   ├── not-found.tsx                 # 404 page
│   ├── error.tsx                     # 500 page
│   └── api/
│       ├── auth/[...nextauth]/       # NextAuth handler
│       ├── webhook/github/           # GitHub webhook receiver
│       ├── github/callback/          # GitHub App install callback
│       ├── register/                 # User registration
│       ├── reviews/                  # Reviews API (list + detail)
│       ├── repositories/             # Repositories API
│       ├── rereview/                 # Re-review trigger
│       └── profile/                  # Profile update
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── db/
│   │   ├── index.ts                  # Database client
│   │   └── schema.ts                 # Drizzle schema
│   ├── github/
│   │   ├── handler.ts                # PR handler + AI review engine
│   │   └── verify.ts                 # Webhook signature verification
│   ├── email.ts                      # Email notifications
│   └── ratelimit.ts                  # In-memory rate limiting
├── components/
│   └── skeleton.tsx                  # Loading skeleton components
├── types/
│   └── next-auth.d.ts               # NextAuth type extensions
└── middleware.ts                     # Route protection
```

---

## Database Schema

```
users               — auth accounts
accounts            — OAuth provider links
sessions            — user sessions
verification_tokens — email verification
installations       — GitHub App install → userId mapping
repositories        — connected repos (scoped to userId)
reviews             — AI reviews (scoped to userId)
review_comments     — individual review issues
```

---

## Deployment (Railway)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add PostgreSQL service
4. Set environment variables (use `GITHUB_APP_PRIVATE_KEY` instead of file path)
5. Run migrations: `DATABASE_URL=xxx npx drizzle-kit push`
6. Update GitHub App webhook URL to production URL
7. Update GitHub App Setup URL to production URL

---

## What CodeLens Reviews

| Category | Examples |
|---|---|
| 🔒 Security | Hardcoded secrets, SQL injection, XSS, CSRF, insecure auth |
| 🐛 Bugs | Null errors, off-by-one, async misuse, type mismatches |
| ⚡ Performance | N+1 queries, missing indexes, memory leaks, re-renders |
| ✨ Quality | Dead code, missing error handling, poor naming, complexity |

---

## Environment Variables

| Variable | Description |
|---|---|
| `GITHUB_APP_ID` | Your GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY_PATH` | Path to .pem (local dev) |
| `GITHUB_APP_PRIVATE_KEY` | Full PEM contents (production) |
| `GITHUB_WEBHOOK_SECRET` | Webhook secret from GitHub App |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | Full URL of your app |
| `NEXT_PUBLIC_APP_URL` | Public URL (used in PR comments) |

---

## Built By

**Gaurav Kumar** — Full Stack Engineer, Berlin
- GitHub: [@iamgaurav07](https://github.com/iamgaurav07)
- Portfolio: [AgentFlow](https://agent-platform-production-6865.up.railway.app) · [PulseVC](https://pulsevc-frontend.onrender.com) 

---

## License

MIT