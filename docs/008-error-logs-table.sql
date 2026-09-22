-- Migration 008: Error Logs Table
-- Run this in the Supabase SQL Editor

create table error_logs (
  id uuid default gen_random_uuid() primary key,
  message text not null,
  stack text,
  component text,
  user_action text,
  url text,
  error_code text,
  error_status int,
  error_details jsonb,
  created_at timestamptz default now()
);

create index idx_error_logs_created_at on error_logs(created_at);
create index idx_error_logs_component on error_logs(component);

alter table error_logs disable row level security;
create policy "Allow all on error_logs" on error_logs for all using (true);
