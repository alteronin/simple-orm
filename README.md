# simple-orm

A minimal, Salesforce-lite CRUD application with dynamic field support.

## Features
- Generic record-type CRUD with fully dynamic fields
- List view, detail view, create/edit forms
- Dark mode, clean minimal UI
- Backend powered by Supabase (PostgreSQL JSONB)

## Tech Stack
- **Next.js** (App Router) + **TypeScript**
- **Supabase** — Database, auth, real-time
- **Vercel** — Deployment

## Setup

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub → Vercel auto-deploys. Preview deployments on every PR.

## Context
See `context/` folder for architecture decisions, database schema, and session state.
