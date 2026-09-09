'use client'

import { getRecordById } from '@/lib/record-operations'
import { RecordForm } from '@/components/RecordForm'
import { getFieldConfig, getRecordTypeBySlug } from '@/config/record-types'
import { useUpdateRecord } from '@/hooks/useRecords'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string; id: string }
}

export default async function EditRecordPage({ params }: PageProps) {
  const rt = getRecordTypeBySlug(params.slug)
  if (!rt) notFound()

  const record = await getRecordById(params.id)
  if (!record) notFound()

  const fields = getFieldConfig(rt.id)
  const { mutate, pending, error } = useUpdateRecord()
  const router = useRouter()

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
      <RecordForm fields={fields} initialData={record.data} onSubmit={handleSubmit} submitting={pending} submitLabel="Save Changes" />
    </div>
  )
}
