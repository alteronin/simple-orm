'use client'

import { useRouter } from 'next/navigation'
import { AppRecord, FieldDefinition } from '@/types'
import { EmptyState } from './EmptyState'

interface RecordListProps {
  records: AppRecord[]
  loading: boolean
  fields: FieldDefinition[]
  recordTypeName: string
}

export function RecordList({ records, loading, fields, recordTypeName }: RecordListProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return <EmptyState recordTypeName={recordTypeName} />
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          onClick={() => router.push(`/${record.record_type_id}/${record.id}`)}
          className="group rounded-lg border border-border bg-card p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {String(record.data[fields[0]?.name] || record.id)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                {record.id.slice(0, 8)}
              </span>
              <svg className="shrink-0 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fields.slice(1).map((field) => {
              const val = record.data[field.name]
              if (val === null || val === undefined || val === '') return null
              return (
                <span key={field.name} className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold bg-secondary text-secondary-foreground">
                  {field.label}: {String(val)}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
