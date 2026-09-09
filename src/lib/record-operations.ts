'use server'

import { supabase } from './supabase'
import { RecordType, AppRecord, FieldDefinition } from '@/types'
import { recordTypes } from '@/config/record-types'

export async function getRecordTypes(): Promise<RecordType[]> {
  return recordTypes
}

export async function getRecordsByTypeId(recordTypeId: string): Promise<AppRecord[]> {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('record_type_id', recordTypeId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []) as AppRecord[]
}

export async function getRecordById(id: string): Promise<AppRecord | null> {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return (data || null) as AppRecord
}

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

export function getFieldConfig(recordTypeId: string): FieldDefinition[] {
  const rt = recordTypes.find((r) => r.id === recordTypeId)
  return rt?.fields || []
}

export function getRecordTypeBySlug(slug: string): RecordType | undefined {
  return recordTypes.find((rt) => rt.slug === slug)
}
