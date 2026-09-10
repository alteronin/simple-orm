# Changelog

## 2026-09-11 — Performance Quick Wins
- Removed broken `noStoreFetch` wrapper (next.revalidate was no-op on POST)
- Added column pruning (`select('id, name, ...')`) on all Supabase queries
- Parallelized RecordDetailPage queries with `Promise.all`
- Deduplicated record_types fetch on stacks page
- Playwright test suite: 41 tests (API, E2E, performance audits)
- All 41 tests passing

## 2026-09-11 — Stack Filter Criteria + Delete Fix
- Added `filter_criteria` column to stacks (migration 005)
- Stack population now supports field-level filters (eq, neq, contains, gt, lt, gte, lte)
- Multiple filters supported (AND logic)
- Filter badges display on stack column headers
- Stack delete now shows confirmation dialog + error handling + toasts
- All stack actions (create, update, delete, populate) have try/catch + toast feedback

## 2026-09-11 — System Validation
- Reserved slug validation: settings, stacks, api, new, edit blocked
- Duplicate slug check with friendly error message
- `recurring` field type added to settings UI with interval selector
- Cascade delete: deleting record type now removes associated records, stacks, stack_cards
- Client-side error display in settings form

## 2026-09-10 — Dynamic Record Types
- Record types now fully DB-driven (read from `record_types` Supabase table)
- New `/settings` page: create, edit, delete record types + fields from UI
- Removed hardcoded `src/config/record-types.ts` dependency
- Sidebar, server pages, client pages all fetch record types from DB
- Adding record types/fields no longer requires code changes or SQL migrations
- UAC: 14/14 passed

## 2026-09-09 — Project Init
- Initialized project structure and context files
- Requirements gathered: generic CRUD, dynamic fields, dark mode, Vercel deploy
- Tech stack selected: Next.js + Supabase (JSONB for dynamic fields)
- Folder scaffold created

## 2026-09-09 — Bucket 1: Core CRUD Engine (feat/core-crud-engine)
- Implemented list, detail, create, edit, delete pages
- Dynamic form rendering based on record type field config
- Record type navigation (Deal, Task)
- Dark mode via Tailwind CSS
- Server actions separated into `src/lib/actions.ts`
- Client-side data fetching for edit page (useParams pattern)
- Server components for list/detail pages
- Empty states, loading states, error handling
- Build passes locally and on Vercel

## 2026-09-09 — Supabase Connection
- Fixed SQL migration: `record_types.id` uses `text` (not `uuid`)
- Fixed `record-operations.ts` to work with text IDs
- Created Supabase project and ran migration
- Pulled env vars from Vercel production
- Added custom fetch wrapper in `src/lib/supabase.ts` to bypass Next.js data cache
- Added `export const dynamic = 'force-dynamic'` to list page
- All 6 Bucket 1 acceptance criteria verified via Playwright browser tests

## 2026-09-09 — Deployment Fixes
- Fixed Windows `[slug]` directory structure issue
- Fixed hooks ordering (all hooks before early returns)
- Fixed `usePathname()` null check in layout
- DNS fix: Switched to Google DNS (8.8.8.8) for Supabase access
- Re-authenticated Vercel CLI via `npx vercel login`
- Production deployed via `npx vercel --prod --yes`

## 2026-09-10 — shadcn/ui Theme Overhaul
- Switched to shadcn/ui-style dark theme inspired by Studio Admin dashboard
- **Tailwind v4 migration**:
  - Installed `@tailwindcss/postcss` (required for Tailwind v4 PostCSS)
  - Installed `autoprefixer`
  - Rewrote `postcss.config.mjs` to use `@tailwindcss/postcss` plugin
  - Rewrote `tailwind.config.ts` (minimal, v4-compatible)
  - Rewrote `src/styles/globals.css` with `@import "tailwindcss"` + `@theme` block
- **CSS variable-based color system**:
  - Defined custom properties: background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring
  - Dark theme as default (`rgb(9,9,11)` background)
- **Sidebar navigation**:
  - Created `src/components/Sidebar.tsx` with Dashboard + Records sections
  - SVG icons with `shrink-0` to prevent size explosion
  - Active state highlighting
  - Hidden on mobile (`hidden md:flex`)
  - Version footer
- **Component updates** (all files):
  - RecordList: card hover states, chevron reveal, badge-style field tags
  - RecordForm: proper input/select/textarea styling, loading spinner
  - RecordDetail: card layout, icon buttons for edit/delete
  - EmptyState: icon in muted circle instead of emoji
  - ConfirmDialog: backdrop overlay, card styling
  - All pages: improved headers with subtitles and record counts
  - All SVGs: added `shrink-0` class
- **Layout**:
  - Root layout imports `globals.css`
  - Sidebar + main content flex layout
  - Responsive (sidebar hidden on mobile)
- Removed unused `src/components/RecordTypeNav.tsx`
- Created `src/components/Sidebar.tsx`
- All verified on production: https://simple-orm.vercel.app

### Files Created/Modified (Theme)
- src/styles/globals.css — Rewritten for Tailwind v4
- tailwind.config.ts — Minimal v4 config
- postcss.config.mjs — Updated to `@tailwindcss/postcss`
- src/components/Sidebar.tsx — New sidebar nav
- src/app/layout.tsx — CSS import + sidebar layout
- src/components/RecordList.tsx — Updated styling
- src/components/RecordForm.tsx — Updated styling
- src/components/RecordDetail.tsx — Updated styling
- src/components/EmptyState.tsx — Updated styling
- src/components/ConfirmDialog.tsx — Updated styling
- src/app/[slug]/page.tsx — Updated styling
- src/app/[slug]/new/page.tsx — Updated styling
- src/app/[slug]/[id]/page.tsx — No changes needed
- src/app/[slug]/[id]/edit/page.tsx — Updated styling
- src/app/page.tsx — Updated styling
- src/components/RecordTypeNav.tsx — Deleted (replaced by Sidebar)

## 2026-09-10 — Bucket 2: Search/Filter/Sort/Pagination/Toasts/Skeletons
- **Search bar**: text input filters records across all fields client-side
- **Sort dropdown**: sort by any field (A→Z, Z→A) or by date (newest/oldest)
- **Filter chips**: dropdown filters for select fields (status for Deals, priority for Tasks)
- **Pagination**: page controls with ellipsis, 10 records per page
- **Toast notifications**: success/error toasts on create/update/delete actions
- **Skeleton loaders**: card-based animated placeholders during data loading
- All filtering is client-side (no server roundtrips for search/sort/filter)
- Updated hooks (useCreateRecord, useUpdateRecord, useDeleteRecord) to trigger toasts
- Root layout wrapped with ToastProvider
- All 12 UAC checks passed against production

### Files Created/Modified (Bucket 2)
- src/components/Toast.tsx — Toast context provider + UI
- src/components/RecordToolbar.tsx — Search/sort/filter toolbar
- src/components/Pagination.tsx — Page controls
- src/components/RecordList.tsx — Added search/sort/filter/pagination logic
- src/hooks/useRecords.ts — Added toast callbacks to mutations
- src/app/layout.tsx — Wrapped with ToastProvider

## 2026-09-10 — Bucket 3: CSV Export, Bulk Actions, Record Notes
- **CSV Export**: export button in toolbar downloads filtered records as CSV
- **Bulk Actions**: checkbox on each card, select all, bulk delete, bulk status change
- **Record Notes**: add/view/delete timestamped notes on detail page (Ctrl+Enter to save)
- New server actions: deleteRecords, updateRecordField, getNotes, createNote, deleteNote
- New migration: docs/002-notes-table.sql (notes table with record_id FK)
- All 7 Bucket 3 UAC checks passed against production

### Files Created/Modified (Bucket 3)
- src/components/RecordNotes.tsx — Notes component with CRUD
- src/components/RecordList.tsx — Added checkbox selection, bulk actions, CSV export
- src/components/RecordToolbar.tsx — Added export button, select all, bulk action bar
- src/components/RecordDetail.tsx — Added notes section
- src/lib/actions.ts — Added deleteRecords, updateRecordField, getNotes, createNote, deleteNote
- src/app/[slug]/page.tsx — Pass recordTypeId to RecordList
- docs/002-notes-table.sql — Notes table migration

## 2026-09-10 — Bucket 4: Responsive Sidebar, Inline Edit, Record Relationships
- **B4-1: Responsive/Mobile Sidebar** (13/13 UAC): hamburger on mobile, slide-out overlay, backdrop close
- **B4-2: Inline Quick-Edit** (7/7 UAC): single-click edit on field badges, select/boolean/text/number support
- **B4-3: Record Relationships / Link Field Type** (7/7 UAC): link field type, LinkFieldEditor, LinkedRecordName/Badge
- **Migrations run**: 002-notes-table.sql, 003-history-table.sql (record_history table)
- **RLS fix**: Added full-access policy on record_types + disabled RLS on record_history
- **Stress test passed**: Created record types (contact, vendor, upcoming), created records, verified cascade delete, duplicate slug rejection, null field handling
- **Final DB state**: 4 record types (deal, task, upcoming, contact), 19 total records

### Files Created/Modified (Bucket 4)
- src/components/Sidebar.tsx — Responsive sidebar with slide-out overlay
- src/components/InlineEditableField.tsx — Single-click inline edit component
- src/components/LinkFieldEditor.tsx — Search dropdown for linked records
- src/components/RecordForm.tsx — Added link field type rendering
- src/components/RecordDetail.tsx — Added LinkedRecordName component
- src/components/RecordList.tsx — Added LinkedRecordBadge component
- src/app/settings/page.tsx — Added link field type with target selector
- src/app/layout.tsx — Mobile hamburger, sidebar state, record types from DB
- src/lib/actions.ts — Added createRecordType, updateRecordType, deleteRecordType
- src/types/index.ts — Extended FieldDefinition with 'link' type and targetType
- docs/003-history-table.sql — Audit log table migration
- src/components/RecordHistory.tsx — Audit log component (created/updated/deleted with field-level changes)
- src/lib/actions.ts — Added history logging to createRecord, updateRecord, updateRecordField

## 2026-09-10 — B4-4: Record History/Audit Log
- **History table**: `record_history` with record_id FK, action text, changes jsonb
- **Auto-logging**: createRecord logs "created", updateRecord/updateRecordField log "updated" with field-level old/new diff
- **RecordHistory component**: collapsible section on detail page, shows timestamped entries with action badges + change details
- **Cascade delete**: history entries auto-deleted when record is deleted
- All 6 B4-4 UAC checks passed
