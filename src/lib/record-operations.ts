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

export function getFieldConfig(recordTypeId: string): FieldDefinition[] {
  const rt = recordTypes.find((r) => r.id === recordTypeId)
  return rt?.fields || []
}

export function getRecordTypeBySlug(slug: string): RecordType | undefined {
  return recordTypes.find((rt) => rt.slug === slug)
}
