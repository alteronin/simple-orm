import { supabase } from './supabase'
import { RecordType, AppRecord, FieldDefinition } from '@/types'

const RT_COLS = 'id, name, slug, fields, created_at, updated_at'
const REC_COLS = 'id, record_type_id, data, created_at, updated_at'

export async function getRecordTypes(): Promise<RecordType[]> {
  const { data, error } = await supabase
    .from('record_types')
    .select(RT_COLS)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []) as RecordType[]
}

export async function getRecordTypeById(id: string): Promise<RecordType | null> {
  const { data, error } = await supabase
    .from('record_types')
    .select(RT_COLS)
    .eq('id', id)
    .single()
  if (error) return null
  return data as RecordType
}

export async function getRecordTypeBySlug(slug: string): Promise<RecordType | undefined> {
  const { data, error } = await supabase
    .from('record_types')
    .select(RT_COLS)
    .eq('slug', slug)
    .single()
  if (error) return undefined
  return data as RecordType
}

export async function getFieldConfig(recordTypeId: string): Promise<FieldDefinition[]> {
  const rt = await getRecordTypeById(recordTypeId)
  return rt?.fields || []
}

export async function getRecordsByTypeId(recordTypeId: string, page = 1, limit = 10): Promise<{ records: AppRecord[], total: number }> {
  const offset = (page - 1) * limit
  const { data, error, count } = await supabase
    .from('records')
    .select(REC_COLS, { count: 'exact' })
    .eq('record_type_id', recordTypeId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw new Error(error.message)
  return { records: (data || []) as AppRecord[], total: count || 0 }
}

export async function getRecordById(id: string): Promise<AppRecord | null> {
  const { data, error } = await supabase
    .from('records')
    .select(REC_COLS)
    .eq('id', id)
    .single()
  if (error) return null
  return (data || null) as AppRecord
}

export interface LinkedRecordInfo {
  record: AppRecord
  recordType: RecordType
}

export async function getLinkedRecords(
  pairs: { recordId: string; targetType: string }[]
): Promise<Map<string, LinkedRecordInfo>> {
  const uniquePairs = pairs.filter(p => p.recordId && p.targetType)
  if (uniquePairs.length === 0) return new Map()

  const uniqueTargetTypes = [...new Set(uniquePairs.map(p => p.targetType))]
  const uniqueRecordIds = [...new Set(uniquePairs.map(p => p.recordId))]

  const [typesResult, recordsResult] = await Promise.all([
    supabase.from('record_types').select(RT_COLS).in('id', uniqueTargetTypes),
    supabase.from('records').select(REC_COLS).in('id', uniqueRecordIds),
  ])

  const typesMap = new Map<string, RecordType>()
  if (typesResult.data) {
    typesResult.data.forEach(rt => typesMap.set(rt.id, rt as RecordType))
  }

  const recordsMap = new Map<string, AppRecord>()
  if (recordsResult.data) {
    recordsResult.data.forEach(rec => recordsMap.set(rec.id, rec as AppRecord))
  }

  const result = new Map<string, LinkedRecordInfo>()
  for (const pair of uniquePairs) {
    const record = recordsMap.get(pair.recordId)
    const recordType = typesMap.get(pair.targetType)
    if (record && recordType) {
      result.set(pair.recordId, { record, recordType })
    }
  }

  return result
}
