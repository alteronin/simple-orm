import { getRecordById, getRecordTypeBySlug } from '@/lib/record-operations'
import { RecordDetail } from '@/components/RecordDetail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string; id: string }
}

export default async function RecordDetailPage({ params }: PageProps) {
  const rt = await getRecordTypeBySlug(params.slug)
  if (!rt) notFound()

  const record = await getRecordById(params.id)
  if (!record) notFound()

  return <RecordDetail record={record} fields={rt.fields} recordTypeName={rt.name} />
}
