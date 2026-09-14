'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { StackWithCards, StackCard, AppRecord } from '@/types'
import { StackCardItem } from './StackCardItem'

interface StackColumnProps {
  stack: StackWithCards
  isDragging: boolean
  isSyncing?: boolean
  onEdit: () => void
  onDelete: () => void
  onPopulate: () => void
  onCardClick: (recordId: string) => void
  onFieldUpdate?: (recordId: string, fieldName: string, value: any) => void
  onSortedCardsChange?: (sortedIds: string[]) => void
}

const OP_LABELS: Record<string, string> = { eq: '=', neq: '≠', contains: '~', gt: '>', lt: '<', gte: '≥', lte: '≤' }

function getCardSortValue(card: StackCard & { record: AppRecord }, fieldName: string): string {
  const val = card.record?.data?.[fieldName]
  if (val === null || val === undefined || val === '') return '\uffff'
  if (typeof val === 'boolean') return val ? '1' : '0'
  if (typeof val === 'number') return String(val).padStart(10, '0')
  return String(val).toLowerCase()
}

export function StackColumn({ stack, isDragging, isSyncing, onEdit, onDelete, onPopulate, onCardClick, onFieldUpdate, onSortedCardsChange }: StackColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `stack-${stack.id}` })
  const fields = stack.record_type?.fields || []
  const displayFields = stack.display_fields || []
  const quickUpdateFields = stack.quick_update_fields || []
  const filters = stack.filter_criteria || []

  const [sortField, setSortField] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sortedCards = useMemo(() => {
    if (!sortField) return stack.cards
    return [...stack.cards].sort((a, b) => {
      const av = getCardSortValue(a, sortField)
      const bv = getCardSortValue(b, sortField)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [stack.cards, sortField, sortDir])

  const cardIds = sortedCards.map(c => c.id)

  useEffect(() => {
    if (onSortedCardsChange) onSortedCardsChange(cardIds)
  }, [cardIds, onSortedCardsChange])

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div
      className={`rounded-lg border bg-card transition-colors ${
        isDragging ? 'border-primary/50 bg-primary/5' : 'border-border'
      } ${isOver ? 'border-accent-foreground/50 bg-accent/5' : ''}`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{stack.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {stack.cards.length} {stack.cards.length === 1 ? 'card' : 'cards'}
          </p>
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {filters.map((f: any, i: number) => (
                <span key={i} className="inline-flex items-center gap-0.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
                  {fields.find(ff => ff.name === f.field)?.label || f.field}
                  <span className="text-muted-foreground">{OP_LABELS[f.operator] || f.operator}</span>
                  {f.value}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPopulate}
            disabled={isSyncing}
            title={filters.length > 0 ? `Sync records (filtered by ${filters.length} rule${filters.length > 1 ? 's' : ''})` : 'Sync all records from type'}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 disabled:opacity-50"
          >
            {isSyncing ? (
              <svg className="shrink-0 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            )}
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

      {stack.cards.length > 1 && fields.length > 0 && (
        <div className="px-4 py-2 border-b border-border">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sort:</span>
            <div className="flex flex-wrap gap-1">
              {fields.filter(f => f.name !== 'content').slice(0, 5).map(f => (
                <button
                  key={f.name}
                  onClick={() => toggleSort(f.name)}
                  className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    sortField === f.name
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {f.label || f.name}
                  {sortField === f.name && (
                    <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={setNodeRef} className="p-3 min-h-[200px] max-h-[calc(100vh-12rem)] overflow-y-auto">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {sortedCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
              <p className="text-sm">No cards yet</p>
              <p className="text-xs mt-1">Click sync to pull records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedCards.map(card => (
                <StackCardItem
                  key={card.id}
                  card={card}
                  displayFields={displayFields}
                  quickUpdateFields={quickUpdateFields}
                  fields={fields}
                  onClick={onCardClick}
                  onFieldUpdate={onFieldUpdate}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
