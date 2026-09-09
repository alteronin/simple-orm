import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: recordTypes } = await supabase.from('record_types').select('*')

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-text-accent">simple-orm</h1>
      <p className="text-text-muted mt-2">Minimal CRM — coming soon</p>
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Record Types</h2>
        {recordTypes?.map((rt) => (
          <div key={rt.id} className="p-3 bg-bg-card rounded mt-2">
            {rt.name}
          </div>
        ))}
      </div>
    </main>
  )
}
