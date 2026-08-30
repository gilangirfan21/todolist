# Todo List

A simple todo list web app — auth, categories, due dates, filters, drag & drop, dark mode, CSV export. Each user only ever sees their own data.

## Stack

| Layer     | Tech                              |
| --------- | ---------------------------------- |
| Frontend  | Vue 3 + Vite                       |
| Styling   | Tailwind CSS v4                    |
| State     | Pinia                              |
| Backend   | Supabase (Postgres + Auth + RLS)   |
| Hosting   | GitHub Pages (static)              |

## Features

| Feature          | Details                                                      |
| ----------------- | -------------------------------------------------------------- |
| Auth               | Email/password sign up, log in, log out                        |
| Todos              | Create, edit, delete, mark done                                |
| Organize            | Categories/tags, due date, priority                             |
| Filter & sort       | By status, priority, category, due date range (today/week/month/custom) |
| Reorder             | Manual drag & drop                                              |
| Export              | Download the current filtered view as CSV                       |
| Dark mode           | Persisted, follows system preference by default                 |
| Data isolation      | Enforced server-side via Supabase Row Level Security             |

## Setup

| Step | Command / action |
| ---- | ----------------- |
| 1. Install deps | `npm install` |
| 2. Create a Supabase project | Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor |
| 3. Configure env | `cp .env.example .env`, then fill in your project's URL + anon key (Project Settings → API) |
| 4. Run it | `npm run dev` |

## Scripts

| Command | What it does |
| -------- | -------------- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Deploy

Push to `main` and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys automatically. One-time setup before the first deploy:

| Where | What |
| ----- | ---- |
| Repo Settings → Pages | Set **Source** to "GitHub Actions" |
| Repo Settings → Secrets and variables → Actions | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| `vite.config.js` | `base` is set to `/todolist/` — update it if the repo is ever renamed |
