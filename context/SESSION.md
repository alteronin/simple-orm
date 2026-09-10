# Session State

## Project: simple-orm

### Live Test Results (2026-09-10)
- ✅ Dark mode renders correctly (bg: rgb(9,9,11), text: rgb(250,250,250))
- ✅ Sidebar nav with icons (256px wide, hidden on mobile)
- ✅ All SVG icons properly sized (16x16)
- ✅ Card-based record list with badges and hover states
- ✅ Form inputs, selects, textareas styled consistently
- ✅ CRUD operations work against live Supabase (13 deals, 1 task)
- ✅ Responsive mobile layout (sidebar hidden)
- ✅ No CSS/JS errors on production

### Status
- **Initialized**: 2026-09-09
- **Phase**: Bucket 1 Complete — UI theme applied, all features live
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
- [ ] Bucket 2: Search/filter and additional features
- [ ] Bucket 3: Future enhancements

### Bucket 1 Completion Details
- Record list page with dynamic field display
- Record detail page with all field values
- Create/edit forms with dynamic field rendering
- Delete with confirmation dialog
- Sidebar navigation with icons (Deal, Task)
- Dark mode via Tailwind CSS v4 with @theme tokens
- Server actions separated from data access layer
- Server components for data fetching, client components for interactivity
- shadcn/ui-style design system (CSS variables, component classes)

### Technical Notes
- **Tailwind v4**: Uses `@import "tailwindcss"` + `@theme` block (NOT tailwind.config.ts)
- **PostCSS**: Requires `@tailwindcss/postcss` plugin (not `tailwindcss`)
- **CSS Import**: Must be in root layout (`import '@/styles/globals.css'`)
- **Custom fetch**: Supabase client needs `next: { revalidate: 0 }` to bypass Next.js data cache
- **record_types.id**: `text` type (not `uuid`) to match code's string IDs

### Issues Found & Resolved
- ~~BLOCKING: Supabase tables not created~~ → Fixed, tables created and seeded
- ~~BLOCKING: Env vars not set~~ → Fixed, pulled from Vercel production
- ~~DNS: Supabase unreachable~~ → Fixed via Google DNS (8.8.8.8)
- ~~CSS: No styles loading~~ → Fixed: missing `import '@/styles/globals.css'`
- ~~CSS: Tailwind not processing~~ → Fixed: installed `@tailwindcss/postcss`
- ~~Icons: Massive SVGs~~ → Fixed: added `shrink-0` to all SVGs
- ~~Dark mode: Not applying~~ → Fixed: Tailwind v4 `@theme` config
