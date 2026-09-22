import { supabase } from './supabase'

interface LogContext {
  component?: string
  action?: string
  url?: string
}

export function logError(error: unknown, context?: LogContext) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  const url = context?.url || (typeof window !== 'undefined' ? window.location.href : '')

  const details: Record<string, any> = {
    message,
    stack: stack || null,
    component: context?.component || null,
    user_action: context?.action || null,
    url,
    error_type: error instanceof Error ? error.name : typeof error,
  }

  if (error && typeof error === 'object') {
    const err = error as any
    if (err.code) details.error_code = err.code
    if (err.details) details.error_details = err.details
    if (err.hint) details.error_hint = err.hint
    if (err.status) details.error_status = err.status
    if (err.message && err.message !== message) details.error_message_full = err.message
  }

  console.error(`[${context?.component || 'app'}] ${context?.action ? context?.action + ': ' : ''}${message}`, stack || '', details)

  if (typeof window !== 'undefined') {
    void supabase.from('error_logs').insert(details).select().single()
  }
}

export function logApiError(endpoint: string, method: string, error: unknown, context?: LogContext) {
  const err = error as any
  logError({
    message: `${method} ${endpoint} failed: ${err?.message || String(error)}`,
    code: err?.code || null,
    status: err?.status || null,
    details: err?.details || null,
  }, { ...context, action: `${method} ${endpoint}` })
}
