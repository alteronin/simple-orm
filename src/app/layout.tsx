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
  const isRecordPage = pathname ? /^\/(stacks|settings|([a-z]+))/.test(pathname) : false
  const [recordTypes, setRecordTypes] = useState<RecordType[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.from('record_types').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setRecordTypes(data as RecordType[]) })
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <ToastProvider>
          <div className="flex min-h-screen">
            {isRecordPage && (
              <>
                {/* Mobile hamburger */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="fixed top-3 left-3 z-30 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-card border border-border hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden"
                >
                  <svg className="shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
                <Sidebar recordTypes={recordTypes} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              </>
            )}
            <main className="flex-1 min-w-0">
              <div className={`px-4 py-8 pt-16 md:px-6 md:pt-8 ${pathname === '/stacks' ? '' : 'mx-auto max-w-4xl'}`}>
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
