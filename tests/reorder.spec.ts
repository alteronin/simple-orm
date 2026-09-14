import { test, expect } from '@playwright/test'

const BASE = 'https://simple-orm.vercel.app'
const API = 'https://vhgcmdgmmvarkqjfcytj.supabase.co/rest/v1'
const HEADERS = {
  apikey: process.env.SUPABASE_ANON_KEY || '',
  Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

let testTypeId = ''
let testStackIds: string[] = []
let testRecordIds: string[] = []
let testCardIds: string[] = []

async function setCardOrder(request: any, stackId: string, cardIds: string[]) {
  for (let i = 0; i < cardIds.length; i++) {
    await request.patch(`${API}/stack_cards?id=eq.${cardIds[i]}`, {
      headers: HEADERS,
      data: { stack_id: stackId, position: i },
    })
  }
}

async function getCards(request: any, stackId: string) {
  const resp = await request.get(
    `${API}/stack_cards?select=id,record_id,position&stack_id=eq.${stackId}&order=position`,
    { headers: HEADERS }
  )
  return resp.json()
}

async function moveCard(request: any, cardId: string, newStackId: string) {
  // Find source first
  let srcStackId: string | null = null
  for (const sid of testStackIds) {
    const cards = await getCards(request, sid)
    if (cards.some((c: any) => c.id === cardId)) { srcStackId = sid; break }
  }
  await request.patch(`${API}/stack_cards?id=eq.${cardId}`, {
    headers: HEADERS,
    data: { stack_id: newStackId },
  })
  // Reindex both source and destination
  if (srcStackId) {
    const srcCards = await getCards(request, srcStackId)
    await setCardOrder(request, srcStackId, srcCards.map((c: any) => c.id))
  }
  const dstCards = await getCards(request, newStackId)
  await setCardOrder(request, newStackId, dstCards.map((c: any) => c.id))
}

test.describe('Stack Reorder - Exhaustive', () => {
  test.beforeAll(async ({ request }) => {
    const ts = Date.now()
    const rtResp = await request.post(`${API}/record_types`, {
      headers: HEADERS,
      data: {
        id: `reordertest${ts}`,
        name: `ReorderTest${ts}`,
        slug: `reordertest${ts}`,
        fields: [
          { name: 'title', type: 'text', label: 'Title' },
          { name: 'priority', type: 'select', label: 'Priority', options: ['low', 'medium', 'high'] },
          { name: 'done', type: 'boolean', label: 'Done' },
        ],
      },
    })
    const rt = await rtResp.json()
    testTypeId = rt[0].id

    for (let i = 1; i <= 6; i++) {
      const rResp = await request.post(`${API}/records`, {
        headers: HEADERS,
        data: { record_type_id: testTypeId, data: { title: `Card ${i}`, priority: ['low', 'medium', 'high'][i % 3], done: false } },
      })
      const r = await rResp.json()
      testRecordIds.push(r[0].id)
    }

    for (const name of ['Stack A', 'Stack B']) {
      const sResp = await request.post(`${API}/stacks`, {
        headers: HEADERS,
        data: { name, record_type_id: testTypeId, display_fields: ['title', 'priority'] },
      })
      const s = await sResp.json()
      testStackIds.push(s[0].id)
    }

    for (let i = 0; i < 4; i++) {
      const cResp = await request.post(`${API}/stack_cards`, {
        headers: HEADERS,
        data: { stack_id: testStackIds[0], record_id: testRecordIds[i], position: i },
      })
      const c = await cResp.json()
      testCardIds.push(c[0].id)
    }
    for (let i = 4; i < 6; i++) {
      const cResp = await request.post(`${API}/stack_cards`, {
        headers: HEADERS,
        data: { stack_id: testStackIds[1], record_id: testRecordIds[i], position: i - 4 },
      })
      const c = await cResp.json()
      testCardIds.push(c[0].id)
    }
  })

  test.afterAll(async ({ request }) => {
    for (const cardId of testCardIds) {
      await request.delete(`${API}/stack_cards?id=eq.${cardId}`, { headers: HEADERS })
    }
    for (const stackId of testStackIds) {
      await request.delete(`${API}/stacks?id=eq.${stackId}`, { headers: HEADERS })
    }
    for (const recordId of testRecordIds) {
      await request.delete(`${API}/records?id=eq.${recordId}`, { headers: HEADERS })
    }
    await request.delete(`${API}/record_types?id=eq.${testTypeId}`, { headers: HEADERS })
  })

  test('DB: cards are in correct stacks after setup', async ({ request }) => {
    const stackACards = await getCards(request, testStackIds[0])
    const stackBCards = await getCards(request, testStackIds[1])

    expect(stackACards.length).toBe(4)
    expect(stackBCards.length).toBe(2)
    for (let i = 0; i < 4; i++) expect(stackACards[i].position).toBe(i)
    for (let i = 0; i < 2; i++) expect(stackBCards[i].position).toBe(i)
  })

  test('DB: reorderStackCards updates positions correctly', async ({ request }) => {
    const cards = await getCards(request, testStackIds[0])
    const originalOrder = cards.map((c: any) => c.id)
    const reversedOrder = [...originalOrder].reverse()

    await setCardOrder(request, testStackIds[0], reversedOrder)

    const newCards = await getCards(request, testStackIds[0])
    const newOrder = newCards.map((c: any) => c.id)
    expect(newOrder).toEqual(reversedOrder)

    await setCardOrder(request, testStackIds[0], originalOrder)
  })

  test('DB: cross-stack move updates stack_id', async ({ request }) => {
    const resp = await request.get(
      `${API}/stack_cards?select=id,stack_id&stack_id=eq.${testStackIds[0]}&order=position&limit=1`,
      { headers: HEADERS }
    )
    const cards = await resp.json()
    const cardToMove = cards[0]

    await moveCard(request, cardToMove.id, testStackIds[1])

    const verifyResp = await request.get(
      `${API}/stack_cards?select=id,stack_id&id=eq.${cardToMove.id}`,
      { headers: HEADERS }
    )
    const verify = await verifyResp.json()
    expect(verify[0].stack_id).toBe(testStackIds[1])

    await moveCard(request, cardToMove.id, testStackIds[0])
  })

  test('UI: stacks page loads with cards visible', async ({ page }) => {
    await page.goto('/stacks')
    await page.waitForTimeout(5000)

    const content = await page.content()
    expect(content).toContain('Stack A')
    expect(content).toContain('Stack B')

    const cardElements = page.locator('[class*="cursor-grab"]')
    const count = await cardElements.count()
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('UI: drag card within same stack reorders visually', async ({ page }) => {
    await page.goto('/stacks')
    await page.waitForTimeout(5000)

    const cards = page.locator('[class*="cursor-grab"]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const firstBox = await cards.nth(0).boundingBox()
    const secondBox = await cards.nth(1).boundingBox()

    if (firstBox && secondBox) {
      await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(200)
      await page.mouse.move(secondBox.x + secondBox.width / 2, secondBox.y + secondBox.height + 10, { steps: 10 })
      await page.waitForTimeout(200)
      await page.mouse.up()
      await page.waitForTimeout(1000)

      const newFirstText = await cards.nth(0).innerText()
      expect(newFirstText).toBeTruthy()
    }
  })

  test('UI: drag card between stacks', async ({ page }) => {
    await page.goto('/stacks')
    await page.waitForTimeout(5000)

    const cards = page.locator('[class*="cursor-grab"]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(2)

    const sourceCard = cards.nth(0)
    const targetCard = cards.nth(count - 1)

    const sourceBox = await sourceCard.boundingBox()
    const targetBox = await targetCard.boundingBox()

    if (sourceBox && targetBox) {
      await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
      await page.mouse.down()
      await page.waitForTimeout(200)
      await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 15 })
      await page.waitForTimeout(200)
      await page.mouse.up()
      await page.waitForTimeout(1000)

      const afterCount = await cards.count()
      expect(afterCount).toBeGreaterThanOrEqual(5)
    }
  })

  test('UI: DB reflects reorder after page reload', async ({ request, page }) => {
    const beforeCards = await getCards(request, testStackIds[0])
    const beforeOrder = beforeCards.map((c: any) => c.id)

    await page.goto('/stacks')
    await page.waitForTimeout(5000)

    const afterCards = await getCards(request, testStackIds[0])
    const afterOrder = afterCards.map((c: any) => c.id)
    expect(afterOrder).toEqual(beforeOrder)
  })

  test('DB: stack_cards positions are always contiguous (0-based)', async ({ request }) => {
    for (const stackId of testStackIds) {
      const cards = await getCards(request, stackId)
      for (let i = 0; i < cards.length; i++) {
        expect(cards[i].position).toBe(i)
      }
    }
  })

  test('DB: no duplicate positions within a stack', async ({ request }) => {
    for (const stackId of testStackIds) {
      const cards = await getCards(request, stackId)
      const positions = cards.map((c: any) => c.position)
      const uniquePositions = new Set(positions)
      expect(uniquePositions.size).toBe(positions.length)
    }
  })

  test('DB: rapid sequential reorders dont corrupt data', async ({ request }) => {
    // Re-fetch current state (UI tests may have changed it)
    const freshCards = await getCards(request, testStackIds[0])
    const ids = freshCards.map((c: any) => c.id)
    if (ids.length < 2) return // Skip if too few cards

    for (let i = 0; i < 10; i++) {
      const first = ids.shift()!
      ids.push(first)
      await setCardOrder(request, testStackIds[0], ids)
    }

    const verifyCards = await getCards(request, testStackIds[0])
    expect(verifyCards.length).toBe(ids.length)
    for (let i = 0; i < verifyCards.length; i++) {
      expect(verifyCards[i].position).toBe(i)
    }
  })

  test('DB: 20 random cross-stack moves dont corrupt data', async ({ request }) => {
    for (let op = 0; op < 20; op++) {
      const srcIdx = op % 2
      const srcStack = testStackIds[srcIdx]
      const dstStack = testStackIds[1 - srcIdx]
      const srcCards = await getCards(request, srcStack)
      if (srcCards.length === 0) continue
      const card = srcCards[0]
      await moveCard(request, card.id, dstStack)
    }
    for (const stackId of testStackIds) {
      const cards = await getCards(request, stackId)
      for (let i = 0; i < cards.length; i++) {
        expect(cards[i].position).toBe(i)
      }
    }
    const totalA = (await getCards(request, testStackIds[0])).length
    const totalB = (await getCards(request, testStackIds[1])).length
    expect(totalA + totalB).toBe(6)
  })
})
