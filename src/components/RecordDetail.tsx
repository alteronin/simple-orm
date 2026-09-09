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
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-text-muted hover:text-text text-sm transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-text">{recordTypeName}</h2>
      </div>

      <div className="bg-bg-card border border-border rounded-lg p-6 space-y-4">
        {fields.map((field) => {
          const val = record.data[field.name]
          return (
            <div key={field.name}>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {field.label}
              </label>
              <p className="text-text mt-1">
                {val === null || val === undefined || val === '' ? (
                  <span className="text-text-muted italic">—</span>
                ) : field.type === 'boolean' ? (
                  <span className={val ? 'text-green-400' : 'text-red-400'}>
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
          className="px-4 py-2 bg-text-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Edit
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="px-4 py-2 border border-red-600 text-red-400 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-colors"
        >
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
