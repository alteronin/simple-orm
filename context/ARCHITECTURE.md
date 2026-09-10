# Architecture

## Overview
Simple-ORM is a generic record-type CRUD application. Think of it as a minimal Salesforce-lite where users can define record types with arbitrary fields and perform full CRUD operations.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) — React 18, TypeScript
- **Backend/DB**: Supabase (PostgreSQL) — provides DB, real-time
- **Styling**: Tailwind CSS v4 with shadcn/ui-style design tokens
- **Deploy**: GitHub → Vercel (automatic deploys on push to master)
- **Testing**: Playwright for browser-based live testing

## Key Design Decisions

### Dynamic Fields via JSONB
- Each record stores custom fields in a `jsonb` column in Supabase
- Record types define which fields exist via a config object (`src/config/record-types.ts`)
- Adding a new field = updating the config, no DB migration needed
- This gives the flexibility of a JSON-file backend with the safety of a real database

### Record Type Config
```ts
// Example structure
interface RecordType {
  id: string;        // 'deal', 'task' (text, not uuid)
  name: string;      // 'Deal', 'Task'
  slug: string;      // URL-friendly identifier
  fields: FieldDefinition[];
}

interface FieldDefinition {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
  label: string;
  required?: boolean;
  options?: string[]; // for select type
  default?: string | number | boolean;
}
```

### No Auth
- Solo user, no authentication layer
- Supabase client connects directly (anon key)
- RLS disabled for solo testing (intentional)

### Tailwind v4 Theme System
- Uses `@import "tailwindcss"` + `@theme` block in `globals.css`
- Color tokens defined as CSS custom properties (shadcn/ui pattern)
- Dark mode is default (applied via `className="dark"` on `<html>`)
- Component utility classes: `btn-primary`, `btn-outline`, `btn-destructive`, `input`, `select`, `textarea`, `badge`, `card`

### Layout
- Sidebar navigation (256px, hidden on mobile)
- Main content area with max-width container
- Sidebar shows Dashboard link + Record type links with icons
- Responsive: sidebar hidden below `md` breakpoint

### Server/Client Split
- **Server components**: List page, detail page (data fetching)
- **Client components**: Form, detail (actions), sidebar (navigation), record list (search/sort/filter)
- **Server actions**: `src/lib/actions.ts` (mutations from client)
- **Server reads**: `src/lib/record-operations.ts` (no 'use server' directive)

### Client-Side Search/Sort/Filter
- RecordList handles all filtering client-side (small dataset)
- RecordToolbar provides search input, sort dropdown, filter chips
- Pagination: 10 records per page, client-side
- Filter chips appear dynamically based on select fields in record type config

### Toast Notifications
- Simple context-based system (ToastProvider wraps app)
- Auto-dismiss after 4 seconds
- Shows on create/update/delete success/error
- Styled with green (success), red (error), neutral (info)

### CSV Export
- Export button in toolbar downloads filtered records as CSV
- Uses browser Blob + download (no server needed)
- Exports all filtered records (not just current page)

### Bulk Actions
- Checkbox on each record card for multi-select
- Select all / deselect all toggle
- Bulk delete: deletes all selected records
- Bulk status change: updates status field on all selected (for record types with status field)
- Visual feedback: selected cards highlighted with primary border

### Record Notes
- Separate `notes` table in Supabase (requires migration)
- Each note has: id, record_id (FK), content, created_at
- Add notes via textarea (Ctrl+Enter to save)
- Notes displayed newest-first with timestamps
- Delete notes on hover

## Deployment Flow
1. Push to master on GitHub
2. Vercel auto-deploys to production
3. Live test against https://simple-orm.vercel.app
4. Fix issues and push again

## Project References
- **GitHub**: https://github.com/alteronin/simple-orm
- **Vercel**: https://simple-orm.vercel.app
- **Supabase**: https://vhgcmdgmmvarkqjfcytj.supabase.co
