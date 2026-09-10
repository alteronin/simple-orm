'use client'

import { useState, useRef, useEffect } from 'react'
import { FieldDefinition } from '@/types'
import { updateRecordField } from '@/lib/actions'
import { useToast } from './Toast'

interface InlineEditableFieldProps {
  recordId: string
  field: FieldDefinition
  value: string | number | boolean | null
  onSaved: (newValue: string | number | boolean | null) => void
}

export function InlineEditableField({ recordId, field, value, onSaved }: InlineEditableFieldProps) {
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value ?? ''))
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editing])

  const save = async () => {
    let newValue: string | number | boolean | null = editValue

    if (field.type === 'number') {
      newValue = editValue === '' ? null : Number(editValue)
      if (editValue !== '' && isNaN(newValue as number)) {
        addToast('Invalid number', 'error')
        setEditing(false)
        return
      }
    }

    if (field.type === 'boolean') {
      newValue = !value
    }

    if (String(newValue) === String(value ?? '')) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await updateRecordField(recordId, field.name, newValue)
      addToast(`${field.label || field.name} updated`, 'success')
      onSaved(newValue)
      setEditing(false)
    } catch (e: any) {
      addToast(e.message || 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setEditing(false)
  }

  if (field.type === 'boolean') {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); save() }}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
          value
            ? 'bg-primary/20 text-primary border-primary/30'
            : 'bg-secondary text-secondary-foreground border-border'
        }`}
      >
        {value ? '✓ ' : ''}{field.label || field.name}
      </button>
    )
  }

  if (field.type === 'select' && editing) {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        value={editValue}
        onChange={(e) => { setEditValue(e.target.value); save() }}
        onBlur={() => setEditing(false)}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="rounded-md border border-primary bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">—</option>
        {field.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={field.type === 'number' ? 'text' : field.type === 'date' ? 'date' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        disabled={saving}
        className="w-24 rounded-md border border-primary bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
      />
    )
  }

  const displayValue = value !== null && value !== undefined && value !== '' ? String(value) : null

  if (field.type === 'select') {
    return (
      <button
        onDoubleClick={(e) => { e.stopPropagation(); setEditValue(String(value ?? '')); setEditing(true) }}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer hover:border-primary ${
          displayValue ? 'bg-secondary text-secondary-foreground border-border' : 'bg-muted text-muted-foreground border-transparent'
        }`}
      >
        {field.label}: {displayValue || '—'}
      </button>
    )
  }

  return (
    <span
      onDoubleClick={(e) => { e.stopPropagation(); setEditValue(String(value ?? '')); setEditing(true) }}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer hover:border-primary ${
        displayValue ? 'bg-secondary text-secondary-foreground border-border' : 'bg-muted text-muted-foreground border-transparent'
      }`}
    >
      {field.label}: {displayValue || '—'}
    </span>
  )
}
