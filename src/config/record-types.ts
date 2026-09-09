import { RecordType } from '@/types'

export const recordTypes: RecordType[] = [
  {
    id: 'deal',
    name: 'Deal',
    slug: 'deal',
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'value', type: 'number', label: 'Value' },
      { name: 'status', type: 'select', label: 'Status', options: ['new', 'in_progress', 'won', 'lost'] },
      { name: 'close_date', type: 'date', label: 'Close Date' },
    ],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'task',
    name: 'Task',
    slug: 'task',
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'priority', type: 'select', label: 'Priority', options: ['low', 'medium', 'high'] },
      { name: 'done', type: 'boolean', label: 'Completed' },
    ],
    created_at: '',
    updated_at: '',
  },
]

export function getRecordType(slug: string): RecordType | undefined {
  return recordTypes.find((rt) => rt.slug === slug)
}
