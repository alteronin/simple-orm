'use client'

import { useRouter } from 'next/navigation'
import { AppRecord, FieldDefinition } from '@/types'
import { RecordTypeNav } from './RecordTypeNav'
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
          <div key={i} className="h-12 bg-bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return <EmptyState recordTypeName={recordTypeName} />
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div
          key={record.id}
          onClick={() => router.push(`/${record.record_type_id}/${record.id}`)}
          className="bg-bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-text-accent transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text">
              {String(record.data[fields[0]?.name] || record.id)}
            </h3>
            <span className="text-xs text-text-muted">{record.id.slice(0, 8)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {fields.slice(1).map((field) => {
              const val = record.data[field.name]
              if (val === null || val === undefined || val === '') return null
              return (
                <span key={field.name} className="text-xs px-2 py-1 bg-bg rounded text-text-muted">
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
