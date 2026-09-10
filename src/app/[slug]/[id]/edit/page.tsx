'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RecordForm } from '@/components/RecordForm'
import { useUpdateRecord } from '@/hooks/useRecords'
import { AppRecord, RecordType } from '@/types'

export default function EditRecordPage() {
  const params = useParams<{ slug: string; id: string }>()
  const router = useRouter()
  const { mutate, pending, error } = useUpdateRecord()
  const [record, setRecord] = useState<AppRecord | null>(null)
  const [rt, setRt] = useState<RecordType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    if (!params) return

    const fetchData = async () => {
      const [recordRes, typeRes] = await Promise.all([
        supabase.from('records').select('*').eq('id', params.id).single(),
        supabase.from('record_types').select('*').eq('slug', params.slug).single()
      ])
      if (cancelled) return
      if (recordRes.error || !recordRes.data) { router.push(`/${params.slug}`); return }
      if (typeRes.data) setRt(typeRes.data as RecordType)
      setRecord(recordRes.data as AppRecord)
      setLoading(false)
    }
    fetchData()

    return () => { cancelled = true }
  }, [params, params?.id, params?.slug, router])

  if (!params || !rt || loading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>
  }

  const handleSubmit = (data: Record<string, string | number | boolean | null>) => {
    mutate(params.id, data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit {rt.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update {rt.name.toLowerCase()} record</p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {record && <RecordForm fields={rt.fields} initialData={record.data} onSubmit={handleSubmit} submitting={pending} submitLabel="Save Changes" />}
      </div>
    </div>
  )
}
