'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRecordPage = pathname ? /^\/[a-z]+/.test(pathname) : false

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          {isRecordPage && <Sidebar />}
          <main className="flex-1">
            <div className="mx-auto max-w-4xl px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
