export interface RecurringValue {
  completed: boolean
  completed_at: string | null
}

export function isRecurringExpired(value: RecurringValue | null, interval: 'day' | 'week' | 'month' | number): boolean {
  if (!value?.completed || !value.completed_at) return true
  const completed = new Date(value.completed_at)
  const now = new Date()

  if (interval === 'day') {
    return completed.toDateString() !== now.toDateString()
  }
  if (interval === 'week') {
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    return completed < startOfWeek
  }
  if (interval === 'month') {
    return completed.getMonth() !== now.getMonth() || completed.getFullYear() !== now.getFullYear()
  }
  // Custom number of days
  if (typeof interval === 'number') {
    const ms = interval * 24 * 60 * 60 * 1000
    return now.getTime() - completed.getTime() > ms
  }
  return true
}

export function getRecurringDisplay(interval: 'day' | 'week' | 'month' | number): string {
  if (interval === 'day') return 'today'
  if (interval === 'week') return 'this week'
  if (interval === 'month') return 'this month'
  return `every ${interval} days`
}

export function checkAndResetRecurring(
  data: Record<string, any>,
  fields: { name: string; type: string; interval?: any }[]
): Record<string, any> {
  let changed = false
  const updated = { ...data }
  for (const field of fields) {
    if (field.type !== 'recurring' || !field.interval) continue
    const val = updated[field.name] as RecurringValue | null
    if (val && val.completed && !isRecurringExpired(val, field.interval)) continue
    if (val && val.completed) {
      updated[field.name] = { completed: false, completed_at: null }
      changed = true
    }
  }
  return changed ? updated : data
}
