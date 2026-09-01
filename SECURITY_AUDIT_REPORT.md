# Security Audit Report

> Historical snapshot: this report records the pre-remediation findings that produced `SOL_HANDOFF_PLAN.md`. The September 1 implementation now uses an atomic Lua value/version snapshot plus compare-and-set writes, distributed TTL rate limits, opaque single-use reset tokens, bounded request validation, one-blob PDF uploads, atomic download counters, security headers, patched dependencies, and regression tests. `npm audit` currently reports zero vulnerabilities; lint, tests, production build, and local HTTP smoke checks pass. Finding text below is retained as discovery evidence and should not be read as current status.

**Project:** VW Repo  
**Audit date:** September 1, 2026  
**Final reconciled snapshot:** 10:53 EDT; parallel remediation was active during the audit  
**Scope:** Current working tree, including uncommitted Redis-refactor changes  
**Stack:** Next.js 16.2.4, React 19.2.4, Upstash Redis, custom cookie authentication

## Executive summary

The application has sound basic password hashing, signed-session, and server-side admin-authorization controls. However, it contains high-risk data-integrity and availability vulnerabilities caused by destructive search backfill behavior, ineffective rate limiting, non-atomic whole-collection Redis writes, and unrestricted storage/CPU-intensive endpoints.

The audit initially identified:

- **6 high-severity findings**
- **6 medium-severity findings**
- **3 low-severity findings**
- **4 security/release observations**

VWR-001 was reproduced against a local Redis-compatible test service: a public search removed the pending PDF record from the canonical collection. Parallel remediation work changed several files after discovery. At this report's final snapshot, VWR-001 and VWR-008 are remediated but need regression tests, and VWR-005 has been reduced from High to Medium by partial mitigation. Four high-severity findings remain open.

## Severity model

- **High:** remotely triggerable loss of data, loss of authorization integrity, credential attack, major resource exhaustion, or a vendor-rated high-risk production dependency.
- **Medium:** meaningful security or privacy impact requiring additional conditions, authentication, partial failure, or operational access.
- **Low:** limited-impact disclosure or missing defense-in-depth with a constrained attack path.

## Findings

### VWR-001 — Public search can delete pending PDF records

**Severity:** High  
**Status:** Remediated in the working tree during this audit; focused unit regression passes, route-level integration test still recommended  
**Category:** Improper access control / unintended persistent state mutation  
**Originally affected code:** `src/app/api/search/route.ts:45`, `src/lib/pdfBackfill.ts:83-105`

**Description**

The unauthenticated search endpoint loaded every PDF, filtered out pending PDFs, and passed only approved records to `ensurePdfSearchText()`. If an approved PDF lacked extracted search text, the helper called `saveAllPdfs(pdfs)` with the filtered list. The filtered list was therefore written back as the complete canonical `pdfs` collection.

**Exploit scenario**

An unauthenticated visitor performs a search while at least one approved PDF requires text extraction. The request backfills that PDF and replaces the Redis collection with approved records only. Every pending PDF metadata record disappears.

**Impact**

- Loss of pending-upload metadata
- Broken moderation workflow
- Orphaned PDF blobs remaining in Redis
- Publicly triggerable persistent data modification through a GET endpoint

**Evidence**

This behavior was reproduced locally by seeding one approved and one pending PDF, issuing `GET /api/search?q=engine`, and reading the collection afterward. Only the approved PDF remained.

**Remediation status**

- The current helper builds search-text patches and merges them into the latest canonical collection instead of saving the approved-only input list.
- The public search path still performs expensive persistent backfill; VWR-013 remains open.
- A focused merge regression now proves pending records survive. Add a route/Redis integration test before considering the fix release-ready.
- Do not perform bulk persistent mutation from the public search request. Run backfill during upload, approval, or an authenticated maintenance job.

---

### VWR-002 — Authentication rate limiting is logically ineffective

**Severity:** High  
**Category:** CWE-307 — Improper Restriction of Excessive Authentication Attempts  
**Affected code:** `src/app/api/auth/route.ts:51-92`, `src/app/api/auth/route.ts:135-204`, `src/app/api/auth/route.ts:307-329`

**Description**

`checkRateLimit()` resets an existing unlocked entry whenever `now > (entry.lockedUntil || 0)`. For every normal entry without `lockedUntil`, this evaluates to `now > 0`, which is always true. Every request is consequently treated as the first attempt. Successful signup/login and every password-reset request also explicitly clear their keys.

Even after correcting the logic, the `Map` is process-local, unbounded, and not shared across serverless instances.

**Exploit scenario**

An attacker sends unlimited login attempts against a known email or sends unlimited signup requests with unique identities. Login executes bcrypt comparisons and signup executes cost-12 bcrypt hashes, allowing both password guessing and CPU exhaustion. Repeated signups also expand the entire Redis user array.

**Impact**

- Online password brute forcing
- CPU denial of service through bcrypt
- Account/storage spam
- Password-reset email spam
- Memory growth from attacker-controlled rate-limit keys

**Remediation**

- Replace the in-memory limiter with atomic Redis counters with TTLs.
- Rate-limit by normalized account identifier and client/IP signal.
- Use different policies for login, signup, and reset issuance.
- Do not clear failed-attempt counters. Reset or reduce login counters only after successful authentication.
- Add tests for the threshold, expiry, lockout, multiple application instances, and identifier case variants.

---

### VWR-003 — Non-atomic Redis writes permit lost updates and authorization rollback

**Severity:** High  
**Category:** CWE-362 — Concurrent Execution Using Shared Resource with Improper Synchronization  
**Affected code:** `src/data/users.ts`, `src/data/pdfs.ts`, `src/data/guides.ts`, `src/data/moderation.ts`, `src/lib/redis.ts:56-81`, and routes still calling the corresponding `save*()` functions

**Description**

Mutable entities are stored as whole JSON arrays. At the final snapshot, auth, admin, comments, feedback, and guide routes still load an array, mutate a local copy, and overwrite the entire key through `saveUsers()`, `saveAllPdfs()`, `saveUserGuides()`, `saveComments()`, or `saveFeedback()`. PDF upload/backfill and user bookmark/checklist/onboarding/vehicle routes had been moved to the new mutation helper.

Parallel work added `mutateJsonValue()` and collection-specific wrappers, but only PDF backfill currently uses one. The helper also obtains the JSON value and version through two independent concurrent Redis reads. A writer can commit between those reads, producing an old-value/new-version pair; the subsequent compare-and-swap can then succeed while replacing the newer data. The value and version snapshot must be read atomically.

**Exploit scenario**

Two requests read the same users array. An administrator demotes or deletes an account while an already-running profile, bookmark, or vehicle request retains the old array. The second request then saves its stale copy and can restore the old role or deleted account. Similar races lose signups, comments, uploads, approvals, reports, and download counts.

**Impact**

- Role revocation can be undone
- Deleted accounts can reappear
- Password/session-version changes can be overwritten
- Moderation decisions and user content can be lost
- Data corruption under ordinary concurrent traffic

**Remediation**

- Store mutable entities under per-record keys and use indexed sets for lookup.
- Use Redis atomic commands for counters and set membership.
- Use transactions or optimistic locking for multi-record changes.
- Ensure role, password, session-version, and deletion operations cannot be overwritten by unrelated profile mutations.
- Add deterministic concurrency tests for role revocation, deletion, signup, comments, and bookmarks.

---

### VWR-004 — Public feedback endpoint enables persistent storage and admin-dashboard denial of service

**Severity:** High  
**Category:** CWE-400 — Uncontrolled Resource Consumption  
**Affected code:** `src/app/api/feedback/route.ts:8-37`, `src/data/moderation.ts:13-19`

**Description**

The unauthenticated endpoint has no rate limit and accepts untyped, unbounded `name`, `email`, `category`, and `message` values. It appends each submission to a whole Redis array and writes the expanding collection on every request.

The record is persisted before `message.substring()` is called. A non-string message can therefore be stored successfully and then trigger a 500 response. Malformed stored values can subsequently break administrative rendering or processing.

**Exploit scenario**

An attacker repeatedly submits large messages or submits an object as `message`. This grows Redis storage and write bandwidth, increases the cost of every moderation read/write, and can persist a malformed record even though the route returns an error.

**Impact**

- Redis quota/cost exhaustion
- Increasing request latency and bandwidth
- Persistent moderation/dashboard disruption
- Log injection/noise from untrusted submitted values

**Remediation**

- Validate the body before constructing or saving a record.
- Require strings, enforce strict length limits, and restrict category to an enum.
- Apply distributed rate limiting and bot protection.
- Store feedback per record and paginate moderation queries.
- Do not log submitted message content.

---

### VWR-005 — PDF upload permits request, CPU, and storage amplification

**Severity:** Medium (reduced from High during the audit)  
**Status:** Partially remediated; request parsing and cross-account resource controls remain open  
**Category:** CWE-400 — Uncontrolled Resource Consumption  
**Affected code:** `src/app/api/pdfs/route.ts:24-94`, `src/lib/pdfText.ts`

**Description**

The route calls `request.formData()` before enforcing the 10 MB file limit, so the application itself does not prevent an oversized multipart request from being parsed into memory. It then performs CPU-intensive PDF extraction synchronously.

The original implementation allowed an unbounded number of attacker-controlled `generation` fields and stored a separate base64 file for every entry. During the audit, parallel work capped selections, validated taxonomy values and PDF magic bytes, added a per-user Redis rate limit, generated UUID filenames, stored one shared blob, and added cleanup after metadata failure.

The remaining rate limit is per account. Because signup throttling is still ineffective, an attacker can create additional accounts to bypass it. Platform-level request-size enforcement was not found in the repository, and parsing still precedes the application size check.

**Exploit scenario**

An attacker creates accounts and repeatedly submits oversized multipart bodies or valid near-limit PDFs. The body is parsed before its application limit is checked, and every accepted PDF is synchronously extracted and stored. Account rotation bypasses the per-user quota until VWR-002 is fixed.

**Impact**

- Server memory and CPU exhaustion
- Function timeout and degraded availability
- Redis storage and pending-moderation growth through account rotation

**Remediation**

- Enforce request-body limits at the reverse proxy/platform and reject oversized bodies before multipart parsing.
- Preserve the newly added magic-byte, taxonomy, selection-cap, one-blob, UUID, and cleanup controls.
- Deduplicate generation selections.
- Queue extraction and apply combined per-user, client/IP, and global storage quotas.
- Fix account-creation throttling so per-account upload limits cannot be cheaply bypassed.

---

### VWR-006 — Production dependency tree contains known high-severity vulnerabilities

**Severity:** High (vendor rating)  
**Category:** CWE-1104 — Use of Unmaintained Third-Party Components  
**Affected code:** `package.json`, `package-lock.json`

**Description**

The September 1, 2026 `npm audit --omit=dev` result contains six vulnerable production dependency entries: three high and three moderate. Important installed versions are:

- `next@16.2.4`, with multiple denial-of-service, proxy-bypass, cache, XSS, and SSRF advisories
- `postcss@8.4.31`, nested under Next.js, with path/file-disclosure and XSS advisories
- `sharp@0.34.5`, nested under Next.js, with vulnerable libvips inheritance
- `resend@6.12.2` → `svix@1.90.0` → `uuid@10.0.0`

The audit identifies Next.js 16.3.4 as the available non-major fix. Resend also has an available update.

**Project-specific context**

Some advisory paths have reduced applicability: the project does not use Server Actions, proxy middleware is not the admin authorization boundary, and remote image sources are not enabled. This reduces exploitability for those individual advisories but does not remove the need to update the vulnerable runtime.

**Remediation**

- Upgrade `next` and `eslint-config-next` together to at least the current patched compatible version.
- Upgrade Resend so its Svix/UUID chain resolves to patched versions.
- Regenerate the lockfile, rerun the audit, and test proxy routing, PDF extraction, images, and production build output.
- Document any residual advisory that is accepted as non-applicable.

---

### VWR-007 — Password-reset credentials have an unsafe lifecycle

**Severity:** Medium  
**Category:** CWE-532 / CWE-312 / CWE-367  
**Affected code:** `src/app/api/auth/route.ts:20-48`, `src/app/api/auth/route.ts:94-100`, `src/app/api/auth/route.ts:307-365`, `src/lib/auth.ts:146-173`

**Description**

- When Resend is not configured, the complete reset token and email are written to application logs.
- Tokens are stored in plaintext in an ever-growing Redis array.
- Expired or used tokens are never removed.
- Token lookup, marking used, and password mutation are separate non-atomic operations.
- The raw base64 token is concatenated into the query string without URL encoding. Base64 `+` characters can be decoded as spaces by query parsing.

**Exploit scenario**

Anyone with log access can use a logged token during its validity window. Anyone with Redis read access can directly obtain active tokens. Two concurrent confirmations can both observe a token as unused and race to set different passwords. Certain tokens can also fail in transit because the URL is not safely encoded.

**Impact**

- Account takeover after log/storage disclosure
- Reset-token replay race
- Indefinite retention of credential material
- Redis growth and unreliable password reset

**Remediation**

- Never log reset tokens or API-key fragments.
- Generate a random URL-safe opaque token, store only its cryptographic hash, and assign a Redis TTL.
- Consume the token atomically before changing the password.
- Remove expired and used tokens automatically.
- Construct reset links with `URL`/`URLSearchParams` or encode the token.

---

### VWR-008 — Missing PDF metadata fails open for Redis-hosted blobs

**Severity:** Medium  
**Status:** Remediated in the working tree during this audit; regression test pending  
**Category:** CWE-862 — Missing Authorization  
**Originally affected code:** `src/app/api/pdfs/[filename]/route.ts:15-25`, `src/app/api/pdfs/route.ts:61-92`, `src/data/pdfs.ts:15-27`

**Description**

The file-serving endpoint originally rejected a file only when it found metadata explicitly marked `approved: false`. If metadata was missing, it still loaded `pdf:<filename>` from Redis and served the blob. Upload wrote blobs before saving metadata, so a timeout or metadata-write failure could create exactly this orphan state.

Legacy bundled files under `public/pdfs` intentionally require a fallback, but uploaded Redis blobs and trusted bundled files are not distinguished by the authorization check.

**Exploit scenario**

An upload partially succeeds: its blob is written, but the metadata collection is not. A requester who knows or guesses the generated filename can retrieve the unmoderated blob through the public endpoint.

**Impact**

- Moderation bypass under partial-failure conditions
- Public hosting of unreviewed or malicious content
- Orphaned Redis data

**Remediation status**

- The current serving route now requires an approved metadata record before reading a Redis blob.
- Upload now removes its blob when metadata commit fails.
- The Redis-outage branch separately serves only files physically present in the bundled `public/pdfs` directory.
- Add regression tests for missing metadata, pending metadata, failed metadata commit, and trusted legacy files.

---

### VWR-009 — Server-side schemas and size limits are missing across mutation APIs

**Severity:** Medium  
**Category:** CWE-20 — Improper Input Validation  
**Affected code:** `src/app/api/guides/route.ts:48-85`, `src/app/api/user/bookmarks/route.ts:53-74`, `src/app/api/user/onboarding/route.ts:33-44`, `src/app/api/user/vehicle/route.ts:25-42`, `src/app/api/admin/route.ts:65-166`

**Description**

TypeScript assertions do not validate runtime JSON. Several routes accept arbitrary types, lengths, enum values, array sizes, or nonexistent IDs. For example, guides accept unrestricted content and arbitrary `tools`/`parts` shapes, bookmarks accept arbitrary IDs, and vehicle fields are unbounded and not checked against known taxonomy.

A shared `src/lib/validation.ts` file was added during the audit. The PDF upload route now imports it, but the other affected mutation routes do not. Those requests remain unvalidated.

Because signup is open and throttling is broken, authentication is not a meaningful barrier to automated misuse.

**Exploit scenario**

An attacker submits very large nested guide values or malformed arrays. The record enlarges Redis and may later cause `.join()`, `.map()`, `.replace()`, or rendering failures in search/moderation after it is processed.

**Impact**

- Persistent malformed data
- Storage and response amplification
- Moderation/search 500 responses
- Broken user/profile records

**Remediation**

- Introduce shared runtime schemas for every request body and query.
- Enforce exact object shapes, string lengths, array counts, and allowed enums.
- Validate referenced entities before saving IDs.
- Reject unknown fields where practical and return consistent 400/422 errors.

---

### VWR-010 — Weak password and account-identifier policy enables identity confusion

**Severity:** Medium  
**Category:** CWE-521 / CWE-178  
**Affected code:** `src/app/api/auth/route.ts:135-172`, `src/app/api/auth/route.ts:236-268`, `src/app/users/[username]/page.tsx:34-68`

**Description**

Signup accepts any non-empty password; change/reset requires only six characters. Email and username formats and lengths are not validated or normalized. Uniqueness checks are case-sensitive, while public username lookup is case-insensitive.

**Exploit scenario**

Accounts named `Alice` and `alice` can both be created, but the case-insensitive public route resolves the first matching account. Content attribution links can lead to the wrong public identity. Weak passwords are also more susceptible to guessing, compounded by ineffective login throttling.

**Impact**

- Public-profile impersonation/confusion
- Unreachable or misattributed profiles
- Increased account-compromise risk
- Duplicate logical email identities

**Remediation**

- Canonicalize emails and usernames before lookup/storage.
- Enforce case-insensitive uniqueness atomically.
- Define allowed username characters and length.
- Require a modern minimum password length and reject known-compromised passwords if feasible.
- Apply the same policy to signup, change, and reset.

---

### VWR-011 — Account deletion leaves personal and authored records behind

**Severity:** Medium  
**Category:** Privacy/data-lifecycle failure  
**Affected code:** `src/app/api/auth/route.ts:222-234`, `src/app/api/admin/route.ts:82-96`, `src/app/profile/page.tsx:721-727`

**Description**

Self-service and administrative deletion remove only the user from the `users` array. Guides, PDFs, comments, feedback, reset tokens, author names, and other identifiers remain. The profile confirmation tells users their uploads and guides will be removed, so implemented behavior contradicts the product promise.

**Impact**

- Personal data retained after deletion
- Public authored content remains attributable to a deleted identity
- Reset and moderation records become orphaned
- Privacy-policy and user-expectation mismatch

**Remediation**

- Define a deletion/anonymization policy for every user-linked record.
- Perform the operation transactionally or as an idempotent background workflow.
- Invalidate sessions and delete active reset tokens immediately.
- Make UI/privacy wording match the implemented retention policy.

---

### VWR-012 — A personal feedback record is committed to repository history

**Severity:** Medium  
**Category:** CWE-359 — Exposure of Private Personal Information  
**Affected artifact:** `feedback.json`, first committed in `33b4efc`

**Description**

The tracked JSON file contains one feedback record with populated name and email fields, plus a message and timestamp. The audit did not reproduce these values in output. Moving runtime feedback to Redis did not remove the historical file.

**Impact**

Anyone with repository read access can view the record. Deleting the current file alone will not remove it from existing Git history or clones.

**Remediation**

- Confirm whether the record is synthetic.
- If it is real, remove the file from the current tree, ignore runtime exports, and rewrite shared repository history using an approved history-cleaning process.
- Treat already distributed clones as separately exposed and follow the applicable privacy response process.

---

### VWR-013 — Public search and downloads cause disproportionate persistent work

**Severity:** Low  
**Category:** CWE-400 — Uncontrolled Resource Consumption  
**Affected code:** `src/app/api/search/route.ts:30-65`, `src/lib/pdfBackfill.ts:83-103`, `src/app/api/pdfs/[filename]/route.ts:28-35`

**Description**

Search has no query-length or request-rate limit and scans all taxonomy, guide content, PDF metadata, and extracted text. It can also synchronously extract missing PDF text and persist patches. The original download path rewrote the complete PDF array; parallel work replaced that part with an atomic per-PDF counter.

**Impact**

- Redis bandwidth/write amplification
- CPU spikes during extraction/search
- Avoidable application cost under automated traffic

**Remediation**

- Remove extraction/backfill from public search.
- Limit query length and request frequency.
- Use a search index or bounded precomputed fields.
- Preserve the newly added atomic per-PDF download counter and ensure reporting reads that counter.

---

### VWR-014 — Cookie-authenticated mutations lack Origin/CSRF verification

**Severity:** Low  
**Category:** CWE-352 — Cross-Site Request Forgery  
**Affected code:** All cookie-authenticated POST/PUT/DELETE handlers

**Description**

The session cookie is `HttpOnly`, `Secure` in production, and explicitly `SameSite=Lax`, which blocks most traditional cross-site POST attacks. Mutation routes do not additionally validate `Origin`/`Sec-Fetch-Site` or require a CSRF token.

The residual attack surface is primarily same-site sibling origins, deployment configurations that alter cookie behavior, and future endpoint changes that accept simple cross-origin request formats.

**Impact**

Under those conditions, an attacker may cause an authenticated browser to submit unwanted profile, content, or account mutations.

**Remediation**

- Reject state-changing requests whose `Origin` is absent or not on an explicit allowlist, with intentional exceptions documented.
- Consider CSRF tokens for especially sensitive operations such as password, email, role, and deletion changes.
- Keep the cookie host-only, `Secure`, `HttpOnly`, and `SameSite=Lax` or stricter.
- Require recent password confirmation for account deletion and email/password changes.

---

### VWR-015 — Browser security headers are not configured by the application

**Severity:** Low  
**Category:** Security hardening / clickjacking and XSS impact reduction  
**Affected code:** `next.config.ts`

**Description**

No Content Security Policy, frame restriction, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` is configured. A local production response also exposed `X-Powered-By: Next.js`. The deployment edge may add headers, but that was outside this local audit.

**Impact**

- Increased impact if an injection flaw is introduced
- Clickjacking exposure where cookies are available
- MIME-sniffing and referrer-data risks
- Unnecessary framework fingerprinting

**Remediation**

- Add a tested CSP, preferably starting in report-only mode.
- Set `frame-ancestors` (or `X-Frame-Options` for legacy coverage), `nosniff`, a strict referrer policy, and a minimal permissions policy.
- Configure HSTS at the HTTPS edge after confirming all subdomains are ready.
- Disable `poweredByHeader`.

## Security and release observations

### OBS-001 — Minimal automated coverage and no CI security gate

Vitest, test scripts, and two focused unit tests were added during the audit. They cover optimistic retry behavior and preservation of pending PDFs during patch merging. No repository CI workflow was found, and critical behaviors such as the actual Redis snapshot/CAS operation, role revocation, reset-token single use, upload limits, and authorization remain untested.

### OBS-002 — Redis outage fallback was corrected during the audit

The original `getPdfFile()` flow threw on Redis outage before attempting its documented bundled-public-file fallback. Parallel work now catches Redis failure in the serving route and separately checks the trusted `public/pdfs` directory. Add an outage regression test.

### OBS-003 — Public comment API exposes internal moderation fields

`src/app/api/comments/route.ts:17-22` returns complete comment records, including `authorId`, `reported`, `reportedAt`, and `moderationStatus`. Return a dedicated public shape containing only fields the UI needs.

### OBS-004 — Public vehicle details need an explicit privacy decision

Public profile pages display generation, model, year, engine code, color, and nickname. This may be intended community functionality, but there is no per-field or profile-level visibility control. Confirm the product’s privacy expectation and make the public nature clear when users enter the data.

## Controls that were verified

- Passwords use bcrypt with cost 12.
- Session and reset signatures use HMAC-SHA-256 and timing-safe comparison.
- Session cookies are host-only by default, `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Current user role and `sessionVersion` are checked against Redis for every authenticated request.
- Admin API operations call server-side `authenticateAdminRequest()`; the UI is not the authorization boundary.
- Public PDF/guide list endpoints remove private fields from normal summaries.
- Submitted guide Markdown is rendered as escaped React text, and link schemes are allowlisted.
- JSON-LD serialization escapes `<`, preventing script-element termination.
- PDF filenames are checked with `path.basename()` before filesystem fallback, preventing the obvious path-traversal route.
- Environment files are ignored and no environment file is tracked.

## Validation performed

- `npm run lint` — passed with no errors and five warnings: four existing React hook-dependency warnings plus one unused-variable warning introduced by parallel vehicle-route work.
- `npm test` — 2 test files and 2 tests passed.
- `npm run build` — the final production build and TypeScript validation passed. An earlier run briefly overlapped incomplete parallel edits and was rerun after they settled.
- `npm audit --omit=dev --audit-level=low --json` — 6 production dependency findings: 3 high, 3 moderate.
- `git diff --check` — passed.
- Local production response-header inspection — confirmed missing application security headers and presence of `X-Powered-By`.
- Focused Redis-compatible reproduction — confirmed VWR-001 pending-PDF deletion.

## Remediation priority

1. Add and pass the VWR-001 regression test for the in-progress search-backfill fix.
2. Replace authentication throttling and protect bcrypt/signup paths (VWR-002).
3. Migrate security-sensitive mutations away from whole-array Redis writes and correct the non-atomic CAS snapshot (VWR-003).
4. Validate and rate-limit public feedback, and finish cross-account/platform upload controls (VWR-004, VWR-005).
5. Upgrade the vulnerable runtime/dependency tree (VWR-006).
6. Redesign reset-token storage and consumption (VWR-007).
7. Add and pass VWR-008 regression tests for the in-progress PDF fail-closed/cleanup fix.
8. Wire shared input schemas into every route, then address identifier normalization and deletion workflows (VWR-009 through VWR-012).
9. Add resource controls, CSRF defense-in-depth, security headers, and CI gates.

## Retest requirements

Before release, verify at minimum:

- Searching cannot delete or alter pending PDF metadata.
- Concurrent role revocation and profile updates cannot restore privileges.
- Concurrent signup/content operations preserve every committed record.
- Authentication limits work across application instances and identifier variants.
- A reset token is stored hashed, expires automatically, and succeeds exactly once.
- Oversized/malformed feedback, guide, profile, and upload requests fail before persistence.
- Orphaned and unapproved Redis PDF blobs are never publicly served.
- Dependency audit contains no unresolved high-severity production finding, or each exception has a written applicability decision.
- Production responses contain the agreed security headers.
