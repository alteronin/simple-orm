'use client'

import { useState } from 'react'
import { FieldDefinition } from '@/types'
import { LinkFieldEditor } from './LinkFieldEditor'

export function RecordForm({
  fields,
  initialData,
  onSubmit,
  submitting,
  submitLabel = 'Save',
}: {
  fields: FieldDefinition[]
  initialData?: Record<string, string | number | boolean | null>
  onSubmit: (data: Record<string, string | number | boolean | null>) => void
  submitting: boolean
  submitLabel?: string
}) {
  const [values, setValues] = useState<Record<string, string | number | boolean | null>>(() => {
    const initial: Record<string, string | number | boolean | null> = {}
    fields.forEach((f) => {
      initial[f.name] = initialData?.[f.name] ?? f.default ?? (f.type === 'boolean' ? false : '')
    })
    return initial
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: string | number | boolean | null) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required) {
        const val = values[f.name]
        if (val === '' || val === null || val === undefined) {
          errors[f.name] = `${f.label} is required`
        }
      }
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="text-sm font-medium leading-none">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          {renderFieldInput(field, values[field.name], (val) => handleChange(field.name, val))}
          {validationErrors[field.name] && (
            <p className="text-xs text-destructive">{validationErrors[field.name]}</p>
          )}
        </div>
      ))}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50 w-full"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="shrink-0 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}

function renderFieldInput(
  field: FieldDefinition,
  value: string | number | boolean | null,
  onChange: (val: string | number | boolean | null) => void
) {
  switch (field.type) {
    case 'text':
    case 'date':
      return (
        <input
          type={field.type}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={(value as number) || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )
    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-border bg-background text-primary focus:ring-ring focus:ring-offset-0"
          />
          <span className="text-sm text-muted-foreground">{value ? 'Yes' : 'No'}</span>
        </label>
      )
    case 'textarea':
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      )
    case 'link':
      return (
        <LinkFieldEditor
          targetType={field.targetType || ''}
          value={(value as string) || null}
          onChange={(id) => onChange(id)}
        />
      )
    default:
      return null
  }
}
