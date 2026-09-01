# VW Repo

VW Repo is a Next.js App Router application for Volkswagen repair manuals, technical PDFs, DIY guides, generation data, maintenance checklists, and user garage profiles.

## Local development

Requirements: Node.js 22 or newer, npm, and an Upstash Redis database.

1. Copy `.env.example` to `.env.local` and set every required value.
2. Install dependencies with `npm ci`.
3. Start the app with `npm run dev`.
4. Open <http://localhost:3000>.

Do not rotate `SESSION_SECRET` or `RESET_TOKEN_SECRET` during a routine deployment. Rotation intentionally invalidates sessions or outstanding reset links. Both values must contain at least 32 characters.

## Verification

Run the same checks used by CI:

```bash
npm audit --omit=dev
npm test
npm run lint
npm run build
```

## Storage and deployment

Mutable data is Redis-only and returns a structured `503 REDIS_UNAVAILABLE` response during outages. Static Volkswagen taxonomy and starter guides remain in `src/data`. Legacy checked-in PDFs under `public/pdfs` remain readable during a Redis outage.

Before deploying the concurrency changes, read [docs/redis-migration.md](docs/redis-migration.md). Account deletion behavior is documented in [docs/account-deletion.md](docs/account-deletion.md).

Deploy migrations and application code in the documented order, run a smoke test against authentication, upload moderation, search, and PDF serving, and retain the previous deployment for rollback. Do not roll back to an older writer while the current deployment is accepting writes; older writers do not advance Redis version keys and can reintroduce lost updates.
