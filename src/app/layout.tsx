'use client'

import { usePathname } from 'next/navigation'
import { RecordTypeNav } from '@/components/RecordTypeNav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRecordPage = /^\/[a-z]+/.test(pathname)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {isRecordPage && <RecordTypeNav />}
          {children}
        </div>
      </body>
    </html>
  )
}
