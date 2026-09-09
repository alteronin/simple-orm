-- Supabase Schema for simple-orm
-- Run this in the Supabase SQL Editor

-- Create record_types table
create table record_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  fields jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create records table
create table records (
  id uuid default gen_random_uuid() primary key,
  record_type_id uuid references record_types(id) on delete cascade,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index idx_records_record_type_id on records(record_type_id);
create index idx_records_data on records using gin(data);

-- Enable RLS (will disable for now, enable later when auth is added)
alter table record_types enable row level security;
alter table records enable row level security;

-- Insert default record types
insert into record_types (id, name, slug, fields) values
  ('deal', 'Deal', 'deal', '[{"name":"title","type":"text","label":"Title","required":true},{"name":"value","type":"number","label":"Value"},{"name":"status","type":"select","label":"Status","options":["new","in_progress","won","lost"]},{"name":"close_date","type":"date","label":"Close Date"}]'),
  ('task', 'Task', 'task', '[{"name":"title","type":"text","label":"Title","required":true},{"name":"priority","type":"select","label":"Priority","options":["low","medium","high"]},{"name":"done","type":"boolean","label":"Completed"}]');

-- Create updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_updated_at
  before update on records
  for each row
  execute function update_updated_at();

create trigger trigger_update_updated_at_rt
  before update on record_types
  for each row
  execute function update_updated_at();

-- Policy: Allow read access (will need to update when auth is added)
create policy "Allow read on records" on records for select using (true);
create policy "Allow insert on records" on records for insert with check (true);
create policy "Allow update on records" on records for update using (true);
create policy "Allow delete on records" on records for delete using (true);
create policy "Allow read on record_types" on record_types for select using (true);

-- Note: For solo testing, disable RLS temporarily
alter table records disable row level security;
alter table record_types disable row level security;
