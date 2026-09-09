'use client'

import { useState } from 'react'
import { FieldDefinition } from '@/types'

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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          <label className="block text-sm font-medium text-text">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {renderFieldInput(field, values[field.name], (val) => handleChange(field.name, val))}
          {validationErrors[field.name] && (
            <p className="text-xs text-red-400">{validationErrors[field.name]}</p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 bg-text-accent text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity mt-6"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
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
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-accent"
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={(value as number) || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-accent"
        />
      )
    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-accent"
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
            className="w-4 h-4 rounded border-border bg-bg text-text-accent focus:ring-text-accent"
          />
          <span className="text-sm text-text-muted">{value ? 'Yes' : 'No'}</span>
        </label>
      )
    case 'textarea':
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-text-accent"
          rows={3}
        />
      )
    default:
      return null
  }
}
