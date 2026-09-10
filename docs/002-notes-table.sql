-- Migration: Create notes table for record notes/comments
-- Run this in the Supabase SQL Editor

create table notes (
  id uuid default gen_random_uuid() primary key,
  record_id uuid references records(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create index idx_notes_record_id on notes(record_id);

-- Enable RLS (disabled for solo testing)
alter table notes disable row level security;

-- Policies
create policy "Allow all on notes" on notes for all using (true);
