# VW Repo App Overview

This document captures the current shape of the webapp so future work can start from the actual implementation instead of the scaffold README.

## Stack

- Next.js 16.3.4 with the App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4 through `@tailwindcss/postcss`
- Upstash Redis for mutable app data
- Resend for password reset and admin email testing
- `pdf-parse`, `pdfjs-dist`, and `@napi-rs/canvas` for PDF text extraction

## Route Areas

Public browsing:

- `/`
- `/generation/[slug]`
- `/systems/[slug]`
- `/gen/[gen]/system/[sys]`
- `/guides`
- `/guides/[slug]`
- `/library`
- `/search`
- `/users/[username]`
- `/es-mx` and localized generation, system, guide, library, search, legal, and user-profile routes

Account and personalization:

- `/signup`
- `/login`
- `/reset-password`
- `/es-mx/restablecer-contrasena`
- `/profile`
- `/my-vw`
- `/bookmarks`

Contribution and admin:

- `/upload`
- `/submit-guide`
- `/feedback`
- `/admin`

API routes:

- `/api/auth`
- `/api/admin`
- `/api/comments`
- `/api/feedback`
- `/api/guides`
- `/api/pdfs`
- `/api/pdfs/[filename]`
- `/api/search`
- `/api/user/bookmarks`
- `/api/user/checklists`
- `/api/user/onboarding`
- `/api/user/vehicle`

## Data Sources

Static app data lives under `src/data`.

- `generations.ts`: Volkswagen generations and systems.
- `diyGuides.ts`: built-in guide content.
- `maintenanceChecklists.ts`: default checklist definitions.
- `guides.ts`: user guide storage helper.
- `pdfs.ts`: PDF metadata and PDF file storage helper.

Mutable runtime data requires Redis. Configure both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for development and production.
Copy `.env.example` to an ignored local env file and supply real credentials; never commit secrets.

| Key | Purpose |
| --- | --- |
| `users` | User accounts, password hashes, roles, garage profile, bookmarks, checklist progress, onboarding, profile links |
| `pdfs` | PDF metadata records |
| `pdf:<filename>` | PDF file bytes as base64 |
| `user_guides` | Submitted user guides |
| `comments` | Guide comments and report state |
| `feedback` | Submitted feedback and review state |
| `<collection>:version` | Optimistic-write version for mutable collection keys |
| `pdf:downloads:<id>` | Atomic PDF download counter |
| `reset_token:<digest>` | Hashed, single-use password reset record with a 15-minute TTL |
| `reset_tokens_by_email:<digest>` | Expiring reset-token revocation index used by account deletion |
| `rate_limit:<scope>` | Distributed request counter with a TTL |

`src/lib/redis.ts` owns the shared Upstash client and converts missing configuration or failed Redis operations into a typed availability error. Redis-dependent API routes return HTTP `503`, a `REDIS_UNAVAILABLE` error code, and a `Retry-After` header instead of returning empty data or reporting false write success.

Legacy PDF bytes can still be read from `public/pdfs` after the corresponding Redis metadata lookup succeeds, and remain available during a Redis outage. There is no local mutable-data fallback.

## Authentication

Authentication is custom. Login and signup are handled by `/api/auth`.

The `vw_auth` cookie stores a base64 JSON session payload plus an HMAC signature. The session payload includes user id, username, role, and expiry. Passwords are hashed with `bcryptjs`.

`src/lib/auth.ts` owns session signing, constant-time signature verification, cookie settings, current-user lookup, and admin authorization. Protected requests resolve the current user from Redis instead of trusting the role stored in the cookie. Password changes, password resets, and role changes increment the user record's `sessionVersion`, invalidating existing sessions.

`SESSION_SECRET` and `RESET_TOKEN_SECRET` are required to contain at least 32 characters. The server fails during initialization when either secret is missing or too short.

## PDF Flow

1. Authenticated users submit PDFs through `/upload`.
2. `/api/pdfs` validates metadata, file type, and max size.
3. The server extracts text through `src/lib/pdfText.ts`.
4. The server creates one UUID metadata record for each selected generation.
5. One shared UUID-named PDF blob is saved through `savePdfFile()` and referenced by all metadata records from that upload.
6. Admin uploads are approved immediately; normal user uploads are held for moderation.
7. Public listing and serving hide records where `approved === false`.

Searchable text can be backfilled from the admin tools tab through `backfillPdfSearchText()`.

## Guide Flow

Static guides are always available from `src/data/diyGuides.ts`.

Authenticated users submit new guides through `/submit-guide`. Submitted guides are saved with `approved: false`. Admins approve or delete them from `/admin`. Public guide lists and detail pages only include approved user guides.

## Search Flow

`/api/search` searches four content groups:

- Generation and system metadata
- Generation/system content
- PDF metadata and extracted PDF text
- Static DIY guide metadata and content

Results are scored by exact query and token matches. PDF text matches include snippets and are marked with `matchSource: "pdf-text"`.

Spanish searches send `locale=es-MX`, normalize accented queries, include Spanish generation, system, and built-in guide content, and return localized result URLs. Approved user-submitted guides are searchable in both locales.

## Localization

Spanish routes live under `/es-mx`. `src/proxy.ts` marks the request locale, the root layout emits the matching document language and structured data, and `src/lib/localization.ts` owns route and slug mappings. Public Spanish generation, system, guide, library, and search pages use localized metadata and content. The Spanish route layout also localizes shared interactive account, contribution, PDF, comment, and admin components while preserving their API behavior.

Password-reset requests include the active locale so both the email copy and reset destination remain in the Spanish route tree. Spanish public user profiles are available under `/es-mx/usuarios/[username]`.

## Admin Flow

`/admin` is a client-side dashboard backed by `/api/admin`.

Tabs:

- Moderation: pending PDFs, pending guides, feedback, reported comments
- Users: user list, role promotion, user deletion
- PDFs: full PDF list, approval, edit, delete
- Guides: submitted guide list, approval, delete
- Tools: PDF search text backfill and Resend email test

Server-side admin authorization is enforced by `/api/admin`.

## Validation

Use the repo scripts:

```bash
npm run lint
npm run build
```

At the time this documentation was created, the production build passed. Lint completed with warnings only, mainly React hook dependency warnings plus one unused helper in `src/app/systems/[slug]/page.tsx`.

## Known Technical Debt

- `AuthProvider` is mounted in the root layout and supplies shared authentication state to navigation and comments; workflow pages may still perform scoped private-data checks.
- Admin tables are desktop-oriented and should be reviewed for smaller screens before major admin UI expansion.
- Some client pages use async `searchParams` props; this builds now, but future Next.js changes could make this pattern worth revisiting.
