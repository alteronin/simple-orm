'use client'

import { useState, useEffect } from 'react'
import { RecordType, StackWithCards } from '@/types'

interface StackCreateModalProps {
  recordTypes: RecordType[]
  stack?: StackWithCards
  onSubmit: (data: { name: string; record_type_id?: string; display_fields: string[] }) => void
  onClose: () => void
}

export function StackCreateModal({ recordTypes, stack, onSubmit, onClose }: StackCreateModalProps) {
  const [name, setName] = useState(stack?.name || '')
  const [recordTypeId, setRecordTypeId] = useState(stack?.record_type_id || '')
  const [displayFields, setDisplayFields] = useState<string[]>(stack?.display_fields || [])
  const isEditing = !!stack

  const selectedType = recordTypes.find(rt => rt.id === recordTypeId)
  const availableFields = selectedType?.fields || []

  useEffect(() => {
    if (!isEditing && selectedType && displayFields.length === 0) {
      const defaultFields = selectedType.fields
        .filter(f => f.name !== 'title' && f.name !== 'name' && f.name !== 'content')
        .slice(0, 3)
        .map(f => f.name)
      setDisplayFields(defaultFields)
    }
  }, [recordTypeId, isEditing, selectedType, displayFields.length])

  const toggleField = (fieldName: string) => {
    setDisplayFields(prev =>
      prev.includes(fieldName) ? prev.filter(f => f !== fieldName) : [...prev, fieldName]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!isEditing && !recordTypeId) return
    onSubmit({ name: name.trim(), record_type_id: recordTypeId, display_fields: displayFields })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Stack' : 'Create Stack'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., My Tasks"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Record Type</label>
              <select
                value={recordTypeId}
                onChange={e => setRecordTypeId(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a type...</option>
                {recordTypes.map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            </div>
          )}

          {availableFields.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Display Fields <span className="text-muted-foreground font-normal">(shown on cards)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableFields.map(field => (
                  <button
                    key={field.name}
                    type="button"
                    onClick={() => toggleField(field.name)}
                    className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${
                      displayFields.includes(field.name)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {field.label || field.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || (!isEditing && !recordTypeId)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50"
            >
              {isEditing ? 'Save Changes' : 'Create Stack'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
