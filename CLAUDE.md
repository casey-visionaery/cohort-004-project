# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Production build
pnpm typecheck    # TypeScript type-check (includes React Router typegen)
pnpm test         # Run tests with Vitest
pnpm test:watch   # Watch mode
pnpm db:migrate   # Run Drizzle migrations
pnpm db:seed      # Seed database
pnpm db:generate  # Generate migrations from schema changes
```

Initial setup: `pnpm install && pnpm db:migrate && pnpm db:seed`

## Architecture

Full-stack course platform (mini-Udemy) built with React Router 7 (SSR), SQLite + Drizzle ORM, and TypeScript.

**Layers:**
- `app/routes/` — File-based routes with loaders/actions. Route config in `app/routes.ts`.
- `app/services/` — All DB queries live here, never scattered in routes. Each service file owns one domain (course, enrollment, quiz, etc.).
- `app/db/` — Drizzle schema (`schema.ts`) and singleton instance (`index.ts`).
- `app/components/` — UI components. `components/ui/` holds shadcn/ui primitives.
- `app/lib/` — Utilities: `validation.ts`, `session.ts`, `markdown.server.ts`, `ppp.ts`, `utils.ts`.

**Data flow:** Route loader → service function → Drizzle query → `loaderData` prop → component. Form submissions POST to route actions, which validate with Zod then call services.

**Auth:** Session-based via httpOnly cookies (`app/lib/session.ts`). Use `getCurrentUserId(request)` in loaders/actions. Roles: `Student`, `Instructor`, `Admin` (see `UserRole` enum in schema).

**Validation:** Three helpers in `app/lib/validation.ts`:
- `parseFormData(formData, ZodSchema)` — returns `{ success, data }` or `{ success, errors }`
- `parseParams(params, ZodSchema)` — throws 400 on failure
- `parseJsonBody(request, ZodSchema)` — returns result object

**Testing:** Vitest with in-memory SQLite. Each test file mocks `~/db` via `vi.mock("~/db")`, creates a fresh DB with `createTestDb()`, and seeds baseline data with `seedBaseData(db)` from `app/test/setup.ts`.

**Dev tools:** `DevUI` component (`app/components/dev-ui.tsx`) allows switching users and PPP country without login. API routes `/api/switch-user` and `/api/set-dev-country` support this.

## Conventions

**Object parameters for same-type args.** When a function has more than one parameter of the same type, use an object parameter instead of positional parameters:

```ts
// BAD
const addUserToPost = (userId: string, postId: string) => {};

// GOOD
const addUserToPost = (opts: { userId: string; postId: string }) => {};
```

**Styling:** Tailwind CSS 4 + shadcn/ui. Use `cn()` from `app/lib/utils.ts` (clsx + tailwind-merge) for conditional classes.

**Route component types:** Use React Router's generated types — `Route.LoaderArgs`, `Route.ComponentProps`, etc.

**Pricing:** Monetary values stored as cents (integers). Use `formatPrice()` from `app/lib/utils.ts` to display.
