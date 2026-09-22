import { test, expect } from '@playwright/test'

const API = 'https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY'
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }

let stackIds: string[] = []

async function waitForCards(request: any, stackId: string, expectedCount: number, timeoutMs = 30000): Promise<number> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const cards = await (await request.get(`${API}/stack_cards?select=id&stack_id=eq.${stackId}`, { headers: HEADERS })).json()
    if (cards.length === expectedCount) return cards.length
    await new Promise(r => setTimeout(r, 2000))
  }
  const cards = await (await request.get(`${API}/stack_cards?select=id&stack_id=eq.${stackId}`, { headers: HEADERS })).json()
  return cards.length
}

test.describe('Stack Filter Fixes', () => {
  test.afterAll(async ({ request }) => {
    for (const id of stackIds) {
      await request.delete(`${API}/stack_cards?stack_id=eq.${id}`, { headers: HEADERS })
      await request.delete(`${API}/stacks?id=eq.${id}`, { headers: HEADERS })
    }
    console.log(`Cleanup: deleted ${stackIds.length} stacks`)
  })

  test('empty filter populates correct cards on page load', async ({ page, request }) => {
    const allTasks = await (await request.get(`${API}/records?select=id,data&record_type_id=eq.task`, { headers: HEADERS })).json()
    const withoutDue = allTasks.filter((t: any) => !t.data.due_date)
    console.log(`Tasks without due_date: ${withoutDue.length}`)

    const stack = await (await request.post(`${API}/stacks?select=id,filter_criteria`, {
      headers: HEADERS,
      data: {
        name: 'Test Empty Filter PT',
        record_type_id: 'task',
        display_fields: ['title', 'due_date'],
        filter_criteria: [{ field: 'due_date', operator: 'empty', value: '' }]
      }
    })).json()
    const stackId = Array.isArray(stack) ? stack[0].id : stack.id
    stackIds.push(stackId)
    console.log(`Created stack: ${stackId}`)

    await page.goto('/stacks')
    const count = await waitForCards(request, stackId, withoutDue.length, 30000)
    console.log(`Cards populated: ${count} (expected: ${withoutDue.length})`)
    expect(count).toBe(withoutDue.length)
  })

  test('removing filter populates all cards', async ({ page, request }) => {
    const stack = await (await request.post(`${API}/stacks?select=id,filter_criteria`, {
      headers: HEADERS,
      data: {
        name: 'Test Filter Clear PT',
        record_type_id: 'task',
        display_fields: ['title', 'stack'],
        filter_criteria: [{ field: 'stack', operator: 'eq', value: 'leisure' }]
      }
    })).json()
    const stackId = Array.isArray(stack) ? stack[0].id : stack.id
    stackIds.push(stackId)
    console.log(`Created stack with eq filter: ${stackId}`)

    await page.goto('/stacks')
    const count1 = await waitForCards(request, stackId, 33, 30000)
    console.log(`Cards with eq filter: ${count1}`)
    expect(count1).toBe(33)

    await request.patch(`${API}/stacks?id=eq.${stackId}`, {
      headers: HEADERS,
      data: { filter_criteria: [] }
    })
    console.log('Filter cleared')

    await page.goto('/stacks')
    const count2 = await waitForCards(request, stackId, 33, 30000)
    console.log(`Cards after clearing filter: ${count2} (expected: 33)`)
    expect(count2).toBe(33)
  })
})
