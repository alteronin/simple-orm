import { getRecordsByTypeId } from '@/lib/record-operations'
import { RecordList } from '@/components/RecordList'
import { getFieldConfig, getRecordTypeBySlug } from '@/config/record-types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export default async function RecordTypePage({ params }: PageProps) {
  const rt = getRecordTypeBySlug(params.slug)
  if (!rt) notFound()

  const records = await getRecordsByTypeId(rt.id)
  const fields = getFieldConfig(rt.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{rt.name}s</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} {records.length === 1 ? 'record' : 'records'}
          </p>
        </div>
        <Link
          href={`/${rt.slug}/new`}
          className="btn-primary"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New {rt.name}
        </Link>
      </div>
      <RecordList records={records} loading={false} fields={fields} recordTypeName={rt.name} />
    </div>
  )
}
