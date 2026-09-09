import { getRecordTypes } from '@/lib/record-operations'
import { redirect } from 'next/navigation'

export default async function Home() {
  const types = await getRecordTypes()
  const firstSlug = types[0]?.slug
  if (firstSlug) redirect(`/${firstSlug}`)
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-accent">simple-orm</h1>
        <p className="text-text-muted mt-2">Minimal CRM — configure your record types</p>
      </div>
    </main>
  )
}
