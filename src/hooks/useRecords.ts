'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AppRecord } from '@/types'
import { recordTypes } from '@/config/record-types'
import { createRecord as createRecordServer, updateRecord as updateRecordServer, deleteRecord as deleteRecordServer } from '@/lib/actions'
import { useToast } from '@/components/Toast'

export function useRecordTypes() {
  return { types: recordTypes, getRecordTypeBySlug: (slug: string) => recordTypes.find((r) => r.slug === slug) }
}

export function useRecords(recordTypeId: string) {
  const [records, setRecords] = useState<AppRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.resolve(supabase
      .from('records').select('*').eq('record_type_id', recordTypeId).order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setError(error.message); return }
        setRecords((data || []) as AppRecord[])
      }))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [recordTypeId])

  const refresh = () => {
    setLoading(true)
    Promise.resolve(supabase.from('records').select('*').eq('record_type_id', recordTypeId).order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setRecords((data || []) as AppRecord[]) }))
      .finally(() => setLoading(false))
  }

  return { records, loading, error, refresh }
}

export function useRecord(id: string) {
  const [record, setRecord] = useState<AppRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.resolve(supabase.from('records').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { setError(error.message); return }
        setRecord((data || null) as AppRecord)
      }))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  return { record, loading, error }
}

export function useCreateRecord() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  const mutate = (recordTypeId: string, data: Record<string, string | number | boolean | null>) => {
    return startTransition(async () => {
      try {
        setError(null)
        await createRecordServer(recordTypeId, data)
        addToast('Record created successfully', 'success')
        router.refresh()
        router.push(`/${recordTypeId}`)
      } catch (e: any) {
        setError(e.message)
        addToast(e.message || 'Failed to create record', 'error')
      }
    })
  }

  return { mutate, pending, error }
}

export function useUpdateRecord() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  const mutate = (id: string, data: Record<string, string | number | boolean | null>) => {
    return startTransition(async () => {
      try {
        setError(null)
        await updateRecordServer(id, data)
        addToast('Record updated successfully', 'success')
        router.refresh()
      } catch (e: any) {
        setError(e.message)
        addToast(e.message || 'Failed to update record', 'error')
      }
    })
  }

  return { mutate, pending, error }
}

export function useDeleteRecord() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  const mutate = (id: string) => {
    return startTransition(async () => {
      try {
        setError(null)
        await deleteRecordServer(id)
        addToast('Record deleted', 'success')
        router.refresh()
      } catch (e: any) {
        setError(e.message)
        addToast(e.message || 'Failed to delete record', 'error')
      }
    })
  }

  return { mutate, pending, error }
}
