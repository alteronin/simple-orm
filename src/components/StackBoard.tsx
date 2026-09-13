'use client'

import { useState, useMemo, useRef } from 'react'
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
import { StackWithCards, RecordType, AppRecord } from '@/types'
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

export function StackBoard({ stacks, recordTypes, onEdit, onDelete, onPopulate, onCardClick, onFieldUpdate, syncingStackId }: StackBoardProps) {
  const [activeStackId, setActiveStackId] = useState<string | null>(null)

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
      const oldIdx = activeStack.cards.findIndex(c => c.id === active.id)
      const newIdx = activeStack.cards.findIndex(c => c.id === over.id)
      if (oldIdx !== newIdx) {
        const newCards = arrayMove(activeStack.cards, oldIdx, newIdx)
        await reorderStackCards(activeStack.id, newCards.map(c => c.id))
      }
    } else {
      const overIdx = overStack.cards.findIndex(c => c.id === over.id)
      const movedCard = activeStack.cards.find(c => c.id === active.id)
      if (movedCard) {
        const newOverCards = [...overStack.cards]
        newOverCards.splice(overIdx >= 0 ? overIdx : newOverCards.length, 0, movedCard)
        await reorderStackCards(overStack.id, newOverCards.map(c => c.id))
      }
    }
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
