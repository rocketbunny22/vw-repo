# VW Repo App Overview

This document captures the current shape of the webapp so future work can start from the actual implementation instead of the scaffold README.

## Stack

- Next.js 16.2.4 with the App Router
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

Mutable runtime data is Redis-backed when environment variables are configured.

| Key | Purpose |
| --- | --- |
| `users` | User accounts, password hashes, roles, garage profile, bookmarks, checklist progress, onboarding, profile links |
| `pdfs` | PDF metadata records |
| `pdf:<filename>` | PDF file bytes as base64 |
| `user_guides` | Submitted user guides |
| `comments` | Guide comments and report state |
| `feedback` | Submitted feedback and review state |
| `reset_tokens` | Password reset token records |

`user-guides.json` is used as a local fallback for user guides when Redis is unavailable. Legacy PDF bytes can also be read from `public/pdfs`.

## Authentication

Authentication is custom. Login and signup are handled by `/api/auth`.

The `vw_auth` cookie stores a base64 JSON session payload plus an HMAC signature. The session payload includes user id, username, role, and expiry. Passwords are hashed with `bcryptjs`.

Several route handlers verify this cookie independently. When changing session format or signature behavior, update every route that verifies sessions.

## PDF Flow

1. Authenticated users submit PDFs through `/upload`.
2. `/api/pdfs` validates metadata, file type, and max size.
3. The server extracts text through `src/lib/pdfText.ts`.
4. The server creates one PDF metadata record for each selected generation.
5. The PDF file is saved through `savePdfFile()`.
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

- Session verification is duplicated across route handlers.
- `AuthProvider` exists but is not mounted in the root layout and is not currently used by pages.
- Missing stable `SESSION_SECRET` or `RESET_TOKEN_SECRET` causes random fallback secrets, which invalidates sessions or reset tokens across process restarts.
- Admin tables are desktop-oriented and should be reviewed for smaller screens before major admin UI expansion.
- Some client pages use async `searchParams` props; this builds now, but future Next.js changes could make this pattern worth revisiting.
