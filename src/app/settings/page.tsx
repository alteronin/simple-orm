'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createRecordType, updateRecordType, deleteRecordType } from '@/lib/actions'
import { RecordType, FieldDefinition } from '@/types'
import { useToast } from '@/components/Toast'

const FIELD_TYPES = ['text', 'number', 'select', 'boolean', 'date', 'link', 'recurring']
const RESERVED_SLUGS = ['settings', 'stacks', 'api', 'new', 'edit']

export default function SettingsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<RecordType | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const fetchTypes = async () => {
    const { data } = await supabase.from('record_types').select('*').order('created_at', { ascending: true })
    if (data) setRecordTypes(data as RecordType[])
    setLoading(false)
  }

  useEffect(() => { fetchTypes() }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record Types</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your record types and fields</p>
        </div>
        <button
          onClick={() => { setShowNewForm(true); setEditing(null) }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <svg className="shrink-0 h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Record Type
        </button>
      </div>

      {(showNewForm || editing) && (
        <RecordTypeForm
          recordTypes={recordTypes}
          initial={editing}
          onCancel={() => { setShowNewForm(false); setEditing(null) }}
          onSave={async (data) => {
            try {
              if (editing) {
                await updateRecordType(editing.id, data)
                addToast('Record type updated', 'success')
              } else {
                await createRecordType(data as { id: string; name: string; slug: string; fields: FieldDefinition[] })
                addToast('Record type created', 'success')
              }
              setShowNewForm(false)
              setEditing(null)
              fetchTypes()
              router.refresh()
            } catch (e: any) {
              addToast(e.message || 'Failed to save', 'error')
            }
          }}
        />
      )}

      <div className="space-y-3">
        {recordTypes.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No record types yet. Create one to get started.</p>
          </div>
        ) : (
          recordTypes.map((rt) => (
            <div key={rt.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{rt.name}</span>
                    <code className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">/{rt.slug}</code>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {rt.fields.map((f: FieldDefinition) => (
                      <span key={f.name} className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground rounded-md px-2 py-0.5">
                        {f.label || f.name}
                        <span className="text-muted-foreground">({f.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setEditing(rt); setShowNewForm(false) }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
                  >
                    <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete "${rt.name}"? This will also delete all its records.`)) return
                      try {
                        await deleteRecordType(rt.id)
                        addToast('Record type deleted', 'success')
                        fetchTypes()
                        router.refresh()
                      } catch (e: any) {
                        addToast(e.message || 'Failed to delete', 'error')
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                  >
                    <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RecordTypeForm({
  recordTypes,
  initial,
  onCancel,
  onSave,
}: {
  recordTypes: RecordType[]
  initial: RecordType | null
  onCancel: () => void
  onSave: (data: any) => void
}) {
  const [name, setName] = useState(initial?.name || '')
  const [slug, setSlug] = useState(initial?.slug || '')
  const [fields, setFields] = useState<FieldDefinition[]>(initial?.fields || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addField = () => {
    setFields([...fields, { name: '', type: 'text', label: '', required: false }])
  }

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const s = slug.trim().toLowerCase()
    const n = name.trim()
    if (!n) { setError('Name is required'); return }
    if (!s) { setError('Slug is required'); return }
    if (!/^[a-z0-9]+$/.test(s)) { setError('Slug can only contain lowercase letters and numbers'); return }
    if (RESERVED_SLUGS.includes(s)) { setError(`"${s}" is a reserved name and cannot be used`); return }
    if (s.length > 50) { setError('Slug is too long (max 50 characters)'); return }
    if (!initial) {
      const exists = recordTypes.some(rt => rt.slug === s)
      if (exists) { setError(`A record type with slug "${s}" already exists`); return }
    }
    const validFields = fields.filter(f => f.name.trim())
    const dupNames = validFields.filter((f, i) => validFields.findIndex(x => x.name === f.name) !== i)
    if (dupNames.length > 0) { setError(`Duplicate field name: "${dupNames[0].name}"`); return }
    setSaving(true)
    await onSave({ id: s, name: n, slug: s, fields: validFields })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="font-semibold text-foreground">{initial ? 'Edit Record Type' : 'New Record Type'}</h3>
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (!initial) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')) }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. Deal"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. deal"
            required
            disabled={!!initial}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Fields</label>
          <button type="button" onClick={addField} className="text-sm text-primary hover:text-primary/80">+ Add Field</button>
        </div>
        {fields.map((field, i) => (
          <div key={i} className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField(i, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              placeholder="field_name"
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(i, { label: e.target.value })}
              placeholder="Label"
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={field.type}
              onChange={(e) => updateField(i, { type: e.target.value as FieldDefinition['type'] })}
              className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {field.type === 'select' && (
              <input
                type="text"
                value={field.options?.join(', ') || ''}
                onChange={(e) => updateField(i, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="opt1, opt2"
                className="w-40 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            {field.type === 'link' && (
              <select
                value={field.targetType || ''}
                onChange={(e) => updateField(i, { targetType: e.target.value })}
                className="w-40 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Link to...</option>
                {recordTypes.filter(rt => rt.id !== slug).map(rt => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            )}
            {field.type === 'recurring' && (
              <select
                value={field.interval || 'day'}
                onChange={(e) => updateField(i, { interval: e.target.value as 'day' | 'week' | 'month' })}
                className="w-32 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            )}
            <button type="button" onClick={() => removeField(i)} className="text-muted-foreground hover:text-destructive p-1">
              <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50">
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Record Type'}
        </button>
        <button type="button" onClick={onCancel} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  )
}
