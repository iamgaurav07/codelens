# CodeLens

> AI-powered code review that sees everything.

CodeLens is a GitHub App that automatically reviews every pull request using GPT-4o — catching bugs, security vulnerabilities, and architecture issues before they merge.

![CodeLens Dashboard](https://via.placeholder.com/1200x600/0A0A0F/6EE7B7?text=CodeLens+Dashboard)

---

## Features

- **Instant AI reviews** — every PR gets reviewed in under 30 seconds
- **Language-aware** — detects TypeScript, Python, SQL, and more for context-specific feedback
- **4 issue categories** — Security 🔒, Bugs 🐛, Performance ⚡, Quality ✨
- **GitHub status checks** — blocks merges on high severity issues
- **Severity levels** — Low, Medium, High with confidence scoring
- **Live dashboard** — track all reviews, trends, and stats across repos
- **Re-review** — trigger a fresh AI review on any PR from the dashboard
- **Multi-repo** — install on as many repos as you want

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| AI | OpenAI GPT-4o-mini |
| GitHub | Octokit + GitHub Apps API |
| Hosting | Railway |

---

## How It Works

```
Developer opens PR
       ↓
GitHub sends webhook to CodeLens
       ↓
CodeLens fetches the diff via GitHub API
       ↓
GPT-4o reviews the diff (language-aware prompt)
       ↓
Structured JSON response: summary, severity, comments
       ↓
Review saved to Postgres + posted as PR comment
       ↓
GitHub status check updated (✅ or ❌)
       ↓
Full review visible on CodeLens dashboard
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
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
2. Set the following permissions:
   - **Pull requests** → Read & Write
   - **Contents** → Read only
   - **Checks** → Read & Write
   - **Metadata** → Read only
3. Subscribe to **Pull request** events
4. Generate and download a private key

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
GITHUB_CLIENT_ID=your_client_id

# OpenAI
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/codelens

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the database

```bash
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

Go to `https://github.com/apps/your-app-name` and install it on your repos.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Reviews dashboard
│   ├── review/[id]/page.tsx        # Review detail
│   ├── settings/page.tsx           # Repo settings
│   └── api/
│       ├── webhook/github/route.ts # GitHub webhook handler
│       ├── reviews/route.ts        # Reviews API
│       ├── reviews/[id]/route.ts   # Review detail API
│       ├── repositories/route.ts   # Repositories API
│       └── rereview/route.ts       # Re-review trigger
├── lib/
│   ├── github/
│   │   ├── handler.ts              # PR handler + AI review
│   │   └── verify.ts               # Webhook signature verification
│   └── db/
│       ├── index.ts                # Database client
│       └── schema.ts               # Drizzle schema
```

---

## Deployment (Railway)

1. Push to GitHub
2. Create a new Railway project → deploy from GitHub repo
3. Add a PostgreSQL service
4. Set all environment variables in Railway dashboard
5. Update `NEXT_PUBLIC_APP_URL` to your Railway URL
6. Update GitHub App webhook URL to your Railway URL

---

## What CodeLens Reviews

### Security
- Hardcoded secrets, API keys, passwords
- SQL injection, XSS, CSRF vulnerabilities
- Insecure authentication or authorization
- Sensitive data exposure

### Bugs & Logic
- Null/undefined errors, off-by-one errors
- Incorrect conditionals or edge cases
- Async/await misuse, unhandled promises

### Performance
- N+1 queries, missing database indexes
- Unnecessary re-renders in React
- Memory leaks, inefficient loops

### Code Quality
- Dead code, unused imports
- Missing error handling
- Poor naming conventions

---

## Environment Variables

| Variable | Description |
|---|---|
| `GITHUB_APP_ID` | Your GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY_PATH` | Path to your .pem private key |
| `GITHUB_WEBHOOK_SECRET` | Webhook secret from GitHub App settings |
| `OPENAI_API_KEY` | OpenAI API key |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Public URL of your deployed app |

---

## Built By

**Gaurav Kumar** — Full Stack Engineer, Berlin
- GitHub: [@iamgaurav07](https://github.com/iamgaurav07)
- Live: [agent-platform-production-6865.up.railway.app](https://agent-platform-production-6865.up.railway.app)

---

## License

MIT