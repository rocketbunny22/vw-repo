# SOL handoff implementation report

Implemented September 1, 2026 against `SOL_HANDOFF_PLAN.md`.

## Completed engineering work

- Added an automated Vitest suite covering concurrent optimistic updates, PDF backfill preservation, account-deletion retention/idempotence, opaque reset-token properties, identity/password validation, and PDF signature validation.
- Replaced stale whole-array writes with an atomic Lua value/version snapshot and compare-and-set retry loop across users, PDFs, guides, comments, feedback, moderation, and private user data.
- Removed persistent mutation from public search. PDF text backfill now applies field-level patches to the latest canonical list and remains an admin maintenance action.
- Added atomic PDF download counters and one UUID-named blob per multi-generation upload.
- Made account deletion explicit and auditable: private state and pending submissions are removed, retained public content is anonymized, reset tokens are revoked, unreferenced blobs are cleaned, and audit history is bounded.
- Rebuilt password reset around URL-safe opaque tokens, HMAC digests, Redis TTLs, and atomic get/delete consumption. Reset credentials and API-key fragments are no longer logged.
- Added distributed Redis rate limits to authentication, reset, feedback, comments, guide submission, and PDF upload flows.
- Added bounded JSON parsing, field schemas, taxonomy checks, enum checks, PDF MIME/signature/size checks, selection caps, UUID IDs, and shared validation helpers.
- Added structured Redis outage responses and user-facing service-unavailable states to representative authenticated workflows.
- Added global error boundaries, CSP/HSTS and defense-in-depth headers, a canonical legacy-route redirect, preserved query/hash state in language switching, mounted shared auth state, and improved keyboard/modal navigation.
- Upgraded Next.js and related runtime packages, removed unused `@vercel/kv`, removed the tracked feedback export, eliminated the Google Fonts build-time request, and added CI plus migration/deployment documentation.

## Release verification

- `npm audit` and `npm audit --omit=dev`: zero vulnerabilities
- `npm test`: all tests pass
- `npm run lint`: clean
- `npx tsc --noEmit`: clean
- `npm run build`: production build passes
- Local production HTTP smoke tests: homepage `200`, auth endpoint `200`, security headers present, and legacy route returns `308` to the canonical URL with generation query preserved

## Editorial follow-up requiring owner review

Phase 6's technical-content audit is not an automated code migration. The static data contains claims that should be checked against approved workshop literature before publication, including the Mk3 VR6 “timing belt” guide and generation-level brake/suspension specifications. The content owner should approve corrections and source references before those repair instructions are rewritten.

The current Spanish experience still uses `SpanishClientLocalization` for shared English workflow pages. Native Spanish generation, system, guide, home, privacy, and terms routes remain. Replacing the shared-page DOM localization layer requires an editorially approved message catalog and a page-by-page Spanish UX review; removing it without that replacement would knowingly regress existing Spanish coverage.
