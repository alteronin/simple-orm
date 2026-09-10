'use client'

import { useState, useEffect } from 'react'
import { RecordType, StackWithCards, FilterCriterion } from '@/types'

interface StackCreateModalProps {
  recordTypes: RecordType[]
  stack?: StackWithCards
  onSubmit: (data: { name: string; record_type_id?: string; display_fields: string[]; filter_criteria?: FilterCriterion[] }) => void
  onClose: () => void
}

const OPERATORS = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'gte', label: '≥' },
  { value: 'lte', label: '≤' },
]

export function StackCreateModal({ recordTypes, stack, onSubmit, onClose }: StackCreateModalProps) {
  const [name, setName] = useState(stack?.name || '')
  const [recordTypeId, setRecordTypeId] = useState(stack?.record_type_id || '')
  const [displayFields, setDisplayFields] = useState<string[]>(stack?.display_fields || [])
  const [filterCriteria, setFilterCriteria] = useState<FilterCriterion[]>(stack?.filter_criteria || [])
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

  const addFilter = () => {
    const firstField = availableFields[0]
    setFilterCriteria([...filterCriteria, { field: firstField?.name || '', operator: 'eq', value: '' }])
  }

  const updateFilter = (index: number, updates: Partial<FilterCriterion>) => {
    const newFilters = [...filterCriteria]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilterCriteria(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilterCriteria(filterCriteria.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!isEditing && !recordTypeId) return
    const validFilters = filterCriteria.filter(f => f.field && f.value)
    onSubmit({
      name: name.trim(),
      record_type_id: recordTypeId,
      display_fields: displayFields,
      filter_criteria: validFilters.length > 0 ? validFilters : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg max-h-[85vh] overflow-y-auto"
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
                onChange={e => { setRecordTypeId(e.target.value); setFilterCriteria([]) }}
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

          {availableFields.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">
                  Filter Criteria <span className="text-muted-foreground font-normal">(optional, for sync)</span>
                </label>
                <button type="button" onClick={addFilter} className="text-sm text-primary hover:text-primary/80">+ Add Filter</button>
              </div>
              {filterCriteria.length === 0 ? (
                <p className="text-xs text-muted-foreground">No filters — all records will be synced</p>
              ) : (
                <div className="space-y-2">
                  {filterCriteria.map((filter, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={filter.field}
                        onChange={e => updateFilter(i, { field: e.target.value })}
                        className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {availableFields.map(f => (
                          <option key={f.name} value={f.name}>{f.label || f.name}</option>
                        ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={e => updateFilter(i, { operator: e.target.value as FilterCriterion['operator'] })}
                        className="w-28 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {OPERATORS.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={filter.value}
                        onChange={e => updateFilter(i, { value: e.target.value })}
                        placeholder="value"
                        className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button type="button" onClick={() => removeFilter(i)} className="text-muted-foreground hover:text-destructive p-1">
                        <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
