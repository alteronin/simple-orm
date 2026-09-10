import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:5432'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon'

const noStoreFetch = (url: RequestInfo | URL, init?: RequestInit) => {
  return fetch(url, { ...init, next: { revalidate: 0 } })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: noStoreFetch as typeof fetch,
  },
})
