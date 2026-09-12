import { getRecordsByTypeId, getRecordTypeBySlug, getLinkedRecords, LinkedRecordInfo } from '@/lib/record-operations'
import { RecordList } from '@/components/RecordList'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export default async function RecordTypePage({ params, searchParams }: PageProps) {
  const rt = await getRecordTypeBySlug(params.slug)
  if (!rt) notFound()

  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const { records, total } = await getRecordsByTypeId(rt.id, page)
  const totalPages = Math.ceil(total / 10)

  const linkPairs: { recordId: string; targetType: string }[] = []
  for (const record of records) {
    for (const field of rt.fields) {
      if (field.type === 'link' && record.data[field.name]) {
        linkPairs.push({ recordId: String(record.data[field.name]), targetType: field.targetType || '' })
      }
    }
  }
  const linkedRecordsMap = await getLinkedRecords(linkPairs)
  const linkedRecords: Record<string, LinkedRecordInfo> = {}
  linkedRecordsMap.forEach((val, key) => { linkedRecords[key] = val })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{rt.name}s</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} {total === 1 ? 'record' : 'records'}
          </p>
        </div>
        <Link
          href={`/${rt.slug}/new`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <svg className="shrink-0 h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New {rt.name}
        </Link>
      </div>
      <RecordList records={records} loading={false} fields={rt.fields} recordTypeName={rt.name} recordTypeId={rt.id} totalRecords={total} totalPages={totalPages} currentPage={page} linkedRecords={linkedRecords} />
    </div>
  )
}
