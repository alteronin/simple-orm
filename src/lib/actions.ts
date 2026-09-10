'use server'

import { supabase } from './supabase'
import { AppRecord, RecordType, FieldDefinition } from '@/types'

// --- History types ---

export interface RecordHistoryEntry {
  id: string
  record_id: string
  action: string
  changes: Record<string, { old: any; new: any }> | null
  created_at: string
}

// --- History helpers ---

async function logRecordChange(recordId: string, action: string, changes?: Record<string, { old: any; new: any }> | null) {
  await supabase.from('record_history').insert({
    record_id: recordId,
    action,
    changes: changes || null,
  })
}

export async function getRecordHistory(recordId: string): Promise<RecordHistoryEntry[]> {
  const { data, error } = await supabase
    .from('record_history')
    .select('*')
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []) as RecordHistoryEntry[]
}

// --- Record CRUD ---

export async function createRecord(recordTypeId: string, data: Record<string, string | number | boolean | null>): Promise<AppRecord> {
  const { data: record, error } = await supabase
    .from('records')
    .insert({ record_type_id: recordTypeId, data })
    .select()
    .single()
  if (error) throw new Error(error.message)
  await logRecordChange(record.id, 'created')
  return record as AppRecord
}

export async function updateRecord(id: string, data: Record<string, string | number | boolean | null>): Promise<AppRecord> {
  const { data: existing, error: fetchError } = await supabase
    .from('records')
    .select('data')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const changes: Record<string, { old: any; new: any }> = {}
  const allKeys = new Set([...Object.keys(existing.data || {}), ...Object.keys(data)])
  for (const key of allKeys) {
    const oldVal = (existing.data as Record<string, any>)?.[key] ?? null
    const newVal = data[key] ?? null
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal, new: newVal }
    }
  }

  const { data: record, error } = await supabase
    .from('records')
    .update({ data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  if (Object.keys(changes).length > 0) {
    await logRecordChange(id, 'updated', changes)
  }
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

  const oldVal = (existing.data as Record<string, any>)?.[fieldName] ?? null
  const changes: Record<string, { old: any; new: any }> | null =
    JSON.stringify(oldVal) !== JSON.stringify(value) ? { [fieldName]: { old: oldVal, new: value } } : null

  const newData = { ...(existing.data as Record<string, any>), [fieldName]: value }
  const { data: record, error } = await supabase
    .from('records')
    .update({ data: newData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  if (changes) {
    await logRecordChange(id, 'updated', changes)
  }
  return record as AppRecord
}

// --- Notes ---

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

// --- Record Type CRUD ---

export async function createRecordType(data: { id: string; name: string; slug: string; fields: FieldDefinition[] }): Promise<RecordType> {
  const { data: record, error } = await supabase
    .from('record_types')
    .insert({ id: data.id, name: data.name, slug: data.slug, fields: data.fields })
    .select()
    .single()
  if (error) {
    console.error('createRecordType error:', error.message, error.details, error.hint)
    throw new Error(error.message)
  }
  return record as RecordType
}

export async function updateRecordType(id: string, data: { name?: string; slug?: string; fields?: FieldDefinition[] }): Promise<RecordType> {
  const { data: record, error } = await supabase
    .from('record_types')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return record as RecordType
}

export async function deleteRecordType(id: string): Promise<void> {
  const { error } = await supabase.from('record_types').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// --- Stack CRUD ---

import { Stack, StackCard, StackWithCards } from '@/types'

export async function getStacks(): Promise<StackWithCards[]> {
  const { data: stacks, error: stacksError } = await supabase
    .from('stacks')
    .select('*')
    .order('position', { ascending: true })
  if (stacksError) throw new Error(stacksError.message)
  if (!stacks || stacks.length === 0) return []

  const stackIds = stacks.map(s => s.id)
  const rtIds = [...new Set(stacks.map(s => s.record_type_id))]

  const [cardsResult, rtResult] = await Promise.all([
    supabase.from('stack_cards').select('*, record:records(*)').in('stack_id', stackIds).order('position', { ascending: true }),
    supabase.from('record_types').select('*').in('id', rtIds),
  ])

  const cardsByStack = new Map<string, any[]>()
  for (const card of (cardsResult.data || [])) {
    const list = cardsByStack.get(card.stack_id) || []
    list.push(card)
    cardsByStack.set(card.stack_id, list)
  }
  const rtMap = new Map<string, RecordType>()
  for (const rt of (rtResult.data || [])) {
    rtMap.set(rt.id, rt as RecordType)
  }

  return stacks.map(stack => ({
    ...stack,
    cards: (cardsByStack.get(stack.id) || []) as any,
    record_type: rtMap.get(stack.record_type_id),
  }))
}

export async function getStack(id: string): Promise<StackWithCards | null> {
  const { data: stack, error } = await supabase
    .from('stacks')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null

  const { data: cards } = await supabase
    .from('stack_cards')
    .select('*, record:records(*)')
    .eq('stack_id', id)
    .order('position', { ascending: true })
  const { data: rt } = await supabase
    .from('record_types')
    .select('*')
    .eq('id', stack.record_type_id)
    .single()
  return {
    ...stack,
    cards: (cards || []) as any,
    record_type: rt as RecordType || undefined,
  }
}

export async function createStack(data: { name: string; record_type_id: string; display_fields: string[] }): Promise<Stack> {
  const { data: maxPos } = await supabase
    .from('stacks')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .single()
  const nextPos = (maxPos?.position ?? -1) + 1

  const { data: stack, error } = await supabase
    .from('stacks')
    .insert({ name: data.name, record_type_id: data.record_type_id, display_fields: data.display_fields, position: nextPos })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return stack as Stack
}

export async function updateStack(id: string, data: { name?: string; display_fields?: string[] }): Promise<Stack> {
  const { data: stack, error } = await supabase
    .from('stacks')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return stack as Stack
}

export async function deleteStack(id: string): Promise<void> {
  const { error } = await supabase.from('stacks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function addCardToStack(stackId: string, recordId: string): Promise<StackCard> {
  const { data: maxPos } = await supabase
    .from('stack_cards')
    .select('position')
    .eq('stack_id', stackId)
    .order('position', { ascending: false })
    .limit(1)
    .single()
  const nextPos = (maxPos?.position ?? -1) + 1

  const { data: card, error } = await supabase
    .from('stack_cards')
    .insert({ stack_id: stackId, record_id: recordId, position: nextPos })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return card as StackCard
}

export async function removeCardFromStack(stackId: string, recordId: string): Promise<void> {
  const { error } = await supabase
    .from('stack_cards')
    .delete()
    .eq('stack_id', stackId)
    .eq('record_id', recordId)
  if (error) throw new Error(error.message)
}

export async function reorderStackCards(stackId: string, cardIds: string[]): Promise<void> {
  const updates = cardIds.map((cardId, index) =>
    supabase
      .from('stack_cards')
      .update({ position: index })
      .eq('id', cardId)
      .eq('stack_id', stackId)
  )
  await Promise.all(updates)
}

export async function populateStackFromType(stackId: string): Promise<void> {
  const { data: stack } = await supabase
    .from('stacks')
    .select('record_type_id')
    .eq('id', stackId)
    .single()
  if (!stack) return

  const { data: existingCards } = await supabase
    .from('stack_cards')
    .select('record_id')
    .eq('stack_id', stackId)
  const existingIds = new Set((existingCards || []).map(c => c.record_id))

  const { data: records } = await supabase
    .from('records')
    .select('id')
    .eq('record_type_id', stack.record_type_id)

  const newCards = (records || [])
    .filter(r => !existingIds.has(r.id))
    .map((r, i) => ({
      stack_id: stackId,
      record_id: r.id,
      position: (existingCards?.length || 0) + i,
    }))

  if (newCards.length > 0) {
    const { error } = await supabase.from('stack_cards').insert(newCards)
    if (error) throw new Error(error.message)
  }
}
