# Files

## Folder Structure

```
simple-orm/
├── src/
│   ├── components/     # Reusable UI components (forms, cards, modals)
│   │   ├── RecordTypeNav.tsx     # Record type selector tabs
│   │   ├── RecordList.tsx        # List view with cards
│   │   ├── RecordForm.tsx        # Dynamic create/edit form
│   │   ├── RecordDetail.tsx      # Detail view
│   │   ├── EmptyState.tsx        # Empty list state
│   │   └── ConfirmDialog.tsx     # Delete confirmation modal
│   ├── pages/          # (unused - App Router)
│   ├── hooks/          # Custom React hooks for CRUD operations
│   │   └── useRecords.ts     # useRecords, useRecord, useCreateRecord, useUpdateRecord, useDeleteRecord
│   ├── lib/            # Utilities, Supabase client, DB operations
│   │   ├── supabase.ts          # Supabase client initialization
│   │   ├── record-operations.ts # Server functions (server components)
│   │   └── actions.ts           # Server actions (client components)
│   ├── config/         # Configuration files, record type definitions
│   │   └── record-types.ts      # Record type configs with field definitions
│   ├── styles/         # Global styles, CSS tokens, theme
│   │   └── globals.css
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts             # FieldDefinition, RecordType, AppRecord
│   └── app/            # Next.js App Router pages
│       ├── layout.tsx           # Root layout with RecordTypeNav
│       ├── page.tsx             # Home/redirect
│       ├── [slug]/
│       │   ├── page.tsx         # List page for record type
│       │   ├── new/page.tsx     # Create page
│       │   └── [id]/
│       │       ├── page.tsx     # Detail page
│       │       └── edit/page.tsx # Edit page
│       └── not-found.tsx        # 404 page
├── public/             # Static assets
├── tests/              # Test files
├── context/            # Skill context files (SESSION, CHANGELOG, FILES, ARCHITECTURE, DATABASE)
├── docs/               # Documentation
│   └── 001-schema.sql    # Supabase migration
├── .opencode/          # Project-specific skills
│   └── skills/
├── .github/            # GitHub Actions, issue templates
│   └── workflows/
│       └── deploy.yml
├── src/app/
├── vercel.json         # Vercel configuration
├── next.config.js      # Next.js config
├── tailwind.config.ts  # Tailwind CSS config
├── tsconfig.json       # TypeScript config
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── .env.local          # Local env vars (gitignored)
└── .gitignore
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/actions.ts` | Server actions for mutations (create, update, delete) |
| `src/lib/record-operations.ts` | Server functions for reads (getRecordTypes, getRecords, getRecordById) |
| `src/hooks/useRecords.ts` | Client-side hooks wrapping server actions |
| `src/config/record-types.ts` | Record type and field definitions |
| `src/types/index.ts` | Core TypeScript types (AppRecord, FieldDefinition, RecordType) |
| `src/components/RecordForm.tsx` | Dynamic form rendering based on field config |
| `src/components/RecordList.tsx` | List view with record cards |
| `src/components/RecordDetail.tsx` | Detail view with edit/delete actions |
| `docs/001-schema.sql` | Supabase database migration |
| `context/ARCHITECTURE.md` | Architecture decisions |
| `context/DATABASE.md` | Database schema documentation |

## Deployment

- **GitHub**: https://github.com/alteronin/simple-orm (branch: feat/core-crud-engine)
- **Vercel**: https://simple-ir6b0q0mh-alteronins-projects.vercel.app
- **Note**: Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel dashboard, then run SQL migration |
