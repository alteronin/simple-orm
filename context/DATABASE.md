# Database Schema

## Provider: Supabase (PostgreSQL)
- **Project ref**: `vhcgmdgmmvarkqjfcytj`
- **URL**: `https://vhgcmdgmmvarkqjfcytj.supabase.co`
- **RLS**: Disabled (solo user, no auth)

## Tables

### `record_types`
Defines the available record types and their field configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `text` | Primary key (e.g., 'deal', 'task') — NOT uuid |
| `name` | `text` | Display name (e.g., "Deal", "Task") |
| `slug` | `text` | URL-friendly identifier |
| `fields` | `jsonb` | Array of field definitions |
| `created_at` | `timestamptz` | Auto timestamp |
| `updated_at` | `timestamptz` | Auto timestamp |

### `records`
The actual records. Each record belongs to a record type and stores its field data as JSONB.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `record_type_id` | `text` | Foreign key → record_types.id |
| `data` | `jsonb` | Field values for this record |
| `created_at` | `timestamptz` | Auto timestamp |
| `updated_at` | `timestamptz` | Auto timestamp |

## JSONB Field Structure
Each record's `data` column stores:
```json
{
  "fieldName1": "value1",
  "fieldName2": 42,
  "isActive": true
}
```

## Current Record Types

### Deal
| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | text | yes | — |
| value | number | no | — |
| status | select | no | new, in_progress, won, lost |
| close_date | date | no | — |

### Task
| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | text | yes | — |
| priority | select | no | low, medium, high |
| done | boolean | no | — |

## Querying JSONB
- PostgreSQL supports querying jsonb columns with `->>`, `->`, `@>`, etc.
- Example: `SELECT * FROM records WHERE data @> '{"status": "active"}'`
- Indexes can be added on jsonb paths for performance

## Seed Data
- Migration includes seed data for both Deal and Task record types
- 13 deal records and 1 task record currently in production

## Migrations
- No schema migrations needed for adding fields (they go into the config JSON)
- New fields are added by updating the `record-types.ts` config
- SQL migration file: `docs/001-schema.sql`

## Notes Table (requires separate migration)
- **Migration**: `docs/002-notes-table.sql`
- **Table**: `notes`
- **Columns**: id (uuid PK), record_id (uuid FK → records), content (text), created_at (timestamptz)
- **Index**: idx_notes_record_id on record_id
- **Cascade**: notes deleted when record is deleted
- **RLS**: Disabled (solo user)
- **Status**: Must be run manually in Supabase SQL Editor
