'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { StackWithCards, RecordType, AppRecord, StackCard } from '@/types'
import { StackColumn } from './StackColumn'
import { reorderStackCards, removeCardFromStack } from '@/lib/actions'

interface StackBoardProps {
  stacks: StackWithCards[]
  recordTypes: RecordType[]
  onEdit: (stack: StackWithCards) => void
  onDelete: (id: string) => void
  onPopulate: (id: string) => void
  onCardClick: (recordId: string) => void
  onFieldUpdate?: (recordId: string, fieldName: string, value: any) => void
  syncingStackId?: string | null
}

function getCardSortValue(card: StackCard & { record: AppRecord }, fieldName: string): string {
  const val = card.record?.data?.[fieldName]
  if (val === null || val === undefined || val === '') return '\uffff'
  if (typeof val === 'boolean') return val ? '1' : '0'
  if (typeof val === 'number') return String(val).padStart(10, '0')
  return String(val).toLowerCase()
}

function getSortedCards(cards: (StackCard & { record: AppRecord })[], sortField: string, sortDir: 'asc' | 'desc') {
  if (!sortField) return cards
  return [...cards].sort((a, b) => {
    const av = getCardSortValue(a, sortField)
    const bv = getCardSortValue(b, sortField)
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })
}

export function StackBoard({ stacks, recordTypes, onEdit, onDelete, onPopulate, onCardClick, onFieldUpdate, syncingStackId }: StackBoardProps) {
  const [activeStackId, setActiveStackId] = useState<string | null>(null)
  const [sortStates, setSortStates] = useState<Record<string, { field: string; dir: 'asc' | 'desc' }>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const stack = stacks.find(s => s.cards.some(c => c.id === active.id))
    if (stack) setActiveStackId(stack.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeStack = stacks.find(s => s.cards.some(c => c.id === active.id))
    const overStack = stacks.find(s => s.cards.some(c => c.id === over.id))

    if (!activeStack || !overStack || activeStack.id === overStack.id) return
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveStackId(null)

    if (!over) return

    const activeStack = stacks.find(s => s.cards.some(c => c.id === active.id))
    const overStack = stacks.find(s => s.cards.some(c => c.id === over.id))

    if (!activeStack || !overStack) return

    if (activeStack.id === overStack.id) {
      const sort = sortStates[activeStack.id]
      const sorted = getSortedCards(activeStack.cards, sort?.field || '', sort?.dir || 'asc')
      const oldIdx = sorted.findIndex(c => c.id === active.id)
      const newIdx = sorted.findIndex(c => c.id === over.id)
      if (oldIdx !== newIdx) {
        const newSorted = arrayMove(sorted, oldIdx, newIdx)
        await reorderStackCards(activeStack.id, newSorted.map(c => c.id))
      }
    } else {
      const overSort = sortStates[overStack.id]
      const overSorted = getSortedCards(overStack.cards, overSort?.field || '', overSort?.dir || 'asc')
      const overIdx = overSorted.findIndex(c => c.id === over.id)
      const movedCard = activeStack.cards.find(c => c.id === active.id)
      if (movedCard) {
        const newOverCards = [...overSorted]
        newOverCards.splice(overIdx >= 0 ? overIdx : newOverCards.length, 0, movedCard)
        await reorderStackCards(overStack.id, newOverCards.map(c => c.id))
      }
    }
  }

  const handleSortChange = (stackId: string, field: string, dir: 'asc' | 'desc') => {
    setSortStates(prev => ({ ...prev, [stackId]: { field, dir } }))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(25%,1fr))]">
        {stacks.map(stack => (
          <StackColumn
            key={stack.id}
            stack={stack}
            sortField={sortStates[stack.id]?.field || ''}
            sortDir={sortStates[stack.id]?.dir || 'asc'}
            onSortChange={(field, dir) => handleSortChange(stack.id, field, dir)}
            onEdit={() => onEdit(stack)}
            onDelete={() => onDelete(stack.id)}
            onPopulate={() => onPopulate(stack.id)}
            onCardClick={onCardClick}
            onFieldUpdate={onFieldUpdate}
            isDragging={activeStackId === stack.id}
            isSyncing={syncingStackId === stack.id}
          />
        ))}
      </div>
    </DndContext>
  )
}
