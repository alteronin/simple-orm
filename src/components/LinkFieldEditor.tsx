'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { AppRecord, RecordType } from '@/types'

interface LinkFieldEditorProps {
  targetType: string
  value: string | null
  onChange: (recordId: string | null) => void
}

export function LinkFieldEditor({ targetType, value, onChange }: LinkFieldEditorProps) {
  const [records, setRecords] = useState<AppRecord[]>([])
  const [recordType, setRecordType] = useState<RecordType | null>(null)
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<AppRecord | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('record_types').select('*').eq('id', targetType).single()
      .then(({ data }) => { if (data) setRecordType(data as RecordType) })
  }, [targetType])

  useEffect(() => {
    supabase.from('records').select('*').eq('record_type_id', targetType).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setRecords(data as AppRecord[]) })
  }, [targetType])

  useEffect(() => {
    if (value && records.length > 0) {
      const found = records.find(r => r.id === value)
      if (found) setSelectedRecord(found)
    }
  }, [value, records])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const titleField = recordType?.fields[0]?.name || 'title'
  const filtered = records.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    const title = String(r.data[titleField] || r.id).toLowerCase()
    return title.includes(q)
  })

  const displayName = selectedRecord
    ? String(selectedRecord.data[titleField] || selectedRecord.id)
    : ''

  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-1 text-left rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {displayName || `Select ${recordType?.name || 'record'}...`}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => { setSelectedRecord(null); onChange(null) }}
            className="text-muted-foreground hover:text-destructive p-1"
          >
            <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">No records found</div>
            ) : (
              filtered.map((r) => {
                const title = String(r.data[titleField] || r.id)
                const isSelected = r.id === value
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRecord(r)
                      onChange(r.id)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                      isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground'
                    }`}
                  >
                    <div className="font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">{r.id.slice(0, 8)}</div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
