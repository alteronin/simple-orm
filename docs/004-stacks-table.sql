-- Migration 004: Stacks + Stack Cards
-- Run this in the Supabase SQL Editor

-- Create stacks table
create table stacks (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  record_type_id text references record_types(id) on delete cascade,
  display_fields jsonb not null default '[]',
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create stack_cards table (links records to stacks with ordering)
create table stack_cards (
  id uuid default gen_random_uuid() primary key,
  stack_id uuid references stacks(id) on delete cascade not null,
  record_id uuid references records(id) on delete cascade not null,
  position int not null default 0,
  created_at timestamptz default now(),
  unique(stack_id, record_id)
);

-- Indexes
create index idx_stacks_record_type_id on stacks(record_type_id);
create index idx_stack_cards_stack_id on stack_cards(stack_id);
create index idx_stack_cards_record_id on stack_cards(record_id);
create index idx_stack_cards_position on stack_cards(stack_id, position);

-- updated_at trigger for stacks
create trigger trigger_update_updated_at_stacks
  before update on stacks
  for each row
  execute function update_updated_at();

-- RLS disabled (solo user)
alter table stacks disable row level security;
alter table stack_cards disable row level security;

-- Full access policies
create policy "Allow all on stacks" on stacks for all using (true);
create policy "Allow all on stack_cards" on stack_cards for all using (true);
