# Session State

## Project: simple-orm

### UAC Re-verification (2026-09-10)
All 7 Bucket 1 UAC checks passed against production:
- ✅ AC1: List Records — 13 deal cards rendered
- ✅ AC2: Create Record — form fields correct (text, number, select, date), creates in Supabase
- ✅ AC2b: Create → appears in list — created record shows on list page
- ✅ AC3: Record Detail — displays title, value, Edit/Delete buttons
- ✅ AC4: Edit Record — page renders, pre-fills existing data
- ✅ AC5: Delete Record — removes from Supabase, gone from list
- ✅ AC6: Record Type Selection — Deal/Task nav works, different fields per type

### Bucket 2 UAC (2026-09-10)
All 12 checks passed against production:
- ✅ AC1: List Records — 10 cards (paginated from 14 total)
- ✅ B2-Search: search input visible, filters correctly (TEST → 9 results)
- ✅ B2-Sort: sort dropdown visible with field options
- ✅ B2-Filter: status/priority filter dropdowns present
- ✅ B2-Pagination: 2 page buttons (14 records, 10 per page)
- ✅ AC6: Record Type Selection — Deal/Task nav, different fields
- ✅ AC2: Create — form works, toast "Record created successfully" appears
- ✅ AC2b: Create → list refreshes, new record visible
- ✅ AC3: Detail — shows all values, Edit/Delete buttons
- ✅ AC4: Edit — pre-fills existing data
- ✅ AC5: Delete — toast "Record deleted", gone from list
- ✅ B2-Skeleton: skeleton loaders implemented in loading state

### Status
- **Initialized**: 2026-09-09
- **Phase**: Bucket 2 Complete — search/sort/filter/pagination/toasts/skeletons live
- **Deployed**: https://simple-orm.vercel.app (master)
- **Supabase**: Connected and operational (ref: vhcgmdgmmvarkqjfcytj)
- **DNS**: Google DNS (8.8.8.8) on local machine for Supabase access

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
- [ ] Bucket 3: Future enhancements

### Bucket 2 Completion Details
- Search: text input filters across all fields client-side
- Sort: dropdown to sort by any field (A→Z, Z→A) or date
- Filter: dropdown chips for select fields (status, priority)
- Pagination: page controls with ellipsis (10 records per page)
- Toast notifications: success/error feedback on create/update/delete
- Skeleton loaders: card-based animated placeholders during loading
- All client-side (no server roundtrips for filtering)

### Technical Notes
- **Tailwind v4**: Uses `@import "tailwindcss"` + `@theme` block (NOT tailwind.config.ts)
- **PostCSS**: Requires `@tailwindcss/postcss` plugin (not `tailwindcss`)
- **CSS Import**: Must be in root layout (`import '@/styles/globals.css'`)
- **Custom fetch**: Supabase client needs `next: { revalidate: 0 }` to bypass Next.js data cache
- **record_types.id**: `text` type (not `uuid`) to match code's string IDs
- **Pagination**: Client-side, 10 records per page, ellipsis for large sets
- **Toast**: Simple context-based system, auto-dismiss after 4 seconds
