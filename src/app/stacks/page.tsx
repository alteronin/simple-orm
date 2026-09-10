'use client'

import { useState, useEffect } from 'react'
import { StackWithCards, RecordType } from '@/types'
import { getStacks, createStack, deleteStack, updateStack, populateStackFromType } from '@/lib/actions'
import { supabase } from '@/lib/supabase'
import { StackBoard } from '@/components/StackBoard'
import { StackCreateModal } from '@/components/StackCreateModal'
import { RecordModal } from '@/components/RecordModal'
import { useToast } from '@/components/Toast'

export default function StacksPage() {
  const [stacks, setStacks] = useState<StackWithCards[]>([])
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingStack, setEditingStack] = useState<StackWithCards | null>(null)
  const [modalRecordId, setModalRecordId] = useState<string | null>(null)
  const { addToast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [stacksData, typesData] = await Promise.all([
        getStacks(),
        supabase.from('record_types').select('*').order('name'),
      ])
      setStacks(stacksData)
      if (typesData.data) setRecordTypes(typesData.data as RecordType[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async (data: { name: string; record_type_id?: string; display_fields: string[]; filter_criteria?: any }) => {
    if (!data.record_type_id) return
    try {
      await createStack({ name: data.name, record_type_id: data.record_type_id, display_fields: data.display_fields, filter_criteria: data.filter_criteria })
      addToast('Stack created', 'success')
      await loadData()
      setShowCreate(false)
    } catch (e: any) {
      addToast(e.message || 'Failed to create stack', 'error')
    }
  }

  const handleUpdate = async (data: { name: string; display_fields: string[]; filter_criteria?: any }) => {
    if (!editingStack) return
    try {
      await updateStack(editingStack.id, data)
      addToast('Stack updated', 'success')
      await loadData()
      setEditingStack(null)
    } catch (e: any) {
      addToast(e.message || 'Failed to update stack', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    const stack = stacks.find(s => s.id === id)
    if (!confirm(`Delete "${stack?.name || 'this stack'}"? This will remove all cards but keep the records.`)) return
    try {
      await deleteStack(id)
      addToast('Stack deleted', 'success')
      await loadData()
    } catch (e: any) {
      addToast(e.message || 'Failed to delete stack', 'error')
    }
  }

  const handlePopulate = async (stackId: string) => {
    try {
      const count = await populateStackFromType(stackId)
      addToast(count > 0 ? `Added ${count} card${count === 1 ? '' : 's'}` : 'No new records to add', 'success')
      await loadData()
    } catch (e: any) {
      addToast(e.message || 'Failed to sync records', 'error')
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">Loading stacks...</div>
      ) : stacks.length === 0 ? (
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
          onSaved={() => {}}
          onDeleted={loadData}
        />
      )}
    </div>
  )
}
