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
- Deployed to Vercel preview: https://simple-ir6b0q0mh-alteronins-projects.vercel.app

### Files Created
- src/lib/actions.ts (server actions: create, update, delete)
- src/lib/record-operations.ts (server functions: getRecordTypes, getRecordsByTypeId, getRecordById, getFieldConfig, getRecordTypeBySlug)
- src/hooks/useRecords.ts (client hooks: useRecords, useRecord, useCreateRecord, useUpdateRecord, useDeleteRecord)
- src/components/RecordTypeNav.tsx, RecordList.tsx, RecordForm.tsx, RecordDetail.tsx, EmptyState.tsx, ConfirmDialog.tsx
- src/app/[slug]/page.tsx, [slug]/[id]/page.tsx, [slug]/new/page.tsx, [slug]/[id]/edit/page.tsx, not-found.tsx
- src/app/layout.tsx (client component with RecordTypeNav)
- docs/001-schema.sql (Supabase migration)
