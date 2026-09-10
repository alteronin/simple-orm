'use client'

import { useState, useEffect, useCallback } from 'react'
import { Note, getNotes, createNote, deleteNote } from '@/lib/actions'
import { useToast } from './Toast'

export function RecordNotes({ recordId }: { recordId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const loadNotes = useCallback(async () => {
    try {
      const data = await getNotes(recordId)
      setNotes(data)
    } catch (e: any) {
      addToast('Failed to load notes', 'error')
    } finally {
      setLoading(false)
    }
  }, [recordId, addToast])

  useEffect(() => { loadNotes() }, [loadNotes])

  const handleAdd = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const note = await createNote(recordId, content.trim())
      setNotes(prev => [note, ...prev])
      setContent('')
      addToast('Note added', 'success')
    } catch (e: any) {
      addToast(e.message || 'Failed to add note', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id)
      setNotes(prev => prev.filter(n => n.id !== id))
      addToast('Note deleted', 'success')
    } catch (e: any) {
      addToast(e.message || 'Failed to delete note', 'error')
    }
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <svg className="shrink-0 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        Notes
        {notes.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
            {notes.length}
          </span>
        )}
      </h3>

      {/* Add note form */}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd() }}
        />
        <button
          onClick={handleAdd}
          disabled={!content.trim() || submitting}
          className="self-end inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? (
            <svg className="shrink-0 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">Ctrl+Enter to save</p>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-md border border-border p-3 space-y-2">
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No notes yet</p>
      ) : (
        <div className="space-y-2">
          {notes.map(note => (
            <div key={note.id} className="group rounded-md border border-border bg-background p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{formatDate(note.created_at)}</span>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
