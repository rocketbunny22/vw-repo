# Volkswagen Repo Fix Plan — Handoff to Sol

## Objective

Stabilize data integrity and security first, then improve resilience, validation, performance, and UX. Preserve existing product behavior unless a finding explicitly contradicts the current UI or documentation.

## Working rules

- Inspect the current worktree before editing; preserve existing uncommitted changes.
- Read the relevant Next.js 16 local documentation before changing routes, caching, headers, or build configuration.
- Do not expose `.env` contents or secrets in logs, commits, or reports.
- Use `apply_patch` for edits.
- Run `npm run lint`, `npm run build`, and focused regression tests after each meaningful group.
- Add automated tests for every critical/high-risk regression fixed.

## Phase 0 — Baseline and test harness

1. Record the current `git status`, lint/build results, and dependency audit output.
2. Add a test setup appropriate for this project (route-handler/integration tests are preferred; do not weaken production code just to test it).
3. Create fixtures for approved/pending PDFs, concurrent mutations, account deletion, password resets, and malformed inputs.

Acceptance: tests run from a documented command and baseline behavior is captured without modifying existing user changes.

## Phase 1 — Critical data-integrity fixes

### 1.1 Prevent search backfill data loss

Files: [`src/app/api/search/route.ts`](src/app/api/search/route.ts), [`src/lib/pdfBackfill.ts`](src/lib/pdfBackfill.ts), [`src/data/pdfs.ts`](src/data/pdfs.ts).

- Backfill against the complete canonical PDF collection, not a filtered approved-only subset.
- Ensure saving merges updated search text into the current canonical records.
- Make the operation safe when no Redis data exists and preserve pending/unapproved records.
- Add a regression test proving a search cannot delete pending PDFs.

Acceptance: searching after seeding approved and pending PDFs leaves both records intact and updates only the extracted text.

### 1.2 Replace whole-array Redis read/modify/write mutations

Files: [`src/lib/redis.ts`](src/lib/redis.ts), data modules under [`src/data`](src/data), and all mutation route handlers.

- Choose one consistent strategy: per-record Redis keys plus indexed IDs, or optimistic versioning/transactions with retries.
- Use atomic counters for download counts.
- Prevent concurrent signup, comments, bookmarks, moderation, guide/PDF updates, and role changes from losing writes.
- Add concurrency tests for representative records and document the key schema/migration plan.

Acceptance: parallel mutations preserve every independent update; stale writes are rejected or merged rather than silently replacing newer data.

### 1.3 Make account deletion complete and auditable

Files: [`src/app/api/auth/route.ts`](src/app/api/auth/route.ts), profile UI, and all user-owned data modules.

- Define which records are deleted, anonymized, or retained for moderation/legal reasons.
- Cascade or anonymize guides, PDFs, comments, feedback, bookmarks, vehicle/onboarding data, and reset tokens as intended.
- Invalidate sessions and remove personal identifiers from retained public content where required.
- Add an idempotent deletion test.

Acceptance: the API behavior matches the profile confirmation and privacy-policy wording; repeated deletion requests are safe.

## Phase 2 — Authentication and abuse prevention

Files: [`src/app/api/auth/route.ts`](src/app/api/auth/route.ts), [`src/lib/auth.ts`](src/lib/auth.ts), Redis helpers.

- Never log reset tokens, API keys, or token fragments.
- Store reset-token hashes with expiry; remove consumed/expired entries.
- Make reset issuance and consumption atomic and single-use.
- Implement distributed rate limiting with Redis and avoid clearing the counter on failed/unknown-email requests.
- Encode reset tokens with `encodeURIComponent` (or use a URL-safe encoding).
- Add server-side password policy, email/username validation, normalization, and case-insensitive uniqueness checks.
- Add request-body schema validation with bounded lengths and explicit types.

Acceptance: secrets never appear in logs; a reset token works once only, expires, is URL-safe, and rate limits hold across processes.

## Phase 3 — PDF upload and serving hardening

Files: [`src/app/api/pdfs/route.ts`](src/app/api/pdfs/route.ts), [`src/app/api/pdfs/[filename]/route.ts`](src/app/api/pdfs/[filename]/route.ts), [`src/data/pdfs.ts`](src/data/pdfs.ts).

- Validate PDF magic bytes and enforce server-side size limits.
- Validate, deduplicate, and cap generation/system inputs against the static taxonomy.
- Store one file blob per upload and reference it from generation metadata; do not multiply base64 storage per generation.
- Make metadata/blob creation transactional or add cleanup for partial failures.
- Deny serving files without valid approved metadata; safely validate filenames and avoid collisions.
- Move download-count updates off the full metadata-array path and keep GET response behavior cache-safe.
- Preserve the documented public-file fallback when Redis is unavailable.
- Add tests for unapproved, missing-metadata, malformed, duplicate, oversized, and concurrent uploads.

Acceptance: unapproved or orphaned files are never public; storage growth is bounded; valid legacy public PDFs still serve during Redis outage.

## Phase 4 — Input validation and abuse controls

Files: feedback, guides, comments, bookmarks, vehicle, onboarding, search, and related route handlers.

- Add shared schemas for JSON bodies and query parameters.
- Enforce length, count, enum, and nested-object limits server-side.
- Add authenticated/user/IP rate limits where appropriate, especially feedback, comments, reports, guide/PDF submissions, and search/backfill.
- Avoid logging untrusted content; redact or omit message bodies.
- Keep public responses minimal (for example, do not expose moderation fields unnecessarily).

Acceptance: malformed and oversized requests return consistent 4xx responses without persisting corrupt data or causing 500s.

## Phase 5 — Resilience, security headers, and performance

- Add an application error boundary for Redis-dependent pages and intentional outage states.
- Configure CSP and appropriate `X-Content-Type-Options`, `Referrer-Policy`, frame, permissions, and HSTS headers after checking deployment constraints; remove or justify `X-Powered-By`.
- Avoid making the entire app dynamic solely to read locale headers; use the narrowest dynamic boundary compatible with Next 16.
- Eliminate duplicate auth/vehicle/bookmark fetches and N+1 bookmark requests.
- Review duplicate legacy routes and add redirects/canonical consistency.

Acceptance: outage pages are user-facing and non-stack-trace; headers are present in production responses; representative pages make bounded backend requests.

## Phase 6 — Content, localization, and accessibility

- Correct or reconcile the English VR6 timing-chain guide with the Spanish content; have the content owner approve the final repair guidance.
- Replace DOM-wide Spanish text mutation with server/client locale-aware rendering where practical.
- Preserve query strings and hashes in locale switching.
- Add proper label/input associations, dialog semantics, focus handling, escape behavior, and accessible names.
- Verify Tailwind v4 overlay opacity utilities in rendered output and replace unsupported classes.
- Handle malformed URL decoding without returning avoidable 500s.

Acceptance: English and Spanish technical content agrees; locale changes preserve navigation state; automated accessibility checks and manual keyboard checks pass.

## Phase 7 — Dependencies, repository hygiene, and release

- Upgrade Next.js and `eslint-config-next` to a security-fixed compatible release after reviewing breaking changes.
- Refresh vulnerable transitive dependencies (`nanoid`, `postcss`, `sharp`, `uuid`) through lockfile updates and retest.
- Remove unused `@vercel/kv` and other dead code only after confirming no runtime imports.
- Add CI for lint, build, tests, and dependency auditing.
- Review tracked [`feedback.json`](feedback.json) for real personal data; remove/redact it and clean history if necessary.

Acceptance: audit has no unresolved high-severity production findings or each exception is documented; CI is green; release notes include migrations and rollback steps.

## Suggested execution order

1. Phase 0 baseline/tests
2. Phase 1.1 search data-loss fix
3. Phase 1.2 Redis concurrency model
4. Phase 1.3 deletion semantics
5. Phase 2 authentication/reset hardening
6. Phase 3 PDF hardening
7. Phase 4 validation/rate limits
8. Phase 5 resilience/security/performance
9. Phase 6 content/localization/accessibility
10. Phase 7 dependency and release work

## Handoff checklist

- [ ] No secrets or environment-file contents included in commits or logs
- [ ] Existing dirty worktree changes preserved
- [ ] Critical/high regression tests added and passing
- [ ] `npm run lint` passing without new warnings
- [ ] `npm run build` passing
- [ ] Dependency audit rerun after lockfile updates
- [ ] Migration/rollback notes written for Redis key-schema changes
- [ ] Final report lists changed files, residual risks, and deployment checks
