# Architecture

## Overview
Simple-ORM is a generic record-type CRUD application. Think of it as a minimal Salesforce-lite where users can define record types with arbitrary fields and perform full CRUD operations.

## Tech Stack
- **Frontend**: Next.js (App Router) — React 14+, TypeScript
- **Backend/DB**: Supabase (PostgreSQL) — provides auth, DB, real-time, storage
- **Styling**: Custom CSS with dark mode support, minimal SaaS aesthetic
- **Deploy**: GitHub → Vercel (automatic previews on PRs)

## Key Design Decisions

### Dynamic Fields via JSONB
- Each record stores custom fields in a `jsonb` column in Supabase
- Record types define which fields exist via a config object (`src/config/record-types.ts`)
- Adding a new field = updating the config, no DB migration needed
- This gives the flexibility of a JSON-file backend with the safety of a real database

### Record Type Config
```ts
// Example structure
interface RecordType {
  name: string;
  fields: FieldDefinition[];
}

interface FieldDefinition {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  label: string;
  required?: boolean;
  options?: string[]; // for select type
}
```

### No Auth
- Solo user, no authentication layer
- Supabase client connects directly (anons key for testing)
- Security note: this is intentional for the solo/dev testing phase

### Dark Mode
- Minimal SaaS dark theme
- CSS custom properties for tokens (colors, spacing, typography)

## Deployment Flow
1. Push to GitHub feature branch
2. Vercel auto-deploys preview
3. Live test against Vercel instance
4. Merge to main after verification

## Future Considerations
- Search/filter on list views
- Pagination for large record sets
- File attachments (Supabase Storage)
- Multi-user support with Supabase Auth
