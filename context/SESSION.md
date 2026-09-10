# Session State

## Project: simple-orm

### Dynamic Record Types Update (2026-09-10)
All 14/14 UAC checks passed — record types now fully DB-driven.

**Key changes:**
- Record types read from `record_types` Supabase table (not hardcoded config)
- New `/settings` page: create, edit, delete record types + fields from UI
- Sidebar reads record types from DB on every navigation
- Server pages (`[slug]`, `[slug]/[id]`) fetch record types from DB
- Client pages (`[slug]/new`, `[slug]/[id]/edit`) fetch record types from DB
- `src/config/record-types.ts` no longer used anywhere

**What this means:**
- Adding a new record type: click "Record Types" → "New Record Type" → fill in → done
- Adding a field to existing type: click edit → add field → save → done
- No code changes, no SQL migrations needed for record type changes

### Status
- **Initialized**: 2026-09-09
- **Phase**: Bucket 4 complete
- **Deployed**: https://simple-orm.vercel.app (master)
- **Supabase**: Connected and operational (ref: vhcgmdgmmvarkqjfcytj)
- **Migrations run**: 001-schema.sql, 002-notes-table.sql, 003-history-table.sql

### Requirements Summary
- Generic record-type CRUD app (Salesforce-lite)
- Highly dynamic fields (add/remove fields without code changes) ✅ NOW FULLY ACHIEVED
- Solo user, no auth, live data on Vercel for testing
- Dark mode, shadcn/ui-style SaaS UI
- Next.js + Supabase stack
- JSONB columns for dynamic field storage
- Deploy to GitHub → Vercel

### Buckets
- [x] Bucket 1: Core CRUD engine (list, detail, create, edit pages)
- [x] Bucket 2: Search/filter, sort, pagination, toasts, skeletons
- [x] Bucket 3: CSV export, bulk actions, record notes
- [x] Dynamic Record Types: fully DB-driven, UI for CRUD on record types
- [x] Bucket 4: Responsive sidebar, inline edit, record relationships, audit log

### UAC Results
- Bucket 1: 6/6 passed
- Bucket 2: 12/12 passed
- Bucket 3: 7/7 passed
- Dynamic Record Types: 14/14 passed
- B4-1 Responsive Sidebar: 13/13 passed
- B4-2 Inline Quick-Edit: 7/7 passed
- B4-3 Record Relationships: 7/7 passed
- B4-4 Record History/Audit Log: 6/6 passed

### Technical Notes
- **Tailwind v4**: Uses `@import "tailwindcss"` + `@theme` block (NOT tailwind.config.ts)
- **PostCSS**: Requires `@tailwindcss/postcss` plugin (not `tailwindcss`)
- **CSS Import**: Must be in root layout (`import '@/styles/globals.css'`)
- **Custom fetch**: Supabase client needs `next: { revalidate: 0 }` to bypass Next.js data cache
- **record_types.id**: `text` type (not `uuid`) to match code's string IDs
- **Pagination**: Client-side, 10 records per page, ellipsis for large sets
- **Toast**: Simple context-based system, auto-dismiss after 4 seconds
- **Notes**: Stored in separate `notes` table (requires migration), foreign key to records
- **Record Types**: Read from Supabase `record_types` table, managed via `/settings` page
