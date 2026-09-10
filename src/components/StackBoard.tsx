'use client'

import { useState } from 'react'
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
  onReorderCards: () => void
}

export function StackBoard({ stacks, recordTypes, onEdit, onDelete, onPopulate, onReorderCards }: StackBoardProps) {
  const [activeStackId, setActiveStackId] = useState<string | null>(null)
  const [localStacks, setLocalStacks] = useState(stacks)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const stack = localStacks.find(s => s.cards.some(c => c.id === active.id))
    if (stack) setActiveStackId(stack.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeStack = localStacks.find(s => s.cards.some(c => c.id === active.id))
    const overStack = localStacks.find(s => s.cards.some(c => c.id === over.id))

    if (!activeStack || !overStack || activeStack.id === overStack.id) return

    setLocalStacks(prev => {
      const newStacks = prev.map(s => ({ ...s, cards: [...s.cards] }))
      const fromStack = newStacks.find(s => s.id === activeStack.id)!
      const toStack = newStacks.find(s => s.id === overStack.id)!
      const activeIdx = fromStack.cards.findIndex(c => c.id === active.id)
      const overIdx = toStack.cards.findIndex(c => c.id === over.id)
      const [moved] = fromStack.cards.splice(activeIdx, 1)
      toStack.cards.splice(overIdx >= 0 ? overIdx : toStack.cards.length, 0, moved)
      return newStacks
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveStackId(null)

    if (!over) {
      onReorderCards()
      return
    }

    const activeStack = localStacks.find(s => s.cards.some(c => c.id === active.id))
    const overStack = localStacks.find(s => s.cards.some(c => c.id === over.id))

    if (!activeStack || !overStack) {
      onReorderCards()
      return
    }

    if (activeStack.id === overStack.id) {
      const oldIdx = activeStack.cards.findIndex(c => c.id === active.id)
      const newIdx = activeStack.cards.findIndex(c => c.id === over.id)
      if (oldIdx !== newIdx) {
        const newCards = arrayMove(activeStack.cards, oldIdx, newIdx)
        setLocalStacks(prev =>
          prev.map(s => s.id === activeStack.id ? { ...s, cards: newCards } : s)
        )
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
    onReorderCards()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {localStacks.map(stack => (
          <StackColumn
            key={stack.id}
            stack={stack}
            onEdit={() => onEdit(stack)}
            onDelete={() => onDelete(stack.id)}
            onPopulate={() => onPopulate(stack.id)}
            isDragging={activeStackId === stack.id}
          />
        ))}
      </div>
    </DndContext>
  )
}
