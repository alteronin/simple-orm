'use client'

import { useState, useEffect } from 'react'
import { AppRecord, FieldDefinition, RecordType } from '@/types'
import { supabase } from '@/lib/supabase'
import { updateRecord, deleteRecord as deleteRecordServer } from '@/lib/actions'
import { useToast } from './Toast'
import { useDeleteRecord } from '@/hooks/useRecords'
import { ConfirmDialog } from './ConfirmDialog'
import { RecordNotes } from './RecordNotes'
import { RecordHistory } from './RecordHistory'
import { RecurringField } from './RecurringField'
import { RecurringValue, checkAndResetRecurring } from '@/lib/recurring'

interface RecordModalProps {
  recordId: string
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
}

export function RecordModal({ recordId, onClose, onSaved, onDeleted }: RecordModalProps) {
  const [record, setRecord] = useState<AppRecord | null>(null)
  const [rt, setRt] = useState<RecordType | null>(null)
  const [editing, setEditing] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, any>>({})
  const [showDelete, setShowDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()
  const { mutate: deleteRecord } = useDeleteRecord()

  useEffect(() => {
    const load = async () => {
      const { data: rec } = await supabase.from('records').select('*').eq('id', recordId).single()
      if (!rec) { onClose(); return }
      setRecord(rec as AppRecord)
      // Check and reset recurring fields
      const { data: rtData } = await supabase.from('record_types').select('*').eq('id', rec.record_type_id).single()
      if (rtData) {
        setRt(rtData as RecordType)
        const resetData = checkAndResetRecurring(rec.data, rtData.fields as FieldDefinition[])
        if (resetData !== rec.data) {
          await updateRecord(rec.id, resetData)
          setRecord({ ...rec, data: resetData })
        }
        setEditValues({ ...resetData })
      }
    }
    load()
  }, [recordId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateRecord(record!.id, editValues)
      setRecord({ ...record!, data: editValues })
      setEditing(false)
      addToast('Record updated', 'success')
      onSaved()
    } catch (e: any) {
      addToast(e.message || 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    deleteRecord(record!.id)
    addToast('Record deleted', 'success')
    onDeleted()
    onClose()
  }

  if (!record || !rt) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-center py-8 text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  const fields = rt.fields || []

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-card z-10">
            <div>
              <h2 className="text-lg font-semibold">{rt.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{record.id.slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  <svg className="shrink-0 h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </button>
              )}
              <button
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive h-9 w-9"
              >
                <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9"
              >
                <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="px-6 py-4 space-y-4">
            {fields.map(field => {
              const val = record.data[field.name]
              if (editing) {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</label>
                    {field.type === 'recurring' ? (
                      <RecurringField
                        field={field}
                        value={(editValues[field.name] as unknown as RecurringValue) || null}
                        onChange={(v) => setEditValues(prev => ({ ...prev, [field.name]: v }))}
                      />
                    ) : field.type === 'text' || field.type === 'date' ? (
                      <input
                        type={field.type}
                        value={String(editValues[field.name] || '')}
                        onChange={e => setEditValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        value={Number(editValues[field.name] || 0)}
                        onChange={e => setEditValues(prev => ({ ...prev, [field.name]: Number(e.target.value) }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    ) : field.type === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editValues[field.name]}
                          onChange={e => setEditValues(prev => ({ ...prev, [field.name]: e.target.checked }))}
                          className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-ring"
                        />
                        <span className="text-sm text-muted-foreground">{editValues[field.name] ? 'Yes' : 'No'}</span>
                      </label>
                    ) : field.type === 'select' ? (
                      <select
                        value={String(editValues[field.name] || '')}
                        onChange={e => setEditValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={String(editValues[field.name] || '')}
                        onChange={e => setEditValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={2}
                      />
                    ) : null}
                  </div>
                )
              }

              // Read-only view
              return (
                <div key={field.name} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</span>
                  {field.type === 'recurring' ? (
                    <RecurringField
                      field={field}
                      value={(val as unknown as RecurringValue) || null}
                      onChange={() => {}}
                      readOnly
                    />
                  ) : val === null || val === undefined || val === '' ? (
                    <span className="text-sm text-muted-foreground italic">—</span>
                  ) : field.type === 'boolean' ? (
                    <span className={`text-sm font-medium ${val ? 'text-green-500' : 'text-red-500'}`}>{val ? 'Yes' : 'No'}</span>
                  ) : (
                    <span className="text-sm">{String(val)}</span>
                  )}
                </div>
              )
            })}

            {editing && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditValues(record.data) }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-border bg-background hover:bg-accent h-9 px-4"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="border-t border-border px-6 py-4">
            <RecordNotes recordId={record.id} />
          </div>

          {/* History */}
          <div className="border-t border-border px-6 py-4">
            <RecordHistory recordId={record.id} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        title="Delete Record"
        message={`Are you sure you want to delete this ${rt.name}? This action cannot be undone.`}
      />
    </>
  )
}
