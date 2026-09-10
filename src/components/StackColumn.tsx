'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { StackWithCards } from '@/types'
import { StackCardItem } from './StackCardItem'

interface StackColumnProps {
  stack: StackWithCards
  onEdit: () => void
  onDelete: () => void
  onPopulate: () => void
  isDragging: boolean
}

export function StackColumn({ stack, onEdit, onDelete, onPopulate, isDragging }: StackColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `stack-${stack.id}` })
  const cardIds = stack.cards.map(c => c.id)
  const fields = stack.record_type?.fields || []
  const displayFields = stack.display_fields || []

  return (
    <div
      className={`flex-shrink-0 w-80 rounded-lg border bg-card transition-colors ${
        isDragging ? 'border-primary/50 bg-primary/5' : 'border-border'
      } ${isOver ? 'border-accent-foreground/50' : ''}`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{stack.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stack.cards.length} {stack.cards.length === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPopulate}
            title="Sync records from type"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
          >
            <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
          <button
            onClick={onEdit}
            title="Edit stack"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8"
          >
            <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            title="Delete stack"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive h-8 w-8"
          >
            <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={setNodeRef} className="p-3 min-h-[200px] max-h-[600px] overflow-y-auto">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {stack.cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
              <p className="text-sm">No cards yet</p>
              <p className="text-xs mt-1">Click sync to pull records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stack.cards.map(card => (
                <StackCardItem
                  key={card.id}
                  card={card}
                  displayFields={displayFields}
                  fields={fields}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
