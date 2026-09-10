'use client'

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onCancel}>
      <div className="card p-6 max-w-sm w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline btn-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-destructive btn-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
