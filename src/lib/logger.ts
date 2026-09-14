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

  console.error(`[${context?.component || 'app'}] ${context?.action ? context?.action + ': ' : ''}${message}`, stack || '')

  if (typeof window !== 'undefined') {
    supabase.from('error_logs').insert({
      message,
      stack: stack || null,
      component: context?.component || null,
      user_action: context?.action || null,
      url,
    })
  }
}
