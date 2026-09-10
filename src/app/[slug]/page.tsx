import { getRecordTypes, getRecordsByTypeId } from '@/lib/record-operations'
import { RecordList } from '@/components/RecordList'
import { getFieldConfig, getRecordTypeBySlug } from '@/config/record-types'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

export default async function RecordTypePage({ params }: PageProps) {
  const rt = getRecordTypeBySlug(params.slug)
  if (!rt) notFound()

  const records = await getRecordsByTypeId(rt.id)
  const fields = getFieldConfig(rt.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">{rt.name}s</h1>
        <a
          href={`/${rt.slug}/new`}
          className="px-4 py-2 bg-text-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          New {rt.name}
        </a>
      </div>
      <RecordList records={records} loading={false} fields={fields} recordTypeName={rt.name} />
    </div>
  )
}
