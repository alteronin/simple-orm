export interface FieldDefinition {
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea' | 'link'
  label: string
  required?: boolean
  options?: string[]
  targetType?: string // for link type: record type id to link to
  default?: string | number | boolean
}

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
