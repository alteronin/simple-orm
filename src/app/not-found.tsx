'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold text-text">404</h1>
      <p className="text-text-muted mt-2">Record not found</p>
      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-text-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Go Back
      </button>
    </div>
  )
}
