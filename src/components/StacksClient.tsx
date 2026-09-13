'use client'

import { useState, useEffect, useCallback } from 'react'
import { StackWithCards, RecordType } from '@/types'
import { createStack, deleteStack, updateStack, populateStackFromType, getStacks } from '@/lib/actions'
import { StackBoard } from '@/components/StackBoard'
import { StackCreateModal } from '@/components/StackCreateModal'
import { RecordModal } from '@/components/RecordModal'
import { useToast } from '@/components/Toast'

interface StacksClientProps {
  stacks: StackWithCards[]
  recordTypes: RecordType[]
}

export function StacksClient({ stacks: initialStacks, recordTypes }: StacksClientProps) {
  const [stacks, setStacks] = useState<StackWithCards[]>(initialStacks)
  const [showCreate, setShowCreate] = useState(false)
  const [editingStack, setEditingStack] = useState<StackWithCards | null>(null)
  const [modalRecordId, setModalRecordId] = useState<string | null>(null)
  const [syncingStackId, setSyncingStackId] = useState<string | null>(null)
  const [isInitialSync, setIsInitialSync] = useState(true)
  const { addToast } = useToast()

  const loadData = useCallback(async () => {
    const stacksData = await getStacks()
    setStacks(stacksData)
  }, [])

  useEffect(() => {
    if (initialStacks.length === 0) { setIsInitialSync(false); return }
    let cancelled = false
    const syncAll = async () => {
      let changed = false
      for (const stack of initialStacks) {
        if (cancelled) return
        try {
          const count = await populateStackFromType(stack.id)
          if (count > 0) changed = true
        } catch {}
      }
      if (!cancelled) {
        if (changed) await loadData()
        setIsInitialSync(false)
      }
    }
    syncAll()
    return () => { cancelled = true }
  }, [])

  const handleCreate = async (data: { name: string; record_type_id?: string; display_fields: string[]; quick_update_fields?: string[]; filter_criteria?: any }) => {
    if (!data.record_type_id) return
    try {
      const stack = await createStack({ name: data.name, record_type_id: data.record_type_id, display_fields: data.display_fields, quick_update_fields: data.quick_update_fields, filter_criteria: data.filter_criteria })
      const count = await populateStackFromType(stack.id)
      addToast(count > 0 ? `Stack created with ${count} card${count === 1 ? '' : 's'}` : 'Stack created (no matching records)', 'success')
      await loadData()
      setShowCreate(false)
    } catch (e: any) {
      addToast(e.message || 'Failed to create stack', 'error')
    }
  }

  const handleUpdate = async (data: { name: string; display_fields: string[]; quick_update_fields?: string[]; filter_criteria?: any }) => {
    if (!editingStack) return
    try {
      await updateStack(editingStack.id, data)
      const count = await populateStackFromType(editingStack.id)
      await loadData()
      addToast(count > 0 ? `Stack updated — synced ${count} record${count === 1 ? '' : 's'}` : 'Stack updated', 'success')
      setEditingStack(null)
    } catch (e: any) {
      addToast(e.message || 'Failed to update stack', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    const stack = stacks.find(s => s.id === id)
    if (!confirm(`Delete "${stack?.name || 'this stack'}"? This will remove all cards but keep the records.`)) return
    const prev = stacks
    setStacks(s => s.filter(st => st.id !== id))
    try {
      await deleteStack(id)
      addToast('Stack deleted', 'success')
    } catch (e: any) {
      setStacks(prev)
      addToast(e.message || 'Failed to delete stack', 'error')
    }
  }

  const handlePopulate = async (stackId: string) => {
    setSyncingStackId(stackId)
    try {
      const count = await populateStackFromType(stackId)
      await loadData()
      addToast(count > 0 ? `Synced ${count} new card${count === 1 ? '' : 's'}` : 'All cards up to date', 'success')
    } catch (e: any) {
      addToast(e.message || 'Failed to sync records', 'error')
    } finally {
      setSyncingStackId(null)
    }
  }

  const handleFieldUpdate = (recordId: string, fieldName: string, value: any) => {
    setStacks(prev => prev.map(stack => ({
      ...stack,
      cards: stack.cards.map(card =>
        card.record_id === recordId
          ? { ...card, record: { ...card.record, data: { ...card.record.data, [fieldName]: value } } }
          : card
      )
    })))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stacks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize your records into customizable boards
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <svg className="shrink-0 h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Stack
        </button>
      </div>

      {isInitialSync && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2.5">
          <svg className="shrink-0 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Syncing stacks...
        </div>
      )}

      {stacks.length === 0 && !isInitialSync ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          <svg className="shrink-0 h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <p className="text-lg font-medium mb-1">No stacks yet</p>
          <p className="text-sm mb-4">Create a stack to organize your records</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
          >
            Create Stack
          </button>
        </div>
      ) : (
        <StackBoard
          stacks={stacks}
          recordTypes={recordTypes}
          onEdit={setEditingStack}
          onDelete={handleDelete}
          onPopulate={handlePopulate}
          onCardClick={setModalRecordId}
          onFieldUpdate={handleFieldUpdate}
          syncingStackId={syncingStackId}
        />
      )}

      {showCreate && (
        <StackCreateModal
          recordTypes={recordTypes}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editingStack && (
        <StackCreateModal
          recordTypes={recordTypes}
          stack={editingStack}
          onSubmit={handleUpdate}
          onClose={() => setEditingStack(null)}
        />
      )}

      {modalRecordId && (
        <RecordModal
          recordId={modalRecordId}
          onClose={() => setModalRecordId(null)}
          onSaved={loadData}
          onDeleted={loadData}
        />
      )}
    </div>
  )
}
