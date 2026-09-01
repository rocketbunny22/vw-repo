<INSTRUCTIONS>
1. Embody the role of the most qualified PHP, JavaScript, and WordPress experts when those technologies are relevant.
2. Be factual and methodical.
3. Omit language suggesting remorse or apology.
4. State "I don't know" for unknown information without further explanation.
5. Avoid disclaimers about your level of expertise.
6. Exclude personal ethics or morals unless explicitly relevant.
7. Provide unique, non-repetitive responses.
8. Address the core of each question to understand intent.
9. Break down complexities into smaller steps with clear reasoning.
10. Offer multiple viewpoints or solutions when they are useful.
11. Request clarification on ambiguous questions before answering.
12. Acknowledge and correct any past errors.
13. The PC is running Fedora Linux, so ignore Mac and Windows-specific solutions.
14. Prefer Python for scripts unless the user is clearly asking for code to put on a site.
15. For this repo, inspect the actual project structure and relevant files before giving placement or implementation advice.
16. For deployed-site fixes, validate locally when practical and recheck the live endpoint after the change.
17. Prefer semantic HTML and responsive CSS for all user-facing UI changes.
18. Use BEM class names when adding plain CSS classes. Existing Tailwind utility usage may remain, but new named classes should follow BEM.
19. Do not print or expose `.env`, `.env.local`, or backup env file contents. It is acceptable to inspect which environment variable names the code references.
</INSTRUCTIONS>

--- project-doc ---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

--- project-doc ---

# Current App Context

- This is a Next.js 16.3.4 / React 19.2.4 App Router app using Tailwind CSS 4.
- Treat `src/app` as the route source of truth. Pages and route handlers use the Next 16 async `params` / `searchParams` shape where applicable.
- Read the relevant local Next.js docs in `node_modules/next/dist/docs/` before changing routing, caching, route handlers, images, server/client component boundaries, or build configuration.
- Public assets live under `public/`. Local app images are served from `/images/**` and allowed by `next.config.ts`.
- Global styling lives in `src/app/globals.css`. The app currently uses Tailwind utilities plus shared classes such as `.btn-primary`, `.btn-secondary`, `.badge`, and `.card`.

# Data And Storage

- Static Volkswagen taxonomy and starter content live in `src/data`: generations, systems, static DIY guides, and maintenance checklists.
- Mutable records require Upstash Redis through `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Redis keys include `users`, `pdfs`, `pdf:<filename>`, `pdf:downloads:<id>`, `user_guides`, `comments`, `feedback`, hashed expiring `reset_token:<digest>` records, rate-limit counters, and adjacent `<collection>:version` keys used for optimistic writes.
- Redis access and outage handling are centralized in `src/lib/redis.ts`; Redis-dependent API routes return `503` with `code: "REDIS_UNAVAILABLE"` when storage is not configured or cannot be reached.
- `src/data/pdfs.ts` reads PDF metadata from Redis, but `getPdfFile()` also falls back to `public/pdfs/<filename>` for legacy checked-in PDF files.

# Authentication And Authorization

- Auth is custom and cookie-based. The `vw_auth` cookie contains an HMAC-signed session payload.
- Password hashes use `bcryptjs`.
- Session creation, verification, cookie handling, current-user lookup, and admin authorization are centralized in `src/lib/auth.ts`.
- `SESSION_SECRET` and `RESET_TOKEN_SECRET` are required stable environment variables with a minimum length of 32 characters.
- User records carry an optional `sessionVersion`; password resets, password changes, and role changes increment it to invalidate existing sessions.
- Admin checks are enforced server-side in `/api/admin`, but UI gates also exist in `/admin`.

# PDFs And Search

- PDF upload is handled by `/api/pdfs`; non-admin uploads enter moderation with `approved: false`.
- PDF files are stored as base64 Redis values by filename. File serving is handled by `/api/pdfs/[filename]`.
- Search uses static taxonomy, static guide content, PDF metadata, and extracted PDF text.
- PDF text extraction lives in `src/lib/pdfText.ts`; backfill logic lives in `src/lib/pdfBackfill.ts`.
- Keep `@napi-rs/canvas` externalized and keep the `pdf.worker.mjs` tracing includes in `next.config.ts` unless a verified replacement is implemented.

# User And Admin Workflows

- User pages include profile, garage vehicle, saved bookmarks, checklists, onboarding, uploads, guide submission, feedback, and public user profiles.
- `src/components/AuthProvider.tsx` is mounted in `src/app/layout.tsx`; shared navigation consumes it while some workflow pages still perform their own auth checks before loading private data.
- Admin is a single client dashboard in `src/app/admin/page.tsx` with moderation, users, PDFs, guides, and tools tabs.
- Moderation covers pending PDFs, pending user guides, unreviewed feedback, and reported comments.

# Validation

- Run `npm run lint` and `npm run build` after meaningful code changes.
- Current known lint state may include warnings for React hook dependencies and one unused helper in `/systems/[slug]`; do not treat those warnings as newly introduced unless your change touches them.
- For deployed-site fixes, validate locally first when practical, then recheck the live endpoint after the change.
