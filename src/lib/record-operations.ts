import { supabase } from './supabase'
import { RecordType, AppRecord, FieldDefinition } from '@/types'

export async function getRecordTypes(): Promise<RecordType[]> {
  const { data, error } = await supabase
    .from('record_types')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []) as RecordType[]
}

export async function getRecordTypeById(id: string): Promise<RecordType | null> {
  const { data, error } = await supabase
    .from('record_types')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as RecordType
}

export async function getRecordTypeBySlug(slug: string): Promise<RecordType | undefined> {
  const { data, error } = await supabase
    .from('record_types')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return undefined
  return data as RecordType
}

export async function getFieldConfig(recordTypeId: string): Promise<FieldDefinition[]> {
  const rt = await getRecordTypeById(recordTypeId)
  return rt?.fields || []
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
