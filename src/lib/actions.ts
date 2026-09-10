'use server'

import { supabase } from './supabase'
import { AppRecord } from '@/types'

export async function createRecord(recordTypeId: string, data: Record<string, string | number | boolean | null>): Promise<AppRecord> {
  const { data: record, error } = await supabase
    .from('records')
    .insert({ record_type_id: recordTypeId, data })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return record as AppRecord
}

export async function updateRecord(id: string, data: Record<string, string | number | boolean | null>): Promise<AppRecord> {
  const { data: record, error } = await supabase
    .from('records')
    .update({ data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return record as AppRecord
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase.from('records').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteRecords(ids: string[]): Promise<void> {
  const { error } = await supabase.from('records').delete().in('id', ids)
  if (error) throw new Error(error.message)
}

export async function updateRecordField(id: string, fieldName: string, value: string | number | boolean | null): Promise<AppRecord> {
  const { data: existing, error: fetchError } = await supabase
    .from('records')
    .select('data')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const newData = { ...(existing.data as Record<string, any>), [fieldName]: value }
  const { data: record, error } = await supabase
    .from('records')
    .update({ data: newData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return record as AppRecord
}

export interface Note {
  id: string
  record_id: string
  content: string
  created_at: string
}

export async function getNotes(recordId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []) as Note[]
}

export async function createNote(recordId: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert({ record_id: recordId, content })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Note
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
