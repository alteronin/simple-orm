'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StackCard, FieldDefinition, AppRecord } from '@/types'
import { RecurringValue, isRecurringExpired, getRecurringDisplay } from '@/lib/recurring'

interface StackCardItemProps {
  card: StackCard & { record: AppRecord }
  displayFields: string[]
  fields: FieldDefinition[]
  onClick: (recordId: string) => void
}

function getFieldLabel(fields: FieldDefinition[], name: string): string {
  return fields.find(f => f.name === name)?.label || name
}

function formatValue(value: any, type?: string): string {
  if (value === null || value === undefined || value === '') return '—'
  if (type === 'boolean') return value ? 'Yes' : 'No'
  if (type === 'recurring') {
    const v = value as RecurringValue
    if (!v?.completed) return 'Not done'
    return isRecurringExpired(v, (arguments as any)[1]) ? 'Expired' : 'Done'
  }
  if (type === 'date' && typeof value === 'string') {
    try { return new Date(value).toLocaleDateString() } catch { return value }
  }
  return String(value)
}

export function StackCardItem({ card, displayFields, fields, onClick }: StackCardItemProps) {
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
      onClick={(e) => {
        e.stopPropagation()
        onClick(card.record.id)
      }}
      className={`rounded-md border border-border bg-background p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md hover:border-accent-foreground/20 ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-foreground leading-tight">
          {String(title)}
        </span>
      </div>
      {displayFields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {displayFields.map(fieldName => {
            if (fieldName === 'title' || fieldName === 'name' || fieldName === 'content') return null
            const val = data[fieldName]
            const field = fields.find(f => f.name === fieldName)

            if (field?.type === 'recurring') {
              const rv = val as RecurringValue | null
              const interval = field.interval || 'day'
              const expired = isRecurringExpired(rv, interval)
              const done = rv?.completed && !expired
              return (
                <span
                  key={fieldName}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                    done
                      ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {done ? `✓ Done ${getRecurringDisplay(interval)}` : getFieldLabel(fields, fieldName)}
                </span>
              )
            }

            if (val === null || val === undefined || val === '') return null
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
