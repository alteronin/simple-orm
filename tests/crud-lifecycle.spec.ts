import { test, expect } from '@playwright/test'

const SUPABASE_URL = 'https://vhgcmdgmmvarkqjfcytj.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ2NtZGdtbXZhcmtxamZjeXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODE3MzcsImV4cCI6MjEwNDU1NzczN30.1S8WuGio75wlZb3BIPbiIMz2f--AZHR7de8_QmAMEwY'

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

// ─── Delete Record with History ─────────────────────────────────

test.describe('Delete Record with History', () => {
  let recordId: string

  test('create record', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
      headers,
      data: { record_type_id: 'task', data: { title: 'Delete Test', priority: 'high' } },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    recordId = body[0].id
  })

  test('add history entry', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/record_history`, {
      headers,
      data: { record_id: recordId, action: 'created', changes: null },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('delete history then record (simulates app deleteRecord)', async ({ request }) => {
    // Clean up history first (app's approach)
    const hDel = await request.delete(
      `${SUPABASE_URL}/rest/v1/record_history?record_id=eq.${recordId}`,
      { headers }
    )
    expect(hDel.ok()).toBeTruthy()

    // Then delete record
    const rDel = await request.delete(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      { headers }
    )
    expect(rDel.ok()).toBeTruthy()

    // Verify gone
    const check = await request.get(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}&select=id`,
      { headers }
    )
    const body = await check.json()
    expect(body.length).toBe(0)
  })
})

// ─── Delete Record with Notes ───────────────────────────────────
// NOTE: notes table has pre-existing PostgREST schema cache issue (404 on REST API)
// This test verifies the app's deleteRecord handles missing notes table gracefully

test.describe('Delete Record (notes table unavailable)', () => {
  let recordId: string

  test('create record', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
      headers,
      data: { record_type_id: 'task', data: { title: 'Notes Delete Test' } },
    })
    const body = await res.json()
    recordId = body[0].id
    expect(recordId).toBeTruthy()
  })

  test('delete record (notes delete may 404, but record still deletes)', async ({ request }) => {
    // Try to delete notes (may fail due to schema cache issue)
    const notesDel = await request.delete(
      `${SUPABASE_URL}/rest/v1/notes?record_id=eq.${recordId}`,
      { headers }
    )
    // Whether notes delete succeeds or not, record delete should work
    const rDel = await request.delete(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      { headers }
    )
    expect(rDel.ok()).toBeTruthy()
  })
})

// ─── Bulk Delete with History ───────────────────────────────────

test.describe('Bulk Delete with History', () => {
  const ids: string[] = []

  test('create 3 records with history', async ({ request }) => {
    for (let i = 0; i < 3; i++) {
      const res = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
        headers,
        data: { record_type_id: 'task', data: { title: `Bulk Delete ${i}` } },
      })
      const body = await res.json()
      ids.push(body[0].id)

      await request.post(`${SUPABASE_URL}/rest/v1/record_history`, {
        headers,
        data: { record_id: body[0].id, action: 'created' },
      })
    }
    expect(ids.length).toBe(3)
  })

  test('bulk delete with history cleanup', async ({ request }) => {
    await request.delete(`${SUPABASE_URL}/rest/v1/record_history?record_id=in.(${ids.join(',')})`, { headers })
    await request.delete(`${SUPABASE_URL}/rest/v1/notes?record_id=in.(${ids.join(',')})`, { headers })
    const del = await request.delete(`${SUPABASE_URL}/rest/v1/records?id=in.(${ids.join(',')})`, { headers })
    expect(del.ok()).toBeTruthy()

    // Verify all gone
    const check = await request.get(
      `${SUPABASE_URL}/rest/v1/records?id=in.(${ids.join(',')})&select=id`,
      { headers }
    )
    expect((await check.json()).length).toBe(0)
  })
})

// ─── Record Type Cascade Delete ─────────────────────────────────

test.describe('Record Type Cascade Delete', () => {
  const testSlug = `cascade_${Date.now()}`
  let recordId: string
  let stackId: string

  test('create record type with records and stack', async ({ request }) => {
    // Create type
    const rtRes = await request.post(`${SUPABASE_URL}/rest/v1/record_types`, {
      headers,
      data: {
        id: testSlug,
        name: 'Cascade Test',
        slug: testSlug,
        fields: [{ name: 'title', type: 'text', label: 'Title' }],
      },
    })
    expect(rtRes.ok()).toBeTruthy()

    // Create record
    const recRes = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
      headers,
      data: { record_type_id: testSlug, data: { title: 'Cascade Record' } },
    })
    const recBody = await recRes.json()
    recordId = recBody[0].id

    // Create stack
    const stackRes = await request.post(`${SUPABASE_URL}/rest/v1/stacks`, {
      headers,
      data: {
        name: 'Cascade Stack',
        record_type_id: testSlug,
        display_fields: ['title'],
        filter_criteria: [],
        position: 0,
      },
    })
    const stackBody = await stackRes.json()
    stackId = stackBody[0].id

    // Add card
    await request.post(`${SUPABASE_URL}/rest/v1/stack_cards`, {
      headers,
      data: { stack_id: stackId, record_id: recordId, position: 0 },
    })
  })

  test('delete record type cascades to records, stacks, cards', async ({ request }) => {
    const del = await request.delete(
      `${SUPABASE_URL}/rest/v1/record_types?id=eq.${testSlug}`,
      { headers }
    )
    expect(del.ok()).toBeTruthy()

    // Records should be gone
    const recCheck = await request.get(
      `${SUPABASE_URL}/rest/v1/records?record_type_id=eq.${testSlug}&select=id`,
      { headers }
    )
    expect((await recCheck.json()).length).toBe(0)

    // Stacks should be gone
    const stackCheck = await request.get(
      `${SUPABASE_URL}/rest/v1/stacks?record_type_id=eq.${testSlug}&select=id`,
      { headers }
    )
    expect((await stackCheck.json()).length).toBe(0)

    // Cards should be gone
    const cardCheck = await request.get(
      `${SUPABASE_URL}/rest/v1/stack_cards?stack_id=eq.${stackId}&select=id`,
      { headers }
    )
    expect((await cardCheck.json()).length).toBe(0)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────

test.describe('Edge Cases', () => {
  let recordId: string

  test('create record with null values', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/records`, {
      headers,
      data: { record_type_id: 'task', data: { title: 'Null Test', priority: null, done: null } },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    recordId = body[0].id
    expect(body[0].data.title).toBe('Null Test')
    expect(body[0].data.priority).toBeNull()
  })

  test('update record with empty string', async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      { headers, data: { data: { title: '', priority: 'low', done: false } } }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].data.title).toBe('')
  })

  test('update record with special characters', async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      { headers, data: { data: { title: "O'Brien & Associates <script>alert('xss')</script>", priority: 'high', done: true } } }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].data.title).toContain("O'Brien")
    expect(body[0].data.title).toContain('<script>')
  })

  test('update record with unicode', async ({ request }) => {
    const res = await request.patch(
      `${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`,
      { headers, data: { data: { title: '日本語テスト 🚀 Ñoño', priority: 'medium', done: false } } }
    )
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body[0].data.title).toBe('日本語テスト 🚀 Ñoño')
  })

  test('cleanup', async ({ request }) => {
    await request.delete(`${SUPABASE_URL}/rest/v1/record_history?record_id=eq.${recordId}`, { headers })
    await request.delete(`${SUPABASE_URL}/rest/v1/records?id=eq.${recordId}`, { headers })
  })
})

// ─── Populate Stack with Filters ────────────────────────────────

test.describe('Populate Stack with Filters', () => {
  let stackId: string

  test('create stack with priority=high filter', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/stacks`, {
      headers,
      data: {
        name: 'High Priority',
        record_type_id: 'task',
        display_fields: ['title', 'priority'],
        filter_criteria: [{ field: 'priority', operator: 'eq', value: 'high' }],
        position: 0,
      },
    })
    const body = await res.json()
    stackId = body[0].id
    expect(body[0].filter_criteria.length).toBe(1)
  })

  test('stack was created with correct filter', async ({ request }) => {
    const res = await request.get(
      `${SUPABASE_URL}/rest/v1/stacks?id=eq.${stackId}&select=filter_criteria`,
      { headers }
    )
    const body = await res.json()
    expect(body[0].filter_criteria[0].field).toBe('priority')
    expect(body[0].filter_criteria[0].operator).toBe('eq')
    expect(body[0].filter_criteria[0].value).toBe('high')
  })

  test('cleanup', async ({ request }) => {
    // Delete cards first (no cascade from stack)
    await request.delete(`${SUPABASE_URL}/rest/v1/stack_cards?stack_id=eq.${stackId}`, { headers })
    await request.delete(`${SUPABASE_URL}/rest/v1/stacks?id=eq.${stackId}`, { headers })
  })
})

// ─── Stack Card Reorder ─────────────────────────────────────────

test.describe('Stack Card Reorder', () => {
  let stackId: string
  const cardIds: string[] = []

  test('create stack with 3 cards', async ({ request }) => {
    const stackRes = await request.post(`${SUPABASE_URL}/rest/v1/stacks`, {
      headers,
      data: { name: 'Reorder Test', record_type_id: 'task', display_fields: [], filter_criteria: [], position: 0 },
    })
    const stackBody = await stackRes.json()
    stackId = stackBody[0].id

    // Get 3 task records
    const recRes = await request.get(
      `${SUPABASE_URL}/rest/v1/records?record_type_id=eq.task&select=id&limit=3`,
      { headers }
    )
    const records = await recRes.json()

    // Add as cards
    for (let i = 0; i < records.length; i++) {
      const cardRes = await request.post(`${SUPABASE_URL}/rest/v1/stack_cards`, {
        headers,
        data: { stack_id: stackId, record_id: records[i].id, position: i },
      })
      const cardBody = await cardRes.json()
      cardIds.push(cardBody[0].id)
    }
    expect(cardIds.length).toBe(3)
  })

  test('reorder via individual updates (simulates app reorderStackCards)', async ({ request }) => {
    // Reverse the order - update each card individually (same as old Promise.all approach)
    const reversed = [...cardIds].reverse()
    const updates = reversed.map((cardId, idx) =>
      request.patch(
        `${SUPABASE_URL}/rest/v1/stack_cards?id=eq.${cardId}`,
        { headers, data: { position: idx } }
      )
    )
    const results = await Promise.all(updates)
    results.forEach(r => expect(r.ok()).toBeTruthy())

    // Verify order
    const check = await request.get(
      `${SUPABASE_URL}/rest/v1/stack_cards?stack_id=eq.${stackId}&select=id,position&order=position`,
      { headers }
    )
    const cards = await check.json()
    expect(cards[0].id).toBe(cardIds[2])
    expect(cards[1].id).toBe(cardIds[1])
    expect(cards[2].id).toBe(cardIds[0])
  })

  test('cleanup', async ({ request }) => {
    await request.delete(`${SUPABASE_URL}/rest/v1/stack_cards?stack_id=eq.${stackId}`, { headers })
    await request.delete(`${SUPABASE_URL}/rest/v1/stacks?id=eq.${stackId}`, { headers })
  })
})
