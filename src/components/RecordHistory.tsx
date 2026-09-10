'use client'

import { useState, useEffect, useCallback } from 'react'
import { RecordHistoryEntry, getRecordHistory } from '@/lib/actions'

const ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
}

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-500/10 text-green-500 border-green-500/20',
  updated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  deleted: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function RecordHistory({ recordId }: { recordId: string }) {
  const [entries, setEntries] = useState<RecordHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)

  const loadHistory = useCallback(async () => {
    try {
      const data = await getRecordHistory(recordId)
      setEntries(data)
    } catch {
      // history table may not exist yet
    } finally {
      setLoading(false)
    }
  }, [recordId])

  useEffect(() => { loadHistory() }, [loadHistory])

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-foreground w-full"
      >
        <svg
          className={`shrink-0 h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        History
        {entries.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
            {entries.length}
          </span>
        )}
      </button>

      {expanded && (
        <>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-md border border-border p-3 space-y-2">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No history yet</p>
          ) : (
            <div className="space-y-2">
              {entries.map(entry => (
                <div key={entry.id} className="rounded-md border border-border bg-background p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ACTION_COLORS[entry.action] || 'bg-secondary text-secondary-foreground border-border'}`}>
                      {ACTION_LABELS[entry.action] || entry.action}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(entry.created_at)}</span>
                  </div>
                  {entry.changes && Object.keys(entry.changes).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(entry.changes).map(([field, change]) => (
                        <div key={field} className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{field}</span>: {formatValue(change.old)} → <span className="text-foreground">{formatValue(change.new)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  return String(val)
}
