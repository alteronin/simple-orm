'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppRecord, FieldDefinition } from '@/types'
import { EmptyState } from './EmptyState'
import { RecordToolbar } from './RecordToolbar'
import { Pagination } from './Pagination'
import { InlineEditableField } from './InlineEditableField'
import { useToast } from './Toast'
import { deleteRecords, updateRecordField } from '@/lib/actions'
import { LinkedRecordInfo } from '@/lib/record-operations'

interface RecordListProps {
  records: AppRecord[]
  loading: boolean
  fields: FieldDefinition[]
  recordTypeName: string
  recordTypeId: string
  totalRecords: number
  totalPages: number
  currentPage: number
  linkedRecords?: Record<string, LinkedRecordInfo>
}

export function RecordList({ records, loading, fields, recordTypeName, recordTypeId, totalRecords, totalPages, currentPage, linkedRecords = {} }: RecordListProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingValues, setEditingValues] = useState<Record<string, Record<string, string | number | boolean | null>>>({})

  const statusField = fields.find(f => f.name === 'status')
  const statusOptions = statusField?.options

  const filterState = useMemo(() => ({ search, sortBy, sortDir, filters }), [search, sortBy, sortDir, filters])

  const handleFilterChange = (state: typeof filterState) => {
    setSearch(state.search)
    setSortBy(state.sortBy)
    setSortDir(state.sortDir)
    setFilters(state.filters)
  }

  const filtered = useMemo(() => {
    let result = [...records]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        fields.some(f => {
          const val = r.data[f.name]
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        }) || r.id.toLowerCase().includes(q)
      )
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(r => String(r.data[key] || '') === value)
      }
    })

    result.sort((a, b) => {
      const aVal = a.data[sortBy] ?? a[sortBy as keyof AppRecord] ?? ''
      const bVal = b.data[sortBy] ?? b[sortBy as keyof AppRecord] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [records, search, sortBy, sortDir, filters, fields])

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelected(new Set(filtered.map(r => r.id)))
  }, [filtered])

  const deselectAll = useCallback(() => {
    setSelected(new Set())
  }, [])

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    try {
      await deleteRecords(ids)
      setSelected(new Set())
      addToast(`${ids.length} record(s) deleted`, 'success')
      router.refresh()
    } catch (e: any) {
      addToast(e.message || 'Failed to delete records', 'error')
    }
  }, [selected, addToast, router])

  const handleBulkStatusChange = useCallback(async (status: string) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    try {
      await Promise.all(ids.map(id => updateRecordField(id, 'status', status)))
      setSelected(new Set())
      addToast(`${ids.length} record(s) updated to "${status}"`, 'success')
      router.refresh()
    } catch (e: any) {
      addToast(e.message || 'Failed to update records', 'error')
    }
  }, [selected, addToast, router])

  const handleInlineSaved = useCallback((recordId: string, fieldName: string, newValue: string | number | boolean | null) => {
    setEditingValues(prev => ({
      ...prev,
      [recordId]: { ...(prev[recordId] || {}), [fieldName]: newValue }
    }))
    router.refresh()
  }, [router])

  const handleExportCsv = useCallback(() => {
    const headers = ['id', ...fields.map(f => f.label)]
    const rows = filtered.map(r => [
      r.id,
      ...fields.map(f => String(r.data[f.name] ?? ''))
    ])

    const csv = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recordTypeName.toLowerCase()}-export.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast(`Exported ${filtered.length} records to CSV`, 'success')
  }, [filtered, fields, recordTypeName, addToast])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-48 rounded bg-muted animate-pulse" />
              <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return <EmptyState recordTypeName={recordTypeName} />
  }

  return (
    <div className="space-y-4">
      <RecordToolbar
        fields={fields}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        recordCount={filtered.length}
        totalCount={totalRecords}
        selectedCount={selected.size}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onExportCsv={handleExportCsv}
        recordTypeName={recordTypeName}
        statusOptions={statusOptions}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No records match your search or filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((record) => (
            <div
              key={record.id}
              className={`group rounded-lg border bg-card p-4 cursor-pointer transition-colors ${
                selected.has(record.id)
                  ? 'border-primary bg-accent/30'
                  : 'border-border hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(record.id) }}
                  className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    selected.has(record.id)
                      ? 'bg-primary border-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  {selected.has(record.id) && (
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div
                  className="flex-1 min-w-0"
                  onClick={() => router.push(`/${record.record_type_id}/${record.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {String(record.data[fields[0]?.name] || record.id)}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {record.id.slice(0, 8)}
                      </span>
                      <svg className="shrink-0 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {fields.slice(1).map((field) => {
                      const override = editingValues[record.id]?.[field.name]
                      const val = override !== undefined ? override : record.data[field.name]
                      if (field.type === 'link') {
                        if (!val) return null
                        return (
                          <LinkedRecordBadge
                            key={field.name}
                            recordId={String(val)}
                            targetType={field.targetType || ''}
                            label={field.label}
                            linkedData={linkedRecords[String(val)]}
                          />
                        )
                      }
                      return (
                        <InlineEditableField
                          key={field.name}
                          recordId={record.id}
                          field={field}
                          value={val}
                          onSaved={(v) => handleInlineSaved(record.id, field.name, v)}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => router.push(`/${recordTypeId}?page=${p}`)}
      />
    </div>
  )
}

function LinkedRecordBadge({ recordId, targetType, label, linkedData }: { recordId: string; targetType: string; label: string; linkedData?: LinkedRecordInfo }) {
  let title = recordId.slice(0, 8)
  if (linkedData) {
    const titleField = linkedData.recordType.fields?.[0]?.name || 'title'
    title = String(linkedData.record.data?.[titleField] || recordId.slice(0, 8))
  }

  return (
    <a
      href={`/${targetType}/${recordId}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors"
    >
      {label}: {title}
    </a>
  )
}
