'use client'

import { FieldDefinition, AppRecord } from '@/types'

interface FilterState {
  search: string
  sortBy: string
  sortDir: 'asc' | 'desc'
  filters: Record<string, string>
}

interface RecordToolbarProps {
  fields: FieldDefinition[]
  filterState: FilterState
  onFilterChange: (state: FilterState) => void
  recordCount: number
  totalCount: number
  selectedCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkDelete: () => void
  onBulkStatusChange: (status: string) => void
  onExportCsv: () => void
  recordTypeName: string
  statusOptions?: string[]
}

export function RecordToolbar({
  fields, filterState, onFilterChange, recordCount, totalCount,
  selectedCount, onSelectAll, onDeselectAll, onBulkDelete, onBulkStatusChange,
  onExportCsv, recordTypeName, statusOptions
}: RecordToolbarProps) {
  const filterFields = fields.filter(f => f.options && f.options.length > 0)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="shrink-0 h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={filterState.search}
            onChange={(e) => onFilterChange({ ...filterState, search: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Sort */}
        <select
          value={`${filterState.sortBy}:${filterState.sortDir}`}
          onChange={(e) => {
            const [sortBy, sortDir] = e.target.value.split(':')
            onFilterChange({ ...filterState, sortBy, sortDir: sortDir as 'asc' | 'desc' })
          }}
          className="flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          {fields.map(f => (
            <option key={f.name} value={`${f.name}:asc`}>{f.label} A→Z</option>
          ))}
          {fields.map(f => (
            <option key={`${f.name}-desc`} value={`${f.name}:desc`}>{f.label} Z→A</option>
          ))}
        </select>

        {/* Export CSV */}
        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 h-9 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <svg className="shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export
        </button>
      </div>

      {/* Filter chips for select fields */}
      {filterFields.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filterFields.map(field => (
            <div key={field.name} className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{field.label}:</span>
              <select
                value={filterState.filters[field.name] || ''}
                onChange={(e) => onFilterChange({
                  ...filterState,
                  filters: { ...filterState.filters, [field.name]: e.target.value }
                })}
                className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
          {Object.values(filterState.filters).some(v => v) && (
            <button
              onClick={() => onFilterChange({ ...filterState, filters: {} })}
              className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Bulk actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={selectedCount > 0 ? onDeselectAll : onSelectAll}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className={`h-4 w-4 rounded border flex items-center justify-center ${
              selectedCount > 0 ? 'bg-primary border-primary' : 'border-border'
            }`}>
              {selectedCount > 0 && (
                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
            {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
          </button>

          {selectedCount > 0 && (
            <>
              {statusOptions && statusOptions.length > 0 && (
                <select
                  onChange={(e) => { if (e.target.value) { onBulkStatusChange(e.target.value); e.target.value = '' } }}
                  className="h-7 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  defaultValue=""
                >
                  <option value="" disabled>Set status...</option>
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              <button
                onClick={onBulkDelete}
                className="inline-flex items-center gap-1 h-7 rounded-md px-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <svg className="shrink-0 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </>
          )}
        </div>

        {recordCount !== totalCount && (
          <p className="text-xs text-muted-foreground">
            Showing {recordCount} of {totalCount}
          </p>
        )}
      </div>
    </div>
  )
}
