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
