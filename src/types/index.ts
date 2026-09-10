export interface FieldDefinition {
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea' | 'link' | 'recurring'
  label: string
  required?: boolean
  options?: string[]
  targetType?: string
  default?: string | number | boolean
  interval?: 'day' | 'week' | 'month' | number // for recurring type
}

export interface FilterCriterion {
  field: string
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
  value: string
}

export type FilterCriteria = FilterCriterion[]

export interface RecordType {
  id: string
  name: string
  slug: string
  fields: FieldDefinition[]
  created_at: string
  updated_at: string
}

export interface AppRecord {
  id: string
  record_type_id: string
  data: Record<string, string | number | boolean | null>
  created_at: string
  updated_at: string
}

export interface Stack {
  id: string
  name: string
  record_type_id: string
  display_fields: string[]
  filter_criteria: FilterCriteria
  position: number
  created_at: string
  updated_at: string
}

export interface StackCard {
  id: string
  stack_id: string
  record_id: string
  position: number
  created_at: string
}

export interface StackWithCards extends Stack {
  cards: (StackCard & { record: AppRecord })[]
  record_type?: RecordType
}
