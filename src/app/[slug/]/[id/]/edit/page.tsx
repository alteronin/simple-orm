'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RecordForm } from '@/components/RecordForm'
import { getFieldConfig, getRecordTypeBySlug } from '@/config/record-types'
import { useUpdateRecord } from '@/hooks/useRecords'
import { AppRecord } from '@/types'

export default function EditRecordPage() {
  const params = useParams<{ slug: string; id: string }>()
  const router = useRouter()
  if (!params) return <div className="p-8 text-text-muted">Loading...</div>
  const rt = getRecordTypeBySlug(params.slug)
  const { mutate, pending, error } = useUpdateRecord()
  const [record, setRecord] = useState<AppRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.resolve(supabase.from('records').select('*').eq('id', params.id).single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) { router.push(`/${params.slug}`); return }
        setRecord(data as AppRecord)
      }))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params.id, params.slug, router])

  if (!rt || loading) {
    return <div className="p-8 text-text-muted">Loading...</div>
  }

  const fields = getFieldConfig(rt.id)

  const handleSubmit = (data: Record<string, string | number | boolean | null>) => {
    mutate(params.id, data)
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-text-muted hover:text-text text-sm transition-colors mb-4"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-text mb-6">Edit {rt.name}</h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {record && <RecordForm fields={fields} initialData={record.data} onSubmit={handleSubmit} submitting={pending} submitLabel="Save Changes" />}
    </div>
  )
}
