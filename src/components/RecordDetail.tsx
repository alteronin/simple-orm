'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppRecord, FieldDefinition } from '@/types'
import { ConfirmDialog } from './ConfirmDialog'
import { useDeleteRecord } from '@/hooks/useRecords'

interface RecordDetailProps {
  record: AppRecord
  fields: FieldDefinition[]
  recordTypeName: string
}

export function RecordDetail({ record, fields, recordTypeName }: RecordDetailProps) {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const { mutate: deleteRecord } = useDeleteRecord()

  const handleDelete = () => {
    deleteRecord(record.id)
    router.push(`/${record.record_type_id}`)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
        >
          <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold tracking-tight">{recordTypeName}</h2>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        {fields.map((field) => {
          const val = record.data[field.name]
          return (
            <div key={field.name} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {field.label}
              </label>
              <p className="text-foreground">
                {val === null || val === undefined || val === '' ? (
                  <span className="text-muted-foreground italic">—</span>
                ) : field.type === 'boolean' ? (
                  <span className={val ? 'text-green-500' : 'text-red-500'}>
                    {val ? 'Yes' : 'No'}
                  </span>
                ) : (
                  String(val)
                )}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/${record.record_type_id}/${record.id}/edit`)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
        >
          <svg className="shrink-0 h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3"
        >
          <svg className="shrink-0 h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Delete
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        title="Delete Record"
        message={`Are you sure you want to delete this ${recordTypeName}? This action cannot be undone.`}
      />
    </div>
  )
}
