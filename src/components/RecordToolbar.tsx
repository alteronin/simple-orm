'use client'

import { FieldDefinition } from '@/types'

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
}

export function RecordToolbar({ fields, filterState, onFilterChange, recordCount, totalCount }: RecordToolbarProps) {
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

      {/* Result count */}
      {recordCount !== totalCount && (
        <p className="text-xs text-muted-foreground">
          Showing {recordCount} of {totalCount} records
        </p>
      )}
    </div>
  )
}
