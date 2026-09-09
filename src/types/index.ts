export interface FieldDefinition {
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea'
  label: string
  required?: boolean
  options?: string[]
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
