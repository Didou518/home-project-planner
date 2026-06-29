# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`home-project-planner` — a SPA for managing home renovation/improvement projects, organized as **properties** that each contain **projects**. UI text and code comments are in **French**; keep new user-facing strings in French.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`).

- `pnpm dev` — Vite dev server with HMR
- `pnpm build` — type-check (`tsc -b`) then production build; the build fails on type errors
- `pnpm lint` — ESLint over the repo
- `pnpm preview` — serve the production build
- `pnpm db:migrate` — push migrations to the linked Supabase project (`supabase db push`)
- `pnpm db:migrate:create <name>` — scaffold a new timestamped migration in `supabase/migrations/`
- `pnpm db:reset` — reset the database (⚠️ destroys all data)

There is **no test runner** configured. Formatting is enforced by Prettier (`prettier.config.js`): tabs, width 4, single quotes, semicolons, `es5` trailing commas.

Required env vars (in `.env.local`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. Supabase CLI must be linked (`supabase link --project-ref <ref>`) for the `db:*` commands.

## Project tracking (Obsidian vault)

Project tracking/notes live in an Obsidian vault **outside** this repo:
`/mnt/c/Users/Didou/OneDrive/Documents/Obsidian Vault/HomeProjectPlanner/` (path on WSL; the vault is on OneDrive). Notes are Markdown with Obsidian `[[wikilinks]]`. This is not part of the build — never import from it into `src/`. Structure: `00_Pilotage` (état projet, décisions/ADR), `01_PM`, `02_UX`, `03_Dev` (architecture, modèle de données, journal d'implémentation), `04_QA`.

## Role-based workflow (skills)

This project is driven by **role "hats"** implemented as skills in `.claude/skills/` (adapted from the BandOrganizr project). Each role writes its deliverables to the matching vault folder above:

- `pm-homeprojectplanner` — Product: vision, personas, scope, roadmap (`01_PM/`)
- `ux-homeprojectplanner` — Design: flows, design system, wireframes (`02_UX/`) — desktop-first/responsive framing
- `dev-homeprojectplanner` — Architecture, data model, implementation (`03_Dev/`) — **read this before non-trivial code work**: it documents the real stack, the layered data access, and the route-`action` mutation pattern
- `supabase-homeprojectplanner` — Supabase operational workflow (CLI, remote-linked, no MCP/local stack)
- `qa-homeprojectplanner` / `test-homeprojectplanner` / `screenshot-homeprojectplanner` — QA strategy, test tooling, visual checks. **No test infra exists yet** (no Vitest/Playwright); these skills describe the target setup and flag what to install first.

**Task closure discipline** (per `dev-homeprojectplanner`): after a significant commit/fix, update `03_Dev/Journal-implementation.md`, `00_Pilotage/Etat-projet.md`, and Claude memory.

## Architecture

React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui (Radix primitives in `src/components/ui/`). The `@/` alias maps to `src/` (configured in both `vite.config.ts` and `tsconfig`).

**Routing — React Router 7 data router.** `src/App.tsx` defines the entire route tree with `createBrowserRouter`. Routes are deeply nested and URL-encode the data hierarchy: `/properties/:id/projects/:projectId`. The app shell, auth providers, and router all live in `App.tsx`; `main.tsx` only mounts it.

**Mutations go through route `action`s, not components.** Create/edit forms (`ProjectForm.tsx`, `PropertyForm.tsx`) export an `action` function that is wired into the router. The action reads `formData`, calls the matching Supabase function, shows a `sonner` toast, calls `queryClient.invalidateQueries`, and `redirect`s. `<Form method="post|patch">` from react-router drives submission. When adding a mutation, follow this pattern rather than calling Supabase from a click handler.

**Reads go through TanStack Query hooks.** `src/hooks/useProjects.ts` / `useProperties.ts` wrap `useQuery` around the Supabase fetch functions. Query keys are `['projects', propertyId]` / `['properties']`; the shared `queryClient` (defined in `src/integrations/supabase/client.ts`, `staleTime` 5 min) is what actions invalidate. Keep query keys consistent between the hook and the action that invalidates them.

**Data access layer.** `src/integrations/supabase/client.ts` is the single place that touches Supabase — it exports the `supabase` client, the `queryClient`, all auth helpers (`signInWithPassword`, `signOut`, etc.), and all CRUD functions (`getProperties`, `createProject`, …). All functions `throw` on error; callers (actions/hooks) handle the throw.

**Auth & state (Zustand).** Two stores in `src/stores/`:
- `useAuthStore` — `user` / `session` / `isLoading`. `AuthProvider` (mounted in `App.tsx`) subscribes to `supabase.auth.onAuthStateChange` and seeds the initial session, writing into this store. Session is persisted in `localStorage` by the Supabase client.
- `useSelectionStore` — currently selected property/project for the sidebar; changing the property clears the selected project.

`RootLayout` (`src/pages/Root.tsx`) is the auth guard: it redirects to `/signin` once `isLoading` is false and there is no `user`. `/signin` and `/signup` render the same `Auth` page outside the guarded tree.

**Backend (Supabase/Postgres).** Migrations in `supabase/migrations/` are timestamp-ordered and idempotent. Data model: `properties` (owned via `owner_id`) → `projects` (FK `property_id`) → `property_members` junction table for sharing (`owner`/`member` roles). RLS is enforced on every table. **Important:** property/member access policies use `SECURITY DEFINER` helper functions (`is_property_owner`, `is_property_member`, `can_access_property`) specifically to avoid infinite RLS recursion (see `20251124161819_fix_rls_recursion.sql`) — reuse these functions in new policies instead of inlining cross-table subqueries. A trigger auto-inserts the creator into `property_members` as `owner` when a property is created.
