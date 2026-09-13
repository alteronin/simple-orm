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

function isPeriodStart(date: Date, recurrence: string): boolean {
  const now = new Date()
  const dateDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  if (recurrence === 'daily') {
    return dateDay < nowDay
  }
  if (recurrence === 'weekly') {
    const dayOfWeek = now.getUTCDay() || 7
    const startOfWeekDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOfWeek + 1)
    return dateDay < startOfWeekDay
  }
  if (recurrence === 'monthly') {
    return date.getUTCMonth() !== now.getUTCMonth() || date.getUTCFullYear() !== now.getUTCFullYear()
  }
  if (recurrence === 'yearly') {
    return date.getUTCFullYear() !== now.getUTCFullYear()
  }
  return true
}

export function shouldResetDone(
  data: Record<string, any>,
): boolean {
  if (!data.done) return false
  const recurrence = data.recurrence
  if (!recurrence || recurrence === 'none') return false
  const doneAt = data.done_at
  if (!doneAt) return false
  const completedDate = new Date(doneAt)
  return isPeriodStart(completedDate, recurrence)
}

export function checkAndResetTaskRecurrence(
  data: Record<string, any>,
): Record<string, any> {
  if (!shouldResetDone(data)) return data
  return { ...data, done: false, done_at: null }
}
