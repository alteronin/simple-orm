import { getStacks } from '@/lib/actions'
import { getRecordTypes } from '@/lib/record-operations'
import { StacksClient } from '@/components/StacksClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StacksPage() {
  const [stacks, recordTypes] = await Promise.all([
    getStacks(),
    getRecordTypes(),
  ])

  return <StacksClient stacks={stacks} recordTypes={recordTypes} />
}
