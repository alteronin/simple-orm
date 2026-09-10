import { getRecordById } from '@/lib/record-operations'
import { RecordDetail } from '@/components/RecordDetail'
import { getFieldConfig, getRecordTypeBySlug } from '@/config/record-types'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string; id: string }
}

export default async function RecordDetailPage({ params }: PageProps) {
  const rt = getRecordTypeBySlug(params.slug)
  if (!rt) notFound()

  const record = await getRecordById(params.id)
  if (!record) notFound()

  const fields = getFieldConfig(rt.id)

  return <RecordDetail record={record} fields={fields} recordTypeName={rt.name} />
}
