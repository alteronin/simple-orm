'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StackCard, FieldDefinition, AppRecord } from '@/types'
import Link from 'next/link'

interface StackCardItemProps {
  card: StackCard & { record: AppRecord }
  displayFields: string[]
  fields: FieldDefinition[]
}

function getFieldLabel(fields: FieldDefinition[], name: string): string {
  return fields.find(f => f.name === name)?.label || name
}

function formatValue(value: any, type?: string): string {
  if (value === null || value === undefined || value === '') return '—'
  if (type === 'boolean') return value ? 'Yes' : 'No'
  if (type === 'date' && typeof value === 'string') {
    try { return new Date(value).toLocaleDateString() } catch { return value }
  }
  return String(value)
}

export function StackCardItem({ card, displayFields, fields }: StackCardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })
  const data = card.record?.data || {}
  const title = data.title || data.name || data.content || 'Untitled'

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-md border border-border bg-background p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/${card.record.record_type_id}/${card.record.id}`}
          className="text-sm font-medium text-foreground hover:underline leading-tight"
          onClick={e => e.stopPropagation()}
        >
          {String(title)}
        </Link>
      </div>
      {displayFields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {displayFields.map(fieldName => {
            if (fieldName === 'title' || fieldName === 'name' || fieldName === 'content') return null
            const val = data[fieldName]
            if (val === null || val === undefined || val === '') return null
            const field = fields.find(f => f.name === fieldName)
            return (
              <span
                key={fieldName}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                <span className="text-muted-foreground">{getFieldLabel(fields, fieldName)}:</span>
                <span className="font-medium">{formatValue(val, field?.type)}</span>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
