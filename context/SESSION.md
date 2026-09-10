# Session State

## Project: simple-orm

### Bucket 3 UAC (2026-09-10)
All 7 checks passed against production:
- ✅ AC1: List Records — 10 cards (paginated)
- ✅ B3-CSV: Export button visible and functional
- ✅ B3-Bulk: Select all + checkbox selection + bulk delete + bulk status dropdown
- ✅ B3-Notes: Notes section with textarea on detail page
- ✅ B3-StatusChange: Status dropdown appears for bulk actions on tasks
- ✅ Regression-Create: Create flow still works
- ✅ Regression-CRUD: Full create+delete cycle works

**NOTE**: Notes feature requires running `docs/002-notes-table.sql` in Supabase SQL Editor to create the `notes` table.

### Status
- **Initialized**: 2026-09-09
- **Phase**: Bucket 3 Complete — CSV export, bulk actions, record notes live
- **Deployed**: https://simple-orm.vercel.app (master)
- **Supabase**: Connected and operational (ref: vhcgmdgmmvarkqjfcytj)
- **Pending**: Run `docs/002-notes-table.sql` migration for notes feature

### Requirements Summary
- Generic record-type CRUD app (Salesforce-lite)
- Highly dynamic fields (add/remove fields without code changes)
- Solo user, no auth, live data on Vercel for testing
- Dark mode, shadcn/ui-style SaaS UI
- Next.js + Supabase stack
- JSONB columns for dynamic field storage
- Deploy to GitHub → Vercel

### Buckets
- [x] Bucket 1: Core CRUD engine (list, detail, create, edit pages)
- [x] Bucket 2: Search/filter, sort, pagination, toasts, skeletons
- [x] Bucket 3: CSV export, bulk actions, record notes
- [ ] Bucket 4: Future enhancements

### Bucket 3 Completion Details
- **CSV Export**: download filtered records as CSV from toolbar
- **Bulk Actions**: checkbox selection on each card, select all, bulk delete, bulk status change
- **Record Notes**: add/view/delete timestamped notes on detail page (Ctrl+Enter to save)
- **New server actions**: deleteRecords, updateRecordField, getNotes, createNote, deleteNote
- **New migration**: docs/002-notes-table.sql (notes table with record_id FK)

### Technical Notes
- **Tailwind v4**: Uses `@import "tailwindcss"` + `@theme` block (NOT tailwind.config.ts)
- **PostCSS**: Requires `@tailwindcss/postcss` plugin (not `tailwindcss`)
- **CSS Import**: Must be in root layout (`import '@/styles/globals.css'`)
- **Custom fetch**: Supabase client needs `next: { revalidate: 0 }` to bypass Next.js data cache
- **record_types.id**: `text` type (not `uuid`) to match code's string IDs
- **Pagination**: Client-side, 10 records per page, ellipsis for large sets
- **Toast**: Simple context-based system, auto-dismiss after 4 seconds
- **Notes**: Stored in separate `notes` table (requires migration), foreign key to records
