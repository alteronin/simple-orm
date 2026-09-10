import { getRecordTypes } from '@/lib/record-operations'
import { redirect } from 'next/navigation'

export default async function Home() {
  const types = await getRecordTypes()
  const firstSlug = types[0]?.slug
  if (firstSlug) redirect(`/${firstSlug}`)
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="rounded-full bg-muted p-4 mx-auto w-fit">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">simple-orm</h1>
        <p className="text-muted-foreground">Minimal CRM — configure your record types</p>
      </div>
    </main>
  )
}
