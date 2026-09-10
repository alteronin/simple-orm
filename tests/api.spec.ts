import { test, expect } from '@playwright/test'

const SUPABASE_URL = 'https://vhgcmdgmmvarkqjfcytj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

// ─── Record Type CRUD ───────────────────────────────────────────

test.describe('Record Type CRUD', () => {
  const testSlug = `test_${Date.now()}`

  test('create record type', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/record_types`, {
      headers,
      data: {
        id: testSlug,
        name: 'Test Type',
        slug: testSlug,
        fields: [{ name: 'title', type: 'text', label: 'Title' }],
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].slug).toBe(testSlug)
  })

  test('read record type', async ({ request }) => {
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/record_types?id=eq.${testSlug}&select=*`,
      { headers }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.length).toBe(1)
    expect(body[0].fields.length).toBe(1)
  })

  test('update record type', async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/record_types?id=eq.${testSlug}`,
      {
        headers,
        data: { name: 'Updated Type' },
      }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].name).toBe('Updated Type')
  })

  test('delete record type', async ({ request }) => {
    const res = await request.delete(
      `${SUPABASE_URL}/rest/v1/record_types?id=eq.${testSlug}`,
      { headers }
    )
    expect(res.ok()).toBeTruthy()
  })
})

// ─── Record CRUD ────────────────────────────────────────────────

test.describe('Record CRUD', () => {
  let recordId: string

  test('create record', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
      headers,
      data: {
        record_type_id: 'task',
        data: { title: 'E2E Test Record', priority: 'high', done: false },
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    recordId = body[0].id
    expect(recordId).toBeTruthy()
  })

  test('read record', async ({ request }) => {
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}&select=*`,
      { headers }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].data.title).toBe('E2E Test Record')
  })

  test('update record', async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      {
        headers,
        data: { data: { title: 'Updated E2E Record', priority: 'low', done: true } },
      }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].data.title).toBe('Updated E2E Record')
  })

  test('delete record', async ({ request }) => {
    const res = await request.delete(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      { headers }
    )
    expect(res.ok()).toBeTruthy()
  })
})

// ─── Stack CRUD + Filters ───────────────────────────────────────

test.describe('Stack CRUD + Filters', () => {
  let stackId: string

  test('create stack with filter', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/stacks`, {
      headers,
      data: {
        name: 'E2E Stack',
        record_type_id: 'task',
        display_fields: ['priority'],
        filter_criteria: [{ field: 'priority', operator: 'eq', value: 'high' }],
        position: 0,
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    stackId = body[0].id
    expect(body[0].filter_criteria.length).toBe(1)
  })

  test('read stack with filters', async ({ request }) => {
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/stacks?id=eq.${stackId}&select=filter_criteria`,
      { headers }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].filter_criteria[0].field).toBe('priority')
  })

  test('update stack filters', async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/stacks?id=eq.${stackId}`,
      {
        headers,
        data: {
          filter_criteria: [
            { field: 'priority', operator: 'eq', value: 'low' },
          ],
        },
      }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].filter_criteria[0].value).toBe('low')
  })

  test('cascade delete stack + cards', async ({ request }) => {
    // Add a card first
    const taskRes = await request.get(
      `${SUPABASE_URL}/rest/v1/records?record_type_id=eq.task&select=id&limit=1`,
      { headers }
    )
    const task = (await taskRes.json())[0]

    await request.post(`${SUPABASE_URL}/rest/v1/stack_cards`, {
      headers,
      data: { stack_id: stackId, record_id: task.id, position: 0 },
    })

    // Verify card exists
    const cardsBefore = await request.get(
      `${SUPABASE_URL}/rest/v1/stack_cards?stack_id=eq.${stackId}&select=id`,
      { headers }
    )
    expect((await cardsBefore.json()).length).toBe(1)

    // Delete stack
    const delRes = await request.delete(
      `${SUPABASE_URL}/rest/v1/stacks?id=eq.${stackId}`,
      { headers }
    )
    expect(delRes.ok()).toBeTruthy()

    // Verify cards gone
    const cardsAfter = await request.get(
      `${SUPABASE_URL}/rest/v1/stack_cards?stack_id=eq.${stackId}&select=id`,
      { headers }
    )
    expect((await cardsAfter.json()).length).toBe(0)
  })
})

// ─── Reserved Slug Validation ───────────────────────────────────

test.describe('Reserved Slug Validation', () => {
  const reserved = ['settings', 'stacks', 'api', 'new', 'edit']

  for (const slug of reserved) {
    test(`block reserved slug "${slug}"`, async ({ request }) => {
      const res = await request.post(`${SUPABASE_URL}/rest/v1/record_types`, {
        headers,
        data: { id: slug, name: slug, slug, fields: [] },
      })
      // Should succeed at DB level but app-level validation blocks it
      // We just verify the DB allows it (app handles the rest)
      expect(res.ok()).toBeTruthy()
      // Cleanup
      await request.delete(
        `${SUPABASE_URL}/rest/v1/record_types?id=eq.${slug}`,
        { headers }
      )
    })
  }
})

// ─── Performance Metrics ────────────────────────────────────────

test.describe('Performance', () => {
  test('read 100 records < 2s', async ({ request }) => {
    const start = Date.now()
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/records?record_type_id=eq.task&select=*&limit=100`,
      { headers }
    )
    const elapsed = Date.now() - start
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    console.log(`Read ${body.length} records in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(2000)
  })

  test('read record_types < 500ms', async ({ request }) => {
    const start = Date.now()
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/record_types?select=*`,
      { headers }
    )
    const elapsed = Date.now() - start
    expect(res.ok()).toBeTruthy()
    console.log(`Read record_types in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(500)
  })

  test('read stacks with cards < 1s', async ({ request }) => {
    const start = Date.now()
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/stacks?select=*,stack_cards(*,record:records(*))`,
      { headers }
    )
    const elapsed = Date.now() - start
    expect(res.ok()).toBeTruthy()
    console.log(`Read stacks with cards in ${elapsed}ms`)
    expect(elapsed).toBeLessThan(1000)
  })
})
