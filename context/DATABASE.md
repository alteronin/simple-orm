# Database Schema

## Provider: Supabase (PostgreSQL)

## Tables

### `record_types`
Defines the available record types and their field configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
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
| `record_type_id` | `uuid` | Foreign key → record_types |
| `data` | `jsonb` | Field values for this record |
| `created_at` | `timestamptz` | Auto timestamp |
| `updated_at` | `timestamptz` | Auto timestamp |

### `field_config` (optional, merged into record_types.fields)
Currently stored inside `record_types.fields` as JSONB. If scaling needs it, this can be extracted to a separate table.

## JSONB Field Structure
Each record's `data` column stores:
```json
{
  "fieldName1": "value1",
  "fieldName2": 42,
  "isActive": true
}
```

## Querying JSONB
- PostgreSQL supports querying jsonb columns with `->>`, `->`, `@>`, etc.
- Example: `SELECT * FROM records WHERE data @> '{"status": "active"}'`
- Indexes can be added on jsonb paths for performance

## Migrations
- No schema migrations needed for adding fields (they go into the config JSON)
- Supabase handles schema changes for table structure
- New fields are added by updating the `record_types.fields` config

## RLS (Row Level Security)
- Currently disabled (solo user, no auth)
- Will be enabled when multi-user support is added
