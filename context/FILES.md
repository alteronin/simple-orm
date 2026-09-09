# Files

## Folder Structure

```
simple-orm/
├── src/
│   ├── components/     # Reusable UI components (forms, cards, modals)
│   ├── pages/          # Route/page components (list, detail, create, edit)
│   ├── hooks/          # Custom React hooks (useSupabase, useRecords, etc.)
│   ├── lib/            # Utilities, Supabase client, helpers
│   ├── config/         # App configuration, record type definitions
│   ├── styles/         # Global styles, CSS tokens, theme
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
├── tests/              # Test files
├── context/            # Skill context files (SESSION, CHANGELOG, FILES, ARCHITECTURE, DATABASE)
├── docs/               # Documentation
├── .opencode/          # Project-specific skills
│   └── skills/
├── .github/            # GitHub Actions, issue templates
│   └── workflows/
├── public/             # Static assets
└── package.json
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/config/record-types.ts` | Record type and field definitions |
| `src/types/index.ts` | Core TypeScript types |
| `src/pages/index.tsx` | Landing / list page |
| `context/ARCHITECTURE.md` | Architecture decisions |
| `context/DATABASE.md` | Database schema |
