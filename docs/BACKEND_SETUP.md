# Backend Setup Guide

This guide covers running the GuardRail API locally for development. The main [RUN-THIS.md](../RUN-THIS.md) assumes the API is already running on EC2 — this doc fills in the gap for anyone who wants to run or modify the backend itself.

## Project Structure

```
api/
├── server.js                 # Express app entrypoint
├── routes/                   # Route handlers, mounted under /api/*
│   ├── auth.js
│   ├── scan.js
│   ├── result.js
│   ├── fix.js
│   ├── session.js
│   ├── logs.js
│   ├── demo.js
│   └── webhook.js
├── services/                 # Business logic (AI calls, storage, orchestration)
│   ├── security-orchestrator.js
│   ├── patch-generator.js
│   ├── bedrock-client.js     # Despite the name, this calls the Groq SDK, not AWS Bedrock
│   ├── s3-storage.js
│   ├── session-manager.js
│   ├── event-logger.js
│   ├── secret-lifecycle-manager.js
│   ├── github-client.js
│   ├── notifier.js
│   └── user-service.js
├── middleware/
│   ├── auth.js
│   ├── permissions.js
│   └── validation.js
├── .env.example
└── Dockerfile
```

Routes stay thin and delegate to `services/`. `security-orchestrator.js` is the core pipeline that ties scanning, patch generation, and storage together.

## Prerequisites

- Node.js 18.x (matches `api/Dockerfile`, which uses `node:18-alpine`)
- npm
- A [Groq API key](https://console.groq.com) — free tier is enough for local dev
- Optional: AWS credentials (only needed for endpoints that persist sessions — see [Running without AWS](#running-without-aws) below)
- Optional: Docker, if you'd rather not install Node locally

## Installing Dependencies

```bash
cd api
npm install
```

## Environment Variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Minimum required to boot the server and hit `/health` and `/api/scan`:

| Variable | Purpose |
|---|---|
| `PORT` | Defaults to `3001` if unset |
| `FRONTEND_URL` | Used for CORS; set to `http://localhost:3000` for local frontend dev |
| `GROQ_API_KEY` | Required — used by `bedrock-client.js` and `patch-generator.js` for vulnerability detection and patch generation |

Everything else in `.env.example` (AWS keys, DynamoDB/S3 table names, SES, Slack webhook, JWT secret) is only needed once you're exercising the corresponding feature. See [Running without AWS](#running-without-aws).

## Running the Server Locally

**Option A — Node directly:**

```bash
cd api
npm run dev      # nodemon, auto-restarts on file changes
# or
npm start        # plain node, no auto-restart
```

Server starts on `http://localhost:3001`.

**Option B — Docker Compose (runs both API and frontend):**

```bash
docker-compose up
```

This builds `api/Dockerfile` and `web/`, wiring `NEXT_PUBLIC_API_URL` to point the frontend at the local API automatically. Useful if you want both sides running without touching two terminals.

## Testing API Endpoints

Once the server is up:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{ "status": "healthy", "timestamp": "...", "version": "1.0.0" }
```

For the full endpoint list, request/response shapes, and sample `curl` commands for `/api/scan`, `/api/fix/:sessionId`, `/api/result/:sessionId`, etc., see [`docs/API.md`](./API.md) — no need to duplicate that here.

## Connecting the Frontend Locally

In `web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then:

```bash
cd web
npm install
npm run dev
```

Frontend runs at `http://localhost:3000` and will talk to your local API instead of the EC2 instance.

## Running Without AWS

You don't need real AWS credentials just to boot the server or hit `/health` — the AWS SDK clients in `s3-storage.js` and `session-manager.js` are constructed at startup regardless of whether credentials are valid, so the process won't crash on launch.

However, any route that persists or reads session data — `/api/scan`, `/api/result/:sessionId`, `/api/fix/:sessionId` — will throw at runtime without working AWS credentials, since they call S3 and DynamoDB directly. There's currently no local/mock storage fallback.

If you're only working on logic that doesn't touch storage (e.g. patch formatting, validation middleware, route-level changes), you can leave the AWS variables as placeholders and expect storage-dependent calls to fail — that's expected, not a sign your setup is broken.

If you need to fully exercise the scan → result → fix flow locally, you'll need:
- An AWS account with S3, DynamoDB, and CloudWatch access
- A DynamoDB table matching `DYNAMODB_TABLE` (default `GuardRailSessions`)
- An S3 bucket matching `S3_BUCKET` (default `guardrail-sessions`)

## Troubleshooting

**Server starts but `/api/scan` returns a 500.**
Check `GROQ_API_KEY` is set and valid, and (if you're past the health check) that your AWS credentials/resources exist — see above.

**CORS errors from the frontend.**
Confirm `FRONTEND_URL` in `api/.env` matches the origin your frontend is actually running on (`http://localhost:3000` by default).

**Rate limit errors during testing.**
The API rate-limits at `RATE_LIMIT` requests/hour per IP (default 50). Bump it in `.env` for local testing if you're hitting endpoints repeatedly.

**Webhook route behaves differently from other routes.**
`/api/webhook` is mounted with `express.raw()` instead of `express.json()` (see `server.js`), because GitHub webhook signature verification needs the raw request body. If you're testing it locally, send raw JSON, not a parsed object.
