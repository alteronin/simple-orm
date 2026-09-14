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
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
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
  onReorder: (stacks: StackWithCards[]) => void
  syncingStackId?: string | null
}

function findStack(stacks: StackWithCards[], id: string | number) {
  return stacks.find(s => s.id === id || s.cards.some(c => c.id === id))
}

function findStackForCard(stacks: StackWithCards[], cardId: string) {
  return stacks.find(s => s.cards.some(c => c.id === cardId))
}

function findStackByDroppableId(stacks: StackWithCards[], overId: string | number) {
  const asStr = String(overId)
  if (asStr.startsWith('stack-')) {
    const stackId = asStr.slice(6)
    return stacks.find(s => s.id === stackId)
  }
  return undefined
}

export function StackBoard({ stacks, recordTypes, onEdit, onDelete, onPopulate, onCardClick, onFieldUpdate, onReorder, syncingStackId }: StackBoardProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeCard = findStackForCard(stacks, String(active.id))
    if (!activeCard) return

    let overStack = findStack(stacks, String(over.id))
    if (!overStack) overStack = findStackByDroppableId(stacks, over.id)

    if (!overStack) return
    if (activeCard.id === overStack.id) return

    const activeStack = activeCard
    const movedCard = activeStack.cards.find(c => c.id === active.id)
    if (!movedCard) return

    const newStacks = stacks.map(s => {
      if (s.id === activeStack.id) {
        return { ...s, cards: s.cards.filter(c => c.id !== active.id) }
      }
      if (s.id === overStack!.id) {
        const overCardIdx = s.cards.findIndex(c => c.id === over.id)
        const newCards = [...s.cards]
        if (overCardIdx >= 0) {
          newCards.splice(overCardIdx, 0, movedCard)
        } else {
          newCards.push(movedCard)
        }
        return { ...s, cards: newCards }
      }
      return s
    })

    onReorder(newStacks)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCardId(null)

    if (!over) return

    const activeStack = findStackForCard(stacks, String(active.id))
    let overStack = findStack(stacks, String(over.id))
    if (!overStack) overStack = findStackByDroppableId(stacks, over.id)

    if (!activeStack || !overStack) return

    if (activeStack.id === overStack.id) {
      const oldIdx = activeStack.cards.findIndex(c => c.id === active.id)
      const newIdx = activeStack.cards.findIndex(c => c.id === over.id)
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

      const newCards = arrayMove(activeStack.cards, oldIdx, newIdx)
      const newStacks = stacks.map(s => s.id === activeStack.id ? { ...s, cards: newCards } : s)
      onReorder(newStacks)
      await reorderStackCards(activeStack.id, newCards.map(c => c.id))
    } else {
      const movedCard = activeStack.cards.find(c => c.id === active.id)
      if (!movedCard) return

      const overIdx = overStack.cards.findIndex(c => c.id === over.id)
      const newOverCards = [...overStack.cards]
      if (overIdx >= 0) {
        newOverCards.splice(overIdx, 0, movedCard)
      } else {
        newOverCards.push(movedCard)
      }

      const newStacks = stacks.map(s => {
        if (s.id === activeStack.id) {
          return { ...s, cards: s.cards.filter(c => c.id !== active.id) }
        }
        if (s.id === overStack!.id) {
          return { ...s, cards: newOverCards }
        }
        return s
      })
      onReorder(newStacks)
      await Promise.all([
        reorderStackCards(activeStack.id, newStacks.find(s => s.id === activeStack.id)!.cards.map(c => c.id)),
        reorderStackCards(overStack.id, newOverCards.map(c => c.id)),
      ])
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
            isDragging={activeCardId !== null && stack.cards.some(c => c.id === activeCardId)}
            isSyncing={syncingStackId === stack.id}
            onEdit={() => onEdit(stack)}
            onDelete={() => onDelete(stack.id)}
            onPopulate={() => onPopulate(stack.id)}
            onCardClick={onCardClick}
            onFieldUpdate={onFieldUpdate}
          />
        ))}
      </div>
    </DndContext>
  )
}
