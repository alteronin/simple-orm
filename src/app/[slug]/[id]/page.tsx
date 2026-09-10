import { getRecordById, getRecordTypeBySlug } from '@/lib/record-operations'
import { RecordDetail } from '@/components/RecordDetail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string; id: string }
}

export default async function RecordDetailPage({ params }: PageProps) {
  const [rt, record] = await Promise.all([
    getRecordTypeBySlug(params.slug),
    getRecordById(params.id),
  ])

  if (!rt || !record) notFound()

  return <RecordDetail record={record} fields={rt.fields} recordTypeName={rt.name} />
}
