'use client'

import { useParams, useRouter } from 'next/navigation'
import { RecordForm } from '@/components/RecordForm'
import { getRecordTypeBySlug, getFieldConfig } from '@/config/record-types'
import { useCreateRecord } from '@/hooks/useRecords'

export default function NewRecordPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const { mutate, pending, error } = useCreateRecord()
  const rt = params ? getRecordTypeBySlug(params.slug) : undefined

  if (!params || !rt) {
    return <div className="p-8 text-text-muted">Loading...</div>
  }

  const fields = getFieldConfig(rt.id)

  const handleSubmit = (data: Record<string, string | number | boolean | null>) => {
    mutate(rt.id, data)
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-text-muted hover:text-text text-sm transition-colors mb-4"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-text mb-6">New {rt.name}</h1>
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <RecordForm fields={fields} onSubmit={handleSubmit} submitting={pending} submitLabel={`Create ${rt.name}`} />
    </div>
  )
}
