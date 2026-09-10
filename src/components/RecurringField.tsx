'use client'

import { RecurringValue, isRecurringExpired, getRecurringDisplay } from '@/lib/recurring'
import { FieldDefinition } from '@/types'

interface RecurringFieldProps {
  field: FieldDefinition
  value: RecurringValue | null
  onChange: (value: RecurringValue) => void
  readOnly?: boolean
}

export function RecurringField({ field, value, onChange, readOnly }: RecurringFieldProps) {
  const interval = field.interval || 'day'
  const expired = isRecurringExpired(value, interval)
  const isCompleted = value?.completed && !expired

  const handleToggle = () => {
    if (readOnly) return
    if (isCompleted) {
      onChange({ completed: false, completed_at: null })
    } else {
      onChange({ completed: true, completed_at: new Date().toISOString() })
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={readOnly}
        className={`shrink-0 h-5 w-5 rounded border transition-colors flex items-center justify-center ${
          isCompleted
            ? 'bg-primary border-primary text-primary-foreground'
            : 'bg-background border-border hover:border-primary/50'
        } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {isCompleted && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>
      <span className="text-sm text-muted-foreground">
        {isCompleted ? (
          <span className="text-green-500">Done {getRecurringDisplay(interval)}</span>
        ) : (
          <span>Done {getRecurringDisplay(interval)}</span>
        )}
      </span>
    </div>
  )
}
