'use client'

import { usePathname, useRouter } from 'next/navigation'
import { recordTypes } from '@/config/record-types'

export function RecordTypeNav() {
  const pathname = usePathname()
  const router = useRouter()
  const currentSlug = pathname.split('/')[1] || ''

  return (
    <nav className="flex gap-2 border-b border-border pb-2 mb-6">
      {recordTypes.map((rt) => {
        const isActive = rt.slug === currentSlug
        return (
          <button
            key={rt.id}
            onClick={() => router.push(`/${rt.slug}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-bg-card text-text-accent border border-border'
                : 'text-text-muted hover:text-text hover:bg-bg-card'
            }`}
          >
            {rt.name}
          </button>
        )
      })}
    </nav>
  )
}
