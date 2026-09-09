'use client'

import { getRecordTypeBySlug, getFieldConfig } from '@/config/record-types'
import { RecordForm } from '@/components/RecordForm'
import { useCreateRecord } from '@/hooks/useRecords'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

export default function NewRecordPage({ params }: PageProps) {
  const rt = getRecordTypeBySlug(params.slug)
  if (!rt) notFound()
  const fields = getFieldConfig(rt.id)
  const { mutate, pending, error } = useCreateRecord()
  const router = useRouter()

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
