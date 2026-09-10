-- Migration 005: Stack Filter Criteria
-- Run this in the Supabase SQL Editor

-- Add filter_criteria column to stacks
ALTER TABLE stacks ADD COLUMN filter_criteria jsonb NOT NULL DEFAULT '[]';
