'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { ToastProvider } from '@/components/Toast'
import { RecordType } from '@/types'
import { supabase } from '@/lib/supabase'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRecordPage = pathname ? /^\/[a-z]+/.test(pathname) : false
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([])

  useEffect(() => {
    supabase.from('record_types').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setRecordTypes(data as RecordType[]) })
  }, [])

  // Refresh record types when navigating (in case user added/edited a type)
  useEffect(() => {
    supabase.from('record_types').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setRecordTypes(data as RecordType[]) })
  }, [pathname])

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <ToastProvider>
          <div className="flex min-h-screen">
            {isRecordPage && <Sidebar recordTypes={recordTypes} />}
            <main className="flex-1 min-w-0">
              <div className="mx-auto max-w-4xl px-6 py-8">
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
