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
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>
  }

  const fields = getFieldConfig(rt.id)

  const handleSubmit = (data: Record<string, string | number | boolean | null>) => {
    mutate(rt.id, data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="btn-ghost btn-icon btn-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New {rt.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new {rt.name.toLowerCase()} record</p>
        </div>
      </div>
      <div className="card p-6">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <RecordForm fields={fields} onSubmit={handleSubmit} submitting={pending} submitLabel={`Create ${rt.name}`} />
      </div>
    </div>
  )
}
