# Files

## Folder Structure

```
simple-orm/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Sidebar.tsx         # Sidebar navigation with icons
│   │   ├── RecordList.tsx      # List view with search/sort/filter/pagination/bulk
│   │   ├── RecordToolbar.tsx   # Search, sort, filter, export, bulk action controls
│   │   ├── Pagination.tsx      # Page controls
│   │   ├── RecordForm.tsx      # Dynamic create/edit form
│   │   ├── RecordDetail.tsx    # Detail view with actions + notes
│   │   ├── RecordNotes.tsx     # Notes CRUD component
│   │   ├── EmptyState.tsx      # Empty list state
│   │   ├── ConfirmDialog.tsx   # Delete confirmation modal
│   │   └── Toast.tsx           # Toast notification system
│   ├── hooks/          # Custom React hooks for CRUD operations
│   │   └── useRecords.ts       # useCreateRecord, useUpdateRecord, useDeleteRecord
│   ├── lib/            # Utilities, Supabase client, DB operations
│   │   ├── supabase.ts         # Supabase client (with custom fetch for cache bypass)
│   │   ├── record-operations.ts # Server functions for reads
│   │   └── actions.ts          # Server actions for mutations
│   ├── config/         # Configuration files
│   │   └── record-types.ts     # Record type configs with field definitions
│   ├── styles/         # Global styles, theme tokens
│   │   └── globals.css         # Tailwind v4 @theme config + base styles
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts            # FieldDefinition, RecordType, AppRecord
│   └── app/            # Next.js App Router pages
│       ├── layout.tsx          # Root layout (sidebar + CSS import)
│       ├── page.tsx            # Home/redirect
│       ├── settings/page.tsx   # Record Type Manager (create/edit/delete types + fields)
│       ├── [slug]/
│       │   ├── page.tsx        # List page for record type
│       │   ├── new/page.tsx    # Create page
│       │   └── [id]/
│       │       ├── page.tsx    # Detail page
│       │       └── edit/page.tsx # Edit page
│       └── not-found.tsx       # 404 page
├── public/             # Static assets
├── context/            # Skill context files (SESSION, CHANGELOG, FILES, ARCHITECTURE, DATABASE)
├── docs/               # Documentation
│   └── 001-schema.sql  # Supabase migration
├── .opencode/          # Project-specific skills
├── .github/            # GitHub Actions
│   └── workflows/
├── vercel.json         # Vercel configuration
├── postcss.config.mjs  # PostCSS config (@tailwindcss/postcss)
├── tailwind.config.ts  # Tailwind v4 config (minimal)
├── tsconfig.json       # TypeScript config
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── .env.local          # Local env vars (gitignored)
└── .gitignore
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/actions.ts` | Server actions for mutations (create, update, delete record types + records) |
| `src/lib/record-operations.ts` | Server functions for reads (all from Supabase DB) |
| `src/lib/supabase.ts` | Supabase client with custom fetch (bypasses Next.js cache) |
| `src/hooks/useRecords.ts` | Client-side hooks wrapping server actions |
| `src/app/settings/page.tsx` | Record Type Manager — create/edit/delete record types + fields |
| `src/types/index.ts` | Core TypeScript types (AppRecord, FieldDefinition, RecordType) |
| `src/components/Sidebar.tsx` | Sidebar navigation (reads record types from props) |
| `src/components/RecordToolbar.tsx` | Search, sort, filter, export, bulk action controls |
| `src/components/Pagination.tsx` | Page controls with ellipsis |
| `src/components/Toast.tsx` | Toast notification system (context + UI) |
| `src/components/RecordForm.tsx` | Dynamic form rendering based on field config |
| `src/components/RecordList.tsx` | List view with search/sort/filter/pagination/bulk select |
| `src/components/RecordDetail.tsx` | Detail view with edit/delete + notes section |
| `src/components/RecordNotes.tsx` | Notes CRUD (add/view/delete) |
| `docs/001-schema.sql` | Supabase database migration (record_types, records) |
| `docs/002-notes-table.sql` | Notes table migration (requires manual run) |
| `src/styles/globals.css` | Tailwind v4 theme tokens and base styles |
| `postcss.config.mjs` | PostCSS with @tailwindcss/postcss plugin |
| `docs/001-schema.sql` | Supabase database migration |

## Deployment

- **GitHub**: https://github.com/alteronin/simple-orm (branch: master)
- **Vercel**: https://simple-orm.vercel.app (production)
- **Supabase**: ref `vhcgmdgmmvarkqjfcytj`
