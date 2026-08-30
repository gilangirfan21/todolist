# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/` (also the fastest way to catch syntax/import errors across the whole app — no separate typecheck/lint step exists)
- `npm run preview` — serve the production build locally

There is no lint, format, or test setup in this project.

## Architecture

Vue 3 (Composition API, `<script setup>`) + Vite, Tailwind CSS v4, Supabase (Postgres + Auth + RLS), deployed as a static site to GitHub Pages.

**Tailwind v4**: configured via the `@tailwindcss/vite` plugin in `vite.config.js` — there is no `tailwind.config.js` or `postcss.config.js`. Theme/dark-mode setup lives in `src/style.css` (`@import "tailwindcss"` + `@custom-variant dark (&:where(.dark, .dark *))`).

**Layering**: `services/*.js` are the only files that import the Supabase client (`src/lib/supabase.js`) — they wrap raw table queries and throw on error. `stores/*.js` (Pinia) call services and hold reactive state; components/views never call services or the Supabase client directly, only stores. When adding a new data operation, add it to the relevant service first, then wrap it in the store.

**Auth boot sequence**: `stores/auth.js`'s `init()` (restores session, subscribes to `onAuthStateChange`) is awaited in `main.js` *before* `app.mount()`. The router's `beforeEach` guard (`src/router/index.js`) reads `auth.user` synchronously, so if init isn't awaited first, the guard runs against a not-yet-loaded auth state.

**Routing**: uses `createWebHashHistory`, deliberately — GitHub Pages has no server-side rewrite, so history-mode routing 404s on refresh/deep-link. Don't switch this to history mode without also solving that.

**Data model** (`supabase/schema.sql`): `todos` and `categories` tables, both with `user_id uuid default auth.uid()` and RLS policies scoped to `auth.uid() = user_id` for every operation. This is the only authorization boundary — there is no server-side app layer. Schema changes must be hand-applied to any already-deployed Supabase project (`schema.sql` is not run automatically / there's no migration tool); when changing the schema, give the user the incremental `alter table` statement in addition to updating `schema.sql`.

**Todos**: `position` (integer) drives manual drag ordering (`vuedraggable` in `TodoList.vue`, wired through a computed get/set that emits a `reorder` event). `stores/todos.js`'s `reorder(orderedIds)` only rewrites positions for the ids it's given and leaves other todos untouched — do not change it to replace `todos.value` wholesale, since `DashboardView.vue` calls it with only the active-section ids (done todos are a separately rendered, non-reorderable `TodoList`). `completed_date` is set/cleared automatically in `toggleDone` (today's date on check, `null` on uncheck) and is otherwise only editable through `TodoForm.vue`, and only when `todo.is_done` — there's no way to set it when creating/editing an active todo.

**Icons** (`src/components/icons/BaseIcon.vue`): hand-authored inline SVG path data in Heroicons-outline style, not an npm icon package. Add new icons by adding a `name -> path` entry; sizes are `sm`/`md`/`lg` via the `size` prop.

**Date helpers** (`src/lib/date.js`): all date math (`todayStr`, `weekRange`, `monthRange`) builds local-timezone `YYYY-MM-DD` strings rather than using `toISOString()`, to match Postgres `date` columns and avoid UTC off-by-one issues. Range filtering in `DashboardView.vue` relies on `YYYY-MM-DD` strings sorting lexicographically the same as chronologically — keep new date fields in that format if they need range comparisons.

**Deploy**: `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on push to `main`. Requires the repo's Pages source set to "GitHub Actions" and `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` set as repo secrets (both one-time, manual, in GitHub settings — not doable from the CLI in this environment). `vite.config.js`'s `base` is hardcoded to `/todolist/` to match the repo name; update it if the repo is ever renamed.
