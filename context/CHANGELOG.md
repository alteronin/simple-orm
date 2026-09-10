# Changelog

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
