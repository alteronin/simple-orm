'use client'

import { useEffect } from 'react'
import { logError } from '@/lib/logger'

export default function StacksError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { logError(error, { component: 'StacksPage', action: 'render' }) }, [error])
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load stacks</h2>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <button onClick={reset} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
        Try again
      </button>
    </div>
  )
}
