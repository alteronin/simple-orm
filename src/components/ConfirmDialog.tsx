'use client'

import { Spinner } from './Spinner'

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  loading,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  loading?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onCancel}>
      <div className="rounded-lg border border-border bg-card p-6 max-w-sm w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3 disabled:opacity-50"
          >
            {loading ? <><Spinner className="h-4 w-4 mr-1.5" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
